'use client';

import { useEffect, useRef } from 'react';
import { site } from '@/data/site';
import { useScene } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';

const FINALE_POSE = {
  position: [6.4, 2.3, 6.8] as [number, number, number],
  target: [-0.2, -0.5, 0.2] as [number, number, number],
};

export function FinalCTA() {
  const ref = useRef<HTMLElement>(null);
  const openBooking = useScene((s) => s.openBooking);
  const setMode = useScene((s) => s.setMode);
  const flyTo = useScene((s) => s.flyTo);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        const state = useScene.getState();
        if (state.inspection) return;
        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
          setMode('finale');
          flyTo(FINALE_POSE);
        } else if (!entry.isIntersecting && useScene.getState().mode === 'finale') {
          setMode('hero');
        }
      },
      { threshold: [0, 0.5, 0.9] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [setMode, flyTo]);

  return (
    <section
      ref={ref}
      data-scene="finale"
      className="ce-passthrough relative flex min-h-[100svh] items-start overflow-hidden py-24 pt-[20vh] md:pt-[18vh]"
    >
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-t from-ink-900 via-ink-900/45 to-ink-900/80" />
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(60% 45% at 50% 38%, rgba(8,9,11,0.82), rgba(8,9,11,0) 70%)',
        }}
      />
      <div className="ce-shell relative z-10 text-center">
        <Reveal>
          <p className="ce-eyebrow">{site.location.label}</p>
        </Reveal>
        <Reveal delay={60}>
          <h2 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold leading-[1.02] tracking-[-0.02em] text-chalk md:text-6xl">
            Ready to Check Your Engine?
          </h2>
        </Reveal>
        <Reveal delay={120}>
          <p className="ce-body mx-auto mt-5 max-w-md">
            Book your next service with Check Engines.
          </p>
        </Reveal>
        <Reveal delay={180}>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Button onClick={() => openBooking(null)} withArrow>
              Book a Service
            </Button>
            <a href="#contact">
              <Button variant="ghost">Contact Check Engines</Button>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
