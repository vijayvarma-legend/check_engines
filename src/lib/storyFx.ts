import * as THREE from 'three';
import { chapterEffects, type EffectId } from '@/data/services';
import { chapterFloatAt, remapProgress } from '@/lib/storyTimeline';

/**
 * The single mutable bus that carries the scroll cinema's visual state to every
 * 3D system. `computeStoryTargets` turns raw scroll progress into per-effect
 * targets; `StoryDirector` eases the live `storyFx` object toward those targets
 * every frame, which is what makes scrolling *up* reverse every transformation
 * smoothly instead of snapping.
 *
 * Consumers (CarModel, CarRig, Lighting, the FX layers, the DOM HUD) only ever
 * read `storyFx` — never the targets.
 */

const N = chapterEffects.length;

/**
 * Chapter index by effect id — everything below is written in terms of `CH.*`
 * so chapters can be reordered in `services.ts` without touching this file.
 */
export const CH = Object.fromEntries(
  chapterEffects.map((e, i) => [e, i]),
) as Record<EffectId, number>;

function clamp01(x: number) {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}
function smooth01(x: number) {
  x = clamp01(x);
  return x * x * (3 - 2 * x);
}
function seg(x: number, a: number, b: number) {
  return smooth01((x - a) / (b - a));
}
/** Multi-stop colour ramp. `stops` = [t, hex] pairs, ascending t. */
function rampColor(out: THREE.Color, t: number, stops: [number, string][]) {
  t = clamp01(t);
  for (let i = 0; i < stops.length - 1; i++) {
    const [t0, c0] = stops[i];
    const [t1, c1] = stops[i + 1];
    if (t <= t1 || i === stops.length - 2) {
      const k = smooth01((t - t0) / (t1 - t0));
      out.set(c0).lerp(TMP_COL.set(c1), k);
      return out;
    }
  }
  return out.set(stops[stops.length - 1][1]);
}
const TMP_COL = new THREE.Color();

export interface EngineFx {
  /** Engine-bay mesh reveal 0..1. */
  reveal: number;
  /** Live RPM for the HUD. */
  rpm: number;
  /** 0..1 climb through the chapter (power bar). */
  load: number;
  /** Body vibration amplitude 0..1. */
  shake: number;
  /** Rear heat-haze intensity 0..1. */
  heat: number;
}
export interface RetrofitFx {
  /** Exterior lights (headlights / DRL / tail) turning on 0..1. */
  lights: number;
  /** Welcome-light / coding sweep 0..1 (transient). */
  welcome: number;
  /** Interior ambient glow 0..1. */
  ambient: number;
}
export interface AcFx {
  /** Vent airflow visibility 0..1. */
  airflow: number;
  /** Cabin temperature for the HUD (°C). */
  tempC: number;
  /** Cool tint / frost on the cabin glass 0..1. */
  chill: number;
}
export interface BodyFx {
  /** Simulated damage overlay 0..1 (dents → scratches → dull). */
  damage: number;
  /** Paint colour the body should lerp toward. */
  color: THREE.Color;
  /** How strongly to apply `color` over the base paint 0..1. */
  colorMix: number;
  /** Finish / gloss build 0..1. */
  gloss: number;
  /** Lighting-sweep bar position across the body -1..1 (NaN = inactive). */
  sweep: number;
}
export interface CeramicFx {
  /** Protective layer forming over the surface 0..1. */
  coat: number;
  /** Hydrophobic water-bead activity 0..1. */
  beads: number;
}
export interface DetailFx {
  /** Grime on the surface 0..1. */
  dirt: number;
  /** Cleaning wipe position 0..1. */
  clean: number;
  /** Polish / correction 0..1. */
  polish: number;
  /** Reflection + gloss peak 0..1. */
  reflect: number;
}
export interface DiagFx {
  /** Scan sweep 0..1 (front → rear). */
  scan: number;
  /** World-Z of the scan plane. */
  scanZ: number;
  /** Checklist items confirmed 0..5. */
  checks: number;
  /** Slow inspection-orbit azimuth offset, radians. */
  orbit: number;
}

