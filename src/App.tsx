import { useContext, useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { IntlProvider } from 'react-intl';
import './App.css';

import { TopNavigation } from '@/components/top-navigation/top-navigation.tsx';
import { LanguageContext } from '@/context/language/language-context.tsx';
import { LanguageChanger } from '@/components/language-changer/language-changer.tsx';
import { BackgroundMusic } from '@/components/background-music/background-music.tsx';
import { Footer } from '@/components/footer/footer.tsx';
import { Home } from '@/features/home/views/home.tsx';
import { Resume } from '@/features/resume/views/resume';
import { Projects } from '@/features/projects/views/projects.tsx';
import { Contact } from '@/features/contact/views/contact/contact.tsx';
import { NotFound } from '@/features/not-found/not-found.tsx';

export function App() {
  const languageContext = useContext(LanguageContext);
  const [messages, setMessages] = useState();
  const defaultLang = 'en';

  useEffect(() => {
    const lang = languageContext?.language ?? defaultLang;

    import(`./i18n/locales/${lang}.json`)
      .then((res) => {
        setMessages(res.data);
      });
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

      <main>
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
