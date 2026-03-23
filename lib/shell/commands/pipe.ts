import { CommandResult, ShellState } from '../types';

export type PipeSegment = {
  cmd: string;
  args: string[];
};

/**
 * Parse a command line into pipe segments.
 * Handles quoted strings to avoid splitting on | inside quotes.
 */
export function parsePipe(input: string): PipeSegment[] {
  const segments: string[] = [];
  let current = '';
  let inQuote = false;
  let quoteChar = '';

  for (const ch of input) {
    if (inQuote) {
      current += ch;
      if (ch === quoteChar) inQuote = false;
    } else if (ch === '"' || ch === "'") {
      inQuote = true;
      quoteChar = ch;
      current += ch;
    } else if (ch === '|') {
      segments.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) segments.push(current.trim());

  return segments.map(seg => {
    const tokens = tokenize(seg);
    return { cmd: tokens[0] ?? '', args: tokens.slice(1) };
  });
}

/** Check if input contains a pipe (not inside quotes). */
export function hasPipe(input: string): boolean {
  let inQuote = false;
  let qc = '';
  for (const ch of input) {
    if (inQuote) { if (ch === qc) inQuote = false; }
    else if (ch === '"' || ch === "'") { inQuote = true; qc = ch; }
    else if (ch === '|') return true;
  }
  return false;
}

/** Check if input is an append redirection: echo "..." >> file */
export function isAppendRedirect(input: string): { message: string; file: string } | null {
  const m = input.match(/^echo\s+["']?(.+?)["']?\s+>>\s+(\S+)$/);
  if (!m) return null;
  return { message: m[1], file: m[2] };
}

/** Simple tokenizer that handles quoted strings. */
function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let inQuote = false;
  let quoteChar = '';

  for (const ch of input) {
    if (inQuote) {
      if (ch === quoteChar) { inQuote = false; }
      else { current += ch; }
    } else if (ch === '"' || ch === "'") {
      inQuote = true;
      quoteChar = ch;
    } else if (ch === ' ' || ch === '\t') {
      if (current) { tokens.push(current); current = ''; }
    } else {
      current += ch;
    }
  }
  if (current) tokens.push(current);
  return tokens;
}
