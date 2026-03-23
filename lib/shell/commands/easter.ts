import { A, box } from '../ansi';
import { contact } from '../../data/contact';
import { CommandResult, ShellState } from '../types';

// ── matrix / neo ──────────────────────────────────────────────────────────────
export function matrix(_args: string[], _state: ShellState): CommandResult {
  return { type: 'matrix' };
}

// ── sudo ──────────────────────────────────────────────────────────────────────
export function sudo(args: string[], _state: ShellState): CommandResult {
  const cmd = args.join(' ');
  if (!cmd) return A.err('sudo: command required');
  return [
    A.err('Permission denied.'),
    '',
    A.dim('  Nice try. This is a sandboxed portfolio terminal.'),
    A.dim('  sudo privileges were revoked after the 2AM incident.'),
    A.dimmer('  (You know what you did.)'),
  ].join('\r\n');
}

// ── hire me ──────────────────────────────────────────────────────────────────
export function hireMe(_args: string[], _state: ShellState): CommandResult {
  const lines: string[] = [
    '',
    A.bright('  ██╗  ██╗██╗██████╗ ███████╗    ███╗   ███╗███████╗ ██╗'),
    A.bright('  ██║  ██║██║██╔══██╗██╔════╝    ████╗ ████║██╔════╝ ██║'),
    A.bright('  ███████║██║██████╔╝█████╗      ██╔████╔██║█████╗   ██║'),
    A.bright('  ██╔══██║██║██╔══██╗██╔══╝      ██║╚██╔╝██║██╔══╝   ╚═╝'),
    A.bright('  ██║  ██║██║██║  ██║███████╗    ██║ ╚═╝ ██║███████╗ ██╗'),
    A.bright('  ╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚══════╝    ╚═╝     ╚═╝╚══════╝ ╚═╝'),
    '',
    A.amber('  ┌─────────────────────────────────────────────────────────┐'),
    A.amber('  │') + A.bright('  Congratulations! You have excellent taste.          ') + A.amber('  │'),
    A.amber('  │') + '                                                         ' + A.amber('  │'),
    A.amber('  │') + `  ${A.amber('Name:')}    ${contact.name}                              ` + A.amber('  │'),
    A.amber('  │') + `  ${A.amber('Email:')}   ${contact.email}                      ` + A.amber('  │'),
    A.amber('  │') + `  ${A.amber('GitHub:')}  ${contact.github}                    ` + A.amber('  │'),
    A.amber('  │') + `  ${A.amber('LinkedIn:')}${contact.linkedin}                ` + A.amber('  │'),
    A.amber('  │') + '                                                         ' + A.amber('  │'),
    A.amber('  │') + `  ${A.dim('Available: May 2027 (FT) · Immediately (Intern)')}   ` + A.amber('  │'),
    A.amber('  └─────────────────────────────────────────────────────────┘'),
    '',
    A.ok('  ★ References available upon request'),
    A.ok('  ★ Will relocate for the right opportunity'),
    A.ok('  ★ Brings own mechanical keyboard'),
    '',
  ];
  return lines.join('\r\n');
}

// ── git log ───────────────────────────────────────────────────────────────────
export function gitLog(_args: string[], _state: ShellState): CommandResult {
  const commits = [
    { hash: 'a3f9c12', date: '2026-03-22', msg: 'feat: add portfolio terminal (this)' },
    { hash: 'b7e2d45', date: '2026-02-20', msg: 'feat: openclaw multi-agent job applicator' },
    { hash: 'c1a8f67', date: '2026-03-01', msg: 'research: submit RAHAHA to SemEval-2026' },
    { hash: 'd4b3e89', date: '2026-01-15', msg: 'feat: huddle social hits 2,200 users' },
    { hash: 'e9f1a23', date: '2025-12-10', msg: 'research: corteva RAG pipeline complete' },
    { hash: 'f2c7b45', date: '2025-11-05', msg: 'win: plate-mate best pitch + presentation' },
    { hash: '091d3e6', date: '2025-10-01', msg: 'feat: crypto-bot deployed on cloud run' },
    { hash: '1a4f7c8', date: '2025-08-15', msg: 'feat: sew ML models hit 23% improvement' },
    { hash: '2b5e9d0', date: '2025-05-01', msg: 'start: ml research intern @ sew' },
    { hash: '3c6f0a2', date: '2025-01-01', msg: 'init: founded acs consultancy' },
    { hash: '4d7a1b3', date: '2024-08-22', msg: 'chore: start sophomore year at purdue' },
    { hash: '5e8b2c4', date: '2023-08-22', msg: 'init: first year cs @ purdue, west lafayette' },
  ];

  const lines = commits.map(c => [
    A.amber(`commit ${c.hash}`),
    A.dimmer(`Date:   ${c.date}`),
    '',
    `    ${c.msg}`,
    '',
  ].join('\r\n'));

  return lines.join('\r\n');
}

