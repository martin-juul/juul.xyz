import { createContext, ComponentChildren } from 'preact';
import { useContext, useState, useCallback, useEffect } from 'preact/hooks';

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

type Translations = {
  brand: string;
  start: string;
  nav: {
    home: string;
    projects: string;
    resume: string;
    contact: string;
    music: string;
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
            'Working with React, React Native, Redux, Chakra UI, sip.js & TypeScript',
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
            'Write modern, maintainable and performant code for multiple clients',
            'Mentoring and code reviewer',
            'Architected automated solutions for AWS infrastructure using Terraform',
            'Operating Gitlab and Kimai for internal usage',
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
            'Developed web based dashboard for Windows AppLocker administration',
            'C# .NET/Entity Framework backend & Angular frontend',
            'Created AutoHotKey macros for scraping internal systems',
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
      error: 'Error',
      unableToSend: 'Could not send message due to an error',
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
            'Gennemgang af kode på tværs af afdelinger for højere standarder',
            'Indførte moderne paradigmer i organisationen',
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
            'Arbejdet med React, React Native, Redux, Chakra UI, sip.js & TypeScript',
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
            'Skrive moderne, vedligeholdelsesvenlig og performant kode',
            'Mentorering og kodevedligeholder',
            'Arkitekt og skrev automatiserede løsninger til AWS med Terraform',
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
            'Udvikling af webbaseret dashboard til Windows AppLocker',
            'C# .NET/Entity Framework backend og Angular frontend',
            'Oprettede AutoHotKey-makroer til at scrape interne systemer',
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
      error: 'Fejl',
      unableToSend: 'Kunne ikke sende beskeden på grund af en fejl',
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
  language: string;
  setLanguage: (lang: string) => void;
  t: Translations;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

function getLanguageFromURL(): string | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const lang = params.get('lang');
  if (lang === 'en' || lang === 'da') return lang;
  return null;
}

function getDefaultLanguage(): string {
  if (typeof window === 'undefined') return 'en';
  if (navigator.language === 'da') return 'da';
  return 'en';
}

export function LanguageProvider({ children }: { children: ComponentChildren }) {
  const [language, setLanguageState] = useState(() => {
    const urlLang = getLanguageFromURL();
    if (urlLang) return urlLang;

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('language');
      if (saved && (saved === 'en' || saved === 'da')) return saved;
    }

    return getDefaultLanguage();
  });

  const setLanguage = useCallback((lang: string) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);

    const url = new URL(window.location.href);
    url.searchParams.set('lang', lang);
    window.history.replaceState({}, '', url.toString());
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const urlLang = getLanguageFromURL();
      if (urlLang && urlLang !== language) {
        setLanguageState(urlLang);
        localStorage.setItem('language', urlLang);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [language]);

  useEffect(() => {
    const urlLang = getLanguageFromURL();
    if (!urlLang) {
      const url = new URL(window.location.href);
      url.searchParams.set('lang', language);
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = translations[language] || translations.en;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
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
