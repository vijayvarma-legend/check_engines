import type { CameraPose } from '@/data/services';

export type ViewPresetId = 'hero' | 'front' | 'side' | 'rear' | 'top';

// GLB front faces -Z; car centred near [0, 0.62, 0].
export const viewPresets: Record<ViewPresetId, CameraPose> = {
  hero: { position: [5.7, 1.95, -5.7], target: [-1.35, 0.72, 0.2] },
  front: { position: [0.2, 1.15, -6.8], target: [0, 0.55, -0.6] },
  side: { position: [7.0, 1.2, 0.1], target: [0, 0.55, 0] },
  rear: { position: [-0.3, 1.35, 6.8], target: [0, 0.55, 0.6] },
  top: { position: [0.01, 7.4, -0.3], target: [0, 0.15, 0] },
};

export const viewPresetList: { id: ViewPresetId; label: string }[] = [
  { id: 'hero', label: '3/4' },
  { id: 'front', label: 'Front' },
  { id: 'side', label: 'Side' },
  { id: 'rear', label: 'Rear' },
  { id: 'top', label: 'Top' },
];
