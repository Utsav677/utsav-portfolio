import { A } from '../ansi';
import { CommandResult, ShellState } from '../types';

export function uname(args: string[], _state: ShellState): CommandResult {
  const all = args.includes('-a');
  if (all) {
    return A.amber('ARORA-OS 1.83.0 #1983-SMP x86_64 Portfolio/2026 GCC-13.2.0 ARORA-OS/Kernel');
  }
  return A.amber('ARORA-OS');
}
