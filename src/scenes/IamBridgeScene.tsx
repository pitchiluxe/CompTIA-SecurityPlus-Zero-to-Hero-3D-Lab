import { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

// ---------------------------------------------------------------------------
// Phase 27 — Security+ to IAM Career Bridge, visualised as three tiers.
//
// The scene is functional rather than decorative: the bottom tier is the
// Security+ concept foundation, the middle tier is the implementation topic
// the concept feeds into, and the top tier is the vendor platform. A vendor
// whose prerequisite concepts are still weak renders locked, and the particle
// flow along its edge stops — so the "concepts before vendors" rule is
// visible in the geometry, not only stated in the lesson text.
// ---------------------------------------------------------------------------

export type BridgeNodeType = 'concept' | 'topic' | 'vendor';

export interface BridgeNode {
  id: string;
  label: string;
  sublabel?: string;
  position: [number, number, number];
  color: string;
  type: BridgeNodeType;
}

const CONCEPT_COLOR = '#64748b';
const TOPIC_COLOR = '#38bdf8';
const VENDOR_COLOR = '#22c55e';
const LOCKED_COLOR = '#7f1d1d';

/** Concept foundation — bottom tier. Every id is a real tracked platform concept. */
const CONCEPT_NODES: BridgeNode[] = [
  { id: 'authentication', label: 'authentication', position: [-6, 0, 4], color: CONCEPT_COLOR, type: 'concept' },
  { id: 'authorization', label: 'authorization', position: [-3, 0, 4], color: CONCEPT_COLOR, type: 'concept' },
  { id: 'mfa', label: 'mfa', position: [0, 0, 4], color: CONCEPT_COLOR, type: 'concept' },
  { id: 'sso', label: 'sso / federation', position: [3, 0, 4], color: CONCEPT_COLOR, type: 'concept' },
  { id: 'rbac', label: 'rbac', position: [6, 0, 4], color: CONCEPT_COLOR, type: 'concept' },
  { id: 'zero-trust', label: 'zero-trust', position: [-4.5, 0, 6.5], color: CONCEPT_COLOR, type: 'concept' },
  { id: 'pam', label: 'pam', position: [-1.5, 0, 6.5], color: CONCEPT_COLOR, type: 'concept' },
  { id: 'accounting', label: 'accounting', position: [1.5, 0, 6.5], color: CONCEPT_COLOR, type: 'concept' },
  { id: 'ir-lifecycle', label: 'ir-lifecycle', position: [4.5, 0, 6.5], color: CONCEPT_COLOR, type: 'concept' },
];

/** Implementation topics — middle tier. Ids match IAM_BRIDGE_TOPICS. */
const TOPIC_NODES: BridgeNode[] = [
  { id: 'authentication-implementation', label: 'Authentication', sublabel: 'protocol exchange', position: [-6, 2.6, 0], color: TOPIC_COLOR, type: 'topic' },
  { id: 'authorization-implementation', label: 'Authorization', sublabel: 'entitlements', position: [-4, 2.6, 0], color: TOPIC_COLOR, type: 'topic' },
  { id: 'mfa-implementation', label: 'MFA', sublabel: 'factor strength', position: [-2, 2.6, 0], color: TOPIC_COLOR, type: 'topic' },
  { id: 'sso-implementation', label: 'SSO', sublabel: 'federation', position: [0, 2.6, 0], color: TOPIC_COLOR, type: 'topic' },
  { id: 'rbac-implementation', label: 'RBAC', sublabel: 'role drift', position: [2, 2.6, 0], color: TOPIC_COLOR, type: 'topic' },
  { id: 'zero-trust-identity', label: 'Zero Trust', sublabel: 'policy engine', position: [4, 2.6, 0], color: TOPIC_COLOR, type: 'topic' },
  { id: 'privileged-access', label: 'Privileged access', sublabel: 'vault / JIT', position: [6, 2.6, 0], color: TOPIC_COLOR, type: 'topic' },
  { id: 'identity-events-logs', label: 'Identity in logs', sublabel: 'three sources', position: [-3, 2.6, -2.4], color: TOPIC_COLOR, type: 'topic' },
  { id: 'iam-incident-investigation', label: 'IAM investigation', sublabel: 'containment', position: [3, 2.6, -2.4], color: TOPIC_COLOR, type: 'topic' },
];

/** Vendor platforms — top tier. Ids match IAM_VENDORS. */
const VENDOR_NODES: BridgeNode[] = [
  { id: 'active-directory', label: 'Active Directory', sublabel: 'directory', position: [-6.5, 5.4, -5], color: VENDOR_COLOR, type: 'vendor' },
  { id: 'entra-id', label: 'Entra ID', sublabel: 'cloud IdP', position: [-3.9, 5.4, -5], color: VENDOR_COLOR, type: 'vendor' },
  { id: 'okta', label: 'Okta', sublabel: 'IdP', position: [-1.3, 5.4, -5], color: VENDOR_COLOR, type: 'vendor' },
  { id: 'ping-identity', label: 'Ping Identity', sublabel: 'federation', position: [1.3, 5.4, -5], color: VENDOR_COLOR, type: 'vendor' },
  { id: 'cyberark', label: 'CyberArk', sublabel: 'PAM', position: [3.9, 5.4, -5], color: VENDOR_COLOR, type: 'vendor' },
  { id: 'sailpoint', label: 'SailPoint', sublabel: 'governance', position: [6.5, 5.4, -5], color: VENDOR_COLOR, type: 'vendor' },
];

const BRIDGE_NODES: BridgeNode[] = [...CONCEPT_NODES, ...TOPIC_NODES, ...VENDOR_NODES];

/** Concept -> topic edges (foundation feeds implementation). */
const CONCEPT_EDGES: { from: string; to: string }[] = [
  { from: 'authentication', to: 'authentication-implementation' },
  { from: 'authorization', to: 'authorization-implementation' },
  { from: 'mfa', to: 'mfa-implementation' },
  { from: 'sso', to: 'sso-implementation' },
  { from: 'rbac', to: 'rbac-implementation' },
  { from: 'zero-trust', to: 'zero-trust-identity' },
  { from: 'pam', to: 'privileged-access' },
  { from: 'accounting', to: 'identity-events-logs' },
  { from: 'ir-lifecycle', to: 'iam-incident-investigation' },
];

/** Topic -> vendor edges (implementation is what a product implements). */
const VENDOR_EDGES: { from: string; to: string }[] = [
  { from: 'authentication-implementation', to: 'active-directory' },
  { from: 'identity-events-logs', to: 'active-directory' },
  { from: 'zero-trust-identity', to: 'entra-id' },
  { from: 'iam-incident-investigation', to: 'entra-id' },
  { from: 'sso-implementation', to: 'okta' },
  { from: 'mfa-implementation', to: 'okta' },
  { from: 'sso-implementation', to: 'ping-identity' },
  { from: 'privileged-access', to: 'cyberark' },
  { from: 'authorization-implementation', to: 'sailpoint' },
  { from: 'rbac-implementation', to: 'sailpoint' },
];

function nodeSize(type: BridgeNodeType): [number, number, number] {
  if (type === 'vendor') return [1.9, 0.8, 0.6];
  if (type === 'topic') return [1.7, 0.6, 0.5];
  return [1.5, 0.45, 0.4];
}

function BridgeNodeMesh({
  node,
  selected,
  dimmed,
  locked,
  onClick,
}: {
  node: BridgeNode;
  selected: boolean;
  dimmed: boolean;
  locked: boolean;
  onClick: (node: BridgeNode) => void;
}) {
  const material = useRef<THREE.MeshStandardMaterial>(null);
  const [hovered, setHovered] = useState(false);

  const size = nodeSize(node.type);
  const halfHeight = size[1] / 2;
  const color = locked ? LOCKED_COLOR : node.color;

  useFrame(() => {
    if (!material.current) return;
    const base = dimmed ? 0.08 : 0.3;
    material.current.emissiveIntensity = hovered || selected ? 0.85 : base;
  });

  return (
    <group position={node.position}>
      <mesh
        position={[0, halfHeight, 0]}
        castShadow
        onClick={(e) => {
          e.stopPropagation();
          onClick(node);
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
        <boxGeometry args={size} />
        <meshStandardMaterial
          ref={material}
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          metalness={0.5}
          roughness={0.4}
          transparent
          opacity={dimmed ? 0.45 : 1}
        />
      </mesh>

      {selected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[1.15, 1.35, 32]} />
          <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} />
        </mesh>
      )}

      <Text
        position={[0, size[1] + 0.28, 0]}
        fontSize={node.type === 'concept' ? 0.17 : 0.22}
        color={hovered || selected ? '#ffffff' : dimmed ? '#64748b' : '#cbd5e1'}
        anchorX="center"
        anchorY="middle"
        maxWidth={2.6}
      >
        {node.label}
      </Text>

      {node.sublabel && (
        <Text
          position={[0, size[1] + 0.52, 0]}
          fontSize={0.13}
          color={locked ? '#f87171' : '#94a3b8'}
          anchorX="center"
          anchorY="middle"
        >
          {locked ? 'locked — concepts first' : node.sublabel}
        </Text>
      )}
    </group>
  );
}

