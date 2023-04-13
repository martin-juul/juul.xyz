import React, { createContext, useState } from 'react';
import { LanguageContextType } from './type';
import { LOCAL_STORAGE_KEY } from './constants';

interface Props {
  children: JSX.Element | JSX.Element[];
}

export const LanguageContext = createContext<LanguageContextType | null>(null);
LanguageContext.displayName = 'LanguageContext';

export const LanguageContextProvider = ({ children }: Props) => {
  const [language, setLanguage] = useState<string>(getLanguage());

  /**
   * The application only supports 'da' and 'en'
   */
  function getDefaultLanguage() {
    if (navigator.language === 'da') {
      return 'da';
    }

    return 'en';
  }

  function getLanguage() {
    const lang = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (lang) {
      return lang;
    }

    return getDefaultLanguage();
  }

  function updateLanguage(lang: string) {
    // noinspection SuspiciousTypeOfGuard runtime garbage check
    if (typeof lang === 'string') {
      localStorage.setItem(LOCAL_STORAGE_KEY, lang);
      setLanguage(lang);
    }
  }

  return (
    <LanguageContext.Provider
      value={{ language, updateLanguage }}
     children={children}
    ></LanguageContext.Provider>
  )
}