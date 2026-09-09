import { IAM_BRIDGE_TOPICS, IAM_VENDORS } from '../data/iamBridge';

interface Props {
  selectedId?: string;
  onSelect: (id: string, type: 'topic' | 'vendor') => void;
  /** Vendors whose prerequisite concepts are still weak — drawn locked. */
  lockedVendorIds?: string[];
  /** Bridge topics resting on weak concepts — drawn dimmed. */
  weakTopicIds?: string[];
}

/**
 * SVG fallback for the Security+ to IAM bridge. Same three tiers as the 3D
 * scene and the same gating: concepts at the bottom, the implementation topic
 * they feed in the middle, the vendor platform on top — locked while its
 * prerequisite concepts are weak. Fully interactive without WebGL.
 */
export function IamBridgeFallback2D({
  selectedId,
  onSelect,
  lockedVendorIds = [],
  weakTopicIds = [],
}: Props) {
  const width = 1180;
  const height = 620;
  const locked = new Set(lockedVendorIds);
  const weak = new Set(weakTopicIds);

  const vendorW = 168;
  const topicW = 116;
  const vendorY = 90;
  const topicY = 300;
  const conceptY = 500;

  const vendorX = (i: number) => 40 + i * ((width - 80) / IAM_VENDORS.length);
  const topicX = (i: number) => 34 + i * ((width - 68) / IAM_BRIDGE_TOPICS.length);

  return (
    <div className="canvas-wrap" data-testid="iam-bridge-fallback-2d">
      <div className="absolute left-3 top-3 z-10 rounded border border-border bg-panel/90 px-3 py-1.5 text-xs text-muted">
        2D fallback — concepts, implementation, vendors. Fully interactive.
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-full w-full"
        role="img"
        aria-label="Security+ to IAM bridge: concept foundation, implementation topics, and vendor platforms, two-dimensional fallback view"
      >
        <defs>
          <linearGradient id="bridgeBg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0b1220" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
        </defs>
        <rect width={width} height={height} fill="url(#bridgeBg)" />

        <text x={20} y={40} fontSize={13} fill="#22c55e">
          3 · Vendor platforms — gated behind their concepts
        </text>
        <text x={20} y={264} fontSize={13} fill="#38bdf8">
          2 · How the control is actually implemented
        </text>
        <text x={20} y={conceptY - 12} fontSize={13} fill="#64748b">
          1 · Security+ concept foundation (already tracked)
        </text>

        {/* Topic -> vendor edges, drawn from each vendor's first mapped topic. */}
        {IAM_VENDORS.map((vendor, vi) => {
          const topicIndex = IAM_BRIDGE_TOPICS.findIndex((t) =>
            t.vendors.some((v) => v.vendorId === vendor.id)
          );
          if (topicIndex < 0) return null;
          const isLocked = locked.has(vendor.id);
          return (
            <line
              key={`edge-${vendor.id}`}
              x1={topicX(topicIndex) + topicW / 2}
              y1={topicY}
              x2={vendorX(vi) + vendorW / 2}
              y2={vendorY + 56}
              stroke={isLocked ? '#7f1d1d' : '#1e3a5f'}
              strokeWidth={2}
              strokeDasharray={isLocked ? '4 6' : undefined}
            />
          );
        })}

        {/* Concept -> topic edges. */}
        {IAM_BRIDGE_TOPICS.map((topic, i) => (
          <line
            key={`cedge-${topic.id}`}
            x1={topicX(i) + topicW / 2}
            y1={topicY + 74}
            x2={topicX(i) + topicW / 2}
            y2={conceptY}
            stroke="#1e3a5f"
            strokeWidth={2}
          />
        ))}

        {/* Vendor tier */}
        {IAM_VENDORS.map((vendor, i) => {
          const isLocked = locked.has(vendor.id);
          const isSelected = vendor.id === selectedId;
          return (
            <g
              key={vendor.id}
              onClick={() => onSelect(vendor.id, 'vendor')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect(vendor.id, 'vendor');
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`Inspect ${vendor.name}${isLocked ? ' (locked until prerequisite concepts are learned)' : ''}`}
              style={{ cursor: 'pointer' }}
            >
              <rect
                x={vendorX(i)}
                y={vendorY}
                width={vendorW}
                height={56}
                rx={10}
                fill="#0f172a"
                stroke={isLocked ? '#7f1d1d' : '#22c55e'}
                strokeWidth={isSelected ? 4 : 2}
                opacity={isLocked ? 0.6 : 1}
              />
              <text
                x={vendorX(i) + vendorW / 2}
                y={vendorY + 24}
                textAnchor="middle"
                fontSize={13}
                fontWeight="bold"
                fill={isLocked ? '#94a3b8' : '#e5e7eb'}
                style={{ pointerEvents: 'none' }}
              >
                {vendor.name}
              </text>
              <text
                x={vendorX(i) + vendorW / 2}
                y={vendorY + 43}
                textAnchor="middle"
                fontSize={10}
                fill={isLocked ? '#f87171' : '#94a3b8'}
                style={{ pointerEvents: 'none' }}
              >
                {isLocked ? 'locked — concepts first' : vendor.category}
              </text>
            </g>
          );
        })}

        {/* Topic tier */}
        {IAM_BRIDGE_TOPICS.map((topic, i) => {
          const isWeak = weak.has(topic.id);
          const isSelected = topic.id === selectedId;
          const short = topic.title.split(' — ')[0];
          return (
            <g
              key={topic.id}
              onClick={() => onSelect(topic.id, 'topic')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect(topic.id, 'topic');
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`Inspect bridge topic ${short}`}
              style={{ cursor: 'pointer', opacity: isWeak ? 0.5 : 1 }}
            >
              <rect
                x={topicX(i)}
                y={topicY}
                width={topicW}
                height={74}
                rx={8}
                fill="#111827"
                stroke={isWeak ? '#475569' : '#38bdf8'}
                strokeWidth={isSelected ? 4 : 2}
              />
              <text
                x={topicX(i) + topicW / 2}
                y={topicY + 30}
                textAnchor="middle"
                fontSize={11}
                fill="#e5e7eb"
                style={{ pointerEvents: 'none' }}
              >
                {short}
              </text>
              <text
                x={topicX(i) + topicW / 2}
                y={topicY + 52}
                textAnchor="middle"
                fontSize={9}
                fill={isWeak ? '#f59e0b' : '#64748b'}
                style={{ pointerEvents: 'none' }}
              >
                {isWeak ? 'concept weak' : `${topic.conceptIds.length} concepts`}
              </text>
            </g>
          );
        })}

        {/* Concept tier — the ids the topics above are built on. */}
        {IAM_BRIDGE_TOPICS.map((topic, i) => (
          <text
            key={`concept-${topic.id}`}
            x={topicX(i) + topicW / 2}
            y={conceptY + 18}
            textAnchor="middle"
            fontSize={9}
            fill="#64748b"
          >
            {topic.conceptIds[0]}
          </text>
        ))}

        <g transform={`translate(20, ${height - 30})`}>
          <circle cx={8} cy={-4} r={5} fill="#38bdf8" />
          <text x={20} y={0} fontSize={10} fill="#9ca3af">
            Implementation topic
          </text>
          <circle cx={168} cy={-4} r={5} fill="#22c55e" />
          <text x={180} y={0} fontSize={10} fill="#9ca3af">
            Vendor unlocked
          </text>
          <circle cx={310} cy={-4} r={5} fill="#7f1d1d" />
          <text x={322} y={0} fontSize={10} fill="#9ca3af">
            Vendor locked until its concepts are above mastery 2
          </text>
        </g>
      </svg>
    </div>
  );
}