export interface StoryFxState {
  active: boolean;
  /** 0..1 across every chapter. */
  progress: number;
  /** Continuous chapter position 0..N-1. */
  chapter: number;
  /** Nearest chapter index. */
  nearest: number;
  effect: EffectId;
  engine: EngineFx;
  retrofit: RetrofitFx;
  ac: AcFx;
  body: BodyFx;
  ceramic: CeramicFx;
  detail: DetailFx;
  diag: DiagFx;
  /** Composite surface state consumed by CarModel each frame. */
  surface: {
    /** Extra roughness from damage / dirt (can be negative when polished). */
    roughAdd: number;
    /** Multiplier on envMapIntensity. */
    envMul: number;
    /** Target clearcoat roughness (lower = glossier). */
    clearcoatRough: number;
    /** Grime tint blend 0..1. */
    grime: number;
  };
  /** Per-chapter engage flags — FX layers mount/animate only when true. */
  engaged: boolean[];
}

function makeState(): StoryFxState {
  return {
    active: false,
    progress: 0,
    chapter: 0,
    nearest: 0,
    effect: chapterEffects[0],
    engine: { reveal: 0, rpm: 780, load: 0, shake: 0, heat: 0 },
    retrofit: { lights: 0, welcome: 0, ambient: 0 },
    ac: { airflow: 0, tempC: 38, chill: 0 },
    body: {
      damage: 0,
      color: new THREE.Color('#282c34'),
      colorMix: 0,
      gloss: 0,
      sweep: NaN,
    },
    ceramic: { coat: 0, beads: 0 },
    detail: { dirt: 0, clean: 0, polish: 0, reflect: 0 },
    diag: { scan: 0, scanZ: -2.6, checks: 0, orbit: 0 },
    surface: { roughAdd: 0, envMul: 1, clearcoatRough: 0.06, grime: 0 },
    engaged: chapterEffects.map(() => false),
  };
}

/** Live, eased state. Everyone reads this. */
export const storyFx: StoryFxState = makeState();

/** Scratch targets, filled by `computeStoryTargets` each frame. */
const target: StoryFxState = makeState();

/** Base (un-touched) paint colour for the current model. */
export const BASE_PAINT = new THREE.Color('#282c34');

const PAINT_RAMP: [number, string][] = [
  [0.0, '#14161a'],
  [0.22, '#0d0f12'],
  [0.44, '#7c1712'], // deep red
  [0.66, '#183a63'], // metallic blue
  [0.84, '#243042'],
  [1.0, '#2b2e35'], // signature graphite
];

/**
 * Local 0..1 progress for chapter `i`: rises from just before the chapter
 * centres to just after, so a transformation completes on screen and then holds
 * while the camera arcs to the next chapter.
 */
function localProgress(chapterFloat: number, i: number) {
  return smooth01((chapterFloat - (i - 0.7)) / 1.3);
}

/**
 * How "on screen" chapter `i` is: ~1 within ±0.42 chapters of centre, easing to
 * 0 by ±0.92. Transient effects (engine revs, airflow, the scan) are multiplied
 * by this so they rise as the chapter arrives and fall as it leaves — cumulative
 * surface changes (paint, gloss, coating) are not gated and simply persist.
 */
function presence(chapterFloat: number, i: number) {
  return smooth01((0.78 - Math.abs(chapterFloat - i)) / 0.42);
}

