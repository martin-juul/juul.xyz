import { useState, useCallback, useRef, useEffect } from 'preact/hooks';
import { LanguageProvider, useLanguage } from './context/language-context';
import { Home } from './pages/home';
import { Projects } from './pages/projects';
import { Resume } from './pages/resume';
import { Contact } from './pages/contact';
import { Navbar } from './components/navbar';
import { Footer } from './components/footer';
import { SeoHead } from './components/seo-head';
import { Taskbar } from './components/taskbar';
import { StartMenu } from './components/start-menu';

type Page = 'home' | 'projects' | 'resume' | 'contact';
type WindowState = 'normal' | 'minimized' | 'maximized';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isLoading, setIsLoading] = useState(false);
  const [loadProgress, setLoadProgress] = useState(100);
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [windowPos, setWindowPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [windowState, setWindowState] = useState<WindowState>('normal');
  const [isClosing, setIsClosing] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const navigateTo = useCallback((page: Page) => {
    if (page === currentPage) return;
    setIsLoading(true);
    setLoadProgress(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setIsLoading(false);
        setCurrentPage(page);
      }
      setLoadProgress(progress);
    }, 50);
  }, [currentPage]);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={navigateTo} />;
      case 'projects':
        return <Projects />;
      case 'resume':
        return <Resume />;
      case 'contact':
        return <Contact />;
      default:
        return <Home onNavigate={navigateTo} />;
    }
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

  const handleMinimize = () => {
    setWindowState('minimized');
  };

  const handleMaximize = () => {
    setWindowState(windowState === 'maximized' ? 'normal' : 'maximized');
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setWindowState('minimized');
    }, 200);
  };

  const handleRestore = () => {
    setWindowState('normal');
    setIsStartMenuOpen(false);
  };

  const handleMouseDown = (e: MouseEvent) => {
    if ((e.target as HTMLElement).closest('.title-bar-controls')) return;
    if (windowState === 'maximized') return;
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - windowPos.x,
      y: e.clientY - windowPos.y,
    };
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      setWindowPos({
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
  }, [isDragging]);

  const getWindowStyle = () => {
    if (windowState === 'maximized') {
      return 'width: 100%; height: calc(100vh - 36px); transform: none;';
    }
    return `width: 900px; transform: translate(${windowPos.x}px, ${windowPos.y}px);`;
  };

  const windowClasses = [
    'window',
    'full-width',
    'draggable-window',
    windowState === 'minimized' && 'window-minimized',
    windowState === 'maximized' && 'window-maximized',
    isClosing && 'window-closing',
  ].filter(Boolean).join(' ');

  return (
    <>
      <SeoHead page={currentPage} />
      <div class="desktop">
        <div
          ref={windowRef}
          class={windowClasses}
          style={getWindowStyle()}
        >
          <div class="title-bar" onMouseDown={handleMouseDown}>
            <div class="title-bar-text">
              {getPageLabel()} - {t.brand}
            </div>
            <div class="title-bar-controls">
              <button aria-label="Minimize" onClick={handleMinimize}></button>
              <button aria-label="Maximize" onClick={handleMaximize}></button>
              <button aria-label="Close" onClick={handleClose}></button>
            </div>
          </div>
          <Navbar currentPage={currentPage} onNavigate={navigateTo} />
          <div class="window-body">
            <div style="height: 500px; overflow-y: auto;">
              {renderPage()}
            </div>
          </div>
          <Footer isLoading={isLoading} loadProgress={loadProgress} />
        </div>
      </div>
      <StartMenu
        isOpen={isStartMenuOpen}
        onClose={() => setIsStartMenuOpen(false)}
        onNavigate={navigateTo}
      />
      <Taskbar
        currentPage={currentPage}
        onStartClick={() => setIsStartMenuOpen(!isStartMenuOpen)}
        isStartMenuOpen={isStartMenuOpen}
        windowState={windowState}
        onRestoreWindow={handleRestore}
      />
    </>
  );
}

export function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
