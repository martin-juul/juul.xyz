import { useState, useEffect } from 'preact/hooks';
import { useLanguage } from '../context/language-context';
import { LanguageSwitcher } from './language-switcher';

type Page = 'home' | 'projects' | 'resume' | 'contact' | 'music' | 'notfound';

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
};

export function Taskbar({ windows, focusedWindowId, isMusicPlayerOpen, onStartClick, isStartMenuOpen, onRestoreWindow, onOpenMusicPlayer }: TaskbarProps) {
  const { t } = useLanguage();
  const [time, setTime] = useState(new Date());

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
      case 'notfound': return '/assets/icons/windows.png';
    }
  };

  return (
    <div class="taskbar">
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
    </div>
  );
}
