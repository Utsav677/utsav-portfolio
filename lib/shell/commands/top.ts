import { CommandResult, ShellState } from '../types';

// `top` enters an interactive mode managed by Terminal.tsx.
// We return a special signal and the terminal handles the animation loop.
export function top(_args: string[], _state: ShellState): CommandResult {
  return { type: 'top' };
}

// This function is called by Terminal.tsx on each "frame" of the top display.
// Returns a string to overwrite the terminal with each tick.
export function renderTopFrame(tick: number): string {
  const A = {
    bright: (s: string) => `\x1b[93m${s}\x1b[0m`,
    amber:  (s: string) => `\x1b[33m${s}\x1b[0m`,
    dim:    (s: string) => `\x1b[36m${s}\x1b[0m`,
    ok:     (s: string) => `\x1b[32m${s}\x1b[0m`,
    info:   (s: string) => `\x1b[34m${s}\x1b[0m`,
    err:    (s: string) => `\x1b[31m${s}\x1b[0m`,
    dimmer: (s: string) => `\x1b[90m${s}\x1b[0m`,
  };

  const now = new Date().toLocaleTimeString();
  const baseLoad = 0.42 + Math.sin(tick * 0.3) * 0.2;

  const processes = [
    { pid: 12,  cpu: (20 + Math.sin(tick * 0.7) * 15).toFixed(1), mem: '1.2', cmd: 'portfolio-server' },
    { pid: 69,  cpu: (40 + Math.sin(tick * 0.4) * 20).toFixed(1), mem: '3.7', cmd: 'grind.sh' },
    { pid: 42,  cpu: (5  + Math.sin(tick * 1.1) * 4).toFixed(1),  mem: '0.4', cmd: 'dream-daemon' },
    { pid: 420, cpu: (30 + Math.sin(tick * 0.9) * 12).toFixed(1), mem: '2.1', cmd: 'webpack' },
    { pid: 200, cpu: (8  + Math.sin(tick * 0.6) * 5).toFixed(1),  mem: '0.9', cmd: 'llm-detector' },
    { pid: 99,  cpu: '0.0', mem: '0.2', cmd: 'coffee-monitor' },
    { pid: 256, cpu: '0.0', mem: '0.3', cmd: 'sleep-tracker' },
    { pid: 404, cpu: '0.0', mem: '0.0', cmd: 'free-time (not found)' },
  ];

  const header = [
    `${A.bright('top')} - ${A.amber(now)} up ${Math.floor(tick / 2)} mins,  1 user`,
    `Tasks: ${A.ok('8 running')}, ${A.dimmer('0 sleeping')}, ${A.dimmer('0 stopped')}`,
    `%Cpu(s): ${A.ok((baseLoad * 100).toFixed(1))}% us,  ${A.dim('3.2')}% sy,  ${A.dimmer('0.0')}% ni`,
    `MiB Mem:  ${A.info('8192.0')} total,  ${A.ok('4213.3')} free,  ${A.amber('2048.7')} used`,
    `MiB Swap: ${A.dim('2048.0')} total,  ${A.ok('2048.0')} free,  ${A.dimmer('0.0')} used`,
    '',
    A.bright('  PID  USER     %CPU %MEM COMMAND'),
    A.amber('─'.repeat(50)),
  ];

  const rows = processes.map(p => {
    const cpuNum = parseFloat(p.cpu);
    const cpuColor = cpuNum > 30 ? A.err : cpuNum > 15 ? A.amber : A.ok;
    return `${String(p.pid).padStart(5)}  ${'utsav'.padEnd(8)} ${cpuColor(p.cpu.padStart(4))}% ${p.mem.padStart(4)}% ${p.cmd}`;
  });

  return [
    '\x1b[2J\x1b[H',  // Clear screen
    ...header,
    ...rows,
    '',
    A.dimmer('Press q to quit'),
  ].join('\r\n');
}
