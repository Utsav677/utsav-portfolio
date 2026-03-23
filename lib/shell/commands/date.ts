import { A } from '../ansi';
import { CommandResult, ShellState } from '../types';

export function date(_args: string[], _state: ShellState): CommandResult {
  const now = new Date();
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const day   = days[now.getDay()];
  const month = months[now.getMonth()];
  const date  = now.getDate().toString().padStart(2, '0');
  const year  = now.getFullYear();
  const hh    = now.getHours().toString().padStart(2, '0');
  const mm    = now.getMinutes().toString().padStart(2, '0');
  const ss    = now.getSeconds().toString().padStart(2, '0');
  const tz    = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return A.amber(`${day} ${month} ${date} ${hh}:${mm}:${ss} ${tz} ${year}`);
}
