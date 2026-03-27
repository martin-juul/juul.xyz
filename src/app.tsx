import { useState, useCallback, useRef, useEffect } from 'preact/hooks';
import { lazy, Suspense } from 'preact/compat';
import { LanguageProvider, useLanguage } from './context/language-context';
import { StatusProvider, useStatus } from './context/status-context';
import { Home } from './features/home';
import { Projects } from './features/projects';
import { Resume } from './features/resume';
import { Contact } from './features/contact';
import { NotFound } from './features/errors';
import { Browser } from './features/browser';
import { TaskManager } from './features/taskmanager';
import { Gallery } from './features/gallery';
import { MediaPlayer } from './features/mediaplayer';
import { SeoHead } from './components/seo-head';
import { Taskbar } from './components/taskbar';
import { StartMenu } from './components/start-menu';
import { DesktopIcons } from './components/desktop-icons';
import { type Page } from './lib/i18n-routing';
import { commonTranslations } from './features/common/translations';

// Lazy load heavy features (games + music player with webamp)
const MusicPlayer = lazy(() => import('./features/music').then(m => ({ default: m.MusicPlayer })));
const Minesweeper = lazy(() => import('./features/minesweeper').then(m => ({ default: m.Minesweeper })));
const FreeCell = lazy(() => import('./features/freecell').then(m => ({ default: m.FreeCell })));
const Spider = lazy(() => import('./features/spider').then(m => ({ default: m.Spider })));
const Solitaire = lazy(() => import('./features/solitaire').then(m => ({ default: m.Solitaire })));
const Matador = lazy(() => import('./features/matador').then(m => ({ default: m.Matador })));
const Sudoku = lazy(() => import('./features/sudoku').then(m => ({ default: m.Sudoku })));

type WindowData = {
  id: string;
  page: Page;
  state: 'normal' | 'minimized' | 'maximized';
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  isOpening: boolean;
};

type ResizeEdge = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

type ResizeState = {
  windowId: string;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
  startWindowX: number;
  startWindowY: number;
  edge: ResizeEdge;
  currentRect: { x: number; y: number; width: number; height: number };
} | null;

