---
title: Refactor Code into Feature Domains
type: refactor
date: 2026-02-24
---

# Refactor Code into Feature Domains

## Overview

Reorganize the Preact/TypeScript portfolio website from technical layer organization (`context/`, `components/`, `pages/`) into feature-based domains. Each feature will contain its own components, data, translations, and types co-located in a single folder.

## Problem Statement / Motivation

### Current Issues

1. **Hard to navigate** - Related code is scattered across multiple folders. Finding all code for "Projects" requires checking `pages/projects.tsx`, `components/slide-*.tsx`, and `language-context.tsx` for translations.

2. **High coupling** - `language-context.tsx` contains 500+ lines with ALL translations AND data (resume items, projects). Changes ripple unexpectedly.

3. **Type duplication** - The `Page` type is redefined in 5+ files instead of imported centrally.

4. **Future extraction prep** - If we want to extract features into separate packages later, the current structure doesn't support clear boundaries.

### Goals

- Co-locate feature-related code (components, data, translations, types)
- Reduce coupling between features
- Enable easier navigation and maintenance
- Prepare for potential future extraction of features

## Proposed Solution

### Target Structure

```
src/
├── app.tsx                    # Main app (window manager, page imports)
├── main.tsx                   # Entry point
├── index.css                  # Global styles
│
├── shared/                    # Cross-feature shared code
│   ├── types/
│   │   └── page.ts           # Unified Page type
│   ├── components/
│   │   ├── Window.tsx        # Windows 98 window frame component
│   │   └── LanguageSwitcher.tsx
│   └── hooks/
│       └── usePageIcons.ts   # Shared icon mapping
│
├── context/                   # Global contexts (slimmed down)
│   ├── language-context.tsx   # Language state + translation aggregation
│   └── status-context.tsx     # Status bar state
│
├── lib/
│   └── i18n-routing.ts        # URL routing utilities
│
└── features/
    ├── home/
    │   ├── index.tsx          # Page component (renamed from page.tsx for React conventions)
    │   ├── translations.ts    # Feature-specific translations
    │   └── index.ts           # Public API exports
    │
    ├── projects/
    │   ├── index.tsx          # ProjectsPage component
    │   ├── components/
    │   │   ├── PowerPointToolbar.tsx
    │   │   ├── SlideSidebar.tsx
    │   │   └── SlideView.tsx
    │   ├── data.ts            # Project items data
    │   ├── translations.ts
    │   ├── types.ts
    │   └── index.ts
    │
    ├── resume/
    │   ├── index.tsx          # ResumePage component
    │   ├── data.ts            # Resume items data
    │   ├── translations.ts
    │   └── index.ts
    │
    ├── contact/
    │   ├── index.tsx          # ContactPage component
    │   ├── translations.ts
    │   └── index.ts
    │
    ├── browser/
    │   ├── index.tsx          # BrowserPage component
    │   ├── translations.ts
    │   ├── types.ts           # GitHub API types
    │   └── index.ts
    │
    ├── music/
    │   ├── index.tsx          # MusicPlayer component
    │   ├── data.ts            # Track list
    │   └── index.ts
    │
    └── common/
        └── translations.ts    # Shared strings (nav labels, brand, errors)
```

### Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Translation aggregation | Import and merge in `language-context.tsx` | Simple, explicit, TypeScript-safe |
| Page registration | Direct imports from feature folders | No magic, easy to understand |
| Shared components | `shared/` folder at root | Clear boundary between shared vs feature-specific |
| Feature public API | `index.ts` barrel exports | Encapsulation, controlled surface area |

## Technical Approach

### Phase 1: Foundation - Create Shared Structure

Create the `shared/` folder and move truly shared code.

**Files to create:**

```typescript
// src/shared/types/page.ts
export type Page = 'home' | 'projects' | 'resume' | 'contact' | 'music' | 'browser' | 'notfound';

// src/shared/types/translation.ts
export type Language = 'en' | 'da';
export type TranslationKey = string;
```

**Tasks:**
- [x] Create `src/shared/types/page.ts` with unified `Page` type
- [x] Create `src/shared/types/index.ts` barrel export
- [x] Update all files to import `Page` from `@/shared/types`
- [x] Remove duplicated `Page` type definitions from 5+ files

### Phase 2: Translation System Refactor

Extract translations from `language-context.tsx` into feature-specific files.

**Before (current):**
```typescript
// src/context/language-context.tsx (500+ lines)
const translations = {
  en: {
    brand: 'Martin Christiansen',
    nav: { home: 'Home', ... },
    home: { title: "Hi I'm Martin", ... },
    projects: { title: 'Projects', items: [...] },
    resume: { title: 'Resume', items: [...] },
    // ... everything in one file
  },
  da: { ... }
};
```

**After (proposed):**
```typescript
// src/features/common/translations.ts
export const commonTranslations = {
  en: {
    brand: 'Martin Christiansen',
    start: 'Start',
    nav: { home: 'Home', projects: 'Projects', ... },
    footer: { builtWith: 'Built with Preact & 98.css' },
    notFound: { ... }
  },
  da: { ... }
};

// src/features/projects/translations.ts
export const projectsTranslations = {
  en: {
    title: 'Projects',
    subtitle: 'A selection of things I have built'
  },
  da: { ... }
};

// src/features/projects/data.ts
export const projectsData = [
  { id: 1, name: 'Is it dns?', url: 'https://erdetdns.dk', ... },
  { id: 2, name: 'Bånder', url: 'https://github.com/baander-app', ... }
];

// src/context/language-context.tsx (slimmed)
import { commonTranslations } from '../features/common/translations';
import { projectsTranslations } from '../features/projects/translations';
import { resumeTranslations } from '../features/resume/translations';
// ... etc

function mergeTranslations() {
  return {
    en: {
      ...commonTranslations.en,
      home: homeTranslations.en,
      projects: { ...projectsTranslations.en, items: projectsData },
      // ... merge all features
    },
    da: { ... }
  };
}
```

