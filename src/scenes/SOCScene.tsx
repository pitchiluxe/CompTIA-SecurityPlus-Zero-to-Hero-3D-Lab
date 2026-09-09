import { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import { SOC_DEVICES } from '../data/socDevices';
import type { Device } from '../types';

// ---------------------------------------------------------------------------
// Device appearance table. Shape and colour carry meaning: red = enforcement
// point, purple = identity/analytics, blue = endpoint, green = server.
// ---------------------------------------------------------------------------
const DEVICE_META: Record<
  string,
  { color: string; emissive: string; size: [number, number, number] }
> = {
  firewall: { color: '#ef4444', emissive: '#450a0a', size: [1.6, 1.2, 0.6] },
  server: { color: '#22c55e', emissive: '#052e16', size: [1.4, 2.0, 0.6] },
  switch: { color: '#f59e0b', emissive: '#451a03', size: [1.2, 0.5, 0.4] },
  router: { color: '#eab308', emissive: '#422006', size: [1.2, 0.6, 0.5] },
  ap: { color: '#06b6d4', emissive: '#083344', size: [0.4, 0.3, 0.4] },
  pc: { color: '#3b82f6', emissive: '#1e3a5f', size: [0.9, 1.0, 0.5] },
  laptop: { color: '#60a5fa', emissive: '#1e3a5f', size: [0.9, 0.6, 0.6] },
  dc: { color: '#a855f7', emissive: '#3b0764', size: [1.4, 2.0, 0.6] },
  siem: { color: '#8b5cf6', emissive: '#3b0764', size: [1.6, 1.0, 0.5] },
};

function DeviceMesh({
  device,
  selected,
  onInspect,
}: {
  device: Device;
  selected: boolean;
  onInspect: (d: Device) => void;
}) {
  // Typed as MeshStandardMaterial so `emissiveIntensity` is a known property —
  // Mesh#material is a union and would not type-check bare.
  const material = useRef<THREE.MeshStandardMaterial>(null);
  const meta = DEVICE_META[device.type] ?? DEVICE_META.pc;
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!material.current) return;
    if (device.status === 'alert') {
      // Pulse alerting devices so they read as urgent from across the room.
      const t = state.clock.getElapsedTime();
      material.current.emissiveIntensity = 0.6 + Math.sin(t * 4) * 0.4;
    } else {
      material.current.emissiveIntensity = hovered || selected ? 0.85 : 0.3;
    }
  });

  const halfHeight = meta.size[1] / 2;

  return (
    <group position={device.position}>
      <mesh
        position={[0, halfHeight, 0]}
        castShadow
        onClick={(e) => {
          e.stopPropagation();
          onInspect(device);
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
        <boxGeometry args={meta.size} />
        <meshStandardMaterial
          ref={material}
          color={device.status === 'alert' ? '#ef4444' : meta.color}
          emissive={meta.emissive}
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>

      {selected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[1.1, 1.35, 32]} />
          <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} />
        </mesh>
      )}

      <Text
        position={[0, meta.size[1] + 0.4, 0]}
        fontSize={0.28}
        color={hovered || selected ? '#ffffff' : '#cbd5e1'}
        anchorX="center"
        anchorY="middle"
        maxWidth={3.4}
      >
        {device.label}
      </Text>

      {device.status !== 'up' && (
        <Text
          position={[0, meta.size[1] + 0.12, 0]}
          fontSize={0.2}
          color="#f97316"
          anchorX="center"
          anchorY="middle"
        >
          {device.status.toUpperCase()}
        </Text>
      )}
    </group>
  );
}

/**
 * Animated event flow: a bead travelling from each device toward the SIEM,
 * making log aggregation visible rather than decorative.
 */
function EventFlow({
  from,
  to,
  offset,
}: {
  from: THREE.Vector3;
  to: THREE.Vector3;
  offset: number;
}) {
  const bead = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!bead.current) return;
    const t = (state.clock.getElapsedTime() * 0.25 + offset) % 1;
    bead.current.position.lerpVectors(from, to, t);
    // Arc the bead upward so overlapping paths stay distinguishable.
    bead.current.position.y += Math.sin(t * Math.PI) * 1.6;
  });

  return (
    <mesh ref={bead}>
      <sphereGeometry args={[0.09, 8, 8]} />
      <meshBasicMaterial color="#38bdf8" />
    </mesh>
  );
}

