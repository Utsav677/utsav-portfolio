import { A } from '../ansi';
import { CommandResult, ShellState } from '../types';

export function pwd(_args: string[], state: ShellState): CommandResult {
  return A.amber(state.cwd);
}
