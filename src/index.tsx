import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import * as Sentry from '@sentry/react';
import posthog from 'posthog-js';

import 'thesims.css';
import './index.css';
import { App } from './App';
import reportWebVitals from './reportWebVitals';
import { LanguageContextProvider } from './context/language';

Sentry.init({
  dsn: 'https://1af453b06b2d43a19604ede64efd2566@o132444.ingest.sentry.io/4505013809446912',
  integrations: [new Sentry.BrowserTracing(), new Sentry.Replay()],
  // Performance Monitoring
  tracesSampleRate: 0.2,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

posthog.init('phc_mlpYurB5mofwSLTNuzvsQhPPzQHL7O3QGfvWSmwUWgl', {
  api_host: 'https://eu.posthog.com',
  persistence: 'localStorage',
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <LanguageContextProvider>
          <App/>
        </LanguageContextProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>,
);

console.log(`
  So you like exploring? You're in untested territory. If you edit values manually then it's on you. 🤭
  I recommend you install React Dev Tools in your browser.
  The contact form is using https://pageclip.co/ - if you try to pentest it, then report bugs to them.
  My website is hosted on https://vercel.com - any server related things you should report to them.
  Otherwise if you happen to find a bug, please do open an issue on my repository at https://github.com/martin-juul/juul.xyz/issues

  Anything else? Use the contact form.
  Best regards, Martin.
`);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
