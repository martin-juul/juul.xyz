import { useLanguage } from '../context/language-context';

function ResumeItemWindow({ item }: { item: {
  id: number;
  title: string;
  company: string;
  logo: string;
  duration: { start: string; end: string };
  highlights: string[];
}}) {
  return (
    <div class="window" style="width: 100%; margin-top: 10px;">
      <div class="title-bar">
        <div class="title-bar-text">{item.title}</div>
      </div>
      <div class="window-body">
        <div style="display: flex; gap: 12px; align-items: flex-start;">
          <img
            src={`/${item.logo}`}
            alt={`${item.company} logo`}
            style="width: 48px; height: 48px; object-fit: contain; flex-shrink: 0;"
          />
          <div style="flex: 1;">
            <p style="margin: 0;"><strong>{item.company}</strong> - {item.duration.start} - {item.duration.end}</p>
            <ul style="margin-top: 8px; padding-left: 20px;">
              {item.highlights.map((highlight, index) => (
                <li key={index} style="margin-bottom: 4px;">{highlight}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Resume() {
  const { t } = useLanguage();
  const { items } = t.resume;

  const currentItem = items.find(item => item.duration.end === 'Current' || item.duration.end === 'Nuværende');
  const previousItems = items.filter(item => item !== currentItem);

  return (
    <div style="padding: 16px;">
      <h1>{t.resume.title}</h1>

      {currentItem && (
        <div style="margin-top: 20px;">
          <h3>{t.resume.current}</h3>
          <ResumeItemWindow item={currentItem} />
        </div>
      )}

      {previousItems.length > 0 && (
        <div style="margin-top: 20px;">
          <h3>{t.resume.previous}</h3>
          {previousItems.map((item) => (
            <ResumeItemWindow key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
