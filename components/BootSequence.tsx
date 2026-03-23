'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  onComplete: () => void;
}

const BIOS_LINES = [
  { text: 'ARORA-NET BIOS v1.02  (C) 1983 Utsav Systems Inc.', class: 'bios' },
  { text: 'Copyright (C) 1983-2026, Utsav Arora', class: 'bios' },
  { text: '', class: '' },
];

const POST_CHECKS = [
  { text: 'CPU:    Intel Brain-i9-9999K @ 200%', status: 'OK' },
  { text: 'MEM:    640K RAM........', status: 'OK' },
  { text: 'VGA:    Amber CRT 1920x1080 @60Hz', status: 'OK' },
  { text: 'DISK:   Virtual Filesystem v1.0', status: 'OK' },
  { text: 'NET:    Portfolio Server on :3000', status: 'OK' },
  { text: 'AUDIO:  Mechanical Keyboard (Cherry MX)', status: 'OK' },
  { text: 'SLEEP:  Insufficient (Warning)', status: 'WARN' },
];

const FS_MOUNTS = [
  { path: '/home/utsav',              entries: 6 },
  { path: '/home/utsav/projects',     entries: 7 },
  { path: '/home/utsav/experience',   entries: 3 },
  { path: '/home/utsav/.secret',      entries: 2 },
];

const MOTD = [
  '',
  ' ╔══════════════════════════════════════════════════════════╗',
  ' ║         Welcome to ARORA.SYS Terminal v1.0              ║',
  ' ║         Utsav Arora — CS @ Purdue, Machine Intelligence  ║',
  ' ╚══════════════════════════════════════════════════════════╝',
  '',
  '  Type \x1b[93mhelp\x1b[0m to see all commands.',
  '  Type \x1b[93mwhoami\x1b[0m to learn about me.',
  '  Type \x1b[93mls\x1b[0m to explore the filesystem.',
  '',
];

type LineEntry = { id: number; content: string; color?: string };

export default function BootSequence({ onComplete }: Props) {
  const [lines, setLines]     = useState<LineEntry[]>([]);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase]     = useState(0);
  const [done, setDone]       = useState(false);
  const [memKb, setMemKb]     = useState(0);
  const counterRef            = useRef<number>(0);

  // Add a line with delay
  const addLine = (content: string, color?: string, delay = 0) =>
    new Promise<void>(resolve => {
      setTimeout(() => {
        setLines(prev => [
          ...prev,
          { id: counterRef.current++, content, color },
        ]);
        resolve();
      }, delay);
    });

  useEffect(() => {
    let cancelled = false;

    async function run() {
      // Phase 1: BIOS banner
      for (const line of BIOS_LINES) {
        if (cancelled) return;
        await addLine(line.text, line.class === 'bios' ? 'bright' : undefined, 80);
      }

      // Phase 2: Memory check animation
      await addLine('Testing memory:', undefined, 100);
      const memInterval = setInterval(() => {
        setMemKb(prev => {
          if (prev >= 640) { clearInterval(memInterval); return 640; }
          return prev + 16;
        });
      }, 20);
      await new Promise(r => setTimeout(r, 900));
      await addLine('640K OK', 'ok', 50);
      await addLine('', undefined, 50);

      // Phase 3: POST checks
      await addLine('Running POST checks...', undefined, 100);
      for (const check of POST_CHECKS) {
        if (cancelled) return;
        const statusColor = check.status === 'OK' ? 'ok' :
                            check.status === 'WARN' ? 'warn' : 'err';
        await addLine(
          `  ${check.text.padEnd(42)} [ ${check.status} ]`,
          statusColor,
          70
        );
      }
      await addLine('', undefined, 100);

      // Phase 4: Filesystem mount
      await addLine('Mounting virtual filesystem...', undefined, 100);
      for (const mount of FS_MOUNTS) {
        if (cancelled) return;
        await addLine(
          `  Mounted ${mount.path.padEnd(36)} (${mount.entries} entries)`,
          'dim',
          80
        );
      }
      await addLine('Filesystem mounted.', 'ok', 100);
      await addLine('', undefined, 80);

      // Phase 5: Progress bar
      await addLine('Loading portfolio...', undefined, 100);
      for (let i = 0; i <= 100; i += 4) {
        if (cancelled) return;
        setProgress(i);
        await new Promise(r => setTimeout(r, 30));
      }
      setProgress(100);
      await addLine('', undefined, 100);

      // Phase 6: MOTD
      for (const line of MOTD) {
        if (cancelled) return;
        await addLine(line, 'amber', 40);
      }

      await new Promise(r => setTimeout(r, 400));
      if (!cancelled) setDone(true);
    }

    run();
    return () => { cancelled = true; };
  }, []);

  // Fade out and call onComplete
  useEffect(() => {
    if (done) {
      const timer = setTimeout(onComplete, 600);
      return () => clearTimeout(timer);
    }
  }, [done, onComplete]);

  const lineColor = (color?: string): string => {
    switch (color) {
      case 'bright': return 'var(--amber-bright)';
      case 'ok':     return 'var(--amber-ok)';
      case 'warn':   return 'var(--amber)';
      case 'err':    return 'var(--amber-err)';
      case 'dim':    return 'var(--amber-dim)';
      case 'amber':  return 'var(--amber)';
      default:       return 'var(--amber)';
    }
  };

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="boot-container"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'var(--bg)',
            zIndex: 100,
            padding: '2rem 3rem',
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '13px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Memory counter */}
          {memKb > 0 && memKb < 640 && (
            <div style={{ color: 'var(--amber)', marginBottom: '0.25rem' }}>
              {`${memKb}K / 640K`}
            </div>
          )}

          {/* Boot lines */}
          {lines.map(line => (
            <motion.div
              key={line.id}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.05 }}
              style={{
                color: lineColor(line.color),
                lineHeight: '1.6',
                whiteSpace: 'pre',
              }}
            >
              {line.content || '\u00A0'}
            </motion.div>
          ))}

          {/* Progress bar */}
          {progress > 0 && (
            <div style={{ marginTop: '0.5rem' }}>
              <div
                style={{
                  height: '2px',
                  background: 'var(--amber-dimmer)',
                  width: '480px',
                  maxWidth: '100%',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    background: 'var(--amber)',
                    width: `${progress}%`,
                    boxShadow: '0 0 8px var(--amber-bright)',
                    transition: 'width 0.03s linear',
                  }}
                />
              </div>
            </div>
          )}

          {/* Skip button */}
          <button
            className="boot-skip"
            onClick={onComplete}
            style={{
              position: 'fixed',
              bottom: '1.5rem',
              right: '2rem',
              color: 'var(--amber-dim)',
              fontSize: '11px',
              cursor: 'pointer',
              border: '1px solid var(--amber-dimmer)',
              padding: '0.25rem 0.75rem',
              background: 'transparent',
              fontFamily: "'Share Tech Mono', monospace",
            }}
          >
            Skip [S]
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
