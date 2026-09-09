import { X } from 'lucide-react';
import type { Device } from '../types';

interface Props {
  device: Device;
  onClose: () => void;
}

export function DevicePanel({ device, onClose }: Props) {
  const statusColor = {
    up: '#22c55e',
    down: '#ef4444',
    alert: '#f97316',
    warning: '#f59e0b',
  }[device.status];

  return (
    <div
      data-testid="device-panel"
      role="complementary"
      aria-label={`Device details for ${device.label}`}
      className="fixed inset-y-0 right-0 z-50 w-96 overflow-y-auto border-l border-border bg-panel shadow-2xl"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="text-xs font-medium text-muted uppercase tracking-wider">
              {device.type}
            </span>
            <h2 className="text-xl font-bold text-white mt-1">{device.label}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-panel-2 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: statusColor }} />
          <span className="text-sm font-medium" style={{ color: statusColor }}>
            Status: {device.status.toUpperCase()}
          </span>
        </div>

        <dl className="space-y-3 text-sm">
          {device.ip && (
            <div>
              <dt className="text-muted">IP Address</dt>
              <dd className="text-white font-mono">{device.ip}</dd>
            </div>
          )}
          {device.mac && (
            <div>
              <dt className="text-muted">MAC Address</dt>
              <dd className="text-white font-mono">{device.mac}</dd>
            </div>
          )}
          {device.interfaces && device.interfaces.length > 0 && (
            <div>
              <dt className="text-muted">Interfaces</dt>
              <dd>
                <ul className="mt-1 space-y-1">
                  {device.interfaces.map((intf) => (
                    <li key={intf.name} className="font-mono text-xs">
                      {intf.name}: {intf.ip} ({intf.status})
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          )}
          {device.users && device.users.length > 0 && (
            <div>
              <dt className="text-muted">Users</dt>
              <dd className="text-white">{device.users.join(', ')}</dd>
            </div>
          )}
          {device.securityState && (
            <div>
              <dt className="text-muted">Security State</dt>
              <dd>
                <ul className="mt-1 space-y-1 text-xs">
                  {Object.entries(device.securityState).map(([k, v]) => (
                    <li key={k} className="flex justify-between">
                      <span className="text-muted">{k}:</span>
                      <span className="text-white">{String(v)}</span>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          )}
        </dl>

        {device.events && device.events.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-muted mb-2">Recent Events</h3>
            <ul className="space-y-2 text-xs">
              {device.events.slice(0, 6).map((ev) => (
                <li key={ev.id} className="p-2 rounded bg-panel-2 border border-border">
                  <span className="font-mono text-muted">{ev.timestamp}</span>
                  <span
                    className={`ml-2 font-medium ${
                      ev.level === 'error' || ev.level === 'alert'
                        ? 'text-danger'
                        : ev.level === 'warn'
                          ? 'text-warn'
                          : 'text-accent'
                    }`}
                  >
                    [{ev.level.toUpperCase()}]
                  </span>
                  <span className="text-muted">{ev.source}:</span>
                  <span className="text-white">{ev.message}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-border">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-panel-2 rounded hover:bg-border transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
