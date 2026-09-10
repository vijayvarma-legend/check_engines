'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import * as THREE from 'three';
import { useClientEnv } from '@/hooks/useClientEnv';
import { useScene } from '@/lib/store';
import { maxDpr } from '@/lib/env';
import { SceneContents } from './SceneContents';
import { StaticCarFallback } from './StaticCarFallback';

/**
 * Persistent, fixed-position 3D stage that sits behind the scrolling page.
 * Sections above it are transparent where the car should show through and
 * opaque where they should not.
 */
export function CarExperience() {
  const env = useClientEnv();
  const setPointerActive = useScene((s) => s.setPointerActive);
  const setSceneReady = useScene((s) => s.setSceneReady);
  const [dprFactor, setDprFactor] = useState(1);
  const pointerTimer = useRef<ReturnType<typeof setTimeout>>();

  const pokePointer = useCallback(() => {
    setPointerActive(true);
    clearTimeout(pointerTimer.current);
    pointerTimer.current = setTimeout(() => setPointerActive(false), 2600);
  }, [setPointerActive]);

  const releasePointer = useCallback(() => {
    clearTimeout(pointerTimer.current);
    pointerTimer.current = setTimeout(() => setPointerActive(false), 600);
  }, [setPointerActive]);

  useEffect(() => () => clearTimeout(pointerTimer.current), []);

  // Static fallback also counts as "ready" so overlays/UI don't wait forever.
  useEffect(() => {
    if (env.ready && (!env.webgl || env.tier === 'low')) {
      setSceneReady(true);
    }
  }, [env.ready, env.webgl, env.tier, setSceneReady]);

  if (!env.ready) {
    return <div className="fixed inset-0 z-0 bg-ink-900" />;
  }

  if (!env.webgl || env.tier === 'low') {
    return (
      <div className="fixed inset-0 z-0">
        <StaticCarFallback />
      </div>
    );
  }

  const quality: 'mid' | 'high' = env.tier === 'high' ? 'high' : 'mid';
  const ceiling = maxDpr(quality);

  // On touch devices drei's CameraControls stamps `touch-action: none` on R3F's
  // own event <div> (which also hard-codes `pointer-events: auto`), so a vertical
  // swipe rotates the camera instead of scrolling the page. The experience is
  // scroll-driven anyway, so on coarse pointers we push `pointer-events: none` +
  // `touch-action: pan-y` straight onto that div via the Canvas `style` prop —
  // the page scrolls, and the on-screen dock still rotates / zooms the car.
  const touchOnly = env.coarsePointer;

  return (
    <div
      className={touchOnly ? 'pointer-events-none fixed inset-0 z-0' : 'fixed inset-0 z-0'}
      onPointerMove={touchOnly ? undefined : pokePointer}
      onPointerDown={touchOnly ? undefined : pokePointer}
      onPointerLeave={touchOnly ? undefined : releasePointer}
    >
      <Canvas
        shadows
        style={
          touchOnly
            ? { pointerEvents: 'none', touchAction: 'pan-y' }
            : undefined
        }
        dpr={[1, Math.max(1, ceiling * dprFactor)]}
        gl={{
          antialias: quality === 'high',
          powerPreference: 'high-performance',
          alpha: false,
        }}
        camera={{ fov: 38, near: 0.1, far: 100, position: [4.6, 1.5, -5.1] }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.35;
        }}
      >
        <PerformanceMonitor
          onDecline={() => setDprFactor((f) => Math.max(0.6, f - 0.2))}
          onIncline={() => setDprFactor((f) => Math.min(1, f + 0.1))}
          flipflops={3}
        />
        <SceneContents quality={quality} reducedMotion={env.reducedMotion} />
      </Canvas>

      {/* Cinematic edge vignette — pure CSS, cheap, keeps focus on the car. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 90% at 50% 42%, transparent 46%, rgba(4,5,7,0.5) 78%, rgba(4,5,7,0.82) 100%)',
        }}
      />
    </div>
  );
}