// ── git blame ─────────────────────────────────────────────────────────────────
export function gitBlame(args: string[], _state: ShellState): CommandResult {
  const file = args[0] ?? 'everything';
  const reasons = [
    'sleep deprivation',
    'deadline pressure',
    'caffeine overdose',
    'overconfidence in the LLM',
    'optimistic estimates',
    'the previous intern',
    'quantum tunneling',
    'technically correct behavior',
    '"it worked on my machine"',
    'entropy',
  ];
  const lines = Array.from({ length: 8 }, (_, i) => {
    const reason = reasons[i % reasons.length];
    return `${A.dimmer('a1b2c3d ^')} (${A.amber('utsav')} ${A.dim('2026-03-22 0' + (2 + i) + ':00:00 -0500')} ${String(i + 1).padStart(3)}) ${A.dimmer('// blame: ' + reason)}`;
  });
  return [A.bright(`git blame ${file}`), '', ...lines].join('\r\n');
}

// ── neofetch ──────────────────────────────────────────────────────────────────
export function neofetch(_args: string[], _state: ShellState): CommandResult {
  const logo = [
    '          ████████          ',
    '       ████████████         ',
    '      ██████████████        ',
    '     █████ ARORA ████       ',
    '     █████  .SYS  ████      ',
    '      ██████████████        ',
    '       ████████████         ',
    '          ████████          ',
  ];

  const info = [
    `${A.bright('utsav')}${A.amber('@')}${A.bright('arora.sys')}`,
    A.amber('-'.repeat(20)),
    `${A.amber('OS:')}       ARORA-OS 1.83.0`,
    `${A.amber('Host:')}     Portfolio Terminal v1.0`,
    `${A.amber('Kernel:')}   ARORA-OS 1.83 #1983-SMP`,
    `${A.amber('Uptime:')}   Since the first commit`,
    `${A.amber('Shell:')}    arora-sh 1.0.0`,
    `${A.amber('Terminal:')} xterm.js + amber theme`,
    `${A.amber('Font:')}     Share Tech Mono 13px`,
    `${A.amber('CPU:')}      Brain i9-9999K @ 200%`,
    `${A.amber('Memory:')}   8192MB / Infinite (coffee)`,
    `${A.amber('GPU:')}      RTX 3090 (wishful thinking)`,
    '',
    A.bright('  ■■■■■■■■') + A.amber('  ■■■■■■■■') + A.ok('  ■■■■■■■■') + A.info('  ■■■■■■■■'),
  ];

  const lines = logo.map((l, i) =>
    A.amber(l) + (info[i] ? '  ' + info[i] : '')
  );

  return lines.join('\r\n');
}

// ── purdue / boiler up ────────────────────────────────────────────────────────
export function purdue(_args: string[], _state: ShellState): CommandResult {
  return [
    '',
    A.bright('  ██████╗ ██╗   ██╗██████╗ ██████╗ ██╗   ██╗███████╗'),
    A.bright('  ██╔══██╗██║   ██║██╔══██╗██╔══██╗██║   ██║██╔════╝'),
    A.bright('  ██████╔╝██║   ██║██████╔╝██║  ██║██║   ██║█████╗  '),
    A.bright('  ██╔═══╝ ██║   ██║██╔══██╗██║  ██║██║   ██║██╔══╝  '),
    A.bright('  ██║     ╚██████╔╝██║  ██║██████╔╝╚██████╔╝███████╗'),
    A.bright('  ╚═╝      ╚═════╝ ╚═╝  ╚═╝╚═════╝  ╚═════╝ ╚══════╝'),
    '',
    A.amber('          BOILER UP! ⚙️  Purdue University'),
    A.dim('          B.S. Computer Science · May 2027'),
    A.dim('          Machine Intelligence · AI · Math · Psych'),
    '',
  ].join('\r\n');
}

// ── chess ──────────────────────────────────────────────────────────────────────
export function chess(_args: string[], _state: ShellState): CommandResult {
  return { type: 'chess' };
}

// ── sl (steam locomotive) ─────────────────────────────────────────────────────
export function sl(_args: string[], _state: ShellState): CommandResult {
  return { type: 'sl' };
}

