import { useEffect, useRef, useState } from 'react';
import { Users } from 'lucide-react';

const PRESENCE_URL = import.meta.env.VITE_PRESENCE_WS ?? 'ws://localhost:4000';

export function LiveUsers() {
  const [count, setCount] = useState<number | null>(null);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!PRESENCE_URL) return;

    let ws: WebSocket;
    try {
      ws = new WebSocket(PRESENCE_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'presence' && typeof data.count === 'number') {
            setCount(data.count);
          }
        } catch {
          // ignore malformed messages
        }
      };

      ws.onclose = () => {
        setConnected(false);
        setCount(null);
      };

      ws.onerror = () => {
        setConnected(false);
      };
    } catch {
      setConnected(false);
    }

    return () => {
      ws?.close();
      wsRef.current = null;
    };
  }, []);

  const dot = connected ? 'bg-ok' : 'bg-warn';

  return (
    <div
      className="flex items-center gap-2 rounded-full border border-border bg-panel px-3 py-1.5 text-xs font-medium text-muted"
      title={connected ? 'Live user count via WebSocket' : 'Live user count unavailable — is the presence server running?'}
    >
      <Users className="h-3.5 w-3.5" aria-hidden="true" />
      <span className={`h-2 w-2 rounded-full ${dot} ${connected ? 'animate-pulse' : ''}`} aria-hidden="true" />
      <span>{connected && count !== null ? `${count} online` : '—'}</span>
    </div>
  );
}
