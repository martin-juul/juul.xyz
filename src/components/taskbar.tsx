import { useState, useEffect } from 'preact/hooks';
import { useLanguage } from '../context/language-context';
import { LanguageSwitcher } from '../shared';
import { useContextMenu } from './context-menu';

import { type Page } from '../shared/types';

type WindowData = {
  id: string;
  page: Page;
  state: 'normal' | 'minimized' | 'maximized';
  position: { x: number; y: number };
  zIndex: number;
};

type TaskbarProps = {
  windows: WindowData[];
  focusedWindowId: string | null;
  isMusicPlayerOpen: boolean;
  onStartClick: () => void;
  isStartMenuOpen: boolean;
  onRestoreWindow: (id: string) => void;
  onOpenMusicPlayer: () => void;
  onOpenTaskManager?: () => void;
};

export function Taskbar({ windows, focusedWindowId, isMusicPlayerOpen, onStartClick, isStartMenuOpen, onRestoreWindow, onOpenMusicPlayer, onOpenTaskManager }: TaskbarProps) {
  const { t } = useLanguage();
  const [time, setTime] = useState(new Date());
  const { openContextMenu, closeContextMenu, ContextMenuRenderer: TaskbarContextMenu } = useContextMenu();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getPageLabel = (page: Page) => {
    switch (page) {
      case 'home': return t.nav.home;
      case 'projects': return t.nav.projects;
      case 'resume': return t.nav.resume;
      case 'contact': return t.nav.contact;
      case 'music': return t.nav.music;
      case 'browser': return t.nav.browser;
      case 'taskmanager': return t.nav.taskmanager;
      case 'minesweeper': return t.nav.minesweeper;
      case 'freecell': return t.nav.freecell;
      case 'spider': return t.nav.spider;
      case 'solitaire': return t.nav.solitaire;
      case 'sudoku': return t.nav.sudoku;
      case 'chips': return t.nav.chips;
      case 'gallery': return t.nav.gallery;
      case 'ludo': return t.nav.ludo;
      case 'jezzball': return t.nav.jezzball;
      case 'matador': return t.nav.matador;
      case 'mediaplayer': return t.nav.mediaplayer;
      case 'hearts': return t.nav.hearts;
      case 'pipedream': return t.nav.pipedream;
      case 'skifree': return t.nav.skifree;
      case 'notfound': return t.notFound.windowTitle;
    }
  };

  const getPageIcon = (page: Page) => {
    switch (page) {
      case 'home': return '/assets/icons/home.png';
      case 'projects': return '/assets/icons/folder.png';
      case 'resume': return '/assets/icons/document.png';
      case 'contact': return '/assets/icons/mail.png';
      case 'music': return '/assets/icons/music.png';
      case 'browser': return '/assets/icons/ie.png';
      case 'taskmanager': return '/assets/icons/windows.png';
      case 'minesweeper': return '/assets/icons/minesweeper.png';
      case 'freecell': return '/assets/icons/freecell.png';
      case 'spider': return '/assets/icons/spider.png';
      case 'solitaire': return '/assets/icons/solitaire.png';
      case 'sudoku': return '/assets/icons/sudoku.png';
      case 'chips': return '/assets/icons/chips.png';
      case 'gallery': return '/assets/icons/gallery.png';
      case 'ludo': return '/assets/icons/windows.png';
      case 'jezzball': return '/assets/icons/jezzball.png';
      case 'matador': return '/assets/icons/matador.png';
      case 'mediaplayer': return '/assets/icons/mediaplayer.png';
      case 'hearts': return '/assets/icons/hearts.png';
      case 'pipedream': return '/assets/icons/pipedream.png';
      case 'skifree': return '/assets/icons/skifree.png';
      case 'notfound': return '/assets/icons/windows.png';
    }
  };

  const getTaskbarMenuItems = () => {
    return [
      {
        label: t.nav.taskmanager,
        icon: '/assets/icons/windows.png',
        onClick: () => {
          if (onOpenTaskManager) {
            onOpenTaskManager();
          }
        },
      },
      { label: '', icon: '', onClick: () => {} }, // Separator
      {
        label: 'Tile Windows Horizontally',
        onClick: () => {},
        disabled: true,
      },
      {
        label: 'Tile Windows Vertically',
        onClick: () => {},
        disabled: true,
      },
      {
        label: 'Cascade Windows',
        onClick: () => {},
        disabled: true,
      },
    ];
  };

  return (
    <div class="taskbar" role="navigation" aria-label="Taskbar" data-nosnippet onContextMenu={openContextMenu} data-testid="taskbar">
      <button
        class={`start-button ${isStartMenuOpen ? 'active' : ''}`}
        onClick={onStartClick}
        aria-expanded={isStartMenuOpen}
        aria-controls="start-menu"
        aria-haspopup="menu"
        data-testid="start-button"
      >
        <img src="/assets/icons/windows.png" alt="" style="width: 16px; height: 16px;" />
        <span>{t.start}</span>
      </button>
      <div class="taskbar-windows" data-testid="taskbar-windows">
        {windows.map(window => (
          <button
            key={window.id}
            class={`taskbar-window ${window.id === focusedWindowId && window.state !== 'minimized' ? 'active' : ''}`}
            onClick={() => onRestoreWindow(window.id)}
            aria-label={getPageLabel(window.page)}
            aria-pressed={window.id === focusedWindowId && window.state !== 'minimized'}
            data-testid={`taskbar-window-${window.page}`}
          >
            <img src={getPageIcon(window.page)} alt="" style="width: 16px; height: 16px;" />
            <span>{getPageLabel(window.page)}</span>
          </button>
        ))}
        {isMusicPlayerOpen && (
          <button
            class="taskbar-window active"
            onClick={onOpenMusicPlayer}
            aria-label={getPageLabel('music')}
            aria-pressed="true"
            data-testid="taskbar-window-music"
          >
            <img src={getPageIcon('music')} alt="" style="width: 16px; height: 16px;" />
            <span>{getPageLabel('music')}</span>
          </button>
        )}
      </div>
      <div class="system-tray" data-testid="system-tray">
        <LanguageSwitcher />
        <div class="system-tray-clock" data-testid="system-tray-clock">
          {formatTime(time)}
        </div>
      </div>

      {/* Context Menu */}
      <TaskbarContextMenu items={getTaskbarMenuItems()} />
    </div>
  );
}
