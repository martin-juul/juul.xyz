import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';

// Since we can't easily render Preact components in Node without a browser environment,
// we'll generate static HTML with all the SEO meta tags pre-injected.
// The actual content will hydrate client-side, but crawlers will see all the meta tags.

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST_DIR = join(__dirname, 'dist');

// Types
type Language = 'en' | 'da';
type Page = 'home' | 'projects' | 'resume' | 'contact' | 'music' | 'browser' | 'taskmanager' | 'minesweeper' | 'freecell' | 'spider' | 'solitaire' | 'sudoku' | 'gallery' | 'matador' | 'notfound';

const SITE_URL = 'https://www.juul.xyz';
const DEFAULT_OG_IMAGE = `${SITE_URL}/assets/avatar.png`;

// Page slugs
const PAGE_SLUGS: Record<Language, Record<Page, string>> = {
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
    notfound: 'not-found',
  },
};

const localeMap: Record<Language, string> = {
  en: 'en_US',
  da: 'da_DK',
};

// Page meta data
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
  spider: {
    en: {
      title: 'Spider Solitaire - Martin Christiansen',
      description: 'Classic Spider Solitaire card game',
    },
    da: {
      title: 'Edderkop Kabale - Martin Christiansen',
      description: 'Klassisk edderkop kabale-spil',
    },
  },
  solitaire: {
    en: {
      title: 'Solitaire - Martin Christiansen',
      description: 'Classic Klondike Solitaire card game',
    },
    da: {
      title: 'Kabale - Martin Christiansen',
      description: 'Klassisk Klondike kabale-spil',
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
  matador: {
    en: {
      title: 'Matador - Martin Christiansen',
      description: 'Classic Danish Monopoly board game',
    },
    da: {
      title: 'Matador - Martin Christiansen',
      description: 'Klassisk dansk Matador brætspil',
    },
  },
  sudoku: {
    en: {
      title: 'Sudoku - Martin Christiansen',
      description: 'Classic Sudoku puzzle game',
    },
    da: {
      title: 'Sudoku - Martin Christiansen',
      description: 'Klassisk Sudoku puslespil',
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
        address: { '@type': 'PostalAddress', addressCountry: 'DK' },
        url: SITE_URL,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Martin Christiansen',
        url: SITE_URL,
        author: { '@type': 'Person', name: 'Martin Christiansen' },
      },
    ],
    da: [
      {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'Martin Christiansen',
        jobTitle: 'Softwareudvikler',
        image: DEFAULT_OG_IMAGE,
        address: { '@type': 'PostalAddress', addressCountry: 'DK' },
        url: SITE_URL,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Martin Christiansen',
        url: SITE_URL,
        author: { '@type': 'Person', name: 'Martin Christiansen' },
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
        image: DEFAULT_OG_IMAGE,
        url: SITE_URL,
      },
    ],
    da: [
      {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'Martin Christiansen',
        jobTitle: 'Softwareudvikler',
        image: DEFAULT_OG_IMAGE,
        url: SITE_URL,
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
  projects: {
    en: [
      {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Projects',
        description: 'Software projects by Martin Christiansen',
      },
    ],
    da: [
      {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Projekter',
        description: 'Softwareprojekter af Martin Christiansen',
      },
    ],
  },
};

// Resume and project data
const resumeSlugs = [
  'autorola-software-development',
  'evercall',
  'sitetech',
  'odense-municipality',
];

const projectSlugs = [
  'is-it-dns',
  'baander',
  'nytarstale',
  'luft',
  'electron-angle-patcher',
];

interface Route {
  path: string;
  page: Page;
  language: Language;
}

function buildPath(language: Language, page: Page, subPath?: string): string {
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

function generateStaticRoutes(): Route[] {
  const routes: Route[] = [];
  const staticPages: Page[] = [
    'home', 'projects', 'resume', 'contact', 'music',
    'browser', 'taskmanager', 'minesweeper', 'freecell', 'spider', 'solitaire', 'sudoku', 'gallery', 'matador', 'notfound',
  ];
  const languages: Language[] = ['en', 'da'];

  for (const language of languages) {
    for (const page of staticPages) {
      const path = buildPath(language, page);
      routes.push({ path, page, language });
    }
  }

  return routes;
}

function generateDynamicRoutes(): Route[] {
  const routes: Route[] = [];

  // Resume sub-pages
  for (const slug of resumeSlugs) {
    routes.push({ path: buildPath('en', 'resume', slug), page: 'resume', language: 'en' });
    routes.push({ path: buildPath('da', 'resume', slug), page: 'resume', language: 'da' });
  }

  // Projects sub-pages
  for (const slug of projectSlugs) {
    routes.push({ path: buildPath('en', 'projects', slug), page: 'projects', language: 'en' });
    routes.push({ path: buildPath('da', 'projects', slug), page: 'projects', language: 'da' });
  }

  return routes;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getSeoData(page: Page, language: Language) {
  const meta = pageMeta[page]?.[language] || pageMeta.home[language];
  const currentPath = buildPath(language, page);
  const canonicalUrl = `${SITE_URL}${currentPath}`;

  const alternateUrls = {
    en: `${SITE_URL}${buildPath('en', page)}`,
    da: `${SITE_URL}${buildPath('da', page)}`,
  };

  const jsonLd = jsonLdData[page]?.[language] || [];

  return { meta, canonicalUrl, alternateUrls, jsonLd, locale: localeMap[language], localeAlt: localeMap[language === 'en' ? 'da' : 'en'] };
}

function buildHtml($: cheerio.CheerioAPI, route: Route): string {
  const { meta, canonicalUrl, alternateUrls, jsonLd, locale, localeAlt } = getSeoData(route.page, route.language);

  // Update title
  $('title').text(meta.title);

  // Update html lang
  $('html').attr('lang', route.language);

  // Update or add meta description
  let descMeta = $('meta[name="description"]');
  if (descMeta.length === 0) {
    $('head').append(`<meta name="description" content="${escapeHtml(meta.description)}" />`);
  } else {
    descMeta.attr('content', meta.description);
  }

  // Update Open Graph tags
  const ogTags = {
    'og:title': meta.title,
    'og:description': meta.description,
    'og:url': canonicalUrl,
    'og:locale': locale,
    'og:locale:alternate': localeAlt,
  };

  for (const [property, content] of Object.entries(ogTags)) {
    let tag = $(`meta[property="${property}"]`);
    if (tag.length === 0) {
      $('head').append(`<meta property="${property}" content="${escapeHtml(content)}" />`);
    } else {
      tag.attr('content', content);
    }
  }

  // Update Twitter Card tags
  const twitterTags = {
    'twitter:title': meta.title,
    'twitter:description': meta.description,
  };

  for (const [name, content] of Object.entries(twitterTags)) {
    let tag = $(`meta[name="${name}"]`);
    if (tag.length === 0) {
      $('head').append(`<meta name="${name}" content="${escapeHtml(content)}" />`);
    } else {
      tag.attr('content', content);
    }
  }

  // Update canonical URL
  let canonical = $('link[rel="canonical"]');
  if (canonical.length === 0) {
    $('head').append(`<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`);
  } else {
    canonical.attr('href', canonicalUrl);
  }

  // Remove existing hreflang and JSON-LD
  $('link[rel="alternate"][hreflang]').remove();
  $('script[type="application/ld+json"]').remove();

  // Add hreflang links
  for (const [lang, url] of Object.entries(alternateUrls)) {
    $('head').append(`<link rel="alternate" hreflang="${lang}" href="${escapeHtml(url)}" />`);
  }
  $('head').append(`<link rel="alternate" hreflang="x-default" href="${escapeHtml(alternateUrls.en)}" />`);

  // Add JSON-LD
  for (const schema of jsonLd) {
    $('head').append(`<script type="application/ld+json">${JSON.stringify(schema)}</script>`);
  }

  return $.html();
}

async function ensureDirectory(filePath: string): Promise<void> {
  const dir = dirname(filePath);
  await mkdir(dir, { recursive: true });
}

async function prerender(): Promise<void> {
  console.log('Starting prerender...');

  // Read the base template
  const templatePath = join(DIST_DIR, 'index.html');
  const template = await readFile(templatePath, 'utf-8');
  console.log('Read template');

  // Generate all routes
  const staticRoutes = generateStaticRoutes();
  const dynamicRoutes = generateDynamicRoutes();
  const allRoutes = [...staticRoutes, ...dynamicRoutes];

  console.log(`Generated ${allRoutes.length} routes to prerender`);

  // Process each route
  for (const route of allRoutes) {
    const $ = cheerio.load(template);
    const finalHtml = buildHtml($, route);

    // Determine output path
    let outputPath: string;
    if (route.path === '/') {
      outputPath = join(DIST_DIR, 'index.html');
    } else {
      const cleanPath = route.path.replace(/^\//, '').replace(/\/$/, '');
      outputPath = join(DIST_DIR, cleanPath, 'index.html');
    }

    await ensureDirectory(outputPath);
    await writeFile(outputPath, finalHtml);
    console.log(`Prerendered: ${route.path}`);
  }

  console.log(`\nPrerender complete! Generated ${allRoutes.length} HTML files.`);
}

// Run prerender
prerender().catch((error) => {
  console.error('Prerender failed:', error);
  process.exit(1);
});
