'use client';

/**
 * Engine note for the "Engine Performance" chapter.
 *
 * Sample mode (`public/audio/engine-loop.mp3` present): the whole clip is played
 * start-to-finish when the visitor scrolls into the chapter; it fades out if
 * they leave before it ends, and re-arms once they're clear of the chapter.
 *
 * Synth mode (no file / decode fails): a procedural tone whose pitch follows the
 * RPM continuously (detuned saw oscillators + sub + soft-clipper + low-pass).
 *
 * On by default, but browsers keep the AudioContext suspended until the first
 * real interaction — `setEnabled(true)` registers one-time pointer/key/touch
 * listeners that resume it, so the first tap/scroll-click anywhere unlocks it.
 */

const SAMPLE_URL = '/audio/engine-loop.mp3';
/** Minimum gap between plays so scrolling in/out doesn't restart it constantly. */
const TRIGGER_COOLDOWN = 2;

export type EngineAudioMode = 'idle' | 'sample' | 'synth';

class EngineAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  mode: EngineAudioMode = 'idle';
  enabled = false;

  // sample path
  private buffer: AudioBuffer | null = null;
  private oneShot: AudioBufferSourceNode | null = null;
  private oneShotGain: GainNode | null = null;
  private lastTrigger = -Infinity;
  private loading = false;
  private resumeHooked = false;

  // synth path
  private shaper: WaveShaperNode | null = null;
  private oscs: OscillatorNode[] = [];
  private lfo: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;

  private curve(amount: number) {
    const n = 256;
    const c = new Float32Array(n);
    const k = amount * 40;
    for (let i = 0; i < n; i++) {
      const x = (i / (n - 1)) * 2 - 1;
      c[i] = ((1 + k) * x) / (1 + k * Math.abs(x));
    }
    return c;
  }

  private ensureContext() {
    if (this.ctx) return this.ctx;
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    const ctx = new Ctor();
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = 0.9;
    this.filter = ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.value = 6000;
    this.filter.Q.value = 1;
    this.filter.connect(this.master).connect(ctx.destination);
    return ctx;
  }

  /** Resume on the first real user interaction (scroll click, tap, key). */
  private hookResume() {
    if (this.resumeHooked || typeof window === 'undefined') return;
    this.resumeHooked = true;
    const go = () => {
      this.ctx?.resume();
      if (this.ctx?.state === 'running') {
        window.removeEventListener('pointerdown', go);
        window.removeEventListener('keydown', go);
        window.removeEventListener('touchstart', go);
      }
    };
    window.addEventListener('pointerdown', go, { passive: true });
    window.addEventListener('keydown', go);
    window.addEventListener('touchstart', go, { passive: true });
  }

  private startSynth() {
    const ctx = this.ctx;
    if (!ctx || this.oscs.length) return;
    this.master!.gain.value = 0;
    this.filter!.frequency.value = 1200;
    this.shaper = ctx.createWaveShaper();
    this.shaper.curve = this.curve(0.2);
    this.shaper.oversample = '2x';
    this.shaper.connect(this.filter!);

    const specs: [OscillatorType, number, number][] = [
      ['sawtooth', 1, 0.5],
      ['sawtooth', 2.01, 0.22],
      ['sine', 0.5, 0.6],
    ];
    specs.forEach(([type, mult, g]) => {
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.value = 40 * mult;
      const gain = ctx.createGain();
      gain.gain.value = g;
      osc.connect(gain).connect(this.shaper!);
      osc.start();
      (osc as unknown as { _mult: number })._mult = mult;
      this.oscs.push(osc);
    });

    this.lfo = ctx.createOscillator();
    this.lfo.frequency.value = 7;
    this.lfoGain = ctx.createGain();
    this.lfoGain.gain.value = 0;
    this.lfo.connect(this.lfoGain).connect(this.oscs[0].frequency);
    this.lfo.start();
    this.mode = 'synth';
  }

  private async load() {
    if (this.mode !== 'idle' || this.loading) return;
    this.loading = true;
    try {
      const res = await fetch(SAMPLE_URL);
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.arrayBuffer();
      this.buffer = await this.ctx!.decodeAudioData(data);
      this.mode = 'sample';
    } catch {
      this.startSynth();
    } finally {
      this.loading = false;
    }
  }

  setEnabled(on: boolean) {
    this.enabled = on;
    if (on) {
      const ctx = this.ensureContext();
      if (!ctx) return;
      ctx.resume();
      this.hookResume();
      if (this.mode === 'idle') this.load();
    } else {
      this.release(0.15);
      if (this.master && this.ctx)
        this.master.gain.setTargetAtTime(this.mode === 'synth' ? 0 : 0.9, this.ctx.currentTime, 0.1);
    }
  }

  /** Play the whole clip — call on the rising edge of "entered the engine chapter". */
  trigger(intensity = 1) {
    const ctx = this.ctx;
    if (!ctx || !this.enabled || this.mode !== 'sample' || !this.buffer) return;
    if (ctx.currentTime - this.lastTrigger < TRIGGER_COOLDOWN) return;
    ctx.resume();
    try {
      this.oneShot?.stop();
    } catch {}
    const now = ctx.currentTime;
    this.lastTrigger = now;
    const g = ctx.createGain();
    const peak = 0.55 + 0.45 * Math.max(0, Math.min(1, intensity));
    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(peak, now + 0.06);
    const src = ctx.createBufferSource();
    src.buffer = this.buffer;
    src.connect(g).connect(this.filter!);
    src.start(now);
    src.onended = () => {
      g.disconnect();
      if (this.oneShot === src) {
        this.oneShot = null;
        this.oneShotGain = null;
      }
    };
    this.oneShot = src;
    this.oneShotGain = g;
  }

  /** Fade out the current play (e.g. the visitor scrolled off the chapter). */
  release(fade = 0.8) {
    const ctx = this.ctx;
    const src = this.oneShot;
    const g = this.oneShotGain;
    if (!ctx || !src || !g) return;
    const now = ctx.currentTime;
    g.gain.cancelScheduledValues(now);
    g.gain.setValueAtTime(g.gain.value, now);
    g.gain.linearRampToValueAtTime(0.0001, now + fade);
    try {
      src.stop(now + fade + 0.05);
    } catch {}
    this.oneShot = null;
    this.oneShotGain = null;
  }

  /** Continuous synth update — call every frame while on the engine chapter. */
  update(rpm: number, load: number, level: number) {
    if (!this.ctx || !this.enabled || this.mode !== 'synth') return;
    const now = this.ctx.currentTime;
    const f = Math.max(18, (rpm / 60) * 2.4);
    this.oscs.forEach((osc) => {
      const mult = (osc as unknown as { _mult: number })._mult;
      osc.frequency.setTargetAtTime(f * mult, now, 0.05);
    });
    if (this.filter)
      this.filter.frequency.setTargetAtTime(220 + (rpm / 7000) * 2600 + load * 1400, now, 0.06);
    if (this.shaper) this.shaper.curve = this.curve(0.15 + load * 0.5);
    if (this.lfoGain) this.lfoGain.gain.setTargetAtTime(f * 0.03 * (1 - load), now, 0.1);
    this.master?.gain.setTargetAtTime(Math.max(0, Math.min(0.22, level)), now, 0.08);
  }

  dispose() {
    this.oscs.forEach((o) => o.stop());
    this.lfo?.stop();
    try {
      this.oneShot?.stop();
    } catch {}
    this.ctx?.close();
    this.ctx = null;
    this.mode = 'idle';
    this.enabled = false;
    this.oscs = [];
    this.oneShot = null;
    this.buffer = null;
  }
}

export const engineAudio = new EngineAudio();

if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  (window as unknown as { __engineAudio?: unknown }).__engineAudio = engineAudio;
}
