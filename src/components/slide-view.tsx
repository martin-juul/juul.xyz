import { useLanguage } from '../context/language-context';

type SlideViewProps = {
  project: {
    id: number;
    name: string;
    url: string;
    description: string;
  };
  slideNumber: number;
  totalSlides: number;
  isTransitioning: boolean;
  transitionDirection: 'left' | 'right' | null;
};

export function SlideView({ project, slideNumber, totalSlides, isTransitioning, transitionDirection }: SlideViewProps) {
  const { t } = useLanguage();

  return (
    <div class="ppt-slide-area">
      <div class="ppt-slide-container">
        <div
          class={`ppt-slide ${isTransitioning ? 'transitioning' : ''} ${transitionDirection ? `slide-${transitionDirection}` : ''}`}
        >
          <div class="ppt-slide-content">
            <h1 class="ppt-slide-title">{project.name}</h1>
            <div class="ppt-slide-body">
              <p class="ppt-slide-description">{project.description}</p>
              <div class="ppt-slide-link">
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="ppt-link-button"
                >
                  Visit Project
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
