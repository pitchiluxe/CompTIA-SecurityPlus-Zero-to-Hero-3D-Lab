import { Component, Suspense, lazy, useState, type ReactNode } from 'react';
import { Boxes, LayoutGrid } from 'lucide-react';
import {
  IDENTITY_LIFECYCLE,
  getLifecycleStage,
  stagesForJML,
  type LifecycleStageId,
} from '../data/identityLifecycle';
import { isWebGLAvailable } from '../lib/webgl';
import { IdentityFallback2D } from '../scenes/IdentityFallback2D';
import { Card, PageHeader } from './ui';

const IdentityScene = lazy(() =>
  import('../scenes/IdentityScene').then((m) => ({ default: m.IdentityScene }))
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

type JmlFilter = 'all' | 'joiner' | 'mover' | 'leaver';

const JML_LABELS: Record<JmlFilter, string> = {
  all: 'Full lifecycle',
  joiner: 'Joiner',
  mover: 'Mover',
  leaver: 'Leaver',
};

export function IdentityView() {
  const [selectedId, setSelectedId] = useState<LifecycleStageId | null>('hr-system');
  const [flow, setFlow] = useState<JmlFilter>('all');
  const [force2D, setForce2D] = useState(false);
  const [webglOk, setWebglOk] = useState(isWebGLAvailable);

  const use2D = force2D || !webglOk;
  const stage = selectedId ? getLifecycleStage(selectedId) : undefined;
  const flowStages = flow === 'all' ? IDENTITY_LIFECYCLE : stagesForJML(flow);
  const highlightIds = flow === 'all' ? undefined : flowStages.map((s) => s.id);

  return (
    <>
      <PageHeader
        title="Identity Lifecycle"
        subtitle="HR → identity platform → account creation → MFA → SSO → application access → authorization → audit logs → deprovisioning. A ring rather than a line, because a rehire rejoins the loop instead of starting a new one."
        actions={
          <button
            type="button"
            onClick={() => setForce2D((v) => !v)}
            disabled={!webglOk}
            className="flex items-center gap-2 rounded-md border border-border bg-panel-2 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-border disabled:opacity-40"
          >
            {use2D ? <Boxes size={16} aria-hidden /> : <LayoutGrid size={16} aria-hidden />}
            {use2D ? 'Switch to 3D' : 'Switch to 2D'}
          </button>
        }
      />

      {!webglOk && (
        <div className="mb-4 rounded-md border border-warn/40 bg-warn/10 px-4 py-3 text-sm text-warn">
          WebGL is unavailable in this browser or on this hardware. The 2D lifecycle below carries
          the same content and is fully interactive.
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="canvas-wrap lg:col-span-3" style={{ height: '54vh' }}>
          {use2D ? (
            <IdentityFallback2D
              selectedId={selectedId}
              onSelect={setSelectedId}
              highlightIds={highlightIds}
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
                <IdentityScene
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  onContextLost={() => setWebglOk(false)}
                />
              </Suspense>
            </CanvasBoundary>
          )}
        </div>

        <Card className="lg:col-span-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
            Joiner · Mover · Leaver
          </h2>
          <p className="mt-1 text-xs text-muted">
            Each flow touches a different subset of the lifecycle. Their characteristic failures
            differ too: joiners are late, movers accumulate, leavers are slow.
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {(Object.keys(JML_LABELS) as JmlFilter[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFlow(f)}
                className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                  f === flow
                    ? 'border-accent bg-accent/10 text-white'
                    : 'border-border bg-panel-2 text-muted hover:text-white'
                }`}
              >
                {JML_LABELS[f]}
              </button>
            ))}
          </div>

          <div className="mt-4" data-testid="flow-stage-count">
            <span className="text-2xl font-bold text-white">{flowStages.length}</span>{' '}
            <span className="ml-2 text-sm text-muted">
              of {IDENTITY_LIFECYCLE.length} stages in this flow
            </span>
          </div>

          <ul className="mt-3 space-y-1">
            {flowStages.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(s.id)}
                  className={`w-full truncate rounded px-2 py-1.5 text-left text-sm transition-colors ${
                    s.id === selectedId
                      ? 'bg-panel-2 text-white'
                      : 'text-muted hover:bg-panel-2 hover:text-white'
                  }`}
                >
                  {s.order}. {s.title}
                </button>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {stage && (
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <Card>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
              Stage {stage.order} — {stage.title}
            </h2>
            <p className="mt-1 text-xs text-accent">{stage.system}</p>
            <p className="mt-3 text-sm leading-relaxed text-white">{stage.summary}</p>

            <h3 className="mt-5 text-xs uppercase tracking-wider text-muted">
              Produces for the next stage
            </h3>
            <ul className="mt-2 space-y-1 text-sm text-white">
              {stage.produces.map((p) => (
                <li key={p}>· {p}</li>
              ))}
            </ul>
          </Card>

          <Card>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
              Controls here
            </h2>
            <ul className="mt-3 space-y-1.5 text-sm text-white">
              {stage.controls.map((c) => (
                <li key={c}>· {c}</li>
              ))}
            </ul>
            <h3 className="mt-5 text-xs uppercase tracking-wider text-muted">Part of</h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {stage.jml.map((j) => (
                <span
                  key={j}
                  className="rounded bg-panel-2 px-2 py-0.5 text-xs capitalize text-accent"
                >
                  {j}
                </span>
              ))}
            </div>
          </Card>

          <Card className="border-danger/40">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-danger">
              How this stage fails
            </h2>
            <p className="mt-1 text-xs text-muted">
              A lifecycle you cannot debug is a diagram, not a skill.
            </p>
            <ul className="mt-3 space-y-4">
              {stage.failureModes.map((f) => (
                <li key={f.symptom}>
                  <div className="text-sm font-medium text-white">{f.symptom}</div>
                  <p className="mt-1 text-xs text-muted">
                    <span className="text-warn">Cause:</span> {f.cause}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    <span className="text-ok">Fix:</span> {f.fix}
                  </p>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </>
  );
}
