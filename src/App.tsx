import React, { useContext, useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { IntlProvider } from 'react-intl';
import './App.css';

import { LanguageContext } from './context/language';

import { TopNavigation } from './components/top-navigation';
import { LanguageChanger } from './components/language-changer';
import { Footer } from './components/footer';

import { Resume } from './features/resume/views/resume';
import { Contact } from './features/contact/views/contact';
import { Home } from './features/home/views';
import { NotFound } from './features/not-found/not-found';
import { BackgroundMusic } from './components/background-music';
import { Projects } from './features/projects/views/projects';

export function App() {
  const languageContext = useContext(LanguageContext);
  const [messages, setMessages] = useState();
  const defaultLang = 'en';

  useEffect(() => {
    const lang = languageContext?.language ?? defaultLang;

    const messages = require(`./i18n/locales/${lang}.json`);
    setMessages(messages);
  }, [languageContext?.language]);

  // prevents issue where react-intl has no messages available
  if (!languageContext?.language || !messages) {
    return <></>
  }

  return (
    <IntlProvider locale={languageContext.language} defaultLocale={defaultLang} messages={messages}>
      <nav>
        <TopNavigation/>

        <LanguageChanger />
      </nav>

      <main>
        <Routes>
          <Route path="/" element={<Home/>}></Route>
          <Route path="/resume" element={<Resume/>}></Route>
          <Route path="/projects" element={<Projects />}></Route>
          <Route path="/contact" element={<Contact/>}></Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <footer>
        <Footer/>

        <div className="d-flex justify-center">
          <BackgroundMusic />
        </div>
      </footer>
    </IntlProvider>
  );
}
