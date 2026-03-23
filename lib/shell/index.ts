import { CommandResult, ShellState } from './types';
import { parsePipe, hasPipe, isAppendRedirect } from './commands/pipe';
import { historyManager } from './history';
import { HOME } from './filesystem';

// Commands
import { whoami } from './commands/whoami';
import { cd }     from './commands/cd';
import { ls }     from './commands/ls';
import { cat }    from './commands/cat';
import { grep }   from './commands/grep';
import { head }   from './commands/head';
import { tail }   from './commands/tail';
import { less }   from './commands/less';
import { tree }   from './commands/tree';
import { echo }   from './commands/echo';
import { pwd }    from './commands/pwd';
import { clear, reset }   from './commands/clear';
import { date }   from './commands/date';
import { uname }  from './commands/uname';
import { uptime } from './commands/uptime';
import { ps }     from './commands/ps';
import { top }    from './commands/top';
import { ping }   from './commands/ping';
import { fortune } from './commands/fortune';
import { cowsay }  from './commands/cowsay';
import { help }    from './commands/help';
import { man }     from './commands/man';
import { guestbookRead, guestbookWrite } from './commands/guestbook';
import {
  matrix, sudo, hireMe, gitLog, gitBlame, neofetch, purdue,
  chess, sl, rmRf, vimQuit, exitCmd, ssh, nmap, curlWttr, openResume,
} from './commands/easter';

export const INITIAL_STATE: ShellState = {
  cwd:       HOME,
  prevDir:   HOME,
  env:       {},
  startTime: Date.now(),
};

