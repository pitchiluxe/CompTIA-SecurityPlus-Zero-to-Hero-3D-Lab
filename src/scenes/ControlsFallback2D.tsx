import { ASSET_LABEL, DEFENCE_LAYERS } from '../data/defenceLayers';

interface Props {
  selectedId: string | null;
  failedIds: string[];
  onSelect: (id: string) => void;
}

/**
 * SVG fallback for the defence-in-depth scene. Same concentric model, drawn as
 * nested circles: outermost ring is the outermost layer, the asset sits at the
 * centre. Failed layers render dashed and dimmed.
 */
export function ControlsFallback2D({ selectedId, failedIds, onSelect }: Props) {
  const size = 520;
  const centre = size / 2;
  const failed = new Set(failedIds);
  const breached = DEFENCE_LAYERS.every((l) => failed.has(l.id));

  // Map world radii (1.2 – 9) onto pixels. The padding has to clear the label
  // sitting above the outermost ring, or layer 1's caption is cut off.
  const labelHeadroom = 48;
  const maxRadius = Math.max(...DEFENCE_LAYERS.map((l) => l.radius));
  const scale = (centre - labelHeadroom) / maxRadius;

  return (
    <div className="canvas-wrap" data-testid="controls-fallback-2d">
      <div className="absolute left-3 top-3 z-10 rounded border border-border bg-panel/90 px-3 py-1.5 text-xs text-muted">
        2D fallback — WebGL unavailable. Layers are fully interactive.
      </div>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="h-full w-full"
        role="img"
        aria-label="Defence in depth layers surrounding the protected asset, two-dimensional fallback view"
      >
        {DEFENCE_LAYERS.map((layer) => {
          const r = layer.radius * scale;
          const isFailed = failed.has(layer.id);
          const isSelected = layer.id === selectedId;

          return (
            <g
              key={layer.id}
              onClick={() => onSelect(layer.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect(layer.id);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`Inspect layer ${layer.order} ${layer.title}${isFailed ? ', failed' : ''}`}
              style={{ cursor: 'pointer' }}
            >
              <circle
                cx={centre}
                cy={centre}
                r={r}
                fill="none"
                stroke={layer.color}
                strokeWidth={isSelected ? 4 : 2}
                strokeOpacity={isFailed ? 0.22 : 0.95}
                strokeDasharray={isFailed ? '6 6' : undefined}
              />
              {/* Invisible wider band so the ring is easy to click */}
              <circle
                cx={centre}
                cy={centre}
                r={r}
                fill="none"
                stroke="transparent"
                strokeWidth={14}
              />
              <text
                x={centre}
                y={centre - r - 6}
                textAnchor="middle"
                fontSize={11}
                fill={isFailed ? '#64748b' : '#e5e7eb'}
                style={{ pointerEvents: 'none' }}
              >
                {layer.order}. {layer.title}
                {isFailed ? ' — FAILED' : ''}
              </text>
            </g>
          );
        })}

        <circle
          cx={centre}
          cy={centre}
          r={16}
          fill={breached ? '#7f1d1d' : '#713f12'}
          stroke={breached ? '#ef4444' : '#facc15'}
          strokeWidth={2}
        />
        <text
          x={centre}
          y={centre + 34}
          textAnchor="middle"
          fontSize={12}
          fill={breached ? '#ef4444' : '#facc15'}
          style={{ pointerEvents: 'none' }}
        >
          {breached ? `${ASSET_LABEL} — ALL LAYERS FAILED` : ASSET_LABEL}
        </text>
      </svg>
    </div>
  );
}
