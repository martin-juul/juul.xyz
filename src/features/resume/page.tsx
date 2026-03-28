import { useState, useEffect } from 'preact/hooks';
import { useLanguage } from '../../context/language-context';
import { isCurrentItem } from './data';

export function Resume() {
  const { t, currentSubPath, navigateTo, currentPage } = useLanguage();
  const { items, current, previous } = t.resume;

  // Find item by slug, fallback to first item
  const findItemBySlug = (slug: string | undefined) => {
    if (!slug) return null;
    return items.find(item => item.slug === slug);
  };

  const [selectedId, setSelectedId] = useState<number>(() => {
    const item = findItemBySlug(currentSubPath);
    return item?.id ?? items[0]?.id;
  });

  // Sync with URL subPath changes (e.g., browser back/forward)
  useEffect(() => {
    const item = findItemBySlug(currentSubPath);
    if (item && item.id !== selectedId) {
      setSelectedId(item.id);
    } else if (!item && currentSubPath && items.length > 0) {
      // Invalid slug - redirect to first item
      setSelectedId(items[0].id);
      navigateTo(currentPage, items[0].slug, true);
    }
  }, [currentSubPath]);

  const selectedItem = items.find(item => item.id === selectedId) || items[0];

  // Update URL when selection changes
  const handleSelect = (item: typeof items[0]) => {
    setSelectedId(item.id);
    navigateTo(currentPage, item.slug);
  };

  // Group items into current and previous
  const currentItems = items.filter(item => isCurrentItem(item, current));
  const previousItems = items.filter(item => !isCurrentItem(item, current));

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
            <span style="font-size: 11px; font-weight: bold; color: #000080;">{t.resume.title}</span>
          </div>
        </div>
        {/* Navigation links grouped by section */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Current section */}
          {currentItems.length > 0 && (
            <div>
              <div style={{
                fontSize: "10px",
                fontWeight: "bold",
                color: "#000080",
                marginBottom: "4px",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>
                {current}
              </div>
              {currentItems.map((item, index) => {
                const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12'];
                const borderColor = colors[index % colors.length];
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item)}
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
                    {item.company}
                  </button>
                );
              })}
            </div>
          )}
          {/* Previous section */}
          {previousItems.length > 0 && (
            <div>
              <div style={{
                fontSize: "10px",
                fontWeight: "bold",
                color: "#000080",
                marginBottom: "4px",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>
                {previous}
              </div>
              {previousItems.map((item, index) => {
                const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12'];
                const borderColor = colors[(index + currentItems.length) % colors.length];
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item)}
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
                    {item.company}
                  </button>
                );
              })}
            </div>
          )}
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
