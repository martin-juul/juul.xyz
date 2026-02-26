import { useState } from 'preact/hooks';
import { useLanguage } from '../../context/language-context';

export function Resume() {
  const { t } = useLanguage();
  const { items } = t.resume;
  const [selectedId, setSelectedId] = useState(items[0]?.id);

  const selectedItem = items.find(item => item.id === selectedId) || items[0];

  return (
    <main style="display: flex; height: 100%; background: url('/assets/sky.webp') center center / cover no-repeat;">
      {/* Left sidebar - navigation, not main content */}
      <nav data-nosnippet style={{
        width: "180px",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0
      }}>
        {/* Header with brand */}
        <div style="margin-bottom: 20px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
            <img src="/assets/icons/briefcase.png" alt="" style="width: 24px; height: 24px;" />
            <span style="font-size: 11px; font-weight: bold; color: #000080;">Resume</span>
          </div>
        </div>
        {/* Navigation links */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {items.map((item, index) => {
            const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12'];
            const borderColor = colors[index % colors.length];
            return (
              <button
                onClick={() => setSelectedId(item.id)}
                aria-pressed={selectedId === item.id}
                style={{
                  background: selectedId === item.id ? '#000080' : 'transparent',
                  color: selectedId === item.id ? '#fff' : '#000080',
                  padding: '4px 8px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontFamily: "'MS Sans Serif', 'Segoe UI', sans-serif",
                  fontWeight: 600,
                  borderLeft: `2px solid ${borderColor}`,
                  borderBottom: '1px solid #4a3728',
                  textAlign: 'left',
                  width: '100%'
                }}
              >
                {item.title}
              </button>
            );
          })}
        </div>
      </nav>
      {/* Right content area */}
      <article style="flex: 1; padding: 16px; overflow-y: auto;">
        {selectedItem && (
          <>
            <h2 style="margin: 0 0 12px 0; font-size: 14px; color: #000080; fontWeight: bold;">
              {selectedItem.title}
            </h2>
            <header style="display: flex; align-items: flex-start; gap: 16px; margin-bottom: 16px;">
              <img
                src={`/${selectedItem.logo}`}
                alt={`${selectedItem.company} logo`}
                style="width: 48px; height: 48px; object-fit: contain;"
              />
              <div>
                <div style="font-size: 12px; font-weight: bold; color: #000080;">{selectedItem.company}</div>
                <div style="font-size: 11px; color: #000; margin-top: 2px;">
                  {selectedItem.duration.start} - {selectedItem.duration.end}
                </div>
              </div>
            </header>
            <ul style="margin: 0; padding-left: 20px; font-size: 11px; color: #000;">
              {selectedItem.highlights.map((highlight, index) => (
                <li key={index} style="margin-bottom: 6px;">{highlight}</li>
              ))}
            </ul>
          </>
        )}
      </article>
    </main>
  );
}
