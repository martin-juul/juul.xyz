import { useRef, useCallback } from 'preact/hooks';
import { useLanguage } from '../../context/language-context';
import { type Page } from '../../shared/types';
import { WordToolbar } from './components/WordToolbar';

type HomeProps = {
  onNavigate: (page: Page) => void;
};

export function Home({ onNavigate }: HomeProps) {
  const { t } = useLanguage();
  const editorRef = useRef<HTMLDivElement>(null);

  const handleFontSizeChange = useCallback((size: string) => {
    document.execCommand('fontSize', false, '7');
    const fontElements = editorRef.current?.getElementsByTagName('font');
    if (fontElements) {
      for (let i = 0; i < fontElements.length; i++) {
        if (fontElements[i].size === '7') {
          fontElements[i].removeAttribute('size');
          fontElements[i].style.fontSize = size + 'px';
        }
      }
    }
  }, []);

  const handleFormat = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
  }, []);

  const handleBold = useCallback(() => handleFormat('bold'), [handleFormat]);
  const handleItalic = useCallback(() => handleFormat('italic'), [handleFormat]);
  const handleUnderline = useCallback(() => handleFormat('underline'), [handleFormat]);

  return (
    <div class="word-container">
      <WordToolbar
        onFontSizeChange={handleFontSizeChange}
        onBold={handleBold}
        onItalic={handleItalic}
        onUnderline={handleUnderline}
      />

      {/* Document Area */}
      <div class="word-document-area">
        <div
          class="word-paper"
          ref={editorRef}
          contentEditable={true}
        >
          <h1>{t.home.title}</h1>
          <p style="text-align: center;"><strong>{t.home.subtitle}</strong></p>
          <p style="text-align: center; font-style: italic;">{t.home.byline}</p>

          <h2>{t.home.who}</h2>
          <p style="white-space: pre-wrap;">{t.home.content}</p>

          <nav class="word-nav" data-nosnippet contentEditable={false}>
            <button class="word-btn" onClick={() => onNavigate('projects')}>
              {t.home.viewProjects}
            </button>
            <button class="word-btn" onClick={() => onNavigate('resume')}>
              {t.home.viewResume}
            </button>
          </nav>
        </div>
      </div>

      {/* Status Bar */}
      <div class="word-status-bar" data-nosnippet>
        <div class="word-status-left">
          <span class="word-status-section">Page 1</span>
          <span class="word-status-section">Words: 42</span>
          <span class="word-status-section">Ln 1, Col 1</span>
        </div>
        <div class="word-status-right">
          <button class="word-status-view-btn" title="Normal View">N</button>
          <button class="word-status-view-btn" title="Page Layout">P</button>
          <button class="word-status-view-btn" title="Outline View">O</button>
        </div>
      </div>
    </div>
  );
}
