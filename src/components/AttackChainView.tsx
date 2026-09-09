import { Component, Suspense, lazy, useState, type ReactNode } from 'react';
import { Boxes, LayoutGrid, RotateCcw, ShieldCheck } from 'lucide-react';
import {
  ATTACK_CHAIN,
  detectionOpportunityCount,
  getAttackStage,
  type AttackStageId,
} from '../data/attackChain';
import { isWebGLAvailable } from '../lib/webgl';
import { AttackChainFallback2D } from '../scenes/AttackChainFallback2D';
import { Button, Card, PageHeader } from './ui';

const AttackChainScene = lazy(() =>
  import('../scenes/AttackChainScene').then((m) => ({ default: m.AttackChainScene }))
);

class CanvasBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

const ACTOR_TONE: Record<string, string> = {
  attacker: 'text-danger',
  user: 'text-warn',
  system: 'text-muted',
  defender: 'text-accent',
};

export function AttackChainView() {
  const [selectedId, setSelectedId] = useState<AttackStageId | null>('delivery');
  const [brokenIds, setBrokenIds] = useState<string[]>([]);
  const [force2D, setForce2D] = useState(false);
  const [webglOk, setWebglOk] = useState(isWebGLAvailable);

  const use2D = force2D || !webglOk;
  const stage = selectedId ? getAttackStage(selectedId) : undefined;
  const broken = new Set(brokenIds);
  const firstBroken = ATTACK_CHAIN.find((s) => broken.has(s.id));

  const toggleBroken = (id: string) =>
    setBrokenIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));

  return (
    <>
      <PageHeader
        title="Attack Chain"
        subtitle="A simulated spear-phishing compromise in six stages. Nothing is executed and no credentials are handled anywhere — each stage describes the evidence such an attack would leave. Break any one link and the chain stops."
        actions={
          <>
            {brokenIds.length > 0 && (
              <Button variant="ghost" onClick={() => setBrokenIds([])}>
                <span className="flex items-center gap-2">
                  <RotateCcw size={14} aria-hidden /> Reset chain
                </span>
              </Button>
            )}
            <button
              type="button"
              onClick={() => setForce2D((v) => !v)}
              disabled={!webglOk}
              className="flex items-center gap-2 rounded-md border border-border bg-panel-2 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-border disabled:opacity-40"
            >
              {use2D ? <Boxes size={16} aria-hidden /> : <LayoutGrid size={16} aria-hidden />}
              {use2D ? 'Switch to 3D' : 'Switch to 2D'}
            </button>
          </>
        }
      />

      <div className="mb-4 rounded-md border border-accent/40 bg-accent/5 px-4 py-3 text-sm text-muted">
        <strong className="text-accent">Simulation only.</strong> This platform describes attacker
        behaviour so you can recognise and defend against it. No malicious code, credential capture,
        or attack tooling exists in this project.
      </div>

      {!webglOk && (
        <div className="mb-4 rounded-md border border-warn/40 bg-warn/10 px-4 py-3 text-sm text-warn">
          WebGL is unavailable in this browser or on this hardware. The 2D chain below carries the
          same content and is fully interactive.
        </div>
      )}

      <div className="canvas-wrap" style={{ height: '46vh' }}>
        {use2D ? (
          <AttackChainFallback2D
            selectedId={selectedId}
            brokenIds={brokenIds}
            onSelect={setSelectedId}
          />
        ) : (
          <CanvasBoundary onError={() => setWebglOk(false)}>
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center text-sm text-muted">
                  Loading 3D environment…
                </div>
              }
            >
              <AttackChainScene
                selectedId={selectedId}
                brokenIds={brokenIds}
                onSelect={setSelectedId}
                onToggleBroken={toggleBroken}
                onContextLost={() => setWebglOk(false)}
              />
            </Suspense>
          </CanvasBoundary>
        )}
      </div>

      <Card className="mt-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
              Break the chain
            </h2>
            <p className="mt-1 text-xs text-muted">
              You do not have to stop every stage — only one. {detectionOpportunityCount()} distinct
              detection signals exist across the six stages.
            </p>
          </div>
          <div
            className={`rounded-md border px-4 py-2 text-sm font-medium ${
              firstBroken
                ? 'border-ok/50 bg-ok/10 text-ok'
                : 'border-danger/50 bg-danger/10 text-danger'
            }`}
            data-testid="chain-status"
          >
            {firstBroken
              ? `Contained at stage ${firstBroken.order} — ${firstBroken.title}`
              : 'Chain complete — compromise reaches command and control'}
          </div>
        </div>

        <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {ATTACK_CHAIN.map((s) => {
            const isBroken = broken.has(s.id);
            const stopped = firstBroken !== undefined && s.order > firstBroken.order;
            return (
              <li key={s.id} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedId(s.id)}
                  className={`min-w-0 flex-1 truncate rounded px-2 py-1.5 text-left text-sm transition-colors ${
                    s.id === selectedId
                      ? 'bg-panel-2 text-white'
                      : 'text-muted hover:bg-panel-2 hover:text-white'
                  } ${stopped ? 'opacity-40' : ''}`}
                >
                  {s.order}. {s.title}
                </button>
                <button
                  type="button"
                  onClick={() => toggleBroken(s.id)}
                  aria-label={`${isBroken ? 'Restore' : 'Break'} the chain at stage ${s.order}, ${s.title}`}
                  className={`shrink-0 rounded border px-2 py-1 text-[11px] font-medium transition-colors ${
                    isBroken
                      ? 'border-ok/50 bg-ok/10 text-ok'
                      : 'border-border bg-panel-2 text-muted hover:text-white'
                  }`}
                >
                  {isBroken ? 'Broken' : 'Break'}
                </button>
              </li>
            );
          })}
        </ul>
      </Card>

      {stage && (
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <Card>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
                Stage {stage.order} — {stage.title}
              </h2>
              <span className={`text-xs font-semibold ${ACTOR_TONE[stage.actor]}`}>
                {stage.actor}
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-white">{stage.summary}</p>

            <dl className="mt-5 space-y-2 text-xs">
              <div>
                <dt className="text-muted">Control that should catch it</dt>
                <dd className="mt-0.5 text-white">{stage.controlThatShouldCatchIt}</dd>
              </div>
              <div>
                <dt className="text-muted">Defence layer (Phase 2)</dt>
                <dd className="mt-0.5 text-white">{stage.defenceLayer}</dd>
              </div>
              <div>
                <dt className="text-muted">ATT&CK tactic</dt>
                <dd className="mt-0.5 text-white">{stage.attackTactic}</dd>
              </div>
            </dl>
          </Card>

          <Card>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
              Evidence produced
            </h2>
            <p className="mt-1 text-xs text-muted">Where a defender would go and look.</p>
            <ul className="mt-3 space-y-2 text-sm text-white">
              {stage.evidence.map((e) => (
                <li key={e}>· {e}</li>
              ))}
            </ul>
          </Card>

          <Card>
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted">
              <ShieldCheck size={14} aria-hidden /> Detection signals
            </h2>
            <p className="mt-1 text-xs text-muted">What specifically to look for.</p>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              {stage.detection.map((d) => (
                <li key={d}>· {d}</li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </>
  );
}
