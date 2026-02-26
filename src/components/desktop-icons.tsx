import { useState, useEffect, useRef } from 'preact/hooks';
import { useLanguage } from '../context/language-context';

import { type Page } from '../shared/types';

type DesktopIconsProps = {
  onNavigate: (page: Page) => void;
  openWindowPages: Page[];
};

export function DesktopIcons({ onNavigate, openWindowPages }: DesktopIconsProps) {
  const { t } = useLanguage();
  const [selectedIcon, setSelectedIcon] = useState<Page | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const icons = [
    { page: 'home' as Page, icon: '/assets/icons/home.png' },
    { page: 'projects' as Page, icon: '/assets/icons/folder.png' },
    { page: 'resume' as Page, icon: '/assets/icons/document.png' },
    { page: 'contact' as Page, icon: '/assets/icons/mail.png' },
    { page: 'music' as Page, icon: '/assets/icons/music.png' },
    { page: 'browser' as Page, icon: '/assets/icons/ie.png' },
  ];

  const getPageLabel = (page: Page) => {
    switch (page) {
      case 'home': return t.nav.home;
      case 'projects': return t.nav.projects;
      case 'resume': return t.nav.resume;
      case 'contact': return t.nav.contact;
      case 'music': return t.nav.music;
      case 'browser': return t.nav.browser;
      case 'notfound': return t.notFound.windowTitle;
    }
  };

  const handleClick = (page: Page) => {
    setSelectedIcon(page);
  };

  const handleDoubleClick = (page: Page) => {
    onNavigate(page);
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
    <div class="desktop-icons" ref={containerRef} data-nosnippet>
      {icons.map((item) => (
        <div
          class={`desktop-icon ${selectedIcon === item.page ? 'desktop-icon-selected' : ''} ${openWindowPages.includes(item.page) ? 'desktop-icon-open' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            handleClick(item.page);
          }}
          onDblClick={(e) => {
            e.stopPropagation();
            handleDoubleClick(item.page);
          }}
        >
          <div class="desktop-icon-image">
            <img src={item.icon} alt="" draggable={false} />
          </div>
          <span class="desktop-icon-label">{getPageLabel(item.page)}</span>
        </div>
      ))}
    </div>
  );
}
