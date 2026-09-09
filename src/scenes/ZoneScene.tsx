import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import { BOUNDARIES, NETWORK_ZONES, type NetworkZone, type ZoneId } from '../data/networkZones';

// ---------------------------------------------------------------------------
// Phase 4 scene: the enterprise architecture as stacked tiers.
//
// Internet at the top, descending through DMZ and Core to the four segments.
// Height encodes trust: the more trusted the zone, the lower and more enclosed
// it sits. Boundaries render as gates between tiers and are inspectable.
// ---------------------------------------------------------------------------

const TIER_Y = [7.5, 4.5, 1.5, -1.5];

function ZonePlatform({
  zone,
  selected,
  onSelect,
}: {
  zone: NetworkZone;
  selected: boolean;
  onSelect: (id: ZoneId) => void;
}) {
  const material = useRef<THREE.MeshStandardMaterial>(null);
  const [hovered, setHovered] = useState(false);
  const y = TIER_Y[zone.tier];
  const isSegment = zone.tier === 3;
  const width = isSegment ? 4.2 : zone.tier === 0 ? 22 : 14;

  useFrame(() => {
    if (!material.current) return;
    const target = selected ? 0.95 : hovered ? 0.7 : 0.25;
    material.current.emissiveIntensity += (target - material.current.emissiveIntensity) * 0.12;
  });

  return (
    <group position={[zone.offset, y, 0]}>
      <mesh
        castShadow
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          onSelect(zone.id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <boxGeometry args={[width, 0.5, isSegment ? 4.2 : 7]} />
        <meshStandardMaterial
          ref={material}
          color={zone.color}
          emissive={zone.color}
          metalness={0.5}
          roughness={0.4}
          transparent
          opacity={0.82}
        />
      </mesh>

      {selected && (
        <mesh position={[0, 0.32, 0]}>
          <boxGeometry args={[width + 0.5, 0.06, (isSegment ? 4.2 : 7) + 0.5]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      )}

      <Text
        position={[0, 0.75, 0]}
        fontSize={isSegment ? 0.4 : 0.55}
        color="#ffffff"
        anchorX="center"
      >
        {zone.name}
      </Text>
      <Text
        position={[0, 0.35, isSegment ? 2.4 : 3.9]}
        fontSize={0.28}
        color="#94a3b8"
        anchorX="center"
      >
        trust {zone.trust}
        {zone.vlan ? ` · ${zone.vlan}` : ''}
      </Text>
    </group>
  );
}

/** A gate between two tiers, standing for the boundary and its controls. */
function BoundaryGate({
  fromZone,
  toZone,
  selected,
  onSelect,
  boundaryId,
}: {
  fromZone: NetworkZone;
  toZone: NetworkZone;
  selected: boolean;
  onSelect: (id: string) => void;
  boundaryId: string;
}) {
  const material = useRef<THREE.MeshStandardMaterial>(null);
  const [hovered, setHovered] = useState(false);

  const y = (TIER_Y[fromZone.tier] + TIER_Y[toZone.tier]) / 2;
  const x = (fromZone.offset + toZone.offset) / 2;

  useFrame((state) => {
    if (!material.current) return;
    const target = selected ? 1.0 : hovered ? 0.75 : 0.3;
    material.current.emissiveIntensity += (target - material.current.emissiveIntensity) * 0.12;
    void state;
  });

  return (
    <group position={[x, y, 0]}>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onSelect(boundaryId);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <torusGeometry args={[0.7, 0.16, 12, 32]} />
        <meshStandardMaterial
          ref={material}
          color="#facc15"
          emissive="#facc15"
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>
    </group>
  );
}

function ZoneEnvironment() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[8, 18, 10]} intensity={0.7} castShadow />
      <pointLight position={[0, 12, 6]} intensity={0.6} color="#ef4444" />
      <pointLight position={[0, -3, 6]} intensity={0.5} color="#a855f7" />
      <ContactShadows
        opacity={0.3}
        scale={40}
        blur={2.6}
        far={16}
        resolution={512}
        position={[0, -4, 0]}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -4.02, 0]} receiveShadow>
        <planeGeometry args={[52, 34]} />
        <meshStandardMaterial color="#0b1220" metalness={0.8} roughness={0.4} />
      </mesh>
      <Text position={[-13, 7.5, 4]} fontSize={0.34} color="#ef4444" anchorX="left">
        UNTRUSTED
      </Text>
      <Text position={[-13, -1.5, 4]} fontSize={0.34} color="#a855f7" anchorX="left">
        TRUSTED
      </Text>
    </>
  );
}

interface Props {
  selectedZone: ZoneId | null;
  selectedBoundary: string | null;
  onSelectZone: (id: ZoneId) => void;
  onSelectBoundary: (id: string) => void;
  onContextLost?: () => void;
}

export function ZoneScene({
  selectedZone,
  selectedBoundary,
  onSelectZone,
  onSelectBoundary,
  onContextLost,
}: Props) {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 6, 26], fov: 50, near: 0.1, far: 200 }}
      gl={{ antialias: true }}
      style={{ background: '#020617' }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener('webglcontextlost', (event) => {
          event.preventDefault();
          onContextLost?.();
        });
      }}
    >
      <ZoneEnvironment />

      {NETWORK_ZONES.map((zone) => (
        <ZonePlatform
          key={zone.id}
          zone={zone}
          selected={zone.id === selectedZone}
          onSelect={onSelectZone}
        />
      ))}

      {BOUNDARIES.map((b) => {
        const fromZone = NETWORK_ZONES.find((z) => z.id === b.from);
        const toZone = NETWORK_ZONES.find((z) => z.id === b.to);
        if (!fromZone || !toZone || fromZone.tier === toZone.tier) return null;
        return (
          <BoundaryGate
            key={b.id}
            boundaryId={b.id}
            fromZone={fromZone}
            toZone={toZone}
            selected={b.id === selectedBoundary}
            onSelect={onSelectBoundary}
          />
        );
      })}

      <OrbitControls
        enableDamping
        dampingFactor={0.08}
        minDistance={8}
        maxDistance={52}
        target={[0, 2.5, 0]}
      />
    </Canvas>
  );
}
