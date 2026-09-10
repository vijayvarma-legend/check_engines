'use client';

import { ArrowUpRight } from 'lucide-react';
import { site, specialities } from '@/data/site';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';

export function WorkSection() {
  return (
    <section id="work" className="pointer-events-auto relative bg-ink-900 py-24 md:py-32">
      <div className="ce-shell">
        <SectionHeading
          eyebrow="The Workshop"
          title="Where the cars come in."
          intro="Denting and painting, PPF and wraps, ceramic, detailing, custom exhausts and retrofits — on everyday cars and on the ones people photograph."
        />

        <div className="mt-12 grid gap-px border border-white/10 bg-white/10 sm:grid-cols-2 md:grid-cols-3">
          {specialities.map((item, i) => (
            <Reveal key={item} delay={i * 50}>
              <div className="flex items-center justify-between bg-ink-900 p-5">
                <span className="text-[15px] font-medium tracking-[-0.01em] text-chalk">
                  {item}
                </span>
                <span className="font-mono text-[10px] tracking-wide2 text-chalk-dim">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
            </Reveal>
          ))}
          <Reveal delay={specialities.length * 50}>
            <a
              href={site.social.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-full items-center justify-between bg-ink-900 p-5 text-ignition transition-colors hover:bg-ink-800"
            >
              <span className="text-[15px] font-medium tracking-[-0.01em]">
                See the work on Instagram
              </span>
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </Reveal>
        </div>

        <Reveal delay={120}>
          <p className="mt-8 max-w-2xl border-l border-ignition/40 pl-4 text-[13px] leading-relaxed text-chalk-muted">
            Recent: the country&rsquo;s first MINI Countryman EV fitted with a THOR
            electronic exhaust system.{' '}
            <span className="font-mono text-[10px] uppercase tracking-wide2 text-chalk-dim">
              As posted by {site.social.instagram.handle}.
            </span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
