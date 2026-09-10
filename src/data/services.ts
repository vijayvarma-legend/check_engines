import type { Vec3 } from '@/lib/types';

export type ServiceId =
  | 'engine'
  | 'ac'
  | 'body-paint'
  | 'ceramic'
  | 'detailing'
  | 'diagnostics'
  | 'ppf-wrap'
  | 'retrofit';

/** Which visual transformation a chapter drives on the car. */
export type EffectId =
  | 'engine'
  | 'retrofit'
  | 'ac'
  | 'body-paint'
  | 'ceramic'
  | 'detailing'
  | 'diagnostics';

export interface CameraPose {
  position: Vec3;
  target: Vec3;
  /** Vertical field of view in degrees. Lower = tighter / more macro. */
  fov?: number;
}

/**
 * A service's place in the scroll cinema. The camera orbits the car on a sphere
 * (pivot ≈ car centre) so transitions between chapters arc around the vehicle
 * instead of cutting through it.
 */
export interface StoryShot {
  /** Azimuth in degrees — atan2(x, z); the car front faces -Z. */
  az: number;
  /** Polar angle in degrees from +Y (smaller = higher / more top-down). */
  polar: number;
  /** Orbit radius in metres. */
  radius: number;
  /** Look-at target. */
  target: Vec3;
  /** Car heading (radians) so the highlighted area faces camera. */
  yaw: number;
  /** Vertical FOV in degrees for this chapter (default 38). */
  fov?: number;
}

export interface Service {
  id: ServiceId;
  index: string;
  label: string;
  short: string;
  tagline: string;
  description: string;
  detail: string;
  cta: string;
  /** Local-space anchor on the car for the 3D marker (exterior only). */
  hotspot: Vec3;
  story: StoryShot;
  /** Static pose (hero marker clicks, deep-links) — derived from `story`. */
  camera: CameraPose;
  highlight: 'front' | 'cabin' | 'wheel-front' | 'door' | 'roof' | 'rear';
  isHotspot: boolean;
  /** The transformation this chapter performs. Only set for cinema chapters. */
  effect?: EffectId;
}

const PIVOT: Vec3 = [0, 0.62, 0];
const DEG = Math.PI / 180;
const DEFAULT_FOV = 38;

export function poseFromShot(s: StoryShot): CameraPose {
  const az = s.az * DEG;
  const po = s.polar * DEG;
  const sinPo = Math.sin(po);
  return {
    position: [
      PIVOT[0] + s.radius * sinPo * Math.sin(az),
      PIVOT[1] + s.radius * Math.cos(po),
      PIVOT[2] + s.radius * sinPo * Math.cos(az),
    ],
    target: s.target,
    fov: s.fov ?? DEFAULT_FOV,
  };
}

// Car front faces -Z; centred near [0, 0.62, 0]; ~4.7 m long, ~1.2 tall.
export const HERO_CAMERA: CameraPose = {
  position: [5.7, 1.95, -5.7],
  target: [-1.35, 0.72, 0.2],
  fov: DEFAULT_FOV,
};

interface ServiceSeed extends Omit<Service, 'camera'> {}

/**
 * The six scroll-cinema chapters, in order. Each `effect` is picked up by
 * `storyFx` and driven continuously by scroll. Camera poses read like a
 * commercial: push in on the area a service touches, then arc to the next.
 */