**Tasks:**
- [x] Create `src/features/common/translations.ts` with shared strings
- [x] Create `src/features/home/translations.ts`
- [x] Create `src/features/projects/translations.ts`
- [x] Create `src/features/projects/data.ts` (extract project items)
- [x] Create `src/features/resume/translations.ts`
- [x] Create `src/features/resume/data.ts` (extract resume items)
- [x] Create `src/features/contact/translations.ts`
- [x] Create `src/features/browser/translations.ts`
- [x] Update `language-context.tsx` to import and merge feature translations
- [x] Verify language switching still works

### Phase 3: Move Pages to Features

Migrate page components from `pages/` to their feature folders.

**Tasks:**
- [x] Create `src/features/home/` folder structure
- [x] Move `pages/home.tsx` → `features/home/index.tsx`
- [x] Create `src/features/projects/` folder structure
- [x] Move `pages/projects.tsx` → `features/projects/index.tsx`
- [x] Move slide components to `features/projects/components/`
- [x] Create `src/features/resume/` folder structure
- [x] Move `pages/resume.tsx` → `features/resume/index.tsx`
- [x] Create `src/features/contact/` folder structure
- [x] Move `pages/contact.tsx` → `features/contact/index.tsx`
- [x] Create `src/features/browser/` folder structure
- [x] Move `pages/browser.tsx` → `features/browser/index.tsx`
- [x] Create `src/features/music/` folder structure
- [x] Move `pages/music.tsx` → `features/music/index.tsx`

### Phase 4: Update Imports in app.tsx

Update `app.tsx` to import pages from feature folders.

**Before:**
```typescript
import { Home } from './pages/home';
import { Projects } from './pages/projects';
// ...
```

**After:**
```typescript
import { Home } from './features/home';
import { Projects } from './features/projects';
// ...
```

**Tasks:**
- [ ] Update all page imports in `app.tsx`
- [ ] Update `renderContent()` switch statement if needed
- [ ] Verify window management still works

### Phase 5: Move Shared Components

Identify and move components that are truly shared across features.

**Candidates for `shared/components/`:**
- Window frame (from `app.tsx` - extract to component)
- LanguageSwitcher (used in Taskbar)

**Components that stay feature-specific:**
- PowerPointToolbar, SlideSidebar, SlideView (projects-only)

**Tasks:**
- [ ] Extract Window component from `app.tsx` to `shared/components/Window.tsx`
- [ ] Move `components/language-switcher.tsx` → `shared/components/LanguageSwitcher.tsx`
- [ ] Update imports in Taskbar and app.tsx

### Phase 6: Cleanup

Remove old structure and verify everything works.

**Tasks:**
- [ ] Delete empty `pages/` folder
- [ ] Delete empty `components/` folder (if all moved)
- [ ] Update any remaining import paths
- [ ] Run build to verify no TypeScript errors
- [ ] Test all features manually
- [ ] Test language switching on all pages

## Acceptance Criteria

### Functional Requirements

- [ ] All 6 features (home, projects, resume, contact, browser, music) work correctly
- [ ] Window management (open, close, minimize, maximize, drag, resize) works
- [ ] Language switching (EN/DA) updates all visible text
- [ ] URL routing with language prefixes (`/en/projects`, `/da/projekter`) works
- [ ] Music player (Webamp) opens and plays tracks
- [ ] Browser feature navigates to URLs and fetches GitHub API data
- [ ] Contact form validates and shows success state
- [ ] Projects slide navigation (keyboard and click) works
- [ ] Resume sidebar navigation works

### Non-Functional Requirements

- [ ] No TypeScript errors (`npm run build` succeeds)
- [ ] No runtime console errors
- [ ] Build time not significantly increased
- [ ] Bundle size not significantly increased

### Code Quality

- [ ] `Page` type defined once in `shared/types/page.ts`
- [ ] Each feature has its own `translations.ts`
- [ ] Data (projects, resume items) extracted from translations
- [ ] Feature folders have consistent structure
- [ ] Each feature exports via `index.ts`

## Dependencies & Risks

### Dependencies

- No external dependencies required
- TypeScript 5.x already configured
- Vite already configured

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Translation merge breaks text display | Medium | Critical | Test language switch after Phase 2 |
| Import paths break during migration | High | Medium | TypeScript catches at compile time |
| Circular dependencies between features | Low | High | Keep features isolated, use shared/ |
| Inconsistent folder structure | Medium | Low | Document conventions, use templates |

### Rollback Plan

Git commits after each phase allow easy rollback:
```
git revert HEAD  # Roll back last phase
```

## References & Research

### Internal References

- `src/app.tsx:1-500` - Window management + page rendering
- `src/context/language-context.tsx:1-501` - All translations + data
- `src/lib/i18n-routing.ts:1-127` - URL routing utilities

### Patterns Applied

- Feature-sliced design principles
- Co-location of related code
- Barrel exports for public API

### Related Work

- None (first major refactor)
