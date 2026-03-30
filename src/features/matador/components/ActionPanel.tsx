import type { GameState, Language } from '../types';
import { t } from '../translations';

interface ActionPanelProps {
  state: GameState;
  language: Language;
  onOpenBuild: () => void;
  onOpenMortgage: () => void;
}

export function ActionPanel({
  state,
  language,
  onOpenBuild,
  onOpenMortgage,
}: ActionPanelProps) {
  const player = state.players[state.currentPlayer];
  const isHuman = player.isHuman;

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

  const hasButtons = canBuild || canMortgage;

  // Only show message when there are no buttons to avoid large gray area
  if (!hasButtons) {
    if (state.message) {
      return (
        <div className="action-panel-message-only">
          <div className="message-box">
            {language === 'da' ? state.message.da : state.message.en}
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="action-panel">
      <div className="action-buttons">
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
      </div>

      {state.message && (
        <div className="message-box">
          {language === 'da' ? state.message.da : state.message.en}
        </div>
      )}
    </div>
  );
}
