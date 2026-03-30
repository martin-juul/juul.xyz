import { useState, useEffect, useRef } from 'preact/hooks';
import { useLanguage } from '../context/language-context';
import { useDesktopContextMenu } from './context-menu';

import { type Page } from '../shared/types';

type DesktopIconsProps = {
  onNavigate: (page: Page) => void;
  openWindowPages: Page[];
  onOpenTaskManager?: () => void;
};

export function DesktopIcons({ onNavigate, openWindowPages, onOpenTaskManager }: DesktopIconsProps) {
  const { t } = useLanguage();
  const [selectedIcon, setSelectedIcon] = useState<Page | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { openContextMenu, ContextMenuRenderer } = useDesktopContextMenu(onOpenTaskManager);

  const icons = [
    { page: 'home' as Page, icon: '/assets/icons/home.png' },
    { page: 'projects' as Page, icon: '/assets/icons/folder.png' },
    { page: 'resume' as Page, icon: '/assets/icons/document.png' },
    { page: 'contact' as Page, icon: '/assets/icons/mail.png' },
    { page: 'music' as Page, icon: '/assets/icons/music.png' },
    { page: 'browser' as Page, icon: '/assets/icons/ie.png' },
    { page: 'minesweeper' as Page, icon: '/assets/icons/minesweeper.png' },
    { page: 'freecell' as Page, icon: '/assets/icons/freecell.png' },
    { page: 'spider' as Page, icon: '/assets/icons/spider.png' },
    { page: 'solitaire' as Page, icon: '/assets/icons/solitaire.png' },
    { page: 'sudoku' as Page, icon: '/assets/icons/sudoku.png' },
    { page: 'chips' as Page, icon: '/assets/icons/chips.png' },
    { page: 'jezzball' as Page, icon: '/assets/icons/jezzball.png' },
    { page: 'pipedream' as Page, icon: '/assets/icons/pipedream.png' },
    { page: 'gallery' as Page, icon: '/assets/icons/gallery.png' },
    { page: 'matador' as Page, icon: '/assets/icons/matador.png' },
    { page: 'mediaplayer' as Page, icon: '/assets/icons/mediaplayer.png' },
    { page: 'hearts' as Page, icon: '/assets/icons/hearts.png' },
    { page: 'ludo' as Page, icon: '/assets/icons/ludo.png' },
    { page: 'skifree' as Page, icon: '/assets/icons/skifree.png' },
    { page: 'nibbles' as Page, icon: '/assets/icons/nibbles.png' },
    { page: 'tetris' as Page, icon: '/assets/icons/tetris.png' },
    { page: 'mahjong' as Page, icon: '/assets/icons/sudoku.png' }, // Using sudoku icon as placeholder
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
      case 'gallery': return t.nav.gallery;
      case 'sudoku': return t.nav.sudoku;
      case 'chips': return t.nav.chips;
      case 'jezzball': return t.nav.jezzball;
      case 'pipedream': return t.nav.pipedream;
      case 'matador': return t.nav.matador;
      case 'mediaplayer': return t.nav.mediaplayer;
      case 'hearts': return t.nav.hearts;
      case 'ludo': return t.nav.ludo;
      case 'skifree': return t.nav.skifree;
      case 'nibbles': return t.nav.nibbles;
      case 'tetris': return t.nav.tetris;
      case 'mahjong': return t.nav.mahjong;
      case 'notfound': return t.notFound.windowTitle;
    }
  };

  const handleClick = (page: Page) => {
    setSelectedIcon(page);
  };

  const handleDoubleClick = (page: Page) => {
    onNavigate(page);
  };

  const handleKeyDown = (page: Page, e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (selectedIcon === page) {
        // Already selected - activate
        onNavigate(page);
      } else {
        // Select the icon
        setSelectedIcon(page);
      }
    }
  };

  // Deselect icon when clicking outside
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setSelectedIcon(null);
      }
    };

    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, []);

  return (
    <>
      <div
        class="desktop-icons"
        ref={containerRef}
        data-nosnippet
        data-testid="desktop-icons"
        onContextMenu={openContextMenu}
      >
        {icons.map((item) => (
        <button
          class={`desktop-icon ${selectedIcon === item.page ? 'desktop-icon-selected' : ''} ${openWindowPages.includes(item.page) ? 'desktop-icon-open' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            handleClick(item.page);
          }}
          onDblClick={(e) => {
            e.stopPropagation();
            handleDoubleClick(item.page);
          }}
          onKeyDown={(e) => handleKeyDown(item.page, e)}
          aria-label={getPageLabel(item.page)}
          aria-selected={selectedIcon === item.page}
          data-testid={`desktop-icon-${item.page}`}
        >
          <div class="desktop-icon-image">
            <img src={item.icon} alt="" draggable={false} />
          </div>
          <span class="desktop-icon-label">{getPageLabel(item.page)}</span>
        </button>
        ))}
      </div>
      <ContextMenuRenderer />
    </>
  );
}
