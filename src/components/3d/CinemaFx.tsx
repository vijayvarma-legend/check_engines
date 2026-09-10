'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { storyFx, CH } from '@/lib/storyFx';

/**
 * Every scroll-cinema visual effect that lives in 3D, gathered into one group
 * that rides inside `CarRig` so it tracks the car's heading. Each sub-effect
 * reads the shared `storyFx` bus and costs ~nothing unless its chapter is
 * engaged. Car-local frame: front = -Z, rear = +Z, right = +X.
 */
interface Props {
  quality: 'low' | 'mid' | 'high';
  reducedMotion: boolean;
}

function softSprite(r: number, g: number, b: number) {
  const s = 64;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const ctx = c.getContext('2d')!;
  const grd = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  grd.addColorStop(0, `rgba(${r},${g},${b},1)`);
  grd.addColorStop(0.4, `rgba(${r},${g},${b},0.45)`);
  grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, s, s);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* ------------------------------------------------------------------ *
 * 01 · Engine — rear heat-haze shimmer + exhaust glow
 * ------------------------------------------------------------------ */
function EngineHeatFx({ reducedMotion }: { reducedMotion: boolean }) {
  const haze = useRef<THREE.Mesh>(null);
  const glowL = useRef<THREE.Mesh>(null);
  const glowR = useRef<THREE.Mesh>(null);
  const tex = useMemo(() => softSprite(255, 150, 80), []);

  useFrame((state) => {
    const h = storyFx.engine.heat;
    const on = storyFx.engaged[CH.engine];
    const t = state.clock.elapsedTime;
    if (haze.current) {
      const m = haze.current.material as THREE.MeshBasicMaterial;
      const base = on ? h * 0.45 : 0;
      m.opacity = reducedMotion ? base : base * (0.8 + Math.sin(t * 11) * 0.2);
      haze.current.visible = m.opacity > 0.01;
      if (!reducedMotion) haze.current.scale.set(1 + Math.sin(t * 6) * 0.06, 1 + Math.sin(t * 8) * 0.1, 1);
    }
    [glowL.current, glowR.current].forEach((mesh, i) => {
      if (!mesh) return;
      const m = mesh.material as THREE.MeshBasicMaterial;
      const pulse = 0.55 + 0.45 * Math.sin(t * (7 + storyFx.engine.load * 22) + i);
      m.opacity = on ? h * 0.6 * pulse : 0;
      mesh.visible = m.opacity > 0.01;
    });
  });

  return (
    <group position={[0, 0, 2.2]}>
      <mesh ref={haze} position={[0, 0.4, 0]}>
        <planeGeometry args={[1.7, 1.0]} />
        <meshBasicMaterial map={tex} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} color="#ff7b3c" />
      </mesh>
      <mesh ref={glowL} position={[-0.42, 0.16, 0.05]}>
        <circleGeometry args={[0.1, 20]} />
        <meshBasicMaterial map={tex} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} color="#ff9a4a" />
      </mesh>
      <mesh ref={glowR} position={[0.42, 0.16, 0.05]}>
        <circleGeometry args={[0.1, 20]} />
        <meshBasicMaterial map={tex} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} color="#ff9a4a" />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ *
 * 02 · AC — cabin airflow streams from the vents
 * ------------------------------------------------------------------ */
