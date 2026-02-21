import { useState, useEffect } from 'preact/hooks';
import { useLanguage } from '../context/language-context';
import { LanguageSwitcher } from './language-switcher';

type Page = 'home' | 'projects' | 'resume' | 'contact';

type WindowData = {
  id: string;
  page: Page;
  state: 'normal' | 'minimized' | 'maximized';
  position: { x: number; y: number };
  zIndex: number;
};

type TaskbarProps = {
  windows: WindowData[];
  onStartClick: () => void;
  isStartMenuOpen: boolean;
  onRestoreWindow: (id: string) => void;
};

export function Taskbar({ windows, onStartClick, isStartMenuOpen, onRestoreWindow }: TaskbarProps) {
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
    }
  };

  const getPageIcon = (page: Page) => {
    switch (page) {
      case 'home': return '/assets/icons/home.png';
      case 'projects': return '/assets/icons/folder.png';
      case 'resume': return '/assets/icons/document.png';
      case 'contact': return '/assets/icons/mail.png';
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
            class={`taskbar-window ${window.state !== 'minimized' ? 'active' : ''}`}
            onClick={() => onRestoreWindow(window.id)}
          >
            <img src={getPageIcon(window.page)} alt="" style="width: 16px; height: 16px;" />
            <span>{getPageLabel(window.page)}</span>
          </div>
        ))}
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
