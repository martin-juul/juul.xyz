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

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isLoading, setIsLoading] = useState(false);
  const [loadProgress, setLoadProgress] = useState(100);
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [windowPos, setWindowPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
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

  const handleMouseDown = (e: MouseEvent) => {
    if ((e.target as HTMLElement).closest('.title-bar-controls')) return;
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

  return (
    <>
      <SeoHead page={currentPage} />
      <div class="desktop">
        <div
          class="window full-width draggable-window"
          style={`width: 900px; transform: translate(${windowPos.x}px, ${windowPos.y}px);`}
        >
          <div class="title-bar" onMouseDown={handleMouseDown}>
            <div class="title-bar-text">
              {currentPage === 'home' && t.nav.home}
              {currentPage === 'projects' && t.nav.projects}
              {currentPage === 'resume' && t.nav.resume}
              {currentPage === 'contact' && t.nav.contact}
              {' - '}{t.brand}
            </div>
            <div class="title-bar-controls">
              <button aria-label="Minimize"></button>
              <button aria-label="Maximize"></button>
              <button aria-label="Close"></button>
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
