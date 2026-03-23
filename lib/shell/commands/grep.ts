import { A, highlightMatch } from '../ansi';
import { resolvePath, getNode } from '../filesystem';
import { CommandResult, ShellState } from '../types';

export function grep(
  args: string[],
  state: ShellState,
  stdin?: string
): CommandResult {
  let caseInsensitive = false;
  let invertMatch = false;
  let lineNumbers = false;
  const positional: string[] = [];

  for (const arg of args) {
    if (arg === '-i') caseInsensitive = true;
    else if (arg === '-v') invertMatch = true;
    else if (arg === '-n') lineNumbers = true;
    else if (!arg.startsWith('-')) positional.push(arg);
  }

  const pattern = positional[0];
  if (!pattern) return A.err('grep: missing pattern');

  let content: string;

  // If no file given but stdin provided (pipe)
  if (positional.length < 2) {
    if (!stdin) return A.err('grep: missing file operand');
    content = stdin;
  } else {
    const filePath = resolvePath(positional[1], state.cwd);
    const node = getNode(filePath);
    if (!node) return A.err(`grep: ${positional[1]}: No such file or directory`);
    if (node.type === 'dir') return A.err(`grep: ${positional[1]}: Is a directory`);
    content = node.content;
  }

  const lines = content.split('\n');
  const flags = caseInsensitive ? 'i' : '';

  let re: RegExp;
  try {
    re = new RegExp(pattern, flags);
  } catch {
    return A.err(`grep: invalid regex: ${pattern}`);
  }

  const results: string[] = [];
  lines.forEach((line, idx) => {
    const matches = re.test(line);
    const shouldInclude = invertMatch ? !matches : matches;
    if (shouldInclude) {
      let out = invertMatch ? line : highlightMatch(line, pattern, caseInsensitive);
      if (lineNumbers) out = A.dimmer(`${idx + 1}:`) + out;
      results.push(out);
    }
  });

  if (results.length === 0) return '';
  return results.join('\r\n');
}
