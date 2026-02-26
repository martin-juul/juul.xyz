import { type ProjectItem } from './types';

export const projectsData: ProjectItem[] = [
  {
    id: 1,
    slug: 'is-it-dns',
    name: 'Is it dns?',
    url: 'https://erdetdns.dk',
    description: "A website that says it's always a DNS issue",
  },
  {
    id: 2,
    slug: 'baander',
    name: 'Bånder',
    url: 'https://github.com/baander-app',
    description: 'Music server with cover view, song list and synchronized lyric viewer.',
  },
  {
    id: 3,
    slug: 'nytarstale',
    name: 'Nytårstale',
    url: 'https://www.xn--nytrstale-72a.dk/',
    description: 'An archive of new years speeches from the danish royal family.'
  },
  {
    id: 4,
    slug: 'luft',
    name: 'Luft',
    url: 'http://luft.dk',
    description: 'Under construction'
  },
  {
    id: 5,
    slug: 'electron-angle-patcher',
    name: 'Electron Angle Patcher',
    url: 'https://pypi.org/project/electron-angle-patcher/',
    description: 'Patch Electron and Chrome applications on macOS to use OpenGL rendering through the use-angle@1 setting.',
  }
];
