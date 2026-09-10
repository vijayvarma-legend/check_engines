'use client';

import { useRef } from 'react';
import { useScene } from '@/lib/store';
import { serviceById } from '@/data/services';
import { useSceneFocus } from '@/hooks/useSceneFocus';
import { Reveal } from '@/components/ui/Reveal';

export function CeramicCoating() {
  const ref = useRef<HTMLElement>(null);
  useSceneFocus(ref, 'ceramic');
  const openBooking = useScene((s) => s.openBooking);
  const service = serviceById.ceramic;

  return (
    <section
      ref={ref}
      data-scene="ceramic"
      className="ce-passthrough relative flex min-h-[100svh] items-center py-24 md:py-32"
    >
      {/* Left scrim so type stays readable over the reflective car */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-r from-ink-900 via-ink-900/70 to-transparent" />

      <div className="ce-shell relative z-10">
        <div className="max-w-lg">
          <Reveal className="flex items-center gap-3">
            <span className="ce-eyebrow">05 · Ceramic Coating</span>
          </Reveal>
          <Reveal delay={60}>
            <h2 className="ce-h2 mt-4">Protection That Shows.</h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="ce-body mt-5">
              Advanced exterior protection designed to preserve the finish and
              enhance the look of your vehicle.
            </p>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-4 text-[13px] leading-relaxed text-chalk-dim">
              {service.detail}
            </p>
          </Reveal>

          <Reveal delay={200}>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => openBooking('ceramic')}
                className="ce-btn ce-btn-primary"
              >
                {service.cta}
              </button>
            </div>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-12 grid grid-cols-3 gap-px border border-white/10 bg-white/10">
              {['Depth of gloss', 'Easier to clean', 'Finish preserved'].map(
                (label) => (
                  <div key={label} className="bg-ink-900 p-3">
                    <div className="font-mono text-[9px] uppercase leading-tight tracking-wide2 text-chalk-dim">
                      {label}
                    </div>
                  </div>
                ),
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
