import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Boxes,
  ClipboardList,
  FlaskConical,
  Route as RouteIcon,
  ShieldAlert,
  Crosshair,
  Network,
  Fingerprint,
  Wrench,
  KeyRound,
  SirenIcon,
  ShieldHalf,
  ScanSearch,
  Cable,
  Flame,
  Layers,
  FolderGit2,
  LayoutDashboard,
  Map,
  NotebookPen,
  ShieldCheck,
  TrendingUp,
  Radar,
  Cloud,
  Smartphone,
  Database,
  ClipboardCheck,
  LifeBuoy,
  ShieldPlus,
  Terminal,
  Waves,
  Stethoscope,
  Award,
  GraduationCap,
  BriefcaseBusiness,
  IdCard,
} from 'lucide-react';
import { EXAM_PASSING_SCORE, EXAM_VERSION } from '../data/examBlueprint';
import { useMasteryStore } from '../store/useMasteryStore';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/roadmap', label: 'Roadmap', icon: Map, end: false },
  { to: '/soc', label: 'SOC Environment', icon: Boxes, end: false },
  { to: '/path', label: 'Connection Path', icon: RouteIcon, end: false },
  { to: '/controls', label: 'Defence in Depth', icon: Layers, end: false },
  { to: '/scenarios', label: 'Risk Scenarios', icon: ShieldAlert, end: false },
  { to: '/attack-chain', label: 'Attack Chain', icon: Crosshair, end: false },
  { to: '/zones', label: 'Security Zones', icon: Network, end: false },
  { to: '/identity', label: 'Identity Lifecycle', icon: Fingerprint, end: false },
  { to: '/iam-troubleshoot', label: 'IAM Troubleshooting', icon: Wrench, end: false },
  { to: '/crypto', label: 'Cryptography', icon: KeyRound, end: false },
  { to: '/soc-console', label: 'SOC Console', icon: SirenIcon, end: false },
  { to: '/hardening', label: 'Hardening Audit', icon: ShieldHalf, end: false },
  { to: '/vulnerabilities', label: 'Vulnerabilities', icon: ScanSearch, end: false },
  { to: '/network-review', label: 'Network Review', icon: Cable, end: false },
  { to: '/incident-console', label: 'Incident Console', icon: Flame, end: false },
  { to: '/threat-intel', label: 'Threat Intelligence', icon: Radar, end: false },
  { to: '/cloud-security', label: 'Cloud Security', icon: Cloud, end: false },
  { to: '/mobile-iot', label: 'Mobile / IoT Security', icon: Smartphone, end: false },
  { to: '/app-data-security', label: 'App & Data Security', icon: Database, end: false },
  { to: '/grc', label: 'Governance, Risk & Compliance', icon: ClipboardCheck, end: false },
  { to: '/bcdr', label: 'Business Continuity & DR', icon: LifeBuoy, end: false },
  { to: '/security-hardening', label: 'Security Hardening', icon: ShieldPlus, end: false },
  { to: '/automation', label: 'Security Automation', icon: Terminal, end: false },
  { to: '/packet-analysis', label: 'Packet Analysis', icon: Waves, end: false },
  { to: '/troubleshoot-center', label: 'Troubleshooting Center', icon: Stethoscope, end: false },
  { to: '/soc-capstone', label: 'Full SOC Capstone', icon: Award, end: false },
  { to: '/exam-prep', label: 'Exam Preparation', icon: GraduationCap, end: false },
  { to: '/career-mode', label: 'Career Mode', icon: BriefcaseBusiness, end: false },
  { to: '/iam-bridge', label: 'Security+ → IAM Bridge', icon: IdCard, end: false },
  { to: '/labs', label: 'Lab Library', icon: FlaskConical, end: false },
  { to: '/quiz', label: 'Quiz', icon: ClipboardList, end: false },
  { to: '/progress', label: 'Progress', icon: TrendingUp, end: false },
  { to: '/notes', label: 'Notes', icon: NotebookPen, end: false },
  { to: '/evidence', label: 'Evidence', icon: ShieldCheck, end: false },
  { to: '/github', label: 'GitHub Portfolio', icon: FolderGit2, end: false },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const overall = useMasteryStore((s) => s.overallPercent());

  return (
    <div className="flex min-h-screen bg-bg text-text">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-panel md:flex">
        <div className="border-b border-border px-5 py-5">
          <div className="text-xs font-semibold uppercase tracking-widest text-accent">
            Security+ {EXAM_VERSION}
          </div>
          <div className="mt-1 text-lg font-bold leading-tight text-white">Zero to Hero</div>
          <div className="mt-0.5 text-xs text-muted">3D Lab Platform</div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Main">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-panel-2 font-medium text-white'
                    : 'text-muted hover:bg-panel-2 hover:text-white',
                ].join(' ')
              }
            >
              <Icon size={16} aria-hidden />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border px-5 py-4">
          <div className="mb-1 flex justify-between text-xs text-muted">
            <span>Mastery</span>
            <span className="font-mono text-white">{overall}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-panel-2">
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{ width: `${overall}%` }}
            />
          </div>
          <p className="mt-3 text-[11px] leading-snug text-muted">
            Pass mark {EXAM_PASSING_SCORE}/900. All labs are simulated — nothing runs on your
            machine.
          </p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile nav */}
        <div className="flex gap-1 overflow-x-auto border-b border-border bg-panel px-3 py-2 md:hidden">
          {NAV.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                [
                  'whitespace-nowrap rounded px-3 py-1.5 text-xs',
                  isActive ? 'bg-panel-2 text-white' : 'text-muted',
                ].join(' ')
              }
            >
              {label}
            </NavLink>
          ))}
        </div>

        <main className="min-w-0 flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
