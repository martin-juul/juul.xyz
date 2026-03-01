// ScoreBoard Component

import type { GameState, Language } from '../types';
import { TOKEN_EMOJIS } from '../constants';
import { calculateNetWorth } from '../game-logic';
import { t } from '../translations';

interface ScoreBoardProps {
  state: GameState;
  language: Language;
}

export function ScoreBoard({ state, language }: ScoreBoardProps) {
  return (
    <div className="scoreboard">
      <div className="scoreboard-title">
        {t('properties', language)}
      </div>
      <div className="scoreboard-players">
        {state.players.map((player, index) => {
          const netWorth = calculateNetWorth(player);
          const houseCount = player.properties.reduce((sum, p) => sum + p.houses, 0);
          const hotelCount = player.properties.filter(p => p.houses === 5).length;
          const mortgagedValue = player.properties
            .filter(p => p.mortgaged)
            .reduce((sum, p) => sum + p.property.mortgageValue, 0);
          const isCurrent = state.currentPlayer === index;

          return (
            <div
              key={player.id}
              className={`player-card ${isCurrent ? 'current' : ''} ${player.bankrupt ? 'bankrupt' : ''}`}
            >
              <div className="player-header">
                <span className="player-token-icon">{TOKEN_EMOJIS[player.token]}</span>
                <span className="player-name">
                  {player.isHuman
                    ? (language === 'da' ? 'Dig' : 'You')
                    : player.name
                  }
                </span>
                {player.inJail && <span title={t('inJail', language)}>🔒</span>}
              </div>
              <div className="player-stats">
                <div className="player-stat">
                  <span className="player-stat-label">{t('cash', language)}:</span>
                  <span className={`player-stat-value cash ${player.cash < 1000 ? 'low' : ''}`}>
                    {player.cash.toLocaleString()} {t('currency', language)}
                  </span>
                </div>
                <div className="player-stat">
                  <span className="player-stat-label">{t('netWorth', language)}:</span>
                  <span className="player-stat-value">
                    {netWorth.toLocaleString()} {t('currency', language)}
                  </span>
                </div>
                <div className="player-stat">
                  <span className="player-stat-label">{t('properties', language)}:</span>
                  <span className="player-stat-value">{player.properties.length}</span>
                </div>
                <div className="player-stat">
                  <span className="player-stat-label">{t('houses', language)}/{t('hotels', language)}:</span>
                  <span className="player-stat-value">{houseCount - hotelCount}/{hotelCount}</span>
                </div>
              </div>
              {player.getOutOfJailCards > 0 && (
                <div style="font-size: 9px; color: #006600; margin-top: 2px;">
                  🃏 {player.getOutOfJailCards}x {t('useCard', language)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
