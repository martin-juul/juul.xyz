import { useState, useCallback, useRef, useEffect } from 'preact/hooks';
import { LanguageProvider, useLanguage } from './context/language-context';
import { Home } from './pages/home';
import { Projects } from './pages/projects';
import { Resume } from './pages/resume';
import { Contact } from './pages/contact';
import { NotFound } from './pages/not-found';
import { MusicPlayer } from './pages/music';
import { SeoHead } from './components/seo-head';
import { Taskbar } from './components/taskbar';
import { StartMenu } from './components/start-menu';
import { DesktopIcons } from './components/desktop-icons';
import { type Page } from './lib/i18n-routing';

type WindowData = {
  id: string;
  page: Page;
  state: 'normal' | 'minimized' | 'maximized';
  position: { x: number; y: number };
  zIndex: number;
  isOpening: boolean;
};

function AppContent() {
  const { navigateTo, currentPage } = useLanguage();
  const [windows, setWindows] = useState<WindowData[]>([]);
  const [nextZIndex, setNextZIndex] = useState(1);
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [isMusicPlayerOpen, setIsMusicPlayerOpen] = useState(false);
  const isNavigatingRef = useRef(false);
  const initialPageHandled = useRef(false);

  const closeMusicPlayer = useCallback(() => {
    setIsMusicPlayerOpen(false);
  }, []);

  const openWindow = useCallback((page: Page, updateUrl: boolean = true) => {
    // Music player is handled separately
    if (page === 'music') {
      setIsMusicPlayerOpen(true);
      setIsStartMenuOpen(false);
      if (updateUrl) {
        isNavigatingRef.current = true;
        navigateTo(page);
      }
      return;
    }

    const existingWindow = windows.find(w => w.page === page);
    if (existingWindow) {
      // Bring existing window to front and restore if minimized
      setWindows(prev => prev.map(w =>
        w.id === existingWindow.id
          ? { ...w, state: 'normal' as const, zIndex: nextZIndex, isOpening: false }
          : w
      ));
      setNextZIndex(prev => prev + 1);
      setIsStartMenuOpen(false);
      if (updateUrl) {
        isNavigatingRef.current = true;
        navigateTo(page);
      }
      return;
    }

    const newWindow: WindowData = {
      id: `${page}-${Date.now()}`,
      page,
      state: 'normal',
      position: { x: 20 + (windows.length * 30), y: 20 + (windows.length * 30) },
      zIndex: nextZIndex,
      isOpening: true,
    };
    setWindows(prev => [...prev, newWindow]);
    setNextZIndex(prev => prev + 1);
    setIsStartMenuOpen(false);
    if (updateUrl) {
      isNavigatingRef.current = true;
      navigateTo(page);
    }
  }, [windows, nextZIndex, navigateTo]);

  const closeWindow = useCallback((id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
  }, []);

  const minimizeWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w =>
      w.id === id ? { ...w, state: 'minimized' as const } : w
    ));
  }, []);

  const maximizeWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w =>
      w.id === id
        ? { ...w, state: w.state === 'maximized' ? 'normal' as const : 'maximized' as const }
        : w
    ));
  }, []);

  const restoreWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w =>
      w.id === id
        ? { ...w, state: 'normal' as const, zIndex: nextZIndex, isOpening: false }
        : w
    ));
    setNextZIndex(prev => prev + 1);
  }, [nextZIndex]);

  const focusWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w =>
      w.id === id ? { ...w, zIndex: nextZIndex, isOpening: false } : w
    ));
    setNextZIndex(prev => prev + 1);
  }, [nextZIndex]);

  const moveWindow = useCallback((id: string, position: { x: number; y: number }) => {
    setWindows(prev => prev.map(w =>
      w.id === id ? { ...w, position } : w
    ));
  }, []);

  // Handle initial route - use currentPage from context
  useEffect(() => {
    if (initialPageHandled.current) return;
    initialPageHandled.current = true;
    openWindow(currentPage, false);
  }, [currentPage]);

  // Get open pages for highlighting (includes music if open)
  const openWindowPages = [...windows.map(w => w.page), ...(isMusicPlayerOpen ? ['music' as Page] : [])];

  // Calculate which window is focused (highest zIndex among non-minimized windows)
  const focusedWindowId = windows.length > 0
    ? windows.reduce((max, w) => w.zIndex > max.zIndex ? w : max).id
    : null;

  return (
    <>
      <SeoHead page={windows[windows.length - 1]?.page || 'home'} />
      <DesktopIcons
        onNavigate={openWindow}
        openWindowPages={openWindowPages}
      />
      <div class="desktop">
        {windows.map(windowData => (
          <Window
            key={windowData.id}
            data={windowData}
            isFocused={windowData.id === focusedWindowId}
            onClose={() => closeWindow(windowData.id)}
            onMinimize={() => minimizeWindow(windowData.id)}
            onMaximize={() => maximizeWindow(windowData.id)}
            onFocus={() => focusWindow(windowData.id)}
            onMove={(pos) => moveWindow(windowData.id, pos)}
            onNavigate={openWindow}
          />
        ))}
      </div>
      <MusicPlayer
        isOpen={isMusicPlayerOpen}
        onClose={closeMusicPlayer}
      />
      <StartMenu
        isOpen={isStartMenuOpen}
        onClose={() => setIsStartMenuOpen(false)}
        onNavigate={openWindow}
        openWindowPages={openWindowPages}
      />
      <Taskbar
        windows={windows}
        focusedWindowId={focusedWindowId}
        isMusicPlayerOpen={isMusicPlayerOpen}
        onStartClick={() => setIsStartMenuOpen(!isStartMenuOpen)}
        isStartMenuOpen={isStartMenuOpen}
        onRestoreWindow={restoreWindow}
        onOpenMusicPlayer={() => setIsMusicPlayerOpen(true)}
      />
    </>
  );
}

