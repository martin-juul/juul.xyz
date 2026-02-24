import { useLanguage } from '../context/language-context';

export function Projects() {
  const { t } = useLanguage();

  return (
    <div style="padding: 16px;">
      <h1>{t.projects.title}</h1>
      <p><strong>{t.projects.subtitle}</strong></p>

      <div style="margin-top: 20px;">
        {t.projects.items.map((project) => (
          <div key={project.id} class="field-row-stacked" style="margin-bottom: 16px;">
            <div class="window" style="width: 100%;">
              <div class="title-bar">
                <div class="title-bar-text">
                  <a href={project.url} target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: none;">
                    {project.name}
                  </a>
                </div>
              </div>
              <div class="window-body">
                <p>{project.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
