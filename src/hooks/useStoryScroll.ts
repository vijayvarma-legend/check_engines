'use client';

import { useEffect, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useScene } from '@/lib/store';

gsap.registerPlugin(ScrollTrigger);

/**
 * Pins `pinRef` for the height of `sectionRef` and scrubs a 0..1 progress value
 * into the scene store. Everything else (camera, rotation, highlight, lighting,
 * typography) reads that value — the scroll is the single timeline.
 */
export function useStoryScroll(
  sectionRef: RefObject<HTMLElement>,
  pinRef: RefObject<HTMLElement>,
  enabled: boolean,
) {
  useEffect(() => {
    const section = sectionRef.current;
    const pin = pinRef.current;
    if (!enabled || !section || !pin) return;

    const setStoryActive = useScene.getState().setStoryActive;
    const setStoryProgress = useScene.getState().setStoryProgress;

    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      pin,
      pinSpacing: true,
      anticipatePin: 1,
      scrub: 0.35,
      invalidateOnRefresh: true,
      onToggle: (self) => setStoryActive(self.isActive),
      onUpdate: (self) => setStoryProgress(self.progress),
      onRefresh: (self) => {
        setStoryActive(self.isActive);
        setStoryProgress(self.progress);
      },
    });

    setStoryActive(st.isActive);
    setStoryProgress(st.progress);
    const refreshId = setTimeout(() => ScrollTrigger.refresh(), 120);

    return () => {
      clearTimeout(refreshId);
      st.kill();
      setStoryActive(false);
    };
  }, [enabled, sectionRef, pinRef]);
}
