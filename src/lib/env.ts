'use client';

/** Best-effort WebGL2/WebGL capability probe. */
export function detectWebGL(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');
    return !!gl;
  } catch {
    return false;
  }
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function isCoarsePointer(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(pointer: coarse)').matches;
}

/**
 * Rough device tier used to scale render cost. `low` gets a static fallback,
 * `mid` gets a trimmed 3D scene, `high` gets the full experience.
 */
export function deviceTier(): 'low' | 'mid' | 'high' {
  if (typeof window === 'undefined') return 'high';
  if (!detectWebGL()) return 'low';

  const mem = (navigator as unknown as { deviceMemory?: number }).deviceMemory;
  const cores = navigator.hardwareConcurrency ?? 4;
  const coarse = isCoarsePointer();
  const narrow = window.innerWidth < 640;

  if ((mem && mem <= 3) || cores <= 3) return 'low';
  if (coarse || narrow || (mem && mem <= 6) || cores <= 6) return 'mid';
  return 'high';
}

export function maxDpr(tier: 'low' | 'mid' | 'high'): number {
  if (tier === 'high') return 1.9;
  if (tier === 'mid') return 1.4;
  return 1;
}