type WindowProps = {
  data: WindowData;
  isFocused: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onFocus: () => void;
  onMove: (pos: { x: number; y: number }) => void;
  onNavigate: (page: Page) => void;
};

function Window({ data, isFocused, onClose, onMinimize, onMaximize, onFocus, onMove, onNavigate }: WindowProps) {
  const { t } = useLanguage();
  const [isDragging, setIsDragging] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Clear opening animation after it plays
  useEffect(() => {
    if (data.isOpening) {
      const timer = setTimeout(() => setHasOpened(true), 150);
      return () => clearTimeout(timer);
    }
  }, [data.isOpening]);

  const getPageTitle = () => {
    switch (data.page) {
      case 'home': return t.nav.home;
      case 'projects': return t.nav.projects;
      case 'resume': return t.nav.resume;
      case 'contact': return t.nav.contact;
      case 'music': return t.nav.music;
      case 'notfound': return t.notFound.windowTitle;
    }
  };

  const renderContent = () => {
    switch (data.page) {
      case 'home': return <Home onNavigate={onNavigate} />;
      case 'projects': return <Projects />;
      case 'resume': return <Resume />;
      case 'contact': return <Contact />;
      case 'music': return null; // Music is handled separately
      case 'notfound': return <NotFound />;
    }
  };

  const handleMouseDown = (e: MouseEvent) => {
    if ((e.target as HTMLElement).closest('.title-bar-controls')) return;
    if (data.state === 'maximized') return;
    onFocus();
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - data.position.x,
      y: e.clientY - data.position.y,
    };
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      onMove({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, onMove]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  const getWindowStyle = () => {
    if (data.state === 'maximized') {
      return {
        width: '100%',
        height: 'calc(100vh - 36px)',
        left: 0,
        top: 0,
        zIndex: data.zIndex,
      };
    }
    return {
      width: '900px',
      transform: `translate(${data.position.x}px, ${data.position.y}px)`,
      zIndex: data.zIndex,
    };
  };

  const windowClasses = [
    'window',
    'app-window',
    data.state === 'minimized' && 'window-minimized',
    data.state === 'maximized' && 'window-maximized',
    isClosing && 'window-closing',
    data.isOpening && !hasOpened && 'window-opening',
  ].filter(Boolean).join(' ');

  if (data.state === 'minimized') {
    return null;
  }

  return (
    <div
      class={windowClasses}
      style={getWindowStyle()}
      onClick={onFocus}
    >
      <div class={`title-bar${!isFocused ? ' inactive' : ''}`} onMouseDown={handleMouseDown}>
        <div class="title-bar-text">
          {getPageTitle()} - {t.brand}
        </div>
        <div class="title-bar-controls">
          <button aria-label="Minimize" onClick={onMinimize}></button>
          <button aria-label="Maximize" onClick={onMaximize}></button>
          <button aria-label="Close" onClick={handleClose}></button>
        </div>
      </div>
      <div class="window-body">
        <div style="height: 500px; overflow-y: auto;">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
