import { FSNode, FSDir, FSFile } from './types';
import { skillCategories } from '../data/skills';
import { experiences } from '../data/experience';
import { projects } from '../data/projects';
import { contact } from '../data/contact';

const D = (children: Record<string, FSNode>, mtime = 'Mar 22 2026'): FSDir => ({
  type: 'dir',
  children,
  perms: 'drwxr-xr-x',
  mtime,
});

const F = (content: string, mtime = 'Mar 22 2026'): FSFile => ({
  type: 'file',
  content,
  size: content.length,
  perms: '-rw-r--r--',
  mtime,
});

const FX = (content: string, mtime = 'Mar 22 2026'): FSFile => ({
  type: 'file',
  content,
  size: content.length,
  perms: '-rwxr-xr-x',
  mtime,
  executable: true,
});

// ──────────────────────────────────────────────────────────────────────────────
// File Contents
// ──────────────────────────────────────────────────────────────────────────────

const skillsTxt = [
  '╔══════════════════════════════════════╗',
  '║         SKILLS & TECHNOLOGIES        ║',
  '╚══════════════════════════════════════╝',
  '',
  ...skillCategories.flatMap(cat => [
    `[ ${cat.name.toUpperCase()} ]`,
    ...cat.skills.map(s => `  • ${s}`),
    '',
  ]),
  'Last updated: March 2026',
].join('\n');

const contactTxt = [
  '╔══════════════════════════════════════╗',
  '║         CONTACT INFORMATION          ║',
  '╚══════════════════════════════════════╝',
  '',
  `Name:       ${contact.name}`,
  `Email:      ${contact.email}`,
  `GitHub:     ${contact.github}`,
  `LinkedIn:   ${contact.linkedin}`,
  `University: ${contact.university}`,
  `Degree:     ${contact.degree} — ${contact.concentration}`,
  `Minors:     ${contact.minors.join(', ')}`,
  `Grad:       ${contact.graduation}`,
  `Location:   ${contact.location}`,
  '',
  'Open to full-time roles starting May 2027.',
  'Open to internships & research collaborations immediately.',
].join('\n');

const resumeTxt = [
  '┌─────────────────────────────────────────┐',
  '│             RESUME.PDF                  │',
  '│                                         │',
  '│  Opening your browser...               │',
  '│  → ' + contact.resumeUrl.slice(0, 40) + '  │',
  '└─────────────────────────────────────────┘',
].join('\n');

// Project README content
function projectReadme(slug: string): string {
  const p = projects.find(x => x.slug === slug);
  if (!p) return '(project not found)';
  return [
    `# ${p.name}`,
    '',
    p.description,
    '',
    '## Highlights',
    ...p.highlights.map(h => `- ${h}`),
    '',
    `## Stack`,
    p.stack.map(s => `- ${s}`).join('\n'),
    '',
    `## Stats`,
    p.stats,
  ].join('\n');
}

function projectStack(slug: string): string {
  const p = projects.find(x => x.slug === slug);
  if (!p) return '(project not found)';
  return [
    `STACK — ${p.name}`,
    '─'.repeat(40),
    ...p.stack.map(s => `  • ${s}`),
  ].join('\n');
}

function projectMetrics(slug: string): string {
  const p = projects.find(x => x.slug === slug);
  if (!p) return '(project not found)';
  return [
    `METRICS — ${p.name}`,
    '─'.repeat(40),
    `Key Stat:  ${p.stats}`,
    '',
    'Highlights:',
    ...p.highlights.map(h => `  • ${h}`),
  ].join('\n');
}

function experienceTxt(index: number): string {
  const e = experiences[index];
  if (!e) return '(experience not found)';
  return [
    `ROLE:    ${e.role}`,
    `COMPANY: ${e.company}`,
    `PERIOD:  ${e.period}`,
    '',
    'Responsibilities:',
    ...e.description.map(d => `  • ${d}`),
  ].join('\n');
}

