'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useScene } from '@/lib/store';
import { storyStateAt } from '@/lib/storyTimeline';
import { storyFx } from '@/lib/storyFx';
import { CarModel } from './CarModel';

interface CarRigProps {
  quality: 'low' | 'mid' | 'high';
  reducedMotion: boolean;
  /** Anchored overlays (hotspots, inspection labels) that rotate with the car. */
  children?: React.ReactNode;
}

/**
 * Holds the car and gives it slow idle rotation in the hero / finale. When a
 * service or inspection is focused, the rig eases back to a fixed heading so the
 * camera move reads clearly.
 */
export function CarRig({ quality, reducedMotion, children }: CarRigProps) {
  const rig = useRef<THREE.Group>(null);
  const bob = useRef<THREE.Group>(null);
  const mode = useScene((s) => s.mode);
  const interacting = useScene((s) => s.interacting);
  const pointerActive = useScene((s) => s.pointerActive);

  useFrame((state, delta) => {
    if (!rig.current) return;
    const s = useScene.getState();
    const t = Math.min(1, delta * 1.6);

    // Scroll cinema drives the heading directly.
    if (s.storyActive) {
      const yaw = storyStateAt(s.storyProgress).shot.yaw;
      rig.current.rotation.y = THREE.MathUtils.lerp(
        rig.current.rotation.y,
        yaw,
        Math.min(1, delta * 3.5),
      );
      // Engine chapter: fine mechanical vibration through the shell.
      const shake = reducedMotion ? 0 : storyFx.engine.shake;
      const et = state.clock.elapsedTime;
      rig.current.rotation.z = THREE.MathUtils.lerp(
        rig.current.rotation.z,
        shake ? Math.sin(et * 44) * 0.004 * shake : 0,
        t,
      );
      if (bob.current)
        bob.current.position.y = THREE.MathUtils.lerp(
          bob.current.position.y,
          shake ? Math.sin(et * 53) * 0.006 * shake : 0,
          t,
        );
      return;
    }

    const idle =
      (mode === 'hero' || mode === 'finale') && !interacting && !pointerActive;

    if (idle && !reducedMotion) {
      // Slow, restrained turntable sway — a configurator, not a spinning prop.
      const target = Math.sin(state.clock.elapsedTime * 0.18) * 0.28;
      rig.current.rotation.y = THREE.MathUtils.lerp(rig.current.rotation.y, target, t);
    } else {
      rig.current.rotation.y = THREE.MathUtils.lerp(rig.current.rotation.y, 0, t);
    }

    if (bob.current && !reducedMotion) {
      bob.current.position.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.01;
    }
  });

  return (
    <group ref={rig}>
      <group ref={bob}>
        <CarModel quality={quality} />
      </group>
      {children}
    </group>
  );
}
