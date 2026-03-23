export type CommandResult =
  | string
  | { type: 'clear' }
  | { type: 'pager'; content: string; lines: string[] }
  | { type: 'top' }
  | { type: 'chess' }
  | { type: 'matrix' }
  | { type: 'sl' }
  | { type: 'ssh-anim'; host: string }
  | { type: 'ping-anim'; host: string }
  | { type: 'open-url'; url: string; message: string }
  | { type: 'guestbook-write'; echoedMessage: string }
  | { type: 'noop' };

export interface ShellState {
  cwd: string;
  prevDir: string;
  env: Record<string, string>;
  startTime: number;
}

export interface FSFile {
  type: 'file';
  content: string;
  size: number;
  perms: string;
  mtime: string;
  executable?: boolean;
}

export interface FSDir {
  type: 'dir';
  children: Record<string, FSNode>;
  perms: string;
  mtime: string;
}

export type FSNode = FSFile | FSDir;
