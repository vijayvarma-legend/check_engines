'use client';

import { useEffect, useState } from 'react';
import {
  deviceTier,
  detectWebGL,
  isCoarsePointer,
  prefersReducedMotion,
} from '@/lib/env';

export interface ClientEnv {
  ready: boolean;
  webgl: boolean;
  reducedMotion: boolean;
  coarsePointer: boolean;
  tier: 'low' | 'mid' | 'high';
}

const initial: ClientEnv = {
  ready: false,
  webgl: true,
  reducedMotion: false,
  coarsePointer: false,
  tier: 'high',
};

/** Resolves device capabilities on the client after mount (SSR-safe). */
export function useClientEnv(): ClientEnv {
  const [env, setEnv] = useState<ClientEnv>(initial);

  useEffect(() => {
    const compute = () =>
      setEnv({
        ready: true,
        webgl: detectWebGL(),
        reducedMotion: prefersReducedMotion(),
        coarsePointer: isCoarsePointer(),
        tier: deviceTier(),
      });

    compute();

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => compute();
    mq.addEventListener?.('change', onChange);
    window.addEventListener('resize', onChange);
    return () => {
      mq.removeEventListener?.('change', onChange);
      window.removeEventListener('resize', onChange);
    };
  }, []);

  return env;
}
