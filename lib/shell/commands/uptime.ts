import { A } from '../ansi';
import { CommandResult, ShellState } from '../types';

export function uptime(_args: string[], state: ShellState): CommandResult {
  const elapsedMs  = Date.now() - state.startTime;
  const elapsedSec = Math.floor(elapsedMs / 1000);
  const mins  = Math.floor(elapsedSec / 60);
  const secs  = elapsedSec % 60;

  const now = new Date();
  const hh  = now.getHours().toString().padStart(2, '0');
  const mm  = now.getMinutes().toString().padStart(2, '0');

  const uptimeStr = mins > 0
    ? `${mins} min${mins > 1 ? 's' : ''} ${secs} sec`
    : `${secs} sec`;

  return A.amber(
    ` ${hh}:${mm}  up ${uptimeStr},  1 user,  load average: 0.42, 0.13, 0.05`
  );
}
