'use client';

import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';

/** Pauses the render loop while the tab is hidden to save battery/GPU. */
export function FrameGovernor() {
  const setFrameloop = useThree((s) => s.setFrameloop);

  useEffect(() => {
    const onVisibility = () => {
      setFrameloop(document.hidden ? 'never' : 'always');
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [setFrameloop]);

  return null;
}