function AppContent() {
  const { navigateTo, currentPage } = useLanguage();
  const [windows, setWindows] = useState<WindowData[]>([]);
  const [nextZIndex, setNextZIndex] = useState(1);
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [isMusicPlayerOpen, setIsMusicPlayerOpen] = useState(false);
  const [resizing, setResizing] = useState<ResizeState>(null);
  const isNavigatingRef = useRef(false);
  const initialPageHandled = useRef(false);

  const closeMusicPlayer = useCallback(() => {
    setIsMusicPlayerOpen(false);
  }, []);

  // Page-specific default window sizes
  const getDefaultWindowSize = (page: Page): { width: number; height: number } => {
    switch (page) {
      case 'minesweeper':
        return { width: 220, height: 310 };
      case 'freecell':
        return { width: 600, height: 480 };
      case 'spider':
        return { width: 700, height: 520 };
      case 'solitaire':
        return { width: 650, height: 500 };
      case 'gallery':
        return { width: 640, height: 480 };
      case 'sudoku':
        return { width: 400, height: 520 };
      case 'matador':
        return { width: 700, height: 600 };
      case 'mediaplayer':
        return { width: 480, height: 400 };
      default:
        return { width: 640, height: 480 };
    }
  };

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
      size: getDefaultWindowSize(page),
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

  const resizeWindow = useCallback((id: string, size: { width: number; height: number }, position?: { x: number; y: number }) => {
    setWindows(prev => prev.map(w =>
      w.id === id ? { ...w, size, ...(position && { position }) } : w
    ));
  }, []);

  const handleResizeStart = useCallback((windowId: string, edge: ResizeEdge, e: MouseEvent) => {
    e.preventDefault();
    const window = windows.find(w => w.id === windowId);
    if (!window || window.state === 'maximized') return;

    setResizing({
      windowId,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: window.size.width,
      startHeight: window.size.height,
      startWindowX: window.position.x,
      startWindowY: window.position.y,
      edge,
      currentRect: {
        x: window.position.x,
        y: window.position.y,
        width: window.size.width,
        height: window.size.height,
      },
    });
  }, [windows]);

  // Get minimum window size for a page
  const getMinWindowSize = (page: Page): { width: number; height: number } => {
    switch (page) {
      case 'minesweeper':
        return { width: 180, height: 280 };
      case 'freecell':
        return { width: 500, height: 400 };
      case 'spider':
        return { width: 600, height: 450 };
      case 'solitaire':
        return { width: 550, height: 400 };
      case 'gallery':
        return { width: 480, height: 360 };
      case 'sudoku':
        return { width: 350, height: 460 };
      case 'matador':
        return { width: 600, height: 500 };
      case 'mediaplayer':
        return { width: 400, height: 320 };
      default:
        return { width: 320, height: 240 };
    }
  };

  // Handle resize mouse move and end
  useEffect(() => {
    if (!resizing) return;

    const resizingWindow = windows.find(w => w.id === resizing.windowId);
    const minSize = resizingWindow ? getMinWindowSize(resizingWindow.page) : { width: 320, height: 240 };
    const MIN_WIDTH = minSize.width;
    const MIN_HEIGHT = minSize.height;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - resizing.startX;
      const deltaY = e.clientY - resizing.startY;

      let newWidth = resizing.startWidth;
      let newHeight = resizing.startHeight;
      let newX = resizing.startWindowX;
      let newY = resizing.startWindowY;

      // Handle horizontal resize
      if (resizing.edge.includes('e')) {
        newWidth = Math.max(MIN_WIDTH, resizing.startWidth + deltaX);
      }
      if (resizing.edge.includes('w')) {
        const potentialWidth = resizing.startWidth - deltaX;
        if (potentialWidth >= MIN_WIDTH) {
          newWidth = potentialWidth;
          newX = resizing.startWindowX + deltaX;
        } else {
          newWidth = MIN_WIDTH;
          newX = resizing.startWindowX + (resizing.startWidth - MIN_WIDTH);
        }
      }

      // Handle vertical resize
      if (resizing.edge.includes('s')) {
        newHeight = Math.max(MIN_HEIGHT, resizing.startHeight + deltaY);
      }
      if (resizing.edge.includes('n')) {
        const potentialHeight = resizing.startHeight - deltaY;
        if (potentialHeight >= MIN_HEIGHT) {
          newHeight = potentialHeight;
          newY = resizing.startWindowY + deltaY;
        } else {
          newHeight = MIN_HEIGHT;
          newY = resizing.startWindowY + (resizing.startHeight - MIN_HEIGHT);
        }
      }

      setResizing(prev => prev ? {
        ...prev,
        currentRect: { x: newX, y: newY, width: newWidth, height: newHeight },
      } : null);
    };

    const handleMouseUp = () => {
      if (resizing) {
        resizeWindow(
          resizing.windowId,
          { width: resizing.currentRect.width, height: resizing.currentRect.height },
          { x: resizing.currentRect.x, y: resizing.currentRect.y }
        );
      }
      setResizing(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing, resizeWindow]);

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
      {/* Skip to main content link for screen readers */}
      <a href="#main-content" class="skip-link" data-nosnippet>
        Skip to main content
      </a>
      <DesktopIcons
        onNavigate={openWindow}
        openWindowPages={openWindowPages}
        onOpenTaskManager={() => openWindow('taskmanager')}
      />
      <div id="main-content" class="desktop" role="main" tabIndex={-1}>
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
            onResizeStart={(edge, e) => handleResizeStart(windowData.id, edge, e)}
            onNavigate={openWindow}
            windows={windows}
            onCloseWindow={closeWindow}
            onFocusWindow={focusWindow}
            isMusicPlayerOpen={isMusicPlayerOpen}
          />
        ))}
      </div>
      {/* Resize ghost outline */}
      {resizing && (
        <div
          class="resize-ghost"
          data-nosnippet
          style={{
            left: resizing.currentRect.x,
            top: resizing.currentRect.y,
            width: resizing.currentRect.width,
            height: resizing.currentRect.height,
          }}
        />
      )}
      <Suspense fallback={null}>
        <MusicPlayer
          isOpen={isMusicPlayerOpen}
          onClose={closeMusicPlayer}
      />
      </Suspense>
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
        onOpenTaskManager={() => openWindow('taskmanager')}
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
  onResizeStart: (edge: ResizeEdge, e: MouseEvent) => void;
  onNavigate: (page: Page) => void;
  windows: WindowData[];
  onCloseWindow: (id: string) => void;
  onFocusWindow: (id: string) => void;
  isMusicPlayerOpen: boolean;
};

