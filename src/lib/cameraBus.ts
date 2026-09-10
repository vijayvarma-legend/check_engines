'use client';

import type { CameraControls } from '@react-three/drei';

type CC = React.ComponentRef<typeof CameraControls>;

let controls: CC | null = null;

export const cameraBus = {
  attach(instance: CC | null) {
    controls = instance;
  },
  rotate(deltaAzimuthDeg: number, deltaPolarDeg = 0) {
    controls?.rotate(
      (deltaAzimuthDeg * Math.PI) / 180,
      (deltaPolarDeg * Math.PI) / 180,
      true,
    );
  },
  zoom(factor: number) {
    // factor > 1 dollies in, < 1 dollies out.
    if (!controls) return;
    const distance = controls.distance;
    controls.dollyTo(distance / factor, true);
  },
};
