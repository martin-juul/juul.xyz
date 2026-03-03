// Tutorial Dialog Component

import { h, FunctionalComponent } from 'preact';
import { useState } from 'preact/hooks';
import type { Language } from '../../types';
import { t } from '../../translations';

interface TutorialDialogProps {
  lang: Language;
  onComplete: () => void;
  onSkip: () => void;
}

const TUTORIAL_STEPS = 5;

export const TutorialDialog: FunctionalComponent<TutorialDialogProps> = ({
  lang,
  onComplete,
  onSkip,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const stepTitles = [
    t('tutorialStep1Title', lang),
    t('tutorialStep2Title', lang),
    t('tutorialStep3Title', lang),
    t('tutorialStep4Title', lang),
    t('tutorialStep5Title', lang),
  ];

  const stepTexts = [
    t('tutorialStep1Text', lang),
    t('tutorialStep2Text', lang),
    t('tutorialStep3Text', lang),
    t('tutorialStep4Text', lang),
    t('tutorialStep5Text', lang),
  ];

  return (
    <div class="dialog-overlay">
      <div class="dialog ludo-dialog">
        <div class="title-bar">
          <div class="title-bar-text">{t('tutorialTitle', lang)}</div>
          <div class="title-bar-controls">
            <button aria-label="Close" onClick={onSkip}></button>
          </div>
        </div>
        <div class="window-body">
          <div class="tutorial-content">
            {Array.from({ length: TUTORIAL_STEPS }, (_, i) => (
              <div
                key={i}
                class={`tutorial-step ${i === currentStep ? 'active' : ''}`}
              >
                <h4>{stepTitles[i]}</h4>
                <p>{stepTexts[i]}</p>
              </div>
            ))}
          </div>

          <div class="tutorial-nav">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              {t('tutorialBack', lang)}
            </button>

            <div class="tutorial-dots">
              {Array.from({ length: TUTORIAL_STEPS }, (_, i) => (
                <div
                  key={i}
                  class={`tutorial-dot ${i === currentStep ? 'active' : ''}`}
                />
              ))}
            </div>

            <button onClick={onSkip}>
              {t('tutorialSkip', lang)}
            </button>

            <button onClick={handleNext} class="default">
              {currentStep === TUTORIAL_STEPS - 1
                ? t('tutorialStart', lang)
                : t('tutorialNext', lang)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
