// Help Dialog Component

import { h, FunctionalComponent } from 'preact';
import type { Language } from '../../types';
import { t } from '../../translations';

interface HelpDialogProps {
  lang: Language;
  onClose: () => void;
}

interface HelpSection {
  title: string;
  text: string;
}

export const HelpDialog: FunctionalComponent<HelpDialogProps> = ({ lang, onClose }) => {
  const sections: HelpSection[] = [
    { title: t('helpObjective', lang), text: t('helpObjectiveText', lang) },
    { title: t('helpSetup', lang), text: t('helpSetupText', lang) },
    { title: t('helpStarting', lang), text: t('helpStartingText', lang) },
    { title: t('helpMovement', lang), text: t('helpMovementText', lang) },
    { title: t('helpExtraTurn', lang), text: t('helpExtraTurnText', lang) },
    { title: t('helpCapturing', lang), text: t('helpCapturingText', lang) },
    { title: t('helpSafe', lang), text: t('helpSafeText', lang) },
    { title: t('helpHomeStretch', lang), text: t('helpHomeStretchText', lang) },
    { title: t('helpFinishing', lang), text: t('helpFinishingText', lang) },
  ];

  return (
    <div class="dialog-overlay">
      <div class="dialog ludo-dialog" style="max-width: 450px;">
        <div class="title-bar">
          <div class="title-bar-text">{t('helpTitle', lang)}</div>
          <div class="title-bar-controls">
            <button aria-label="Close" onClick={onClose}></button>
          </div>
        </div>
        <div class="window-body">
          <div class="help-content">
            {sections.map((section, index) => (
              <div class="help-section" key={index}>
                <h4>{section.title}</h4>
                <p>{section.text}</p>
              </div>
            ))}
          </div>

          <div class="button-group" style="margin-top: 16px;">
            <button onClick={onClose} class="default">
              {t('close', lang)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
