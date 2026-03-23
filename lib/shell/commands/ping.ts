import { CommandResult, ShellState } from '../types';

export function ping(args: string[], _state: ShellState): CommandResult {
  const host = args.find(a => !a.startsWith('-')) ?? 'localhost';
  return { type: 'ping-anim', host };
}

// Called by Terminal.tsx for each ping "packet"
export function renderPingLine(host: string, seq: number, ms: number): string {
  const A = {
    amber:  (s: string) => `\x1b[33m${s}\x1b[0m`,
    ok:     (s: string) => `\x1b[32m${s}\x1b[0m`,
    bright: (s: string) => `\x1b[93m${s}\x1b[0m`,
    dim:    (s: string) => `\x1b[36m${s}\x1b[0m`,
  };
  return `64 bytes from ${A.amber(host)}: icmp_seq=${seq} ttl=64 time=${A.ok(ms.toFixed(2))} ms`;
}

export function renderPingHeader(host: string): string {
  return `\x1b[93mPING ${host} (127.0.0.1): 56 data bytes\x1b[0m`;
}

export function renderPingSummary(sent: number, received: number, times: number[], host = 'localhost'): string {
  const A = {
    ok:     (s: string) => `\x1b[32m${s}\x1b[0m`,
    amber:  (s: string) => `\x1b[33m${s}\x1b[0m`,
    bright: (s: string) => `\x1b[93m${s}\x1b[0m`,
    dim:    (s: string) => `\x1b[36m${s}\x1b[0m`,
  };
  const loss = ((sent - received) / sent * 100).toFixed(0);
  const avg = times.length ? (times.reduce((a, b) => a + b) / times.length).toFixed(2) : '0';
  const min = times.length ? Math.min(...times).toFixed(2) : '0';
  const max = times.length ? Math.max(...times).toFixed(2) : '0';
  return [
    '',
    `--- ${A.amber(host)} ping statistics ---`,
    `${sent} packets transmitted, ${A.ok(String(received))} received, ${loss}% packet loss`,
    `round-trip min/avg/max = ${min}/${avg}/${max} ms`,
  ].join('\r\n');
}
