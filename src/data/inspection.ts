import type { Vec3 } from '@/lib/types';

export type InspectionStatus = 'GOOD' | 'REFRESH' | 'CHECK' | 'PROTECTED';

export interface InspectionItem {
  id: string;
  label: string;
  status: InspectionStatus;
  note: string;
  /** Local-space anchor on the car exterior. */
  anchor: Vec3;
}

/**
 * "Finish Inspection" is an interactive concept for the demo. The statuses below
 * are illustrative sample data showing how a walk-around finish report could be
 * presented — they are not an assessment of any actual vehicle, and only cover
 * the exterior surface (paint, panels, coating, film, wheels).
 */
export const inspectionItems: InspectionItem[] = [
  {
    id: 'paint',
    label: 'PAINT',
    status: 'GOOD',
    note: 'Sample state — gloss even, light swirling under direct light.',
    anchor: [0.15, 0.72, -1.4],
  },
  {
    id: 'panels',
    label: 'PANELS',
    status: 'CHECK',
    note: 'Sample state — one panel gap shown outside tolerance.',
    anchor: [1.05, 0.6, -0.3],
  },
  {
    id: 'coating',
    label: 'CERAMIC',
    status: 'REFRESH',
    note: 'Sample state — water behaviour suggests coating is ageing.',
    anchor: [0.0, 1.05, -0.05],
  },
  {
    id: 'film',
    label: 'PPF',
    status: 'PROTECTED',
    note: 'Sample state — film present on front-facing panels.',
    anchor: [0.6, 0.6, -1.75],
  },
  {
    id: 'wheels',
    label: 'WHEELS',
    status: 'GOOD',
    note: 'Sample state — faces clean, no fresh kerb marks.',
    anchor: [0.98, 0.38, -1.15],
  },
];

export const statusMeta: Record<
  InspectionStatus,
  { tone: 'ready' | 'due' | 'inspect'; blurb: string }
> = {
  GOOD: { tone: 'ready', blurb: 'Within expected range' },
  PROTECTED: { tone: 'ready', blurb: 'Protection in place' },
  REFRESH: { tone: 'due', blurb: 'Service recommended soon' },
  CHECK: { tone: 'inspect', blurb: 'Closer look recommended' },
};
