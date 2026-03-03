// Game Over Dialog Component

import { h, FunctionalComponent } from 'preact';
import type { GameState, Language, Player } from '../../types';
import { t } from '../../translations';
import { getPlayerRanking } from '../../game-logic';

interface GameOverDialogProps {
  gameState: GameState;
  lang: Language;
  onPlayAgain: () => void;
  onClose: () => void;
}

export const GameOverDialog: FunctionalComponent<GameOverDialogProps> = ({
  gameState,
  lang,
  onPlayAgain,
  onClose,
}) => {
  const ranking = getPlayerRanking(gameState);
  const winner = ranking[0];
  const humanWon = winner.isHuman;

  return (
    <div class="dialog-overlay">
      <div class="dialog ludo-dialog">
        <div class="title-bar">
          <div class="title-bar-text">{t('gameOverTitle', lang)}</div>
          <div class="title-bar-controls">
            <button aria-label="Close" onClick={onClose}></button>
          </div>
        </div>
        <div class="window-body">
          <div class="game-over-content">
            <h3>{humanWon ? t('congratulations', lang) : t('youLose', lang)}</h3>

            <div class="game-over-winner">
              {humanWon ? (
                <>
                  <span role="img" aria-label="trophy">🏆</span>{' '}
                  {t('youWin', lang)}
                </>
              ) : (
                <>
                  {winner.name} {t('winner', lang)}
                </>
              )}
            </div>

            <div class="final-standings">
              <h4>{t('finalStandings', lang)}</h4>
              {ranking.map((player, index) => (
                <div class="standing" key={player.id}>
                  <span>{index + 1}.</span>
                  <div class={`standing-color ${player.color}`} />
                  <span class="standing-name">
                    {player.isHuman ? t('humanPlayer', lang) : player.name}
                  </span>
                  <span class="standing-tokens">
                    {player.finishedTokens}/4 {t('finished', lang).toLowerCase()}
                  </span>
                </div>
              ))}
            </div>

            <p style="margin-top: 12px; font-size: 12px; color: #666;">
              {t('turns', lang)}: {gameState.turnCount}
            </p>
          </div>

          <div class="button-group" style="margin-top: 16px;">
            <button onClick={onClose}>
              {t('close', lang)}
            </button>
            <button onClick={onPlayAgain} class="default">
              {t('playAgain', lang)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
