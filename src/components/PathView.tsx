import { Component, Suspense, lazy, useState, type ReactNode } from 'react';
import { Boxes, LayoutGrid } from 'lucide-react';
import { PATH_STAGES, PATH_STEPS, getStage, type PathStageId } from '../data/connectionPath';
import { isWebGLAvailable } from '../lib/webgl';
import { PathFallback2D } from '../scenes/PathFallback2D';
import { Card, PageHeader } from './ui';

const PathScene = lazy(() => import('../scenes/PathScene').then((m) => ({ default: m.PathScene })));

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

export function PathView() {
  const [selectedId, setSelectedId] = useState<PathStageId | null>('endpoint');
  const [force2D, setForce2D] = useState(false);
  const [webglOk, setWebglOk] = useState(isWebGLAvailable);

  const use2D = force2D || !webglOk;
  const stage = selectedId ? getStage(selectedId) : undefined;

  return (
    <>
      <PageHeader
        title="Connection Path"
        subtitle="User → Endpoint → Network → Server → Security Controls. Nine steps between a click and a response, and every one is a place to enforce, detect, or lose visibility."
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
          WebGL is unavailable in this browser or on this hardware. The 2D path below carries the
          same content and is fully interactive.
        </div>
      )}

      <div className="canvas-wrap" style={{ height: '52vh' }}>
        {use2D ? (
          <PathFallback2D selectedId={selectedId} onSelect={setSelectedId} />
        ) : (
          <CanvasBoundary onError={() => setWebglOk(false)}>
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center text-sm text-muted">
                  Loading 3D environment…
                </div>
              }
            >
              <PathScene
                selectedId={selectedId}
                onSelect={setSelectedId}
                onContextLost={() => setWebglOk(false)}
              />
            </Suspense>
          </CanvasBoundary>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {PATH_STAGES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSelectedId(s.id)}
            className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
              s.id === selectedId
                ? 'border-accent bg-accent/10 text-white'
                : 'border-border bg-panel-2 text-muted hover:text-white'
            }`}
          >
            {s.title}
          </button>
        ))}
      </div>

      {stage && (
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
              {stage.title}
            </h2>
            <p className="mt-1 text-sm text-white">{stage.subtitle}</p>

            <h3 className="mt-5 text-xs uppercase tracking-wider text-muted">Controls here</h3>
            <ul className="mt-2 space-y-1 text-sm text-white">
              {stage.controls.map((c) => (
                <li key={c}>· {c}</li>
              ))}
            </ul>

            <h3 className="mt-5 text-xs uppercase tracking-wider text-muted">
              Detection opportunities
            </h3>
            <ul className="mt-2 space-y-1 text-sm text-muted">
              {stage.detectionOpportunities.map((d) => (
                <li key={d}>· {d}</li>
              ))}
            </ul>
          </Card>

          <Card className="lg:col-span-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
              Steps at this stage
            </h2>
            <ol className="mt-3 space-y-4" data-testid="stage-steps">
              {stage.steps.map((step) => (
                <li key={`${stage.id}-${step.order}-${step.label}`} className="flex gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-panel-2 font-mono text-xs text-accent">
                    {step.order}
                  </span>
                  <div>
                    <div className="text-sm font-medium text-white">{step.label}</div>
                    <p className="mt-1 text-sm text-muted">{step.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      )}

      <Card className="mt-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
          The full path, in order
        </h2>
        <ol className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {PATH_STEPS.map((step) => (
            <li key={`${step.stage}-${step.order}-${step.label}`}>
              <button
                type="button"
                onClick={() => setSelectedId(step.stage)}
                className="w-full rounded border border-border bg-panel-2 px-3 py-2 text-left text-sm text-muted transition-colors hover:text-white"
              >
                <span className="mr-2 font-mono text-accent">{step.order}</span>
                {step.label}
              </button>
            </li>
          ))}
        </ol>
      </Card>
    </>
  );
}
