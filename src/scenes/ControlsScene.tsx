import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import { ASSET_LABEL, DEFENCE_LAYERS, type DefenceLayer } from '../data/defenceLayers';

// ---------------------------------------------------------------------------
// Phase 2 scene: defence in depth as concentric rings around one asset.
//
// Layers can be marked failed, which drops them out of the stack while the
// inner rings stay lit — turning "assume every control eventually fails" from
// a sentence into something the learner can do.
// ---------------------------------------------------------------------------

function LayerRing({
  layer,
  failed,
  selected,
  onSelect,
}: {
  layer: DefenceLayer;
  failed: boolean;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const material = useRef<THREE.MeshStandardMaterial>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (group.current) {
      // Each ring rotates a little slower than the one outside it, so the
      // stack reads as distinct layers rather than one solid object.
      group.current.rotation.y += 0.0016 * (8 - layer.order);
    }
    if (material.current) {
      const target = failed ? 0.04 : selected || hovered ? 0.9 : 0.32;
      material.current.emissiveIntensity += (target - material.current.emissiveIntensity) * 0.12;
      material.current.opacity += ((failed ? 0.12 : 0.65) - material.current.opacity) * 0.12;
    }
    if (failed && group.current) {
      // Failed layers sink, so the surviving stack is visually obvious.
      group.current.position.y += (-2.4 - group.current.position.y) * 0.08;
    } else if (group.current) {
      group.current.position.y += (0 - group.current.position.y) * 0.08;
    }
    void state;
  });

  return (
    <group ref={group}>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(layer.id);
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
        <torusGeometry args={[layer.radius, 0.28, 16, 96]} />
        <meshStandardMaterial
          ref={material}
          color={layer.color}
          emissive={layer.color}
          transparent
          metalness={0.5}
          roughness={0.4}
        />
      </mesh>

      <Text
        position={[0, 0.6, layer.radius]}
        fontSize={0.42}
        color={failed ? '#64748b' : '#ffffff'}
        anchorX="center"
      >
        {layer.order}. {layer.title}
      </Text>
      {failed && (
        <Text position={[0, 0.1, layer.radius]} fontSize={0.28} color="#ef4444" anchorX="center">
          FAILED
        </Text>
      )}
    </group>
  );
}

function AssetCore({ breached }: { breached: boolean }) {
  const mesh = useRef<THREE.Mesh>(null);
  const material = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    if (!material.current) return;
    const t = state.clock.getElapsedTime();
    material.current.emissiveIntensity = breached ? 1.2 + Math.sin(t * 6) * 0.5 : 0.7;
    if (mesh.current) mesh.current.rotation.y += 0.006;
  });

  return (
    <group>
      <mesh ref={mesh} position={[0, 0.9, 0]} castShadow>
        <icosahedronGeometry args={[0.85, 1]} />
        <meshStandardMaterial
          ref={material}
          color={breached ? '#ef4444' : '#facc15'}
          emissive={breached ? '#7f1d1d' : '#713f12'}
          metalness={0.7}
          roughness={0.25}
        />
      </mesh>
      <Text position={[0, 2.3, 0]} fontSize={0.4} color="#facc15" anchorX="center">
        {ASSET_LABEL}
      </Text>
      {breached && (
        <Text position={[0, 1.85, 0]} fontSize={0.3} color="#ef4444" anchorX="center">
          ALL LAYERS FAILED
        </Text>
      )}
    </group>
  );
}

function ControlsEnvironment() {
  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[6, 14, 6]} intensity={0.7} castShadow />
      <pointLight position={[0, 6, 0]} intensity={0.8} color="#facc15" />
      <gridHelper args={[40, 40, '#1e3a5f', '#111827']} position={[0, -2.6, 0]} />
      <ContactShadows opacity={0.35} scale={30} blur={2.4} far={12} resolution={512} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.62, 0]} receiveShadow>
        <planeGeometry args={[44, 44]} />
        <meshStandardMaterial color="#0b1220" metalness={0.8} roughness={0.4} />
      </mesh>
    </>
  );
}

interface Props {
  selectedId: string | null;
  failedIds: string[];
  onSelect: (id: string) => void;
  onContextLost?: () => void;
}

export function ControlsScene({ selectedId, failedIds, onSelect, onContextLost }: Props) {
  const failed = new Set(failedIds);
  const breached = DEFENCE_LAYERS.every((l) => failed.has(l.id));

  return (
    <Canvas
      shadows
      camera={{ position: [0, 11, 16], fov: 50, near: 0.1, far: 200 }}
      gl={{ antialias: true }}
      style={{ background: '#020617' }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener('webglcontextlost', (event) => {
          event.preventDefault();
          onContextLost?.();
        });
      }}
    >
      <ControlsEnvironment />
      <AssetCore breached={breached} />

      {DEFENCE_LAYERS.map((layer) => (
        <LayerRing
          key={layer.id}
          layer={layer}
          failed={failed.has(layer.id)}
          selected={layer.id === selectedId}
          onSelect={onSelect}
        />
      ))}

      <OrbitControls
        enableDamping
        dampingFactor={0.08}
        minDistance={5}
        maxDistance={40}
        maxPolarAngle={Math.PI / 2.1}
        target={[0, 0.6, 0]}
      />
    </Canvas>
  );
}
