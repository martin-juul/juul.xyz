import { render } from 'preact';
import { App } from './app';
import './index.css';
import '98.css';
import { injectSpeedInsights } from '@vercel/speed-insights';

injectSpeedInsights();

render(<App />, document.getElementById('app')!);
