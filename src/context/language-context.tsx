import { createContext, ReactNode, useContext, useState } from 'react';
import { LocalStorage } from '../services/local-storage.ts';
import { LSK_CONSTANT } from '../core/local-storage.ts';

const storage = new LocalStorage(LSK_CONSTANT.LANGUAGE_CTX);

const LSK_KEYS = {
  LANGUAGE: 'language',
};

export type LanguageContextType = {
  language: string;
  updateLanguage: (language: string) => void;
  storage: LocalStorage;
}

interface Props {
  children?: ReactNode;
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
    const lang = storage.getString(LSK_KEYS.LANGUAGE);
    if (lang) {
      return lang;
    }

    return getDefaultLanguage();
  }

  function updateLanguage(lang: string) {
    // noinspection SuspiciousTypeOfGuard runtime garbage check
    if (typeof lang === 'string') {
      storage.setString(LSK_KEYS.LANGUAGE, lang);

      setLanguage(lang);
    }
  }

  return (
    <LanguageContext.Provider
      value={{
        language,
        updateLanguage,
        storage,
      }}
      children={children}
    ></LanguageContext.Provider>
  );
};

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('context must be used within LanguageContext');
  }

  return context;
}
