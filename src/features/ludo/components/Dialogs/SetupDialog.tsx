// Setup Dialog Component

import { h, FunctionalComponent } from 'preact';
import { useState } from 'preact/hooks';
import type { Difficulty, Language } from '../../types';
import { t } from '../../translations';

interface SetupDialogProps {
  lang: Language;
  onStart: (difficulty: Difficulty) => void;
}

export const SetupDialog: FunctionalComponent<SetupDialogProps> = ({ lang, onStart }) => {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    onStart(difficulty);
  };

  return (
    <div class="dialog-overlay">
      <div class="dialog ludo-dialog">
        <div class="title-bar">
          <div class="title-bar-text">{t('gameTitle', lang)} - {t('newGame', lang)}</div>
        </div>
        <div class="window-body">
          <form onSubmit={handleSubmit}>
            <fieldset>
              <legend>{t('difficulty', lang)}</legend>
              <div class="difficulty-options">
                <div class="difficulty-option">
                  <input
                    type="radio"
                    id="diff-easy"
                    name="difficulty"
                    value="easy"
                    checked={difficulty === 'easy'}
                    onChange={() => setDifficulty('easy')}
                  />
                  <label for="diff-easy">{t('easy', lang)}</label>
                </div>
                <p class="difficulty-desc">
                  {lang === 'en' ? 'Random moves, good for learning' : 'Tilfældige træk, godt til at lære'}
                </p>

                <div class="difficulty-option">
                  <input
                    type="radio"
                    id="diff-medium"
                    name="difficulty"
                    value="medium"
                    checked={difficulty === 'medium'}
                    onChange={() => setDifficulty('medium')}
                  />
                  <label for="diff-medium">{t('medium', lang)}</label>
                </div>
                <p class="difficulty-desc">
                  {lang === 'en' ? 'Balanced AI, captures when possible' : 'Balanceret AI, slår når muligt'}
                </p>

                <div class="difficulty-option">
                  <input
                    type="radio"
                    id="diff-hard"
                    name="difficulty"
                    value="hard"
                    checked={difficulty === 'hard'}
                    onChange={() => setDifficulty('hard')}
                  />
                  <label for="diff-hard">{t('hard', lang)}</label>
                </div>
                <p class="difficulty-desc">
                  {lang === 'en' ? 'Strategic AI, always optimal moves' : 'Strategisk AI, altid optimale træk'}
                </p>
              </div>
            </fieldset>

            <div class="button-group" style="margin-top: 16px;">
              <button type="submit" class="default">
                {t('startGame', lang)}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
