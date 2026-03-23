# CLAUDE.md — Amber 1983 Terminal Portfolio (Full-Stack)

> This document is the single source of truth for building Utsav Arora's full-stack terminal portfolio.
> Read every section before writing any code.

---

## 0. VISION

A fully authentic retro-terminal experience that doubles as a real portfolio.
- Amber phosphor CRT aesthetic (think IBM 5151 monitor, 1983 DOS)
- Every interaction feels like using a real Unix/DOS terminal — keyboard first, mouse second
- Visitors can `cd`, `ls`, `cat`, `grep`, `man`, pipe commands, use tab completion
- Under the hood: real backend, real data, real APIs
- Recruiters and engineers alike should think "whoa" within 3 seconds

The one thing visitors remember: **it's a real terminal that happens to be a portfolio.**

---

## 1. TECH STACK

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + custom CSS variables for the amber theme
- **Terminal engine**: `xterm.js` — real terminal emulator in the browser
  - Enables real cursor, real ANSI escape codes, real scrollback buffer
  - Custom amber theme via `ITheme`
  - WebSocket connection to backend PTY
- **Font**: `Share Tech Mono` (Google Fonts) — the only font used site-wide
- **Animations**: Framer Motion for boot sequence only; xterm handles everything else

### Backend
- **Runtime**: Node.js with Express (or Next.js API routes — your call)
- **Terminal layer**: `node-pty` — spawns a real pseudo-terminal process
  - Commands run against a sandboxed shell (not the host OS)
  - Custom shell binary written in Node that intercepts commands
- **WebSocket**: `ws` library — bidirectional communication between xterm.js and node-pty
- **Database**: PostgreSQL (via Supabase) — stores visitor analytics, guestbook entries, command logs
- **Auth**: None needed for visitors; admin panel protected by a single env-var password

