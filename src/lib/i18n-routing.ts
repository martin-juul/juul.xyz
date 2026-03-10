import { type Page } from '../shared/types';
export { type Page } from '../shared/types';

export type Language = 'en' | 'da';

export const SUPPORTED_LANGUAGES: Language[] = ['en', 'da'];

export const DEFAULT_LANGUAGE: Language = 'en';

// Localized slugs for each page
export const PAGE_SLUGS: Record<Language, Record<Page, string>> = {
  en: {
    home: '',
    projects: 'projects',
    resume: 'resume',
    contact: 'contact',
    music: 'music',
    browser: 'browser',
    taskmanager: 'task-manager',
    minesweeper: 'minesweeper',
    freecell: 'freecell',
    spider: 'spider',
    solitaire: 'solitaire',
    sudoku: 'sudoku',
    gallery: 'gallery',
    matador: 'matador',
    mediaplayer: 'media-player',
    notfound: 'not-found',
  },
  da: {
    home: '',
    projects: 'projekter',
    resume: 'cv',
    contact: 'kontakt',
    music: 'musik',
    browser: 'internet',
    taskmanager: 'opgavestyring',
    minesweeper: 'minestryger',
    freecell: 'freecell',
    spider: 'edderkop',
    solitaire: 'kabale',
    sudoku: 'sudoku',
    gallery: 'billedgalleri',
    matador: 'matador',
    mediaplayer: 'medieafspiller',
    notfound: 'not-found',
  },
};

// Reverse mapping: slug -> page for each language
const buildSlugToPageMap = (): Record<Language, Record<string, Page>> => {
  const map: Record<Language, Record<string, Page>> = { en: {}, da: {} };
  for (const lang of SUPPORTED_LANGUAGES) {
    for (const [page, slug] of Object.entries(PAGE_SLUGS[lang])) {
      map[lang][slug] = page as Page;
    }
  }
  return map;
};

export const SLUG_TO_PAGE = buildSlugToPageMap();

/**
 * Parse a URL pathname to extract language and page
 * Examples:
 *   "/" -> { language: 'en', page: 'home' }
 *   "/en/" -> { language: 'en', page: 'home' }
 *   "/da/" -> { language: 'da', page: 'home' }
 *   "/da/projekter" -> { language: 'da', page: 'projects' }
 *   "/en/resume/autorola-software-development" -> { language: 'en', page: 'resume', subPath: 'autorola-software-development' }
 *   "/projects" -> { language: 'en', page: 'projects' } (legacy support)
 */
export function parsePath(pathname: string): { language: Language; page: Page; subPath?: string } {
  // Normalize pathname
  const normalized = pathname.replace(/^\/|\/$/g, '') || '';

  // Check for language prefix (e.g., /en/, /da/)
  const parts = normalized.split('/');

  // Check if first part is a language code
  if (parts[0] === 'en' || parts[0] === 'da') {
    const language = parts[0] as Language;
    const slug = parts[1] || '';
    const subPath = parts.slice(2).join('/') || undefined;
    const page = SLUG_TO_PAGE[language][slug] || 'notfound';
    return { language, page, subPath };
  }

  // No language prefix - treat as English (legacy support)
  // Check English slugs
  const englishPage = SLUG_TO_PAGE['en'][normalized];
  if (englishPage) {
    return { language: 'en', page: englishPage };
  }

  // Unknown path
  return { language: DEFAULT_LANGUAGE, page: 'notfound' };
}

/**
 * Build a localized URL path for a given language and page
 * Examples:
 *   ('en', 'home') -> '/'
 *   ('da', 'home') -> '/da/'
 *   ('en', 'projects') -> '/en/projects'
 *   ('da', 'projects') -> '/da/projekter'
 *   ('en', 'resume', 'autorola-software-development') -> '/en/resume/autorola-software-development'
 */
export function buildPath(language: Language, page: Page, subPath?: string): string {
  const slug = PAGE_SLUGS[language][page];

  if (language === 'en' && page === 'home') {
    return '/';
  }

  if (page === 'home') {
    return `/${language}/`;
  }

  if (subPath) {
    return `/${language}/${slug}/${subPath}`;
  }

  return `/${language}/${slug}`;
}

/**
 * Get alternate language URLs for hreflang tags
 * Returns URLs for both language versions of a page
 */
export function getAlternateUrls(page: Page): Record<Language, string> {
  const urls: Record<Language, string> = {} as Record<Language, string>;

  for (const lang of SUPPORTED_LANGUAGES) {
    const path = buildPath(lang, page);
    urls[lang] = `https://www.juul.xyz${path}`;
  }

  return urls;
}

/**
 * Check if a URL has a legacy language query parameter
 */
export function hasLegacyLangParam(search: string): { hasParam: boolean; lang: Language | null } {
  const params = new URLSearchParams(search);
  const lang = params.get('lang');
  if (lang === 'en' || lang === 'da') {
    return { hasParam: true, lang };
  }
  return { hasParam: false, lang: null };
}
