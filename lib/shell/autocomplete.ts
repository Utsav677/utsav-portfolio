import { resolvePath, getNode, listDir, isDir } from './filesystem';

export const KNOWN_COMMANDS = [
  'ls', 'cd', 'pwd', 'tree',
  'cat', 'less', 'head', 'tail', 'grep',
  'echo', 'man', 'help', 'clear', 'reset',
  'history', 'date', 'whoami', 'uname', 'uptime',
  'ps', 'top', 'ping', 'fortune', 'cowsay', 'sl',
  'matrix', 'neo', 'neofetch', 'purdue', 'chess',
  'git', 'sudo', 'ssh', 'curl', 'nmap', 'open',
  'hire', 'exit', ':q', ':wq', 'rm',
  './hire.sh',
];

export interface AutocompleteResult {
  /** The completed string to replace the current token with. */
  completion: string;
  /** All possible completions (shown on double-Tab). */
  options: string[];
  /** Whether the completion is unambiguous. */
  isUnique: boolean;
}

/**
 * Compute tab completion for a given input line and cwd.
 *
 * @param input  The full current input line
 * @param cwd    Current working directory
 */
export function autocomplete(input: string, cwd: string): AutocompleteResult {
  const tokens = tokenize(input);

  // Completing a command (first token, no spaces yet OR empty)
  if (tokens.length === 0 || (tokens.length === 1 && !input.endsWith(' '))) {
    const prefix = tokens[0] ?? '';
    return completeCommand(prefix);
  }

  // Completing a path argument
  const lastToken = input.endsWith(' ') ? '' : tokens[tokens.length - 1];
  return completePath(lastToken, cwd, input);
}

function completeCommand(prefix: string): AutocompleteResult {
  const matches = KNOWN_COMMANDS.filter(c => c.startsWith(prefix));
  if (matches.length === 0) return { completion: prefix, options: [], isUnique: false };
  if (matches.length === 1) return { completion: matches[0], options: matches, isUnique: true };
  const common = commonPrefix(matches);
  return { completion: common, options: matches, isUnique: false };
}

function completePath(token: string, cwd: string, fullInput: string): AutocompleteResult {
  // Split token into directory part + basename prefix
  const lastSlash = token.lastIndexOf('/');
  const dirPart   = lastSlash >= 0 ? token.slice(0, lastSlash + 1) : '';
  const filePart  = lastSlash >= 0 ? token.slice(lastSlash + 1)    : token;

  // Resolve the directory to list
  const listPath = dirPart
    ? resolvePath(dirPart.endsWith('/') ? dirPart.slice(0, -1) : dirPart, cwd)
    : cwd;

  // Show hidden files if token starts with a dot or has /. in it
  const showHidden = filePart.startsWith('.') || token.includes('/.');
  const entries = listDir(listPath, showHidden);

  const matches = entries.filter(e => e.startsWith(filePart));

  if (matches.length === 0) return { completion: token, options: [], isUnique: false };

  const completed = matches.map(m => {
    const full = dirPart + m;
    const absPath = resolvePath(full, cwd);
    return isDir(absPath) ? full + '/' : full;
  });

  if (completed.length === 1) {
    return { completion: completed[0], options: completed, isUnique: true };
  }

  const common = commonPrefix(completed);
  return { completion: common, options: completed, isUnique: false };
}

function commonPrefix(strs: string[]): string {
  if (strs.length === 0) return '';
  let prefix = strs[0];
  for (let i = 1; i < strs.length; i++) {
    while (!strs[i].startsWith(prefix)) {
      prefix = prefix.slice(0, -1);
      if (!prefix) return '';
    }
  }
  return prefix;
}

/** Simple tokenizer (respects quoted strings). */
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
