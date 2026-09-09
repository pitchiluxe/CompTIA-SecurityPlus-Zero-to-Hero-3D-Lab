import { BOUNDARIES, NETWORK_ZONES, type ZoneId } from '../data/networkZones';

interface Props {
  selectedZone: ZoneId | null;
  selectedBoundary: string | null;
  onSelectZone: (id: ZoneId) => void;
  onSelectBoundary: (id: string) => void;
}

/**
 * SVG fallback for the zone architecture. Tiers descend from untrusted at the
 * top to trusted at the bottom, matching the 3D layout, with boundary gates
 * drawn on the links between tiers.
 */
export function ZoneFallback2D({
  selectedZone,
  selectedBoundary,
  onSelectZone,
  onSelectBoundary,
}: Props) {
  const width = 900;
  const height = 460;
  const tierY = [50, 145, 240, 350];
  const centre = width / 2;

  const segmentW = 168;
  // World offsets step by 5 units, so the pixels-per-unit scale must be at
  // least (boxWidth + gap) / 5 or adjacent segment boxes overlap.
  const offsetScale = (segmentW + 22) / 5;

  const boxFor = (zone: (typeof NETWORK_ZONES)[number]) => {
    const isSegment = zone.tier === 3;
    const w = isSegment ? segmentW : zone.tier === 0 ? 620 : 420;
    const x = centre + zone.offset * offsetScale - w / 2;
    return { x, y: tierY[zone.tier], w, h: isSegment ? 74 : 56 };
  };

  return (
    <div className="canvas-wrap" data-testid="zone-fallback-2d">
      <div className="absolute left-3 top-3 z-10 rounded border border-border bg-panel/90 px-3 py-1.5 text-xs text-muted">
        2D fallback — WebGL unavailable. Zones and boundaries are fully interactive.
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-full w-full"
        role="img"
        aria-label="Enterprise security zone architecture, two-dimensional fallback view"
      >
        <text x={14} y={tierY[0] + 20} fontSize={11} fill="#ef4444">
          UNTRUSTED
        </text>
        <text x={14} y={tierY[3] + 40} fontSize={11} fill="#a855f7">
          TRUSTED
        </text>

        {/* Links between tiers, with a clickable gate at the midpoint */}
        {BOUNDARIES.map((b) => {
          const from = NETWORK_ZONES.find((z) => z.id === b.from);
          const to = NETWORK_ZONES.find((z) => z.id === b.to);
          if (!from || !to || from.tier === to.tier) return null;

          const fb = boxFor(from);
          const tb = boxFor(to);
          const x1 = fb.x + fb.w / 2;
          const y1 = fb.y + fb.h;
          const x2 = tb.x + tb.w / 2;
          const y2 = tb.y;
          const mx = (x1 + x2) / 2;
          const my = (y1 + y2) / 2;
          const isSelected = b.id === selectedBoundary;

          return (
            <g key={b.id}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#334155" strokeWidth={2} />
              <g
                onClick={() => onSelectBoundary(b.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectBoundary(b.id);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`Inspect boundary ${from.name} to ${to.name}`}
                style={{ cursor: 'pointer' }}
              >
                <circle
                  cx={mx}
                  cy={my}
                  r={isSelected ? 11 : 8}
                  fill="#111827"
                  stroke="#facc15"
                  strokeWidth={isSelected ? 3 : 2}
                />
                <circle cx={mx} cy={my} r={16} fill="transparent" />
              </g>
            </g>
          );
        })}

        {NETWORK_ZONES.map((zone) => {
          const b = boxFor(zone);
          const isSelected = zone.id === selectedZone;
          return (
            <g
              key={zone.id}
              onClick={() => onSelectZone(zone.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectZone(zone.id);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`Inspect zone ${zone.name}, trust ${zone.trust}`}
              style={{ cursor: 'pointer' }}
            >
              <rect
                x={b.x}
                y={b.y}
                width={b.w}
                height={b.h}
                rx={8}
                fill={isSelected ? '#1f2937' : '#111827'}
                stroke={zone.color}
                strokeWidth={isSelected ? 3 : 2}
              />
              <text
                x={b.x + b.w / 2}
                y={b.y + 26}
                textAnchor="middle"
                fontSize={14}
                fontWeight="600"
                fill="#e5e7eb"
                style={{ pointerEvents: 'none' }}
              >
                {zone.name}
              </text>
              <text
                x={b.x + b.w / 2}
                y={b.y + 44}
                textAnchor="middle"
                fontSize={10}
                fill="#9ca3af"
                style={{ pointerEvents: 'none' }}
              >
                trust {zone.trust}
                {zone.vlan ? ` · ${zone.vlan}` : ''}
              </text>
              {zone.cidr && zone.tier === 3 && (
                <text
                  x={b.x + b.w / 2}
                  y={b.y + 62}
                  textAnchor="middle"
                  fontSize={10}
                  fill="#64748b"
                  fontFamily="ui-monospace, monospace"
                  style={{ pointerEvents: 'none' }}
                >
                  {zone.cidr}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
