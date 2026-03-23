import { A, padEnd } from '../ansi';
import { CommandResult, ShellState } from '../types';

export async function guestbookRead(_args: string[], _state: ShellState): Promise<CommandResult> {
  try {
    const res = await fetch('/api/guestbook');
    if (!res.ok) throw new Error('fetch failed');
    const entries: Array<{
      id: string;
      name: string;
      message: string;
      country: string | null;
      created_at: string;
    }> = await res.json();

    if (entries.length === 0) {
      return [
        A.amber('┌─────────────────────────────────────────────────────────┐'),
        A.amber('│') + A.bright('                     GUESTBOOK                           ') + A.amber('│'),
        A.amber('│') + '                                                         ' + A.amber('│'),
        A.amber('│') + A.dim('  No entries yet. Be the first!                         ') + A.amber('│'),
        A.amber('│') + A.dim('  echo "your message" >> guestbook.txt                  ') + A.amber('│'),
        A.amber('│') + '                                                         ' + A.amber('│'),
        A.amber('└─────────────────────────────────────────────────────────┘'),
      ].join('\r\n');
    }

    const lines: string[] = [
      A.amber('┌─────────────────────────────────────────────────────────┐'),
      A.amber('│') + A.bright('                     GUESTBOOK                           ') + A.amber('│'),
      A.amber('├─────────────────────────────────────────────────────────┤'),
    ];

    for (const entry of entries.slice(0, 20)) {
      const date = new Date(entry.created_at).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      });
      const flag = entry.country ? ` ${countryFlag(entry.country)}` : '';
      lines.push(
        A.amber('│') + ` ${A.bright(entry.name)}${A.dimmer(flag)}` +
        A.dimmer(` · ${date}`) +
        ' '.repeat(Math.max(0, 58 - entry.name.length - flag.length - date.length - 5)) +
        A.amber('│')
      );
      const msgLines = wrapText(entry.message, 55);
      for (const ml of msgLines) {
        lines.push(A.amber('│') + ` ${A.dim(ml)}` + ' '.repeat(Math.max(0, 57 - ml.length)) + A.amber('│'));
      }
      lines.push(A.amber('├─────────────────────────────────────────────────────────┤'));
    }

    // Replace last separator with bottom border
    lines[lines.length - 1] = A.amber('└─────────────────────────────────────────────────────────┘');

    lines.push('');
    lines.push(A.dim(`  ${entries.length} entr${entries.length === 1 ? 'y' : 'ies'} · echo "msg" >> guestbook.txt to add yours`));

    return lines.join('\r\n');
  } catch {
    return A.err('guestbook: failed to fetch entries. Is Supabase configured?');
  }
}

// Signal for guestbook write — Terminal.tsx handles the interactive prompts
export function guestbookWrite(message: string, _state: ShellState): CommandResult {
  return { type: 'guestbook-write', echoedMessage: message };
}

function wrapText(text: string, max: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    if (cur.length + w.length + 1 <= max) {
      cur = cur ? `${cur} ${w}` : w;
    } else {
      if (cur) lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [''];
}

function countryFlag(country: string): string {
  // Simple country → flag emoji mapping
  const map: Record<string, string> = {
    US: '🇺🇸', IN: '🇮🇳', GB: '🇬🇧', CA: '🇨🇦', AU: '🇦🇺',
    DE: '🇩🇪', FR: '🇫🇷', JP: '🇯🇵', CN: '🇨🇳', BR: '🇧🇷',
    MX: '🇲🇽', KR: '🇰🇷', SG: '🇸🇬', NL: '🇳🇱', SE: '🇸🇪',
  };
  return map[country.toUpperCase()] ?? country;
}
