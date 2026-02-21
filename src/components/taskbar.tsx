import { useState, useEffect } from 'preact/hooks';
import { useLanguage } from '../context/language-context';
import { LanguageSwitcher } from './language-switcher';

type Page = 'home' | 'projects' | 'resume' | 'contact';
type WindowState = 'normal' | 'minimized' | 'maximized';

type TaskbarProps = {
  currentPage: Page;
  onStartClick: () => void;
  isStartMenuOpen: boolean;
  windowState: WindowState;
  onRestoreWindow: () => void;
};

export function Taskbar({ currentPage, onStartClick, isStartMenuOpen, windowState, onRestoreWindow }: TaskbarProps) {
  const { t } = useLanguage();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getPageLabel = () => {
    switch (currentPage) {
      case 'home': return t.nav.home;
      case 'projects': return t.nav.projects;
      case 'resume': return t.nav.resume;
      case 'contact': return t.nav.contact;
      default: return t.nav.home;
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
        <div
          class={`taskbar-window ${windowState !== 'minimized' ? 'active' : ''}`}
          onClick={onRestoreWindow}
        >
          <img src="/assets/icons/computer.png" alt="" style="width: 16px; height: 16px;" />
          <span>{getPageLabel()}</span>
        </div>
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
