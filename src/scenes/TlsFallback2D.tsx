import { TLS_HANDSHAKE } from '../data/tlsHandshake';

interface Props {
  selectedOrder: number | null;
  onSelect: (order: number) => void;
}

/**
 * SVG fallback for the TLS handshake — a sequence diagram, which is the
 * conventional way this exchange is drawn and matches the 3D layout's
 * top-to-bottom ordering.
 */
export function TlsFallback2D({ selectedOrder, onSelect }: Props) {
  const width = 720;
  const rowHeight = 46;
  const top = 74;
  const height = top + TLS_HANDSHAKE.length * rowHeight + 30;
  const clientX = 130;
  const serverX = width - 130;

  return (
    <div className="canvas-wrap" data-testid="tls-fallback-2d">
      <div className="absolute left-3 top-3 z-10 rounded border border-border bg-panel/90 px-3 py-1.5 text-xs text-muted">
        2D fallback — WebGL unavailable. The handshake is fully interactive.
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-full w-full"
        role="img"
        aria-label="TLS handshake sequence diagram, two-dimensional fallback view"
      >
        {/* Endpoints */}
        <rect
          x={clientX - 58}
          y={20}
          width={116}
          height={34}
          rx={6}
          fill="#111827"
          stroke="#3b82f6"
          strokeWidth={2}
        />
        <text x={clientX} y={42} textAnchor="middle" fontSize={13} fontWeight="600" fill="#e5e7eb">
          CLIENT
        </text>
        <rect
          x={serverX - 58}
          y={20}
          width={116}
          height={34}
          rx={6}
          fill="#111827"
          stroke="#22c55e"
          strokeWidth={2}
        />
        <text x={serverX} y={42} textAnchor="middle" fontSize={13} fontWeight="600" fill="#e5e7eb">
          SERVER
        </text>

        {/* Lifelines */}
        <line x1={clientX} y1={54} x2={clientX} y2={height - 14} stroke="#1e3a5f" strokeWidth={2} />
        <line x1={serverX} y1={54} x2={serverX} y2={height - 14} stroke="#1e3a5f" strokeWidth={2} />

        {TLS_HANDSHAKE.map((step, i) => {
          const y = top + i * rowHeight;
          const isLocal = step.carries.startsWith('(no message');
          const isSelected = step.order === selectedOrder;
          const fromX = step.from === 'client' ? clientX : serverX;
          const toX = step.from === 'client' ? serverX : clientX;
          const stroke = isLocal ? '#64748b' : step.from === 'client' ? '#3b82f6' : '#22c55e';

          return (
            <g
              key={step.order}
              onClick={() => onSelect(step.order)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect(step.order);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`Inspect step ${step.order} ${step.title}`}
              style={{ cursor: 'pointer' }}
            >
              {/* Wide transparent band so the whole row is clickable */}
              <rect
                x={0}
                y={y - rowHeight / 2}
                width={width}
                height={rowHeight}
                fill={isSelected ? '#1f2937' : 'transparent'}
              />

              {isLocal ? (
                // Local computation: a self-loop on the acting party's lifeline
                <path
                  d={`M ${fromX} ${y - 10} h ${fromX === clientX ? 46 : -46} v 20 h ${fromX === clientX ? -46 : 46}`}
                  fill="none"
                  stroke={stroke}
                  strokeWidth={isSelected ? 3 : 2}
                  strokeDasharray="4 3"
                />
              ) : (
                <line
                  x1={fromX}
                  y1={y}
                  x2={toX}
                  y2={y}
                  stroke={stroke}
                  strokeWidth={isSelected ? 3 : 2}
                />
              )}

              {!isLocal && <circle cx={toX} cy={y} r={5} fill={stroke} />}

              <text
                x={width / 2}
                y={y - 8}
                textAnchor="middle"
                fontSize={12}
                fontWeight={isSelected ? '600' : '400'}
                fill={isSelected ? '#ffffff' : '#cbd5e1'}
                style={{ pointerEvents: 'none' }}
              >
                {step.order}. {step.title}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