// Status bar that reads from context
function WindowStatusBar({ onResizeStart }: { onResizeStart: (edge: ResizeEdge, e: MouseEvent) => void }) {
  const { statusText } = useStatus();
  return (
    <div class="status-bar" data-nosnippet>
      <div class="status-bar-field">{statusText || '\u00A0'}</div>
      <div class="resize-grip" onMouseDown={(e) => onResizeStart('se', e)} />
    </div>
  );
}

function Window({ data, isFocused, onClose, onMinimize, onMaximize, onFocus, onMove, onResizeStart, onNavigate, windows, onCloseWindow, onFocusWindow, isMusicPlayerOpen }: WindowProps) {
  const { t, language } = useLanguage();
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
      case 'browser': return t.nav.browser;
      case 'taskmanager': return t.nav.taskmanager;
      case 'minesweeper': return t.nav.minesweeper;
      case 'freecell': return t.nav.freecell;
      case 'spider': return t.nav.spider;
      case 'solitaire': return t.nav.solitaire;
      case 'gallery': return t.nav.gallery;
      case 'sudoku': return t.nav.sudoku;
      case 'ludo': return t.nav.ludo;
      case 'matador': return t.nav.matador;
      case 'mediaplayer': return t.nav.mediaplayer;
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
      case 'browser': return <Browser />;
      case 'taskmanager': return <TaskManager windows={windows} onCloseWindow={onCloseWindow} onFocusWindow={onFocusWindow} isMusicPlayerOpen={isMusicPlayerOpen} />;
      case 'minesweeper': return <Suspense fallback={null}><Minesweeper /></Suspense>;
      case 'freecell': return <Suspense fallback={null}><FreeCell /></Suspense>;
      case 'spider': return <Suspense fallback={null}><Spider /></Suspense>;
      case 'solitaire': return <Suspense fallback={null}><Solitaire /></Suspense>;
      case 'gallery': return <Gallery />;
      case 'sudoku': return <Suspense fallback={null}><Sudoku /></Suspense>;
      case 'ludo': return <div style="padding: 20px">Ludo game coming soon!</div>;
      case 'matador': return <Suspense fallback={null}><Matador language={language} /></Suspense>;
      case 'mediaplayer': return <MediaPlayer />;
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
      width: `${data.size.width}px`,
      height: `${data.size.height}px`,
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
      data-testid={`window-${data.page}`}
    >
      <div class={`title-bar${!isFocused ? ' inactive' : ''}`} data-nosnippet onMouseDown={handleMouseDown} onDblClick={onMaximize} data-testid="window-title-bar">
        <div class="title-bar-text">
          {getPageTitle()} - {t.brand}
        </div>
        <div class="title-bar-controls">
          <button aria-label="Minimize" onClick={onMinimize} data-testid="window-minimize-button"></button>
          <button aria-label="Maximize" onClick={onMaximize} data-testid="window-maximize-button"></button>
          <button aria-label="Close" onClick={handleClose} data-testid="window-close-button"></button>
        </div>
      </div>
      <StatusProvider>
        <div class="window-body" style="flex: 1; overflow: hidden; display: flex; flex-direction: column;">
          <div style="flex: 1; overflow-y: auto;">
            {renderContent()}
          </div>
        </div>
        {/* Status bar with resize grip */}
        {data.state !== 'maximized' && (
          <WindowStatusBar onResizeStart={onResizeStart} />
        )}
      </StatusProvider>
      {/* Resize handles - only show when not maximized */}
      {data.state !== 'maximized' && (
        <div data-nosnippet>
          <div class="resize-handle resize-n" onMouseDown={(e) => onResizeStart('n', e)} />
          <div class="resize-handle resize-s" onMouseDown={(e) => onResizeStart('s', e)} />
          <div class="resize-handle resize-e" onMouseDown={(e) => onResizeStart('e', e)} />
          <div class="resize-handle resize-w" onMouseDown={(e) => onResizeStart('w', e)} />
          <div class="resize-handle resize-nw" onMouseDown={(e) => onResizeStart('nw', e)} />
          <div class="resize-handle resize-ne" onMouseDown={(e) => onResizeStart('ne', e)} />
          <div class="resize-handle resize-sw" onMouseDown={(e) => onResizeStart('sw', e)} />
        </div>
      )}
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
