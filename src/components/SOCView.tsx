import { Component, Suspense, lazy, useMemo, useState, type ReactNode } from 'react';
import { Boxes, LayoutGrid } from 'lucide-react';
import { SOC_DEVICES } from '../data/socDevices';
import { isWebGLAvailable } from '../lib/webgl';
import { Fallback2D } from '../scenes/Fallback2D';
import type { Device } from '../types';
import { DevicePanel } from './DevicePanel';
import { Card, PageHeader } from './ui';

// three.js, @react-three/fiber and drei are ~1 MB. Load them only when this
// route renders AND WebGL is actually available, so learners on the 2D fallback
// path never download the 3D engine at all.
const SOCScene = lazy(() => import('../scenes/SOCScene').then((m) => ({ default: m.SOCScene })));

/**
 * WebGL can be reported as available and still fail at context creation (driver
 * blocklists, headless GPUs). This boundary converts that crash into the 2D
 * path instead of a blank screen.
 */
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

export function SOCView() {
  const [selected, setSelected] = useState<Device | null>(null);
  const [force2D, setForce2D] = useState(false);
  // Probed once in a lazy initialiser rather than an effect: detection is
  // synchronous, so an effect would only cause a second render.
  const [webglOk, setWebglOk] = useState(isWebGLAvailable);

  const use2D = force2D || !webglOk;

  const alerts = useMemo(() => SOC_DEVICES.filter((d) => d.status !== 'up'), []);

  return (
    <>
      <PageHeader
        title="SOC Environment"
        subtitle="Click any device to inspect its addressing, security state, and recent events. Orbit with left-drag, pan with right-drag, zoom with the scroll wheel."
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
          WebGL is unavailable in this browser or on this hardware. The 2D topology below is fully
          interactive and carries the same device data.
        </div>
      )}

      <div className="canvas-wrap" style={{ height: '60vh' }}>
        {use2D ? (
          <Fallback2D devices={SOC_DEVICES} onInspect={setSelected} />
        ) : (
          <CanvasBoundary onError={() => setWebglOk(false)}>
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center text-sm text-muted">
                  Loading 3D environment…
                </div>
              }
            >
              <SOCScene
                devices={SOC_DEVICES}
                onInspect={setSelected}
                selectedId={selected?.id}
                onContextLost={() => setWebglOk(false)}
              />
            </Suspense>
          </CanvasBoundary>
        )}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
            Devices in scene
          </h2>
          <div className="mt-2 text-3xl font-bold text-white">{SOC_DEVICES.length}</div>
          <ul className="mt-3 space-y-1 text-sm">
            {SOC_DEVICES.map((d) => (
              <li key={d.id}>
                <button
                  type="button"
                  onClick={() => setSelected(d)}
                  className="w-full truncate text-left text-muted transition-colors hover:text-accent"
                >
                  {d.label}
                </button>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
            Needs attention
          </h2>
          {alerts.length === 0 ? (
            <p className="mt-2 text-sm text-muted">All devices report UP.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {alerts.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-2">
                  <span className="truncate text-white">{d.label}</span>
                  <span className="shrink-0 font-mono text-xs uppercase text-danger">
                    {d.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
            How to read the room
          </h2>
          <ul className="mt-3 space-y-1.5 text-sm text-muted">
            <li>· Red is an enforcement point — the firewall at the trust boundary.</li>
            <li>· Purple is identity and analytics — domain controller and SIEM.</li>
            <li>· Blue is an endpoint, green is a server.</li>
            <li>· Travelling beads are log events flowing to the SIEM collector.</li>
          </ul>
        </Card>
      </div>

      {selected && <DevicePanel device={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
