'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { useScene } from '@/lib/store';
import { services } from '@/data/services';
import { site } from '@/data/site';
import { HudFrame } from '@/components/ui/HudFrame';

const field =
  'w-full border border-white/15 bg-ink-800 px-3 py-2.5 text-[13px] text-chalk placeholder:text-chalk-dim focus:border-ignition focus:outline-none';
const labelCls =
  'font-mono text-[10px] uppercase tracking-wide2 text-chalk-dim';

export function BookingModal() {
  const open = useScene((s) => s.bookingOpen);
  const bookingService = useScene((s) => s.bookingService);
  const close = useScene((s) => s.closeBooking);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (open) setSubmitted(false);
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    if (open) window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-ink-900/80 backdrop-blur-sm"
            onClick={close}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Book a service"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="ce-corner relative w-full max-w-lg border border-white/12 bg-ink-900 p-6 sm:p-8"
          >
            <HudFrame />
            <div className="flex items-start justify-between">
              <div>
                <div className={labelCls}>Check Engines · Hyderabad</div>
                <h3 className="mt-1 text-xl font-semibold text-chalk">
                  Book a Service
                </h3>
              </div>
              <button
                aria-label="Close"
                onClick={close}
                className="flex h-8 w-8 items-center justify-center border border-white/12 text-chalk-muted hover:text-chalk"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {submitted ? (
              <div className="flex flex-col items-center gap-4 py-10 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-signal-ready text-signal-ready">
                  <Check className="h-5 w-5" />
                </span>
                <p className="text-[15px] text-chalk">
                  Request noted — this is a demo, so nothing was sent.
                </p>
                <p className="max-w-sm text-[12px] text-chalk-muted">
                  In the live site this would reach the Check Engines team along
                  with your preferred time.
                </p>
                <button onClick={close} className="ce-btn ce-btn-ghost mt-2">
                  Close
                </button>
              </div>
            ) : (
              <form
                className="mt-6 space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  setSubmitted(true);
                }}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-1.5">
                    <span className={labelCls}>Name</span>
                    <input className={field} placeholder="Your name" required />
                  </label>
                  <label className="space-y-1.5">
                    <span className={labelCls}>Phone</span>
                    <input
                      className={field}
                      placeholder={site.contact.phone}
                      inputMode="tel"
                      required
                    />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-1.5">
                    <span className={labelCls}>Vehicle</span>
                    <input className={field} placeholder="Make / model" />
                  </label>
                  <label className="space-y-1.5">
                    <span className={labelCls}>Preferred date</span>
                    <input type="date" className={field} />
                  </label>
                </div>

                <label className="space-y-1.5">
                  <span className={labelCls}>Service</span>
                  <select
                    className={field}
                    defaultValue={bookingService ?? ''}
                  >
                    <option value="">Not sure yet — advise me</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1.5">
                  <span className={labelCls}>Notes</span>
                  <textarea
                    className={`${field} min-h-[72px] resize-none`}
                    placeholder="Anything you've noticed about the car"
                  />
                </label>

                <button type="submit" className="ce-btn ce-btn-primary w-full">
                  Submit Request
                </button>
                <p className="text-center font-mono text-[9px] uppercase tracking-wide2 text-chalk-dim">
                  Demo form — no data is stored or transmitted
                </p>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
