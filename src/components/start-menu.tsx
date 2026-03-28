import { useLanguage } from '../context/language-context';

import { type Page } from '../shared/types';

type StartMenuProps = {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: Page) => void;
  openWindowPages: Page[];
};

export function StartMenu({ isOpen, onClose, onNavigate, openWindowPages }: StartMenuProps) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  const handleNavigate = (page: Page) => {
    onNavigate(page);
    onClose();
  };

  const menuItems: {page: Page, icon: string}[] = [
    { page: 'home', icon: '/assets/icons/home.png' },
    { page: 'projects', icon: '/assets/icons/folder.png' },
    { page: 'resume', icon: '/assets/icons/document.png' },
    { page: 'contact', icon: '/assets/icons/mail.png' },
    { page: 'music', icon: '/assets/icons/music.png' },
    { page: 'browser', icon: '/assets/icons/ie.png' },
    { page: 'minesweeper', icon: '/assets/icons/minesweeper.png' },
    { page: 'freecell', icon: '/assets/icons/freecell.png' },
    { page: 'spider', icon: '/assets/icons/spider.png' },
    { page: 'solitaire', icon: '/assets/icons/solitaire.png' },
    { page: 'hearts', icon: '/assets/icons/freecell.png' },
    { page: 'sudoku', icon: '/assets/icons/sudoku.png' },
    { page: 'gallery', icon: '/assets/icons/gallery.png' },
    { page: 'matador', icon: '/assets/icons/matador.png' },
    { page: 'mediaplayer', icon: '/assets/icons/mediaplayer.png' },
    { page: 'chips', icon: '/assets/icons/chips.png' },
    { page: 'jezzball', icon: '/assets/icons/jezzball.png' },
    { page: 'pipedream', icon: '/assets/icons/pipedream.png' },
    { page: 'ludo', icon: '/assets/icons/ludo.png' },
    { page: 'skifree', icon: '/assets/icons/skifree.png' },
  ];

  const getPageLabel = (page: Page) => {
    switch (page) {
      case 'home': return t.nav.home;
      case 'projects': return t.nav.projects;
      case 'resume': return t.nav.resume;
      case 'contact': return t.nav.contact;
      case 'music': return t.nav.music;
      case 'browser': return t.nav.browser;
      case 'minesweeper': return t.nav.minesweeper;
      case 'freecell': return t.nav.freecell;
      case 'spider': return t.nav.spider;
      case 'solitaire': return t.nav.solitaire;
      case 'hearts': return t.nav.hearts;
      case 'gallery': return t.nav.gallery;
      case 'sudoku': return t.nav.sudoku;
      case 'matador': return t.nav.matador;
      case 'mediaplayer': return t.nav.mediaplayer;
      case 'chips': return t.nav.chips;
      case 'jezzball': return t.nav.jezzball;
      case 'pipedream': return t.nav.pipedream;
      case 'ludo': return t.nav.ludo;
      case 'skifree': return t.nav.skifree;
      case 'notfound': return t.notFound.windowTitle;
    }
  };

  return (
    <>
      <div class="start-menu-overlay" onClick={onClose} aria-hidden="true" data-nosnippet data-testid="start-menu-overlay" />
      <div id="start-menu" class="start-menu" role="menu" aria-label="Start menu" data-nosnippet data-testid="start-menu">
        <div class="start-menu-sidebar">
          <span class="start-menu-brand">
            Martin<span class="start-menu-brand-suffix">97</span>
          </span>
        </div>
        <div class="start-menu-items" data-testid="start-menu-items">
          {menuItems.map((item, index) => (
            <>
              <button
                class={`start-menu-item ${openWindowPages.includes(item.page) ? 'start-menu-item-open' : ''}`}
                onClick={() => handleNavigate(item.page)}
                role="menuitem"
                data-testid={`start-menu-item-${item.page}`}
              >
                <span class="start-menu-icon">
                  <img src={item.icon} alt="" aria-hidden="true" />
                </span>
                <span class="start-menu-item-title">{getPageLabel(item.page)}</span>
              </button>
              {index === 0 && <div class="start-menu-separator" role="separator" />}
              {index === 3 && <div class="start-menu-separator" role="separator" />}
            </>
          ))}
        </div>
      </div>
    </>
  );
}
