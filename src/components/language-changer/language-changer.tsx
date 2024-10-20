import { useState } from 'react';
import './language-changer.css';
import { useLanguage } from '../../context/language-context.tsx';

export function LanguageChanger() {
  const languageContext = useLanguage();
  const [currentLanguage, setCurrentLanguage] = useState(languageContext?.language ?? 'en');

  function changeLanguage(language: string) {
    languageContext?.updateLanguage(language);
    setCurrentLanguage(language);
    document.documentElement.lang = language;
  }

  return (
    <div className="d-flex justify-center language-changer">
      <span
        className={`clickable ${currentLanguage === 'da' ? "active" : ""}`}
        onClick={() => changeLanguage('da')}
      >DA</span>

      <div className="vertical-line ml-1 mr-1"/>

      <span
        className={`clickable ${currentLanguage === 'en' ? "active" : ""}`}
        onClick={() => changeLanguage('en')}
      >EN</span>
    </div>
  );
}
