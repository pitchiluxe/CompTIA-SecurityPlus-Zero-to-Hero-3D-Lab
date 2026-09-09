import { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

// ---------------------------------------------------------------------------
// Career pathway visualization — conceptual 3D representation of skill-to-role
// mapping rather than physical network topology.
// ---------------------------------------------------------------------------

export interface CareerNode {
  id: string;
  label: string;
  position: [number, number, number];
  color: string;
  type: 'skill' | 'role';
  category?: string;
}

const CAREER_NODES: CareerNode[] = [
  // Skills (bottom layer)
  { id: 'skill-foundations', label: 'Foundations', position: [-4, 0, 2], color: '#64748b', type: 'skill' },
  { id: 'skill-incident', label: 'Incident Response', position: [-2, 0, 2], color: '#64748b', type: 'skill' },
  { id: 'skill-iam', label: 'IAM', position: [0, 0, 2], color: '#64748b', type: 'skill' },
  { id: 'skill-network', label: 'Network Security', position: [2, 0, 2], color: '#64748b', type: 'skill' },
  { id: 'skill-vuln', label: 'Vulnerability Mgmt', position: [4, 0, 2], color: '#64748b', type: 'skill' },
  
  // Roles (top layer)
  { id: 'role-soc', label: 'SOC Track', position: [-2, 3, -2], color: '#3b82f6', type: 'role', category: 'SOC' },
  { id: 'role-iam', label: 'IAM Track', position: [2, 3, -2], color: '#22c55e', type: 'role', category: 'IAM' },
  { id: 'role-general', label: 'General Track', position: [0, 3, 2], color: '#f59e0b', type: 'role', category: 'General' },
];

const CAREER_CONNECTIONS = [
  { from: 'skill-foundations', to: 'role-soc' },
  { from: 'skill-incident', to: 'role-soc' },
  { from: 'skill-iam', to: 'role-iam' },
  { from: 'skill-network', to: 'role-general' },
  { from: 'skill-vuln', to: 'role-general' },
];

function CareerNodeMesh({
  node,
  selected,
  onClick,
}: {
  node: CareerNode;
  selected: boolean;
  onClick: (node: CareerNode) => void;
}) {
  const material = useRef<THREE.MeshStandardMaterial>(null);
  const [hovered, setHovered] = useState(false);
  
  const size: [number, number, number] = node.type === 'role' ? [1.2, 0.8, 0.6] : [1.0, 0.6, 0.4];
  const halfHeight = size[1] / 2;

  useFrame(() => {
    if (!material.current) return;
    material.current.emissiveIntensity = hovered || selected ? 0.8 : 0.3;
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
          color={node.color}
          emissive={node.color}
          emissiveIntensity={0.3}
          metalness={0.5}
          roughness={0.4}
        />
      </mesh>

      {selected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[0.9, 1.1, 32]} />
          <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} />
        </mesh>
      )}

      <Text
        position={[0, size[1] + 0.3, 0]}
        fontSize={0.22}
        color={hovered || selected ? '#ffffff' : '#cbd5e1'}
        anchorX="center"
        anchorY="middle"
        maxWidth={2.5}
      >
        {node.label}
      </Text>

      {node.category && (
        <Text
          position={[0, size[1] + 0.55, 0]}
          fontSize={0.14}
          color="#94a3b8"
          anchorX="center"
          anchorY="middle"
        >
          {node.category}
        </Text>
      )}
    </group>
  );
}

/**
 * Animated career pathway — particles flowing from skills to roles
 */
function CareerPathFlow({
  from,
  to,
  offset,
}: {
  from: THREE.Vector3;
  to: THREE.Vector3;
  offset: number;
}) {
  const particle = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!particle.current) return;
    const t = (state.clock.getElapsedTime() * 0.2 + offset) % 1;
    particle.current.position.lerpVectors(from, to, t);
    // Arc upward for visual clarity
    particle.current.position.y += Math.sin(t * Math.PI) * 1.2;
  });

  return (
    <mesh ref={particle}>
      <sphereGeometry args={[0.06, 8, 8]} />
      <meshBasicMaterial color="#38bdf8" />
    </mesh>
  );
}

