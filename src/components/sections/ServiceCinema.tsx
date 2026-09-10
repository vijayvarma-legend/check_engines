'use client';

import { useEffect, useRef } from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { storyServices as services } from '@/data/services';
import { useScene } from '@/lib/store';
import { useClientEnv } from '@/hooks/useClientEnv';
import { useStoryScroll } from '@/hooks/useStoryScroll';
import {
  CHAPTER_COUNT,
  chapterFloatAt,
  chapterOpacity,
  pinFade,
} from '@/lib/storyTimeline';
import { scrollToChapter } from '@/lib/storyNav';
import { cn } from '@/lib/cn';

const N = CHAPTER_COUNT;

/**
 * The scroll-driven service cinema. One tall pinned section; GSAP ScrollTrigger
 * scrubs a 0..1 value that every other system (camera, rotation, highlight,
 * lighting) reads. Typography here is wired straight to that value with no React
 * re-renders per frame.
 */
export function ServiceCinema() {
  const env = useClientEnv();
  const enabled =
    env.ready && env.webgl && !env.reducedMotion && env.tier !== 'low';

  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const chapterRefs = useRef<(HTMLDivElement | null)[]>([]);
  const tickRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const barRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const activeIdx = useRef(-1);
  const wasActive = useRef(false);

  useStoryScroll(sectionRef, pinRef, enabled);

  // Drive typography + rail imperatively from the scrubbed progress value.
  useEffect(() => {
    if (!enabled) return;
    const setActiveStory = useScene.getState().setActiveStory;

    const apply = (progress: number, active: boolean) => {
      const rp = Math.min(1, Math.max(0, progress));
      const scaled = Math.max(0, Math.min(N - 1, chapterFloatAt(progress)));
      const fade = pinFade(progress);

      if (stageRef.current) stageRef.current.style.opacity = String(fade);

      chapterRefs.current.forEach((el, i) => {
        if (!el) return;
        const o = chapterOpacity(progress, i);
        const dir = i > scaled ? 1 : -1;
        el.style.opacity = String(o);
        el.style.transform = `translateY(${(1 - o) * dir * 44}px)`;
        el.style.pointerEvents = o > 0.6 && fade > 0.5 ? 'auto' : 'none';
        el.style.visibility = o < 0.02 ? 'hidden' : 'visible';
      });

      const idx = Math.max(0, Math.min(N - 1, Math.round(scaled)));
      const idxChanged = idx !== activeIdx.current;
      const activeChanged = active !== wasActive.current;

      tickRefs.current.forEach((t, i) => {
        if (t)
          t.style.backgroundColor =
            i <= idx ? '#E22B22' : 'rgba(255,255,255,0.15)';
      });
      if (barRef.current)
        barRef.current.style.transform = `scaleX(${Math.max(0.02, rp)})`;

      if (idxChanged) {
        activeIdx.current = idx;
        if (counterRef.current)
          counterRef.current.textContent = String(idx + 1).padStart(2, '0');
      }

      if (idxChanged || activeChanged) {
        wasActive.current = active;
        setActiveStory(active ? services[idx].id : null);
      }
    };

    apply(useScene.getState().storyProgress, useScene.getState().storyActive);
    const unsub = useScene.subscribe((s) => apply(s.storyProgress, s.storyActive));
    return unsub;
  }, [enabled]);

  // ---- Fallback: reduced motion / no WebGL / low tier — plain stacked list ----
  if (!enabled) {
    return (
      <section id="services" className="pointer-events-auto relative bg-ink-900 py-24 md:py-32">
        <div className="ce-shell">
          <span className="ce-eyebrow">The Walkthrough</span>
          <h2 className="ce-h2 mt-3">Your Car. Completely Covered.</h2>
          <div className="mt-12 border-t border-white/10">
            {services.map((s) => (
              <div
                key={s.id}
                className="grid gap-3 border-b border-white/10 py-8 md:grid-cols-[64px_minmax(0,1fr)_minmax(0,1fr)] md:gap-8"
              >
                <span className="font-mono text-[11px] tracking-wide2 text-ignition">
                  {s.index}
                </span>
                <div>
                  <h3 className="text-xl font-semibold tracking-[-0.01em] text-chalk">
                    {s.label}
                  </h3>
                  <p className="mt-1 text-[14px] text-chalk-muted">{s.tagline}</p>
                </div>
                <div>
                  <p className="text-[13px] leading-relaxed text-chalk-muted">
                    {s.detail}
                  </p>
                  <button
                    onClick={() => useScene.getState().openBooking(s.id)}
                    className="mt-3 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide2 text-ignition hover:text-ignition-bright"
                  >
                    {s.cta} <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ---- Cinema ----
  return (
    <section
      id="services"
      ref={sectionRef}
      data-scene="story"
      className="ce-passthrough relative"
      style={{ height: `${N * 150}vh` }}
    >
      <div ref={pinRef} className="relative h-[100svh] w-full overflow-hidden">
       <div ref={stageRef} className="absolute inset-0">
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background:
              'linear-gradient(90deg, #08090b 0%, rgba(8,9,11,0.78) 26%, rgba(8,9,11,0.24) 48%, rgba(8,9,11,0) 66%)',
          }}
        />

        <div className="ce-shell relative z-10 flex h-full items-center">
          <div className="w-full max-w-[440px]">
            <div className="mb-6 flex items-center gap-3">
              <span className="ce-eyebrow">The Walkthrough</span>
              <span className="h-px flex-1 bg-white/12" />
              <span className="font-mono text-[10px] tracking-wide2 text-chalk-dim">
                <span ref={counterRef}>01</span> / {String(N).padStart(2, '0')}
              </span>
            </div>

            {/* Crossfading chapters, stacked in one spot */}
            <div className="relative min-h-[340px]">
              {services.map((s, i) => (
                <div
                  key={s.id}
                  ref={(el) => {
                    chapterRefs.current[i] = el;
                  }}
                  className="absolute inset-x-0 top-0 will-change-transform"
                  style={{ opacity: i === 0 ? 1 : 0 }}
                >
                  <div className="font-mono text-[11px] tracking-wide2 text-ignition">
                    {s.index}
                  </div>
                  <h2 className="mt-2 text-[2rem] font-semibold leading-[1.06] tracking-[-0.02em] text-chalk md:text-[2.5rem]">
                    {s.label}
                  </h2>
                  <p className="mt-3 text-[15px] font-medium text-chalk">
                    {s.tagline}
                  </p>
                  <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-chalk-muted">
                    {s.detail}
                  </p>
                  <button
                    onClick={() => useScene.getState().openBooking(s.id)}
                    className="ce-btn ce-btn-primary mt-5 !py-2.5"
                  >
                    {s.cta}
                  </button>
                </div>
              ))}
            </div>

            {/* Chapter rail */}
            <div className="mt-10 flex items-center gap-2">
              {services.map((s, i) => (
                <button
                  key={s.id}
                  ref={(el) => {
                    tickRefs.current[i] = el;
                  }}
                  onClick={() => scrollToChapter(i)}
                  aria-label={`Go to ${s.label}`}
                  className={cn(
                    'h-[3px] flex-1 rounded-full transition-colors duration-300',
                    i === 0 ? 'bg-ignition' : 'bg-white/15',
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        {/* progress line across the bottom */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-px bg-white/10">
          <div
            ref={barRef}
            className="h-full origin-left bg-ignition"
            style={{ transform: 'scaleX(0.02)' }}
          />
        </div>

        <div className="pointer-events-none absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1 text-chalk-dim">
          <span className="font-mono text-[9px] uppercase tracking-wide2">
            Keep scrolling
          </span>
          <ChevronDown className="h-4 w-4" />
        </div>
       </div>
      </div>
    </section>
  );
}
