// First Turn Guide Component

import { h, FunctionalComponent } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import type { GamePhase, Language } from '../../types';
import { t } from '../../translations';

interface FirstTurnGuideProps {
  phase: GamePhase;
  turnCount: number;
  lang: Language;
}

export const FirstTurnGuide: FunctionalComponent<FirstTurnGuideProps> = ({
  phase,
  turnCount,
  lang,
}) => {
  const [visible, setVisible] = useState(true);

  // Hide after first few turns
  useEffect(() => {
    if (turnCount > 2) {
      setVisible(false);
    }
  }, [turnCount]);

  if (!visible || turnCount > 2) {
    return null;
  }

  return (
    <div class="first-turn-guide">
      {phase === 'rolling' && (
        <div class="guide-text" style="bottom: 180px; right: 20px;">
          {t('firstTurnHint', lang)}
          <div class="arrow" style="bottom: -20px; right: 50%;">↓</div>
        </div>
      )}
      {phase === 'selectToken' && (
        <div class="guide-text" style="top: 50%; left: 50%; transform: translate(-50%, -50%);">
          {t('firstTurnSelect', lang)}
        </div>
      )}
    </div>
  );
};