function CareerEnvironment() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 5]} intensity={0.7} castShadow />
      <pointLight position={[-6, 3, 0]} intensity={0.5} color="#3b82f6" />
      <pointLight position={[6, 3, 0]} intensity={0.5} color="#22c55e" />

      <gridHelper args={[30, 30, '#1e3a5f', '#111827']} position={[0, 0, 0]} />
      <ContactShadows opacity={0.4} scale={28} blur={2} far={10} resolution={512} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[32, 32]} />
        <meshStandardMaterial color="#0b1220" metalness={0.8} roughness={0.4} />
      </mesh>

      {/* Career Mode banner */}
      <group position={[0, 5, 0]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[8, 1.2, 0.2]} />
          <meshStandardMaterial color="#0f172a" metalness={0.6} roughness={0.4} />
        </mesh>
        <Text position={[0, 0.3, 0.15]} fontSize={0.35} color="#38bdf8" anchorX="center">
          CAREER MODE
        </Text>
        <Text position={[0, -0.2, 0.15]} fontSize={0.2} color="#94a3b8" anchorX="center">
          Skills → Roles → Jobs
        </Text>
      </group>
    </>
  );
}

interface Props {
  onSelectNode?: (node: CareerNode) => void;
  selectedId?: string;
  /** Called when the GPU drops the WebGL context so the host can show 2D. */
  onContextLost?: () => void;
}

export function CareerScene({ onSelectNode, selectedId, onContextLost }: Props) {
  const [selectedNode, setSelectedNode] = useState<CareerNode | null>(null);

  const handleNodeClick = (node: CareerNode) => {
    setSelectedNode(node);
    onSelectNode?.(node);
  };

  const flows = useMemo(() => {
    return CAREER_CONNECTIONS.map((conn, i) => {
      const fromNode = CAREER_NODES.find((n) => n.id === conn.from);
      const toNode = CAREER_NODES.find((n) => n.id === conn.to);
      if (!fromNode || !toNode) return null;
      
      return {
        id: `flow-${conn.from}-${conn.to}`,
        from: new THREE.Vector3(...fromNode.position),
        to: new THREE.Vector3(...toNode.position),
        offset: i / CAREER_CONNECTIONS.length,
      };
    }).filter(Boolean) as Array<{ id: string; from: THREE.Vector3; to: THREE.Vector3; offset: number }>;
  }, []);

  return (
    <Canvas
      shadows
      camera={{ position: [0, 8, 12], fov: 55, near: 0.1, far: 100 }}
      gl={{ antialias: true }}
      style={{ background: '#020617' }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener('webglcontextlost', (event) => {
          event.preventDefault();
          onContextLost?.();
        });
      }}
    >
      <CareerEnvironment />

      {/* Connection lines */}
      {CAREER_CONNECTIONS.map((conn) => {
        const fromNode = CAREER_NODES.find((n) => n.id === conn.from);
        const toNode = CAREER_NODES.find((n) => n.id === conn.to);
        if (!fromNode || !toNode) return null;
        
        return (
          <line key={`line-${conn.from}-${conn.to}`}>
            <bufferGeometry
              attach="geometry"
              attributes={{
                position: new THREE.BufferAttribute(
                  new Float32Array([...fromNode.position, ...toNode.position]),
                  3
                ),
              }}
            />
            <lineBasicMaterial color="#1e3a5f" opacity={0.6} transparent />
          </line>
        );
      })}

      {/* Career nodes */}
      {CAREER_NODES.map((node) => (
        <CareerNodeMesh
          key={node.id}
          node={node}
          selected={node.id === selectedId || node.id === selectedNode?.id}
          onClick={handleNodeClick}
        />
      ))}

      {/* Animated particles */}
      {flows.map((flow) => (
        <CareerPathFlow
          key={flow.id}
          from={flow.from}
          to={flow.to}
          offset={flow.offset}
        />
      ))}

      <OrbitControls
        enableDamping
        dampingFactor={0.06}
        minDistance={3}
        maxDistance={25}
        maxPolarAngle={Math.PI / 2.1}
        target={[0, 1.5, 0]}
      />
    </Canvas>
  );
}