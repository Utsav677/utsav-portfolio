import { A, hr } from '../ansi';
import { CommandResult, ShellState } from '../types';

const COMMAND_GROUPS: Array<{ title: string; cmds: Array<[string, string]> }> = [
  {
    title: 'Navigation',
    cmds: [
      ['ls [-la]',   'List directory contents'],
      ['cd <dir>',   'Change directory (supports ~, -, ..)'],
      ['pwd',        'Print working directory'],
      ['tree',       'Display directory tree'],
    ],
  },
  {
    title: 'File Operations',
    cmds: [
      ['cat <file>',           'Display file contents'],
      ['less <file>',          'Paginated file view (q=quit, ↑↓=scroll)'],
      ['head/tail <file>',     'First/last 10 lines (-n for count)'],
      ['grep <pat> <file>',    'Search file for pattern (supports -i, -v, -n)'],
    ],
  },
  {
    title: 'Shell Utilities',
    cmds: [
      ['echo <text>',       'Print text (echo "msg" >> guestbook.txt to sign)'],
      ['man <cmd>',         'Display manual page'],
      ['history',           'Show command history'],
      ['clear / reset',     'Clear the terminal'],
      ['date',              'Current date and time'],
      ['whoami',            'Display identity'],
      ['uname -a',          'System information'],
      ['uptime',            'How long this session has been running'],
    ],
  },
  {
    title: 'Processes',
    cmds: [
      ['ps aux',  'List running processes'],
      ['top',     'Animated process monitor (q=quit)'],
      ['ping <host>', 'Ping a host (Ctrl+C to stop)'],
    ],
  },
  {
    title: 'Guestbook',
    cmds: [
      ['cat guestbook.txt',              'Read visitor messages'],
      ['echo "msg" >> guestbook.txt',    'Leave a message (interactive)'],
    ],
  },
  {
    title: 'Easter Eggs & Fun',
    cmds: [
      ['matrix / neo',     '...'],
      ['hire me',          '(Please)'],
      ['neofetch',         'System info'],
      ['fortune',          'Words of wisdom'],
      ['cowsay <text>',    'ASCII cow'],
      ['git log',          'Project history'],
      ['purdue',           'Boiler Up!'],
      ['chess',            'Play a game'],
      ['sl',               'Choo choo'],
      ['curl wttr.in',     'Local weather'],
    ],
  },
  {
    title: 'Pipe Operator',
    cmds: [
      ['cmd1 | cmd2', 'Pipe output of cmd1 into cmd2'],
      ['cat skills.txt | grep python', 'Example: filter skills'],
    ],
  },
];

export function help(_args: string[], _state: ShellState): CommandResult {
  const lines: string[] = [''];
  lines.push(A.bright('  ARORA.SYS — Command Reference'));
  lines.push(A.amber('  ' + '═'.repeat(54)));
  lines.push('');

  for (const group of COMMAND_GROUPS) {
    lines.push(`  ${A.info('[ ' + group.title + ' ]')}`);
    for (const [cmd, desc] of group.cmds) {
      const cmdStr  = A.amber(cmd.padEnd(28));
      const descStr = A.dim(desc);
      lines.push(`    ${cmdStr} ${descStr}`);
    }
    lines.push('');
  }

  lines.push(A.dimmer('  Tab = autocomplete  ·  ↑↓ = history  ·  Ctrl+L = clear'));
  lines.push('');
  return lines.join('\r\n');
}
