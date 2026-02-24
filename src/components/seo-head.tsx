import { useEffect } from 'preact/hooks';
import { useLanguage } from '../context/language-context';
import { type Page, type Language, buildPath } from '../lib/i18n-routing';

type SeoHeadProps = {
  page: Page;
};

const SITE_URL = 'https://juul.xyz';

const jsonLdData: Record<string, Record<Language, object[]>> = {
  home: {
    en: [
      {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'Martin Christiansen',
        jobTitle: 'Software Developer',
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'DK',
        },
        url: SITE_URL,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Martin Christiansen',
        url: SITE_URL,
        author: {
          '@type': 'Person',
          name: 'Martin Christiansen',
        },
      },
    ],
    da: [
      {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'Martin Christiansen',
        jobTitle: 'Softwareudvikler',
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'DK',
        },
        url: SITE_URL,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Martin Christiansen',
        url: SITE_URL,
        author: {
          '@type': 'Person',
          name: 'Martin Christiansen',
        },
      },
    ],
  },
  projects: {
    en: [
      {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Projects',
        description: 'Software projects by Martin Christiansen',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            item: {
              '@type': 'SoftwareApplication',
              name: 'Project',
              author: {
                '@type': 'Person',
                name: 'Martin Christiansen',
              },
            },
          },
        ],
      },
    ],
    da: [
      {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Projekter',
        description: 'Softwareprojekter af Martin Christiansen',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            item: {
              '@type': 'SoftwareApplication',
              name: 'Projekt',
              author: {
                '@type': 'Person',
                name: 'Martin Christiansen',
              },
            },
          },
        ],
      },
    ],
  },
  resume: {
    en: [
      {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'Martin Christiansen',
        jobTitle: 'Software Developer',
        url: SITE_URL,
        workExperience: [
          {
            '@type': 'OrganizationRole',
            roleName: 'Software Developer',
            startDate: '2020',
            worksFor: {
              '@type': 'Organization',
              name: 'Company',
            },
          },
        ],
      },
    ],
    da: [
      {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'Martin Christiansen',
        jobTitle: 'Softwareudvikler',
        url: SITE_URL,
        workExperience: [
          {
            '@type': 'OrganizationRole',
            roleName: 'Softwareudvikler',
            startDate: '2020',
            worksFor: {
              '@type': 'Organization',
              name: 'Company',
            },
          },
        ],
      },
    ],
  },
  contact: {
    en: [
      {
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        name: 'Contact Martin Christiansen',
        description: 'Get in touch with Martin Christiansen',
        mainEntity: {
          '@type': 'ContactPoint',
          contactType: 'personal',
          availableLanguage: ['English', 'Danish'],
        },
      },
    ],
    da: [
      {
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        name: 'Kontakt Martin Christiansen',
        description: 'Kontakt Martin Christiansen',
        mainEntity: {
          '@type': 'ContactPoint',
          contactType: 'personal',
          availableLanguage: ['English', 'Danish'],
        },
      },
    ],
  },
};

const pageMeta: Record<string, Record<Language, { title: string; description: string }>> = {
  home: {
    en: {
      title: 'Martin Christiansen - Software Developer',
      description: 'Personal portfolio of Martin Christiansen - Software Developer based in Denmark',
    },
    da: {
      title: 'Martin Christiansen - Softwareudvikler',
      description: 'Personlig portefølje af Martin Christiansen - Softwareudvikler i Danmark',
    },
  },
  projects: {
    en: {
      title: 'Projects - Martin Christiansen',
      description: 'Explore my software projects and work',
    },
    da: {
      title: 'Projekter - Martin Christiansen',
      description: 'Udforsk mine softwareprojekter og arbejde',
    },
  },
  resume: {
    en: {
      title: 'Resume - Martin Christiansen',
      description: 'Professional resume and work experience',
    },
    da: {
      title: 'CV - Martin Christiansen',
      description: 'Professionelt CV og arbejdserfaring',
    },
  },
  contact: {
    en: {
      title: 'Contact - Martin Christiansen',
      description: 'Get in touch with Martin Christiansen',
    },
    da: {
      title: 'Kontakt - Martin Christiansen',
      description: 'Kontakt Martin Christiansen',
    },
  },
  music: {
    en: {
      title: 'Music - Martin Christiansen',
      description: 'Listen to my music collection',
    },
    da: {
      title: 'Musik - Martin Christiansen',
      description: 'Lyt til min musiksamling',
    },
  },
  notfound: {
    en: {
      title: 'Page Not Found - Martin Christiansen',
      description: 'The page you are looking for does not exist',
    },
    da: {
      title: 'Siden blev ikke fundet - Martin Christiansen',
      description: 'Siden du leder efter findes ikke',
    },
  },
};

const localeMap: Record<Language, string> = {
  en: 'en_US',
  da: 'da_DK',
};

export function SeoHead({ page }: SeoHeadProps) {
  const { language } = useLanguage();
  const pageMetaForLang = pageMeta[page] || pageMeta.home;
  const meta = pageMetaForLang[language] || pageMetaForLang.en;

  // Build URLs for current page
  const currentPath = buildPath(language, page);
  const currentUrl = `${SITE_URL}${currentPath}`;

  // Build alternate language URLs
  const alternateUrls: Record<Language, string> = {
    en: `${SITE_URL}${buildPath('en', page)}`,
    da: `${SITE_URL}${buildPath('da', page)}`,
  };

  useEffect(() => {
    document.title = meta.title;

    const updateMeta = (name: string, content: string) => {
      let element = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        element.name = name;
        document.head.appendChild(element);
      }
      element.content = content;
    };

    updateMeta('description', meta.description);

    // Update Open Graph tags
    const updateOg = (property: string, content: string) => {
      let element = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('property', property);
        document.head.appendChild(element);
      }
      element.content = content;
    };

    updateOg('og:title', meta.title);
    updateOg('og:description', meta.description);
    updateOg('og:type', 'website');
    updateOg('og:url', currentUrl);
    updateOg('og:locale', localeMap[language]);

    // Add alternate locale
    updateOg('og:locale:alternate', localeMap[language === 'en' ? 'da' : 'en']);

    // Update or create canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = currentUrl;

    // Update or create hreflang links
    const existingHreflang = document.querySelectorAll('link[rel="alternate"][hreflang]');
    existingHreflang.forEach(link => link.remove());

    for (const [lang, url] of Object.entries(alternateUrls)) {
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = lang;
      link.href = url;
      document.head.appendChild(link);
    }

    // Add x-default hreflang (pointing to English)
    const xDefaultLink = document.createElement('link');
    xDefaultLink.rel = 'alternate';
    xDefaultLink.hreflang = 'x-default';
    xDefaultLink.href = alternateUrls.en;
    document.head.appendChild(xDefaultLink);

  }, [meta, page, language, currentUrl, alternateUrls]);

  // Inject JSON-LD structured data
  useEffect(() => {
    // Remove existing JSON-LD scripts
    const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
    existingScripts.forEach((script) => script.remove());

    // Add new JSON-LD scripts for the current page and language
    const schemas = jsonLdData[page]?.[language] || jsonLdData[page]?.en;
    if (schemas) {
      schemas.forEach((schema) => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(schema);
        document.head.appendChild(script);
      });
    }
  }, [page, language]);

  return null;
}
