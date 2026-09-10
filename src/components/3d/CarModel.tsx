'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useScene } from '@/lib/store';
import { storyFx, BASE_PAINT } from '@/lib/storyFx';

export const CAR_MODEL_URL = '/models/car.glb';
const DRACO_PATH = '/draco/';

type MatRole = 'paint' | 'glass' | 'chrome' | 'tire' | 'dark' | 'hide';

/**
 * Model-specific tuning. Any suitably-licensed vehicle GLB can be dropped in at
 * `public/models/car.glb`; the component auto-centres, grounds and scales it.
 */
const MODEL = {
  targetLength: 4.72,
  yaw: Math.PI,
  overrides: {
    zx1: 'paint',
    body15: 'paint',
    white4: 'paint',
    livery: 'hide',
  } as Record<string, MatRole>,
} as const;

function roleFor(name: string): MatRole | null {
  for (const key in MODEL.overrides) {
    if (name.includes(key)) return MODEL.overrides[key];
  }
  return null;
}

interface CarModelProps {
  quality: 'low' | 'mid' | 'high';
}

const WHEEL_NAMES = [
  'wheel_fl', 'wheel_fr', 'wheel_rl', 'wheel_rr',
  'WheelFrontL', 'WheelFrontR', 'WheelRearL', 'WheelRearR',
];

const GRIME = new THREE.Color('#413d35');
const tmpColor = new THREE.Color();
const desired = new THREE.Color();