const hireSh = [
  '#!/bin/bash',
  '# hire.sh — The most important script in this repo',
  '',
  'echo "Initiating hire sequence..."',
  'echo ""',
  'echo "Candidate: Utsav Arora"',
  'echo "Contact:   utsiear@gmail.com"',
  'echo "GitHub:    github.com/Utsav677"',
  'echo ""',
  'echo "Availability: May 2027 (full-time) / Immediately (internship)"',
  'echo ""',
  'echo "Please hire this person. Thank you."',
].join('\n');

const dreamsContent = `Permission denied.

You need elevated privileges to read this file.

Try: cat .dreams --force

...if you dare.`;

const easterEggsTxt = [
  '# Easter Eggs',
  '# (You found this file. You\'re clearly thorough.)',
  '',
  '[ DISCOVERED ]',
  '  Try typing some of these:',
  '',
  '  matrix          — Go deeper',
  '  hire me         — Please do',
  '  sudo anything   — Nice try',
  '  git log         — Project history',
  '  git blame       — It was sleep deprivation',
  '  neofetch        — System info',
  '  purdue          — Boiler Up!',
  '  chess           — Make a move',
  '  fortune         — Words of wisdom',
  '  cowsay hello    — Moo',
  '  sl              — Train of thought',
  '  :q              — Wrong terminal',
  '  ssh recruiter@tesla.com  — Dream job',
  '  curl wttr.in    — West Lafayette weather',
  '  nmap localhost  — Port scan thyself',
  '  rm -rf /        — The portfolio remains.',
  '',
  '# Good luck. You\'ll need it.',
].join('\n');

// ──────────────────────────────────────────────────────────────────────────────
// Virtual Filesystem Tree
// ──────────────────────────────────────────────────────────────────────────────

export const VFS: FSDir = D({
  home: D({
    utsav: D({
      projects: D({
        'huddle-social': D({
          'README.md': F(projectReadme('huddle-social'), 'Jan 15 2026'),
          'stack.txt':   F(projectStack('huddle-social'), 'Jan 15 2026'),
          'metrics.txt': F(projectMetrics('huddle-social'), 'Jan 15 2026'),
        }, 'Jan 15 2026'),
        'corteva-rag': D({
          'README.md': F(projectReadme('corteva-rag'), 'Dec 10 2025'),
          'stack.txt':   F(projectStack('corteva-rag'), 'Dec 10 2025'),
          'metrics.txt': F(projectMetrics('corteva-rag'), 'Dec 10 2025'),
        }, 'Dec 10 2025'),
        'plate-mate': D({
          'README.md': F(projectReadme('plate-mate'), 'Nov 5 2025'),
          'stack.txt':   F(projectStack('plate-mate'), 'Nov 5 2025'),
          'metrics.txt': F(projectMetrics('plate-mate'), 'Nov 5 2025'),
        }, 'Nov 5 2025'),
        'openclaw': D({
          'README.md': F(projectReadme('openclaw'), 'Feb 20 2026'),
          'stack.txt':   F(projectStack('openclaw'), 'Feb 20 2026'),
          'metrics.txt': F(projectMetrics('openclaw'), 'Feb 20 2026'),
        }, 'Feb 20 2026'),
        'crypto-bot': D({
          'README.md': F(projectReadme('crypto-bot'), 'Oct 1 2025'),
          'stack.txt':   F(projectStack('crypto-bot'), 'Oct 1 2025'),
          'metrics.txt': F(projectMetrics('crypto-bot'), 'Oct 1 2025'),
        }, 'Oct 1 2025'),
        'rahaha': D({
          'README.md': F(projectReadme('rahaha'), 'Mar 1 2026'),
          'stack.txt':   F(projectStack('rahaha'), 'Mar 1 2026'),
          'metrics.txt': F(projectMetrics('rahaha'), 'Mar 1 2026'),
        }, 'Mar 1 2026'),
        'march-madness': D({
          'README.md': F(projectReadme('march-madness'), 'Mar 15 2025'),
          'stack.txt':   F(projectStack('march-madness'), 'Mar 15 2025'),
          'metrics.txt': F(projectMetrics('march-madness'), 'Mar 15 2025'),
        }, 'Mar 15 2025'),
      }),
      experience: D({
        'data-mine.txt': F(experienceTxt(0), 'Dec 10 2025'),
        'sew.txt':       F(experienceTxt(1), 'Aug 15 2025'),
        'acs.txt':       F(experienceTxt(2), 'Mar 22 2026'),
      }),
      'skills.txt':  F(skillsTxt),
      'contact.txt': F(contactTxt),
      'resume.pdf':  F(resumeTxt, 'Mar 20 2026'),
      'hire.sh':     FX(hireSh, 'Mar 22 2026'),
      '.secret': D({
        '.dreams':          F(dreamsContent, 'Sep 1 2024'),
        'easter-eggs.txt':  F(easterEggsTxt, 'Mar 22 2026'),
      }, 'Sep 1 2024'),
    }),
  }),
});

