import { useLanguage } from '../../context/language-context';
import { type Page } from '../../shared/types';

type HomeProps = {
  onNavigate: (page: Page) => void;
};

export function Home({ onNavigate }: HomeProps) {
  const { t } = useLanguage();

  return (
    <main style="padding: 16px;">
      <h1>{t.home.title}</h1>
      <p><strong>{t.home.subtitle}</strong></p>
      <p>{t.home.byline}</p>

      <section>
        <h2>{t.home.who}</h2>
        <p style="white-space: pre-wrap;">{t.home.content}</p>
      </section>

      <nav data-nosnippet style="margin-top: 20px; display: flex; gap: 10px;">
        <button onClick={() => onNavigate('projects')}>{t.home.viewProjects}</button>
        <button onClick={() => onNavigate('resume')}>{t.home.viewResume}</button>
      </nav>
    </main>
  );
}
