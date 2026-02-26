import { useState, useEffect, useRef } from 'preact/hooks';
import { useLanguage } from '../context/language-context';
import { LanguageSwitcher } from '../shared';

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
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Close context menu on click outside
  useEffect(() => {
    if (!contextMenu) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [contextMenu]);

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
      case 'notfound': return '/assets/icons/windows.png';
    }
  };

  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleOpenTaskManager = () => {
    setContextMenu(null);
    if (onOpenTaskManager) {
      onOpenTaskManager();
    }
  };

  return (
    <div class="taskbar" data-nosnippet onContextMenu={handleContextMenu}>
      <button
        class={`start-button ${isStartMenuOpen ? 'active' : ''}`}
        onClick={onStartClick}
      >
        <img src="/assets/icons/windows.png" alt="" style="width: 16px; height: 16px;" />
        <span>{t.start}</span>
      </button>
      <div class="taskbar-windows">
        {windows.map(window => (
          <div
            key={window.id}
            class={`taskbar-window ${window.id === focusedWindowId && window.state !== 'minimized' ? 'active' : ''}`}
            onClick={() => onRestoreWindow(window.id)}
          >
            <img src={getPageIcon(window.page)} alt="" style="width: 16px; height: 16px;" />
            <span>{getPageLabel(window.page)}</span>
          </div>
        ))}
        {isMusicPlayerOpen && (
          <div
            class="taskbar-window active"
            onClick={onOpenMusicPlayer}
          >
            <img src={getPageIcon('music')} alt="" style="width: 16px; height: 16px;" />
            <span>{getPageLabel('music')}</span>
          </div>
        )}
      </div>
      <div class="system-tray">
        <LanguageSwitcher />
        <div class="system-tray-clock">
          {formatTime(time)}
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          class="taskbar-context-menu"
          style={{ left: contextMenu.x, top: contextMenu.y - 80 }}
        >
          <div class="context-menu-item" onClick={handleOpenTaskManager}>
            <img src="/assets/icons/windows.png" alt="" class="context-menu-icon" />
            <span>{t.nav.taskmanager}</span>
          </div>
          <div class="context-menu-separator"></div>
          <div class="context-menu-item context-menu-item-disabled">
            <span>Tile Windows Horizontally</span>
          </div>
          <div class="context-menu-item context-menu-item-disabled">
            <span>Tile Windows Vertically</span>
          </div>
          <div class="context-menu-item context-menu-item-disabled">
            <span>Cascade Windows</span>
          </div>
        </div>
      )}
    </div>
  );
}
