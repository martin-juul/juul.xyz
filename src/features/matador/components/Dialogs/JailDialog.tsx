import type { Player, Language } from '../../types';
import { t } from '../../translations';
import { JAIL_FINE, MAX_JAIL_TURNS } from '../../constants';

interface JailDialogProps {
  player: Player;
  language: Language;
  onPayFine: () => void;
  onUseCard: () => void;
  onRollForDoubles: () => void;
}

export function JailDialog({ player, language, onPayFine, onUseCard, onRollForDoubles }: JailDialogProps) {
  const canPayFine = player.cash >= JAIL_FINE;
  const canUseCard = player.getOutOfJailCards > 0;
  const attemptsLeft = MAX_JAIL_TURNS - player.jailTurns;

  return (
    <div className="dialog-overlay">
      <div className="matador-dialog" style="min-width: 280px;">
        <div className="dialog-header">
          <span>🔒 {t('jailTitle', language)}</span>
        </div>
        <div className="dialog-content">
          <div style="text-align: center; margin-bottom: 12px;">
            <div style="font-size: 48px; margin-bottom: 8px;">🚔</div>
            <div style="font-size: 12px; color: #404040;">
              {t('inJailMessage', language)}
            </div>
            <div style="margin-top: 8px; font-size: 10px; color: #808080;">
              {t('turnsInJail', language)}: {player.jailTurns}/{MAX_JAIL_TURNS}
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 8px;">
            <button
              className="action-btn"
              onClick={onPayFine}
              disabled={!canPayFine}
              style="width: 100%; padding: 8px;"
            >
              💰 {t('payFineMessage', language)}
              {!canPayFine && <span style="color: #cc0000;"> ({t('cash', language)}: {player.cash.toLocaleString()} kr)</span>}
            </button>

            {canUseCard && (
              <button
                className="action-btn"
                onClick={onUseCard}
                style="width: 100%; padding: 8px;"
              >
                🃏 {t('useCardMessage', language)} ({player.getOutOfJailCards}x)
              </button>
            )}

            <button
              className="action-btn primary"
              onClick={onRollForDoubles}
              style="width: 100%; padding: 8px;"
            >
              🎲 {t('rollDoublesMessage', language)}
              <span style="font-size: 10px; display: block; margin-top: 2px;">
                ({attemptsLeft} {language === 'da' ? 'forsøg tilbage' : 'attempts left'})
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