/** One particle travelling a concept -> topic -> vendor edge. Static when the edge is gated. */
function BridgeFlow({
  from,
  to,
  offset,
  active,
}: {
  from: THREE.Vector3;
  to: THREE.Vector3;
  offset: number;
  active: boolean;
}) {
  const particle = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!particle.current) return;
    const t = active ? (state.clock.getElapsedTime() * 0.25 + offset) % 1 : 0.5;
    particle.current.position.lerpVectors(from, to, t);
    particle.current.position.y += Math.sin(t * Math.PI) * 0.5;
  });

  return (
    <mesh ref={particle}>
      <sphereGeometry args={[0.07, 8, 8]} />
      <meshBasicMaterial color={active ? '#38bdf8' : '#475569'} />
    </mesh>
  );
}

function EdgeLine({
  from,
  to,
  color,
}: {
  from: [number, number, number];
  to: [number, number, number];
  color: string;
}) {
  const positions = useMemo(() => new Float32Array([...from, ...to]), [from, to]);

  return (
    <line>
      <bufferGeometry
        attach="geometry"
        attributes={{ position: new THREE.BufferAttribute(positions, 3) }}
      />
      <lineBasicMaterial color={color} opacity={0.6} transparent />
    </line>
  );
}

function BridgeEnvironment() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[6, 12, 6]} intensity={0.7} castShadow />
      <pointLight position={[-8, 4, 4]} intensity={0.45} color="#3b82f6" />
      <pointLight position={[8, 6, -4]} intensity={0.45} color="#22c55e" />

      <gridHelper args={[36, 36, '#1e3a5f', '#111827']} />
      <ContactShadows opacity={0.35} scale={34} blur={2} far={12} resolution={512} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[38, 38]} />
        <meshStandardMaterial color="#0b1220" metalness={0.8} roughness={0.4} />
      </mesh>

      {/* Tier labels — the scene's whole point is the vertical order. */}
      <Text position={[-9.5, 0.5, 5.2]} fontSize={0.26} color="#64748b" anchorX="left">
        1 · Security+ concepts
      </Text>
      <Text position={[-9.5, 3.1, -1.2]} fontSize={0.26} color="#38bdf8" anchorX="left">
        2 · How it is implemented
      </Text>
      <Text position={[-9.5, 5.9, -5]} fontSize={0.26} color="#22c55e" anchorX="left">
        3 · Vendor platforms
      </Text>

      <group position={[0, 7.6, -5]}>
        <mesh>
          <boxGeometry args={[10, 1.2, 0.2]} />
          <meshStandardMaterial color="#0f172a" metalness={0.6} roughness={0.4} />
        </mesh>
        <Text position={[0, 0.3, 0.15]} fontSize={0.34} color="#38bdf8" anchorX="center">
          SECURITY+ → IAM CAREER BRIDGE
        </Text>
        <Text position={[0, -0.2, 0.15]} fontSize={0.19} color="#94a3b8" anchorX="center">
          Concepts before vendors
        </Text>
      </group>
    </>
  );
}

