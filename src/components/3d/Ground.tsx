'use client';

import { ContactShadows, MeshReflectorMaterial } from '@react-three/drei';

interface GroundProps {
  quality: 'low' | 'mid' | 'high';
}

/** Dark studio floor with a restrained reflection and a soft contact shadow. */
export function Ground({ quality }: GroundProps) {
  return (
    <group position={[0, -0.001, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        {quality === 'low' ? (
          <meshStandardMaterial color="#0a0b0d" roughness={0.9} metalness={0} />
        ) : (
          <MeshReflectorMaterial
            resolution={quality === 'high' ? 1024 : 512}
            mirror={0.34}
            mixBlur={8}
            mixStrength={1.1}
            blur={[400, 120]}
            roughness={0.85}
            depthScale={1.1}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            color="#0a0b0d"
            metalness={0.55}
          />
        )}
      </mesh>

      <ContactShadows
        position={[0, 0.002, 0]}
        scale={14}
        far={6}
        blur={2.6}
        opacity={quality === 'low' ? 0.5 : 0.7}
        resolution={quality === 'high' ? 1024 : 512}
        color="#000000"
      />
    </group>
  );
}
