// Build Dialog

import { useMemo } from 'preact/hooks';
import type { GameState, Language, StreetProperty, OwnedProperty } from '../../types';
import { t } from '../../translations';

interface BuildDialogProps {
  state: GameState;
  language: Language;
  onBuild: (position: number) => void;
  onSell: (position: number) => void;
  onClose: () => void;
}

export function BuildDialog({ state, language, onBuild, onSell, onClose }: BuildDialogProps) {
  const player = state.players[state.currentPlayer];

  // Get all buildable properties (color groups where player owns all)
  const buildableGroups = useMemo(() => {
    const groups: Record<string, OwnedProperty[]> = {};

    player.properties.forEach(prop => {
      if (prop.property.type === 'street' && !prop.mortgaged) {
        const street = prop.property as StreetProperty;
        const color = street.colorGroup;

        if (!groups[color]) groups[color] = [];
        groups[color].push(prop);
      }
    });

    // Filter to only complete color groups
    const groupSizes: Record<string, number> = {
      brown: 2, lightblue: 3, pink: 3, orange: 3,
      red: 3, yellow: 3, green: 3, darkblue: 2
    };

    const complete: Record<string, OwnedProperty[]> = {};
    for (const [color, props] of Object.entries(groups)) {
      if (props.length === groupSizes[color]) {
        complete[color] = props.sort((a, b) => a.property.position - b.property.position);
      }
    }

    return complete;
  }, [player.properties]);

  // Calculate minimum houses in each group for even building rule
  const getMinHousesInGroup = (props: OwnedProperty[]): number => {
    return Math.min(...props.map(p => p.houses));
  };

  const canBuildOn = (prop: OwnedProperty, groupProps: OwnedProperty[]): boolean => {
    if (prop.houses >= 5) return false; // Already has hotel
    const minHouses = getMinHousesInGroup(groupProps);
    if (prop.houses > minHouses) return false; // Even building rule
    if (prop.houses < 4 && state.housesAvailable === 0) return false;
    if (prop.houses === 4 && state.hotelsAvailable === 0) return false;

    const street = prop.property as StreetProperty;
    return player.cash >= street.houseCost;
  };

  const canSellFrom = (prop: OwnedProperty, groupProps: OwnedProperty[]): boolean => {
    if (prop.houses === 0) return false;
    const maxHouses = Math.max(...groupProps.map(p => p.houses));
    return prop.houses >= maxHouses;
  };

  const renderHouses = (houses: number) => {
    if (houses === 5) {
      return <div className="hotel" style="width: 16px; height: 10px;" />;
    }
    return (
      <div className="build-houses-display">
        {Array.from({ length: houses }).map((_, i) => (
          <div key={i} className="build-mini-house" />
        ))}
      </div>
    );
  };

  return (
    <div className="dialog-overlay">
      <div className="matador-dialog" style="min-width: 350px;">
        <div className="dialog-header">
          <span>{t('buildTitle', language)}</span>
          <button className="dialog-close" onClick={onClose}>×</button>
        </div>
        <div className="dialog-content">
          <div style="margin-bottom: 8px; font-size: 10px;">
            {t('houses', language)}: {state.housesAvailable} | {t('hotels', language)}: {state.hotelsAvailable}
          </div>

          {Object.keys(buildableGroups).length === 0 ? (
            <div style="text-align: center; color: #808080; padding: 20px;">
              {t('noBuildableProperties', language)}
            </div>
          ) : (
            Object.entries(buildableGroups).map(([color, props]) => (
              <div key={color} style="margin-bottom: 12px;">
                <div style="font-weight: bold; margin-bottom: 4px; padding: 2px 6px; background: COLOR_GROUP_COLORS[color] || '#808080'; color: white;">
                  {color.charAt(0).toUpperCase() + color.slice(1)}
                </div>
                {props.map(prop => {
                  const street = prop.property as StreetProperty;
                  const name = language === 'da' ? street.nameDa : street.name;
                  const canBuild = canBuildOn(prop, props);
                  const canSell = canSellFrom(prop, props);

                  return (
                    <div key={prop.property.position} className="build-property">
                      <div>
                        <div style="font-weight: bold;">{name}</div>
                        <div style="font-size: 9px; color: #404040;">
                          {t('houseCost', language)}: {street.houseCost} kr
                        </div>
                      </div>
                      <div style="display: flex; align-items: center; gap: 8px;">
                        {renderHouses(prop.houses)}
                        <button
                          className="action-btn"
                          style="padding: 2px 6px; font-size: 10px;"
                          onClick={() => onSell(prop.property.position)}
                          disabled={!canSell}
                        >
                          –
                        </button>
                        <button
                          className="action-btn"
                          style="padding: 2px 6px; font-size: 10px;"
                          onClick={() => onBuild(prop.property.position)}
                          disabled={!canBuild}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
        <div className="dialog-footer">
          <div style="flex: 1;">{t('cash', language)}: {player.cash.toLocaleString()} kr</div>
          <button className="action-btn" onClick={onClose}>{t('close', language)}</button>
        </div>
      </div>
    </div>
  );
}