// ── rm -rf / ─────────────────────────────────────────────────────────────────
export function rmRf(args: string[], _state: ShellState): CommandResult {
  const isRoot = args.includes('/') || args.includes('-rf') && args.includes('/');
  if (isRoot || args.join(' ').includes('-rf /') || args.join(' ').includes('-r /')) {
    return [
      A.err('rm: WARNING: deleting everything...'),
      '',
      A.dimmer('Removing /home/utsav/projects...'),
      A.dimmer('Removing /home/utsav/experience...'),
      A.dimmer('Removing /home/utsav/skills.txt...'),
      A.dimmer('Removing /etc/sanity...'),
      A.dimmer('Removing /var/sleep/logs...'),
      '',
      A.bright('The portfolio remains.'),
      '',
      A.dim('  (This is a read-only virtual filesystem. Nothing was deleted.)'),
      A.dim('  (But your confidence? That\'s between you and the void.)'),
    ].join('\r\n');
  }
  return A.err('rm: missing operand');
}

// ── :q / :wq ─────────────────────────────────────────────────────────────────
export function vimQuit(_args: string[], _state: ShellState): CommandResult {
  return [
    A.err('E37: No write since last change'),
    A.dim("You're not in vim."),
    A.dimmer("(But if you were, you'd never escape anyway.)"),
  ].join('\r\n');
}

// ── exit ──────────────────────────────────────────────────────────────────────
export function exitCmd(_args: string[], _state: ShellState): CommandResult {
  return [
    A.amber('There is no exit.'),
    '',
    A.dim('  This terminal runs in an infinite loop.'),
    A.dim('  The only way out is through.'),
    A.dimmer('  (Or just close the browser tab. But where\'s the fun in that?)'),
  ].join('\r\n');
}

// ── ssh ──────────────────────────────────────────────────────────────────────
export function ssh(args: string[], _state: ShellState): CommandResult {
  const host = args.find(a => !a.startsWith('-')) ?? 'unknown';
  return { type: 'ssh-anim', host };
}

// ── nmap ─────────────────────────────────────────────────────────────────────
export function nmap(args: string[], _state: ShellState): CommandResult {
  const target = args.find(a => !a.startsWith('-')) ?? 'localhost';
  return [
    A.bright(`Starting Nmap 7.94 ( https://nmap.org ) scan of ${target}`),
    A.dimmer('Nmap scan report for ' + target + ' (127.0.0.1)'),
    A.dimmer('Host is up (0.00014s latency).'),
    '',
    A.bright('PORT      STATE  SERVICE    VERSION'),
    A.amber('─'.repeat(52)),
    `${A.ok('3000/tcp')}  ${A.ok('open')}   ${A.amber('portfolio')}  ${A.dim('Next.js 14 (Node.js)')}`,
    `${A.ok('4444/tcp')}  ${A.ok('open')}   ${A.amber('dreams')}     ${A.dim('dream-daemon v0.1 (listening)')}`,
    `${A.ok('8080/tcp')}  ${A.ok('open')}   ${A.amber('grind')}      ${A.dim('grind.sh (infinite loop active)')}`,
    `${A.dim('9999/tcp')}  ${A.dim('closed')} ${A.dimmer('sleep')}      ${A.dimmer('sleep-tracker (service stopped)')}`,
    `${A.ok('1983/tcp')}  ${A.ok('open')}   ${A.amber('retro')}      ${A.dim('ARORA-NET BIOS v1.02')}`,
    '',
    A.dimmer(`Nmap done: 1 IP address (1 host up) scanned in 0.42 seconds`),
  ].join('\r\n');
}

// ── curl wttr.in ─────────────────────────────────────────────────────────────
export async function curlWttr(args: string[], _state: ShellState): Promise<CommandResult> {
  const target = args.find(a => !a.startsWith('-')) ?? 'wttr.in';
  if (!target.includes('wttr.in')) {
    return A.err(`curl: (6) Could not resolve host: ${target}`);
  }
  try {
    const res = await fetch('https://wttr.in/West+Lafayette?format=v2&lang=en');
    if (!res.ok) throw new Error();
    const text = await res.text();
    return A.amber('Weather for ') + A.bright('West Lafayette, IN') + '\r\n\r\n' + text;
  } catch {
    return [
      A.err('curl: failed to reach wttr.in'),
      A.dim('  (Are you offline? The weather is probably still there.)'),
      '',
      A.amber('Current vibe: ☁️  Cloudy with a chance of shipping'),
      A.dim('Temperature: 69°F (perfectly normal)'),
      A.dim('Humidity: 42% (like your test coverage)'),
    ].join('\r\n');
  }
}

// ── open resume.pdf ────────────────────────────────────────────────────────────
export function openResume(_args: string[], _state: ShellState): CommandResult {
  return {
    type: 'open-url',
    url: contact.resumeUrl,
    message: [
      A.ok('Opening resume in new tab...'),
      A.dim(`  → ${contact.resumeUrl}`),
    ].join('\r\n'),
  };
}
