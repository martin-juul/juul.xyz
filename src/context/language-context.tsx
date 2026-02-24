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

type ResumeItem = {
  id: number;
  title: string;
  company: string;
  logo: string;
  duration: {
    start: string;
    end: string;
  };
  highlights: string[];
};

type ProjectItem = {
  id: number;
  name: string;
  url: string;
  description: string;
};

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
    items: ProjectItem[];
  };
  resume: {
    title: string;
    current: string;
    previous: string;
    items: ResumeItem[];
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

const translations: Record<string, Translations> = {
  en: {
    brand: 'Martin Christiansen',
    start: 'Start',
    nav: {
      home: 'Home',
      projects: 'Projects',
      resume: 'Resume',
      contact: 'Contact',
      music: 'Music',
      browser: 'Internet Explorer',
    },
    home: {
      title: "Hi I'm Martin",
      subtitle: 'I create and destroy software for a living',
      byline: 'My speciality is building great software that looks good inside-out.',
      who: 'Who',
      content: `Hi there! I'm Martin, a software developer based in Denmark.

I am a very curious about new technologies and enjoy trying out new flavors of development in my spare time.

Holding myself to the highest standard, i take pride in delivering quality on time. As a self-starter, and not being afraid of taking ownership. I am rarely bored.

Whether it is backend or frontend. I find both to be equally interesting. Presenting different challenges both cover many of the same paradigms. Implementation details aside.`,
      portrait: 'Portrait of Martin',
      viewProjects: 'View My Projects',
      viewResume: 'View My Resume',
    },
    projects: {
      title: 'Projects',
      subtitle: 'A selection of things I have built',
      items: [
        {
          id: 1,
          name: 'Is it dns?',
          url: 'https://erdetdns.dk',
          description: 'A website that says it\'s always a DNS issue',
        },
        {
          id: 2,
          name: 'Bånder',
          url: 'https://github.com/baander-app',
          description: 'Music server with cover view, song list and synchronized lyric viewer.',
        },
      ],
    },
    resume: {
      title: 'Resume',
      current: 'Current',
      previous: 'Previous',
      items: [
        {
          id: 4,
          title: 'Frontend Developer',
          company: 'Autorola Software Development',
          logo: 'assets/resume/autorola-software-development.jpeg',
          duration: { start: 'March 2022', end: 'Current' },
          highlights: [
            'Developing the new autorola marketplace with Angular',
            'Reviewing code across departments, ensuring higher standards',
            'Introduced modern paradigms into the architecture',
          ],
        },
        {
          id: 3,
          title: 'Application Developer',
          company: 'evercall',
          logo: 'assets/resume/evercall.png',
          duration: { start: 'June 2020', end: 'February 2022' },
          highlights: [
            'Maintainer of Softphone app on Desktop & Mobile',
            'Working with interesting technologies including React, React Native, Redux, Chakra UI, sip.js & TypeScript',
            'Extensive research of the SIP protocol and VoIP routing',
            'L3 Technical Support',
          ],
        },
        {
          id: 2,
          title: 'Software Developer',
          company: 'SiteTech',
          logo: 'assets/resume/sitetech.jpeg',
          duration: { start: 'July 2018', end: 'March 2020' },
          highlights: [
            'Write modern, maintainable and performant code for multiple clients and internal use',
            'Mentoring and code reviewer',
            'Architected and wrote automated solutions for infra on AWS and operations. Using tools such as Terraform',
            'Operating and extending Gitlab and Kimai for internal usage',
            'Laravel expert and team lead on backend',
          ],
        },
        {
          id: 1,
          title: 'Software Developer',
          company: 'Odense Municipality',
          logo: 'assets/resume/odense-municipalty.png',
          duration: { start: 'October 2017', end: 'February 2018' },
          highlights: [
            'Developed web based dashboard for internal administration of Windows AppLocker',
            'C# .NET/Entity Framework backend & Angular frontend',
            'Created AutoHotKey macros for scraping internal systems, increasing case worker performance.',
            'Knowledge of internal test procedures. Inclusive Jobnet.',
          ],
        },
      ],
    },
    contact: {
      title: 'Contact',
      getInTouch: 'Want to get in touch? Drop me a message below.',
      name: 'Name',
      email: 'E-Mail',
      message: 'Message',
      send: 'Send',
      error: 'Please fill in all fields',
      unableToSend: 'Could not send message due to an error',
      success: 'Message sent successfully!',
    },
    browser: {
      title: 'Internet Explorer',
      welcome: 'Welcome!',
      youveGotMail: 'You\'ve Got Projects!',
      channels: 'Channels',
      myProjects: 'My Projects',
      clickToVisit: 'Click to visit',
      loading: 'Loading...',
      done: 'Done',
      internetZone: 'Internet',
      home: 'Home',
    },
    footer: {
      builtWith: 'Built with Preact & 98.css',
    },
    notFound: {
      title: '404',
      windowTitle: 'Not Found',
      message: 'The page you are looking for could not be found.',
      hint: 'Check the address and try again.',
    },
  },
  da: {
    brand: 'Martin Christiansen',
    start: 'Start',
    nav: {
      home: 'Hjem',
      projects: 'Projekter',
      resume: 'CV',
      contact: 'Kontakt',
      music: 'Musik',
      browser: 'Internet Explorer',
    },
    home: {
      title: 'Hej, Mit navn er Martin.',
      subtitle: 'Jeg lever af at skabe og ødelægge software',
      byline: 'Mit speciale er at bygge god software, der ser godt ud indefra og ud.',
      who: 'Hvem',
      content: `Hejsa! Jeg hedder Martin og er softwareudvikler.

Jeg er meget nysgerrig på nye teknologier og nyder at afprøve nye metodikker i min fritid.

Jeg holder mig selv til den højeste standard og sætter en ære i at levere kvalitet til tiden. Selvstarter, og ikke bange for at tage ejerskab betyder at jeg sjældent keder mig.

Uanset om det er backend eller frontend, så er begge dele lige spændene og udfordrende.`,
      portrait: 'Portræt af Martin',
      viewProjects: 'Se Mine Projekter',
      viewResume: 'Se Mit CV',
    },
    projects: {
      title: 'Projekter',
      subtitle: 'Et udvalg af ting jeg har bygget',
      items: [
        {
          id: 1,
          name: 'Er det dns?',
          url: 'https://erdetdns.dk',
          description: 'En side der fortæller at det altid er DNS der er problemet',
        },
        {
          id: 2,
          name: 'Bånder',
          url: 'https://github.com/baander-app',
          description: 'Musikafspiller med covervisning, sangliste og lyrikviser.',
        },
      ],
    },
    resume: {
      title: 'CV',
      current: 'Nuværende',
      previous: 'Tidligere',
      items: [
        {
          id: 4,
          title: 'Frontend Udvikler',
          company: 'Autorola Software Development',
          logo: 'assets/resume/autorola-software-development.jpeg',
          duration: { start: 'March 2022', end: 'Nuværende' },
          highlights: [
            'Udvikle den nye version af autorola marketplace med Angular',
            'Gennemgang af kode på tværs af afdelinger for at sikre, at standarderne opfylder højere mål',
            'Indførte moderne paradigmer i organisationen, hvilket bidrog til produktiviteten på tværs af afdelinger',
          ],
        },
        {
          id: 3,
          title: 'Applikations Udvikler',
          company: 'evercall',
          logo: 'assets/resume/evercall.png',
          duration: { start: 'June 2020', end: 'February 2022' },
          highlights: [
            'Vedligeholder af softphone-app på desktop og mobil',
            'Arbejdet med interessante teknologier, herunder React, React Native, Redux, Chakra UI, sip.js, TypeScript og Asterisk PBX',
            'Stort kendskab til SIP-protokollen og VoIP-routing',
            'L3 Teknisk Support',
          ],
        },
        {
          id: 2,
          title: 'Software Udvikler',
          company: 'SiteTech',
          logo: 'assets/resume/sitetech.jpeg',
          duration: { start: 'July 2018', end: 'March 2020' },
          highlights: [
            'Skrive moderne, vedligeholdelsesvenlig og performant kode til flere klienter og intern brug',
            'Mentorering og kodevedligeholder',
            'Arkitekt og skrev automatiserede løsninger til infrastruktur på AWS og drift. Brug af værktøjer som Terraform',
            'Drift og udvidelse af Gitlab og Kimai til intern brug',
            'Laravel-ekspert og team lead på backend',
          ],
        },
        {
          id: 1,
          title: 'Software Udvikler',
          company: 'Odense Kommune',
          logo: 'assets/resume/odense-municipalty.png',
          duration: { start: 'October 2017', end: 'February 2018' },
          highlights: [
            'Udvikling af et webbaseret dashboard til intern administration af Windows AppLocker',
            'C# .NET/Entity Framework backend og Angular frontend',
            'Oprettede AutoHotKey-makroer til at scrape interne systemer, hvilket øgede sagsbehandlerens ydeevne.',
            'Kendskab til interne testprocedurer inklusiv Jobnet.',
          ],
        },
      ],
    },
    contact: {
      title: 'Kontakt',
      getInTouch: 'Vil du kontakte mig? Send en besked nedenfor.',
      name: 'Navn',
      email: 'E-Mail',
      message: 'Besked',
      send: 'Send',
      error: 'Udfyld venligst alle felter',
      unableToSend: 'Kunne ikke sende beskeden på grund af en fejl',
      success: 'Besked sendt!',
    },
    browser: {
      title: 'Internet Explorer',
      welcome: 'Velkommen!',
      youveGotMail: 'Du Har Projekter!',
      channels: 'Kanaler',
      myProjects: 'Mine Projekter',
      clickToVisit: 'Klik for at besøge',
      loading: 'Indlæser...',
      done: 'Færdig',
      internetZone: 'Internet',
      home: 'Hjem',
    },
    footer: {
      builtWith: 'Bygget med Preact & 98.css',
    },
    notFound: {
      title: '404',
      windowTitle: 'Ikke Fundet',
      message: 'Siden du leder efter blev ikke fundet.',
      hint: 'Tjek adressen og prøv igen.',
    },
  },
};

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  currentPage: Page;
  navigateTo: (page: Page, replace?: boolean) => void;
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

  // Handle legacy ?lang= redirects and path-based language detection
  useEffect(() => {
    const { hasParam, lang } = hasLegacyLangParam(window.location.search);

    if (hasParam && lang) {
      // Redirect from legacy ?lang= to path-based URL
      const { page } = parsePath(window.location.pathname);
      const newPath = buildPath(lang, page);
      const newUrl = newPath + window.location.hash;
      window.history.replaceState({}, '', newUrl);
      setCurrentPage(page);
      return;
    }

    // Set initial page from path
    const { page } = parsePath(window.location.pathname);
    setCurrentPage(page);

    // If on root path without language prefix, redirect to proper URL
    if (window.location.pathname === '/' && language !== 'en') {
      const newPath = buildPath(language, 'home');
      window.history.replaceState({}, '', newPath);
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);

    // Navigate to same page in new language
    const newPath = buildPath(lang, currentPage);
    window.history.pushState({}, '', newPath);
  }, [currentPage]);

  const navigateTo = useCallback((page: Page, replace: boolean = false) => {
    setCurrentPage(page);
    const newPath = buildPath(language, page);

    if (replace) {
      window.history.replaceState({}, '', newPath);
    } else {
      window.history.pushState({}, '', newPath);
    }
  }, [language]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const { language: pathLang, page } = parsePath(window.location.pathname);

      if (pathLang !== language) {
        setLanguageState(pathLang);
        localStorage.setItem('language', pathLang);
      }

      setCurrentPage(page);
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
    <LanguageContext.Provider value={{ language, setLanguage, t, currentPage, navigateTo, getAlternateUrls }}>
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
