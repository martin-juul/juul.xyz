import { createContext, ComponentChildren } from 'preact';
import { useContext, useState, useCallback, useEffect } from 'preact/hooks';
import {
  parsePath,
  buildPath,
  hasLegacyLangParam,
  getAlternateUrls,
  type Page,
  type Language,
} from '../lib/i18n-routing';
import { commonTranslations } from '../features/common';
import { homeTranslations } from '../features/home';
import { projectsTranslations, projectsData } from '../features/projects';
import { resumeTranslations, resumeData, resumeDataDa } from '../features/resume';
import { contactTranslations } from '../features/contact';
import { browserTranslations } from '../features/browser';

type Translations = {
  brand: string;
  start: string;
  nav: {
    home: string;
    projects: string;
    resume: string;
    contact: string;
    music: string;
    browser: string;
    taskmanager: string;
    minesweeper: string;
    freecell: string;
  };
  home: {
    title: string;
    subtitle: string;
    byline: string;
    who: string;
    content: string;
    portrait: string;
    viewProjects: string;
    viewResume: string;
  };
  projects: {
    title: string;
    subtitle: string;
    items: typeof projectsData;
  };
  resume: {
    title: string;
    current: string;
    previous: string;
    items: typeof resumeData;
  };
  contact: {
    title: string;
    getInTouch: string;
    name: string;
    email: string;
    message: string;
    send: string;
    error: string;
    unableToSend: string;
    success: string;
  };
  browser: {
    title: string;
    welcome: string;
    youveGotMail: string;
    channels: string;
    myProjects: string;
    clickToVisit: string;
    loading: string;
    done: string;
    internetZone: string;
    home: string;
  };
  footer: {
    builtWith: string;
  };
  notFound: {
    title: string;
    windowTitle: string;
    message: string;
    hint: string;
  };
};

const translations: Record<Language, Translations> = {
  en: {
    ...commonTranslations.en,
    home: homeTranslations.en,
    projects: {
      ...projectsTranslations.en,
      items: projectsData,
    },
    resume: {
      ...resumeTranslations.en,
      items: resumeData,
    },
    contact: contactTranslations.en,
    browser: browserTranslations.en,
  },
  da: {
    ...commonTranslations.da,
    home: homeTranslations.da,
    projects: {
      ...projectsTranslations.da,
      items: projectsData,
    },
    resume: {
      ...resumeTranslations.da,
      items: resumeDataDa,
    },
    contact: contactTranslations.da,
    browser: browserTranslations.da,
  },
};

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  currentPage: Page;
  currentSubPath?: string;
  navigateTo: (page: Page, subPath?: string, replace?: boolean) => void;
  getAlternateUrls: (page: Page) => Record<Language, string>;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

function getDefaultLanguage(): Language {
  if (typeof window === 'undefined') return 'en';
  if (navigator.language === 'da') return 'da';
  return 'en';
}

export function LanguageProvider({ children }: { children: ComponentChildren }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window === 'undefined') return 'en';

    // Check for legacy ?lang= parameter first
    const { hasParam, lang: urlLang } = hasLegacyLangParam(window.location.search);
    if (hasParam && urlLang) return urlLang;

    // Check for language in path
    const { language: pathLang } = parsePath(window.location.pathname);
    if (pathLang !== 'en' || window.location.pathname.startsWith('/en')) {
      return pathLang;
    }

    // Check localStorage
    const saved = localStorage.getItem('language');
    if (saved && (saved === 'en' || saved === 'da')) return saved as Language;

    return getDefaultLanguage();
  });

  const [currentPage, setCurrentPage] = useState<Page>(() => {
    if (typeof window === 'undefined') return 'home';
    const { page } = parsePath(window.location.pathname);
    return page;
  });

  const [currentSubPath, setCurrentSubPath] = useState<string | undefined>(() => {
    if (typeof window === 'undefined') return undefined;
    const { subPath } = parsePath(window.location.pathname);
    return subPath;
  });

  // Handle legacy ?lang= redirects and path-based language detection
  useEffect(() => {
    const { hasParam, lang } = hasLegacyLangParam(window.location.search);

    if (hasParam && lang) {
      // Redirect from legacy ?lang= to path-based URL
      const { page, subPath } = parsePath(window.location.pathname);
      const newPath = buildPath(lang, page, subPath);
      const newUrl = newPath + window.location.hash;
      window.history.replaceState({}, '', newUrl);
      setCurrentPage(page);
      setCurrentSubPath(subPath);
      return;
    }

    // Set initial page from path
    const { page, subPath } = parsePath(window.location.pathname);
    setCurrentPage(page);
    setCurrentSubPath(subPath);

    // If on root path without language prefix, redirect to proper URL
    if (window.location.pathname === '/' && language !== 'en') {
      const newPath = buildPath(language, 'home');
      window.history.replaceState({}, '', newPath);
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);

    // Navigate to same page in new language, preserving subPath
    const newPath = buildPath(lang, currentPage, currentSubPath);
    window.history.pushState({}, '', newPath);
  }, [currentPage, currentSubPath]);

  const navigateTo = useCallback((page: Page, subPath?: string, replace: boolean = false) => {
    setCurrentPage(page);
    setCurrentSubPath(subPath);
    const newPath = buildPath(language, page, subPath);

    if (replace) {
      window.history.replaceState({}, '', newPath);
    } else {
      window.history.pushState({}, '', newPath);
    }
  }, [language]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const { language: pathLang, page, subPath } = parsePath(window.location.pathname);

      if (pathLang !== language) {
        setLanguageState(pathLang);
        localStorage.setItem('language', pathLang);
      }

      setCurrentPage(page);
      setCurrentSubPath(subPath);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [language]);

  // Update document lang attribute
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = translations[language] || translations.en;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, currentPage, currentSubPath, navigateTo, getAlternateUrls }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
