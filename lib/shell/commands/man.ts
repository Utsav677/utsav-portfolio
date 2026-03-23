import { A, hr } from '../ansi';
import { CommandResult, ShellState } from '../types';

interface ManPage {
  name: string;
  section: number;
  synopsis: string;
  description: string;
  options?: Array<[string, string]>;
  examples?: Array<[string, string]>;
}

const PAGES: Record<string, ManPage> = {
  ls: {
    name: 'ls', section: 1,
    synopsis: 'ls [OPTION]... [FILE]...',
    description: 'List information about the FILEs (current directory by default).',
    options: [
      ['-a',    'Do not ignore entries starting with .'],
      ['-l',    'Use a long listing format (permissions, size, date)'],
      ['-la',   'Combine -l and -a'],
    ],
    examples: [
      ['ls',           'List current directory'],
      ['ls -la',       'Long listing with hidden files'],
      ['ls projects/', 'List the projects directory'],
    ],
  },
  cd: {
    name: 'cd', section: 1,
    synopsis: 'cd [DIR]',
    description: 'Change the shell working directory. Without DIR, changes to $HOME (/home/utsav). DIR can be an absolute path, relative path, ~ (home), or - (previous directory).',
    examples: [
      ['cd projects',       'Enter projects directory'],
      ['cd ..',             'Go up one level'],
      ['cd ~',              'Return to home'],
      ['cd -',              'Switch to previous directory'],
    ],
  },
  cat: {
    name: 'cat', section: 1,
    synopsis: 'cat [OPTION]... [FILE]...',
    description: 'Concatenate FILE(s) and print on standard output. Works on all files in the virtual filesystem. Special files: resume.pdf (opens browser), .dreams (requires --force).',
    options: [
      ['--force',  'Override permission checks (try: cat .dreams --force)'],
    ],
    examples: [
      ['cat skills.txt',          'View skills'],
      ['cat .dreams --force',     'Read the dreams file (if you dare)'],
      ['cat projects/huddle-social/README.md', 'View project readme'],
    ],
  },
  grep: {
    name: 'grep', section: 1,
    synopsis: 'grep [OPTION]... PATTERN [FILE]',
    description: 'Search for PATTERN in FILE. Matched lines are highlighted in amber-bright. Supports pipe input.',
    options: [
      ['-i',  'Case-insensitive matching'],
      ['-v',  'Invert match (show non-matching lines)'],
      ['-n',  'Show line numbers'],
    ],
    examples: [
      ['grep python skills.txt',           'Find Python in skills'],
      ['cat skills.txt | grep -i ml',      'Case-insensitive ML filter'],
      ['grep -v import contact.txt',       'Lines without "import"'],
    ],
  },
  less: {
    name: 'less', section: 1,
    synopsis: 'less [FILE]',
    description: 'Paginated file viewer. Displays one screenful at a time. Navigate with arrow keys or j/k. Press q to quit.',
    options: [
      ['q',       'Quit'],
      ['↑ / k',   'Scroll up one line'],
      ['↓ / j',   'Scroll down one line'],
      ['PgUp',    'Scroll up one page'],
      ['PgDn',    'Scroll down one page'],
      ['g',       'Go to top'],
      ['G',       'Go to bottom'],
    ],
  },
  man: {
    name: 'man', section: 1,
    synopsis: 'man [COMMAND]',
    description: 'Display the manual page for COMMAND. Manual pages exist for all built-in commands.',
    examples: [
      ['man ls',    'Manual for ls'],
      ['man grep',  'Manual for grep'],
      ['man man',   'This page'],
    ],
  },
  echo: {
    name: 'echo', section: 1,
    synopsis: 'echo [STRING]... [>> FILE]',
    description: 'Display a line of text. Special: "echo \\"message\\" >> guestbook.txt" initiates the guestbook signing flow.',
    examples: [
      ['echo hello world',                 'Print text'],
      ['echo "great portfolio" >> guestbook.txt', 'Sign the guestbook'],
    ],
  },
  ping: {
    name: 'ping', section: 8,
    synopsis: 'ping [OPTIONS] DESTINATION',
    description: 'Send ICMP ECHO_REQUEST packets to network hosts. This is a simulated ping — no actual network packets are sent. Press Ctrl+C to stop.',
    examples: [
      ['ping google.com',   'Ping Google'],
      ['ping localhost',    'Ping yourself (always works)'],
    ],
  },
  top: {
    name: 'top', section: 1,
    synopsis: 'top',
    description: 'Display an animated view of running processes. Updates every second. Press q to quit.',
    options: [
      ['q',  'Quit top'],
    ],
  },
  tree: {
    name: 'tree', section: 1,
    synopsis: 'tree [DIRECTORY]',
    description: 'List contents of directories in a tree-like format.',
    options: [
      ['-a', 'Include hidden files'],
    ],
    examples: [
      ['tree',          'Tree from current directory'],
      ['tree projects', 'Tree of projects directory'],
      ['tree -a',       'Include hidden .secret directory'],
    ],
  },
  ssh: {
    name: 'ssh', section: 1,
    synopsis: 'ssh [user@]hostname',
    description: 'OpenSSH remote login client. This version connects to easter egg hosts. Try: ssh recruiter@tesla.com',
    examples: [
      ['ssh recruiter@tesla.com',   'Connect to dream employer'],
      ['ssh root@localhost',        'Connect locally'],
    ],
  },
  git: {
    name: 'git', section: 1,
    synopsis: 'git <subcommand> [args]',
    description: 'The stupid content tracker. Supported subcommands: log, blame.',
    examples: [
      ['git log',           'View project commit history'],
      ['git blame skills.txt', 'Who wrote this? (sleep deprivation)'],
    ],
  },
  history: {
    name: 'history', section: 1,
    synopsis: 'history',
    description: 'Display the command history list with line numbers. Use !N to run command number N.',
    examples: [
      ['history',  'Show all history'],
      ['!42',      'Re-run command #42'],
    ],
  },
};

