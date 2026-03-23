import { A, fmtSize, padEnd } from '../ansi';
import {
  resolvePath, getNode, getDirEntries, isDir,
  listDir, exists, HOME,
} from '../filesystem';
import { FSNode } from '../types';
import { CommandResult, ShellState } from '../types';

export function ls(args: string[], state: ShellState): CommandResult {
  // Parse flags and paths
  let showAll   = false;
  let longForm  = false;
  const paths: string[] = [];

  for (const arg of args) {
    if (arg.startsWith('-')) {
      if (arg.includes('a')) showAll  = true;
      if (arg.includes('l')) longForm = true;
    } else {
      paths.push(arg);
    }
  }

  const targetPath = paths.length > 0
    ? resolvePath(paths[0], state.cwd)
    : state.cwd;

  if (!exists(targetPath)) {
    return A.err(`ls: ${paths[0] ?? '.'}: No such file or directory`);
  }

  const node = getNode(targetPath)!;

  // If targeting a file directly
  if (node.type === 'file') {
    if (longForm) return formatLong([{ name: paths[0] ?? '.', node }]);
    return A.amber(paths[0] ?? '.');
  }

  // Directory listing
  const entries = getDirEntries(targetPath, showAll);

  if (entries.length === 0) return '';

  if (longForm) {
    return formatLong(entries, targetPath);
  } else {
    return formatShort(entries);
  }
}

function formatShort(entries: Array<{ name: string; node: FSNode }>): string {
  // Arrange in columns (approximate — assume ~80 char terminal)
  const names = entries.map(({ name, node }) =>
    node.type === 'dir' ? A.info(name + '/') : colorName(name, node)
  );

  const maxLen = Math.max(...entries.map(e => e.name.length)) + 3;
  const cols   = Math.max(1, Math.floor(72 / maxLen));
  const rows   = Math.ceil(names.length / cols);

  const lines: string[] = [];
  for (let r = 0; r < rows; r++) {
    const row: string[] = [];
    for (let c = 0; c < cols; c++) {
      const idx = c * rows + r;
      if (idx < names.length) {
        row.push(padEnd(names[idx], maxLen));
      }
    }
    lines.push(row.join(''));
  }
  return lines.join('\r\n');
}

function formatLong(
  entries: Array<{ name: string; node: FSNode }>,
  dirPath?: string
): string {
  const lines: string[] = [];
  if (dirPath) {
    const totalBlocks = entries.reduce((acc, { node }) =>
      acc + (node.type === 'file' ? Math.ceil(node.size / 512) : 8), 0);
    lines.push(A.dimmer(`total ${totalBlocks}`));
  }

  for (const { name, node } of entries) {
    const perms = node.perms;
    const links = node.type === 'dir' ? '2' : '1';
    const owner = 'utsav';
    const group = 'users';
    const size  = node.type === 'file' ? fmtSize(node.size).padStart(6) : '  4096';
    const mtime = node.mtime;
    const nameStr = node.type === 'dir'
      ? A.info(name + '/')
      : colorName(name, node);

    lines.push(
      `${A.dimmer(perms)}  ${A.dimmer(links)} ${A.dim(owner)} ${A.dim(group)} ${A.amber(size)} ${A.dim(mtime)} ${nameStr}`
    );
  }
  return lines.join('\r\n');
}

function colorName(name: string, node: FSNode): string {
  if (node.type === 'file' && node.executable) return A.ok(name);
  if (name.endsWith('.md'))  return A.bright(name);
  if (name.endsWith('.pdf')) return A.errBr(name);
  if (name.endsWith('.sh'))  return A.ok(name);
  if (name.startsWith('.'))  return A.dimmer(name);
  return A.amber(name);
}
