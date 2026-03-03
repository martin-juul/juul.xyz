import { useEffect } from 'preact/hooks';
import { useLanguage } from '../context/language-context';
import { type Page, type Language, buildPath } from '../lib/i18n-routing';

type SeoHeadProps = {
  page: Page;
};

export const SITE_URL = 'https://www.juul.xyz';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/assets/avatar.png`;

export type SeoData = {
  title: string;
  description: string;
  canonicalUrl: string;
  alternateUrls: Record<Language, string>;
  ogLocale: string;
  ogLocaleAlternate: string;
  ogImage?: string;
  jsonLd: object[];
};

const localeMap: Record<Language, string> = {
  en: 'en_US',
  da: 'da_DK',
};

// Page meta data for SEO
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
  browser: {
    en: {
      title: 'Browser - Martin Christiansen',
      description: 'A simple web browser simulation',
    },
    da: {
      title: 'Internet - Martin Christiansen',
      description: 'En simpel webbrowser-simulering',
    },
  },
  taskmanager: {
    en: {
      title: 'Task Manager - Martin Christiansen',
      description: 'System task manager simulation',
    },
    da: {
      title: 'Opgavestyring - Martin Christiansen',
      description: 'System opgavestyring-simulering',
    },
  },
  minesweeper: {
    en: {
      title: 'Minesweeper - Martin Christiansen',
      description: 'Classic Minesweeper game',
    },
    da: {
      title: 'Minestryger - Martin Christiansen',
      description: 'Klassisk minestryger-spil',
    },
  },
  freecell: {
    en: {
      title: 'FreeCell - Martin Christiansen',
      description: 'Classic FreeCell solitaire game',
    },
    da: {
      title: 'FreeCell - Martin Christiansen',
      description: 'Klassisk FreeCell kabale-spil',
    },
  },
  gallery: {
    en: {
      title: 'Gallery - Martin Christiansen',
      description: 'Photo gallery collection',
    },
    da: {
      title: 'Billedgalleri - Martin Christiansen',
      description: 'Fotogalleri samling',
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

// JSON-LD structured data
const jsonLdData: Record<string, Record<Language, object[]>> = {
  home: {
    en: [
      {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'Martin Christiansen',
        jobTitle: 'Software Developer',
        image: DEFAULT_OG_IMAGE,
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
        image: DEFAULT_OG_IMAGE,
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

/**
 * Pure function to get SEO data for a given page and language.
 * This can be used both at build time (prerendering) and runtime.
 */
export function getSeoData(page: Page, language: Language): SeoData {
  const pageMetaForLang = pageMeta[page] || pageMeta.home;
  const meta = pageMetaForLang[language] || pageMetaForLang.en;

  const currentPath = buildPath(language, page);
  const canonicalUrl = `${SITE_URL}${currentPath}`;

  const alternateUrls: Record<Language, string> = {
    en: `${SITE_URL}${buildPath('en', page)}`,
    da: `${SITE_URL}${buildPath('da', page)}`,
  };

  const jsonLd = jsonLdData[page]?.[language] || jsonLdData[page]?.en || [];

  return {
    title: meta.title,
    description: meta.description,
    canonicalUrl,
    alternateUrls,
    ogLocale: localeMap[language],
    ogLocaleAlternate: localeMap[language === 'en' ? 'da' : 'en'],
    ogImage: DEFAULT_OG_IMAGE,
    jsonLd,
  };
}

/**
 * Generate meta tags HTML string for prerendering.
 */
export function generateMetaTags(seoData: SeoData): string {
  const tags: string[] = [];

  // Basic meta tags
  tags.push(`<title>${escapeHtml(seoData.title)}</title>`);
  tags.push(`<meta name="description" content="${escapeHtml(seoData.description)}" />`);

  // Open Graph tags
  tags.push(`<meta property="og:title" content="${escapeHtml(seoData.title)}" />`);
  tags.push(`<meta property="og:description" content="${escapeHtml(seoData.description)}" />`);
  tags.push(`<meta property="og:type" content="website" />`);
  tags.push(`<meta property="og:url" content="${escapeHtml(seoData.canonicalUrl)}" />`);
  tags.push(`<meta property="og:locale" content="${seoData.ogLocale}" />`);
  tags.push(`<meta property="og:locale:alternate" content="${seoData.ogLocaleAlternate}" />`);
  tags.push(`<meta property="og:site_name" content="Martin Christiansen" />`);
  if (seoData.ogImage) {
    tags.push(`<meta property="og:image" content="${escapeHtml(seoData.ogImage)}" />`);
  }

  // Twitter Card tags
  tags.push(`<meta name="twitter:card" content="summary_large_image" />`);
  tags.push(`<meta name="twitter:title" content="${escapeHtml(seoData.title)}" />`);
  tags.push(`<meta name="twitter:description" content="${escapeHtml(seoData.description)}" />`);
  if (seoData.ogImage) {
    tags.push(`<meta name="twitter:image" content="${escapeHtml(seoData.ogImage)}" />`);
  }

  // Canonical URL
  tags.push(`<link rel="canonical" href="${escapeHtml(seoData.canonicalUrl)}" />`);

  // Hreflang links
  for (const [lang, url] of Object.entries(seoData.alternateUrls)) {
    tags.push(`<link rel="alternate" hreflang="${lang}" href="${escapeHtml(url)}" />`);
  }
  tags.push(`<link rel="alternate" hreflang="x-default" href="${escapeHtml(seoData.alternateUrls.en)}" />`);

  // JSON-LD structured data
  for (const schema of seoData.jsonLd) {
    tags.push(`<script type="application/ld+json">${JSON.stringify(schema)}</script>`);
  }

  return tags.join('\n    ');
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * SEO Head component for client-side navigation.
 * Updates document head dynamically when page or language changes.
 */
export function SeoHead({ page }: SeoHeadProps) {
  const { language } = useLanguage();
  const seoData = getSeoData(page, language);

  useEffect(() => {
    document.title = seoData.title;

    const updateMeta = (name: string, content: string) => {
      let element = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        element.name = name;
        document.head.appendChild(element);
      }
      element.content = content;
    };

    updateMeta('description', seoData.description);

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

    updateOg('og:title', seoData.title);
    updateOg('og:description', seoData.description);
    updateOg('og:type', 'website');
    updateOg('og:url', seoData.canonicalUrl);
    updateOg('og:locale', seoData.ogLocale);
    updateOg('og:locale:alternate', seoData.ogLocaleAlternate);
    if (seoData.ogImage) {
      updateOg('og:image', seoData.ogImage);
    }

    // Update Twitter Card tags
    const updateTwitter = (name: string, content: string) => {
      let element = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        element.name = name;
        document.head.appendChild(element);
      }
      element.content = content;
    };

    if (seoData.ogImage) {
      updateTwitter('twitter:image', seoData.ogImage);
    }

    // Update or create canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = seoData.canonicalUrl;

    // Update or create hreflang links
    const existingHreflang = document.querySelectorAll('link[rel="alternate"][hreflang]');
    existingHreflang.forEach(link => link.remove());

    for (const [lang, url] of Object.entries(seoData.alternateUrls)) {
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
    xDefaultLink.href = seoData.alternateUrls.en;
    document.head.appendChild(xDefaultLink);

  }, [seoData]);

  // Inject JSON-LD structured data
  useEffect(() => {
    // Remove existing JSON-LD scripts
    const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
    existingScripts.forEach((script) => script.remove());

    // Add new JSON-LD scripts for the current page and language
    if (seoData.jsonLd) {
      seoData.jsonLd.forEach((schema) => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(schema);
        document.head.appendChild(script);
      });
    }
  }, [seoData.jsonLd]);

  return null;
}
