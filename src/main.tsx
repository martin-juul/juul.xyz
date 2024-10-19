import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import posthog from 'posthog-js';

import 'thesims.css';
import './index.css';
import { App } from './app.tsx';
import { LanguageContextProvider } from './context/language-context.tsx';

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

// console.log(`
//   So you like exploring? You're in untested territory. If you edit values manually then it's on you. 🤭
//   I recommend you install React Dev Tools in your browser.
//   The contact form is using https://pageclip.co/ - if you try to pentest it, then report bugs to them.
//   My website is hosted on https://vercel.com - any server related things you should report to them.
//   Otherwise if you happen to find a bug, please do open an issue on my repository at https://github.com/martin-juul/juul.xyz/issues
//
//   Anything else? Use the contact form.
//   Best regards, Martin.
// `);
