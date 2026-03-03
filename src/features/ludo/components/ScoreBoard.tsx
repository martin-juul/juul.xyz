// Score Board Component

import { h, FunctionalComponent } from 'preact';
import type { GameState, Language } from '../types';
import { PLAYER_COLORS } from '../constants';
import { t } from '../translations';

interface ScoreBoardProps {
  gameState: GameState;
  lang: Language;
}

export const ScoreBoard: FunctionalComponent<ScoreBoardProps> = ({ gameState, lang }) => {
  return (
    <div class="score-board">
      <h3>{t('stats', lang)}</h3>
      {gameState.players.map((player, index) => (
        <div
          class={`player-score ${gameState.currentPlayer === index ? 'current' : ''}`}
          key={player.id}
        >
          <div class="player-score-header">
            <div class={`player-score-color ${player.color}`} />
            <span class="player-score-name">
              {player.isHuman ? t('humanPlayer', lang) : player.name}
            </span>
            {!player.isHuman && (
              <span class="player-difficulty">
                ({t(player.difficulty || 'easy', lang)})
              </span>
            )}
          </div>
          <div class="player-score-status">
            <span>{t('finished', lang)}: {player.finishedTokens}/4</span>
            <span>{t('home', lang)}: {player.tokens.filter(t => t.state === 'home').length}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
