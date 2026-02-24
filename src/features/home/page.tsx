import { useLanguage } from '../../context/language-context';
import { type Page } from '../../shared/types';

type HomeProps = {
  onNavigate: (page: Page) => void;
};

export function Home({ onNavigate }: HomeProps) {
  const { t } = useLanguage();

  return (
    <div style="padding: 16px;">
      <h1>{t.home.title}</h1>
      <p><strong>{t.home.subtitle}</strong></p>
      <p>{t.home.byline}</p>

      <h3>{t.home.who}</h3>
      <pre style="white-space: pre-wrap; font-family: inherit;">{t.home.content}</pre>

      <div style="margin-top: 20px; display: flex; gap: 10px;">
        <button onClick={() => onNavigate('projects')}>{t.home.viewProjects}</button>
        <button onClick={() => onNavigate('resume')}>{t.home.viewResume}</button>
      </div>
    </div>
  );
}
