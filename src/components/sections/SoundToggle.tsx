'use client';

import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useScene } from '@/lib/store';
import { storyFx, CH } from '@/lib/storyFx';
import { engineAudio } from '@/lib/engineAudio';
import { useClientEnv } from '@/hooks/useClientEnv';
import { cn } from '@/lib/cn';

const KEY = 'ce-sound';

/**
 * Sound control for the engine note. On by default (browsers keep it silent
 * until the first interaction anyway — `engineAudio` resumes itself then). With
 * a real clip present the whole clip plays on entering the Engine Performance
 * chapter and fades out on leaving; without one it falls back to a pitch-tracked
 * synth. Silent on every other chapter.
 */
export function SoundToggle() {
  const env = useClientEnv();
  const [on, setOn] = useState(true);
  const [mounted, setMounted] = useState(false);
  const onRef = useRef(true);
  const armed = useRef(true);

  useEffect(() => {
    setMounted(true);
    let start = true;
    try {
      start = localStorage.getItem(KEY) !== '0';
    } catch {}
    setOn(start);
    onRef.current = start;
    if (start) engineAudio.setEnabled(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!onRef.current) return;
      const active = useScene.getState().storyActive;
      const inEngine = active && storyFx.engaged[CH.engine];
      const load = inEngine ? storyFx.engine.load : 0;

      if (engineAudio.mode === 'sample') {
        // play the whole clip through when entering the chapter; re-arm once
        // clear of it. Only stop early if the whole cinema is left behind.
        if (armed.current && load > 0.16) {
          engineAudio.trigger(0.55 + load * 0.45);
          armed.current = false;
        }
        if (!inEngine) armed.current = true;
        if (!active) engineAudio.release(1.2);
      } else {
        const level = load > 0.001 ? 0.02 + load * 0.12 : 0;
        engineAudio.update(storyFx.engine.rpm, load, level);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mounted]);

  useEffect(() => () => engineAudio.setEnabled(false), []);

  if (!env.ready || !env.webgl || env.tier === 'low') return null;

  const toggle = () => {
    const next = !on;
    setOn(next);
    onRef.current = next;
    engineAudio.setEnabled(next);
    try {
      localStorage.setItem(KEY, next ? '1' : '0');
    } catch {}
  };

  return (
    <button
      onClick={toggle}
      aria-label={on ? 'Mute engine sound' : 'Enable engine sound'}
      aria-pressed={on}
      className={cn(
        'pointer-events-auto fixed bottom-4 left-4 z-40 flex h-9 items-center gap-2 border px-2.5 font-mono text-[10px] uppercase tracking-wide2 backdrop-blur-md transition-colors',
        on
          ? 'border-ignition/60 bg-ink-900/80 text-ignition'
          : 'border-white/12 bg-ink-900/70 text-chalk-muted hover:text-chalk',
      )}
    >
      {on ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
      <span className="hidden sm:inline">{on ? 'Sound On' : 'Sound'}</span>
    </button>
  );
}
