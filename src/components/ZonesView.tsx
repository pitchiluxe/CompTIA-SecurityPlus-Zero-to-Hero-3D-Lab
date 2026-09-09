import { Component, Suspense, lazy, useState, type ReactNode } from 'react';
import { Boxes, LayoutGrid } from 'lucide-react';
import {
  BOUNDARIES,
  NETWORK_ZONES,
  boundariesFor,
  getBoundary,
  getZone,
  trustDelta,
  type ZoneId,
} from '../data/networkZones';
import { isWebGLAvailable } from '../lib/webgl';
import { ZoneFallback2D } from '../scenes/ZoneFallback2D';
import { Card, PageHeader } from './ui';

const ZoneScene = lazy(() => import('../scenes/ZoneScene').then((m) => ({ default: m.ZoneScene })));

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

export function ZonesView() {
  const [selectedZone, setSelectedZone] = useState<ZoneId | null>('dmz');
  const [selectedBoundary, setSelectedBoundary] = useState<string | null>(null);
  const [force2D, setForce2D] = useState(false);
  const [webglOk, setWebglOk] = useState(isWebGLAvailable);

  const use2D = force2D || !webglOk;
  const zone = selectedZone ? getZone(selectedZone) : undefined;
  const boundary = selectedBoundary ? getBoundary(selectedBoundary) : undefined;

  const selectZone = (id: ZoneId) => {
    setSelectedZone(id);
    setSelectedBoundary(null);
  };
  const selectBoundary = (id: string) => {
    setSelectedBoundary(id);
    setSelectedZone(null);
  };

  return (
    <>
      <PageHeader
        title="Security Zones"
        subtitle="Internet → DMZ → Core → Users / Servers / Management / Guest. Height is trust: the more trusted a zone, the deeper it sits. Click a zone, or a gate between tiers, to inspect the boundary."
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
          WebGL is unavailable in this browser or on this hardware. The 2D architecture below
          carries the same content and is fully interactive.
        </div>
      )}

      <div className="canvas-wrap" style={{ height: '52vh' }}>
        {use2D ? (
          <ZoneFallback2D
            selectedZone={selectedZone}
            selectedBoundary={selectedBoundary}
            onSelectZone={selectZone}
            onSelectBoundary={selectBoundary}
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
              <ZoneScene
                selectedZone={selectedZone}
                selectedBoundary={selectedBoundary}
                onSelectZone={selectZone}
                onSelectBoundary={selectBoundary}
                onContextLost={() => setWebglOk(false)}
              />
            </Suspense>
          </CanvasBoundary>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {NETWORK_ZONES.map((z) => (
          <button
            key={z.id}
            type="button"
            onClick={() => selectZone(z.id)}
            className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
              z.id === selectedZone
                ? 'border-accent bg-accent/10 text-white'
                : 'border-border bg-panel-2 text-muted hover:text-white'
            }`}
          >
            {z.name} <span className="ml-2 text-[11px] text-muted">trust {z.trust}</span>
          </button>
        ))}
      </div>

      {zone && (
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <Card>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
              {zone.name}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white">{zone.summary}</p>
            <dl className="mt-4 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <dt className="text-muted">Trust level</dt>
                <dd className="font-mono text-white">{zone.trust}</dd>
              </div>
              {zone.vlan && (
                <div className="flex justify-between">
                  <dt className="text-muted">VLAN</dt>
                  <dd className="font-mono text-white">{zone.vlan}</dd>
                </div>
              )}
              {zone.cidr && (
                <div className="flex justify-between">
                  <dt className="text-muted">Network</dt>
                  <dd className="font-mono text-white">{zone.cidr}</dd>
                </div>
              )}
            </dl>
          </Card>

          <Card>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">Contains</h2>
            <ul className="mt-3 space-y-1.5 text-sm text-white">
              {zone.contains.map((c) => (
                <li key={c}>· {c}</li>
              ))}
            </ul>
            <h3 className="mt-5 text-xs uppercase tracking-wider text-muted">Rules</h3>
            <ul className="mt-2 space-y-1.5 text-sm text-muted">
              {zone.rules.map((r) => (
                <li key={r}>· {r}</li>
              ))}
            </ul>
          </Card>

          <Card>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
              Boundaries touching this zone
            </h2>
            <ul className="mt-3 space-y-2">
              {boundariesFor(zone.id).map((b) => (
                <li key={b.id}>
                  <button
                    type="button"
                    onClick={() => selectBoundary(b.id)}
                    className="w-full rounded border border-border bg-panel-2 px-3 py-2 text-left text-sm text-muted transition-colors hover:text-white"
                  >
                    {getZone(b.from)?.name} → {getZone(b.to)?.name}{' '}
                    <span className="ml-2 text-[11px] text-accent">Δ{trustDelta(b)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {boundary && (
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <Card className="border-warn/40">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-warn">
              Boundary — {getZone(boundary.from)?.name} → {getZone(boundary.to)?.name}
            </h2>
            <p className="mt-1 text-xs text-muted">
              Trust delta {trustDelta(boundary)} · the steeper the change, the stricter the control
            </p>
            <p className="mt-3 text-sm leading-relaxed text-white">{boundary.purpose}</p>
            <h3 className="mt-5 text-xs uppercase tracking-wider text-muted">Controls</h3>
            <ul className="mt-2 space-y-1 text-sm text-white">
              {boundary.controls.map((c) => (
                <li key={c}>· {c}</li>
              ))}
            </ul>
          </Card>

          <Card>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-ok">Allowed</h2>
            <ul className="mt-3 space-y-1.5 text-sm text-white">
              {boundary.allowed.map((a) => (
                <li key={a}>· {a}</li>
              ))}
            </ul>
          </Card>

          <Card>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-danger">Denied</h2>
            <ul className="mt-3 space-y-1.5 text-sm text-muted">
              {boundary.denied.map((d) => (
                <li key={d}>· {d}</li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      <Card className="mt-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
          All boundaries by trust delta
        </h2>
        <p className="mt-1 text-xs text-muted">
          A boundary exists wherever trust changes. The largest change in this design gets the
          strictest control.
        </p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {[...BOUNDARIES]
            .sort((a, b) => trustDelta(b) - trustDelta(a))
            .map((b) => (
              <li key={b.id}>
                <button
                  type="button"
                  onClick={() => selectBoundary(b.id)}
                  className={`w-full rounded border px-3 py-2 text-left text-sm transition-colors ${
                    b.id === selectedBoundary
                      ? 'border-accent bg-accent/10 text-white'
                      : 'border-border bg-panel-2 text-muted hover:text-white'
                  }`}
                >
                  <span className="mr-2 font-mono text-accent">Δ{trustDelta(b)}</span>{' '}
                  {getZone(b.from)?.name} → {getZone(b.to)?.name}
                </button>
              </li>
            ))}
        </ul>
      </Card>
    </>
  );
}