const cinemaSeeds: ServiceSeed[] = [
  {
    id: 'engine',
    index: '01',
    label: 'Engine Performance',
    short: 'PERFORMANCE',
    tagline: 'Exhausts, valved systems and tuning that wake the car up.',
    description:
      'Custom exhaust systems, electronic valve control and engine tuning — sound and response, mapped to behave cleanly every day.',
    detail:
      'Custom-built exhaust systems and electronic valved setups for flow and sound, fitted and mapped so the car stays civil day to day. Engine tuning is carried out in partnership with Venom Performance India.',
    cta: 'Book Performance Upgrades',
    hotspot: [0.0, 0.78, -1.85],
    story: { az: 172, polar: 74, radius: 5.0, target: [0, 0.66, -1.55], yaw: 0.14, fov: 42 },
    highlight: 'front',
    isHotspot: true,
    effect: 'engine',
  },
  {
    id: 'retrofit',
    index: '02',
    label: 'Retrofits & Upgrades',
    short: 'RETROFITS',
    tagline: 'Factory-look lighting and feature upgrades, coded to the car.',
    description:
      'Lighting, feature and comfort retrofits — fitted to look and work like they came from the factory.',
    detail:
      'Headlight and lighting upgrades, feature retrofits and details like the OEM start-up / speed chime — wired and coded so everything integrates with the car properly.',
    cta: 'Book a Retrofit',
    hotspot: [0.0, 0.55, -1.95],
    story: { az: 158, polar: 83, radius: 4.9, target: [0.05, 0.5, -1.5], yaw: 0.1, fov: 36 },
    highlight: 'front',
    isHotspot: true,
    effect: 'retrofit',
  },
  {
    id: 'ac',
    index: '03',
    label: 'AC Service',
    short: 'CLIMATE',
    tagline: 'Airflow, gas and cooling brought back to how it should feel.',
    description:
      'Air-conditioning diagnosis and service — vents, gas, compressor and cabin filtration checked and restored.',
    detail:
      'The system is checked end to end — pressures, compressor, condenser and cabin filter — then recharged so airflow at the vents is cold, quiet and even again.',
    cta: 'Book AC Service',
    hotspot: [0.72, 0.78, -0.35],
    story: { az: 98, polar: 73, radius: 4.5, target: [0.15, 0.92, -0.2], yaw: -0.3, fov: 34 },
    highlight: 'cabin',
    isHotspot: true,
    effect: 'ac',
  },
  {
    id: 'body-paint',
    index: '04',
    label: 'Denting & Painting',
    short: 'BODY & PAINT',
    tagline: 'Dents out, panels straight, colour matched back into the car.',
    description: 'Dent removal, panel repair and colour-matched refinishing.',
    detail:
      'Damaged panels are repaired or replaced, prepared and refinished with attention to colour match and texture, so repaired areas disappear into the rest of the body.',
    cta: 'Book Denting & Painting',
    hotspot: [1.05, 0.6, -0.3],
    story: { az: 126, polar: 81, radius: 5.0, target: [0.05, 0.6, 0.05], yaw: -0.22, fov: 34 },
    highlight: 'door',
    isHotspot: true,
    effect: 'body-paint',
  },
  {
    id: 'ceramic',
    index: '05',
    label: 'Ceramic Coating',
    short: 'CERAMIC',
    tagline: 'A protective layer that beads water and holds the gloss.',
    description:
      'Advanced exterior protection designed to preserve the finish and enhance the look of your vehicle.',
    detail:
      'The paint is decontaminated and refined, then a ceramic layer is applied to add depth to the finish and make water bead and roll straight off.',
    cta: 'Book Ceramic Coating',
    hotspot: [0.0, 1.02, -0.35],
    story: { az: 167, polar: 55, radius: 4.2, target: [0.1, 0.8, -1.3], yaw: 0.06, fov: 28 },
    highlight: 'roof',
    isHotspot: true,
    effect: 'ceramic',
  },
  {
    id: 'detailing',
    index: '06',
    label: 'Detailing',
    short: 'DETAILING',
    tagline: 'Cleaned, corrected and polished back to a mirror finish.',
    description:
      'Interior and exterior detailing, from a maintenance wash to a full reset.',
    detail:
      'Exterior decontamination and paint correction, wheels and arches, glass and trim — worked in stages until the surface reads clean and reflective from any angle.',
    cta: 'Book Detailing',
    hotspot: [0.98, 0.5, -1.15],
    story: { az: 122, polar: 70, radius: 9.0, target: [0, 0.55, 0], yaw: -0.12, fov: 40 },
    highlight: 'wheel-front',
    isHotspot: true,
    effect: 'detailing',
  },
  {
    id: 'diagnostics',
    index: '07',
    label: 'Diagnostics',
    short: 'DIAGNOSTICS',
    tagline: 'A full walk-around scan before anything is quoted.',
    description:
      'A structured inspection of the car — a concept visualisation of how a walk-around report could be presented.',
    detail:
      'A structured look over the vehicle before work is quoted. Shown here as a concept scan — the checks and results are illustrative, not a reading of any real car.',
    cta: 'Book an Inspection',
    hotspot: [0.0, 1.15, 0.0],
    story: { az: 152, polar: 61, radius: 10.0, target: [0, 0.55, 0], yaw: 0, fov: 42 },
    highlight: 'roof',
    isHotspot: true,
    effect: 'diagnostics',
  },
];

/** Non-cinema services — still bookable, listed in the booking form. */
const extraSeeds: ServiceSeed[] = [
  {
    id: 'ppf-wrap',
    index: '08',
    label: 'PPF & Wrapping',
    short: 'PPF · WRAP',
    tagline: 'Protect the paint, or change the car completely.',
    description:
      'Paint protection film for the factory finish, and full or partial vinyl wraps for a new look.',
    detail:
      'Self-healing film shields high-impact areas and the whole body; vinyl wraps change colour and finish and come off cleanly later.',
    cta: 'Book PPF & Wrapping',
    hotspot: [0.15, 0.72, -1.4],
    story: { az: 166, polar: 72, radius: 7.3, target: [-1.0, 0.56, -0.8], yaw: 0.12 },
    highlight: 'front',
    isHotspot: false,
  },
];

const withCamera = (s: ServiceSeed): Service => ({ ...s, camera: poseFromShot(s.story) });

/** The scroll cinema, in order. */
export const storyServices: Service[] = cinemaSeeds.map(withCamera);

/** Every bookable service (cinema + extras). */
export const services: Service[] = [...storyServices, ...extraSeeds.map(withCamera)];

export const serviceById = Object.fromEntries(
  services.map((s) => [s.id, s]),
) as Record<ServiceId, Service>;

export const hotspotServices = storyServices.filter((s) => s.isHotspot);

/** Ordered camera / rotation keyframes for the scroll cinema. */
export const storyKeyframes = storyServices.map((s) => s.story);

/** Effect id for each cinema chapter, index-aligned with `storyServices`. */
export const chapterEffects = storyServices.map((s) => s.effect as EffectId);
