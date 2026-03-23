'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { runCommand, INITIAL_STATE, tokenize } from '../lib/shell/index';
import { historyManager } from '../lib/shell/history';
import { autocomplete } from '../lib/shell/autocomplete';
import { ShellState, CommandResult } from '../lib/shell/types';
import { renderTopFrame } from '../lib/shell/commands/top';
import {
  renderPingHeader,
  renderPingLine,
  renderPingSummary,
} from '../lib/shell/commands/ping';

// ── AMBER xterm.js theme ─────────────────────────────────────────────────────
const AMBER_THEME = {
  background:    '#060401',
  foreground:    '#e8a020',
  cursor:        '#ffcc60',
  cursorAccent:  '#060401',
  black:         '#060401',
  red:           '#cc4400',
  green:         '#88bb22',
  yellow:        '#e8a020',
  blue:          '#4488cc',
  magenta:       '#c88818',
  cyan:          '#7a5010',
  white:         '#ffcc60',
  brightBlack:   '#3d2808',
  brightRed:     '#ff6622',
  brightGreen:   '#aade44',
  brightYellow:  '#ffcc60',
  brightBlue:    '#66aaee',
  brightMagenta: '#e8a020',
  brightCyan:    '#c88818',
  brightWhite:   '#fff8e8',
};

// ── Types ────────────────────────────────────────────────────────────────────
type TerminalMode =
  | 'normal'
  | 'pager'
  | 'top'
  | 'matrix'
  | 'chess'
  | 'sl'
  | 'ssh'
  | 'ping'
  | 'guestbook-name'
  | 'guestbook-message';

interface Props {
  autoRunWhoami?: boolean;
}

