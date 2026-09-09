import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import { TLS_HANDSHAKE, type HandshakeStep } from '../data/tlsHandshake';

// ---------------------------------------------------------------------------
// Phase 6 scene: the TLS handshake as messages crossing between two endpoints.
//
// Client on the left, server on the right, messages travelling between them in
// sequence. Height encodes progress through the handshake, so the exchange
// reads top to bottom as a sequence diagram does.
// ---------------------------------------------------------------------------

const CLIENT_X = -8;
const SERVER_X = 8;
const TOP_Y = 7;
const STEP_DROP = 1.7;

function yFor(order: number): number {
  return TOP_Y - (order - 1) * STEP_DROP;
}

function Endpoint({ x, label, sub }: { x: number; label: string; sub: string }) {
  return (
    <group position={[x, TOP_Y + 2.6, 0]}>
      <mesh castShadow>
        <boxGeometry args={[3.2, 1.6, 1.6]} />
        <meshStandardMaterial
          color={x < 0 ? '#3b82f6' : '#22c55e'}
          emissive={x < 0 ? '#1e3a5f' : '#052e16'}
          emissiveIntensity={0.4}
          metalness={0.6}
          roughness={0.35}
        />
      </mesh>
      <Text position={[0, 1.4, 0]} fontSize={0.44} color="#ffffff" anchorX="center">
        {label}
      </Text>
      <Text position={[0, 0.98, 0]} fontSize={0.24} color="#94a3b8" anchorX="center">
        {sub}
      </Text>
    </group>
  );
}

function MessageArrow({
  step,
  selected,
  onSelect,
}: {
  step: HandshakeStep;
  selected: boolean;
  onSelect: (order: number) => void;
}) {
  const material = useRef<THREE.MeshStandardMaterial>(null);
  const [hovered, setHovered] = useState(false);
  const y = yFor(step.order);

  // Steps 5 and 6 are local computation, drawn as a short bar rather than a
  // crossing arrow — nothing travels the wire.
  const isLocal = step.carries.startsWith('(no message');
  const fromX = step.from === 'client' ? CLIENT_X : SERVER_X;
  const toX = step.from === 'client' ? SERVER_X : CLIENT_X;
  const width = isLocal ? 4 : Math.abs(SERVER_X - CLIENT_X);
  const centreX = isLocal ? fromX : 0;

  useFrame(() => {
    if (!material.current) return;
    const target = selected ? 1.0 : hovered ? 0.7 : 0.25;
    material.current.emissiveIntensity += (target - material.current.emissiveIntensity) * 0.12;
  });

  return (
    <group position={[centreX, y, 0]}>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onSelect(step.order);
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
        <boxGeometry args={[width, 0.42, 0.42]} />
        <meshStandardMaterial
          ref={material}
          color={isLocal ? '#64748b' : step.from === 'client' ? '#3b82f6' : '#22c55e'}
          emissive={isLocal ? '#334155' : step.from === 'client' ? '#1e3a5f' : '#052e16'}
          metalness={0.5}
          roughness={0.4}
        />
      </mesh>

      {/* Direction marker at the receiving end */}
      {!isLocal && (
        <mesh position={[toX > fromX ? width / 2 : -width / 2, 0, 0]}>
          <sphereGeometry args={[0.3, 12, 12]} />
          <meshBasicMaterial color={step.from === 'client' ? '#3b82f6' : '#22c55e'} />
        </mesh>
      )}

      <Text
        position={[isLocal ? (fromX < 0 ? 3 : -3) : 0, 0.55, 0]}
        fontSize={0.32}
        color={selected ? '#ffffff' : '#cbd5e1'}
        anchorX="center"
      >
        {step.order}. {step.title}
      </Text>
    </group>
  );
}

function TlsEnvironment() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[6, 14, 10]} intensity={0.7} castShadow />
      <pointLight position={[-10, 6, 4]} intensity={0.5} color="#3b82f6" />
      <pointLight position={[10, 6, 4]} intensity={0.5} color="#22c55e" />
      <ContactShadows opacity={0.3} scale={34} blur={2.6} far={14} position={[0, -6.5, 0]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -6.52, 0]} receiveShadow>
        <planeGeometry args={[46, 34]} />
        <meshStandardMaterial color="#0b1220" metalness={0.8} roughness={0.4} />
      </mesh>

      {/* Lifelines, as in a sequence diagram */}
      {[CLIENT_X, SERVER_X].map((x) => (
        <mesh key={x} position={[x, TOP_Y - 6, 0]}>
          <boxGeometry args={[0.06, 15, 0.06]} />
          <meshBasicMaterial color="#1e3a5f" />
        </mesh>
      ))}
    </>
  );
}

interface Props {
  selectedOrder: number | null;
  onSelect: (order: number) => void;
  onContextLost?: () => void;
}

export function TlsScene({ selectedOrder, onSelect, onContextLost }: Props) {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 1, 26], fov: 50, near: 0.1, far: 200 }}
      gl={{ antialias: true }}
      style={{ background: '#020617' }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener('webglcontextlost', (event) => {
          event.preventDefault();
          onContextLost?.();
        });
      }}
    >
      <TlsEnvironment />

      <Endpoint x={CLIENT_X} label="CLIENT" sub="WS-01" />
      <Endpoint x={SERVER_X} label="SERVER" sub="srv-01.lab.local" />

      {TLS_HANDSHAKE.map((step) => (
        <MessageArrow
          key={step.order}
          step={step}
          selected={step.order === selectedOrder}
          onSelect={onSelect}
        />
      ))}

      <OrbitControls
        enableDamping
        dampingFactor={0.08}
        minDistance={10}
        maxDistance={48}
        target={[0, 1, 0]}
      />
    </Canvas>
  );
}