/** Fill `target` from raw scroll progress + elapsed time. */
export function computeStoryTargets(progress: number, active: boolean, time: number) {
  const rp = remapProgress(progress);
  const chapterFloat = chapterFloatAt(progress);
  const nearest = Math.max(0, Math.min(N - 1, Math.round(chapterFloat)));

  target.active = active;
  target.progress = rp;
  target.chapter = chapterFloat;
  target.nearest = nearest;
  target.effect = chapterEffects[nearest];

  for (let i = 0; i < N; i++) {
    target.engaged[i] = Math.abs(chapterFloat - i) < 1.15;
  }

  const idle = !active;

  // ---- Engine ---------------------------------------------------------
  {
    const t = active ? localProgress(chapterFloat, CH.engine) : 0;
    const pres = active ? presence(chapterFloat, CH.engine) : 0;
    const e = target.engine;
    e.reveal = seg(t, 0.06, 0.4) * pres * 0.7;
    e.load = seg(t, 0.05, 0.7) * pres;
    const climb = 780 + smooth01(t) * 6100;
    const flutter = Math.sin(time * 26) * 150 * (0.3 + 0.7 * t);
    e.rpm = idle || pres < 0.02 ? 780 + Math.sin(time * 5) * 20 : 780 + (climb - 780 + flutter) * pres;
    e.shake = seg(t, 0.12, 0.32) * (0.4 + 0.6 * t) * pres;
    e.heat = seg(t, 0.1, 0.45) * pres;
  }

  // ---- Retrofits — lights come on, welcome sweep, cabin ambient ------
  {
    const t = active ? localProgress(chapterFloat, CH.retrofit) : 0;
    const pres = active ? presence(chapterFloat, CH.retrofit) : 0;
    const r = target.retrofit;
    r.lights = seg(t, 0.14, 0.5) * pres;
    r.ambient = seg(t, 0.34, 0.72) * pres;
    r.welcome = seg(t, 0.08, 0.22) * (1 - seg(t, 0.28, 0.55)) * pres;
  }

  // ---- AC ------------------------------------------------------------
  {
    const t = active ? localProgress(chapterFloat, CH.ac) : 0;
    const pres = active ? presence(chapterFloat, CH.ac) : 0;
    const a = target.ac;
    a.airflow = seg(t, 0.12, 0.5) * pres;
    a.tempC = 38 - smooth01(t) * 19 * pres;
    a.chill = seg(t, 0.15, 0.7) * pres;
  }

  // ---- Denting & Painting ------------------------------------------
  {
    const t = active ? localProgress(chapterFloat, CH['body-paint']) : 0;
    const pres = active ? presence(chapterFloat, CH['body-paint']) : 0;
    const b = target.body;
    // BEFORE: dents → scratches → dull, cleared in sequence (gated to the chapter).
    const dent = 1 - seg(t, 0.02, 0.13);
    const scratch = 1 - seg(t, 0.11, 0.26);
    const dull = 1 - seg(t, 0.22, 0.4);
    b.damage = Math.max(dent * 0.55, scratch * 0.34, dull * 0.3) * smooth01(t / 0.04) * pres;
    // PAINT: cinematic colour shift, then gloss build + light sweep. Cumulative.
    const painting = clamp01((t - 0.24) / 0.72);
    rampColor(b.color, painting, PAINT_RAMP);
    b.colorMix = active ? seg(t, 0.26, 0.42) : 0;
    b.gloss = active ? seg(t, 0.66, 0.98) : 0;
    const sw = (t - 0.72) / 0.26;
    b.sweep = sw > 0 && sw < 1 && pres > 0.3 ? sw * 2 - 1 : NaN;
  }

  // ---- Ceramic Coating --------------------------------------------
  {
    const t = active ? localProgress(chapterFloat, CH.ceramic) : 0;
    const pres = active ? presence(chapterFloat, CH.ceramic) : 0;
    const c = target.ceramic;
    c.coat = active ? seg(t, 0.05, 0.55) : 0; // cumulative
    // transient bead demo — tight window so it doesn't bleed into detailing
    c.beads = seg(t, 0.42, 0.9) * pres * smooth01((CH.ceramic + 0.45 - chapterFloat) / 0.5);
  }

  // ---- Detailing -------------------------------------------------
  {
    const c0 = CH.detailing;
    const d = target.detail;
    // Sequenced in chapter-float space so each stage is seen before the next:
    // dirty (arrive) → wash → machine polish → mirror finish.
    const arrive = smooth01((chapterFloat - (c0 - 0.65)) / 0.28);
    const wash = smooth01((chapterFloat - (c0 - 0.22)) / 0.28);
    d.dirt = active ? arrive * (1 - wash) : 0;
    d.clean = wash;
    d.polish = active ? smooth01((chapterFloat - c0) / 0.36) : 0;
    d.reflect = active ? smooth01((chapterFloat - (c0 + 0.3)) / 0.4) : 0;
  }

  // ---- Diagnostics ---------------------------------------------
  {
    const pres = active ? presence(chapterFloat, CH.diagnostics) : 0;
    const g = target.diag;
    // Scan is held back until we're clearly in the diagnostics chapter, then
    // sweeps front → rear across the closing tail.
    g.scan = active ? smooth01((chapterFloat - (CH.diagnostics - 0.38)) / 0.98) : 0;
    g.scanZ = -2.7 + g.scan * 5.4;
    g.checks = Math.min(5, Math.floor(g.scan * 5.5));
    g.orbit = Math.sin(time * 0.16) * 0.11 * pres;
  }

  // ---- Composite surface state -------------------------------------
  {
    const s = target.surface;
    const dmg = target.body.damage;
    const dirt = target.detail.dirt;
    const gloss = Math.max(target.body.gloss, target.ceramic.coat, target.detail.polish);
    const wetGloss = Math.max(target.ceramic.coat, target.detail.reflect);
    s.roughAdd = dmg * 0.42 + dirt * 0.5 - gloss * 0.14 - target.detail.polish * 0.06;
    s.envMul = 1 + wetGloss * 1.4 - dirt * 0.55 - dmg * 0.3;
    s.clearcoatRough = 0.22 - Math.max(gloss, wetGloss) * 0.19 + dirt * 0.25 + dmg * 0.2;
    s.grime = dirt;
  }

  return target;
}

