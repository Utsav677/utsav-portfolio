/**
 * WebSocket + node-pty server (Railway/Render deployment)
 *
 * Each WS connection spawns a sandboxed shell process via node-pty.
 * Data flows bidirectionally:
 *   Browser (xterm.js) <→ WebSocket <→ node-pty <→ sandbox.ts
 *
 * Run with: npx tsx server/ws-server.ts
 */

import { WebSocketServer, WebSocket } from 'ws';
import * as pty from 'node-pty';
import * as path from 'path';
import * as fs from 'fs';

const PORT    = parseInt(process.env.WS_PORT ?? '4000', 10);
const ORIGINS = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:3000').split(',');

const wss = new WebSocketServer({ port: PORT });

// Admin subscribers (for live command feed)
const adminClients = new Set<WebSocket>();

wss.on('listening', () => {
  console.log(`[ws-server] Listening on port ${PORT}`);
});

wss.on('connection', (ws, req) => {
  const origin = req.headers.origin ?? '';
  const isAdmin = req.url?.includes('admin=1');

  // Admin live feed subscription
  if (isAdmin) {
    adminClients.add(ws);
    ws.on('close', () => adminClients.delete(ws));
    return;
  }

  console.log(`[ws-server] New connection from ${origin}`);

  // Spawn the sandboxed shell
  const sandboxPath = path.join(__dirname, 'sandbox.ts');
  const shell = pty.spawn('npx', ['tsx', sandboxPath], {
    name: 'xterm-color',
    cols: 100,
    rows: 30,
    cwd: process.env.HOME ?? '/tmp',
    env: {
      ...process.env,
      TERM: 'xterm-256color',
      COLORTERM: 'truecolor',
    },
  });

  // pty → WebSocket
  shell.onData((data: string) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(data);
    }
  });

  shell.onExit(() => {
    ws.close();
  });

  // WebSocket → pty
  ws.on('message', (msg: Buffer | string) => {
    const data = typeof msg === 'string' ? msg : msg.toString();

    // Broadcast command to admin feed
    try {
      const parsed = JSON.parse(data);
      if (parsed.type === 'command') {
        const payload = JSON.stringify({ type: 'command', command: parsed.command });
        adminClients.forEach(admin => {
          if (admin.readyState === WebSocket.OPEN) {
            admin.send(payload);
          }
        });
      } else if (parsed.type === 'resize') {
        shell.resize(parsed.cols, parsed.rows);
        return;
      }
    } catch {
      // Raw input (not JSON) — pass directly to pty
    }

    shell.write(data);
  });

  ws.on('close', () => {
    shell.kill();
    console.log('[ws-server] Connection closed');
  });

  ws.on('error', (err) => {
    console.error('[ws-server] WS error:', err);
    shell.kill();
  });
});

process.on('SIGTERM', () => {
  console.log('[ws-server] SIGTERM received, shutting down');
  wss.close();
  process.exit(0);
});
