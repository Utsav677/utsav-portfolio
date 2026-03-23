import { A } from '../ansi';
import { resolvePath, getNode } from '../filesystem';
import { CommandResult, ShellState } from '../types';

export function head(args: string[], state: ShellState, stdin?: string): CommandResult {
  let n = 10;
  const positional: string[] = [];

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '-n' && args[i + 1]) {
      n = parseInt(args[++i], 10) || 10;
    } else if (args[i].startsWith('-') && /^-\d+$/.test(args[i])) {
      n = parseInt(args[i].slice(1), 10) || 10;
    } else {
      positional.push(args[i]);
    }
  }

  let content: string;
  if (positional.length === 0) {
    if (!stdin) return A.err('head: missing file operand');
    content = stdin;
  } else {
    const node = getNode(resolvePath(positional[0], state.cwd));
    if (!node) return A.err(`head: ${positional[0]}: No such file or directory`);
    if (node.type === 'dir') return A.err(`head: ${positional[0]}: Is a directory`);
    content = node.content;
  }

  return content.split('\n').slice(0, n).join('\r\n');
}
