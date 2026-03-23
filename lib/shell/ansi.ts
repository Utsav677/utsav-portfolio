// ANSI escape code helpers for the amber terminal theme.
// Colors map to xterm.js AMBER_THEME:
//   \x1b[33m  = yellow    → --amber        #e8a020
//   \x1b[93m  = br.yellow → --amber-bright #ffcc60
//   \x1b[35m  = magenta   → --amber-mid    #c88818
//   \x1b[36m  = cyan      → --amber-dim    #7a5010
//   \x1b[90m  = br.black  → --amber-dimmer #3d2808
//   \x1b[31m  = red       → --amber-err    #cc4400
//   \x1b[91m  = br.red    → --amber-err-br #ff6622
//   \x1b[32m  = green     → --amber-ok     #88bb22
//   \x1b[34m  = blue      → --amber-info   #4488cc
//   \x1b[37m  = white     → --amber-bright #ffcc60
//   \x1b[97m  = br.white  → --amber-white  #fff8e8

const E = '\x1b[';
export const R = `${E}0m`;

export const A = {
  // Color wrappers (auto-reset)
  amber:  (t: string) => `${E}33m${t}${R}`,
  bright: (t: string) => `${E}93m${t}${R}`,
  mid:    (t: string) => `${E}35m${t}${R}`,
  dim:    (t: string) => `${E}36m${t}${R}`,
  dimmer: (t: string) => `${E}90m${t}${R}`,
  err:    (t: string) => `${E}31m${t}${R}`,
  errBr:  (t: string) => `${E}91m${t}${R}`,
  ok:     (t: string) => `${E}32m${t}${R}`,
  info:   (t: string) => `${E}34m${t}${R}`,
  white:  (t: string) => `${E}37m${t}${R}`,
  snow:   (t: string) => `${E}97m${t}${R}`,

  // Text decoration
  underline: (t: string) => `${E}4m${t}${E}24m`,
  italic:    (t: string) => `${E}3m${t}${E}23m`,
  bold:      (t: string) => `${E}1m${t}${E}22m`,

  // Raw codes (no auto-reset — use when composing multiple colors)
  raw: {
    amber:  `${E}33m`,
    bright: `${E}93m`,
    dim:    `${E}36m`,
    dimmer: `${E}90m`,
    err:    `${E}31m`,
    ok:     `${E}32m`,
    info:   `${E}34m`,
    reset:  R,
  },
};

// Cursor & screen
export const cursor = {
  up:        (n = 1) => `${E}${n}A`,
  down:      (n = 1) => `${E}${n}B`,
  right:     (n = 1) => `${E}${n}C`,
  left:      (n = 1) => `${E}${n}D`,
  col:       (n = 1) => `${E}${n}G`,
  moveTo:    (r: number, c: number) => `${E}${r};${c}H`,
  save:      `${E}s`,
  restore:   `${E}u`,
  hide:      `${E}?25l`,
  show:      `${E}?25h`,
};

export const screen = {
  clear:     `${E}2J${E}H`,
  clearLine: `${E}2K\r`,
  clearToEOL:`${E}0K`,
};

// Box drawing — renders an amber-bordered box
export function box(title: string, lines: string[], width = 60): string {
  const top    = A.amber('┌' + '─'.repeat(width - 2) + '┐');
  const titleL = Math.floor((width - 2 - title.length) / 2);
  const titleR = width - 2 - title.length - titleL;
  const titleRow = A.amber('│') + ' '.repeat(titleL) + A.bright(title) + ' '.repeat(titleR) + A.amber('│');
  const sep    = A.amber('├' + '─'.repeat(width - 2) + '┤');
  const bottom = A.amber('└' + '─'.repeat(width - 2) + '┘');

  const body = lines.map(l => {
    const stripped = stripAnsi(l);
    const pad = Math.max(0, width - 2 - stripped.length);
    return A.amber('│') + ' ' + l + ' '.repeat(pad - 1) + A.amber('│');
  });

  return [top, titleRow, sep, ...body, bottom].join('\r\n');
}

// Strip ANSI codes from a string (for length calculation)
export function stripAnsi(str: string): string {
  return str.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '');
}

// Pad a string to width, ignoring ANSI codes
export function padEnd(str: string, width: number, char = ' '): string {
  const visible = stripAnsi(str).length;
  const pad = Math.max(0, width - visible);
  return str + char.repeat(pad);
}

// Horizontal rule
export function hr(width = 60, char = '─'): string {
  return A.amber(char.repeat(width));
}

// Highlighted match in grep output
export function highlightMatch(line: string, pattern: string, caseInsensitive = false): string {
  const flags = caseInsensitive ? 'gi' : 'g';
  try {
    const re = new RegExp(`(${pattern})`, flags);
    return line.replace(re, A.bright('$1'));
  } catch {
    return line;
  }
}

// Format a file size like ls -l
export function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}K`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}M`;
}

// Hyperlink escape (OSC 8) — clickable links in xterm.js
export function link(url: string, text: string): string {
  return `\x1b]8;;${url}\x07${text}\x1b]8;;\x07`;
}
