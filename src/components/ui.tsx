import type { ReactNode } from 'react';
import { PROVENANCE_LABELS, type Provenance } from '../sim/types';
import { MASTERY_COLORS, MASTERY_LABELS, type MasteryLevel } from '../types';

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {subtitle && <p className="mt-1 max-w-3xl text-sm text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </header>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg border border-border bg-panel p-5 ${className}`}>{children}</div>
  );
}

export function StatTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <Card>
      <div className="text-xs uppercase tracking-wider text-muted">{label}</div>
      <div className="mt-2 text-3xl font-bold text-white">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted">{hint}</div>}
    </Card>
  );
}

export function ProgressBar({ percent, label }: { percent: number; label?: string }) {
  return (
    <div>
      {label && (
        <div className="mb-1 flex justify-between text-xs text-muted">
          <span>{label}</span>
          <span className="font-mono text-white">{percent}%</span>
        </div>
      )}
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-panel-2"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? 'Progress'}
      >
        <div
          className="h-full rounded-full bg-accent transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

const PROVENANCE_STYLE: Record<Provenance, string> = {
  real: 'border-ok/40 bg-ok/10 text-ok',
  simulated: 'border-accent/40 bg-accent/10 text-accent',
  prepared: 'border-warn/40 bg-warn/10 text-warn',
};

/**
 * Required label on every piece of tool-shaped output. The platform never shows
 * command output without stating where it came from.
 */
export function ProvenanceBadge({ provenance }: { provenance: Provenance }) {
  return (
    <span
      className={`inline-block rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${PROVENANCE_STYLE[provenance]}`}
    >
      {PROVENANCE_LABELS[provenance]}
    </span>
  );
}

export function MasteryPill({ level }: { level: MasteryLevel }) {
  return (
    <span
      className="inline-block rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-black"
      style={{ backgroundColor: MASTERY_COLORS[level] }}
    >
      L{level} · {MASTERY_LABELS[level]}
    </span>
  );
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  disabled,
  type = 'button',
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'ghost' | 'danger';
  disabled?: boolean;
  type?: 'button' | 'submit';
}) {
  const styles = {
    primary: 'bg-accent text-black hover:bg-accent/85',
    ghost: 'border border-border bg-panel-2 text-white hover:bg-border',
    danger: 'border border-danger/50 bg-danger/10 text-danger hover:bg-danger/20',
  }[variant];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${styles}`}
    >
      {children}
    </button>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <Card className="text-center">
      <div className="text-sm font-medium text-white">{title}</div>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted">{body}</p>
    </Card>
  );
}
