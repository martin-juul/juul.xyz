import { useState, useCallback } from 'preact/hooks';

type WordToolbarProps = {
  onFontSizeChange?: (size: string) => void;
  onBold?: () => void;
  onItalic?: () => void;
  onUnderline?: () => void;
  onPrint?: () => void;
  onSave?: () => void;
};

const FONT_SIZES = ['8', '9', '10', '11', '12', '14', '16', '18', '20', '22', '24', '26', '28', '36', '48', '72'];
const DEFAULT_SIZE = '12';

export function WordToolbar({
  onFontSizeChange,
  onBold,
  onItalic,
  onUnderline,
  onPrint,
  onSave
}: WordToolbarProps) {
  const [fontSize, setFontSize] = useState(DEFAULT_SIZE);

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave();
    } else {
      const link = document.createElement('a');
      link.href = window.location.href;
      link.download = 'document.html';
      link.click();
    }
  };

  const handleFontSizeChange = useCallback((e: Event) => {
    const target = e.target as HTMLSelectElement;
    const size = target.value;
    setFontSize(size);
    if (onFontSizeChange) {
      onFontSizeChange(size);
    }
  }, [onFontSizeChange]);

  return (
    <div class="word-toolbar" data-nosnippet>
      {/* Menu Bar */}
      <div class="word-menu-bar">
        <span class="word-menu-item">File</span>
        <span class="word-menu-item">Edit</span>
        <span class="word-menu-item">View</span>
        <span class="word-menu-item">Insert</span>
        <span class="word-menu-item">Format</span>
        <span class="word-menu-item">Tools</span>
        <span class="word-menu-item">Table</span>
        <span class="word-menu-item">Window</span>
        <span class="word-menu-item">Help</span>
      </div>

      {/* Standard Toolbar */}
      <div class="word-standard-toolbar">
        <button class="word-toolbar-btn" title="New">
          <img src="/assets/toolbar/new.png" alt="New" class="word-icon-img" />
        </button>
        <button class="word-toolbar-btn" title="Open">
          <img src="/assets/toolbar/open.png" alt="Open" class="word-icon-img" />
        </button>
        <button class="word-toolbar-btn" title="Save" onClick={handleSave}>
          <img src="/assets/toolbar/save.png" alt="Save" class="word-icon-img" />
        </button>
        <div class="word-toolbar-separator"></div>
        <button class="word-toolbar-btn" title="Print" onClick={handlePrint}>
          <img src="/assets/toolbar/print.png" alt="Print" class="word-icon-img" />
        </button>
        <button class="word-toolbar-btn" title="Print Preview">
          <img src="/assets/toolbar/preview.png" alt="Preview" class="word-icon-img" />
        </button>
        <div class="word-toolbar-separator"></div>
        <button class="word-toolbar-btn" title="Cut">
          <span class="word-icon-text">✂</span>
        </button>
        <button class="word-toolbar-btn" title="Copy">
          <img src="/assets/toolbar/copy.png" alt="Copy" class="word-icon-img" />
        </button>
        <button class="word-toolbar-btn" title="Paste">
          <span class="word-icon-text">📋</span>
        </button>
        <button class="word-toolbar-btn" title="Format Painter">
          <span class="word-icon-text">🖌</span>
        </button>
        <div class="word-toolbar-separator"></div>
        <button class="word-toolbar-btn" title="Undo">
          <span class="word-icon-text">↩</span>
        </button>
        <button class="word-toolbar-btn" title="Redo">
          <span class="word-icon-text">↪</span>
        </button>
        <div class="word-toolbar-separator"></div>
        <button class="word-toolbar-btn" title="Insert Hyperlink">
          <img src="/assets/toolbar/link.png" alt="Link" class="word-icon-img" />
        </button>
        <button class="word-toolbar-btn" title="Tables and Borders">
          <span class="word-icon-text">⊞</span>
        </button>
        <button class="word-toolbar-btn" title="Insert Table">
          <span class="word-icon-text">▦</span>
        </button>
      </div>

      {/* Formatting Toolbar */}
      <div class="word-format-toolbar">
        <select class="word-font-select" disabled>
          <option>Times New Roman</option>
        </select>
        <select
          class="word-size-select"
          value={fontSize}
          onChange={handleFontSizeChange}
        >
          {FONT_SIZES.map(size => (
            <option value={size} selected={size === fontSize}>{size}</option>
          ))}
        </select>
        <div class="word-toolbar-separator"></div>
        <button class="word-toolbar-btn" title="Bold" onClick={onBold}>
          <span class="word-icon-text word-icon-bold">B</span>
        </button>
        <button class="word-toolbar-btn" title="Italic" onClick={onItalic}>
          <span class="word-icon-text word-icon-italic">I</span>
        </button>
        <button class="word-toolbar-btn" title="Underline" onClick={onUnderline}>
          <span class="word-icon-text word-icon-underline">U</span>
        </button>
        <div class="word-toolbar-separator"></div>
        <button class="word-toolbar-btn" title="Align Left">
          <span class="word-icon-text">≡</span>
        </button>
        <button class="word-toolbar-btn" title="Center">
          <span class="word-icon-text">☰</span>
        </button>
        <button class="word-toolbar-btn" title="Align Right">
          <span class="word-icon-text">≡</span>
        </button>
        <button class="word-toolbar-btn" title="Justify">
          <span class="word-icon-text">☰</span>
        </button>
        <div class="word-toolbar-separator"></div>
        <button class="word-toolbar-btn" title="Numbering">
          <span class="word-icon-text">1.</span>
        </button>
        <button class="word-toolbar-btn" title="Bullets">
          <span class="word-icon-text">•</span>
        </button>
        <button class="word-toolbar-btn" title="Decrease Indent">
          <span class="word-icon-text">←</span>
        </button>
        <button class="word-toolbar-btn" title="Increase Indent">
          <span class="word-icon-text">→</span>
        </button>
        <div class="word-toolbar-separator"></div>
        <button class="word-toolbar-btn" title="Font Color">
          <span class="word-icon-text" style="color: red;">A</span>
        </button>
        <button class="word-toolbar-btn" title="Highlight">
          <span class="word-icon-text" style="background: yellow;">✎</span>
        </button>
      </div>

      {/* Horizontal Ruler */}
      <div class="word-ruler-horizontal">
        <div class="word-ruler-indent-left"></div>
        <div class="word-ruler-scale">
          {Array.from({ length: 20 }, (_, i) => (
            <span class="word-ruler-tick" style={`left: ${i * 36}px`}>{i + 1}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
