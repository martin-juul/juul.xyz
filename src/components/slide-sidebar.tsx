import { useLanguage } from '../context/language-context';

type SlideSidebarProps = {
  currentIndex: number;
  onSelectSlide: (index: number) => void;
};

export function SlideSidebar({ currentIndex, onSelectSlide }: SlideSidebarProps) {
  const { t } = useLanguage();
  const projects = t.projects.items;

  return (
    <div class="ppt-slide-sidebar">
      <div class="ppt-sidebar-header">
        <span>Slides</span>
      </div>
      <div class="ppt-slide-thumbnails">
        {projects.map((project, index) => (
          <div
            class={`ppt-slide-thumbnail ${index === currentIndex ? 'active' : ''}`}
            onClick={() => onSelectSlide(index)}
          >
            <div class="ppt-thumbnail-number">{index + 1}</div>
            <div class="ppt-thumbnail-preview">
              <div class="ppt-thumbnail-title">{project.name}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
