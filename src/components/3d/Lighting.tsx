'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import { useScene } from '@/lib/store';
import { storyFx } from '@/lib/storyFx';

/** Per-chapter lighting mood — [keyMul, rimHex]. */
const MOOD: Record<string, [number, string]> = {
  engine: [0.92, '#ff9a52'],
  retrofit: [0.5, '#7f9dff'],
  ac: [1.0, '#8fc8ff'],
  'body-paint': [1.12, '#fff1dd'],
  ceramic: [1.2, '#dbe9ff'],
  detailing: [1.14, '#ffe9c8'],
  diagnostics: [1.0, '#9fe8ff'],
};
const _rim = new THREE.Color();

interface LightingProps {
  quality: 'low' | 'mid' | 'high';
}

/**
 * Showroom-style lighting: a soft baked environment for reflections plus a few
 * shaped direct lights. Direct light intensity eases down in Inspection Mode.
 */
export function Lighting({ quality }: LightingProps) {
  const keyRef = useRef<THREE.DirectionalLight>(null);
  const fillRef = useRef<THREE.SpotLight>(null);
  const rimRef = useRef<THREE.SpotLight>(null);
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const inspection = useScene((s) => s.inspection);
  const rimHue = useRef(new THREE.Color('#ffca7a'));

  useFrame((_, delta) => {
    const t = Math.min(1, delta * 4);
    const state = useScene.getState();
    // Retrofits play out at "night" so the lamps read — dip the whole rig.
    const retro = state.storyActive ? storyFx.retrofit.lights : 0;
    const dim = inspection ? 0.32 : 1 - retro * 0.62;

    // Scroll cinema: each chapter has a lighting mood (key level + rim colour)
    // that the rig eases toward, so the light breathes with the timeline.
    let keyTarget = 2.7;
    if (state.storyActive) {
      const [mul, hex] = MOOD[storyFx.effect] ?? [1, '#ffca7a'];
      keyTarget = 2.9 * mul;
      // detailing: dark while dirty, bright once polished
      if (storyFx.effect === 'detailing')
        keyTarget = 2.9 * (0.78 + 0.5 * storyFx.detail.reflect);
      rimHue.current.lerp(_rim.set(hex), t * 0.5);
    } else {
      rimHue.current.lerp(_rim.set('#ffca7a'), t * 0.5);
    }
    if (rimRef.current) rimRef.current.color.copy(rimHue.current);

    if (keyRef.current)
      keyRef.current.intensity = THREE.MathUtils.lerp(
        keyRef.current.intensity,
        keyTarget * dim,
        t,
      );
    if (fillRef.current)
      fillRef.current.intensity = THREE.MathUtils.lerp(
        fillRef.current.intensity,
        (inspection ? 6 : 18 * (1 - retro * 0.7)) as number,
        t,
      );
    if (rimRef.current)
      rimRef.current.intensity = THREE.MathUtils.lerp(
        rimRef.current.intensity,
        (inspection ? 22 : 12) as number,
        t,
      );
    if (ambientRef.current)
      ambientRef.current.intensity = THREE.MathUtils.lerp(
        ambientRef.current.intensity,
        inspection ? 0.12 : 0.35 * (1 - retro * 0.6),
        t,
      );
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.35} />

      <directionalLight
        ref={keyRef}
        position={[4, 10, 2]}
        intensity={2.1}
        castShadow={quality !== 'low'}
        shadow-mapSize={quality === 'high' ? 2048 : 1024}
        shadow-bias={-0.0004}
        shadow-camera-near={1}
        shadow-camera-far={30}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
      />

      <spotLight
        ref={fillRef}
        position={[-6, 4, 5]}
        angle={0.7}
        penumbra={1}
        intensity={18}
        color="#cfd8e6"
      />

      <spotLight
        ref={rimRef}
        position={[-2, 3, -7]}
        angle={0.6}
        penumbra={1}
        intensity={12}
        color="#ffca7a"
      />

      <Environment resolution={quality === 'high' ? 256 : 128} frames={1}>
        <group rotation={[0, Math.PI / 3, 0]}>
          <Lightformer
            form="rect"
            intensity={2.4}
            position={[0, 5, -3]}
            scale={[12, 5, 1]}
            color="#ffffff"
          />
          <Lightformer
            form="rect"
            intensity={1.4}
            rotation-y={Math.PI / 2}
            position={[-6, 2, 1]}
            scale={[8, 8, 1]}
            color="#d7e3ff"
          />
          <Lightformer
            form="rect"
            intensity={1.4}
            rotation-y={-Math.PI / 2}
            position={[6, 2, 1]}
            scale={[8, 8, 1]}
            color="#ffe6c2"
          />
          <Lightformer
            form="ring"
            intensity={2}
            position={[0, 3, 6]}
            scale={4}
            color="#ffb155"
          />
          <Lightformer
            form="rect"
            intensity={0.8}
            position={[0, -3, 0]}
            rotation-x={Math.PI / 2}
            scale={[14, 14, 1]}
            color="#20242c"
          />
        </group>
      </Environment>
    </>
  );
}
