/**
 * 2D fallback for Career Mode — conceptual career pathway visualization.
 * 
 * Since Career Mode is about skill-to-role mapping and career preparation
 * rather than physical network topology, this visualization shows the
 * conceptual pathway from Security+ concepts to target career roles.
 */

export function CareerFallback2D() {
  const CAREER_PATHS = [
    { from: 'Foundations', to: 'SOC Track', color: '#3b82f6' },
    { from: 'Incident Response', to: 'SOC Track', color: '#3b82f6' },
    { from: 'IAM', to: 'IAM Track', color: '#22c55e' },
    { from: 'Network Security', to: 'General Track', color: '#f59e0b' },
    { from: 'Vulnerability Mgmt', to: 'General Track', color: '#f59e0b' },
  ];

  const ROLE_BOXES = [
    { id: 'soc-track', label: 'SOC Track', x: 300, y: 100, color: '#3b82f6' },
    { id: 'iam-track', label: 'IAM Track', x: 600, y: 100, color: '#22c55e' },
    { id: 'general-track', label: 'General Track', x: 450, y: 300, color: '#f59e0b' },
  ];

  const SKILL_BOXES = [
    { id: 'foundations', label: 'Foundations', x: 100, y: 450, color: '#64748b' },
    { id: 'incident-response', label: 'Incident Response', x: 300, y: 450, color: '#64748b' },
    { id: 'iam', label: 'IAM', x: 500, y: 450, color: '#64748b' },
    { id: 'network', label: 'Network Security', x: 700, y: 450, color: '#64748b' },
    { id: 'vuln', label: 'Vulnerability Mgmt', x: 900, y: 450, color: '#64748b' },
  ];

  const width = 1100;
  const height = 550;

  return (
    <div className="canvas-wrap" data-testid="career-fallback-2d">
      <div className="absolute left-3 top-3 z-10 rounded border border-border bg-panel/90 px-3 py-1.5 text-xs text-muted">
        2D fallback — Career Mode pathway visualization
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-full w-full"
        role="img"
        aria-label="Career pathway from Security+ concepts to target roles"
      >
        {/* Background gradient */}
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
        </defs>
        <rect width={width} height={height} fill="url(#bgGradient)" />

        {/* Section labels */}
        <text x={width / 2} y={50} textAnchor="middle" fontSize={18} fill="#e5e7eb" fontWeight="bold">
          Target Career Roles
        </text>
        <text x={width / 2} y={420} textAnchor="middle" fontSize={16} fill="#9ca3af">
          Security+ Skill Foundations
        </text>

        {/* Connection lines from skills to roles */}
        {CAREER_PATHS.map((path, i) => {
          const skillBox = SKILL_BOXES[i % SKILL_BOXES.length];
          const roleBox = ROLE_BOXES[i % ROLE_BOXES.length];
          return (
            <line
              key={`path-${i}`}
              x1={skillBox.x + 60}
              y1={skillBox.y - 20}
              x2={roleBox.x + 70}
              y2={roleBox.y + 40}
              stroke={path.color}
              strokeWidth={2}
              strokeDasharray="5 5"
              opacity={0.6}
            />
          );
        })}

        {/* Skill foundation boxes */}
        {SKILL_BOXES.map((skill) => (
          <g key={skill.id}>
            <rect
              x={skill.x}
              y={skill.y}
              width={120}
              height={50}
              rx={8}
              fill="#1e293b"
              stroke={skill.color}
              strokeWidth={2}
            />
            <text
              x={skill.x + 60}
              y={skill.y + 30}
              textAnchor="middle"
              fontSize={11}
              fill="#e5e7eb"
            >
              {skill.label}
            </text>
          </g>
        ))}

        {/* Career role boxes */}
        {ROLE_BOXES.map((role) => (
          <g key={role.id}>
            <rect
              x={role.x}
              y={role.y}
              width={140}
              height={60}
              rx={10}
              fill="#0f172a"
              stroke={role.color}
              strokeWidth={3}
            />
            <text
              x={role.x + 70}
              y={role.y + 25}
              textAnchor="middle"
              fontSize={12}
              fill="#e5e7eb"
              fontWeight="bold"
            >
              {role.label}
            </text>
            <text
              x={role.x + 70}
              y={role.y + 45}
              textAnchor="middle"
              fontSize={10}
              fill="#9ca3af"
            >
              Entry-Level
            </text>
          </g>
        ))}

        {/* Central career progression arrow */}
        <g transform={`translate(${width / 2}, ${height / 2})`}>
          <text x={0} y={0} textAnchor="middle" fontSize={14} fill="#64748b" fontStyle="italic">
            Career Mode
          </text>
          <text x={0} y={20} textAnchor="middle" fontSize={12} fill="#9ca3af">
            Skills → Roles → Jobs
          </text>
        </g>

        {/* Legend */}
        <g transform="translate(50, 520)">
          <rect x={0} y={0} width={200} height={25} rx={4} fill="#1e293b" opacity={0.8} />
          <circle cx={15} cy={12} r={4} fill="#3b82f6" />
          <text x={25} y={16} fontSize={10} fill="#9ca3af">
            Blue: SOC Track
          </text>
          <circle cx={95} cy={12} r={4} fill="#22c55e" />
          <text x={105} y={16} fontSize={10} fill="#9ca3af">
            Green: IAM Track
          </text>
        </g>
      </svg>
    </div>
  );
}