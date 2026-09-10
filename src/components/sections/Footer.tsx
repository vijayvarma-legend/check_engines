import { Instagram } from 'lucide-react';
import { site } from '@/data/site';
import { Logo } from '@/components/ui/Logo';

export function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-ink-900 py-12">
      <div className="ce-shell flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <Logo />
          <p className="mt-3 font-mono text-[10px] uppercase tracking-wide2 text-chalk-dim">
            {site.tagline} · {site.location.label}
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-wide2 text-chalk-dim">
            Tuning in partnership with {site.tuningPartner.name}
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {site.nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="font-mono text-[10px] uppercase tracking-wide2 text-chalk-muted transition-colors hover:text-chalk"
              >
                {item.label}
              </a>
            ))}
          </div>
          <a
            href={site.social.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wide2 text-chalk-muted transition-colors hover:text-chalk"
          >
            <Instagram className="h-3.5 w-3.5" /> {site.social.instagram.handle}
          </a>
        </div>
      </div>
      <div className="ce-shell mt-8 border-t border-white/8 pt-6">
        <p className="max-w-2xl font-mono text-[9px] uppercase leading-relaxed tracking-wide2 text-chalk-dim">
          Interactive demo / prototype. Address, hours and contact details are
          placeholders and are not verified business information. &ldquo;Inspection&rdquo;
          and any analysis features are illustrative concepts, not real diagnostics.
        </p>
        <p className="mt-3 max-w-2xl font-mono text-[9px] uppercase leading-relaxed tracking-wide2 text-chalk-dim">
          3D vehicle: &ldquo;BMW M4 Competition M Package&rdquo; by SRT Perfomance,
          CC BY 4.0 — used as a stand-in and optimised for this demo. Not affiliated
          with or endorsed by BMW.
        </p>
      </div>
    </footer>
  );
}
