import type { GameState, Language } from '../types';
import { t } from '../translations';
import { canAfford } from '../game-logic';

interface ActionPanelProps {
  state: GameState;
  language: Language;
  onRollDice: () => void;
  onEndTurn: () => void;
  onOpenBuild: () => void;
  onOpenMortgage: () => void;
  onOpenTrade: () => void;
  onPayFine: () => void;
  onUseCard: () => void;
  onRollForDoubles: () => void;
}

export function ActionPanel({
  state,
  language,
  onRollDice,
  onEndTurn,
  onOpenBuild,
  onOpenMortgage,
  onOpenTrade,
  onPayFine,
  onUseCard,
  onRollForDoubles,
}: ActionPanelProps) {
  const player = state.players[state.currentPlayer];
  const isHuman = player.isHuman;

  // Determine available actions based on phase
  const canRoll = isHuman && state.phase === 'rolling' && !state.diceRolled;
  const canEndTurn = isHuman && state.phase === 'rolling' && state.diceRolled;
  const inJail = isHuman && state.phase === 'jail' && player.inJail;

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
      // Import from constants would need to check group sizes
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

  const canTrade = isHuman && state.phase === 'rolling' && !player.inJail &&
    state.players.filter(p => !p.bankrupt).length > 1;

  const canPayFine = inJail && canAfford(player, 1000);
  const canUseCard = inJail && player.getOutOfJailCards > 0;
  const canRollInJail = inJail && player.jailTurns < 3;

  return (
    <div className="action-panel">
      <div className="action-buttons">
        {canRoll && (
          <button className="action-btn primary" onClick={onRollDice}>
            🎲 {t('rollDice', language)}
          </button>
        )}

        {inJail && (
          <>
            {canPayFine && (
              <button className="action-btn" onClick={onPayFine}>
                💰 {t('payFine', language)} (1,000 kr)
              </button>
            )}
            {canUseCard && (
              <button className="action-btn" onClick={onUseCard}>
                🃏 {t('useCard', language)}
              </button>
            )}
            {canRollInJail && (
              <button className="action-btn primary" onClick={onRollForDoubles}>
                🎲 {t('rollForDoubles', language)}
              </button>
            )}
          </>
        )}

        {canEndTurn && (
          <button className="action-btn" onClick={onEndTurn}>
            ➡️ {t('endTurn', language)}
          </button>
        )}

        {canBuild && (
          <button className="action-btn" onClick={onOpenBuild}>
            🏠 {t('build', language)}
          </button>
        )}

        {canMortgage && (
          <button className="action-btn" onClick={onOpenMortgage}>
            📋 {t('mortgage', language)}
          </button>
        )}

        {canTrade && (
          <button className="action-btn" onClick={onOpenTrade}>
            🤝 {t('trade', language)}
          </button>
        )}
      </div>

      {state.message && (
        <div className="message-box">
          {language === 'da' ? state.message.da : state.message.en}
        </div>
      )}
    </div>
  );
}
