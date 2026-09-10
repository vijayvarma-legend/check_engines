'use client';

import { useEffect, useRef } from 'react';
import { ScanLine, Power } from 'lucide-react';
import { inspectionItems, statusMeta } from '@/data/inspection';
import { useScene } from '@/lib/store';
import { cn } from '@/lib/cn';
import { Reveal } from '@/components/ui/Reveal';

const toneText = {
  ready: 'text-signal-ready',
  due: 'text-signal-due',
  inspect: 'text-signal-inspect',
} as const;

const toneDot = {
  ready: 'bg-signal-ready',
  due: 'bg-signal-due',
  inspect: 'bg-signal-inspect',
} as const;

export function InspectionSection() {
  const ref = useRef<HTMLElement>(null);
  const inspection = useScene((s) => s.inspection);
  const toggleInspection = useScene((s) => s.toggleInspection);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && useScene.getState().inspection) {
          toggleInspection(false);
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [toggleInspection]);

  return (
    <section
      id="experience"
      ref={ref}
      data-scene="inspection"
      className="ce-passthrough relative min-h-[100svh] py-24 md:py-32"
    >
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-r from-ink-900 via-ink-900/75 to-transparent md:to-ink-900/10" />
      <div className="ce-shell relative z-10">
        <div className="max-w-xl">
        <Reveal className="flex items-center gap-3">
          <ScanLine className="h-4 w-4 text-ignition" />
          <span className="ce-eyebrow">Interactive Concept</span>
        </Reveal>
        <Reveal delay={60}>
          <h2 className="ce-h2 mt-4">Finish Inspection</h2>
        </Reveal>
        <Reveal delay={120}>
          <p className="ce-body mt-4 max-w-lg">
            A visualisation of how a walk-around finish report could be presented —
            the environment dims and each part of the exterior gets a status card:
            paint, panels, coating, film and wheels.
          </p>
        </Reveal>

        <Reveal delay={160}>
          <button
            onClick={() => toggleInspection()}
            className={cn(
              'ce-btn mt-8',
              inspection ? 'ce-btn-primary' : 'ce-btn-ghost',
            )}
          >
            <Power className="h-3.5 w-3.5" />
            {inspection ? 'Exit Inspection' : 'Enter Finish Inspection'}
          </button>
        </Reveal>

        <div className="mt-12 grid gap-3 sm:grid-cols-2">
          {inspectionItems.map((item, i) => {
            const meta = statusMeta[item.status];
            return (
              <Reveal key={item.id} delay={i * 60}>
                <div
                  className={cn(
                    'ce-corner relative border p-4 transition-colors duration-500',
                    inspection
                      ? 'border-white/15 bg-ink-800/70'
                      : 'border-white/8 bg-white/[0.015]',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] uppercase tracking-wide2 text-chalk">
                      {item.label}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          'h-1.5 w-1.5 rounded-full',
                          toneDot[meta.tone],
                          inspection && 'animate-pulse',
                        )}
                      />
                      <span
                        className={cn(
                          'font-mono text-[10px] uppercase tracking-wide2',
                          toneText[meta.tone],
                        )}
                      >
                        {item.status}
                      </span>
                    </span>
                  </div>
                  <p className="mt-3 font-mono text-[10px] leading-relaxed tracking-wide text-chalk-dim">
                    {item.note}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={120}>
          <p className="mt-10 max-w-2xl border-l border-ignition/40 pl-4 font-mono text-[10px] uppercase leading-relaxed tracking-wide2 text-chalk-dim">
            Demo visualisation only. The statuses shown are illustrative sample
            data to demonstrate the interface — they are not an assessment of any
            actual vehicle, and cover only the exterior surface. A real inspection
            is carried out in person at Check Engines.
          </p>
        </Reveal>
        </div>
      </div>
    </section>
  );
}
