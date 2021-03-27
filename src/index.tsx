import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { App } from './App';
import { reportWebVitals } from './reportWebVitals';
import * as serviceWorker from './serviceWorker';
import { event, initialize } from 'react-ga';
import { config } from './config';
import { Metric } from 'web-vitals';

initialize(config.GA_ID, {
  debug: config.isDev,
});

ReactDOM.render(
  <React.StrictMode>
    <App/>
  </React.StrictMode>,
  document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorker.register();

const onPerfEntry = (metric: Metric) => {
  if (metric.isFinal) {
    metric.value = Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value);
  }

  event({
    category: 'Web Vitals',
    action: metric.name,
    label: metric.id,
    value: metric.value,
  });
};

reportWebVitals(onPerfEntry);
