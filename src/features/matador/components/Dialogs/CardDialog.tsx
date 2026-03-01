// Card Dialog (Chance/Community Chest)

import type { Card, Language } from '../../types';
import { t } from '../../translations';

interface CardDialogProps {
  card: Card;
  language: Language;
  onConfirm: () => void;
}

export function CardDialog({ card, language, onConfirm }: CardDialogProps) {
  const text = language === 'da' ? card.text.da : card.text.en;
  const title = card.type === 'chance'
    ? (language === 'da' ? 'Prøv Lykken' : 'Chance')
    : (language === 'da' ? 'Begivenhed' : 'Community Chest');

  const bgColor = card.type === 'chance' ? '#ff6600' : '#3366cc';

  return (
    <div className="dialog-overlay">
      <div className="matador-dialog" style="min-width: 280px;">
        <div className="dialog-header" style={`background: linear-gradient(90deg, {{bgColor}}, {{bgColor}}cc);`}>
          <span>{title}</span>
        </div>
        <div className="dialog-content">
          <div style={{
            background: '#fff',
            border: '2px solid #404040',
            padding: '16px',
            borderRadius: '8px',
            textAlign: 'center',
            minHeight: '80px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div style="font-size: 14px; line-height: 1.4;">
              {text}
            </div>
          </div>
          {card.action === 'getOutOfJail' && (
            <div style="text-align: center; margin-top: 8px; font-size: 10px; color: #006600;">
              🃏 {language === 'da' ? 'Behold dette kort!' : 'Keep this card!'}
            </div>
          )}
        </div>
        <div className="dialog-footer">
          <button className="action-btn primary" onClick={onConfirm}>
            {t('ok', language)}
          </button>
        </div>
      </div>
    </div>
  );
}