/** Tokenize a command line, respecting quotes. */
export function tokenize(input: string): string[] {
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

export interface RunResult {
  output: CommandResult;
  newState: ShellState;
}

/**
 * Run a command string and return output + updated state.
 * This is the main entry point called by Terminal.tsx on every Enter keypress.
 */
export async function runCommand(
  rawInput: string,
  state: ShellState
): Promise<RunResult> {
  const input = rawInput.trim();

  if (!input) {
    return { output: '', newState: state };
  }

  // Handle !N history expansion
  const bangMatch = input.match(/^!(\d+)$/);
  if (bangMatch) {
    const n = parseInt(bangMatch[1], 10);
    const historicCmd = historyManager.getByIndex(n);
    if (!historicCmd) {
      return {
        output: `\x1b[31mbash: !${n}: event not found\x1b[0m`,
        newState: state,
      };
    }
    return runCommand(historicCmd, state);
  }

  // Check for append redirection: echo "msg" >> guestbook.txt
  const append = isAppendRedirect(input);
  if (append && append.file === 'guestbook.txt') {
    return {
      output: guestbookWrite(append.message, state),
      newState: state,
    };
  }

  // Log command analytics (fire-and-forget, never block)
  logCommand(input).catch(() => {});

  // Handle pipes
  if (hasPipe(input)) {
    return executePipeline(input, state);
  }

  // Execute single command
  const tokens = tokenize(input);
  const cmd    = tokens[0]?.toLowerCase() ?? '';
  const args   = tokens.slice(1);

  return executeSingle(cmd, args, tokens, state, rawInput);
}

async function executeSingle(
  cmd: string,
  args: string[],
  tokens: string[],
  state: ShellState,
  rawInput: string,
  stdin?: string
): Promise<RunResult> {
  let output: CommandResult = '';
  let newState = state;

  switch (cmd) {
    case 'whoami':
      output = whoami(args, state);
      break;

    case 'ls':
      output = ls(args, state);
      break;

    case 'cd': {
      const result = cd(args, state) as any;
      if (result?.newState) {
        newState = { ...state, ...result.newState };
        output   = result.output ?? '';
      } else {
        output = result;
      }
      break;
    }

    case 'pwd':
      output = pwd(args, state);
      break;

    case 'cat':
      if (args[0] === 'guestbook.txt' || rawInput.trim() === 'cat guestbook.txt') {
        output = await guestbookRead(args, state);
      } else {
        output = cat(args, state);
      }
      break;

    case 'less':
      output = less(args, state, stdin);
      break;

    case 'head':
      output = head(args, state, stdin);
      break;

    case 'tail':
      output = tail(args, state, stdin);
      break;

    case 'grep':
      output = grep(args, state, stdin);
      break;

    case 'tree':
      output = tree(args, state);
      break;

    case 'echo': {
      output = echo(args, state);
      break;
    }

    case 'clear':
    case 'reset':
      output = clear(args, state);
      break;

    case 'date':
      output = date(args, state);
      break;

    case 'uname':
      output = uname(args, state);
      break;

    case 'uptime':
      output = uptime(args, state);
      break;

    case 'ps':
      output = ps(args, state);
      break;

    case 'top':
      output = top(args, state);
      break;

    case 'ping':
      output = ping(args, state);
      break;

    case 'fortune':
      output = fortune(args, state);
      break;

    case 'cowsay':
      output = cowsay(args, state);
      break;

    case 'help':
    case '?':
      output = help(args, state);
      break;

    case 'man':
      output = man(args, state);
      break;

    case 'history': {
      const all = historyManager.getAll();
      if (all.length === 0) {
        output = '\x1b[36mNo commands in history.\x1b[0m';
      } else {
        output = all
          .map((cmd, i) => `  ${String(i + 1).padStart(4)}  \x1b[33m${cmd}\x1b[0m`)
          .join('\r\n');
      }
      break;
    }

    case 'matrix':
    case 'neo':
      output = matrix(args, state);
      break;

    case 'sudo':
      output = sudo(args, state);
      break;

    case 'hire':
      if (args[0] === 'me') { output = hireMe(args, state); break; }
      output = '\x1b[31mbash: hire: command not found. Did you mean: hire me?\x1b[0m';
      break;

    case './hire.sh':
    case 'hire.sh':
      output = hireMe(args, state);
      break;

    case 'git':
      if (args[0] === 'log')   { output = gitLog(args.slice(1), state); break; }
      if (args[0] === 'blame') { output = gitBlame(args.slice(1), state); break; }
      output = '\x1b[31mgit: unknown subcommand. Try: git log, git blame\x1b[0m';
      break;

    case 'neofetch':
      output = neofetch(args, state);
      break;

    case 'purdue':
    case 'boiler':
    case 'boilerup':
    case 'boiler up':
      output = purdue(args, state);
      break;

    case 'chess':
      output = chess(args, state);
      break;

    case 'sl':
      output = sl(args, state);
      break;

    case 'rm':
      if (args.join(' ').includes('-rf') || args.includes('-r')) {
        output = rmRf(args, state);
      } else {
        output = '\x1b[31mrm: refusing to remove without -r\x1b[0m';
      }
      break;

    case ':q':
    case ':wq':
    case ':q!':
      output = vimQuit(args, state);
      break;

    case 'exit':
    case 'quit':
      output = exitCmd(args, state);
      break;

    case 'ssh':
      output = ssh(args, state);
      break;

    case 'nmap':
      output = nmap(args, state);
      break;

    case 'curl': {
      const target = args.find(a => !a.startsWith('-')) ?? '';
      if (target.includes('wttr.in')) {
        output = await curlWttr(args, state);
      } else {
        output = '\x1b[31mcurl: unsupported URL. Try: curl wttr.in\x1b[0m';
      }
      break;
    }

    case 'open':
      if (args[0]?.includes('resume')) {
        output = openResume(args, state);
      } else {
        output = '\x1b[31mopen: unsupported. Try: open resume.pdf\x1b[0m';
      }
      break;

    case '':
      output = '';
      break;

    default:
      output = `\x1b[31mbash: ${cmd}: command not found\x1b[0m\r\n\x1b[36mType \x1b[93mhelp\x1b[36m to see available commands.\x1b[0m`;
  }

  return { output, newState };
}

/** Execute a pipeline: cmd1 | cmd2 | ... */
async function executePipeline(input: string, state: ShellState): Promise<RunResult> {
  const segments = parsePipe(input);
  let stdin: string | undefined;
  let currentState = state;

  for (const segment of segments) {
    const { cmd, args } = segment;
    const result = await executeSingle(
      cmd.toLowerCase(), args, [cmd, ...args], currentState, cmd, stdin
    );

    // Convert output to string for piping
    const out = result.output;
    if (typeof out === 'string') {
      stdin = out.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, ''); // strip ANSI for next cmd
    } else {
      // Non-string result (pager, matrix, etc.) — stop the pipe here
      return { output: out, newState: result.newState };
    }

    currentState = result.newState;
  }

  return { output: stdin ?? '', newState: currentState };
}

async function logCommand(cmd: string): Promise<void> {
  try {
    await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'command', command: cmd }),
    });
  } catch {
    // Silently ignore
  }
}
