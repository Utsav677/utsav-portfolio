/**
 * Sandboxed shell process — spawned by node-pty in ws-server.ts
 *
 * Reads commands from stdin line by line, executes them through the
 * same shell dispatcher used client-side, writes ANSI output to stdout.
 * Never touches the real filesystem.
 */

import * as readline from 'readline';
import { runCommand, INITIAL_STATE } from '../lib/shell/index';
import { ShellState } from '../lib/shell/types';
import { historyManager } from '../lib/shell/history';

let state: ShellState = { ...INITIAL_STATE };

// Mock localStorage for history (Node.js doesn't have it)
const historyStore: Record<string, string> = {};
Object.defineProperty(global, 'localStorage', {
  value: {
    getItem: (k: string) => historyStore[k] ?? null,
    setItem: (k: string, v: string) => { historyStore[k] = v; },
    removeItem: (k: string) => { delete historyStore[k]; },
  },
  writable: false,
});

// Mock fetch for analytics (fire-and-forget, ignore in sandbox)
Object.defineProperty(global, 'fetch', {
  value: async () => ({ ok: true, json: async () => [] }),
  writable: true,
});

historyManager.init();

const rl = readline.createInterface({
  input:  process.stdin,
  output: process.stdout,
  terminal: false,
});

function prompt(): void {
  const cwd = state.cwd.replace('/home/utsav', '~');
  process.stdout.write(
    `\r\n\x1b[33mutsav\x1b[0m@\x1b[93marora.sys\x1b[0m:\x1b[34m${cwd}\x1b[0m$ `
  );
}

// Initial whoami
(async () => {
  const result = await runCommand('whoami', state);
  if (typeof result.output === 'string' && result.output) {
    process.stdout.write(result.output + '\r\n');
  }
  prompt();
})();

rl.on('line', async (line) => {
  const input = line.trim();
  historyManager.push(input);

  if (!input) {
    prompt();
    return;
  }

  try {
    const result = await runCommand(input, state);
    state = result.newState;

    const out = result.output;
    if (typeof out === 'string' && out) {
      process.stdout.write(out + '\r\n');
    } else if (typeof out === 'object' && out !== null) {
      // Handle special results in the sandbox (simplify for PTY)
      const r = out as any;
      if (r.type === 'clear') {
        process.stdout.write('\x1b[2J\x1b[H');
      } else if (r.type === 'open-url') {
        process.stdout.write(r.message + '\r\n');
      } else if (r.type === 'pager') {
        process.stdout.write(r.lines.join('\r\n') + '\r\n');
      } else if (r.message) {
        process.stdout.write(r.message + '\r\n');
      }
    }
  } catch (err) {
    process.stdout.write(`\x1b[31mError: ${err}\x1b[0m\r\n`);
  }

  prompt();
});

rl.on('close', () => {
  process.exit(0);
});
