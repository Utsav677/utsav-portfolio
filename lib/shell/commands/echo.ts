import { CommandResult, ShellState } from '../types';

export function echo(args: string[], state: ShellState): CommandResult {
  // `echo "msg" >> guestbook.txt` is handled by dispatcher before reaching here
  // This handles plain echo
  const text = args.join(' ');

  // Remove surrounding quotes
  const clean = text.replace(/^["']|["']$/g, '');
  return clean || '';
}
