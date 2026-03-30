import { render } from 'preact';
import { App } from './app';
import './index.css';
import '98.css';
import { initSpeedInsights } from './lib/speed-insights';

initSpeedInsights();

render(<App />, document.getElementById('app')!);
