import { PATH_STAGES, type PathStageId } from '../data/connectionPath';

interface Props {
  selectedId: PathStageId | null;
  onSelect: (id: PathStageId) => void;
}

/**
 * SVG fallback for the connection path. Same five stages, same left-to-right
 * request lane and right-to-left response lane, no GPU required.
 */
export function PathFallback2D({ selectedId, onSelect }: Props) {
  const width = 960;
  // Sized to the content (lanes at top-30 and top+boxH+50) so the SVG does not
  // scale down to fit dead space when it stretches to the container height.
  const height = 300;
  const boxW = 150;
  const boxH = 90;
  const gap = (width - PATH_STAGES.length * boxW) / (PATH_STAGES.length + 1);
  const top = 105;

  const xFor = (i: number) => gap + i * (boxW + gap);

  return (
    <div className="canvas-wrap" data-testid="path-fallback-2d">
      <div className="absolute left-3 top-3 z-10 rounded border border-border bg-panel/90 px-3 py-1.5 text-xs text-muted">
        2D fallback — WebGL unavailable. The path is fully interactive.
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-full w-full"
        role="img"
        aria-label="Connection path from user to security controls, two-dimensional fallback view"
      >
        {/* Request lane */}
        <line
          x1={gap / 2}
          y1={top - 30}
          x2={width - gap / 2}
          y2={top - 30}
          stroke="#1e40af"
          strokeWidth={3}
        />
        <text x={width / 2} y={top - 40} textAnchor="middle" fontSize={12} fill="#3b82f6">
          REQUEST →
        </text>

        {/* Response lane */}
        <line
          x1={gap / 2}
          y1={top + boxH + 30}
          x2={width - gap / 2}
          y2={top + boxH + 30}
          stroke="#166534"
          strokeWidth={3}
        />
        <text x={width / 2} y={top + boxH + 50} textAnchor="middle" fontSize={12} fill="#22c55e">
          ← RESPONSE
        </text>

        {PATH_STAGES.map((stage, i) => {
          const x = xFor(i);
          const selected = stage.id === selectedId;
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
              aria-label={`Inspect stage ${stage.title}, ${stage.steps.length} steps`}
              style={{ cursor: 'pointer' }}
            >
              <rect
                x={x}
                y={top}
                width={boxW}
                height={boxH}
                rx={8}
                fill={selected ? '#1f2937' : '#111827'}
                stroke={stage.color}
                strokeWidth={selected ? 3 : 2}
              />
              <text
                x={x + boxW / 2}
                y={top + 32}
                textAnchor="middle"
                fontSize={15}
                fill="#e5e7eb"
                fontWeight="600"
                style={{ pointerEvents: 'none' }}
              >
                {stage.title}
              </text>
              <text
                x={x + boxW / 2}
                y={top + 54}
                textAnchor="middle"
                fontSize={10}
                fill="#9ca3af"
                style={{ pointerEvents: 'none' }}
              >
                {stage.subtitle}
              </text>
              <text
                x={x + boxW / 2}
                y={top + 74}
                textAnchor="middle"
                fontSize={10}
                fill={stage.color}
                style={{ pointerEvents: 'none' }}
              >
                {stage.steps.length} step{stage.steps.length === 1 ? '' : 's'}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