function AirflowFx({ quality, reducedMotion }: { quality: Props['quality']; reducedMotion: boolean }) {
  const pts = useRef<THREE.Points>(null);
  const count = quality === 'high' ? 110 : quality === 'mid' ? 64 : 34;
  const tex = useMemo(() => softSprite(205, 234, 255), []);

  const { positions, seeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 0.9;
      positions[i * 3 + 1] = 0.72 + Math.random() * 0.34;
      positions[i * 3 + 2] = -0.7 + Math.random() * 1.3;
      seeds[i * 2] = Math.random();
      seeds[i * 2 + 1] = Math.random();
    }
    return { positions, seeds };
  }, [count]);

  useFrame((state, delta) => {
    const p = pts.current;
    if (!p) return;
    const flow = storyFx.ac.airflow;
    const mat = p.material as THREE.PointsMaterial;
    mat.opacity = flow * 0.5;
    p.visible = mat.opacity > 0.01;
    if (!p.visible || reducedMotion) return;
    const arr = p.geometry.attributes.position.array as Float32Array;
    const dt = Math.min(delta, 0.05);
    const et = state.clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      const s0 = seeds[i * 2];
      arr[i * 3 + 2] += dt * (0.45 + s0 * 0.55);
      arr[i * 3 + 1] += dt * (0.04 + Math.sin(et * 1.8 + s0 * 9) * 0.05);
      arr[i * 3 + 0] += dt * Math.sin(et * 1.3 + s0 * 12) * 0.05;
      if (arr[i * 3 + 2] > 0.75) {
        arr[i * 3 + 2] = -0.75 - Math.random() * 0.2;
        arr[i * 3 + 1] = 0.7 + Math.random() * 0.22;
        arr[i * 3 + 0] = (Math.random() - 0.5) * 0.55;
      }
    }
    p.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pts} position={[0.05, 0, -0.25]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={tex}
        size={quality === 'high' ? 0.17 : 0.2}
        sizeAttenuation
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        color="#cdebff"
      />
    </points>
  );
}

/* ------------------------------------------------------------------ *
 * 03 · Denting & Painting — surface scratches + refinish light sweep
 * ------------------------------------------------------------------ */
