'use client';

import { whyPoints } from '@/data/site';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';

export function WhyCheckEngines() {
  return (
    <section id="about" className="pointer-events-auto relative bg-ink-900 py-24 md:py-32">
      <div className="ce-shell">
        <SectionHeading eyebrow="Why Check Engines" title="A considered approach to car care." />

        <div className="mt-14 border-t border-white/10">
          {whyPoints.map((point, i) => (
            <Reveal key={point.title} delay={i * 50}>
              <div className="grid gap-3 border-b border-white/10 py-7 md:grid-cols-[80px_minmax(0,1fr)_minmax(0,1.1fr)] md:gap-8">
                <span className="font-mono text-[11px] tracking-wide2 text-chalk-dim">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="text-lg font-medium tracking-[-0.01em] text-chalk">
                  {point.title}
                </h3>
                <p className="text-[14px] leading-relaxed text-chalk-muted">
                  {point.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={80}>
          <p className="mt-8 font-mono text-[10px] uppercase tracking-wide2 text-chalk-dim">
            Placeholder copy — no statistics, certifications or awards are claimed
            here. Replace with verified details when available.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