interface Props {
  onSelectNode?: (node: BridgeNode) => void;
  selectedId?: string;
  /** Vendors whose prerequisite concepts are still weak — rendered locked. */
  lockedVendorIds?: string[];
  /** Bridge topics resting on weak concepts — rendered dimmed. */
  weakTopicIds?: string[];
  /** Called when the GPU drops the WebGL context so the host can show 2D. */
  onContextLost?: () => void;
}

export function IamBridgeScene({
  onSelectNode,
  selectedId,
  lockedVendorIds = [],
  weakTopicIds = [],
  onContextLost,
}: Props) {
  const locked = useMemo(() => new Set(lockedVendorIds), [lockedVendorIds]);
  const weak = useMemo(() => new Set(weakTopicIds), [weakTopicIds]);

  const byId = useMemo(() => new Map(BRIDGE_NODES.map((n) => [n.id, n])), []);

  const flows = useMemo(() => {
    return [...CONCEPT_EDGES, ...VENDOR_EDGES]
      .map((edge, i) => {
        const from = byId.get(edge.from);
        const to = byId.get(edge.to);
        if (!from || !to) return null;
        return {
          id: `flow-${edge.from}-${edge.to}`,
          from: new THREE.Vector3(...from.position),
          to: new THREE.Vector3(...to.position),
          offset: i / (CONCEPT_EDGES.length + VENDOR_EDGES.length),
          active: !locked.has(edge.to) && !weak.has(edge.to) && !weak.has(edge.from),
        };
      })
      .filter((f): f is NonNullable<typeof f> => f !== null);
  }, [byId, locked, weak]);

  return (
    <Canvas
      shadows
      camera={{ position: [0, 9, 16], fov: 55, near: 0.1, far: 120 }}
      gl={{ antialias: true }}
      style={{ background: '#020617' }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener('webglcontextlost', (event) => {
          event.preventDefault();
          onContextLost?.();
        });
      }}
    >
      <BridgeEnvironment />

      {[...CONCEPT_EDGES, ...VENDOR_EDGES].map((edge) => {
        const from = byId.get(edge.from);
        const to = byId.get(edge.to);
        if (!from || !to) return null;
        return (
          <EdgeLine
            key={`line-${edge.from}-${edge.to}`}
            from={from.position}
            to={to.position}
            color={locked.has(edge.to) ? '#7f1d1d' : '#1e3a5f'}
          />
        );
      })}

      {BRIDGE_NODES.map((node) => (
        <BridgeNodeMesh
          key={node.id}
          node={node}
          selected={node.id === selectedId}
          locked={node.type === 'vendor' && locked.has(node.id)}
          dimmed={
            (node.type === 'vendor' && locked.has(node.id)) ||
            (node.type === 'topic' && weak.has(node.id))
          }
          onClick={(n) => onSelectNode?.(n)}
        />
      ))}

      {flows.map((flow) => (
        <BridgeFlow
          key={flow.id}
          from={flow.from}
          to={flow.to}
          offset={flow.offset}
          active={flow.active}
        />
      ))}

      <OrbitControls
        enableDamping
        dampingFactor={0.06}
        minDistance={5}
        maxDistance={34}
        maxPolarAngle={Math.PI / 2.05}
        target={[0, 3, 0]}
      />
    </Canvas>
  );
}
