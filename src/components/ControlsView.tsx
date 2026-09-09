import { Component, Suspense, lazy, useState, type ReactNode } from 'react';
import { Boxes, LayoutGrid, RotateCcw } from 'lucide-react';
import {
  ASSET_DETAIL,
  ASSET_LABEL,
  DEFENCE_LAYERS,
  getLayer,
  remainingLayers,
} from '../data/defenceLayers';
import { isWebGLAvailable } from '../lib/webgl';
import { ControlsFallback2D } from '../scenes/ControlsFallback2D';
import { Button, Card, PageHeader } from './ui';

const ControlsScene = lazy(() =>
  import('../scenes/ControlsScene').then((m) => ({ default: m.ControlsScene }))
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

const FUNCTION_TONE: Record<string, string> = {
  preventive: 'text-ok',
  detective: 'text-accent',
  corrective: 'text-warn',
  deterrent: 'text-accent-2',
};

export function ControlsView() {
  const [selectedId, setSelectedId] = useState<string | null>('perimeter');
  const [failedIds, setFailedIds] = useState<string[]>([]);
  const [force2D, setForce2D] = useState(false);
  const [webglOk, setWebglOk] = useState(isWebGLAvailable);

  const use2D = force2D || !webglOk;
  const layer = selectedId ? getLayer(selectedId) : undefined;
  const failed = new Set(failedIds);
  const remaining = remainingLayers(failed);

  const toggleFailed = (id: string) =>
    setFailedIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));

  return (
    <>
      <PageHeader
        title="Defence in Depth"
        subtitle={`Seven layers protecting one asset: ${ASSET_DETAIL}. Fail a layer and watch what still stands — that question, not "is this layer perfect", is what the strategy is for.`}
        actions={
          <>
            {failedIds.length > 0 && (
              <Button variant="ghost" onClick={() => setFailedIds([])}>
                <span className="flex items-center gap-2">
                  <RotateCcw size={14} aria-hidden /> Restore all
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

      {!webglOk && (
        <div className="mb-4 rounded-md border border-warn/40 bg-warn/10 px-4 py-3 text-sm text-warn">
          WebGL is unavailable in this browser or on this hardware. The 2D layer diagram below
          carries the same content and is fully interactive.
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="canvas-wrap lg:col-span-3" style={{ height: '52vh' }}>
          {use2D ? (
            <ControlsFallback2D
              selectedId={selectedId}
              failedIds={failedIds}
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
                <ControlsScene
                  selectedId={selectedId}
                  failedIds={failedIds}
                  onSelect={setSelectedId}
                  onContextLost={() => setWebglOk(false)}
                />
              </Suspense>
            </CanvasBoundary>
          )}
        </div>

        <Card className="lg:col-span-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
            Fail a layer
          </h2>
          <p className="mt-1 text-xs text-muted">
            Defence in depth assumes each control eventually fails. Toggle layers off and read what
            remains.
          </p>
          <ul className="mt-3 space-y-1.5">
            {DEFENCE_LAYERS.map((l) => {
              const isFailed = failed.has(l.id);
              return (
                <li key={l.id} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedId(l.id)}
                    className={`min-w-0 flex-1 truncate rounded px-2 py-1.5 text-left text-sm transition-colors ${
                      l.id === selectedId
                        ? 'bg-panel-2 text-white'
                        : 'text-muted hover:bg-panel-2 hover:text-white'
                    } ${isFailed ? 'line-through opacity-50' : ''}`}
                  >
                    {l.order}. {l.title}
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleFailed(l.id)}
                    aria-label={`${isFailed ? 'Restore' : 'Fail'} the ${l.title} layer`}
                    className={`shrink-0 rounded border px-2 py-1 text-[11px] font-medium transition-colors ${
                      isFailed
                        ? 'border-ok/50 bg-ok/10 text-ok'
                        : 'border-danger/50 bg-danger/10 text-danger'
                    }`}
                  >
                    {isFailed ? 'Restore' : 'Fail'}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-4 rounded-md border border-border bg-panel-2 p-3">
            <div className="text-xs uppercase tracking-wider text-muted">Still protecting</div>
            <div className="mt-1 text-2xl font-bold text-white" data-testid="remaining-layers">
              {remaining.length} of {DEFENCE_LAYERS.length}
            </div>
            <p className="mt-1 text-xs text-muted">
              {remaining.length === 0
                ? `Every layer has failed. ${ASSET_LABEL} is fully exposed — this is the only state defence in depth is designed to make hard to reach.`
                : `${ASSET_LABEL} is still behind ${remaining.map((l) => l.title).join(', ')}.`}
            </p>
          </div>
        </Card>
      </div>

      {layer && (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Card>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
                Layer {layer.order} — {layer.title}
              </h2>
              {failed.has(layer.id) && (
                <span className="text-xs font-semibold text-danger">FAILED</span>
              )}
            </div>
            <h3 className="mt-4 text-xs uppercase tracking-wider text-muted">Controls</h3>
            <ul className="mt-2 space-y-2">
              {layer.controls.map((c) => (
                <li key={c.name} className="text-sm">
                  <div className="text-white">{c.name}</div>
                  <div className="text-xs">
                    <span className={FUNCTION_TONE[c.function] ?? 'text-muted'}>{c.function}</span>
                    <span className="text-muted"> · {c.type}</span>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
              When the outer layers fail
            </h2>
            <p className="mt-2 text-sm text-white">{layer.whenOuterLayersFail}</p>

            <h3 className="mt-5 text-xs uppercase tracking-wider text-muted">
              Reading the two axes
            </h3>
            <p className="mt-2 text-sm text-muted">
              Every control above carries a function (what it does: preventive, detective,
              corrective, deterrent) and a type (how it is implemented: physical, technical,
              administrative). The axes are independent — a badge reader and a firewall rule are
              both preventive and differ only on the second.
            </p>
          </Card>
        </div>
      )}
    </>
  );
}
