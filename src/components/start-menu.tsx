import { useLanguage } from '../context/language-context';

type Page = 'home' | 'projects' | 'resume' | 'contact';

type StartMenuProps = {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: Page) => void;
};

export function StartMenu({ isOpen, onClose, onNavigate }: StartMenuProps) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  const handleNavigate = (page: Page) => {
    onNavigate(page);
    onClose();
  };

  return (
    <>
      <div class="start-menu-overlay" onClick={onClose} />
      <div class="start-menu">
        <div class="start-menu-sidebar">
          <span class="start-menu-brand">
            Martin<span class="start-menu-brand-suffix">98</span>
          </span>
        </div>
        <div class="start-menu-items">
          <button class="start-menu-item" onClick={() => handleNavigate('home')}>
            <span class="start-menu-icon">
              <img src="/assets/icons/home.png" alt="" />
            </span>
            <span class="start-menu-item-title">{t.nav.home}</span>
          </button>
          <div class="start-menu-separator" />
          <button class="start-menu-item" onClick={() => handleNavigate('projects')}>
            <span class="start-menu-icon">
              <img src="/assets/icons/folder.png" alt="" />
            </span>
            <span class="start-menu-item-title">{t.nav.projects}</span>
          </button>
          <button class="start-menu-item" onClick={() => handleNavigate('resume')}>
            <span class="start-menu-icon">
              <img src="/assets/icons/document.png" alt="" />
            </span>
            <span class="start-menu-item-title">{t.nav.resume}</span>
          </button>
          <div class="start-menu-separator" />
          <button class="start-menu-item" onClick={() => handleNavigate('contact')}>
            <span class="start-menu-icon">
              <img src="/assets/icons/mail.png" alt="" />
            </span>
            <span class="start-menu-item-title">{t.nav.contact}</span>
          </button>
        </div>
      </div>
    </>
  );
}
