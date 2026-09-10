'use client';

import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { CameraControls } from '@react-three/drei';
import CameraControlsImpl from 'camera-controls';
import * as THREE from 'three';

const { ACTION } = CameraControlsImpl;
import { useScene } from '@/lib/store';
import { cameraBus } from '@/lib/cameraBus';
import { poseAt } from '@/lib/storyTimeline';
import { storyFx } from '@/lib/storyFx';

type CC = React.ComponentRef<typeof CameraControls>;

interface CameraControllerProps {
  reducedMotion: boolean;
  enableScrollParallax?: boolean;
}

const curPos = new THREE.Vector3();
const curTgt = new THREE.Vector3();
const aimPos = new THREE.Vector3();
const aimTgt = new THREE.Vector3();
const PIVOT = new THREE.Vector3(0, 0.62, 0);

/**
 * Single source of truth for the camera.
 * - Scroll cinema active → the camera is scrubbed along the story timeline.
 * - Otherwise → user drag/zoom plus store `camera` commands (cinematic poses).
 */
export function CameraController({
  reducedMotion,
  enableScrollParallax = true,
}: CameraControllerProps) {
  const ref = useRef<CC>(null);
  const invalidate = useThree((s) => s.invalidate);

  const command = useScene((s) => s.camera);
  const setInteracting = useScene((s) => s.setInteracting);
  const mode = useScene((s) => s.mode);

  const lastScroll = useRef(0);
  const firstRun = useRef(true);
  const wasStory = useRef(false);

  // Apply discrete camera commands (only when the cinema is not driving).
  useEffect(() => {
    const controls = ref.current;
    if (!controls || useScene.getState().storyActive) return;
    const { pose, instant } = command;
    const animate = !instant && !reducedMotion && !firstRun.current;
    controls.setLookAt(
      pose.position[0],
      pose.position[1],
      pose.position[2],
      pose.target[0],
      pose.target[1],
      pose.target[2],
      animate,
    );
    firstRun.current = false;
    invalidate();
  }, [command, reducedMotion, invalidate]);

  useEffect(() => {
    const controls = ref.current;
    if (!controls) return;
    lastScroll.current = useScene.getState().scrollProgress;
    const onStart = () => setInteracting(true);
    const onEnd = () => setInteracting(false);
    controls.addEventListener('controlstart', onStart);
    controls.addEventListener('controlend', onEnd);
    cameraBus.attach(controls);
    return () => {
      controls.removeEventListener('controlstart', onStart);
      controls.removeEventListener('controlend', onEnd);
      cameraBus.attach(null);
    };
  }, [setInteracting]);

  useFrame((state, delta) => {
    const controls = ref.current;
    if (!controls) return;
    const s = useScene.getState();

    if (s.storyActive) {
      // Scroll-scrubbed cinematic pass — ease toward the timeline pose so
      // fast scrolls still feel like a dolly, not a jump. We keep the controls
      // "enabled" (camera-controls ignores setLookAt while disabled) but neutralise
      // user input via the speed props below, and re-assert the pose every frame.
      if (!wasStory.current) {
        controls.mouseButtons.left = ACTION.NONE;
        controls.mouseButtons.right = ACTION.NONE;
        controls.mouseButtons.wheel = ACTION.NONE;
        controls.touches.one = ACTION.NONE;
        controls.touches.two = ACTION.NONE;
        controls.touches.three = ACTION.NONE;
        wasStory.current = true;
      }
      const pose = poseAt(s.storyProgress);
      aimPos.set(pose.position[0], pose.position[1], pose.position[2]);
      aimTgt.set(pose.target[0], pose.target[1], pose.target[2]);

      // Slow inspection orbit on the diagnostics chapter.
      if (storyFx.diag.orbit) {
        aimPos.sub(PIVOT).applyAxisAngle(THREE.Object3D.DEFAULT_UP, storyFx.diag.orbit).add(PIVOT);
      }
      // Subtle engine idle shake on the camera.
      if (storyFx.engine.shake > 0.01) {
        const j = storyFx.engine.shake * 0.012;
        aimPos.x += Math.sin(state.clock.elapsedTime * 47) * j;
        aimPos.y += Math.sin(state.clock.elapsedTime * 41 + 1.7) * j;
      }

      controls.getPosition(curPos);
      controls.getTarget(curTgt);
      const k = Math.min(1, delta * 15); // damped follow toward the scrub pose
      curPos.lerp(aimPos, k);
      curTgt.lerp(aimTgt, k);
      controls.setLookAt(
        curPos.x, curPos.y, curPos.z,
        curTgt.x, curTgt.y, curTgt.z,
        false,
      );

      // Ease FOV toward the chapter's framing (macro on ceramic, etc.).
      const cam = state.camera as THREE.PerspectiveCamera;
      const fov = pose.fov ?? 38;
      if (Math.abs(cam.fov - fov) > 0.01) {
        cam.fov += (fov - cam.fov) * Math.min(1, delta * 4);
        cam.updateProjectionMatrix();
      }
      invalidate();
      return;
    }

    if (wasStory.current) {
      controls.mouseButtons.left = ACTION.ROTATE;
      controls.mouseButtons.right = ACTION.TRUCK;
      controls.mouseButtons.wheel = ACTION.DOLLY;
      controls.touches.one = ACTION.TOUCH_ROTATE;
      controls.touches.two = ACTION.TOUCH_DOLLY_TRUCK;
      controls.touches.three = ACTION.TOUCH_DOLLY_TRUCK;
      wasStory.current = false;
    }

    // Restore the default lens once the cinema releases the camera.
    const cam = state.camera as THREE.PerspectiveCamera;
    if (cam.isPerspectiveCamera && Math.abs(cam.fov - 38) > 0.01) {
      cam.fov += (38 - cam.fov) * Math.min(1, delta * 4);
      cam.updateProjectionMatrix();
      invalidate();
    }

    if (
      enableScrollParallax &&
      !reducedMotion &&
      mode === 'hero' &&
      !s.interacting
    ) {
      const p = s.scrollProgress;
      const d = p - lastScroll.current;
      lastScroll.current = p;
      if (Math.abs(d) > 0.00001) {
        controls.rotate(d * 0.9, d * -0.4, false);
        invalidate();
      }
    }
  });

  return (
    <CameraControls
      ref={ref}
      makeDefault
      minDistance={2.6}
      maxDistance={12}
      minPolarAngle={0.15}
      maxPolarAngle={Math.PI / 2 - 0.02}
      smoothTime={0.55}
      draggingSmoothTime={0.14}
      truckSpeed={0}
      dollySpeed={0.6}
      polarRotateSpeed={0.8}
      azimuthRotateSpeed={0.8}
    />
  );
}