function BodyWorkFx() {
  const scratchGroup = useRef<THREE.Group>(null);
  const sweep = useRef<THREE.Mesh>(null);
  const scratches = useMemo(
    () => [
      { pos: [1.03, 0.66, -0.15] as const, rot: 0.45, len: 0.46, delay: 0 },
      { pos: [1.0, 0.5, 0.42] as const, rot: -0.28, len: 0.32, delay: 0.18 },
      { pos: [1.05, 0.78, 0.12] as const, rot: 0.16, len: 0.24, delay: 0.34 },
      { pos: [0.98, 0.58, 0.78] as const, rot: -0.5, len: 0.2, delay: 0.5 },
    ],
    [],
  );

  useFrame(() => {
    const dmg = storyFx.body.damage;
    if (scratchGroup.current) {
      scratchGroup.current.visible = dmg > 0.01;
      scratchGroup.current.children.forEach((child) => {
        const mesh = child as THREE.Mesh;
        const mat = mesh.material as THREE.MeshBasicMaterial;
        const d = (mesh.userData.delay as number) ?? 0;
        mat.opacity = THREE.MathUtils.clamp((dmg - d) / (1 - d), 0, 1) * 0.8;
      });
    }
    if (sweep.current) {
      const s = storyFx.body.sweep;
      const active = !Number.isNaN(s);
      sweep.current.visible = active;
      if (active) {
        sweep.current.position.x = s * 1.9;
        (sweep.current.material as THREE.MeshBasicMaterial).opacity = (1 - Math.abs(s)) * 0.6 + 0.08;
      }
    }
  });

  return (
    <group>
      <group ref={scratchGroup}>
        {scratches.map((s, i) => (
          <mesh key={i} position={s.pos} rotation={[0, -Math.PI / 2, s.rot]} userData={{ delay: s.delay }}>
            <planeGeometry args={[s.len, 0.01]} />
            <meshBasicMaterial color="#d6dee8" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
        ))}
      </group>
      <mesh ref={sweep} position={[0, 0.7, 0]}>
        <planeGeometry args={[0.12, 2.6]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ *
 * 04 · Ceramic — coating sheen sweep + hydrophobic beads
 * ------------------------------------------------------------------ */
function CeramicFx({ quality }: { quality: Props['quality'] }) {
  const sheen = useRef<THREE.Mesh>(null);
  const beads = useRef<THREE.InstancedMesh>(null);
  const count = quality === 'high' ? 40 : quality === 'mid' ? 24 : 12;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const phases = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * 1.15,
        z: -1.85 + Math.random() * 1.25,
        t: Math.random(),
        speed: 0.3 + Math.random() * 0.45,
        size: 0.012 + Math.random() * 0.016,
      })),
    [count],
  );

  useFrame((_, delta) => {
    const coat = storyFx.ceramic.coat;
    const flow = storyFx.ceramic.beads;
    const on = storyFx.engaged[CH.ceramic];

    if (sheen.current) {
      const m = sheen.current.material as THREE.MeshBasicMaterial;
      m.opacity = on ? coat * 0.28 * (1 - Math.max(0, storyFx.ceramic.coat - 0.85) / 0.15) : 0;
      sheen.current.visible = m.opacity > 0.01;
      sheen.current.position.z = -1.9 + coat * 2.6;
    }

    const inst = beads.current;
    if (inst) {
      inst.visible = flow > 0.02;
      const dt = Math.min(delta, 0.05);
      for (let i = 0; i < count; i++) {
        const p = phases[i];
        p.t += dt * p.speed * (0.35 + flow);
        if (p.t > 1) {
          p.t -= 1;
          p.x = (Math.random() - 0.5) * 1.15;
          p.z = -1.85 + Math.random() * 1.25;
        }
        // hood/roof crown height, then the bead rolls down the slope and off
        const roll = Math.max(0, p.t - 0.32) / 0.68;
        // hood sits lower (~0.88) than the roof (~1.05); taper toward the edges
        const crown = (p.z < -0.9 ? 0.9 : 1.06) - Math.abs(p.x) * 0.12;
        const y = crown - roll * roll * 1.15;
        const x = p.x + Math.sign(p.x || 1) * roll * 0.55;
        const appear = Math.min(p.t / 0.07, 1) * (1 - Math.max(0, p.t - 0.9) / 0.1);
        dummy.position.set(x, Math.max(y, 0.06), p.z);
        dummy.scale.setScalar(Math.max(p.size * appear * (0.8 + flow), 0.0001));
        dummy.updateMatrix();
        inst.setMatrixAt(i, dummy.matrix);
      }
      inst.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      <mesh ref={sheen} rotation={[-Math.PI / 2, 0, 0]} position={[0, 1.04, -0.3]}>
        <planeGeometry args={[1.9, 0.7]} />
        <meshBasicMaterial color="#a9dcff" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <instancedMesh ref={beads} args={[undefined as never, undefined as never, count]} frustumCulled={false}>
        <sphereGeometry args={[1, 12, 10]} />
        <meshStandardMaterial color="#f2f9ff" roughness={0.02} metalness={0} envMapIntensity={2.6} />
      </instancedMesh>
    </group>
  );
}

/* ------------------------------------------------------------------ *
 * 06 · Diagnostics — scan sweep + area confirmations
 * ------------------------------------------------------------------ */
function DiagnosticsFx() {
  const plane = useRef<THREE.Mesh>(null);
  const bars = useRef<THREE.Group>(null);
  const marks = useRef<THREE.Group>(null);
  const anchors = useMemo(
    () =>
      [
        [0, 0.7, -1.8],
        [0.95, 0.35, -1.1],
        [0.2, 0.95, -0.1],
        [-1.0, 0.68, 0.3],
        [0.1, 0.55, 1.9],
      ] as [number, number, number][],
    [],
  );

  useFrame((state) => {
    const on = storyFx.engaged[CH.diagnostics];
    const scan = storyFx.diag.scan;
    const z = storyFx.diag.scanZ;
    const live = on && scan > 0.001 && scan < 0.999;

    if (plane.current) {
      plane.current.visible = live;
      plane.current.position.z = z;
      (plane.current.material as THREE.MeshBasicMaterial).opacity = live
        ? 0.14 + Math.sin(state.clock.elapsedTime * 6) * 0.04
        : 0;
    }
    if (bars.current) {
      bars.current.visible = live;
      bars.current.position.z = z;
      const o = live ? 0.7 + Math.sin(state.clock.elapsedTime * 9) * 0.25 : 0;
      bars.current.children.forEach((c) => {
        ((c as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = o;
      });
    }
    if (marks.current) {
      marks.current.visible = on;
      marks.current.children.forEach((child, i) => {
        const passed = z > anchors[i][2];
        const near = Math.abs(z - anchors[i][2]) < 0.55;
        const mesh = child as THREE.Mesh;
        const m = mesh.material as THREE.MeshBasicMaterial;
        const target = passed ? 0.45 : near ? 0.9 : 0;
        m.opacity += (target - m.opacity) * 0.18;
        const s = near ? 1.5 : 1;
        mesh.scale.x += (s - mesh.scale.x) * 0.15;
        mesh.scale.y += (s - mesh.scale.y) * 0.15;
      });
    }
  });

  return (
    <group>
      <mesh ref={plane}>
        <planeGeometry args={[3.4, 2.3]} />
        <meshBasicMaterial color="#63d8ff" transparent opacity={0} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <group ref={bars}>
        {[1.15, -1.15].map((y) => (
          <mesh key={y} position={[0, y, 0]}>
            <planeGeometry args={[3.4, 0.03]} />
            <meshBasicMaterial color="#e2fbff" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
        ))}
        {[1.7, -1.7].map((x) => (
          <mesh key={x} position={[x, 0, 0]}>
            <planeGeometry args={[0.03, 2.3]} />
            <meshBasicMaterial color="#e2fbff" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
        ))}
      </group>
      <group ref={marks}>
        {anchors.map((a, i) => (
          <mesh key={i} position={a} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.11, 0.14, 22]} />
            <meshBasicMaterial color="#8fe8ff" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ *
 * Retrofits — headlight throw, cabin ambient glow, welcome pulse
 * ------------------------------------------------------------------ */
function RetrofitFx() {
  const head = useRef<THREE.PointLight>(null);
  const cabin = useRef<THREE.PointLight>(null);
  const drl = useRef<THREE.Mesh>(null);
  const tex = useMemo(() => softSprite(150, 200, 255), []);

  useFrame((state) => {
    const r = storyFx.retrofit;
    const t = state.clock.elapsedTime;
    const welcome = 1 + r.welcome * 2.2;
    if (head.current) head.current.intensity = r.lights * 6 * welcome;
    if (cabin.current) cabin.current.intensity = r.ambient * 3.0;
    if (drl.current) {
      const m = drl.current.material as THREE.MeshBasicMaterial;
      m.opacity = r.lights * (0.22 + 0.06 * Math.sin(t * 2)) * welcome;
      drl.current.visible = m.opacity > 0.01;
    }
  });

  return (
    <group>
      {/* headlight throw — a cool key just ahead of the nose */}
      <pointLight ref={head} position={[0, 0.55, -2.5]} color="#cfe0ff" intensity={0} distance={7} decay={2} />
      {/* interior ambient */}
      <pointLight ref={cabin} position={[0, 0.8, 0]} color="#ffb066" intensity={0} distance={3.2} decay={2} />
      {/* DRL signature glow across the nose */}
      <mesh ref={drl} position={[0, 0.74, -1.98]}>
        <planeGeometry args={[1.5, 0.32]} />
        <meshBasicMaterial map={tex} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} color="#a9c8ff" />
      </mesh>
    </group>
  );
}

export function CinemaFx({ quality, reducedMotion }: Props) {
  return (
    <group>
      <EngineHeatFx reducedMotion={reducedMotion} />
      <RetrofitFx />
      <AirflowFx quality={quality} reducedMotion={reducedMotion} />
      <BodyWorkFx />
      <CeramicFx quality={quality} />
      <DiagnosticsFx />
    </group>
  );
}
