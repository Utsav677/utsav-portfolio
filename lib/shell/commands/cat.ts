import { A } from '../ansi';
import { resolvePath, getNode, isDir, HOME } from '../filesystem';
import { contact } from '../../data/contact';
import { CommandResult, ShellState } from '../types';

export function cat(args: string[], state: ShellState): CommandResult {
  if (args.length === 0) {
    return A.err('cat: missing operand');
  }

  // Support `cat guestbook.txt` as special route
  const rawArg = args.find(a => !a.startsWith('-')) ?? '';
  if (rawArg === 'guestbook.txt') {
    // Signal dispatcher to handle via guestbook command
    return '__GUESTBOOK_READ__';
  }

  const force = args.includes('--force');
  const filePath = resolvePath(rawArg, state.cwd);
  const node = getNode(filePath);

  if (!node) {
    return A.err(`cat: ${rawArg}: No such file or directory`);
  }

  if (node.type === 'dir') {
    return A.err(`cat: ${rawArg}: Is a directory`);
  }

  // Special: resume.pdf
  if (rawArg === 'resume.pdf' || filePath.endsWith('/resume.pdf')) {
    return {
      type: 'open-url',
      url: contact.resumeUrl,
      message: [
        A.amber('┌─────────────────────────────────────────────┐'),
        A.amber('│') + A.bright('              RESUME.PDF                     ') + A.amber('│'),
        A.amber('│') + '                                             ' + A.amber('│'),
        A.amber('│') + `  ${A.ok('→')} Opening in browser...                   ` + A.amber('│'),
        A.amber('│') + `  ${A.dim(contact.resumeUrl.slice(0, 43))}` + A.amber('│'),
        A.amber('└─────────────────────────────────────────────┘'),
      ].join('\r\n'),
    };
  }

  // Special: .dreams
  if (rawArg === '.dreams' || filePath.endsWith('/.dreams')) {
    if (!force) {
      return [
        A.err('cat: .dreams: Permission denied'),
        '',
        A.dim('  You lack sufficient clearance to read this file.'),
        A.dim(`  Try: ${A.amber('cat .dreams --force')}`),
        '',
        A.dimmer('  ...if you dare.'),
      ].join('\r\n');
    } else {
      // Force-read the dreams
      return [
        A.bright('━'.repeat(50)),
        A.bright('  .dreams — FOR YOUR EYES ONLY'),
        A.bright('━'.repeat(50)),
        '',
        A.amber('  Sometimes I dream of:'),
        '',
        A.dim('  • Building something 100 million people use'),
        A.dim('  • A GPU cluster with no rate limits'),
        A.dim('  • Sleeping past 8am during finals week'),
        A.dim('  • The day my side projects become the main project'),
        A.dim('  • A world where merge conflicts resolve themselves'),
        '',
        A.amber('  But mostly:'),
        '',
        A.bright('  > Making something that lasts.'),
        '',
        A.dimmer('  [end of file]'),
      ].join('\r\n');
    }
  }

  // Normal file: render with ANSI formatting
  const content = node.content;
  return formatFileContent(content, rawArg);
}

function formatFileContent(content: string, filename: string): string {
  const ext = filename.split('.').pop() ?? '';

  // Markdown: style headers
  if (ext === 'md') {
    return content
      .split('\n')
      .map(line => {
        if (line.startsWith('# '))   return A.bright(line);
        if (line.startsWith('## '))  return A.amber(line);
        if (line.startsWith('### ')) return A.mid(line);
        if (line.startsWith('- '))   return A.dim('  ') + A.amber('•') + ' ' + line.slice(2);
        if (line.startsWith('```'))  return A.dimmer(line);
        return line;
      })
      .join('\r\n');
  }

  // Shell script: syntax-ish highlight
  if (ext === 'sh') {
    return content
      .split('\n')
      .map(line => {
        if (line.startsWith('#')) return A.dimmer(line);
        if (line.startsWith('echo')) return A.amber('echo') + line.slice(4);
        return line;
      })
      .join('\r\n');
  }

  // Default: amber for headers (lines starting with ╔ ╗ ║ ╚ ╝ ┌ └ │ ┐ ┘)
  return content
    .split('\n')
    .map(line => {
      if (/^[╔╗║╚╝┌└│┐┘─═┤├┬┴┼▸►•]/.test(line)) return A.amber(line);
      if (/^\[/.test(line)) return A.bright(line);
      return line;
    })
    .join('\r\n');
}
