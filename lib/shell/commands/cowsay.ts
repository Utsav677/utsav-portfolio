import { A } from '../ansi';
import { CommandResult, ShellState } from '../types';

export function cowsay(args: string[], _state: ShellState): CommandResult {
  const text = args.join(' ').replace(/^["']|["']$/g, '') || 'Moo.';

  const maxLen = 40;
  const lines  = wrapText(text, maxLen);
  const width  = Math.max(...lines.map(l => l.length));

  const top    = ' ' + '_'.repeat(width + 2);
  const bottom = ' ' + '-'.repeat(width + 2);

  let bubble: string[];
  if (lines.length === 1) {
    bubble = [`< ${lines[0].padEnd(width)} >`];
  } else {
    bubble = lines.map((l, i) => {
      const padded = l.padEnd(width);
      if (i === 0)              return `/ ${padded} \\`;
      if (i === lines.length - 1) return `\\ ${padded} /`;
      return `| ${padded} |`;
    });
  }

  const cow = [
    '        \\   ^__^',
    '         \\  (oo)\\_______',
    '            (__)\\       )\\/\\',
    '                ||----w |',
    '                ||     ||',
  ];

  return A.amber([top, ...bubble, bottom, ...cow].join('\r\n'));
}

function wrapText(text: string, max: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    if (cur.length + w.length + 1 <= max) {
      cur = cur ? cur + ' ' + w : w;
    } else {
      if (cur) lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [''];
}
