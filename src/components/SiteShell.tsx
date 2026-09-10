'use client';

import dynamic from 'next/dynamic';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import { useLenis } from '@/hooks/useLenis';
import { SceneLoader } from '@/components/3d/SceneLoader';
import { Navbar } from '@/components/sections/Navbar';
import { Hero } from '@/components/sections/Hero';
import { ServiceCinema } from '@/components/sections/ServiceCinema';
import { InspectionSection } from '@/components/sections/InspectionSection';
import { CeramicCoating } from '@/components/sections/CeramicCoating';
import { WorkSection } from '@/components/sections/WorkSection';
import { WhyCheckEngines } from '@/components/sections/WhyCheckEngines';
import { LocationSection } from '@/components/sections/LocationSection';
import { FinalCTA } from '@/components/sections/FinalCTA';
import { Footer } from '@/components/sections/Footer';
import { CarControlsDock } from '@/components/sections/CarControlsDock';
import { CinemaHud } from '@/components/sections/CinemaHud';
import { SoundToggle } from '@/components/sections/SoundToggle';
import { BookingModal } from '@/components/sections/BookingModal';

// The 3D stage is client-only and code-split so the marketing content and
// first paint never wait on the Three.js bundle.
const CarExperience = dynamic(
  () => import('@/components/3d/CarExperience').then((m) => m.CarExperience),
  { ssr: false, loading: () => <div className="fixed inset-0 z-0 bg-ink-900" /> },
);

export function SiteShell() {
  useLenis();
  useScrollProgress();

  return (
    <>
      <CarExperience />
      <SceneLoader />
      <Navbar />

      {/*
        `main` is click-transparent so drags land on the 3D canvas through the
        gaps in the layout. Opaque sections opt back in with `pointer-events-auto`;
        transparent sections re-enable only their own controls via `.ce-passthrough`.
      */}
      <main className="pointer-events-none relative z-10">
        <Hero />
        <ServiceCinema />
        <InspectionSection />
        <CeramicCoating />
        <WorkSection />
        <WhyCheckEngines />
        <LocationSection />
        <FinalCTA />
      </main>

      <div className="pointer-events-auto relative z-10">
        <Footer />
      </div>

      <CarControlsDock />
      <CinemaHud />
      <SoundToggle />
      <BookingModal />
    </>
  );
}
