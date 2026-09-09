import type { Device } from '../types';

interface Props {
  devices: Device[];
  onInspect: (device: Device) => void;
}

const STATUS_COLOR: Record<Device['status'], string> = {
  up: '#22c55e',
  down: '#ef4444',
  alert: '#f97316',
  warning: '#f59e0b',
};

const TYPE_COLOR: Record<string, string> = {
  firewall: '#ef4444',
  server: '#22c55e',
  switch: '#f59e0b',
  router: '#eab308',
  ap: '#06b6d4',
  pc: '#3b82f6',
  dc: '#a855f7',
  siem: '#8b5cf6',
  laptop: '#60a5fa',
};

/**
 * SVG topology fallback for machines without WebGL.
 *
 * World coordinates are [x, y, z] with y = height; a top-down floor plan drops
 * y and maps (x, z) to (svgX, svgY), which is why the label under each node
 * still lines up with where the device sits in the 3D room.
 */
export function Fallback2D({ devices, onInspect }: Props) {
  const xs = devices.map((d) => d.position[0]);
  const zs = devices.map((d) => d.position[2]);
  const minX = Math.min(...xs, -1);
  const maxX = Math.max(...xs, 1);
  const minZ = Math.min(...zs, -1);
  const maxZ = Math.max(...zs, 1);

  const pad = 90;
  const width = 900;
  const height = 520;
  const spanX = maxX - minX || 1;
  const spanZ = maxZ - minZ || 1;

  // Dropping the y axis can make two devices that differ only in height land on
  // the same point. Nudge any exact collision so every node stays clickable.
  const placed = new Map<string, [number, number]>();
  const toSvg = (d: Device): [number, number] => {
    const cached = placed.get(d.id);
    if (cached) return cached;

    let x = pad + ((d.position[0] - minX) / spanX) * (width - pad * 2);
    let y = pad + ((d.position[2] - minZ) / spanZ) * (height - pad * 2);

    let guard = 0;
    while (
      [...placed.values()].some(([px, py]) => Math.abs(px - x) < 76 && Math.abs(py - y) < 62) &&
      guard < 12
    ) {
      x += 80;
      y += 20;
      guard += 1;
    }

    placed.set(d.id, [x, y]);
    return [x, y];
  };

  const firewall = devices.find((d) => d.type === 'firewall');
  const fwPoint = firewall ? toSvg(firewall) : null;

  return (
    <div className="canvas-wrap" data-testid="fallback-2d">
      <div className="absolute left-3 top-3 z-10 rounded border border-border bg-panel/90 px-3 py-1.5 text-xs text-muted">
        2D fallback — WebGL unavailable. Topology is fully interactive.
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-full w-full"
        role="img"
        aria-label="SOC network topology, two-dimensional fallback view"
      >
        {/* Links: everything homes back to the firewall, matching the room layout */}
        {fwPoint &&
          devices
            .filter((d) => d.type !== 'firewall')
            .map((d) => {
              const [x, y] = toSvg(d);
              return (
                <line
                  key={`link-${d.id}`}
                  x1={fwPoint[0]}
                  y1={fwPoint[1]}
                  x2={x}
                  y2={y}
                  stroke="#1e3a5f"
                  strokeWidth={1.5}
                  strokeDasharray={d.status === 'down' ? '4 4' : undefined}
                />
              );
            })}

        {devices.map((d) => {
          const [x, y] = toSvg(d);
          return (
            <g
              key={d.id}
              transform={`translate(${x}, ${y})`}
              onClick={() => onInspect(d)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onInspect(d);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`Inspect ${d.label}, status ${d.status}`}
              style={{ cursor: 'pointer' }}
            >
              <rect
                x={-34}
                y={-20}
                width={68}
                height={40}
                rx={6}
                fill="#111827"
                stroke={TYPE_COLOR[d.type] ?? '#3b82f6'}
                strokeWidth={2}
              />
              <circle cx={22} cy={-10} r={4} fill={STATUS_COLOR[d.status]} />
              <text
                textAnchor="middle"
                y={4}
                fontSize={10}
                fill="#e5e7eb"
                style={{ pointerEvents: 'none' }}
              >
                {d.type.toUpperCase()}
              </text>
              <text
                textAnchor="middle"
                y={36}
                fontSize={11}
                fill="#9ca3af"
                style={{ pointerEvents: 'none' }}
              >
                {d.label}
              </text>
              {d.ip && (
                <text
                  textAnchor="middle"
                  y={50}
                  fontSize={10}
                  fill="#64748b"
                  fontFamily="ui-monospace, monospace"
                  style={{ pointerEvents: 'none' }}
                >
                  {d.ip}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
