import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { IntlProvider } from 'react-intl';
import styles from './app.module.scss';
import { useLanguage } from './context/language-context.tsx';
import { TopNavigation } from './components/top-navigation/top-navigation.tsx';
import { LanguageChanger } from './components/language-changer/language-changer.tsx';
import { Home } from './features/home/views/home.tsx';
import { Resume } from './features/resume/views/resume/resume.tsx';
import { Projects } from './features/projects/views/projects.tsx';
import { Contact } from './features/contact/views/contact/contact.tsx';
import { NotFound } from './features/not-found/not-found.tsx';
import { Footer } from './components/footer/footer.tsx';
import { BackgroundMusic } from './components/background-music/background-music.tsx';

const daTranslations = new URL('../assets/i18n/locales/da.json', import.meta.url);
const enTranslations = new URL('../assets/i18n/locales/en.json', import.meta.url);

export function App() {
  const languageContext = useLanguage();
  const [messages, setMessages] = useState();
  const defaultLang = 'en';

  const fetchTranslation = async (url: string) => {
    return new Promise((resolve, reject) => {
      fetch(url)
        .then(res => res.json())
        .then((res) => resolve(res))
        .catch(reject);
    })
  }

  useEffect(() => {
    (async () => {
      const lang = languageContext?.language ?? defaultLang;

      if (lang === 'da') {
        setMessages(await fetchTranslation(daTranslations.href) as unknown as any)
      } else {
        setMessages(await fetchTranslation(enTranslations.href) as unknown as any)
      }
    })();
  }, [languageContext?.language]);

  // prevents issue where react-intl has no messages available
  if (!languageContext?.language || !messages) {
    return <></>;
  }

  return (
    <IntlProvider locale={languageContext.language} defaultLocale={defaultLang} messages={messages}>
      <nav>
        <TopNavigation/>

        <LanguageChanger/>
      </nav>

      <main className={styles.main}>
        <Routes>
          <Route path="/" element={<Home/>}></Route>
          <Route path="/resume" element={<Resume/>}></Route>
          <Route path="/projects" element={<Projects/>}></Route>
          <Route path="/contact" element={<Contact/>}></Route>

          <Route path="*" element={<NotFound/>}/>
        </Routes>
      </main>

      <footer>
        <Footer/>

        <div className="d-flex justify-center">
          <BackgroundMusic/>
        </div>
      </footer>
    </IntlProvider>
  );
}
