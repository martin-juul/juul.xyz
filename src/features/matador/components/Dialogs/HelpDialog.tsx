// Help Dialog

import { useState } from 'preact/hooks';
import type { Language } from '../../types';
import { t } from '../../translations';

interface HelpDialogProps {
  language: Language;
  onClose: () => void;
}

type HelpTopic = 'Objective' | 'Setup' | 'Movement' | 'Property' | 'Rent' | 'Building' | 'Jail' | 'Bankruptcy';

const HELP_TOPICS: { key: HelpTopic; icon: string }[] = [
  { key: 'Objective', icon: '🎯' },
  { key: 'Setup', icon: '🎮' },
  { key: 'Movement', icon: '🎲' },
  { key: 'Property', icon: '🏠' },
  { key: 'Rent', icon: '💰' },
  { key: 'Building', icon: '🏗️' },
  { key: 'Jail', icon: '🔒' },
  { key: 'Bankruptcy', icon: '💸' },
];

export function HelpDialog({ language, onClose }: HelpDialogProps) {
  const [activeTab, setActiveTab] = useState<HelpTopic>('Objective');

  return (
    <div className="dialog-overlay">
      <div className="matador-dialog" style="min-width: 400px; max-width: 450px;">
        <div className="dialog-header">
          <span>❓ {t('helpTitle', language)}</span>
          <button className="dialog-close" onClick={onClose}>×</button>
        </div>
        <div className="dialog-content" style="padding: 0;">
          <div className="help-tabs">
            {HELP_TOPICS.map(topic => (
              <button
                key={topic.key}
                className={`help-tab ${activeTab === topic.key ? 'active' : ''}`}
                onClick={() => setActiveTab(topic.key)}
              >
                {topic.icon}
              </button>
            ))}
          </div>

          <div className="help-content" style="padding: 12px;">
            <HelpSection topic={activeTab} language={language} />
          </div>
        </div>
        <div className="dialog-footer">
          <button className="action-btn" onClick={onClose}>{t('close', language)}</button>
        </div>
      </div>
    </div>
  );
}

function HelpSection({ topic, language }: { topic: HelpTopic; language: Language }) {
  const title = t(`help${topic}` as any, language);
  const text = t(`help${topic}Text` as any, language);

  return (
    <div className="help-section">
      <h4>{title}</h4>
      <p style="margin: 0; line-height: 1.5;">{text}</p>

      {topic === 'Movement' && (
        <ul style="margin-top: 8px; padding-left: 16px;">
          <li>{language === 'da' ? 'Kast to terninger og flyt urets retning' : 'Roll two dice and move clockwise'}</li>
          <li>{language === 'da' ? 'Slag = kast igen!' : 'Doubles = roll again!'}</li>
          <li>{language === 'da' ? '3 slag i træk = gå i fængsel' : '3 doubles in a row = go to jail'}</li>
          <li>{language === 'da' ? 'Passer Start: modtag 4.000 kr' : 'Pass Start: collect 4,000 kr'}</li>
        </ul>
      )}

      {topic === 'Jail' && (
        <ul style="margin-top: 8px; padding-left: 16px;">
          <li>{language === 'da' ? 'Betal 1.000 kr bøde' : 'Pay 1,000 kr fine'}</li>
          <li>{language === 'da' ? 'Brug Kom ud af Fængsel kort' : 'Use Get Out of Jail Free card'}</li>
          <li>{language === 'da' ? 'Kast slag (3 forsøg)' : 'Roll doubles (3 tries)'}</li>
          <li>{language === 'da' ? 'Efter 3. forsøg: betal 1.000 kr' : 'After 3rd try: pay 1,000 kr'}</li>
        </ul>
      )}

      {topic === 'Property' && (
        <ul style="margin-top: 8px; padding-left: 16px;">
          <li>{language === 'da' ? 'Køb grunden til den angivne pris' : 'Buy the property at listed price'}</li>
          <li>{language === 'da' ? 'Eller sæt den på auktion' : 'Or put it up for auction'}</li>
          <li>{language === 'da' ? 'Monopol = alle grunde i en farvegruppe' : 'Monopoly = all properties in a color group'}</li>
          <li>{language === 'da' ? 'Monopol fordobler leje uden huse' : 'Monopoly doubles rent without houses'}</li>
        </ul>
      )}

      {topic === 'Building' && (
        <ul style="margin-top: 8px; padding-left: 16px;">
          <li>{language === 'da' ? 'Byg kun med monopol' : 'Build only with monopoly'}</li>
          <li>{language === 'da' ? 'Byg jævnt i farvegruppen' : 'Build evenly in color group'}</li>
          <li>{language === 'da' ? '4 huse = Hotel' : '4 houses = Hotel'}</li>
          <li>{language === 'da' ? 'Sælg tilbage til halv pris' : 'Sell back at half price'}</li>
        </ul>
      )}
    </div>
  );
}
