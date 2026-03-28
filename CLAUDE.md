# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio website styled as a Windows 98 desktop environment. Built with Preact, TypeScript, and Vite. Features draggable/resizable windows, multiple "applications" (games, browser simulation, music player), and bilingual support (English/Danish).

## Commands

```bash
npm run dev          # Start development server (localhost:5173)
npm run build        # TypeScript check + Vite build + prerender
npm run preview      # Preview production build locally
npm run test:e2e     # Run Playwright e2e tests (all browsers)
npm run test:e2e:ui  # Run e2e tests with Playwright UI
npm run test:e2e:debug # Run e2e tests in debug mode
```

## Architecture

### Core Stack
- **Preact** with TypeScript (JSX via `react-jsx` with `jsxImportSource: preact`)
- **Vite** for bundling with `@preact/preset-vite`
- **98.css** for Windows 98 UI styling
- **Webamp** for the music player (Winamp simulation)

### Window Management System (`src/app.tsx`)
The app simulates a desktop environment with:
- Multiple windows tracked in state with position, size, zIndex, and state (normal/minimized/maximized)
- Window focusing (zIndex management), dragging, and edge-based resizing
- Music player handled separately from regular windows (uses Webamp library)
- Pages rendered as window content based on `Page` type

### Internationalization (`src/lib/i18n-routing.ts`, `src/context/language-context.tsx`)
- Path-based routing with language prefixes: `/en/projects`, `/da/projekter`
- English default at root (`/`), Danish at `/da/`
- Localized slugs for each page (e.g., `resume` → `cv` in Danish)
- Translations imported from each feature's `translations.ts` file
- Legacy `?lang=` query parameter support with redirects

### Prerendering (`prerender.ts`)
Post-build script that generates static HTML for all routes:
- Static pages for each language (home, projects, resume, contact, games, etc.)
- Dynamic sub-pages for resume entries and project details
- Injects SEO meta tags, hreflang links, and JSON-LD structured data
- Output to `dist/` with language-specific directories (`dist/en/`, `dist/da/`)

### Directory Structure
```
src/
├── app.tsx              # Main app with window management logic
├── main.tsx             # Entry point
├── index.css            # Global styles (window animations, resize handles)
├── components/          # Shared UI (desktop-icons, taskbar, start-menu, seo-head)
├── context/             # Preact contexts (language, status)
├── features/            # Page components organized by feature
│   ├── home/
│   ├── projects/
│   ├── resume/
│   ├── contact/
│   ├── music/
│   ├── browser/
│   ├── taskmanager/
│   ├── minesweeper/
│   ├── freecell/
│   ├── spider/
│   ├── solitaire/
│   ├── hearts/          # Trick-taking card game with AI
│   ├── sudoku/
│   ├── chips/           # Chips Challenge puzzle
│   ├── jezzball/        # Action puzzle game
│   ├── pipedream/       # Pipe-connecting puzzle
│   ├── gallery/
│   ├── errors/         # 404 page
│   └── common/         # Shared translations
├── lib/                 # Utilities
│   ├── i18n-routing.ts # URL parsing/building for i18n
│   └── card-games/     # Shared card game logic (deck, shuffle, types)
└── shared/
    └── types/          # Shared TypeScript types (Page)
```

### Feature Module Pattern
Each feature exports from `index.ts`:
- Page component (e.g., `Home`, `Projects`)
- Translations object (e.g., `homeTranslations`)
- Optional: game-logic.ts, types.ts for complex features

### AI Turn Pattern (for games with AI opponents)
Games with AI players (Hearts, Matador) use a consistent pattern to avoid stale closures:
- **State ref**: `gameStateRef.current` always contains fresh state
- **Turn counter**: Incremented to force AI effect re-runs
- **Processing flags**: `isProcessingRef` prevents duplicate AI processing
- **Player tracking**: `lastProcessedPlayerRef` detects player changes

Example:
```typescript
// In component
const gameStateRef = useRef({ players, phase, currentPlayer });
gameStateRef.current = { players, phase, currentPlayer };
const [turnCounter, setTurnCounter] = useState(0);

// AI effect - only depends on turnCounter
useEffect(() => {
  const state = gameStateRef.current;
  const player = state.players[state.currentPlayer];
  if (!player.isHuman) {
    // Process AI turn using fresh state
    processAITurn(player);
  }
}, [turnCounter]);

// When human completes turn, trigger AI
setTurnCounter(c => c + 1);
```

### Key Types
- `Page`: Union of all page names (add to `src/shared/types/page.ts`, `src/lib/i18n-routing.ts`, and `prerender.ts`)
- `Language`: `'en' | 'da'`
- `WindowData`: Window state in app.tsx (id, page, position, size, zIndex, state)

### Deployment
Configured for Vercel with:
- Trailing slashes and clean URLs
- Security headers (X-Frame-Options, X-Content-Type-Options, XSS-Protection)
- Immutable caching for assets

### SEO
- `SeoHead` component updates meta tags per page
- JSON-LD structured data for Person, WebSite, ContactPage, ItemList
- Sitemap and robots.txt in `public/`
