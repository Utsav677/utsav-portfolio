const STORAGE_KEY = 'terminal_history';
const MAX_ENTRIES = 1000;

let _history: string[] = [];
let _index = -1; // -1 = not navigating; 0 = oldest; len-1 = newest

function load(): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    _history = raw ? JSON.parse(raw) : [];
  } catch {
    _history = [];
  }
}

function save(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(_history.slice(-MAX_ENTRIES)));
  } catch {
    // Storage full or unavailable
  }
}

export const historyManager = {
  /** Load history from localStorage. Call once on mount. */
  init(): void {
    load();
    _index = -1;
  },

  /** Push a command. Deduplicates consecutive identical entries. */
  push(cmd: string): void {
    const trimmed = cmd.trim();
    if (!trimmed) return;
    if (_history[_history.length - 1] === trimmed) {
      _index = -1;
      return;
    }
    _history.push(trimmed);
    if (_history.length > MAX_ENTRIES) _history.shift();
    save();
    _index = -1;
  },

  /** Navigate backwards (older). Returns the command or null at start. */
  prev(): string | null {
    if (_history.length === 0) return null;
    if (_index === -1) {
      _index = _history.length - 1;
    } else if (_index > 0) {
      _index--;
    }
    return _history[_index] ?? null;
  },

  /** Navigate forwards (newer). Returns empty string at the end (current input). */
  next(): string {
    if (_index === -1) return '';
    if (_index < _history.length - 1) {
      _index++;
      return _history[_index];
    }
    _index = -1;
    return '';
  },

  /** Reset navigation cursor (call after Enter). */
  reset(): void {
    _index = -1;
  },

  /** Return all history entries. */
  getAll(): string[] {
    return [..._history];
  },

  /** Get entry by 1-based index (for !42 expansion). */
  getByIndex(n: number): string | null {
    const idx = n - 1;
    return _history[idx] ?? null;
  },

  /** Clear all history. */
  clear(): void {
    _history = [];
    _index = -1;
    save();
  },

  /** Number of entries. */
  get length(): number {
    return _history.length;
  },
};
