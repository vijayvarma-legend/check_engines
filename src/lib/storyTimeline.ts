import {
  storyKeyframes,
  poseFromShot,
  type CameraPose,
  type StoryShot,
} from '@/data/services';

const N = storyKeyframes.length;

function clamp01(x: number) {
  return Math.min(1, Math.max(0, x));
}

function smoothstep(x: number) {
  x = clamp01(x);
  return x * x * (3 - 2 * x);
}

function lerpAngle(a: number, b: number, t: number) {
  const d = ((b - a + 540) % 360) - 180;
  return a + d * t;
}

/**
 * Runway before chapter 0 centres and tail after the last chapter centres, in
 * chapter-units. LEAD lets the camera ease from the first keyframe into chapter
 * 0 as the section pins; TAIL lets the final chapter's transformation actually
 * complete (its centre alone only reaches ~55% local progress) while the overlay
 * fades out.
 */
const LEAD = 0.6;
const TAIL = 0.6;
const SPAN = N - 1 + LEAD + TAIL;

/** Kept for compatibility — progress is already 0..1. */
export function remapProgress(p: number) {
  return clamp01(p);
}

/** 0..1 fade for the pinned overlay as it hands off to the next section. */
export function pinFade(p: number) {
  return clamp01((1 - clamp01(p)) / 0.09);
}

/**
 * Continuous chapter position. Slightly negative during the opening runway,
 * runs past N-1 during the closing tail. Every system (camera, typography,
 * effects) derives its state from this one number.
 */
export function chapterFloatAt(progress: number) {
  return clamp01(progress) * SPAN - LEAD;
}

export interface StoryState {
  index: number;
  scaled: number;
  segment: number;
  f: number;
  shot: StoryShot;
}

const DEFAULT_FOV = 38;

export function storyStateAt(progress: number): StoryState {
  const cf = chapterFloatAt(progress);
  const scaled = Math.max(0, Math.min(N - 1, cf));
  const segment = Math.min(N - 2, Math.max(0, Math.floor(scaled)));
  const f = smoothstep(scaled - segment);
  const a = storyKeyframes[segment];
  const b = storyKeyframes[segment + 1];
  const lin = (x: number, y: number) => x + (y - x) * f;
  return {
    index: Math.max(0, Math.min(N - 1, Math.round(cf))),
    scaled,
    segment,
    f,
    shot: {
      az: lerpAngle(a.az, b.az, f),
      polar: lin(a.polar, b.polar),
      radius: lin(a.radius, b.radius),
      target: [
        lin(a.target[0], b.target[0]),
        lin(a.target[1], b.target[1]),
        lin(a.target[2], b.target[2]),
      ],
      yaw: lin(a.yaw, b.yaw),
      fov: lin(a.fov ?? DEFAULT_FOV, b.fov ?? DEFAULT_FOV),
    },
  };
}

export function poseAt(progress: number): CameraPose {
  return poseFromShot(storyStateAt(progress).shot);
}

export const CHAPTER_COUNT = N;

/**
 * Per-chapter visibility for crossfading typography. Returns 0..1 for chapter i
 * at the given progress — 1 at its centre, fading to 0 at the neighbours.
 */
export function chapterOpacity(progress: number, i: number): number {
  const d = Math.abs(chapterFloatAt(progress) - i);
  return smoothstep(1 - d / 0.5);
}
