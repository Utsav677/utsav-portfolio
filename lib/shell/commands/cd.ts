import { A } from '../ansi';
import { resolvePath, isDir, exists, HOME } from '../filesystem';
import { CommandResult, ShellState } from '../types';

export function cd(args: string[], state: ShellState): CommandResult & { newState?: Partial<ShellState> } {
  const target = args[0];

  // cd with no args → go home
  if (!target || target === '~') {
    return {
      newState: { prevDir: state.cwd, cwd: HOME },
    } as any;
  }

  // cd - → go to previous directory
  if (target === '-') {
    const prev = state.prevDir;
    if (!prev) return A.err('cd: no previous directory');
    return {
      output: prev,
      newState: { prevDir: state.cwd, cwd: prev },
    } as any;
  }

  const resolved = resolvePath(target, state.cwd);

  if (!exists(resolved)) {
    return A.err(`cd: ${target}: No such file or directory`);
  }
  if (!isDir(resolved)) {
    return A.err(`cd: ${target}: Not a directory`);
  }

  return {
    newState: { prevDir: state.cwd, cwd: resolved },
  } as any;
}

// Helper used by the dispatcher — cd returns a special object, not a plain string.
export type CdResult = {
  output?: string;
  newState?: Partial<ShellState>;
};
