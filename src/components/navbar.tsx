import { useLanguage } from '../context/language-context';
import { type Page } from '../shared/types';

type NavbarProps = {
  currentPage: Page;
  onNavigate: (page: Page) => void;
};

export function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const { t } = useLanguage();

  const tabs: { id: Page; label: string }[] = [
    { id: 'home', label: t.nav.home },
    { id: 'projects', label: t.nav.projects },
    { id: 'resume', label: t.nav.resume },
    { id: 'contact', label: t.nav.contact },
  ];

  return (
    <menu role="tablist" style="margin: 0; padding: 4px 4px 0 4px;">
      {tabs.map((tab) => (
        <li
          role="tab"
          aria-selected={currentPage === tab.id}
          style={currentPage === tab.id ? { background: '#fff', borderBottom: '2px solid #fff' } : {}}
        >
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onNavigate(tab.id);
            }}
            style={currentPage === tab.id ? { color: '#000' } : {}}
          >
            {tab.label}
          </a>
        </li>
      ))}
    </menu>
  );
}
