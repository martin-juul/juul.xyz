import { useState, useRef, useEffect } from 'preact/hooks';
import { useLanguage } from '../context/language-context';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSelect = (lang: string) => {
    setLanguage(lang);
    setIsOpen(false);
  };

  return (
    <div class="tray-language" ref={ref}>
      <button
        class="tray-language-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        {language.toUpperCase()}
      </button>
      {isOpen && (
        <div class="tray-menu">
          <button
            class={`tray-menu-item ${language === 'en' ? 'active' : ''}`}
            onClick={() => handleSelect('en')}
          >
            <span class="tray-menu-check">{language === 'en' ? '✓' : ''}</span>
            English
          </button>
          <button
            class={`tray-menu-item ${language === 'da' ? 'active' : ''}`}
            onClick={() => handleSelect('da')}
          >
            <span class="tray-menu-check">{language === 'da' ? '✓' : ''}</span>
            Dansk
          </button>
        </div>
      )}
    </div>
  );
}
