import type { GameState, Language } from '../types';
import { TOKEN_EMOJIS } from '../constants';
import { calculateNetWorth, canAfford } from '../game-logic';
import { t } from '../translations';

interface ScoreBoardProps {
  state: GameState;
  language: Language;
  onRollDice?: () => void;
  onEndTurn?: () => void;
  onOpenTrade?: () => void;
  onOpenBuild?: () => void;
  onOpenMortgage?: () => void;
  onPayFine?: () => void;
  onUseCard?: () => void;
  onRollForDoubles?: () => void;
  rolling?: boolean;
}

export function ScoreBoard({
  state,
  language,
  onRollDice,
  onEndTurn,
  onOpenTrade,
  onOpenBuild,
  onOpenMortgage,
  onPayFine,
  onUseCard,
  onRollForDoubles,
  rolling = false,
}: ScoreBoardProps) {
  const player = state.players[state.currentPlayer];
  const isHuman = player.isHuman;

  // Determine available actions based on phase
  const canRoll = isHuman && state.phase === 'rolling' && !state.diceRolled && !rolling;
  const canEndTurn = isHuman && state.phase === 'rolling' && state.diceRolled;
  const inJail = isHuman && state.phase === 'jail' && player.inJail;
  const canTrade = isHuman && state.phase === 'rolling' && !player.inJail &&
    state.players.filter(p => !p.bankrupt).length > 1;
  const canPayFine = inJail && canAfford(player, 1000);
  const canUseCard = inJail && player.getOutOfJailCards > 0;
  const canRollInJail = inJail && player.jailTurns < 3;

  // Check if player can build (owns a complete color group with no houses on all)
  const canBuild = isHuman && state.phase === 'rolling' && !player.inJail && (() => {
    const colorGroups: Record<string, number[]> = {};
    player.properties.forEach(p => {
      if (p.property.type === 'street') {
        const color = p.property.colorGroup;
        if (!colorGroups[color]) colorGroups[color] = [];
        colorGroups[color].push(p.property.position);
      }
    });

    // Check each color group
    for (const [color, positions] of Object.entries(colorGroups)) {
      const groupSizes: Record<string, number> = {
        brown: 2, lightblue: 3, pink: 3, orange: 3,
        red: 3, yellow: 3, green: 3, darkblue: 2
      };
      if (positions.length === groupSizes[color]) {
        // Check if we have cash to build
        if (player.cash >= 1000) return true;
      }
    }
    return false;
  })();

  const canMortgage = isHuman && state.phase === 'rolling' && !player.inJail &&
    player.properties.some(p => !p.mortgaged && p.houses === 0);

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

      {/* Action buttons moved here - below players */}
      <div className="scoreboard-actions">
        {canRoll && onRollDice && (
          <button className="action-btn primary" onClick={onRollDice}>
            🎲 {t('rollDice', language)}
          </button>
        )}

        {inJail && (
          <>
            {canPayFine && onPayFine && (
              <button className="action-btn" onClick={onPayFine}>
                💰 {t('payFine', language)} (1,000 kr)
              </button>
            )}
            {canUseCard && onUseCard && (
              <button className="action-btn" onClick={onUseCard}>
                🃏 {t('useCard', language)}
              </button>
            )}
            {canRollInJail && onRollForDoubles && (
              <button className="action-btn primary" onClick={onRollForDoubles}>
                🎲 {t('rollForDoubles', language)}
              </button>
            )}
          </>
        )}

        {canEndTurn && onEndTurn && (
          <button className="action-btn" onClick={onEndTurn}>
            ➡️ {t('endTurn', language)}
          </button>
        )}

        {canBuild && onOpenBuild && (
          <button className="action-btn" onClick={onOpenBuild}>
            🏠 {t('build', language)}
          </button>
        )}

        {canMortgage && onOpenMortgage && (
          <button className="action-btn" onClick={onOpenMortgage}>
            📋 {t('mortgage', language)}
          </button>
        )}

        {canTrade && onOpenTrade && (
          <button className="action-btn" onClick={onOpenTrade}>
            🤝 {t('trade', language)}
          </button>
        )}
      </div>
    </div>
  );
}
