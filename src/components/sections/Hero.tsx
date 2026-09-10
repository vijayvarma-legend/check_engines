'use client';

import { useEffect, useState } from 'react';
import { MapPin, MousePointer2, ChevronDown } from 'lucide-react';
import { site } from '@/data/site';
import { useScene } from '@/lib/store';
import { Button } from '@/components/ui/Button';

export function Hero() {
  const openBooking = useScene((s) => s.openBooking);
  const interacting = useScene((s) => s.interacting);
  const [hintGone, setHintGone] = useState(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (interacting) setHintGone(true);
  }, [interacting]);

  // Entrance on first paint — independent of the 3D scene so the hero copy is
  // never blocked by loading.
  useEffect(() => {
    const id = requestAnimationFrame(() => setRevealed(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <section
      id="top"
      data-scene="hero"
      className="ce-passthrough relative flex min-h-[100svh] flex-col justify-between pt-24 md:pt-28"
    >
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            'linear-gradient(90deg, #08090b 0%, rgba(8,9,11,0.82) 22%, rgba(8,9,11,0.32) 44%, rgba(8,9,11,0) 64%)',
        }}
      />
      <div className="ce-shell relative z-10 flex flex-1 flex-col justify-center">
        <div
          className="max-w-xl transition-all duration-1000"
          style={{
            opacity: revealed ? 1 : 0,
            transform: revealed ? 'translateY(0)' : 'translateY(20px)',
          }}
        >
          <div className="mb-6 inline-flex items-center gap-2 border border-white/12 bg-ink-900/40 px-3 py-1.5 backdrop-blur-sm">
            <MapPin className="h-3.5 w-3.5 text-ignition" />
            <span className="font-mono text-[10px] uppercase tracking-wide2 text-chalk-muted">
              {site.location.label}
            </span>
          </div>

          <h1 className="font-mono text-4xl font-light leading-none tracking-[0.16em] text-chalk sm:text-5xl md:text-6xl">
            CHECK
            <br />
            ENGINES
          </h1>

          <p className="mt-6 text-lg font-light tracking-[-0.01em] text-chalk md:text-2xl">
            {site.tagline}
          </p>

          <p className="ce-body mt-4 max-w-md">{site.heroSupport}</p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Button onClick={() => openBooking(null)} withArrow>
              {site.primaryCta.label}
            </Button>
            <a href="#services">
              <Button variant="ghost">{site.secondaryCta.label}</Button>
            </a>
          </div>
        </div>
      </div>

      <div className="ce-shell relative z-10 flex items-end justify-between pb-8">
        <div
          className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wide2 text-chalk-dim transition-opacity duration-700"
          style={{ opacity: hintGone ? 0 : 1 }}
        >
          <MousePointer2 className="h-3.5 w-3.5" />
          Drag to rotate · scroll to explore
        </div>
        <div className="flex flex-col items-center gap-1 text-chalk-dim">
          <span className="font-mono text-[9px] uppercase tracking-wide2">Scroll</span>
          <ChevronDown className="h-4 w-4 animate-bounce" />
        </div>
      </div>
    </section>
  );
}
