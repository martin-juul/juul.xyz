type PowerPointToolbarProps = {
  onPrint?: () => void;
  onSave?: () => void;
};

export function PowerPointToolbar({ onPrint, onSave }: PowerPointToolbarProps) {
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
      // Trigger save dialog
      const link = document.createElement('a');
      link.href = window.location.href;
      link.download = 'projects.html';
      link.click();
    }
  };

  return (
    <div class="powerpoint-toolbar">
      {/* Menu Bar */}
      <div class="ppt-menu-bar">
        <span class="ppt-menu-item">File</span>
        <span class="ppt-menu-item">Edit</span>
        <span class="ppt-menu-item">View</span>
        <span class="ppt-menu-item">Insert</span>
        <span class="ppt-menu-item">Format</span>
        <span class="ppt-menu-item">Tools</span>
        <span class="ppt-menu-item">Slide Show</span>
        <span class="ppt-menu-item">Window</span>
        <span class="ppt-menu-item">Help</span>
      </div>

      {/* Standard Toolbar */}
      <div class="ppt-standard-toolbar">
        <button class="ppt-toolbar-btn" title="New">
          <img src="/assets/toolbar/new.png" alt="New" class="ppt-icon-img" />
        </button>
        <button class="ppt-toolbar-btn" title="Open">
          <img src="/assets/toolbar/open.png" alt="Open" class="ppt-icon-img" />
        </button>
        <button class="ppt-toolbar-btn" title="Save" onClick={handleSave}>
          <img src="/assets/toolbar/save.png" alt="Save" class="ppt-icon-img" />
        </button>
        <div class="ppt-toolbar-separator"></div>
        <button class="ppt-toolbar-btn" title="Print" onClick={handlePrint}>
          <img src="/assets/toolbar/print.png" alt="Print" class="ppt-icon-img" />
        </button>
        <button class="ppt-toolbar-btn" title="Print Preview">
          <img src="/assets/toolbar/preview.png" alt="Preview" class="ppt-icon-img" />
        </button>
        <div class="ppt-toolbar-separator"></div>
        <button class="ppt-toolbar-btn" title="Cut">
          <span class="ppt-icon-text">✂</span>
        </button>
        <button class="ppt-toolbar-btn" title="Copy">
          <img src="/assets/toolbar/copy.png" alt="Copy" class="ppt-icon-img" />
        </button>
        <button class="ppt-toolbar-btn" title="Paste">
          <span class="ppt-icon-text">📋</span>
        </button>
        <div class="ppt-toolbar-separator"></div>
        <button class="ppt-toolbar-btn" title="Undo">
          <span class="ppt-icon-text">↩</span>
        </button>
        <button class="ppt-toolbar-btn" title="Redo">
          <span class="ppt-icon-text">↪</span>
        </button>
        <div class="ppt-toolbar-separator"></div>
        <button class="ppt-toolbar-btn" title="Insert Hyperlink">
          <img src="/assets/toolbar/link.png" alt="Link" class="ppt-icon-img" />
        </button>
      </div>

      {/* Format Toolbar */}
      <div class="ppt-format-toolbar">
        <select class="ppt-font-select" disabled>
          <option>Times New Roman</option>
        </select>
        <select class="ppt-size-select" disabled>
          <option>32</option>
        </select>
        <div class="ppt-toolbar-separator"></div>
        <button class="ppt-toolbar-btn" title="Bold">
          <span class="ppt-icon-text ppt-icon-bold">B</span>
        </button>
        <button class="ppt-toolbar-btn" title="Italic">
          <span class="ppt-icon-text ppt-icon-italic">I</span>
        </button>
        <button class="ppt-toolbar-btn" title="Underline">
          <span class="ppt-icon-text ppt-icon-underline">U</span>
        </button>
        <button class="ppt-toolbar-btn" title="Text Shadow">
          <span class="ppt-icon-text ppt-icon-shadow">S</span>
        </button>
        <div class="ppt-toolbar-separator"></div>
        <button class="ppt-toolbar-btn" title="Align Left">
          <span class="ppt-icon-text">≡</span>
        </button>
        <button class="ppt-toolbar-btn" title="Center">
          <span class="ppt-icon-text">☰</span>
        </button>
        <button class="ppt-toolbar-btn" title="Align Right">
          <span class="ppt-icon-text">≡</span>
        </button>
        <div class="ppt-toolbar-separator"></div>
        <button class="ppt-toolbar-btn" title="Text Color">
          <img src="/assets/toolbar/color.png" alt="Color" class="ppt-icon-img" />
        </button>
      </div>

      {/* Drawing Toolbar - at bottom */}
      <div class="ppt-drawing-toolbar">
        <button class="ppt-toolbar-btn" title="Rectangle">
          <span class="ppt-icon-text">▢</span>
        </button>
        <button class="ppt-toolbar-btn" title="Oval">
          <span class="ppt-icon-text">○</span>
        </button>
        <button class="ppt-toolbar-btn" title="Line">
          <span class="ppt-icon-text">―</span>
        </button>
        <button class="ppt-toolbar-btn" title="Arrow">
          <span class="ppt-icon-text">→</span>
        </button>
        <div class="ppt-toolbar-separator"></div>
        <button class="ppt-toolbar-btn" title="Text Box">
          <span class="ppt-icon-text ppt-icon-bold">T</span>
        </button>
        <button class="ppt-toolbar-btn" title="Clip Art">
          <img src="/assets/toolbar/clipart.png" alt="Clip Art" class="ppt-icon-img" />
        </button>
        <button class="ppt-toolbar-btn" title="Paint">
          <img src="/assets/toolbar/paint.png" alt="Paint" class="ppt-icon-img" />
        </button>
      </div>
    </div>
  );
}