// ── Chess board state ────────────────────────────────────────────────────────
const INITIAL_BOARD = [
  ['♜','♞','♝','♛','♚','♝','♞','♜'],
  ['♟','♟','♟','♟','♟','♟','♟','♟'],
  [' ',' ',' ',' ',' ',' ',' ',' '],
  [' ',' ',' ',' ',' ',' ',' ',' '],
  [' ',' ',' ',' ',' ',' ',' ',' '],
  [' ',' ',' ',' ',' ',' ',' ',' '],
  ['♙','♙','♙','♙','♙','♙','♙','♙'],
  ['♖','♘','♗','♕','♔','♗','♘','♖'],
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function Terminal({ autoRunWhoami = false }: Props) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const termRef       = useRef<any>(null);
  const fitRef        = useRef<any>(null);
  const stateRef      = useRef<ShellState>(INITIAL_STATE);
  const inputRef      = useRef<string>('');
  const modeRef       = useRef<TerminalMode>('normal');
  const sessionIdRef  = useRef<string>(
    Math.random().toString(36).slice(2)
  );

  // Pager state
  const pagerLinesRef   = useRef<string[]>([]);
  const pagerOffsetRef  = useRef(0);
  const pagerHeightRef  = useRef(24);

  // Ping state
  const pingHostRef     = useRef('');
  const pingTimesRef    = useRef<number[]>([]);
  const pingSeqRef      = useRef(0);
  const pingTimerRef    = useRef<any>(null);

  // Top state
  const topTickRef    = useRef(0);
  const topTimerRef   = useRef<any>(null);

  // SSH state
  const sshHostRef    = useRef('');
  const sshStepRef    = useRef(0);
  const sshTimerRef   = useRef<any>(null);

  // Guestbook write state
  const gbNameRef     = useRef('');
  const gbMsgRef      = useRef('');

  // Matrix state
  const matrixTimerRef = useRef<any>(null);
  const matrixTickRef  = useRef(0);

  // Chess state
  const chessBoardRef  = useRef(INITIAL_BOARD.map(r => [...r]));
  const chessInputRef  = useRef('');

  // Boot state — keyboard disabled until boot completes
  const bootingRef    = useRef(false);

  // Double-tab state
  const lastTabRef    = useRef(0);

  // ── Write to terminal ──────────────────────────────────────────────────────
  const write = useCallback((text: string) => {
    termRef.current?.write(text);
  }, []);

  const writeln = useCallback((text: string) => {
    termRef.current?.write(text + '\r\n');
  }, []);

  // ── Prompt ────────────────────────────────────────────────────────────────
  const showPrompt = useCallback(() => {
    const state = stateRef.current;
    const cwd   = state.cwd.replace('/home/utsav', '~');
    write(`\r\n\x1b[33mutsav\x1b[0m@\x1b[93marora.sys\x1b[0m:\x1b[34m${cwd}\x1b[0m$ `);
    inputRef.current = '';
  }, [write]);

  // ── Handle command result ──────────────────────────────────────────────────
  const handleResult = useCallback((result: CommandResult) => {
    const term = termRef.current;
    if (!term) return;

    if (typeof result === 'string') {
      if (result === '__GUESTBOOK_READ__') {
        // handled by runCommand
        return;
      }
      if (result) writeln('\r\n' + result);
      return;
    }

    switch (result.type) {
      case 'clear':
        term.clear();
        break;

      case 'noop':
        break;

      case 'open-url':
        writeln('\r\n' + result.message);
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.open(result.url, '_blank');
          }
        }, 300);
        break;

      case 'pager':
        modeRef.current = 'pager';
        pagerLinesRef.current  = result.lines;
        pagerOffsetRef.current = 0;
        pagerHeightRef.current = term.rows - 2;
        term.clear();
        renderPager();
        return; // Don't show prompt

      case 'top':
        modeRef.current = 'top';
        topTickRef.current = 0;
        write('\r\n');
        write(renderTopFrame(0));
        topTimerRef.current = setInterval(() => {
          topTickRef.current++;
          write(renderTopFrame(topTickRef.current));
        }, 1000);
        return;

      case 'matrix':
        startMatrix();
        return;

      case 'chess':
        startChess();
        return;

      case 'sl':
        startSL();
        return;

      case 'ssh-anim':
        startSSH(result.host);
        return;

      case 'ping-anim':
        startPing(result.host);
        return;

      case 'guestbook-write':
        startGuestbookWrite(result.echoedMessage);
        return;
    }
  }, [write, writeln]);

  // ── Pager rendering ────────────────────────────────────────────────────────
  function renderPager() {
    const term = termRef.current;
    if (!term) return;
    const h = pagerHeightRef.current;
    const offset = pagerOffsetRef.current;
    const lines  = pagerLinesRef.current;
    const page   = lines.slice(offset, offset + h);

    term.clear();
    for (const line of page) {
      writeln(line);
    }

    const pct = Math.min(100, Math.round((offset + h) / lines.length * 100));
    const atEnd = offset + h >= lines.length;
    write(`\x1b[7m (${pct}%) ${atEnd ? 'END' : ''} — q:quit j/↓:down k/↑:up \x1b[0m`);
  }

  // ── Matrix rain ────────────────────────────────────────────────────────────
  function startMatrix() {
    modeRef.current = 'matrix';
    const term = termRef.current;
    if (!term) return;
    term.clear();
    writeln('\x1b[32m  [ Entering the Matrix... Press q to exit ]\x1b[0m\r\n');
    matrixTickRef.current = 0;

    const chars = 'ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉ0123456789ABCDEF';
    const cols = term.cols;
    const rows = term.rows;
    const drops: number[] = Array.from({ length: cols }, () =>
      Math.floor(Math.random() * rows)
    );

    matrixTimerRef.current = setInterval(() => {
      const lines: string[] = [];
      for (let r = 0; r < rows; r++) {
        let row = '';
        for (let c = 0; c < cols; c++) {
          const isDrop = drops[c] === r;
          const isTail = Math.abs(drops[c] - r) < 5;
          if (isDrop) {
            row += `\x1b[97m${chars[Math.floor(Math.random() * chars.length)]}\x1b[0m`;
          } else if (isTail) {
            row += `\x1b[32m${chars[Math.floor(Math.random() * chars.length)]}\x1b[0m`;
          } else {
            row += ' ';
          }
        }
        lines.push(row);
      }
      for (let c = 0; c < cols; c++) {
        drops[c] = (drops[c] + 1) % rows;
        if (Math.random() > 0.97) drops[c] = 0;
      }
      term.clear();
      write(lines.join('\r\n'));
    }, 80);
  }

  function stopMatrix() {
    clearInterval(matrixTimerRef.current);
    modeRef.current = 'normal';
    termRef.current?.clear();
    showPrompt();
  }

  // ── Chess ─────────────────────────────────────────────────────────────────
  function startChess() {
    modeRef.current = 'chess';
    chessBoardRef.current = INITIAL_BOARD.map(r => [...r]);
    renderChess();
  }

  function renderChess() {
    const term = termRef.current;
    if (!term) return;
    const b = chessBoardRef.current;
    const lines: string[] = [
      '\r\n',
      '  \x1b[93mASCII CHESS — Type a move (e.g. e2e4) or q to quit\x1b[0m',
      '',
      '     a  b  c  d  e  f  g  h',
      '   ┌──┬──┬──┬──┬──┬──┬──┬──┐',
    ];
    for (let r = 0; r < 8; r++) {
      const rowNum = 8 - r;
      let row = ` ${rowNum} │`;
      for (let c = 0; c < 8; c++) {
        const isDark = (r + c) % 2 === 1;
        const piece  = b[r][c];
        const bg     = isDark ? '\x1b[90m' : '';
        row += `${bg}${piece === ' ' ? '  ' : piece + ' '}\x1b[0m│`;
      }
      lines.push(row);
      if (r < 7) lines.push('   ├──┼──┼──┼──┼──┼──┼──┼──┤');
    }
    lines.push('   └──┴──┴──┴──┴──┴──┴──┴──┘');
    lines.push('');
    lines.push('  \x1b[36mMove: \x1b[0m' + chessInputRef.current);

    term.clear();
    write(lines.join('\r\n'));
  }

  // ── Steam locomotive ────────────────────────────────────────────────────────
  function startSL() {
    modeRef.current = 'sl';
    const term = termRef.current;
    if (!term) return;
    const width = term.cols + 60;
    let pos = width;
    const train = [
      '      ====        ________                ___________',
      '  _D _|  |_______/        \\__I_I_____===__|_________| ',
      '   |(_)---  |   H\\________/ |   |        =|___ ___|   ',
      '   /     |  |   H  |  |     |   |         ||_| |_||   ',
      '  |      |  |   H  |__--------------------| [___] |   ',
      '  | ________|___H__/__|_____/[][]~\\_______|       |   ',
      '  |/ |   |-----------I_____I [][] []  D   |=======|__ ',
      "__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__",
      ' |/-=|___|=   O=====O=====O=====O|_____/~\\___/        ',
      '  \\_/      \\O=====O=====O=====O_/      \\_/            ',
    ];

    const timer = setInterval(() => {
      term.clear();
      const lines = train.map(l => {
        const start = Math.max(0, pos);
        const s = ' '.repeat(Math.max(0, pos)) + l;
        return s.slice(0, term.cols);
      });
      write(lines.join('\r\n'));
      pos -= 2;
      if (pos < -60) {
        clearInterval(timer);
        modeRef.current = 'normal';
        term.clear();
        showPrompt();
      }
    }, 50);
  }

  // ── SSH animation ────────────────────────────────────────────────────────────
  function startSSH(host: string) {
    modeRef.current = 'ssh';
    sshHostRef.current  = host;
    sshStepRef.current  = 0;
    const isRecruiter = host.includes('tesla') || host.includes('google') ||
                        host.includes('apple') || host.includes('amazon') ||
                        host.includes('openai') || host.includes('anthropic');

    const steps = [
      `\r\nSSH connecting to \x1b[93m${host}\x1b[0m...`,
      'Exchanging keys: RSA-4096...',
      'Authenticating as utsav...',
      'Verifying identity: portfolio.verified ✓',
      isRecruiter
        ? '\x1b[32mConnection established.\x1b[0m'
        : '\x1b[31mConnection refused: host not in recruiter database\x1b[0m',
    ];

    const finalMsg = isRecruiter
      ? [
        '',
        '\x1b[93m═══════════════════════════════════════════\x1b[0m',
        '  Resume attached. Opening in your browser.',
        '\x1b[93m═══════════════════════════════════════════\x1b[0m',
        '',
        '  Candidate: Utsav Arora',
        '  Email:     utsiear@gmail.com',
        '  Available: Immediately (intern) · May 2027 (FT)',
        '',
        '  \x1b[33mPlease hire this person.\x1b[0m',
        '',
      ]
      : ['\r\nType: ssh recruiter@tesla.com for the good stuff.'];

    let i = 0;
    sshTimerRef.current = setInterval(() => {
      if (i < steps.length) {
        writeln(steps[i]);
        i++;
      } else {
        clearInterval(sshTimerRef.current);
        for (const line of finalMsg) writeln(line);
        if (isRecruiter) {
          window.open('https://github.com/Utsav677', '_blank');
        }
        modeRef.current = 'normal';
        showPrompt();
      }
    }, 600);
  }

  // ── Ping animation ────────────────────────────────────────────────────────────
  function startPing(host: string) {
    modeRef.current = 'ping';
    pingHostRef.current = host;
    pingSeqRef.current  = 0;
    pingTimesRef.current = [];

    writeln('\r\n' + renderPingHeader(host));

    pingTimerRef.current = setInterval(() => {
      const ms = 5 + Math.random() * 40;
      pingTimesRef.current.push(ms);
      writeln(renderPingLine(host, pingSeqRef.current++, ms));
    }, 1000);
  }

  function stopPing() {
    clearInterval(pingTimerRef.current);
    const sent = pingSeqRef.current;
    writeln(renderPingSummary(sent, sent, pingTimesRef.current));
    modeRef.current = 'normal';
    showPrompt();
  }

  // ── Guestbook write flow ───────────────────────────────────────────────────
  function startGuestbookWrite(echoedMessage: string) {
    gbMsgRef.current  = echoedMessage;
    gbNameRef.current = '';
    modeRef.current   = 'guestbook-name';
    inputRef.current  = '';
    write('\r\n\x1b[93mSign the guestbook!\x1b[0m');
    write(`\r\n\x1b[36mMessage: \x1b[93m"${echoedMessage}"\x1b[0m`);
    write('\r\n\x1b[33mYour name: \x1b[0m');
  }

  async function submitGuestbook() {
    const name    = gbNameRef.current.trim();
    const message = gbMsgRef.current.trim();
    if (!name || !message) {
      writeln('\x1b[31mGuestbook: name and message required.\x1b[0m');
      modeRef.current = 'normal';
      showPrompt();
      return;
    }
    writeln('\r\n\x1b[33mSending...\x1b[0m');
    try {
      const res = await fetch('/api/guestbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, message }),
      });
      if (res.ok) {
        writeln('\x1b[32m✓ Message added! Run "cat guestbook.txt" to see it.\x1b[0m');
      } else {
        writeln('\x1b[31m✗ Failed to save. Please try again.\x1b[0m');
      }
    } catch {
      writeln('\x1b[31m✗ Network error. Is Supabase configured?\x1b[0m');
    }
    modeRef.current = 'normal';
    showPrompt();
  }

  // ── Initialize xterm.js ────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;
    let mounted = true;

    async function init() {
      // Dynamically import xterm and all addons — none can run server-side
      const { Terminal: XTerm } = await import('xterm');
      const { FitAddon }        = await import('xterm-addon-fit');
      const { WebLinksAddon }   = await import('xterm-addon-web-links');

      if (!mounted || !containerRef.current) return;

      // Wait until the container has non-zero dimensions before opening
      await waitForDimensions(containerRef.current);
      if (!mounted || !containerRef.current) return;

      const term = new XTerm({
        theme: AMBER_THEME,
        fontFamily: '"Share Tech Mono", "Courier New", monospace',
        fontSize: 13,
        lineHeight: 1.4,
        cursorBlink: true,
        cursorStyle: 'block',
        scrollback: 5000,
        allowTransparency: true,
      });

      const fitAddon   = new FitAddon();
      const linksAddon = new WebLinksAddon();

      term.loadAddon(fitAddon);
      term.loadAddon(linksAddon);
      term.open(containerRef.current);

      // Use rAF so the DOM has painted before we measure and fit
      await new Promise<void>(resolve => requestAnimationFrame(() => {
        fitAddon.fit();
        resolve();
      }));

      termRef.current = term;
      fitRef.current  = fitAddon;

      // History init
      historyManager.init();

      // ResizeObserver — refit whenever the container changes size
      const resizeObserver = new ResizeObserver(() => {
        requestAnimationFrame(() => fitAddon.fit());
      });
      resizeObserver.observe(containerRef.current);

      // Window resize listener as a belt-and-suspenders fallback
      const onWindowResize = () => requestAnimationFrame(() => fitAddon.fit());
      window.addEventListener('resize', onWindowResize);

      // Log visit
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'visit' }),
      }).catch(() => {});

      // ── Key handler — registered immediately so no keypress is ever lost ──
      term.onData(async (data) => {
        // Block all input during boot sequence
        if (bootingRef.current) return;

        const mode = modeRef.current;

        // ── MATRIX mode: q to exit ─────────────────────────────────────────
        if (mode === 'matrix') {
          if (data === 'q' || data === 'Q' || data === '\x03') stopMatrix();
          return;
        }

        // ── PAGER mode ─────────────────────────────────────────────────────
        if (mode === 'pager') {
          const h = pagerHeightRef.current;
          const max = Math.max(0, pagerLinesRef.current.length - h);
          if (data === 'q' || data === 'Q') {
            term.clear();
            modeRef.current = 'normal';
            showPrompt();
          } else if (data === 'j' || data === '\x1b[B') {
            pagerOffsetRef.current = Math.min(pagerOffsetRef.current + 1, max);
            renderPager();
          } else if (data === 'k' || data === '\x1b[A') {
            pagerOffsetRef.current = Math.max(0, pagerOffsetRef.current - 1);
            renderPager();
          } else if (data === '\x1b[6~' || data === ' ') { // PgDn
            pagerOffsetRef.current = Math.min(pagerOffsetRef.current + h, max);
            renderPager();
          } else if (data === '\x1b[5~') { // PgUp
            pagerOffsetRef.current = Math.max(0, pagerOffsetRef.current - h);
            renderPager();
          } else if (data === 'g') {
            pagerOffsetRef.current = 0;
            renderPager();
          } else if (data === 'G') {
            pagerOffsetRef.current = max;
            renderPager();
          }
          return;
        }

        // ── TOP mode: q to exit ────────────────────────────────────────────
        if (mode === 'top') {
          if (data === 'q' || data === 'Q' || data === '\x03') {
            clearInterval(topTimerRef.current);
            modeRef.current = 'normal';
            term.clear();
            showPrompt();
          }
          return;
        }

        // ── CHESS mode ─────────────────────────────────────────────────────
        if (mode === 'chess') {
          if (data === 'q' || data === 'Q' || data === '\x03') {
            modeRef.current = 'normal';
            term.clear();
            writeln('\x1b[33mGame over. Well played.\x1b[0m');
            showPrompt();
            return;
          }
          if (data === '\r') {
            const mv = chessInputRef.current.trim();
            chessInputRef.current = '';
            // Very simple move parser — just move the piece
            const m = mv.match(/^([a-h])([1-8])([a-h])([1-8])$/);
            if (m) {
              const fc = m[1].charCodeAt(0) - 97;
              const fr = 8 - parseInt(m[2]);
              const tc = m[3].charCodeAt(0) - 97;
              const tr = 8 - parseInt(m[4]);
              const board = chessBoardRef.current;
              if (board[fr][fc] !== ' ') {
                board[tr][tc] = board[fr][fc];
                board[fr][fc] = ' ';
                // Random opponent move
                setTimeout(() => {
                  const pieces: [number,number][] = [];
                  for (let r=0;r<8;r++) for (let c=0;c<8;c++) {
                    if ('♟♜♞♝♛♚'.includes(board[r][c])) pieces.push([r,c]);
                  }
                  if (pieces.length) {
                    const [pr,pc] = pieces[Math.floor(Math.random()*pieces.length)];
                    const nr = (pr + Math.floor(Math.random()*3) - 1 + 8) % 8;
                    const nc = (pc + Math.floor(Math.random()*3) - 1 + 8) % 8;
                    board[nr][nc] = board[pr][pc];
                    board[pr][pc] = ' ';
                  }
                  renderChess();
                }, 500);
              }
            }
            renderChess();
            return;
          }
          if (data === '\x7f') {
            chessInputRef.current = chessInputRef.current.slice(0,-1);
          } else if (data.length === 1 && /[a-h1-8]/.test(data)) {
            chessInputRef.current = (chessInputRef.current + data).slice(0, 4);
          }
          renderChess();
          return;
        }

        // ── PING mode: Ctrl+C to stop ─────────────────────────────────────
        if (mode === 'ping') {
          if (data === '\x03') { stopPing(); }
          return;
        }

        // ── SSH mode: handled internally ───────────────────────────────────
        if (mode === 'ssh') { return; }

        // ── GUESTBOOK name/message input ────────────────────────────────────
        if (mode === 'guestbook-name' || mode === 'guestbook-message') {
          if (data === '\r') {
            const val = inputRef.current.trim();
            inputRef.current = '';
            if (mode === 'guestbook-name') {
              gbNameRef.current = val;
              if (gbMsgRef.current) {
                // Message pre-filled from echo command — submit now
                await submitGuestbook();
              } else {
                modeRef.current = 'guestbook-message';
                write('\r\n\x1b[33mMessage (max 280 chars): \x1b[0m');
              }
            } else {
              gbMsgRef.current = val;
              await submitGuestbook();
            }
            return;
          }
          if (data === '\x7f') {
            if (inputRef.current.length > 0) {
              inputRef.current = inputRef.current.slice(0, -1);
              write('\b \b');
            }
            return;
          }
          if (data === '\x03') {
            modeRef.current = 'normal';
            writeln('\r\n\x1b[31mGuestbook write cancelled.\x1b[0m');
            showPrompt();
            return;
          }
          if (data >= ' ') {
            inputRef.current += data;
            write(data);
          }
          return;
        }

        // ── NORMAL mode ────────────────────────────────────────────────────

        // Ctrl+C — cancel input
        if (data === '\x03') {
          writeln('^C');
          historyManager.reset();
          showPrompt();
          return;
        }

        // Ctrl+L — clear
        if (data === '\x0c') {
          term.clear();
          showPrompt();
          return;
        }

        // Enter
        if (data === '\r') {
          const input = inputRef.current.trim();
          write('\r\n');
          historyManager.push(input);
          historyManager.reset();
          inputRef.current = '';

          if (input) {
            const result = await runCommand(input, stateRef.current);
            stateRef.current = result.newState;
            handleResult(result.output);
          }
          if (modeRef.current === 'normal') showPrompt();
          return;
        }

        // Backspace
        if (data === '\x7f') {
          if (inputRef.current.length > 0) {
            inputRef.current = inputRef.current.slice(0, -1);
            write('\b \b');
          }
          return;
        }

        // Arrow Up — history prev
        if (data === '\x1b[A') {
          const prev = historyManager.prev();
          if (prev !== null) {
            // Clear current input
            write('\b \b'.repeat(inputRef.current.length));
            inputRef.current = prev;
            write(prev);
          }
          return;
        }

        // Arrow Down — history next
        if (data === '\x1b[B') {
          const next = historyManager.next();
          write('\b \b'.repeat(inputRef.current.length));
          inputRef.current = next;
          write(next);
          return;
        }

        // Tab — autocomplete
        if (data === '\t') {
          const now = Date.now();
          const isDouble = now - lastTabRef.current < 400;
          lastTabRef.current = now;

          const result = autocomplete(inputRef.current, stateRef.current.cwd);

          if (result.options.length === 0) return;

          if (result.isUnique || !isDouble) {
            // Replace last token with completion
            const tokens = inputRef.current.split(/\s+/);
            tokens[tokens.length - 1] = result.completion;
            const newInput = inputRef.current.endsWith(' ')
              ? inputRef.current + result.completion
              : tokens.join(' ');

            // Update display
            write('\b \b'.repeat(inputRef.current.length));
            inputRef.current = newInput;
            write(newInput);
          } else {
            // Double tab: show all options
            writeln('');
            writeln(result.options.join('  '));
            showPrompt();
            write(inputRef.current);
          }
          return;
        }

        // Printable characters
        if (data >= ' ' || data === '\t') {
          inputRef.current += data;
          write(data);
        }
      });

      // ── Boot sequence then whoami (first visit only) ────────────────────
      if (autoRunWhoami) {
        bootingRef.current = true;

        const bootLines: string[] = [
          '\x1b[93m  ARORA-NET BIOS v1.02  (C) 1983 Utsav Arora Systems, Inc.\x1b[0m',
          '\x1b[33m  CPU Type: BRAIN-286 @ 2.4 GHz\x1b[0m',
          '\x1b[33m  Base Memory: 640 KB OK\x1b[0m',
          '',
          '\x1b[37m  Running POST...\x1b[0m',
          '\x1b[32m  [PASS] Video adapter\x1b[0m',
          '\x1b[32m  [PASS] Keyboard controller\x1b[0m',
          '\x1b[32m  [PASS] Memory check — 640K OK\x1b[0m',
          '\x1b[32m  [PASS] Drive C: PORTFOLIO.SYS\x1b[0m',
          '',
          '\x1b[33m  Mounting filesystem...\x1b[0m',
          '\x1b[32m  [OK]   /projects     — 7 entries\x1b[0m',
          '\x1b[32m  [OK]   /experience   — 3 entries\x1b[0m',
          '\x1b[32m  [OK]   contact.txt   — found\x1b[0m',
          '',
          '\x1b[93m  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓\x1b[0m',
          '\x1b[93m  ▓▓  ARORA PORTFOLIO OS v1.0 — TERMINAL 1.0  ▓▓\x1b[0m',
          '\x1b[93m  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓\x1b[0m',
          '',
          '\x1b[33m  Starting terminal session...\x1b[0m',
        ];

        await new Promise<void>(resolve => {
          let i = 0;
          const next = () => {
            if (!mounted) { resolve(); return; }
            if (i >= bootLines.length) { setTimeout(resolve, 400); return; }
            term.writeln(bootLines[i++]);
            setTimeout(next, 70);
          };
          next();
        });

        if (mounted) {
          try {
            const result = await runCommand('whoami', stateRef.current);
            if (typeof result.output === 'string' && result.output) {
              term.writeln(result.output);
            }
          } catch { /* ignore whoami errors */ }
          bootingRef.current = false;
          showPrompt();
        }
      } else {
        bootingRef.current = false;
        showPrompt();
      }

      return () => {
        mounted = false;
        resizeObserver.disconnect();
        window.removeEventListener('resize', onWindowResize);
        term.dispose();
        clearInterval(topTimerRef.current);
        clearInterval(matrixTimerRef.current);
        clearInterval(pingTimerRef.current);
        clearInterval(sshTimerRef.current);
      };
    }

    init();
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        background: '#060401',
        overflow: 'hidden',
      }}
    />
  );
}

/** Poll until the element has non-zero clientWidth and clientHeight. */
function waitForDimensions(el: HTMLElement): Promise<void> {
  return new Promise(resolve => {
    if (el.clientWidth > 0 && el.clientHeight > 0) { resolve(); return; }
    const ro = new ResizeObserver(() => {
      if (el.clientWidth > 0 && el.clientHeight > 0) {
        ro.disconnect();
        resolve();
      }
    });
    ro.observe(el);
  });
}
