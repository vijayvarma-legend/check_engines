'use client';

import { create } from 'zustand';
import type { SceneMode } from '@/lib/types';
import type { ServiceId } from '@/data/services';
import { HERO_CAMERA, serviceById, type CameraPose } from '@/data/services';
import { viewPresets, type ViewPresetId } from '@/data/camera';

interface CameraCommand {
  pose: CameraPose;
  instant: boolean;
  /** Incremented on every request so the controller re-runs even for the same pose. */
  token: number;
}

interface SceneState {
  mode: SceneMode;
  activeService: ServiceId | null;
  inspection: boolean;
  scrollProgress: number;
  sceneReady: boolean;
  interacting: boolean;
  /** Pointer has been active over the canvas recently (pauses idle turntable). */
  pointerActive: boolean;
  camera: CameraCommand;

  /** Scroll-driven service cinema. */
  storyActive: boolean;
  /** 0..1 progress across every service chapter. */
  storyProgress: number;

  /** Demo booking modal. */
  bookingOpen: boolean;
  bookingService: ServiceId | null;

  focusService: (
    id: ServiceId,
    mode?: Extract<SceneMode, 'service' | 'story'>,
  ) => void;
  clearService: () => void;
  setMode: (mode: SceneMode) => void;
  toggleInspection: (value?: boolean) => void;
  setScrollProgress: (p: number) => void;
  setSceneReady: (v: boolean) => void;
  setInteracting: (v: boolean) => void;
  setPointerActive: (v: boolean) => void;
  setStoryActive: (v: boolean) => void;
  setStoryProgress: (p: number) => void;
  /** Set the highlighted service without issuing a camera command. */
  setActiveStory: (id: ServiceId | null) => void;
  flyTo: (pose: CameraPose, instant?: boolean) => void;
  applyPreset: (id: ViewPresetId) => void;
  resetView: () => void;
  openBooking: (service?: ServiceId | null) => void;
  closeBooking: () => void;
}

const heroCommand = (): CameraCommand => ({
  pose: HERO_CAMERA,
  instant: false,
  token: 0,
});

export const useScene = create<SceneState>((set, get) => ({
  mode: 'hero',
  activeService: null,
  inspection: false,
  scrollProgress: 0,
  sceneReady: false,
  interacting: false,
  pointerActive: false,
  camera: heroCommand(),
  storyActive: false,
  storyProgress: 0,
  bookingOpen: false,
  bookingService: null,

  focusService: (id, mode = 'service') =>
    set((s) => ({
      activeService: id,
      mode,
      camera: {
        pose: serviceById[id].camera,
        instant: false,
        token: s.camera.token + 1,
      },
    })),

  clearService: () =>
    set((s) => {
      const nextMode: SceneMode =
        s.mode === 'service' || s.mode === 'story' ? 'hero' : s.mode;
      return {
        activeService: null,
        mode: nextMode,
        camera: {
          pose: HERO_CAMERA,
          instant: false,
          token: s.camera.token + 1,
        },
      };
    }),

  setMode: (mode) => set({ mode }),

  toggleInspection: (value) =>
    set((s) => {
      const inspection = value ?? !s.inspection;
      return {
        inspection,
        mode: inspection ? 'inspection' : s.activeService ? s.mode : 'hero',
        camera: {
          pose: inspection ? viewPresets.side : HERO_CAMERA,
          instant: false,
          token: s.camera.token + 1,
        },
      };
    }),

  setScrollProgress: (p) => set({ scrollProgress: p }),
  setSceneReady: (v) => set({ sceneReady: v }),
  setInteracting: (v) => set({ interacting: v }),
  setPointerActive: (v) => set({ pointerActive: v }),

  setStoryActive: (v) =>
    set((s) => ({
      storyActive: v,
      mode: v ? 'story' : s.inspection ? 'inspection' : 'hero',
      activeService: v ? s.activeService : null,
      // Returning from the cinema hands the camera back to a clean hero pose.
      camera:
        !v && s.storyActive
          ? { pose: HERO_CAMERA, instant: false, token: s.camera.token + 1 }
          : s.camera,
    })),
  setStoryProgress: (p) => set({ storyProgress: p }),
  setActiveStory: (id) =>
    set({ activeService: id, mode: id ? 'story' : 'hero' }),

  flyTo: (pose, instant = false) =>
    set((s) => ({
      camera: { pose, instant, token: s.camera.token + 1 },
    })),

  applyPreset: (id) =>
    set((s) => ({
      camera: { pose: viewPresets[id], instant: false, token: s.camera.token + 1 },
    })),

  resetView: () =>
    set((s) => ({
      activeService: null,
      mode: s.inspection ? 'inspection' : 'hero',
      camera: {
        pose: s.inspection ? viewPresets.side : HERO_CAMERA,
        instant: false,
        token: s.camera.token + 1,
      },
    })),

  openBooking: (service = null) =>
    set({ bookingOpen: true, bookingService: service }),
  closeBooking: () => set({ bookingOpen: false }),
}));

export { HERO_CAMERA };
export type { CameraPose };
