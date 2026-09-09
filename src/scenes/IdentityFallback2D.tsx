import { IDENTITY_LIFECYCLE, type LifecycleStageId } from '../data/identityLifecycle';

interface Props {
  selectedId: LifecycleStageId | null;
  onSelect: (id: LifecycleStageId) => void;
  /** Highlight only the stages in this JML flow, if one is selected. */
  highlightIds?: LifecycleStageId[];
}

/**
 * SVG fallback for the identity lifecycle. Same ring as the 3D scene: the
 * lifecycle closes because deprovisioning returns the identity to HR authority,
 * and a rehire rejoins the loop rather than starting a new one.
 */
export function IdentityFallback2D({ selectedId, onSelect, highlightIds }: Props) {
  const size = 520;
  const centre = size / 2;
  const radius = 178;
  const highlight = highlightIds ? new Set(highlightIds) : null;

  const pointAt = (angleDeg: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: centre + Math.cos(rad) * radius, y: centre + Math.sin(rad) * radius };
  };

  return (
    <div className="canvas-wrap" data-testid="identity-fallback-2d">
      <div className="absolute left-3 top-3 z-10 rounded border border-border bg-panel/90 px-3 py-1.5 text-xs text-muted">
        2D fallback — WebGL unavailable. The lifecycle is fully interactive.
      </div>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="h-full w-full"
        role="img"
        aria-label="Identity lifecycle ring from HR system to deprovisioning, two-dimensional fallback view"
      >
        <circle cx={centre} cy={centre} r={radius} fill="none" stroke="#312e81" strokeWidth={3} />
        <text x={centre} y={centre - 4} textAnchor="middle" fontSize={20} fill="#818cf8">
          IDENTITY
        </text>
        <text x={centre} y={centre + 16} textAnchor="middle" fontSize={10} fill="#475569">
          one person · one identity · many accounts
        </text>

        {IDENTITY_LIFECYCLE.map((stage) => {
          const p = pointAt(stage.angle);
          const isSelected = stage.id === selectedId;
          const dimmed = highlight !== null && !highlight.has(stage.id);
          // Labels outside the ring, pushed away from the centre.
          const outward = pointAt(stage.angle);
          const lx = centre + (outward.x - centre) * 1.2;
          const ly = centre + (outward.y - centre) * 1.2;

          return (
            <g
              key={stage.id}
              onClick={() => onSelect(stage.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect(stage.id);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`Inspect stage ${stage.order} ${stage.title}`}
              style={{ cursor: 'pointer', opacity: dimmed ? 0.3 : 1 }}
            >
              <circle
                cx={p.x}
                cy={p.y}
                r={isSelected ? 20 : 16}
                fill="#111827"
                stroke={stage.color}
                strokeWidth={isSelected ? 4 : 2}
              />
              <text
                x={p.x}
                y={p.y + 4}
                textAnchor="middle"
                fontSize={12}
                fontWeight="600"
                fill="#e5e7eb"
                style={{ pointerEvents: 'none' }}
              >
                {stage.order}
              </text>
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                fontSize={10}
                fill={dimmed ? '#475569' : '#cbd5e1'}
                style={{ pointerEvents: 'none' }}
              >
                {stage.title}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
