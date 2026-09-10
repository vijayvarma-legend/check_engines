'use client';

import {
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Undo2,
} from 'lucide-react';
import { useScene } from '@/lib/store';
import { cameraBus } from '@/lib/cameraBus';
import { viewPresetList } from '@/data/camera';
import { useClientEnv } from '@/hooks/useClientEnv';
import { cn } from '@/lib/cn';

/**
 * Configurator-style control dock. Available whenever the live scene is on
 * screen; hidden entirely on the static fallback.
 */
export function CarControlsDock() {
  const env = useClientEnv();
  const applyPreset = useScene((s) => s.applyPreset);
  const resetView = useScene((s) => s.resetView);
  const mode = useScene((s) => s.mode);
  const activeService = useScene((s) => s.activeService);
  const storyActive = useScene((s) => s.storyActive);
  const inspection = useScene((s) => s.inspection);

  if (!env.ready || !env.webgl || env.tier === 'low') return null;
  // Hide while the scroll cinema or inspection owns the camera.
  if (storyActive || inspection) return null;

  const iconBtn =
    'flex h-9 w-9 items-center justify-center text-chalk-muted transition-colors hover:text-chalk';

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-1 border border-white/12 bg-ink-900/80 px-2 py-1.5 backdrop-blur-md">
        <button className={iconBtn} aria-label="Rotate left" onClick={() => cameraBus.rotate(-30)}>
          <RotateCcw className="h-4 w-4" />
        </button>
        <button className={iconBtn} aria-label="Rotate right" onClick={() => cameraBus.rotate(30)}>
          <RotateCw className="h-4 w-4" />
        </button>

        <span className="mx-1 h-5 w-px bg-white/12" />

        <button className={iconBtn} aria-label="Zoom in" onClick={() => cameraBus.zoom(1.25)}>
          <ZoomIn className="h-4 w-4" />
        </button>
        <button className={iconBtn} aria-label="Zoom out" onClick={() => cameraBus.zoom(0.8)}>
          <ZoomOut className="h-4 w-4" />
        </button>

        <span className="mx-1 h-5 w-px bg-white/12" />

        <div className="hidden items-center gap-0.5 sm:flex">
          {viewPresetList.map((preset) => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset.id)}
              className={cn(
                'px-2 py-1 font-mono text-[10px] uppercase tracking-wide2 transition-colors',
                mode === 'hero' && !activeService && preset.id === 'hero'
                  ? 'text-ignition'
                  : 'text-chalk-dim hover:text-chalk',
              )}
            >
              {preset.label}
            </button>
          ))}
          <span className="mx-1 h-5 w-px bg-white/12" />
        </div>

        <button
          className="flex items-center gap-1.5 px-2 py-1 font-mono text-[10px] uppercase tracking-wide2 text-chalk-muted transition-colors hover:text-chalk"
          onClick={resetView}
        >
          <Undo2 className="h-3.5 w-3.5" />
          Reset
        </button>
      </div>
    </div>
  );
}
