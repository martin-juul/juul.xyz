// Auction Dialog

import { useState, useEffect, useRef, useCallback } from 'preact/hooks';
import type { GameState, Language, Difficulty } from '../../types';
import { t } from '../../translations';
import { TOKEN_EMOJIS } from '../../constants';
import { decideAuctionBid } from '../../ai';

interface AuctionDialogProps {
  state: GameState;
  language: Language;
  onBid: (playerIndex: number, amount: number) => void;
  onPass: (playerIndex: number) => void;
  onClose: () => void;
}

type AuctionPhase = 'human-turn' | 'ai-turn' | 'complete';

export function AuctionDialog({ state, language, onBid, onPass, onClose }: AuctionDialogProps) {
  const auction = state.auction;
  const [bidAmount, setBidAmount] = useState(auction!.currentBid + 10 || 10);
  const [phase, setPhase] = useState<AuctionPhase>('human-turn');
  const [currentAIIndex, setCurrentAIIndex] = useState<number | null>(null);

  // Track which human players have permanently passed
  const humanPassedRef = useRef<Set<number>>(new Set());
  // Track which AIs have been processed this round
  const aiProcessedThisRoundRef = useRef<Set<number>>(new Set());
  // Store latest state in ref for timeout callbacks
  const stateRef = useRef(state);
  stateRef.current = state;
  // Flag to indicate AIs should process after state update
  const shouldProcessAIsRef = useRef(false);

  if (!auction) return null;

  const property = auction.property;
  const name = language === 'da' ? property.nameDa : property.name;

  // Reset when bid changes
  useEffect(() => {
    setBidAmount(auction.currentBid + 10);
    // Reset AI processed tracking for new round
    aiProcessedThisRoundRef.current = new Set();

    // Check if AIs should process (set by handleBid)
    if (shouldProcessAIsRef.current) {
      shouldProcessAIsRef.current = false;
      // Process AIs
      setPhase('ai-turn');
      const firstAI = auction.participants.find(pi =>
        !state.players[pi].isHuman && !auction.passed.includes(pi)
      );
      if (firstAI !== undefined) {
        setCurrentAIIndex(firstAI);
      } else {
        setPhase('human-turn');
      }
    } else {
      // Give human first chance after each bid (including AI bids)
      setPhase('human-turn');
      setCurrentAIIndex(null);
    }
  }, [auction.currentBid, auction.participants, auction.passed, state.players]);

  // Check if auction is complete
  useEffect(() => {
    if (!auction) return;

    const activeBidders = auction.participants.filter(
      p => !auction.passed.includes(p)
    );

    // Auction ends when only one active bidder remains
    if (activeBidders.length <= 1) {
      setPhase('complete');
      // Wait a moment before closing
      const timeoutId = window.setTimeout(() => {
        onClose();
      }, 1500);
      return () => clearTimeout(timeoutId);
    }
  }, [auction?.passed, auction, onClose]);

  // Find next AI to process (defined before it's used)
  const processNextAI = useCallback(() => {
    const currentAuction = stateRef.current.auction;
    if (!currentAuction) return;

    // Find AIs that haven't been processed this round and haven't passed
    const remainingAIs = currentAuction.participants.filter(playerIndex => {
      const player = stateRef.current.players[playerIndex];
      const hasPassed = currentAuction.passed.includes(playerIndex);
      const alreadyProcessed = aiProcessedThisRoundRef.current.has(playerIndex);
      return !player.isHuman && !hasPassed && !alreadyProcessed;
    });

    if (remainingAIs.length === 0) {
      // All AIs processed, give human another chance
      setPhase('human-turn');
      setCurrentAIIndex(null);
    } else {
      // Process next AI
      setCurrentAIIndex(remainingAIs[0]);
    }
  }, []);

  // Process AI players one at a time
  useEffect(() => {
    if (phase !== 'ai-turn' || currentAIIndex === null) return;

    const player = state.players[currentAIIndex];
    if (player.isHuman) {
      // Shouldn't happen, but skip humans
      processNextAI();
      return;
    }

    // Process this AI after a delay
    const timeoutId = window.setTimeout(() => {
      const currentAuction = stateRef.current.auction;
      if (!currentAuction) return;

      // Check if this player already passed
      if (currentAuction.passed.includes(currentAIIndex)) {
        processNextAI();
        return;
      }

      const player = stateRef.current.players[currentAIIndex];
      const bid = decideAuctionBid(
        stateRef.current,
        currentAuction.property,
        currentAuction.currentBid,
        (player.difficulty || 'medium') as Difficulty,
        currentAIIndex
      );

      console.log('[AI Auction]', player.name, bid !== null ? `bids ${bid}` : 'passes');

      if (bid !== null && bid > currentAuction.currentBid) {
        onBid(currentAIIndex, bid);
        // Mark as processed
        aiProcessedThisRoundRef.current.add(currentAIIndex);
      } else {
        onPass(currentAIIndex);
        // Mark as processed and move to next AI
        aiProcessedThisRoundRef.current.add(currentAIIndex);
        // Use setTimeout to avoid state update during render
        window.setTimeout(() => processNextAI(), 0);
      }
    }, 800);

    // Only clear this specific timeout on cleanup
    return () => clearTimeout(timeoutId);
  }, [phase, currentAIIndex, onBid, onPass, processNextAI]);

  // Handle human bid
  const handleBid = (playerIndex: number) => {
    if (bidAmount > auction.currentBid && bidAmount <= state.players[playerIndex].cash) {
      humanPassedRef.current.delete(playerIndex);
      // Set flag to process AIs after state updates
      shouldProcessAIsRef.current = true;
      onBid(playerIndex, bidAmount);
    }
  };

  // Handle human pass
  const handlePass = (playerIndex: number) => {
    humanPassedRef.current.add(playerIndex);
    onPass(playerIndex);
  };

  // Check auction status
  const activeBidders = auction.participants.filter(p => !auction.passed.includes(p));
  const isAuctionComplete = activeBidders.length <= 1;

  // Check if human has permanently passed
  const humanPlayerIndex = auction.participants.find(pi => state.players[pi].isHuman);
  const humanHasPassed = humanPlayerIndex !== undefined && humanPassedRef.current.has(humanPlayerIndex);

  // If human has passed, auto-process AIs
  useEffect(() => {
    if (phase === 'human-turn' && humanHasPassed && !isAuctionComplete) {
      // Human passed, process AIs
      setPhase('ai-turn');
      const firstAI = auction.participants.find(pi =>
        !state.players[pi].isHuman && !auction.passed.includes(pi)
      );
      if (firstAI !== undefined) {
        setCurrentAIIndex(firstAI);
      }
    }
  }, [phase, humanHasPassed, isAuctionComplete, auction.participants, auction.passed]);

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
            {phase === 'human-turn' && !isAuctionComplete && !humanHasPassed && (
              <div style="font-size: 12px; color: #0066cc; margin-top: 4px;">
                {language === 'da' ? 'Din tur til at byde!' : 'Your turn to bid!'}
              </div>
            )}
          </div>

          <div className="auction-bids">
            {auction.participants.map(playerIndex => {
              const player = state.players[playerIndex];
              const isCurrentBidder = auction.currentBidder === playerIndex;
              const hasPassed = auction.passed.includes(playerIndex);
              const isHuman = player.isHuman;
              const isCurrentlyThinking = phase === 'ai-turn' && currentAIIndex === playerIndex;

              return (
                <div key={playerIndex} className={`auction-player ${isCurrentBidder ? 'current-bidder' : ''}`}>
                  <span>
                    {TOKEN_EMOJIS[player.token]} {player.isHuman ? (language === 'da' ? 'Dig' : 'You') : player.name}
                    <span style="margin-left: 8px; color: #006600;">({player.cash.toLocaleString()} kr)</span>
                  </span>
                  {!hasPassed && !isAuctionComplete && (
                    <div style="display: flex; gap: 4px; align-items: center;">
                      {isHuman && !humanHasPassed && phase === 'human-turn' && (
                        <>
                          <input
                            type="number"
                            className="bid-input"
                            value={bidAmount}
                            min={auction.currentBid + 10}
                            max={player.cash}
                            onChange={(e) => setBidAmount(parseInt((e.target as HTMLInputElement).value) || auction.currentBid + 10)}
                            style="width: 70px;"
                          />
                          <button
                            className="action-btn"
                            onClick={() => handleBid(playerIndex)}
                            disabled={bidAmount <= auction.currentBid || bidAmount > player.cash}
                          >
                            {t('bid', language)}
                          </button>
                          <button className="action-btn" onClick={() => handlePass(playerIndex)}>
                            {t('pass', language)}
                          </button>
                        </>
                      )}
                      {isHuman && humanHasPassed && (
                        <span style="font-style: italic; color: #666;">
                          {language === 'da' ? 'Du er ude' : 'You passed'}
                        </span>
                      )}
                      {isHuman && phase === 'ai-turn' && !humanHasPassed && (
                        <span style="font-style: italic; color: #666;">
                          {language === 'da' ? 'Vent på AI...' : 'Waiting for AI...'}
                        </span>
                      )}
                      {!isHuman && isCurrentlyThinking && (
                        <span style="font-style: italic; color: #666;">thinking...</span>
                      )}
                      {!isHuman && !isCurrentlyThinking && (
                        <span style="font-style: italic; color: #999;">waiting</span>
                      )}
                    </div>
                  )}
                  {hasPassed && <span style="color: #cc0000;">{t('pass', language)}ed</span>}
                </div>
              );
            })}
          </div>

          {isAuctionComplete && auction.currentBidder !== null && (
            <div style="text-align: center; margin-top: 12px; padding: 8px; background: #e8f5e9; border-radius: 4px;">
              <strong>{state.players[auction.currentBidder].name}</strong> {language === 'da' ? 'vinder!' : 'wins!'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
