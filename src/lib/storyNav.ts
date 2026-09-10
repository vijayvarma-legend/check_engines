'use client';

import { lenis } from '@/hooks/useLenis';
import { CHAPTER_COUNT } from '@/lib/storyTimeline';

/** Smooth-scroll into the service cinema so `index` becomes the active chapter. */
export function scrollToChapter(index: number) {
  const section = document.getElementById('services');
  if (!section) return;
  const top = section.getBoundingClientRect().top + window.scrollY;
  const travel = section.offsetHeight - window.innerHeight;
  const frac = CHAPTER_COUNT > 1 ? index / (CHAPTER_COUNT - 1) : 0;
  const y = top + frac * travel + 4;
  if (lenis) lenis.scrollTo(y, { duration: 1.1 });
  else window.scrollTo({ top: y, behavior: 'smooth' });
}
