// Mortgage Dialog

import { useMemo } from 'preact/hooks';
import type { GameState, Language, OwnedProperty, StreetProperty } from '../../types';
import { t } from '../../translations';
import { COLOR_GROUP_COLORS } from '../../constants';

interface MortgageDialogProps {
  state: GameState;
  language: Language;
  onMortgage: (position: number) => void;
  onUnmortgage: (position: number) => void;
  onClose: () => void;
}

export function MortgageDialog({ state, language, onMortgage, onUnmortgage, onClose }: MortgageDialogProps) {
  const player = state.players[state.currentPlayer];

  // Separate properties into mortgaged and unmortgaged
  const { mortgaged, unmortgaged } = useMemo(() => {
    const mortgaged: OwnedProperty[] = [];
    const unmortgaged: OwnedProperty[] = [];

    player.properties.forEach(prop => {
      if (prop.mortgaged) {
        mortgaged.push(prop);
      } else if (prop.houses === 0) {
        // Can only mortgage properties without houses
        unmortgaged.push(prop);
      }
    });

    return { mortgaged, unmortgaged };
  }, [player.properties]);

  const getColorStyle = (prop: OwnedProperty): string => {
    if (prop.property.type === 'street') {
      const street = prop.property as StreetProperty;
      return COLOR_GROUP_COLORS[street.colorGroup] || '#808080';
    }
    return '#404040';
  };

  return (
    <div className="dialog-overlay">
      <div className="matador-dialog" style="min-width: 320px;">
        <div className="dialog-header">
          <span>{t('mortgageTitle', language)}</span>
          <button className="dialog-close" onClick={onClose}>×</button>
        </div>
        <div className="dialog-content">
          <div style="margin-bottom: 12px;">
            <div style="font-weight: bold; margin-bottom: 4px;">{t('cash', language)}: {player.cash.toLocaleString()} kr</div>
          </div>

          {/* Unmortgaged properties */}
          {unmortgaged.length > 0 && (
            <div style="margin-bottom: 12px;">
              <div style="font-weight: bold; margin-bottom: 4px; color: #006600;">
                {language === 'da' ? 'Kan pantsættes' : 'Can mortgage'}:
              </div>
              {unmortgaged.map(prop => {
                const name = language === 'da' ? prop.property.nameDa : prop.property.name;
                const canMortgage = player.cash >= 0; // Always can mortgage to get money

                return (
                  <div key={prop.property.position} className="build-property">
                    <div style="border-left: 4px solid {{getColorStyle(prop)}}; padding-left: 8px;">
                      <div style="font-weight: bold;">{name}</div>
                      <div style="font-size: 9px; color: #404040;">
                        {t('mortgageValue', language)}: {prop.property.mortgageValue} kr
                      </div>
                    </div>
                    <button
                      className="action-btn"
                      style="padding: 2px 8px; font-size: 10px;"
                      onClick={() => onMortgage(prop.property.position)}
                    >
                      {t('mortgageProperty', language)}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Mortgaged properties */}
          {mortgaged.length > 0 && (
            <div>
              <div style="font-weight: bold; margin-bottom: 4px; color: #cc0000;">
                {language === 'da' ? 'Pantsat' : 'Mortgaged'}:
              </div>
              {mortgaged.map(prop => {
                const name = language === 'da' ? prop.property.nameDa : prop.property.name;
                const unmortgageCost = Math.floor(prop.property.mortgageValue * 1.1);
                const canUnmortgage = player.cash >= unmortgageCost;

                return (
                  <div key={prop.property.position} className="build-property mortgaged-indicator">
                    <div style="border-left: 4px solid {{getColorStyle(prop)}}; padding-left: 8px;">
                      <div style="font-weight: bold;">{name}</div>
                      <div style="font-size: 9px; color: #404040;">
                        {t('unmortgageCost', language)}: {unmortgageCost} kr
                      </div>
                    </div>
                    <button
                      className="action-btn"
                      style="padding: 2px 8px; font-size: 10px;"
                      onClick={() => onUnmortgage(prop.property.position)}
                      disabled={!canUnmortgage}
                    >
                      {t('unmortgageProperty', language)}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {unmortgaged.length === 0 && mortgaged.length === 0 && (
            <div style="text-align: center; color: #808080; padding: 20px;">
              {t('noMortgagableProperties', language)}
            </div>
          )}
        </div>
        <div className="dialog-footer">
          <button className="action-btn" onClick={onClose}>{t('close', language)}</button>
        </div>
      </div>
    </div>
  );
}
