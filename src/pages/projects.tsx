import { useLanguage } from '../context/language-context';

export function Projects() {
  const { t } = useLanguage();

  return (
    <div style="padding: 16px;">
      <h1>{t.projects.title}</h1>
      <p><strong>{t.projects.subtitle}</strong></p>

      <div style="margin-top: 20px;">
        <div class="field-row-stacked" style="margin-bottom: 16px;">
          <div class="window" style="width: 100%;">
            <div class="title-bar">
              <div class="title-bar-text">Project 1</div>
            </div>
            <div class="window-body">
              <p>A cool project description goes here.</p>
            </div>
          </div>
        </div>

        <div class="field-row-stacked" style="margin-bottom: 16px;">
          <div class="window" style="width: 100%;">
            <div class="title-bar">
              <div class="title-bar-text">Project 2</div>
            </div>
            <div class="window-body">
              <p>Another awesome project description.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
