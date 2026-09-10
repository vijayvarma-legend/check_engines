'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { inspectionItems, statusMeta } from '@/data/inspection';
import { useScene } from '@/lib/store';
import { cn } from '@/lib/cn';

const CAR_CENTER = new THREE.Vector3(0, 0.6, 0);
const tmp = new THREE.Vector3();
const camWorld = new THREE.Vector3();

const toneClass = {
  ready: 'text-signal-ready border-signal-ready/50',
  due: 'text-signal-due border-signal-due/50',
  inspect: 'text-signal-inspect border-signal-inspect/50',
} as const;

function Label({
  item,
}: {
  item: (typeof inspectionItems)[number];
}) {
  const wrap = useRef<THREE.Group>(null);
  const [facing, setFacing] = useState(1);
  const meta = statusMeta[item.status];

  useFrame((state) => {
    if (!wrap.current) return;
    wrap.current.getWorldPosition(tmp);
    const spot = tmp.clone().sub(CAR_CENTER).normalize();
    state.camera.getWorldPosition(camWorld).sub(CAR_CENTER).normalize();
    const dot = spot.dot(camWorld);
    setFacing((p) => THREE.MathUtils.lerp(p, dot > 0.1 ? 1 : 0, 0.12));
  });

  return (
    <group ref={wrap} position={item.anchor}>
      <Html center distanceFactor={8} zIndexRange={[30, 0]} style={{ opacity: facing }}>
        <div className="pointer-events-none flex items-center gap-2">
          <span className="h-px w-6 bg-white/40" />
          <div
            className={cn(
              'border bg-ink-900/85 px-2.5 py-1.5 font-mono text-[9px] uppercase leading-tight tracking-wide2 backdrop-blur-sm',
              toneClass[meta.tone],
            )}
          >
            <div className="text-chalk">{item.label}</div>
            <div>STATUS: {item.status}</div>
          </div>
        </div>
      </Html>
    </group>
  );
}

export function InspectionLabels() {
  const inspection = useScene((s) => s.inspection);
  if (!inspection) return null;
  return (
    <>
      {inspectionItems.map((item) => (
        <Label key={item.id} item={item} />
      ))}
    </>
  );
}
