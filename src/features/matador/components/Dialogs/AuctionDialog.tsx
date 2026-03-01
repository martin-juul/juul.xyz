// Auction Dialog

import { useState, useEffect } from 'preact/hooks';
import type { GameState, Language } from '../../types';
import { t } from '../../translations';
import { TOKEN_EMOJIS } from '../../constants';

interface AuctionDialogProps {
  state: GameState;
  language: Language;
  onBid: (playerIndex: number, amount: number) => void;
  onPass: (playerIndex: number) => void;
  onClose: () => void;
}

export function AuctionDialog({ state, language, onBid, onPass, onClose }: AuctionDialogProps) {
  const auction = state.auction;
  const [bidAmount, setBidAmount] = useState(auction?.currentBid || 0);

  if (!auction) return null;

  const property = auction.property;
  const name = language === 'da' ? property.nameDa : property.name;

  useEffect(() => {
    setBidAmount(auction.currentBid);
  }, [auction.currentBid]);

  const handleBid = (playerIndex: number) => {
    if (bidAmount > auction.currentBid && bidAmount <= state.players[playerIndex].cash) {
      onBid(playerIndex, bidAmount);
    }
  };

  return (
    <div className="dialog-overlay">
      <div className="matador-dialog" style="min-width: 320px;">
        <div className="dialog-header">
          <span>{t('auctionTitle', language)}: {name}</span>
          <button className="dialog-close" onClick={onClose}>×</button>
        </div>
        <div className="dialog-content">
          <div style="text-align: center; margin-bottom: 12px;">
            <div style="font-size: 14px; font-weight: bold;">{t('price', language)}: {property.price} {t('currency', language)}</div>
            <div style="font-size: 16px; color: #006600; font-weight: bold; margin-top: 8px;">
              {t('currentBid', language)}: {auction.currentBid} {t('currency', language)}
              {auction.currentBidder !== null && (
                <span style="margin-left: 8px;">
                  ({state.players[auction.currentBidder].name})
                </span>
              )}
            </div>
          </div>

          <div className="auction-bids">
            {auction.participants.map(playerIndex => {
              const player = state.players[playerIndex];
              const isCurrentBidder = auction.currentBidder === playerIndex;
              const hasPassed = auction.passed.includes(playerIndex);
              const isHuman = player.isHuman;

              return (
                <div key={playerIndex} className={`auction-player ${isCurrentBidder ? 'current-bidder' : ''}`}>
                  <span>
                    {TOKEN_EMOJIS[player.token]} {player.isHuman ? (language === 'da' ? 'Dig' : 'You') : player.name}
                    <span style="margin-left: 8px; color: #006600;">({player.cash.toLocaleString()} kr)</span>
                  </span>
                  {!hasPassed && (
                    <div style="display: flex; gap: 4px; align-items: center;">
                      {isHuman && (
                        <>
                          <input
                            type="number"
                            className="bid-input"
                            value={bidAmount}
                            min={auction.currentBid + 1}
                            max={player.cash}
                            onChange={(e) => setBidAmount(parseInt((e.target as HTMLInputElement).value) || auction.currentBid)}
                          />
                          <button
                            className="action-btn"
                            onClick={() => handleBid(playerIndex)}
                            disabled={bidAmount <= auction.currentBid || bidAmount > player.cash}
                          >
                            {t('bid', language)}
                          </button>
                        </>
                      )}
                      <button className="action-btn" onClick={() => onPass(playerIndex)}>
                        {t('pass', language)}
                      </button>
                    </div>
                  )}
                  {hasPassed && <span style="color: #cc0000;">{t('pass', language)}ed</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
