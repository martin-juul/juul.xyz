import type { GameState, Language } from '../../types';
import { t } from '../../translations';
import { TOKEN_EMOJIS } from '../../constants';
import { calculateNetWorth } from '../../game-logic';

interface GameOverDialogProps {
  state: GameState;
  language: Language;
  onNewGame: () => void;
  onClose: () => void;
}

export function GameOverDialog({ state, language, onNewGame, onClose }: GameOverDialogProps) {
  const winner = state.winner !== null ? state.players[state.winner] : null;
  const isHumanWinner = winner?.isHuman;

  // Calculate final standings sorted by net worth
  const standings = [...state.players]
    .map((player, index) => ({
      player,
      index,
      netWorth: calculateNetWorth(player),
    }))
    .sort((a, b) => b.netWorth - a.netWorth);

  return (
    <div className="dialog-overlay">
      <div className="matador-dialog" style="min-width: 320px;">
        <div className="dialog-header">
          <span>🏆 {t('gameOverTitle', language)}</span>
        </div>
        <div className="dialog-content">
          <div className="game-over-content">
            <div style="font-size: 48px; margin-bottom: 8px;">
              {isHumanWinner ? '🎉' : '😔'}
            </div>

            <div className="winner-announcement">
              {winner && (
                <>
                  {TOKEN_EMOJIS[winner.token]} {winner.isHuman
                    ? (language === 'da' ? 'Du' : 'You')
                    : winner.name
                  } {t('winner', language)}
                </>
              )}
            </div>

            <div style="font-size: 14px; margin-bottom: 12px;">
              {isHumanWinner
                ? t('congratulations', language)
                : (language === 'da'
                    ? 'Bedre held næste gang!'
                    : 'Better luck next time!')
              }
            </div>

            <div className="final-standings">
              <div style="font-weight: bold; margin-bottom: 8px; text-align: center;">
                {t('finalStandings', language)}
              </div>
              {standings.map((entry, rank) => (
                <div
                  key={entry.player.id}
                  className={`standing-row ${entry.index === state.winner ? 'winner' : ''}`}
                >
                  <span>
                    #{rank + 1} {TOKEN_EMOJIS[entry.player.token]} {entry.player.isHuman
                      ? (language === 'da' ? 'Dig' : 'You')
                      : entry.player.name
                    }
                    {entry.player.bankrupt && ' 💀'}
                  </span>
                  <span style="font-weight: bold;">
                    {entry.netWorth.toLocaleString()} kr
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="dialog-footer">
          <button className="action-btn primary" onClick={onNewGame}>
            {t('newGame', language)}
          </button>
          <button className="action-btn" onClick={onClose}>
            {t('close', language)}
          </button>
        </div>
      </div>
    </div>
  );
}
