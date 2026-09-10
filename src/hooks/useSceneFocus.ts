'use client';

import { useEffect, type RefObject } from 'react';
import { useScene } from '@/lib/store';
import type { ServiceId } from '@/data/services';

/**
 * While `ref` is on screen, focus the shared 3D scene on `serviceId`. Releases
 * the focus when it scrolls away (unless Inspection Mode has taken over).
 */
export function useSceneFocus(
  ref: RefObject<HTMLElement>,
  serviceId: ServiceId,
  threshold = 0.45,
) {
  const focusService = useScene((s) => s.focusService);
  const clearService = useScene((s) => s.clearService);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        const state = useScene.getState();
        if (state.inspection) return;
        if (entry.isIntersecting && entry.intersectionRatio >= threshold) {
          if (state.activeService !== serviceId || state.mode === 'hero') {
            focusService(serviceId, 'story');
          }
        } else if (
          !entry.isIntersecting &&
          useScene.getState().activeService === serviceId
        ) {
          clearService();
        }
      },
      { threshold: [0, threshold, Math.min(1, threshold + 0.25)] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, serviceId, threshold, focusService, clearService]);
}
