# Vehicle model

`car.glb` is the centrepiece 3D model. To use a different vehicle, drop a
GLB/glTF file here named exactly `car.glb`.

## Guidelines for a replacement model

- **Format:** `.glb`, glTF 2.0, Y-up, roughly real-world scale (car ~4–4.8 m long),
  sitting on the ground plane (wheels near `y = 0`), facing the same way as the
  current model.
- **Compression:** Draco is supported out of the box (decoder in `/public/draco`).
  Meshopt also works if the file is encoded with it.
- **Materials:** name the paint material/mesh with `body` / `paint` and glass with
  `glass` / `window` so `CarModel.tsx` can apply the car-paint and glass looks
  automatically. Otherwise it falls back to sensible defaults.
- **Wheels:** name wheel nodes `wheel_fl`, `wheel_fr`, `wheel_rl`, `wheel_rr` for
  the idle wheel-spin. Optional.
- **Budget:** aim for < 150k triangles and textures ≤ 2K for smooth mobile
  performance.

## Current placeholder

The bundled `car.glb` is **"BMW M4 Competition M Package"** by SRT Perfomance
(via Sketchfab, **CC BY 4.0**), Draco + WebP optimised with `@gltf-transform/cli`
from ~22.7 MB down to ~2.0 MB. It's a stand-in — attribution is shown in the site
footer, and the site is not affiliated with BMW. Replace it before public use and
update/remove the footer credit.

Reproduce the optimisation:

```
npx @gltf-transform/cli optimize bmw_m4.glb car.glb \
  --compress draco --texture-compress webp --texture-size 2048 \
  --palette false --simplify false --flatten false --join false
```

`--palette false` matters: it keeps material names so `CarModel.tsx` can retint
the body, glass and wheels.

### Per-model tuning in `CarModel.tsx`

`MODEL.yaw` orients the front to -Z. `MODEL.overrides` maps material-name
substrings to a role (`paint` / `glass` / `chrome` / `tire` / `dark` / `hide`)
for materials the generic name-matcher can't classify — for the BMW this retints
the body shell (`zx1`, `body15`, `white4`) and hides the M-stripe livery and the
engine-bay mesh (the demo is exterior-only).

If `car.glb` fails to load or the device has no working WebGL, the site shows a
styled static fallback instead of breaking.