function SOCEnvironment({ alertCount }: { alertCount: number }) {
  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[6, 12, 6]} intensity={0.8} castShadow />
      <pointLight position={[-8, 4, 0]} intensity={0.6} color="#38bdf8" />
      <pointLight position={[8, 4, 0]} intensity={0.6} color="#818cf8" />

      <gridHelper args={[40, 40, '#1e3a5f', '#111827']} position={[0, 0, 0]} />
      <ContactShadows opacity={0.45} scale={36} blur={2.2} far={12} resolution={512} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[44, 44]} />
        <meshStandardMaterial color="#0b1220" metalness={0.85} roughness={0.35} />
      </mesh>

      {/* Video wall — the SOC monitoring display */}
      <group position={[0, 0, -12]}>
        <mesh position={[0, 3.4, 0]}>
          <boxGeometry args={[12, 4.6, 0.25]} />
          <meshStandardMaterial color="#0f172a" metalness={0.7} roughness={0.4} />
        </mesh>
        <mesh position={[0, 3.4, 0.16]}>
          <planeGeometry args={[11.4, 4.1]} />
          <meshBasicMaterial color="#020617" />
        </mesh>
        <Text position={[0, 4.7, 0.2]} fontSize={0.42} color="#38bdf8" anchorX="center">
          SECURITY OPERATIONS — LIVE
        </Text>
        <Text position={[0, 3.9, 0.2]} fontSize={0.3} color="#94a3b8" anchorX="center">
          Click any device to inspect it
        </Text>
        <Text
          position={[0, 3.1, 0.2]}
          fontSize={0.3}
          color={alertCount > 0 ? '#f97316' : '#22c55e'}
          anchorX="center"
        >
          {alertCount > 0
            ? `${alertCount} device(s) need triage — check device status`
            : 'All devices nominal'}
        </Text>
      </group>
    </>
  );
}

interface Props {
  onInspect: (device: Device) => void;
  selectedId?: string;
  devices?: Device[];
  /** Called when the GPU drops the WebGL context so the host can show 2D. */
  onContextLost?: () => void;
}

export function SOCScene({ onInspect, selectedId, devices = SOC_DEVICES, onContextLost }: Props) {
  const siem = devices.find((d) => d.type === 'siem');
  const alertCount = devices.filter((d) => d.status !== 'up').length;

  const flows = useMemo(() => {
    if (!siem) return [];
    const target = new THREE.Vector3(...siem.position);
    return devices
      .filter((d) => d.id !== siem.id)
      .map((d, i) => ({
        id: d.id,
        from: new THREE.Vector3(...d.position),
        to: target,
        offset: i / Math.max(1, devices.length - 1),
      }));
  }, [devices, siem]);

  return (
    <Canvas
      shadows
      camera={{ position: [0, 12, 20], fov: 50, near: 0.1, far: 200 }}
      gl={{ antialias: true }}
      style={{ background: '#020617' }}
      onCreated={({ gl }) => {
        // A lost context leaves a blank canvas with no React error to catch,
        // so report it upward and let the host switch to the 2D topology.
        gl.domElement.addEventListener('webglcontextlost', (event) => {
          event.preventDefault();
          onContextLost?.();
        });
      }}
    >
      <SOCEnvironment alertCount={alertCount} />

      {devices.map((d) => (
        <DeviceMesh key={d.id} device={d} selected={d.id === selectedId} onInspect={onInspect} />
      ))}

      {flows.map((f) => (
        <EventFlow key={`flow-${f.id}`} from={f.from} to={f.to} offset={f.offset} />
      ))}

      <OrbitControls
        enableDamping
        dampingFactor={0.08}
        minDistance={4}
        maxDistance={44}
        maxPolarAngle={Math.PI / 2.1}
        target={[0, 1, 0]}
      />
    </Canvas>
  );
}