export function CarModel({ quality }: CarModelProps) {
  const { scene } = useGLTF(CAR_MODEL_URL, DRACO_PATH);
  const inspection = useScene((s) => s.inspection);
  const interacting = useScene((s) => s.interacting);
  const mode = useScene((s) => s.mode);

  const model = useMemo(() => scene.clone(true), [scene]);

  const norm = useMemo(() => {
    model.updateWorldMatrix(true, true);
    const box = new THREE.Box3().setFromObject(model, true);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const length = Math.max(size.x, size.z, 0.001);
    const scale = MODEL.targetLength / length;
    return {
      scale,
      position: [-center.x * scale, -box.min.y * scale, -center.z * scale] as [number, number, number],
    };
  }, [model]);

  const wheels = useMemo(() => {
    const found: THREE.Object3D[] = [];
    model.traverse((o) => {
      if (WHEEL_NAMES.some((n) => o.name === n)) found.push(o);
    });
    return found;
  }, [model]);

  const bodyMats = useRef<THREE.MeshPhysicalMaterial[]>([]);
  const glassMats = useRef<THREE.MeshStandardMaterial[]>([]);
  const engineMeshes = useRef<THREE.Mesh[]>([]);
  const engineMats = useRef<THREE.MeshStandardMaterial[]>([]);
  /** Exterior lamp materials (headlight / DRL / tail) for the retrofit chapter. */
  const lightMats = useRef<{ m: THREE.MeshStandardMaterial; hex: string; peak: number }[]>([]);
  /** Per-material rest state so effects can be applied relative to it. */
  const rest = useRef(new WeakMap<THREE.Material, { rough: number; env: number }>());

  useEffect(() => {
    bodyMats.current = [];
    glassMats.current = [];
    engineMeshes.current = [];
    engineMats.current = [];
    lightMats.current = [];
    const seen = new Set<THREE.Material>();

    model.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return;
      const mesh = child as THREE.Mesh;
      const meshName = (mesh.name || '').toLowerCase();
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      const matNames = mats.map((m) => (m?.name || '').toLowerCase());

      const hideByName = /plate|licen[sc]e|khronos/;
      if (
        hideByName.test(meshName) ||
        matNames.some((n) => roleFor(n) === 'hide' || hideByName.test(n))
      ) {
        mesh.visible = false;
        return;
      }

      const isEngine = matNames.some((n) => /engine/.test(n));
      if (isEngine) {
        mesh.visible = false;
        engineMeshes.current.push(mesh);
      }

      mesh.castShadow = quality !== 'low' && !isEngine;
      mesh.receiveShadow = quality !== 'low';
      mesh.frustumCulled = true;

      mats.forEach((m) => {
        if (!m || seen.has(m)) return;
        seen.add(m);
        const std = m as THREE.MeshPhysicalMaterial;
        std.envMapIntensity = 1.2;

        if (isEngine) {
          std.color = new THREE.Color('#26282c');
          std.metalness = 0.9;
          std.roughness = 0.4;
          std.transparent = true;
          std.opacity = 0;
          std.depthWrite = false;
          std.emissive = new THREE.Color('#c8340a');
          std.emissiveIntensity = 0;
          engineMats.current.push(std);
          return;
        }

        const matName = (m.name || '').toLowerCase();
        const name = matName || meshName;

        // Exterior lamps — kept dark until the retrofit chapter lights them.
        if (/headlight|redlight|taillight|(^|[^a-z])led\d|drl/.test(name)) {
          const isTail = /red|tail/.test(name);
          std.emissive = new THREE.Color(isTail ? '#ff2a18' : '#e5eeff');
          std.emissiveIntensity = 0;
          std.toneMapped = false;
          lightMats.current.push({
            m: std as THREE.MeshStandardMaterial,
            hex: isTail ? '#ff2a18' : '#e5eeff',
            peak: isTail ? 1.1 : 1.7,
          });
        }

        let role = roleFor(matName);
        if (!role) {
          if (/glass|window|windshield|windscreen/.test(name)) role = 'glass';
          else if (/chrome|(^|[^a-z])rim|trim|mirror/.test(name)) role = 'chrome';
          else if (/tire|tyre|rubber/.test(name)) role = 'tire';
          else if (/interior|seat|dash|floor|cage|steering|carpet/.test(name)) role = 'dark';
          else if (
            /paint|carpaint|panel sides/.test(matName) ||
            (meshName.startsWith('body') && meshName.includes('color'))
          )
            role = 'paint';
        }

        switch (role) {
          case 'paint':
            std.map = null;
            std.color = BASE_PAINT.clone();
            std.metalness = 1;
            std.roughness = 0.28;
            if ('clearcoat' in std) {
              std.clearcoat = 1;
              std.clearcoatRoughness = 0.06;
            }
            if ('iridescence' in std) std.iridescence = 0;
            std.envMapIntensity = 1.95;
            std.needsUpdate = true;
            rest.current.set(std, { rough: 0.28, env: 1.95 });
            bodyMats.current.push(std);
            break;
          case 'glass':
            if ('transmission' in std) std.transmission = 0;
            std.transparent = true;
            std.opacity = 0.3;
            std.roughness = 0.05;
            std.metalness = 0.1;
            std.color = new THREE.Color('#0d1016');
            glassMats.current.push(std as THREE.MeshStandardMaterial);
            break;
          case 'chrome':
            std.metalness = 1;
            std.roughness = 0.2;
            std.color = new THREE.Color('#c2c6cd');
            break;
          case 'tire':
            std.map = null;
            std.color = new THREE.Color('#141518');
            std.roughness = 0.85;
            std.metalness = 0;
            break;
          case 'dark':
            std.map = null;
            std.color = new THREE.Color('#171a1e');
            std.roughness = 0.7;
            std.metalness = 0;
            break;
        }
      });
    });
  }, [model, quality]);

  useFrame((state, delta) => {
    const t = Math.min(1, delta * 3);
    const fx = storyFx;
    const painting = fx.active;

    // ---- Body paint: colour, gloss, damage, dirt --------------------
    desired.copy(BASE_PAINT);
    if (fx.body.colorMix > 0.001) desired.lerp(fx.body.color, fx.body.colorMix);
    if (fx.surface.grime > 0.001) desired.lerp(tmpColor.copy(GRIME), fx.surface.grime * 0.42);

    const targetEmissive = inspection ? 0.14 : 0;
    bodyMats.current.forEach((m) => {
      m.color.lerp(desired, painting ? t : t * 0.6);
      const r = rest.current.get(m);
      if (r) {
        m.roughness = THREE.MathUtils.clamp(
          THREE.MathUtils.lerp(m.roughness, r.rough + fx.surface.roughAdd, t),
          0.03, 0.95,
        );
        m.envMapIntensity = THREE.MathUtils.lerp(
          m.envMapIntensity,
          THREE.MathUtils.clamp(r.env * fx.surface.envMul, 0.15, 4),
          t,
        );
      }
      if ('clearcoatRoughness' in m) {
        m.clearcoatRoughness = THREE.MathUtils.lerp(
          m.clearcoatRoughness,
          THREE.MathUtils.clamp(fx.surface.clearcoatRough, 0.02, 0.6),
          t,
        );
      }
      if (m.emissive) {
        m.emissive.lerp(new THREE.Color('#2b6cff'), t);
        m.emissiveIntensity = THREE.MathUtils.lerp(m.emissiveIntensity ?? 0, targetEmissive, t);
      }
    });

    // ---- AC: cool tint / frost on the cabin glass ------------------
    const chill = fx.ac.chill;
    glassMats.current.forEach((m) => {
      tmpColor.set('#0d1016').lerp(new THREE.Color('#0c1a26'), chill);
      m.color.lerp(tmpColor, t);
      m.roughness = THREE.MathUtils.lerp(m.roughness, 0.05 + chill * 0.14, t);
    });

    // ---- Engine reveal + heartbeat -------------------------------
    const reveal = fx.engine.reveal;
    const show = reveal > 0.01;
    engineMeshes.current.forEach((mesh) => (mesh.visible = show));
    if (show) {
      const beat = 0.5 + 0.5 * Math.sin(state.clock.elapsedTime * (4 + (fx.engine.rpm / 7000) * 30));
      engineMats.current.forEach((m) => {
        m.opacity = reveal;
        m.emissiveIntensity = reveal * (0.08 + beat * 0.32 * fx.engine.load);
      });
    } else {
      engineMats.current.forEach((m) => (m.opacity = 0));
    }

    // ---- Retrofits: exterior lamps come on ----------------------
    const lights = fx.retrofit.lights;
    const welcome = 1 + fx.retrofit.welcome * 1.8;
    lightMats.current.forEach(({ m, peak }) => {
      m.emissiveIntensity = THREE.MathUtils.lerp(
        m.emissiveIntensity ?? 0,
        lights * peak * welcome,
        t,
      );
    });

    // ---- Idle wheel roll (hero / finale only) ---------------------
    const rolling = (mode === 'hero' || mode === 'finale') && !interacting && !inspection;
    if (rolling && wheels.length) {
      wheels.forEach((w) => {
        w.rotation.x -= delta * 0.3;
      });
    }
  });

  return (
    <group rotation={[0, MODEL.yaw, 0]}>
      <group position={norm.position} scale={norm.scale}>
        <primitive object={model} />
      </group>
    </group>
  );
}

useGLTF.preload(CAR_MODEL_URL, DRACO_PATH);
