# Check Engines — Interactive 3D Demo

A premium, interactive 3D automotive website demo for **Check Engines**, Hyderabad
(automotive repair, servicing, diagnostics, detailing and car care).

> **This is a demo / prototype.** It prioritises visual quality, interaction and
> storytelling over backend functionality. Business details, contact information
> and the 3D vehicle model are placeholders to be replaced with verified assets.
> The "AI-Powered Vehicle Check" and "Inspection Mode" are clearly-labelled
> concept visualisations — they do not perform real vehicle diagnostics.

## Stack

- **Next.js 14** (App Router) + **TypeScript** + **React 18**
- **three.js** / **@react-three/fiber** / **@react-three/drei** for the 3D scene
- Cinematic camera moves via drei `CameraControls` (smooth damping)
- **Lenis** for inertial smooth scrolling (never blocks/snaps; reduced-motion safe)
- **Framer Motion** for UI/panel transitions
- **Tailwind CSS** for styling, **lucide-react** for icons
- **Zustand** as the bridge between scrolling DOM sections and the shared 3D scene

## Brand

Content is based on the real business (Instagram `@checkengineshyd`): a Hyderabad
styling / protection / performance shop — denting & painting, PPF & wrapping,
ceramic coating, detailing, custom exhausts and retrofits, with tuning via Venom
Performance India. The accent is the "check engine" red from their mark
(`Logo.tsx`, `tailwind.config.ts` → `ignition`). Phone / address / hours are
still placeholders (`src/data/site.ts`).

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm run start   # production
```

Node 18.18+ (developed on Node 24). First `dev`/`build` fetches the two Google
fonts (Sora, JetBrains Mono) — run once while online.

## How the experience is wired

A single persistent `<Canvas>` is fixed behind the page (`CarExperience`).
Scrolling DOM sections sit above it; transparent sections use `.ce-passthrough`
so drags fall through to the car, opaque sections opt back in.

```
CAR ──▶ COMPONENT ──▶ SERVICE ──▶ INSPECTION ──▶ BOOKING
hero     hotspots      service story   inspection mode   booking modal
```

The `useScene` store holds a `mode` + `activeService` + a camera command queue.
Sections push intent into it (hotspot click, service list, scroll observers) and
`CameraController` eases the camera toward the resolved pose. Idle turntable
rotation runs in the hero/finale and pauses on interaction.

### Key components

| Area | Files |
| --- | --- |
| 3D scene | `src/components/3d/` — `CarExperience`, `SceneContents`, `CarModel`, `CarRig`, `CameraController`, `Lighting`, `Ground`, `ServiceHotspot`, `InspectionFx`, `InspectionLabels`, `StaticCarFallback`, `SceneLoader` |
| Sections | `src/components/sections/` — `Navbar`, `Hero`, `ServiceStory`, `InspectionSection`, `AiInspectionDemo`, `BeforeAfter`, `CeramicCoating`, `WhyCheckEngines`, `LocationSection`, `FinalCTA`, `Footer`, `BookingModal`, `HotspotPanel`, `CarControlsDock` |
| UI | `src/components/ui/` — `Button`, `SectionHeading`, `Reveal`, `HudFrame` |
| Data | `src/data/` — `site`, `services`, `camera`, `inspection`, `aiConcept`, `beforeAfter` |
| State / utils | `src/lib/` — `store`, `cameraBus`, `env`, `types`, `cn`; `src/hooks/` |

All service copy, hotspot positions, camera poses and inspection sample data live
in `src/data/` — edit there, not in components.

## Performance

- Three.js bundle is `dynamic(ssr:false)` and code-split from first paint.
- Draco-compressed GLB; decoder served locally from `/public/draco`.
- Device-tier detection (`src/lib/env.ts`) scales DPR, shadow map size,
  reflection resolution and antialiasing; low-tier / no-WebGL devices get the
  static fallback poster instead of a broken canvas.
- `PerformanceMonitor` drops DPR further under sustained load; render loop pauses
  when the tab is hidden.
- `prefers-reduced-motion` disables idle rotation, scroll parallax and animated
  camera transitions.

## Replacing the car model

See `public/models/README.md`. Drop a `car.glb` into `public/models/`.

## Replacing placeholder content

- `src/data/site.ts` — brand, nav, **contact + address + hours** (all placeholder)
- `src/data/services.ts` — service names and descriptions
- Neutral "placeholder" disclaimers appear under sections where real info is
  pending; remove them once verified content is in.