export function man(args: string[], _state: ShellState): CommandResult {
  const cmd = args[0];

  if (!cmd) {
    return [
      A.err('man: what manual page do you want?'),
      A.dim('  man <command>'),
      '',
      A.dim('  Available pages: ' + Object.keys(PAGES).join(', ')),
    ].join('\r\n');
  }

  const page = PAGES[cmd.toLowerCase()];
  if (!page) {
    return [
      A.err(`man: no manual entry for ${cmd}`),
      A.dim(`  No man page for "${cmd}". Try: man man`),
    ].join('\r\n');
  }

  const lines: string[] = [
    '',
    A.bright(`${page.name.toUpperCase()}(${page.section})`).padEnd(30) +
    A.dim('ARORA-OS Manual') +
    A.bright(`${page.name.toUpperCase()}(${page.section})`).padStart(20),
    '',
    A.bright('NAME'),
    `       ${A.amber(page.name)} — ${page.description.split('.')[0]}`,
    '',
    A.bright('SYNOPSIS'),
    `       ${A.amber(page.synopsis)}`,
    '',
    A.bright('DESCRIPTION'),
    ...wrapText(page.description, 65).map(l => `       ${l}`),
    '',
  ];

  if (page.options && page.options.length > 0) {
    lines.push(A.bright('OPTIONS'));
    for (const [flag, desc] of page.options) {
      lines.push(`       ${A.amber(flag.padEnd(16))} ${desc}`);
    }
    lines.push('');
  }

  if (page.examples && page.examples.length > 0) {
    lines.push(A.bright('EXAMPLES'));
    for (const [ex, desc] of page.examples) {
      lines.push(`       ${A.amber(ex)}`);
      lines.push(`              ${A.dim(desc)}`);
    }
    lines.push('');
  }

  lines.push(A.dimmer(`ARORA-OS 1.83.0              ${new Date().toLocaleDateString()}             ${page.name.toUpperCase()}(${page.section})`));

  return lines.join('\r\n');
}

function wrapText(text: string, max: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    if (cur.length + w.length + 1 <= max) { cur = cur ? `${cur} ${w}` : w; }
    else { if (cur) lines.push(cur); cur = w; }
  }
  if (cur) lines.push(cur);
  return lines;
}
