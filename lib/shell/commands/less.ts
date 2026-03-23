import { A } from '../ansi';
import { resolvePath, getNode } from '../filesystem';
import { CommandResult, ShellState } from '../types';

export function less(args: string[], state: ShellState, stdin?: string): CommandResult {
  const filename = args.find(a => !a.startsWith('-'));
  let content: string;

  if (!filename) {
    if (!stdin) return A.err('less: missing file operand');
    content = stdin;
  } else {
    const node = getNode(resolvePath(filename, state.cwd));
    if (!node) return A.err(`less: ${filename}: No such file or directory`);
    if (node.type === 'dir') return A.err(`less: ${filename}: Is a directory`);
    content = node.content;
  }

  const lines = content.split('\n');
  return {
    type: 'pager',
    content,
    lines,
  };
}
