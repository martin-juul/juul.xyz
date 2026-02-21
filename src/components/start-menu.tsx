import { useLanguage } from '../context/language-context';

type Page = 'home' | 'projects' | 'resume' | 'contact' | 'notfound';

type StartMenuProps = {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: Page) => void;
  openWindowPages: Page[];
};

export function StartMenu({ isOpen, onClose, onNavigate, openWindowPages }: StartMenuProps) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  const handleNavigate = (page: Page) => {
    onNavigate(page);
    onClose();
  };

  const menuItems = [
    { page: 'home' as Page, icon: '/assets/icons/home.png' },
    { page: 'projects' as Page, icon: '/assets/icons/folder.png' },
    { page: 'resume' as Page, icon: '/assets/icons/document.png' },
    { page: 'contact' as Page, icon: '/assets/icons/mail.png' },
  ];

  const getPageLabel = (page: Page) => {
    switch (page) {
      case 'home': return t.nav.home;
      case 'projects': return t.nav.projects;
      case 'resume': return t.nav.resume;
      case 'contact': return t.nav.contact;
    }
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
          {menuItems.map((item, index) => (
            <>
              <button
                class={`start-menu-item ${openWindowPages.includes(item.page) ? 'start-menu-item-open' : ''}`}
                onClick={() => handleNavigate(item.page)}
              >
                <span class="start-menu-icon">
                  <img src={item.icon} alt="" />
                </span>
                <span class="start-menu-item-title">{getPageLabel(item.page)}</span>
              </button>
              {index === 0 && <div class="start-menu-separator" />}
              {index === 2 && <div class="start-menu-separator" />}
            </>
          ))}
        </div>
      </div>
    </>
  );
}
