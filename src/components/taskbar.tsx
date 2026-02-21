import { useState, useEffect } from 'preact/hooks';
import { useLanguage } from '../context/language-context';
import { LanguageSwitcher } from './language-switcher';

type Page = 'home' | 'projects' | 'resume' | 'contact';

type TaskbarProps = {
  currentPage: Page;
  onStartClick: () => void;
  isStartMenuOpen: boolean;
};

export function Taskbar({ currentPage, onStartClick, isStartMenuOpen }: TaskbarProps) {
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
        <div class="danish-flag">
          <div class="flag-white-cross-h"></div>
          <div class="flag-white-cross-v"></div>
        </div>
        <span>{t.start}</span>
      </button>
      <div class="taskbar-windows">
        <div class="taskbar-window active">
          <span class="taskbar-window-icon">💻</span>
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
