'use client';

import { useEffect, useRef, useState } from 'react';
import { useProgress } from '@react-three/drei';
import { useScene } from '@/lib/store';

/** Progressive loader shown until the GLB + environment are ready. */
export function SceneLoader() {
  const { progress, active } = useProgress();
  const sceneReady = useScene((s) => s.sceneReady);
  const setSceneReady = useScene((s) => s.setSceneReady);
  const [hidden, setHidden] = useState(false);
  const doneAt = useRef<number | null>(null);

  // Mark ready shortly after loading settles — and never hang the page on it.
  useEffect(() => {
    if (sceneReady) return;
    if (progress >= 100 && !active) {
      if (doneAt.current == null) doneAt.current = Date.now();
      const id = setTimeout(() => setSceneReady(true), 300);
      return () => clearTimeout(id);
    }
    const safety = setTimeout(() => setSceneReady(true), 6000);
    return () => clearTimeout(safety);
  }, [progress, active, sceneReady, setSceneReady]);

  useEffect(() => {
    if (!sceneReady) return;
    const id = setTimeout(() => setHidden(true), 650);
    return () => clearTimeout(id);
  }, [sceneReady]);

  if (hidden) return null;

  const shown = Math.max(4, Math.min(100, progress || 0));

  return (
    <div
      className="fixed inset-0 z-[80] flex flex-col items-center justify-center bg-ink-900 transition-opacity duration-500"
      style={{ opacity: sceneReady ? 0 : 1, pointerEvents: sceneReady ? 'none' : 'auto' }}
    >
      <div className="ce-tech-grid absolute inset-0 opacity-40" />
      <div className="relative flex w-[240px] flex-col items-center gap-5">
        <div className="font-mono text-[11px] uppercase tracking-brand text-chalk">
          CHECK&nbsp;ENGINES
        </div>
        <div className="h-px w-full bg-white/10">
          <div
            className="h-full bg-ignition transition-[width] duration-300 ease-out"
            style={{ width: `${shown}%` }}
          />
        </div>
        <div className="font-mono text-[10px] uppercase tracking-wide2 text-chalk-dim">
          Preparing vehicle · {Math.round(shown)}%
        </div>
      </div>
    </div>
  );
}