// ──────────────────────────────────────────────────────────────────────────────
// Filesystem Operations
// ──────────────────────────────────────────────────────────────────────────────

export const HOME = '/home/utsav';

/** Resolve a path against a cwd. Returns absolute path or null if invalid. */
export function resolvePath(path: string, cwd: string): string {
  if (path === '~') return HOME;
  if (path.startsWith('~/')) return HOME + path.slice(1);
  if (path.startsWith('/')) return normalizePath(path);
  return normalizePath(cwd + '/' + path);
}

function normalizePath(p: string): string {
  const parts = p.split('/').filter(Boolean);
  const stack: string[] = [];
  for (const part of parts) {
    if (part === '..') stack.pop();
    else if (part !== '.') stack.push(part);
  }
  return '/' + stack.join('/');
}

/** Walk VFS to find a node at an absolute path. Returns null if not found. */
export function getNode(path: string): FSNode | null {
  const parts = path.split('/').filter(Boolean);
  let current: FSNode = VFS;
  for (const part of parts) {
    if (current.type !== 'dir') return null;
    const child: FSNode | undefined = current.children[part];
    if (!child) return null;
    current = child;
  }
  return current;
}

/** List children of a directory (optionally including hidden). */
export function listDir(path: string, showHidden = false): string[] {
  const node = getNode(path);
  if (!node || node.type !== 'dir') return [];
  return Object.keys(node.children).filter(k => showHidden || !k.startsWith('.'));
}

/** Get full metadata for a directory entry. */
export function getDirEntries(
  path: string,
  showHidden = false
): Array<{ name: string; node: FSNode }> {
  const node = getNode(path);
  if (!node || node.type !== 'dir') return [];
  return Object.entries(node.children)
    .filter(([k]) => showHidden || !k.startsWith('.'))
    .map(([name, n]) => ({ name, node: n }));
}

/** Check if a path exists. */
export function exists(path: string): boolean {
  return getNode(path) !== null;
}

/** Check if path is a directory. */
export function isDir(path: string): boolean {
  const n = getNode(path);
  return n !== null && n.type === 'dir';
}

/** Check if path is a file. */
export function isFile(path: string): boolean {
  const n = getNode(path);
  return n !== null && n.type === 'file';
}

/** Get file content. Returns null if not a file. */
export function readFile(path: string): string | null {
  const n = getNode(path);
  if (!n || n.type !== 'file') return null;
  return n.content;
}

/** Get parent directory path. */
export function dirname(path: string): string {
  const parts = path.split('/').filter(Boolean);
  parts.pop();
  return '/' + parts.join('/') || '/';
}

/** Get filename from path. */
export function basename(path: string): string {
  return path.split('/').pop() || '';
}

/** Count entries in a dir (for boot sequence). */
export function countEntries(path: string): number {
  const n = getNode(path);
  if (!n || n.type !== 'dir') return 0;
  return Object.keys(n.children).length;
}
