import { A, padEnd } from '../ansi';
import { CommandResult, ShellState } from '../types';

const PROCESSES = [
  { pid: '  1', user: 'root',  cpu: '0.0', mem: '0.1', cmd: 'init' },
  { pid: ' 12', user: 'utsav', cpu: '2.3', mem: '1.2', cmd: 'portfolio-server --port 3000' },
  { pid: ' 42', user: 'utsav', cpu: '0.1', mem: '0.4', cmd: 'dream-daemon --background' },
  { pid: ' 69', user: 'utsav', cpu: '8.4', mem: '3.7', cmd: 'grind.sh --infinite-loop' },
  { pid: ' 99', user: 'utsav', cpu: '0.0', mem: '0.2', cmd: 'coffee-monitor --threshold=empty' },
  { pid: '137', user: 'utsav', cpu: '0.6', mem: '1.8', cmd: 'side-project-ideas.md (vim)' },
  { pid: '200', user: 'utsav', cpu: '1.2', mem: '0.9', cmd: 'llm-hallucination-detector (WIP)' },
  { pid: '256', user: 'utsav', cpu: '0.0', mem: '0.3', cmd: 'sleep-tracker --result=none' },
  { pid: '404', user: 'utsav', cpu: '0.0', mem: '0.0', cmd: 'free-time (not found)' },
  { pid: '420', user: 'utsav', cpu: '3.1', mem: '2.1', cmd: 'node_modules/.bin/webpack' },
  { pid: '512', user: 'root',  cpu: '0.1', mem: '0.3', cmd: 'kswapd0' },
  { pid: '999', user: 'utsav', cpu: '0.0', mem: '0.1', cmd: 'todo-list.txt (infinite)' },
];

export function ps(args: string[], _state: ShellState): CommandResult {
  const showAll = args.includes('aux') || args.includes('-aux') ||
                  args.includes('-a') || args.length === 0;

  const header = [
    A.bright(padEnd('USER',   8)),
    A.bright(padEnd('PID',    6)),
    A.bright(padEnd('%CPU',   6)),
    A.bright(padEnd('%MEM',   6)),
    A.bright('COMMAND'),
  ].join(' ');

  const rows = PROCESSES.map(p => [
    A.amber(padEnd(p.user, 8)),
    A.dim(padEnd(p.pid,   6)),
    A.ok(padEnd(p.cpu,    6)),
    A.info(padEnd(p.mem,  6)),
    p.cmd.includes('(') || p.cmd.includes('WIP') || p.cmd.includes('not found')
      ? A.dimmer(p.cmd)
      : p.cmd,
  ].join(' '));

  return [header, ...rows].join('\r\n');
}
