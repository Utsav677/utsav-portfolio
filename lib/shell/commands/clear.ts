import { CommandResult, ShellState } from '../types';

export function clear(_args: string[], _state: ShellState): CommandResult {
  return { type: 'clear' };
}

export const reset = clear;
