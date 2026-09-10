'use client';

import { MapPin, Navigation, Clock, Phone } from 'lucide-react';
import { site } from '@/data/site';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { HudFrame } from '@/components/ui/HudFrame';

function StylizedMap() {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden border border-white/12 bg-ink-800">
      <svg viewBox="0 0 400 300" className="absolute inset-0 h-full w-full">
        <defs>
          <pattern id="ce-map-grid" width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M28 0H0V28" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="400" height="300" fill="url(#ce-map-grid)" />
        {/* stylised road network */}
        <path d="M-10 210 L180 150 L410 190" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="6" />
        <path d="M60 -10 L120 140 L90 320" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="5" />
        <path d="M410 60 L240 130 L150 320" fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="4" />
        <path d="M-10 90 L200 120 L410 100" fill="none" stroke="rgba(226,43,34,0.25)" strokeWidth="2" strokeDasharray="4 6" />
        {/* marker */}
        <g transform="translate(200 128)">
          <circle r="26" fill="rgba(226,43,34,0.12)" className="animate-pulse" />
          <circle r="5" fill="#E22B22" />
          <path d="M0 -4 v-26" stroke="#E22B22" strokeWidth="1.5" />
        </g>
      </svg>
      <HudFrame label="Approx · Hyderabad" />
      <div className="absolute bottom-3 right-3 font-mono text-[9px] uppercase tracking-wide2 text-chalk-dim">
        Stylised map — exact location to be added
      </div>
    </div>
  );
}

export function LocationSection() {
  return (
    <section id="contact" className="pointer-events-auto relative bg-ink-900 py-24 md:py-32">
      <div className="ce-shell">
        <SectionHeading eyebrow="Location" title="Your Car's Next Stop." />

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <Reveal>
            <StylizedMap />
          </Reveal>

          <Reveal delay={80}>
            <div className="flex h-full flex-col justify-between">
              <div>
                <div className="font-mono text-[12px] tracking-brand text-chalk">
                  CHECK&nbsp;ENGINES
                </div>
                <div className="mt-4 space-y-3 text-[14px] text-chalk-muted">
                  <p className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ignition" />
                    <span>
                      {site.location.addressLines.map((line) => (
                        <span key={line} className="block">
                          {line}
                        </span>
                      ))}
                    </span>
                  </p>
                  <p className="flex items-center gap-3">
                    <Clock className="h-4 w-4 shrink-0 text-ignition" />
                    {site.location.hours}
                  </p>
                  <p className="flex items-center gap-3">
                    <Phone className="h-4 w-4 shrink-0 text-ignition" />
                    {site.contact.phone}
                  </p>
                </div>
              </div>

              <a
                href={site.location.directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ce-btn ce-btn-ghost mt-8 self-start"
              >
                <Navigation className="h-3.5 w-3.5" />
                Get Directions
              </a>
            </div>
          </Reveal>
        </div>

        <Reveal delay={120}>
          <p className="mt-8 font-mono text-[10px] uppercase tracking-wide2 text-chalk-dim">
            Address, hours and phone number are placeholders for the demo and can
            be replaced with verified details.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
