'use client';

import { useFrame } from '@react-three/fiber';
import { useScene } from '@/lib/store';
import { computeStoryTargets, easeStoryFx, storyFx } from '@/lib/storyFx';

/**
 * Runs before everything else each frame: reads scroll progress from the store,
 * computes the per-effect targets and eases the shared `storyFx` bus toward
 * them. Every other 3D system just reads `storyFx`.
 */
export function StoryDirector() {
  useFrame((state, delta) => {
    const s = useScene.getState();
    const dt = Math.min(delta, 1 / 20);
    const tgt = computeStoryTargets(
      s.storyProgress,
      s.storyActive,
      state.clock.elapsedTime,
    );
    easeStoryFx(dt, tgt);

    if (process.env.NODE_ENV === 'development') {
      (window as unknown as { __story?: unknown }).__story = {
        progress: s.storyProgress,
        active: s.storyActive,
        chapter: +storyFx.chapter.toFixed(2),
        effect: storyFx.effect,
        engine: { rpm: Math.round(storyFx.engine.rpm), reveal: +storyFx.engine.reveal.toFixed(2), heat: +storyFx.engine.heat.toFixed(2) },
        ac: { airflow: +storyFx.ac.airflow.toFixed(2), tempC: +storyFx.ac.tempC.toFixed(1) },
        body: { damage: +storyFx.body.damage.toFixed(2), colorMix: +storyFx.body.colorMix.toFixed(2), gloss: +storyFx.body.gloss.toFixed(2) },
        ceramic: { coat: +storyFx.ceramic.coat.toFixed(2), beads: +storyFx.ceramic.beads.toFixed(2) },
        detail: { dirt: +storyFx.detail.dirt.toFixed(2), polish: +storyFx.detail.polish.toFixed(2), reflect: +storyFx.detail.reflect.toFixed(2) },
        diag: { scan: +storyFx.diag.scan.toFixed(2), checks: storyFx.diag.checks },
        cam: [state.camera.position.x, state.camera.position.y, state.camera.position.z].map((n) => +n.toFixed(2)),
        fov: Math.round((state.camera as unknown as { fov: number }).fov * 10) / 10,
      };
    }
  }, -200);

  return null;
}
