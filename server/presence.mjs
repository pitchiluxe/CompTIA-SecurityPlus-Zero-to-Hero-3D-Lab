import { createServer } from 'node:http';
import { WebSocketServer } from 'ws';

const PORT = Number(process.env.PORT || 4000);
const ALLOWED_ORIGIN = process.env.PRESENCE_ORIGIN;

const server = createServer();
const wss = new WebSocketServer({ server });

function activeCount() {
  return [...wss.clients].filter((ws) => ws.readyState === 1).length;
}

function broadcast() {
  const message = JSON.stringify({ type: 'presence', count: activeCount() });
  wss.clients.forEach((ws) => {
    if (ws.readyState === 1) {
      ws.send(message);
    }
  });
}

wss.on('connection', (ws, req) => {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGIN && origin !== ALLOWED_ORIGIN) {
    ws.terminate();
    return;
  }

  ws.send(JSON.stringify({ type: 'presence', count: activeCount() }));
  broadcast();

  ws.on('close', () => broadcast());
  ws.on('error', () => ws.terminate());
});

const HEARTBEAT_INTERVAL_MS = 30_000;
const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.readyState === 1) {
      ws.ping();
    }
  });
}, HEARTBEAT_INTERVAL_MS);

server.on('close', () => clearInterval(interval));

server.listen(PORT, () => {
  console.log(`Presence server listening on port ${PORT}`);
});
