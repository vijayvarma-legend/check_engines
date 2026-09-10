'use client';

import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useScene } from '@/lib/store';

/**
 * Concept-only visual layer for Inspection Mode: a vertical scan sweep, a slow
 * ground radar ring and a faint reference grid. Purely decorative — no data.
 */
export function InspectionFx({ reducedMotion }: { reducedMotion: boolean }) {
  const scan = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);
  const grid = useRef<THREE.GridHelper>(null);
  const groupOpacity = useRef(0);

  const inspection = useScene((s) => s.inspection);

  useEffect(() => {
    if (grid.current) {
      const mat = grid.current.material as THREE.Material;
      mat.transparent = true;
      mat.opacity = 0;
      mat.needsUpdate = true;
    }
  }, []);

  useFrame((state, delta) => {
    const target = inspection ? 1 : 0;
    groupOpacity.current = THREE.MathUtils.lerp(
      groupOpacity.current,
      target,
      Math.min(1, delta * 3),
    );
    const o = groupOpacity.current;

    if (scan.current) {
      const mat = scan.current.material as THREE.MeshBasicMaterial;
      if (!reducedMotion) {
        const y = 0.05 + ((state.clock.elapsedTime * 0.55) % 1.6);
        scan.current.position.y = y;
      } else {
        scan.current.position.y = 0.9;
      }
      mat.opacity = o * 0.5;
    }
    if (ring.current) {
      const mat = ring.current.material as THREE.MeshBasicMaterial;
      mat.opacity = o * 0.55;
      if (!reducedMotion) ring.current.rotation.z -= delta * 0.4;
    }
    if (grid.current) {
      (grid.current.material as THREE.Material).opacity = o * 0.14;
      grid.current.visible = o > 0.01;
    }
  });

  return (
    <group>
      {/* vertical scan sheet */}
      <mesh ref={scan} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.9, 0]}>
        <planeGeometry args={[6, 3.4]} />
        <meshBasicMaterial
          color="#5fa8ff"
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* ground radar ring */}
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
        <ringGeometry args={[2.7, 2.86, 96, 1, 0, Math.PI * 1.5]} />
        <meshBasicMaterial
          color="#5fa8ff"
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      <gridHelper
        ref={grid}
        args={[26, 26, '#3b5878', '#22303f']}
        position={[0, 0.005, 0]}
      />
    </group>
  );
}
