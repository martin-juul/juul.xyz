import type { OwnableProperty, Language, StreetProperty } from '../../types';
import { t } from '../../translations';

interface BuyPropertyDialogProps {
  property: OwnableProperty;
  language: Language;
  onBuy: () => void;
  onAuction: () => void;
  onClose: () => void;
}

export function BuyPropertyDialog({ property, language, onBuy, onAuction, onClose }: BuyPropertyDialogProps) {
  const name = language === 'da' ? property.nameDa : property.name;

  const renderDeed = () => {
    if (property.type === 'street') {
      const street = property as StreetProperty;
      return (
        <div className={`property-deed ${street.colorGroup}`}>
          <div className="deed-title">{name}</div>
          <div className="deed-price">{t('price', language)}: {street.price} {t('currency', language)}</div>
          <div className="deed-rents">
            <div className="deed-rent-row">
              <span className="deed-rent-label">{t('rent', language)}:</span>
              <span>{street.baseRent} {t('currency', language)}</span>
            </div>
            <div className="deed-rent-row">
              <span className="deed-rent-label">1 {t('houses', language)}:</span>
              <span>{street.rentWithHouses[0]} {t('currency', language)}</span>
            </div>
            <div className="deed-rent-row">
              <span className="deed-rent-label">2 {t('houses', language)}:</span>
              <span>{street.rentWithHouses[1]} {t('currency', language)}</span>
            </div>
            <div className="deed-rent-row">
              <span className="deed-rent-label">3 {t('houses', language)}:</span>
              <span>{street.rentWithHouses[2]} {t('currency', language)}</span>
            </div>
            <div className="deed-rent-row">
              <span className="deed-rent-label">4 {t('houses', language)}:</span>
              <span>{street.rentWithHouses[3]} {t('currency', language)}</span>
            </div>
            <div className="deed-rent-row">
              <span className="deed-rent-label">{t('withHotel', language)}:</span>
              <span>{street.rentWithHotel} {t('currency', language)}</span>
            </div>
            <div className="deed-rent-row">
              <span className="deed-rent-label">{t('houseCost', language)}:</span>
              <span>{street.houseCost} {t('currency', language)}</span>
            </div>
            <div className="deed-rent-row">
              <span className="deed-rent-label">{t('mortgageValue', language)}:</span>
              <span>{street.mortgageValue} {t('currency', language)}</span>
            </div>
          </div>
        </div>
      );
    }

    if (property.type === 'railway') {
      return (
        <div className="property-deed" style="border-top: 6px solid #404040;">
          <div className="deed-title">{name}</div>
          <div className="deed-price">{t('price', language)}: {property.price} {t('currency', language)}</div>
          <div className="deed-rents">
            <div className="deed-rent-row">
              <span className="deed-rent-label">1 {t('railway', language)}:</span>
              <span>{property.rentByOwnership[0]} {t('currency', language)}</span>
            </div>
            <div className="deed-rent-row">
              <span className="deed-rent-label">2 {t('railway', language)}er:</span>
              <span>{property.rentByOwnership[1]} {t('currency', language)}</span>
            </div>
            <div className="deed-rent-row">
              <span className="deed-rent-label">3 {t('railway', language)}er:</span>
              <span>{property.rentByOwnership[2]} {t('currency', language)}</span>
            </div>
            <div className="deed-rent-row">
              <span className="deed-rent-label">4 {t('railway', language)}er:</span>
              <span>{property.rentByOwnership[3]} {t('currency', language)}</span>
            </div>
            <div className="deed-rent-row">
              <span className="deed-rent-label">{t('mortgageValue', language)}:</span>
              <span>{property.mortgageValue} {t('currency', language)}</span>
            </div>
          </div>
        </div>
      );
    }

    if (property.type === 'brewery') {
      return (
        <div className="property-deed" style="border-top: 6px solid #ffcc00;">
          <div className="deed-title">{name}</div>
          <div className="deed-price">{t('price', language)}: {property.price} {t('currency', language)}</div>
          <div className="deed-rents">
            <div className="deed-rent-row">
              <span className="deed-rent-label">1 {t('brewery', language)}:</span>
              <span>×{property.multiplierOneOwned}</span>
            </div>
            <div className="deed-rent-row">
              <span className="deed-rent-label">2 {t('brewery', language)}er:</span>
              <span>×{property.multiplierTwoOwned}</span>
            </div>
            <div className="deed-rent-row">
              <span className="deed-rent-label">{t('mortgageValue', language)}:</span>
              <span>{property.mortgageValue} {t('currency', language)}</span>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="dialog-overlay">
      <div className="matador-dialog">
        <div className="dialog-header">
          <span>{t('buyPropertyTitle', language)}</span>
          <button className="dialog-close" onClick={onClose}>×</button>
        </div>
        <div className="dialog-content">
          {renderDeed()}
        </div>
        <div className="dialog-footer">
          <button className="action-btn primary" onClick={onBuy}>
            {t('buyProperty', language)} ({property.price} kr)
          </button>
          <button className="action-btn" onClick={onAuction}>
            {t('auctionProperty', language)}
          </button>
          <button className="action-btn" onClick={onClose}>
            {t('cancel', language)}
          </button>
        </div>
      </div>
    </div>
  );
}
