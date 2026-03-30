# CLAUDE.md

Personal portfolio website as a Windows 98 desktop environment with Preact + TypeScript + Vite.

## Commands

```bash
npm run dev              # Start dev server (localhost:5173)
npm run build            # TypeScript check + build + prerender
npm run preview          # Preview production build
npm run test:e2e         # Run Playwright tests (all browsers)
npm run test:e2e:ui      # Run tests with Playwright UI
npm run test:e2e:debug   # Run tests in debug mode
```

## Architecture

**Stack**: Preact + TypeScript + Vite + 98.css + Webamp (music player)

**Window System** (`src/app.tsx`): Desktop with draggable/resizable windows, focus/zIndex management. Music player separate from regular windows.

**i18n** (`src/lib/i18n-routing.ts`): Path-based routing (`/en/`, `/da/`), localized slugs, translations from feature `translations.ts`.

**Prerendering** (`prerender.ts`): Static HTML for all routes with SEO meta, hreflang, JSON-LD to `dist/`.

**Features Pattern** (`src/features/*/index.ts`): Export page component + translations. Optional `game-logic.ts` / `types.ts` for complex features.

**AI Games** (Hearts, Matador): Use `gameStateRef.current` + `turnCounter` to avoid stale closures in AI effects.

**Key Types**: `Page` (union of page names), `Language: 'en' | 'da'`, `WindowData` (window state).

**Adding Pages**: Add `Page` union to `src/shared/types/page.ts`, `src/lib/i18n-routing.ts`, and `prerender.ts`.

**Deployment**: Vercel with trailing slashes, security headers, immutable caching. `SeoHead` for per-page meta + JSON-LD.

## Directory Structure

```
src/
├── app.tsx              # Main app with window management
├── main.tsx             # Entry point
├── index.css            # Global styles
├── components/          # Shared UI (desktop-icons, taskbar, start-menu, seo-head)
├── context/             # Preact contexts (language, status)
├── features/            # Page components (home, projects, resume, games, etc.)
├── lib/
│   ├── i18n-routing.ts  # URL parsing/building for i18n
│   └── card-games/      # Shared card game logic
└── shared/types/        # Shared TypeScript types (Page)
```

## AI Turn Pattern

Games with AI opponents use refs to avoid stale closures:

```typescript
const gameStateRef = useRef({ players, phase, currentPlayer });
gameStateRef.current = { players, phase, currentPlayer };
const [turnCounter, setTurnCounter] = useState(0);

// AI effect - only depends on turnCounter
useEffect(() => {
  const state = gameStateRef.current;
  const player = state.players[state.currentPlayer];
  if (!player.isHuman) {
    processAITurn(player);
  }
}, [turnCounter]);

// When human completes turn, trigger AI
setTurnCounter(c => c + 1);
```
