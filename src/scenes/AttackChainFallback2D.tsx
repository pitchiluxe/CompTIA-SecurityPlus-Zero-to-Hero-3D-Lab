import { ATTACK_CHAIN, type AttackStageId } from '../data/attackChain';

interface Props {
  selectedId: AttackStageId | null;
  brokenIds: string[];
  onSelect: (id: AttackStageId) => void;
}

/**
 * SVG fallback for the attack chain. The rail runs red up to the first broken
 * link and green after it, so containment is legible without any animation.
 */
export function AttackChainFallback2D({ selectedId, brokenIds, onSelect }: Props) {
  const width = 1000;
  const height = 300;
  const boxW = 132;
  const boxH = 78;
  const gap = (width - ATTACK_CHAIN.length * boxW) / (ATTACK_CHAIN.length + 1);
  const top = 110;
  const railY = top - 26;

  const broken = new Set(brokenIds);
  const firstBroken = ATTACK_CHAIN.find((s) => broken.has(s.id));

  const xFor = (i: number) => gap + i * (boxW + gap);
  const centreFor = (i: number) => xFor(i) + boxW / 2;

  const breakX = firstBroken
    ? centreFor(ATTACK_CHAIN.findIndex((s) => s.id === firstBroken.id))
    : width - gap / 2;

  return (
    <div className="canvas-wrap" data-testid="attack-chain-fallback-2d">
      <div className="absolute left-3 top-3 z-10 rounded border border-border bg-panel/90 px-3 py-1.5 text-xs text-muted">
        2D fallback — WebGL unavailable. The chain is fully interactive.
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-full w-full"
        role="img"
        aria-label="Six-stage attack chain from delivery to alert, two-dimensional fallback view"
      >
        {/* Rail: compromise progresses in red until the first broken link */}
        <line x1={gap / 2} y1={railY} x2={breakX} y2={railY} stroke="#ef4444" strokeWidth={3} />
        <line
          x1={breakX}
          y1={railY}
          x2={width - gap / 2}
          y2={railY}
          stroke={firstBroken ? '#22c55e' : '#ef4444'}
          strokeWidth={3}
          strokeDasharray={firstBroken ? '6 6' : undefined}
        />
        <text x={gap / 2} y={railY - 12} fontSize={12} fill="#ef4444">
          ATTACKER →
        </text>
        {firstBroken && (
          <text x={breakX + 8} y={railY - 12} fontSize={12} fill="#22c55e">
            CONTAINED at stage {firstBroken.order}
          </text>
        )}

        {ATTACK_CHAIN.map((stage, i) => {
          const x = xFor(i);
          const isBroken = broken.has(stage.id);
          const isSelected = stage.id === selectedId;
          const stopped = firstBroken !== undefined && stage.order > firstBroken.order;

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
              aria-label={`Inspect stage ${stage.order} ${stage.title}${isBroken ? ', broken' : ''}`}
              style={{ cursor: 'pointer' }}
            >
              <rect
                x={x}
                y={top}
                width={boxW}
                height={boxH}
                rx={8}
                fill={isSelected ? '#1f2937' : '#111827'}
                stroke={isBroken ? '#22c55e' : stage.color}
                strokeWidth={isSelected ? 3 : 2}
                strokeOpacity={stopped ? 0.3 : 1}
                strokeDasharray={isBroken ? '5 4' : undefined}
              />
              <text
                x={x + boxW / 2}
                y={top + 28}
                textAnchor="middle"
                fontSize={13}
                fontWeight="600"
                fill={stopped ? '#64748b' : '#e5e7eb'}
                style={{ pointerEvents: 'none' }}
              >
                {stage.order}. {stage.title}
              </text>
              <text
                x={x + boxW / 2}
                y={top + 48}
                textAnchor="middle"
                fontSize={10}
                fill="#9ca3af"
                style={{ pointerEvents: 'none' }}
              >
                {stage.actor}
              </text>
              <text
                x={x + boxW / 2}
                y={top + 66}
                textAnchor="middle"
                fontSize={10}
                fill={isBroken ? '#22c55e' : stage.color}
                style={{ pointerEvents: 'none' }}
              >
                {isBroken ? 'BROKEN' : `${stage.detection.length} signals`}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
