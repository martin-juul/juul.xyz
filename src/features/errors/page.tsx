import { useLanguage } from '../../context/language-context';

export function NotFound() {
  const { t } = useLanguage();

  return (
    <div class="not-found-page" style="padding: 40px; text-align: center;">
      <h1 style="font-size: 24px; margin-bottom: 16px;">{t.notFound.title}</h1>
      <p style="font-size: 14px; margin-bottom: 24px;">{t.notFound.message}</p>
      <p style="font-size: 12px; color: #808080;">
        {t.notFound.hint}
      </p>
    </div>
  );
}
