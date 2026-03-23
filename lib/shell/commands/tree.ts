import { A } from '../ansi';
import { resolvePath, getNode, exists } from '../filesystem';
import { FSNode, FSDir, CommandResult, ShellState } from '../types';

export function tree(args: string[], state: ShellState): CommandResult {
  const target = args.find(a => !a.startsWith('-')) ?? '.';
  const showAll = args.includes('-a');

  const targetPath = target === '.'
    ? state.cwd
    : resolvePath(target, state.cwd);

  if (!exists(targetPath)) {
    return A.err(`tree: ${target}: No such file or directory`);
  }

  const node = getNode(targetPath)!;
  if (node.type !== 'dir') {
    return A.err(`tree: ${target}: Not a directory`);
  }

  const lines: string[] = [A.info(target === '.' ? '.' : target)];
  let fileCount = 0;
  let dirCount = 0;

  renderDir(node, '', showAll, lines, { files: 0, dirs: 0 });

  // Count from lines
  const result = lines.join('\r\n');
  return result;
}

function renderDir(
  dir: FSDir,
  prefix: string,
  showAll: boolean,
  lines: string[],
  count: { files: number; dirs: number }
): void {
  const entries = Object.entries(dir.children).filter(
    ([k]) => showAll || !k.startsWith('.')
  );

  entries.forEach(([name, node], i) => {
    const isLast   = i === entries.length - 1;
    const connector = isLast ? '└── ' : '├── ';
    const childPfx  = isLast ? '    ' : '│   ';

    if (node.type === 'dir') {
      count.dirs++;
      lines.push(prefix + A.amber(connector) + A.info(name + '/'));
      renderDir(node, prefix + childPfx, showAll, lines, count);
    } else {
      count.files++;
      lines.push(prefix + A.amber(connector) + colorTreeFile(name, node));
    }
  });
}

function colorTreeFile(name: string, node: FSNode): string {
  if (node.type === 'file' && node.executable) return A.ok(name);
  if (name.endsWith('.md'))  return A.bright(name);
  if (name.endsWith('.pdf')) return A.errBr(name);
  if (name.endsWith('.sh'))  return A.ok(name);
  if (name.startsWith('.'))  return A.dimmer(name);
  return name;
}
