'use client';

import { useEffect, useState } from 'react';
import { Menu, X, Instagram } from 'lucide-react';
import { site } from '@/data/site';
import { useScene } from '@/lib/store';
import { cn } from '@/lib/cn';
import { Logo } from '@/components/ui/Logo';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const openBooking = useScene((s) => s.openBooking);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-500',
        scrolled
          ? 'border-b border-white/10 bg-ink-900/80 backdrop-blur-md'
          : 'border-b border-transparent bg-transparent',
      )}
    >
      <nav className="ce-shell flex h-16 items-center justify-between md:h-[72px]">
        <a href="#top" aria-label="Check Engines — home" className="transition-opacity hover:opacity-80">
          <Logo />
        </a>

        <div className="hidden items-center gap-9 md:flex">
          {site.nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="font-mono text-[11px] uppercase tracking-wide2 text-chalk-muted transition-colors hover:text-chalk"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <a
            href={site.social.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Check Engines on Instagram"
            className="hidden text-chalk-muted transition-colors hover:text-chalk md:block"
          >
            <Instagram className="h-4 w-4" />
          </a>
          <button
            onClick={() => openBooking(null)}
            className="ce-btn ce-btn-primary hidden !py-2 !text-[11px] sm:inline-flex"
          >
            {site.primaryCta.label}
          </button>
          <button
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center border border-white/15 text-chalk md:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      {/* Mobile sheet */}
      <div
        className={cn(
          'md:hidden',
          'overflow-hidden border-t border-white/10 bg-ink-900/95 backdrop-blur-lg transition-[max-height,opacity] duration-400',
          open ? 'max-h-[80vh] opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <div className="ce-shell flex flex-col gap-1 py-4">
          {site.nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="border-b border-white/5 py-3 font-mono text-[13px] uppercase tracking-wide2 text-chalk-muted"
            >
              {item.label}
            </a>
          ))}
          <button
            onClick={() => {
              setOpen(false);
              openBooking(null);
            }}
            className="ce-btn ce-btn-primary mt-4 w-full"
          >
            {site.primaryCta.label}
          </button>
          <a
            href={site.social.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex items-center justify-center gap-2 py-3 font-mono text-[11px] uppercase tracking-wide2 text-chalk-muted"
          >
            <Instagram className="h-3.5 w-3.5" /> {site.social.instagram.handle}
          </a>
        </div>
      </div>
    </header>
  );
}
