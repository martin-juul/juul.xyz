import { useState, useEffect, useCallback } from 'preact/hooks';
import { useLanguage } from '../../context/language-context';
import { useStatus } from '../../context/status-context';
import { PowerPointToolbar } from './components/PowerPointToolbar';
import { SlideSidebar } from './components/SlideSidebar';
import { SlideView } from './components/SlideView';

export function Projects() {
  const { t } = useLanguage();
  const { setStatusText } = useStatus();
  const projects = t.projects.items;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<'left' | 'right' | null>(null);

  // Update status bar with slide info
  useEffect(() => {
    setStatusText(`Slide ${currentSlide + 1} of ${projects.length}    Use arrow keys to navigate`);
    return () => setStatusText('');
  }, [currentSlide, projects.length, setStatusText]);

  const goToSlide = useCallback((index: number, direction: 'left' | 'right') => {
    if (isTransitioning || index === currentSlide) return;
    if (index < 0 || index >= projects.length) return;

    setTransitionDirection(direction);
    setIsTransitioning(true);

    setTimeout(() => {
      setCurrentSlide(index);
      setTimeout(() => {
        setIsTransitioning(false);
        setTransitionDirection(null);
      }, 50);
    }, 200);
  }, [isTransitioning, currentSlide, projects.length]);

  const nextSlide = useCallback(() => {
    goToSlide(currentSlide + 1, 'left');
  }, [currentSlide, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide(currentSlide - 1, 'right');
  }, [currentSlide, goToSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'Home') {
        e.preventDefault();
        goToSlide(0, 'right');
      } else if (e.key === 'End') {
        e.preventDefault();
        goToSlide(projects.length - 1, 'left');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide, goToSlide, projects.length]);

  return (
    <div class="ppt-container">
      {/* PowerPoint Toolbar */}
      <PowerPointToolbar />

      {/* Main Content Area */}
      <div class="ppt-main">
        {/* Slide Sidebar */}
        <SlideSidebar
          currentIndex={currentSlide}
          onSelectSlide={(index) => goToSlide(index, index > currentSlide ? 'left' : 'right')}
        />

        {/* Slide View */}
        <SlideView
          project={projects[currentSlide]}
          isTransitioning={isTransitioning}
          transitionDirection={transitionDirection}
        />
      </div>
    </div>
  );
}
