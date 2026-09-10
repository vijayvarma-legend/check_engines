'use client';

import { useEffect, useRef, useState } from 'react';
import { useScene } from '@/lib/store';
import { storyFx, CH } from '@/lib/storyFx';
import { useClientEnv } from '@/hooks/useClientEnv';
import { chapterEffects } from '@/data/services';

/**
 * A live technical read-out pinned beside the scroll cinema. It runs its own rAF
 * loop off the shared `storyFx` bus (no React re-render per frame) so the numbers
 * — RPM, cabin temp, gloss, scan progress — move with the scroll and make each
 * service legible without reading the paragraph.
 */
const DIAG_ITEMS = ['ENGINE', 'BRAKES', 'A/C', 'BODY', 'ELECTRICAL'];
const PAINT_PHASES = ['DENT REMOVAL', 'PANEL PREP', 'COLOUR MATCH', 'CLEARCOAT', 'FLAT & POLISH'];
const DETAIL_PHASES = ['DECONTAMINATE', 'WASH', 'PAINT CORRECTION', 'MACHINE POLISH', 'FINISH'];
const RETRO_PHASES = ['WIRING', 'CODING', 'LIGHTING', 'FEATURES', 'INTEGRATED'];

export function CinemaHud() {
  const env = useClientEnv();
  const enabled = env.ready && env.webgl && !env.reducedMotion && env.tier !== 'low';
  const storyActive = useScene((s) => s.storyActive);

  const rootRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);
  const bigRef = useRef<HTMLDivElement>(null);
  const unitRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const noteRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!enabled || !mounted) return;
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const root = rootRef.current;
      if (!root) return;
      const on = useScene.getState().storyActive;
      root.style.opacity = on ? '1' : '0';
      if (!on) return;

      const fx = storyFx;
      const eff = chapterEffects[fx.nearest] ?? chapterEffects[0];
      const big = bigRef.current;
      const bar = barRef.current;
      const note = noteRef.current;
      const title = titleRef.current;
      const unit = unitRef.current;
      const list = listRef.current;
      const showList = eff === 'diagnostics';
      if (list) list.style.display = showList ? 'flex' : 'none';
      if (big) big.parentElement!.style.display = showList ? 'none' : 'block';

      if (eff === 'engine') {
        const rpm = Math.max(0, storyFx.engine.rpm);
        if (title) title.textContent = 'ENGINE SPEED';
        if (big) big.textContent = Math.round(rpm / 10 % 10 === 0 ? rpm : rpm).toLocaleString('en-US');
        if (unit) unit.textContent = 'RPM';
        if (bar) bar.style.transform = `scaleX(${Math.min(1, rpm / 7200)})`;
        if (note)
          note.textContent =
            storyFx.engine.load > 0.55 ? 'VALVED EXHAUST · OPEN' : 'VALVED EXHAUST · CLOSED';
      } else if (eff === 'retrofit') {
        const t = localPhase(fx.chapter, CH.retrofit);
        if (title) title.textContent = 'RETROFIT';
        if (big) big.textContent = `${Math.round(fx.retrofit.lights * 100)}`;
        if (unit) unit.textContent = '% ONLINE';
        if (bar) bar.style.transform = `scaleX(${Math.max(fx.retrofit.lights, t)})`;
        if (note) note.textContent = RETRO_PHASES[Math.min(4, Math.floor(t * 5))];
      } else if (eff === 'ac') {
        const temp = storyFx.ac.tempC;
        if (title) title.textContent = 'CABIN TEMPERATURE';
        if (big) big.textContent = temp.toFixed(1);
        if (unit) unit.textContent = '°C';
        if (bar) bar.style.transform = `scaleX(${Math.min(1, storyFx.ac.airflow)})`;
        if (note)
          note.textContent = `AIRFLOW ${Math.round(storyFx.ac.airflow * 100)}%  ·  ${
            temp < 24 ? 'COOLING' : 'DIAGNOSING'
          }`;
      } else if (eff === 'body-paint') {
        const t = localPhase(fx.chapter, CH['body-paint']);
        if (title) title.textContent = 'REFINISH STAGE';
        if (big) big.textContent = `${Math.round(fx.body.gloss * 100)}`;
        if (unit) unit.textContent = '% GLOSS';
        if (bar) bar.style.transform = `scaleX(${Math.max(fx.body.gloss, fx.body.colorMix * 0.4, t)})`;
        if (note) note.textContent = PAINT_PHASES[Math.min(4, Math.floor(t * 5))];
      } else if (eff === 'ceramic') {
        if (title) title.textContent = 'CERAMIC LAYER';
        if (big) big.textContent = `${Math.round(fx.ceramic.coat * 100)}`;
        if (unit) unit.textContent = '% CURED';
        if (bar) bar.style.transform = `scaleX(${fx.ceramic.coat})`;
        if (note)
          note.textContent =
            fx.ceramic.beads > 0.15
              ? `HYDROPHOBIC · CONTACT ANGLE ${Math.round(95 + fx.ceramic.beads * 15)}°`
              : 'SiO₂ BONDING';
      } else if (eff === 'detailing') {
        const t = localPhase(fx.chapter, CH.detailing);
        if (title) title.textContent = 'DETAIL STAGE';
        if (big) big.textContent = `${Math.round(fx.detail.reflect * 100)}`;
        if (unit) unit.textContent = '% REFLECTIVITY';
        if (bar) bar.style.transform = `scaleX(${Math.max(fx.detail.clean, fx.detail.polish, fx.detail.reflect)})`;
        if (note) note.textContent = DETAIL_PHASES[Math.min(4, Math.floor(t * 5))];
      } else if (eff === 'diagnostics') {
        if (title) title.textContent = 'SYSTEM SCAN';
        if (note) note.textContent = `PROGRESS ${Math.round(fx.diag.scan * 100)}%`;
        if (list) {
          Array.from(list.children).forEach((li, i) => {
            const done = i < fx.diag.checks;
            (li as HTMLElement).dataset.done = done ? '1' : '0';
          });
        }
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [enabled, mounted]);

  if (!enabled) return null;

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="pointer-events-none fixed left-1/2 bottom-9 z-30 w-[calc(100%-1.5rem)] max-w-[320px] -translate-x-1/2 select-none transition-opacity duration-500 md:left-auto md:right-8 md:top-1/2 md:bottom-auto md:w-[230px] md:max-w-none md:-translate-x-0 md:-translate-y-1/2"
      style={{ opacity: 0 }}
    >
      <div className="border border-white/12 bg-ink-900/65 p-3 backdrop-blur-md md:p-4">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ignition" />
          <span
            ref={titleRef}
            className="font-mono text-[9px] uppercase tracking-wide2 text-chalk-dim"
          >
            ENGINE SPEED
          </span>
        </div>

        <div>
          <div className="mt-3 flex items-end gap-1.5">
            <div
              ref={bigRef}
              className="font-mono text-[30px] font-light leading-none tracking-tight text-chalk tabular-nums"
            >
              0
            </div>
            <span ref={unitRef} className="mb-0.5 font-mono text-[10px] tracking-wide2 text-chalk-dim">
              RPM
            </span>
          </div>
          <div className="mt-3 h-[3px] w-full overflow-hidden bg-white/10">
            <div ref={barRef} className="h-full origin-left bg-ignition" style={{ transform: 'scaleX(0)' }} />
          </div>
        </div>

        <ul ref={listRef} className="mt-1 hidden flex-col gap-1.5">
          {DIAG_ITEMS.map((it) => (
            <li
              key={it}
              data-done="0"
              className="ce-diag-row flex items-center justify-between font-mono text-[10px] tracking-wide2"
            >
              <span>{it}</span>
              <span className="ce-diag-mark" />
            </li>
          ))}
        </ul>

        <div
          ref={noteRef}
          className="mt-3 border-t border-white/10 pt-2 font-mono text-[9px] uppercase leading-relaxed tracking-wide2 text-chalk-dim"
        >
          —
        </div>
      </div>
    </div>
  );
}

/** Local 0..1 through chapter i, matching storyFx's localProgress shape. */
function localPhase(chapterFloat: number, i: number) {
  const x = (chapterFloat - (i - 0.7)) / 1.3;
  const c = Math.min(1, Math.max(0, x));
  return c * c * (3 - 2 * c);
}
