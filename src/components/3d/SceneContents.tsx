'use client';

import { Suspense } from 'react';
import { AdaptiveDpr, AdaptiveEvents } from '@react-three/drei';
import { Lighting } from './Lighting';
import { Ground } from './Ground';
import { CarRig } from './CarRig';
import { CameraController } from './CameraController';
import { InspectionFx } from './InspectionFx';
import { InspectionLabels } from './InspectionLabels';
import { FrameGovernor } from './FrameGovernor';
import { StoryDirector } from './StoryDirector';
import { CinemaFx } from './CinemaFx';

interface SceneContentsProps {
  quality: 'low' | 'mid' | 'high';
  reducedMotion: boolean;
}

export function SceneContents({ quality, reducedMotion }: SceneContentsProps) {
  return (
    <>
      <color attach="background" args={['#08090b']} />
      <fog attach="fog" args={['#08090b', 12, 34]} />

      <StoryDirector />
      <CameraController reducedMotion={reducedMotion} />
      <FrameGovernor />

      <Suspense fallback={null}>
        <Lighting quality={quality} />
        <CarRig quality={quality} reducedMotion={reducedMotion}>
          <InspectionLabels />
          <CinemaFx quality={quality} reducedMotion={reducedMotion} />
        </CarRig>
        <Ground quality={quality} />
        <InspectionFx reducedMotion={reducedMotion} />
      </Suspense>

      <AdaptiveDpr pixelated />
      <AdaptiveEvents />
    </>
  );
}
