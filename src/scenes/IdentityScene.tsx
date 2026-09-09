import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import {
  IDENTITY_LIFECYCLE,
  type LifecycleStage,
  type LifecycleStageId,
} from '../data/identityLifecycle';

// ---------------------------------------------------------------------------
// Phase 5 scene: the identity lifecycle as a ring.
//
// A ring rather than a line, because the lifecycle genuinely closes: HR starts
// it and deprovisioning returns the identity to HR's authority. A rehire picks
// the loop back up rather than starting a new one — which is precisely why
// identity matching at stage 2 matters.
// ---------------------------------------------------------------------------

const RADIUS = 9;

function toPosition(angleDeg: number): [number, number, number] {
  const rad = (angleDeg * Math.PI) / 180;
  return [Math.cos(rad) * RADIUS, 0, Math.sin(rad) * RADIUS];
}

function StageNode({
  stage,
  active,
  selected,
  onSelect,
}: {
  stage: LifecycleStage;
  active: boolean;
  selected: boolean;
  onSelect: (id: LifecycleStageId) => void;
}) {
  const material = useRef<THREE.MeshStandardMaterial>(null);
  const [hovered, setHovered] = useState(false);
  const position = toPosition(stage.angle);

  useFrame(() => {
    if (!material.current) return;
    const target = active ? 1.1 : selected || hovered ? 0.8 : 0.28;
    material.current.emissiveIntensity += (target - material.current.emissiveIntensity) * 0.12;
  });

  return (
    <group position={position}>
      <mesh
        position={[0, 1, 0]}
        castShadow
        onClick={(e) => {
          e.stopPropagation();
          onSelect(stage.id);
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
        <cylinderGeometry args={[1.05, 1.05, 1.7, 8]} />
        <meshStandardMaterial
          ref={material}
          color={stage.color}
          emissive={stage.color}
          metalness={0.55}
          roughness={0.35}
        />
      </mesh>

      {selected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[1.35, 1.6, 32]} />
          <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
        </mesh>
      )}

      <Text position={[0, 2.5, 0]} fontSize={0.34} color="#ffffff" anchorX="center" maxWidth={4}>
        {stage.order}. {stage.title}
      </Text>
      <Text position={[0, 2.1, 0]} fontSize={0.2} color="#94a3b8" anchorX="center" maxWidth={4.6}>
        {stage.system}
      </Text>
    </group>
  );
}

/** The identity travelling its lifecycle, one stage at a time. */
function IdentityToken({ onReachStage }: { onReachStage: (order: number) => void }) {
  const bead = useRef<THREE.Mesh>(null);
  const last = useRef(0);

  useFrame((state) => {
    if (!bead.current) return;
    const cycle = 20;
    const t = (state.clock.getElapsedTime() % cycle) / cycle;
    const angle = t * 360;
    const [x, , z] = toPosition(angle);
    bead.current.position.set(x, 1, z);

    const nearest = IDENTITY_LIFECYCLE.reduce((best, s) => {
      const d = Math.abs(((s.angle - angle + 540) % 360) - 180);
      const bd = Math.abs(((best.angle - angle + 540) % 360) - 180);
      return d > bd ? s : best;
    });
    if (nearest.order !== last.current) {
      last.current = nearest.order;
      onReachStage(nearest.order);
    }
  });

  return (
    <mesh ref={bead}>
      <sphereGeometry args={[0.3, 16, 16]} />
      <meshBasicMaterial color="#facc15" />
    </mesh>
  );
}

function IdentityEnvironment() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[8, 16, 8]} intensity={0.7} castShadow />
      <pointLight position={[0, 8, 0]} intensity={0.7} color="#818cf8" />
      <gridHelper args={[44, 44, '#1e3a5f', '#111827']} />
      <ContactShadows opacity={0.35} scale={38} blur={2.4} far={12} resolution={512} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[48, 48]} />
        <meshStandardMaterial color="#0b1220" metalness={0.8} roughness={0.4} />
      </mesh>

      {/* The lifecycle ring itself */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <ringGeometry args={[RADIUS - 0.09, RADIUS + 0.09, 96]} />
        <meshBasicMaterial color="#312e81" side={THREE.DoubleSide} />
      </mesh>

      <Text position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.7} color="#818cf8">
        IDENTITY
      </Text>
      <Text
        position={[0, 0.1, 1.4]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.36}
        color="#475569"
      >
        one person · one identity · many accounts
      </Text>
    </>
  );
}

interface Props {
  selectedId: LifecycleStageId | null;
  onSelect: (id: LifecycleStageId) => void;
  onContextLost?: () => void;
}

export function IdentityScene({ selectedId, onSelect, onContextLost }: Props) {
  const [activeOrder, setActiveOrder] = useState(0);

  return (
    <Canvas
      shadows
      camera={{ position: [0, 16, 18], fov: 50, near: 0.1, far: 200 }}
      gl={{ antialias: true }}
      style={{ background: '#020617' }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener('webglcontextlost', (event) => {
          event.preventDefault();
          onContextLost?.();
        });
      }}
    >
      <IdentityEnvironment />

      {IDENTITY_LIFECYCLE.map((stage) => (
        <StageNode
          key={stage.id}
          stage={stage}
          active={stage.order === activeOrder}
          selected={stage.id === selectedId}
          onSelect={onSelect}
        />
      ))}

      <IdentityToken onReachStage={setActiveOrder} />

      <OrbitControls
        enableDamping
        dampingFactor={0.08}
        minDistance={8}
        maxDistance={46}
        maxPolarAngle={Math.PI / 2.1}
        target={[0, 0.5, 0]}
      />
    </Canvas>
  );
}
