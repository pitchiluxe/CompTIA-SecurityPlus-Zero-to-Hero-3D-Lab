import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import { PATH_STAGES, type PathStage, type PathStageId } from '../data/connectionPath';

// ---------------------------------------------------------------------------
// Phase 1 scene: User -> Endpoint -> Network -> Server -> Security Controls.
//
// A packet travels the path continuously. The stage it is currently passing
// through lights up, so the sequence is legible without reading any text.
// ---------------------------------------------------------------------------

const STAGE_SPACING = 5;
const TRAVEL_SECONDS = 12;

function StagePillar({
  stage,
  active,
  selected,
  onSelect,
}: {
  stage: PathStage;
  active: boolean;
  selected: boolean;
  onSelect: (id: PathStageId) => void;
}) {
  const material = useRef<THREE.MeshStandardMaterial>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (!material.current) return;
    const target = active ? 1.1 : hovered || selected ? 0.7 : 0.22;
    // Ease toward the target so the packet leaves a fading trail behind it.
    material.current.emissiveIntensity += (target - material.current.emissiveIntensity) * 0.12;
  });

  return (
    <group position={[stage.x, 0, 0]}>
      <mesh
        position={[0, 1.1, 0]}
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
        <boxGeometry args={[2.6, 2.2, 2.6]} />
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
          <ringGeometry args={[1.9, 2.2, 40]} />
          <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
        </mesh>
      )}

      <Text position={[0, 2.9, 0]} fontSize={0.42} color="#ffffff" anchorX="center">
        {stage.title}
      </Text>
      <Text position={[0, 2.4, 0]} fontSize={0.24} color="#94a3b8" anchorX="center" maxWidth={4.4}>
        {stage.subtitle}
      </Text>
      <Text position={[0, -0.55, 0]} fontSize={0.22} color="#64748b" anchorX="center">
        {stage.steps.length} step{stage.steps.length === 1 ? '' : 's'}
      </Text>
    </group>
  );
}

/** The travelling request, plus the response returning along a parallel lane. */
function Packet({
  from,
  to,
  onStageChange,
}: {
  from: number;
  to: number;
  onStageChange: (id: PathStageId | null) => void;
}) {
  const request = useRef<THREE.Mesh>(null);
  const response = useRef<THREE.Mesh>(null);
  const lastStage = useRef<PathStageId | null>(null);

  useFrame((state) => {
    const t = (state.clock.getElapsedTime() % TRAVEL_SECONDS) / TRAVEL_SECONDS;
    const x = THREE.MathUtils.lerp(from, to, t);

    if (request.current) {
      request.current.position.set(x, 1.1, 1.7);
    }
    if (response.current) {
      // Response runs the other way on a parallel lane, offset in time.
      response.current.position.set(THREE.MathUtils.lerp(to, from, t), 1.1, -1.7);
    }

    // Report the nearest stage so the host can highlight the matching detail.
    const nearest = PATH_STAGES.reduce((best, s) =>
      Math.abs(s.x - x) < Math.abs(best.x - x) ? s : best
    );
    if (nearest.id !== lastStage.current) {
      lastStage.current = nearest.id;
      onStageChange(nearest.id);
    }
  });

  return (
    <>
      <mesh ref={request}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshBasicMaterial color="#38bdf8" />
      </mesh>
      <mesh ref={response}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshBasicMaterial color="#22c55e" />
      </mesh>
    </>
  );
}

function PathEnvironment() {
  const first = PATH_STAGES[0].x;
  const last = PATH_STAGES[PATH_STAGES.length - 1].x;
  const span = last - first;

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[6, 12, 8]} intensity={0.75} castShadow />
      <pointLight position={[-10, 5, 0]} intensity={0.5} color="#38bdf8" />
      <pointLight position={[10, 5, 0]} intensity={0.5} color="#a855f7" />

      <gridHelper args={[48, 48, '#1e3a5f', '#111827']} />
      <ContactShadows opacity={0.4} scale={40} blur={2.4} far={12} resolution={512} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[52, 32]} />
        <meshStandardMaterial color="#0b1220" metalness={0.8} roughness={0.4} />
      </mesh>

      {/* Request lane */}
      <mesh position={[first + span / 2, 0.03, 1.7]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[span, 0.14]} />
        <meshBasicMaterial color="#1e40af" />
      </mesh>
      {/* Response lane */}
      <mesh position={[first + span / 2, 0.03, -1.7]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[span, 0.14]} />
        <meshBasicMaterial color="#166534" />
      </mesh>

      <Text
        position={[first + span / 2, 0.06, 2.5]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.3}
        color="#3b82f6"
      >
        REQUEST →
      </Text>
      <Text
        position={[first + span / 2, 0.06, -2.5]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.3}
        color="#22c55e"
      >
        ← RESPONSE
      </Text>
    </>
  );
}

interface Props {
  selectedId: PathStageId | null;
  onSelect: (id: PathStageId) => void;
  onActiveStageChange?: (id: PathStageId | null) => void;
  onContextLost?: () => void;
}

export function PathScene({ selectedId, onSelect, onActiveStageChange, onContextLost }: Props) {
  const [activeStage, setActiveStage] = useState<PathStageId | null>(null);
  const first = PATH_STAGES[0].x - STAGE_SPACING / 2;
  const last = PATH_STAGES[PATH_STAGES.length - 1].x + STAGE_SPACING / 2;

  return (
    <Canvas
      shadows
      camera={{ position: [0, 9, 20], fov: 50, near: 0.1, far: 200 }}
      gl={{ antialias: true }}
      style={{ background: '#020617' }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener('webglcontextlost', (event) => {
          event.preventDefault();
          onContextLost?.();
        });
      }}
    >
      <PathEnvironment />

      {PATH_STAGES.map((stage) => (
        <StagePillar
          key={stage.id}
          stage={stage}
          active={stage.id === activeStage}
          selected={stage.id === selectedId}
          onSelect={onSelect}
        />
      ))}

      <Packet
        from={first}
        to={last}
        onStageChange={(id) => {
          setActiveStage(id);
          onActiveStageChange?.(id);
        }}
      />

      <OrbitControls
        enableDamping
        dampingFactor={0.08}
        minDistance={6}
        maxDistance={46}
        maxPolarAngle={Math.PI / 2.1}
        target={[0, 1, 0]}
      />
    </Canvas>
  );
}
