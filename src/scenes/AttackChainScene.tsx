import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import { ATTACK_CHAIN, type AttackStage, type AttackStageId } from '../data/attackChain';

// ---------------------------------------------------------------------------
// Phase 3 scene: the six-stage attack chain.
//
// A compromise pulse travels left to right and STOPS at the first stage the
// learner has broken. Breaking one link is enough — which is the whole point
// of the phase, made into an interaction rather than a sentence.
// ---------------------------------------------------------------------------

const ACTOR_SHAPE: Record<AttackStage['actor'], 'attacker' | 'user' | 'defender'> = {
  attacker: 'attacker',
  user: 'user',
  system: 'user',
  defender: 'defender',
};

function StageNode({
  stage,
  broken,
  reached,
  selected,
  onSelect,
  onToggleBroken,
}: {
  stage: AttackStage;
  broken: boolean;
  reached: boolean;
  selected: boolean;
  onSelect: (id: AttackStageId) => void;
  onToggleBroken: (id: AttackStageId) => void;
}) {
  const material = useRef<THREE.MeshStandardMaterial>(null);
  const [hovered, setHovered] = useState(false);
  const shape = ACTOR_SHAPE[stage.actor];

  useFrame(() => {
    if (!material.current) return;
    const target = broken ? 0.15 : reached ? 1.0 : selected || hovered ? 0.75 : 0.28;
    material.current.emissiveIntensity += (target - material.current.emissiveIntensity) * 0.12;
  });

  return (
    <group position={[stage.x, 0, 0]}>
      <mesh
        position={[0, 1.3, 0]}
        castShadow
        onClick={(e) => {
          e.stopPropagation();
          onSelect(stage.id);
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          onToggleBroken(stage.id);
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
        {/* Shape encodes who acts: attacker = spiky, user = rounded, defender = shield-like */}
        {shape === 'attacker' && <octahedronGeometry args={[1.15, 0]} />}
        {shape === 'user' && <sphereGeometry args={[1.0, 24, 24]} />}
        {shape === 'defender' && <cylinderGeometry args={[1.0, 1.0, 1.6, 6]} />}
        <meshStandardMaterial
          ref={material}
          color={broken ? '#22c55e' : stage.color}
          emissive={broken ? '#052e16' : stage.color}
          metalness={0.55}
          roughness={0.35}
        />
      </mesh>

      {broken && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[1.4, 1.7, 32]} />
          <meshBasicMaterial color="#22c55e" side={THREE.DoubleSide} />
        </mesh>
      )}
      {selected && !broken && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[1.4, 1.7, 32]} />
          <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
        </mesh>
      )}

      <Text position={[0, 3.0, 0]} fontSize={0.36} color="#ffffff" anchorX="center" maxWidth={4.2}>
        {stage.order}. {stage.title}
      </Text>
      <Text position={[0, 2.55, 0]} fontSize={0.24} color="#94a3b8" anchorX="center">
        {stage.actor}
      </Text>
      {broken && (
        <Text position={[0, -0.6, 0]} fontSize={0.28} color="#22c55e" anchorX="center">
          BROKEN
        </Text>
      )}
    </group>
  );
}

/** The compromise, travelling until it meets a broken link. */
function CompromisePulse({
  stopX,
  contained,
  onReachStage,
}: {
  stopX: number;
  contained: boolean;
  onReachStage: (order: number) => void;
}) {
  const bead = useRef<THREE.Mesh>(null);
  const lastOrder = useRef(0);
  const startX = ATTACK_CHAIN[0].x - 2.5;

  useFrame((state) => {
    if (!bead.current) return;
    const cycle = 14;
    const t = (state.clock.getElapsedTime() % cycle) / cycle;
    const x = Math.min(
      startX + t * (ATTACK_CHAIN[ATTACK_CHAIN.length - 1].x + 2.5 - startX),
      stopX
    );

    bead.current.position.set(x, 1.3, 0);
    // Sit the pulse slightly proud of the nodes so it stays visible.
    bead.current.position.z = 1.9;

    const nearest = ATTACK_CHAIN.reduce((best, s) =>
      Math.abs(s.x - x) < Math.abs(best.x - x) ? s : best
    );
    if (nearest.order !== lastOrder.current) {
      lastOrder.current = nearest.order;
      onReachStage(nearest.order);
    }
  });

  return (
    <mesh ref={bead}>
      <sphereGeometry args={[0.26, 16, 16]} />
      <meshBasicMaterial color={contained ? '#22c55e' : '#ef4444'} />
    </mesh>
  );
}

function ChainEnvironment() {
  const first = ATTACK_CHAIN[0].x;
  const last = ATTACK_CHAIN[ATTACK_CHAIN.length - 1].x;
  const span = last - first;

  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[6, 14, 8]} intensity={0.7} castShadow />
      <pointLight position={[-13, 5, 0]} intensity={0.6} color="#ef4444" />
      <pointLight position={[13, 5, 0]} intensity={0.6} color="#38bdf8" />

      <gridHelper args={[48, 48, '#1e3a5f', '#111827']} />
      <ContactShadows opacity={0.4} scale={44} blur={2.4} far={12} resolution={512} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[56, 26]} />
        <meshStandardMaterial color="#0b1220" metalness={0.8} roughness={0.4} />
      </mesh>

      {/* The chain rail */}
      <mesh position={[first + span / 2, 0.03, 1.9]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[span + 5, 0.12]} />
        <meshBasicMaterial color="#7f1d1d" />
      </mesh>

      <Text
        position={[first, 0.06, 3.2]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.32}
        color="#ef4444"
      >
        ATTACKER
      </Text>
      <Text
        position={[last, 0.06, 3.2]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.32}
        color="#38bdf8"
      >
        DEFENDER
      </Text>
    </>
  );
}

interface Props {
  selectedId: AttackStageId | null;
  brokenIds: string[];
  onSelect: (id: AttackStageId) => void;
  onToggleBroken: (id: AttackStageId) => void;
  onContextLost?: () => void;
}

export function AttackChainScene({
  selectedId,
  brokenIds,
  onSelect,
  onToggleBroken,
  onContextLost,
}: Props) {
  const [reachedOrder, setReachedOrder] = useState(0);
  const broken = new Set(brokenIds);

  // The pulse stops at the first broken stage.
  const firstBroken = ATTACK_CHAIN.find((s) => broken.has(s.id));
  const stopX = firstBroken ? firstBroken.x : ATTACK_CHAIN[ATTACK_CHAIN.length - 1].x + 2.5;

  return (
    <Canvas
      shadows
      camera={{ position: [0, 10, 22], fov: 50, near: 0.1, far: 200 }}
      gl={{ antialias: true }}
      style={{ background: '#020617' }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener('webglcontextlost', (event) => {
          event.preventDefault();
          onContextLost?.();
        });
      }}
    >
      <ChainEnvironment />

      {ATTACK_CHAIN.map((stage) => (
        <StageNode
          key={stage.id}
          stage={stage}
          broken={broken.has(stage.id)}
          reached={
            !firstBroken || stage.order < firstBroken.order ? stage.order <= reachedOrder : false
          }
          selected={stage.id === selectedId}
          onSelect={onSelect}
          onToggleBroken={onToggleBroken}
        />
      ))}

      <CompromisePulse
        stopX={stopX}
        contained={Boolean(firstBroken)}
        onReachStage={setReachedOrder}
      />

      <OrbitControls
        enableDamping
        dampingFactor={0.08}
        minDistance={6}
        maxDistance={50}
        maxPolarAngle={Math.PI / 2.1}
        target={[0, 1, 0]}
      />
    </Canvas>
  );
}