### Deployment
- **Frontend + API**: Vercel
- **Database**: Supabase (free tier is fine)
- **WebSocket server**: Railway or Render (Vercel doesn't support persistent WS)
- **Domain**: your own — point it at Vercel

---

## 2. DIRECTORY STRUCTURE

```
portfolio/
├── app/                        # Next.js App Router
│   ├── page.tsx                # Root — renders <Terminal />
│   ├── layout.tsx              # HTML shell, font, metadata
│   ├── globals.css             # Amber CSS variables + scanlines
│   └── api/
│       ├── analytics/route.ts  # POST visitor events
│       ├── guestbook/route.ts  # GET/POST guestbook
│       └── admin/route.ts      # Protected admin endpoints
│
├── components/
│   ├── Terminal.tsx            # xterm.js wrapper, WS client, boot sequence
│   ├── BootSequence.tsx        # Animated POST boot before terminal loads
│   ├── Scanlines.tsx           # CRT overlay (position: fixed, pointer-events: none)
│   └── AdminPanel.tsx          # Secret admin UI at /admin
│
├── lib/
│   ├── shell/
│   │   ├── index.ts            # Main command dispatcher
│   │   ├── commands/           # One file per command
│   │   │   ├── whoami.ts
│   │   │   ├── ls.ts
│   │   │   ├── cat.ts
│   │   │   ├── cd.ts
│   │   │   ├── grep.ts
│   │   │   ├── man.ts
│   │   │   ├── pipe.ts         # Pipe operator support
│   │   │   ├── guestbook.ts    # cat guestbook / echo >> guestbook
│   │   │   ├── easter.ts       # All easter egg commands
│   │   │   └── help.ts
│   │   ├── filesystem.ts       # Virtual filesystem tree
│   │   ├── autocomplete.ts     # Tab completion engine
│   │   ├── history.ts          # Command history (persisted to localStorage)
│   │   └── ansi.ts             # ANSI escape code helpers (colors, cursor)
│   │
│   ├── db/
│   │   ├── schema.sql          # Full Supabase schema
│   │   ├── analytics.ts        # Log page visits, commands run
│   │   └── guestbook.ts        # CRUD for guestbook entries
│   │
│   └── data/
│       ├── projects.ts         # All project data (typed)
│       ├── experience.ts       # All experience data (typed)
│       ├── skills.ts           # Skills data
│       └── contact.ts          # Contact info
│
├── server/
│   ├── ws-server.ts            # WebSocket + node-pty server (Railway)
│   └── sandbox.ts              # Sandboxed shell command interceptor
│
├── public/
│   └── sounds/
│       ├── keyclick.mp3        # Optional: mechanical keyboard sound on keypress
│       └── boot.mp3            # Optional: retro boot beep
│
├── .env.local
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

---

## 3. VISUAL DESIGN SYSTEM

### Colors (CSS variables — defined in globals.css)
```css
:root {
  --amber:          #e8a020;
  --amber-bright:   #ffcc60;
  --amber-mid:      #c88818;
  --amber-dim:      #7a5010;
  --amber-dimmer:   #3d2808;
  --amber-err:      #cc4400;
  --amber-ok:       #88bb22;
  --amber-info:     #4488cc;
  --bg:             #060401;
  --bg-panel:       #0a0700;
  --bg-hover:       rgba(232, 160, 32, 0.07);
  --scanline-alpha: 0.10;
}
```

### xterm.js Theme
```ts
const AMBER_THEME: ITheme = {
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
```

### CRT Effects (CSS only, position: fixed, pointer-events: none, z-index: 9999)
1. **Scanlines**: `repeating-linear-gradient` every 4px with 10% alpha black
2. **Vignette**: `radial-gradient` dark at edges, transparent center
3. **Phosphor glow**: `text-shadow: 0 0 8px rgba(255, 204, 96, 0.3)` on bright text
4. **Screen flicker**: CSS keyframe animation, very subtle, fires every ~8s
5. **Barrel distortion**: CSS `perspective` + `border-radius` on the terminal container

### Typography
- Font: `Share Tech Mono` everywhere, no exceptions
- Sizes: 13px terminal output, 11px status bar, 15px boot sequence
- No bold — weight variation via color only

---

## 4. TERMINAL ENGINE

### Architecture
```
Browser (xterm.js) <── WebSocket ──> WS Server (Railway) <── node-pty ──> Custom Shell
```

The "custom shell" is NOT bash. It's a Node.js process that:
1. Reads stdin
2. Parses the command
3. Returns formatted ANSI output
4. Never touches the real filesystem

### Virtual Filesystem
The terminal should have a real navigable filesystem tree:

```
/home/utsav/                    ← cwd on start
├── projects/
│   ├── huddle-social/
│   │   ├── README.md
│   │   ├── stack.txt
│   │   └── metrics.txt
│   ├── corteva-rag/
│   ├── plate-mate/
│   ├── openclaw/
│   ├── crypto-bot/
│   ├── rahaha/
│   └── march-madness/
├── experience/
│   ├── data-mine.txt
│   ├── sew.txt
│   └── acs.txt
├── skills.txt
├── contact.txt
├── resume.pdf                  ← cat opens the link
└── .secret/                   ← hidden (ls -la reveals it)
    ├── .dreams
    └── easter-eggs.txt
```

### Commands to implement

**Navigation**
- `ls [dir] [-la] [-a]` — list with permissions, sizes, dates, hidden files
- `cd <dir>` — full path support, `..`, `~`, `-` (previous dir)
- `pwd` — print working directory
- `tree [dir]` — ASCII tree of directory

**File ops**
- `cat <file>` — display with ANSI formatting
- `less <file>` — paginated view (q to quit, arrows to scroll)
- `head <file>` / `tail <file>` — first/last 10 lines
- `grep <pattern> <file>` — highlight matches in amber-bright

**Shell utilities**
- `echo <text>` — print text
- `man <cmd>` — manual page for each command
- `help` — command list
- `clear` / `reset`
- `history` — numbered history list
- `date`, `whoami`, `uname -a`, `uptime`
- `ps aux` — fake process list with funny entries
- `top` — animated fake process monitor
- `ping <host>` — fake ping output

**Pipe operator**
- `cmd1 | cmd2` — e.g. `cat skills.txt | grep python`
- `echo "message" >> guestbook.txt` — writes to DB

**Tab completion**
- Complete commands, paths, file names on Tab
- Double-Tab shows all completions

**Command history**
- Arrow up/down navigates history
- Persisted to localStorage across sessions
- `!42` runs command #42 from history

**Guestbook** (killer feature)
- `cat guestbook.txt` — reads entries from Supabase, rendered as ANSI
- `echo "your message" >> guestbook.txt` — prompts for name, saves to DB
- Entries show: timestamp, name, message, country (from IP geolocation)

**Easter eggs**
- `matrix` / `neo` — scrolling green matrix rain in the terminal
- `sudo <anything>` — "Nice try."
- `hire me` / `./hire.sh` — big ASCII celebration + contact info
- `git log` — fake git history of all projects
- `git blame` — blames everything on "sleep deprivation"
- `neofetch` — system info with ASCII logo
- `purdue` / `boiler up` — ASCII Purdue logo
- `chess` — ASCII chess board, playable vs random moves
- `fortune` — random dev/Utsav quotes
- `cowsay <text>` — retro cowsay output
- `sl` — ASCII steam train crosses the terminal
- `rm -rf /` — "The portfolio remains."
- `:q` / `:wq` — "You're not in vim."
- `exit` — "There is no exit."
- `cat .dreams` — permission denied (cryptic message with --force)
- `ssh recruiter@tesla.com` — SSH handshake animation then "Resume attached."
- `curl wttr.in` — real weather for West Lafayette via wttr.in API
- `nmap localhost` — fake nmap scan showing portfolio services
- `open resume.pdf` — opens resume link in new tab

---

## 5. DATABASE SCHEMA

```sql
-- Visitor analytics
CREATE TABLE visits (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at  timestamptz DEFAULT now(),
  country     text,
  city        text,
  referrer    text,
  user_agent  text
);

-- Command analytics
CREATE TABLE command_logs (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at  timestamptz DEFAULT now(),
  command     text NOT NULL,
  session_id  text,
  country     text
);

-- Guestbook
CREATE TABLE guestbook (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at  timestamptz DEFAULT now(),
  name        text NOT NULL,
  message     text NOT NULL CHECK (char_length(message) <= 280),
  country     text,
  approved    boolean DEFAULT true
);
```

---

## 6. BOOT SEQUENCE

Full-page takeover before the terminal loads. Phases:

1. **BIOS banner** — "ARORA-NET BIOS v1.02 (C) 1983"
2. **Memory check** — counts up to 640K with a counter animation
3. **POST checks** — each line appears with 60–80ms delay
4. **Filesystem mount** — lists each directory with entry count
5. **ASCII progress bar** — fills full width
6. **MOTD** — message of the day
7. **Fade transition** — boot div fades out, terminal fades in
8. **Auto-run** `whoami` on load, cursor blinks awaiting input

Total boot time: 3–4 seconds. Skip button for repeat visitors (check localStorage).

---

## 7. ADMIN PANEL

Route: `/admin` — password protected via env var `ADMIN_PASSWORD`

Features:
- View/approve/delete guestbook entries
- Live command analytics: most-used commands, heatmap by hour
- Visitor count, countries, referrers
- Easter egg discovery rate per egg
- Live feed of commands being typed (WebSocket)

---

## 8. PERFORMANCE & SEO

- FCP target: <1.5s (boot sequence is cosmetic, terminal loads fast)
- `og:image`: static screenshot of terminal as meta image
- `<title>`: "ARORA.SYS — Utsav Arora Portfolio"
- Fonts: preconnect + preload Share Tech Mono
- xterm.js: dynamic import (no SSR)
- node-pty: server-side only, never bundled client-side

---

## 9. PERSONAL DATA

### Identity
- Name: Utsav Arora
- Email: utsiear@gmail.com
- GitHub: github.com/Utsav677
- LinkedIn: linkedin.com/in/u-arora
- University: Purdue University, B.S. CS, May 2027
- Concentration: Machine Intelligence
- Minors: Artificial Intelligence, Mathematics, Psychology

### Experience
| Role | Company | Dates |
|------|---------|-------|
| Undergraduate Researcher | The Data Mine @ Purdue (Corteva Agriscience) | Aug 2025 – Dec 2025 |
| ML Research Intern | Smart Energy Water (SEW) | May 2025 – Aug 2025 |
| Founder | Automated Consultancy Services (ACS) | Jan 2025 – Present |

### Projects
| Name | Key Stats | Stack |
|------|-----------|-------|
| Huddle Social | 2,200+ users | React Native, Node.js, Firebase, Redis, Google Maps |
| Corteva RAG | 15-node agentic graph | LangChain, LangGraph, Chroma, GPT-4 |
| Plate Mate | Best Pitch + Best Presentation @ Purdue Hackathon | Next.js, Supabase, KNN (14 dims), GPT-4 |
| OpenClaw | Scout / Applier / Publisher subagents | Python, LangGraph, multi-agent orchestration |
| Crypto Bot | Solana DEX signal trading | Python, Solana, GCP Cloud Run |
| RAHAHA | SemEval-2026 Task 1 (MWAHAHA) | Python, NLP, LLM fine-tuning |
| March Madness | NCAA bracket prediction | Python, scikit-learn, Monte Carlo simulation |

### Skills
- Languages: Python, Java, C/C++, JavaScript, TypeScript, SQL
- AI/ML: LangChain, LangGraph, PyTorch, TensorFlow, scikit-learn, RAG, vector DBs, CNNs, GRUs, LSTMs
- Web: React Native, Next.js, Node.js, Firebase, Redis, Supabase
- Cloud: AWS, GCP, Docker, Cloud Run
- Currently learning: MCP servers, Apple MLX, vision transformer fine-tuning

---

## 10. ENVIRONMENT VARIABLES

```bash
# .env.local
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_PASSWORD=
WS_SERVER_URL=                   # Railway WebSocket server URL
NEXT_PUBLIC_WS_URL=              # Same, exposed to client
IPINFO_TOKEN=                    # ipinfo.io for geolocation
```

---

## 11. SUGGESTED BUILD ORDER

1. `npx create-next-app portfolio --typescript --tailwind --app`
2. Install: `xterm`, `xterm-addon-fit`, `xterm-addon-web-links`, `@xterm/addon-search`, `framer-motion`
3. Build `BootSequence.tsx` + `Scanlines.tsx`
4. Set up Supabase, run `schema.sql`
5. Build `lib/shell/filesystem.ts` — the virtual filesystem
6. Build command dispatcher + core commands (`ls`, `cat`, `cd`, `whoami`, `help`)
7. Wire xterm.js in `Terminal.tsx` — keyboard input → dispatcher → ANSI output
8. Add tab completion engine
9. Add pipe operator support
10. Add all easter eggs
11. Set up `node-pty` + WS server on Railway
12. Build guestbook (DB read/write via `echo >> guestbook.txt`)
13. Build analytics logging
14. Build `/admin` panel
15. Deploy: Vercel + Railway + Supabase

---

## 12. WHAT MAKES THIS NOT SURFACE-LEVEL

- **xterm.js + node-pty**: real terminal emulator, not a styled textarea
- **Pipe operator**: `cat skills.txt | grep python` actually executes
- **Tab completion**: full filesystem-aware autocomplete on every command
- **Guestbook**: visitors write to a real database through the terminal
- **Analytics**: see what commands recruiters are actually running
- **`less` pager**: paginated scrolling with real keyboard controls
- **`top`**: animated live-updating fake process monitor
- **`man` pages**: every command has a detailed manual page
- **`ssh` easter egg**: full SSH handshake animation to fake hosts
- **`curl wttr.in`**: real live weather data rendered as ANSI art
- **Admin panel**: live dashboard of visitor behavior
- **Per-session history**: persisted across browser refreshes
- **Virtual filesystem**: real `cd`, real paths, real `tree` output

---

*Build this exactly as described. Do not simplify.*
