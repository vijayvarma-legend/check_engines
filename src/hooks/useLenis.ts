'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/** Shared Lenis instance so anchor links elsewhere can glide-scroll. */
export let lenis: Lenis | null = null;

/**
 * Inertial smooth scrolling, driven off GSAP's ticker and synced to
 * ScrollTrigger. It never blocks or snaps — native scroll position still
 * updates every frame. Disabled under reduced motion (ScrollTrigger then reads
 * plain native scroll).
 */
export function useLenis() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    ScrollTrigger.config({ ignoreMobileResize: true });

    if (reduced) {
      ScrollTrigger.refresh();
      return;
    }

    const instance = new Lenis({
      duration: 1.05,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      syncTouch: false,
    });
    lenis = instance;

    instance.on('scroll', ScrollTrigger.update);
    if (process.env.NODE_ENV === 'development')
      (window as unknown as { __lenis?: Lenis }).__lenis = instance;
    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement)?.closest?.('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      instance.scrollTo(el as HTMLElement, { offset: -72 });
    };
    document.addEventListener('click', onClick);

    const refreshId = setTimeout(() => ScrollTrigger.refresh(), 300);

    return () => {
      clearTimeout(refreshId);
      document.removeEventListener('click', onClick);
      gsap.ticker.remove(tick);
      instance.destroy();
      lenis = null;
    };
  }, []);
}
