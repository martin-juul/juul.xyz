import { useLanguage } from '../context/language-context';

type FooterProps = {
  isLoading: boolean;
  loadProgress: number;
};

export function Footer({ isLoading, loadProgress }: FooterProps) {
  const { t } = useLanguage();

  return (
    <div class="status-bar">
      <p class="status-bar-field">{isLoading ? `Loading... ${Math.round(loadProgress)}%` : t.footer.builtWith}</p>
    </div>
  );
}