/**
 * Ease every live value in `storyFx` toward `target`. `rate` is a per-second
 * follow speed; discrete values (checks) snap.
 */
export function easeStoryFx(dt: number, tgt: StoryFxState) {
  const k = 1 - Math.exp(-dt * 6.5);
  const kSlow = 1 - Math.exp(-dt * 3.2);
  const L = (a: number, b: number, t: number) => a + (b - a) * t;

  storyFx.active = tgt.active;
  storyFx.progress = tgt.progress;
  storyFx.chapter = L(storyFx.chapter, tgt.chapter, k);
  storyFx.nearest = tgt.nearest;
  storyFx.effect = tgt.effect;
  for (let i = 0; i < storyFx.engaged.length; i++) storyFx.engaged[i] = tgt.engaged[i];

  const e = storyFx.engine, te = tgt.engine;
  e.reveal = L(e.reveal, te.reveal, kSlow);
  e.rpm = L(e.rpm, te.rpm, 1 - Math.exp(-dt * 9));
  e.load = L(e.load, te.load, k);
  e.shake = L(e.shake, te.shake, k);
  e.heat = L(e.heat, te.heat, kSlow);

  const r = storyFx.retrofit, tr = tgt.retrofit;
  r.lights = L(r.lights, tr.lights, kSlow);
  r.welcome = L(r.welcome, tr.welcome, k);
  r.ambient = L(r.ambient, tr.ambient, kSlow);

  const a = storyFx.ac, ta = tgt.ac;
  a.airflow = L(a.airflow, ta.airflow, kSlow);
  a.tempC = L(a.tempC, ta.tempC, kSlow);
  a.chill = L(a.chill, ta.chill, kSlow);

  const b = storyFx.body, tb = tgt.body;
  b.damage = L(b.damage, tb.damage, k);
  b.color.lerp(tb.color, kSlow);
  b.colorMix = L(b.colorMix, tb.colorMix, kSlow);
  b.gloss = L(b.gloss, tb.gloss, kSlow);
  b.sweep = Number.isNaN(tb.sweep) ? NaN : Number.isNaN(b.sweep) ? tb.sweep : L(b.sweep, tb.sweep, k);

  const c = storyFx.ceramic, tc = tgt.ceramic;
  c.coat = L(c.coat, tc.coat, kSlow);
  c.beads = L(c.beads, tc.beads, kSlow);

  const d = storyFx.detail, td = tgt.detail;
  d.dirt = L(d.dirt, td.dirt, kSlow);
  d.clean = L(d.clean, td.clean, k);
  d.polish = L(d.polish, td.polish, kSlow);
  d.reflect = L(d.reflect, td.reflect, kSlow);

  const g = storyFx.diag, tg = tgt.diag;
  g.scan = L(g.scan, tg.scan, k);
  g.scanZ = L(g.scanZ, tg.scanZ, k);
  g.checks = tg.checks;
  g.orbit = L(g.orbit, tg.orbit, kSlow);

  const s = storyFx.surface, ts = tgt.surface;
  s.roughAdd = L(s.roughAdd, ts.roughAdd, kSlow);
  s.envMul = L(s.envMul, ts.envMul, kSlow);
  s.clearcoatRough = L(s.clearcoatRough, ts.clearcoatRough, kSlow);
  s.grime = L(s.grime, ts.grime, kSlow);
}
