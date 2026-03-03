// Action Panel Component

import { h, FunctionalComponent } from 'preact';
import type { GamePhase, Language } from '../types';
import { Dice } from './Dice';
import { t } from '../translations';

interface ActionPanelProps {
  diceValue: number;
  rolling: boolean;
  phase: GamePhase;
  isHumanTurn: boolean;
  hintsEnabled: boolean;
  message: string | null;
  lang: Language;
  onRoll: () => void;
  onToggleHints: () => void;
  onHelp: () => void;
}

export const ActionPanel: FunctionalComponent<ActionPanelProps> = ({
  diceValue,
  rolling,
  phase,
  isHumanTurn,
  hintsEnabled,
  message,
  lang,
  onRoll,
  onToggleHints,
  onHelp,
}) => {
  const canRoll = isHumanTurn && phase === 'rolling' && !rolling;
  const showSelectHint = isHumanTurn && phase === 'selectToken';

  return (
    <div class="action-panel">
      <div class="dice-container">
        <Dice value={diceValue} rolling={rolling} />

        <button
          class="roll-button"
          onClick={onRoll}
          disabled={!canRoll}
        >
          {t('rollDice', lang)}
        </button>
      </div>

      <div class={`message-area ${message ? 'highlight' : ''}`}>
        {showSelectHint && t('selectToken', lang)}
        {!showSelectHint && message}
        {!showSelectHint && !message && isHumanTurn && phase === 'rolling' && t('firstTurnHint', lang)}
      </div>

      <div class="hint-toggle">
        <input
          type="checkbox"
          id="hints-toggle"
          checked={hintsEnabled}
          onChange={onToggleHints}
        />
        <label for="hints-toggle">
          {hintsEnabled ? t('hintsOn', lang) : t('hintsOff', lang)}
        </label>
      </div>

      <button class="help-button" onClick={onHelp}>
        {t('help', lang)}
      </button>
    </div>
  );
};
