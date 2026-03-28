// Core Hearts game logic

import type { Card } from '../../lib/card-games';
import { getRankValue, isRed } from '../../lib/card-games';
import type { Player, Trick, PlayerPosition, PassDirection, GamePhase } from './types';
import {
  sortHand,
  isQueenOfSpades,
  isHeart,
  isTwoOfClubs,
  getPlayerToLeft,
  getPlayerToRight,
  getPlayerAcross,
  countPoints,
} from './deck';

/**
 * Check if a card play is valid
 */
export function isValidPlay(
  card: Card,
  hand: Card[],
  trick: Trick,
  heartsBroken: boolean,
  isFirstTrick: boolean,
  isLead: boolean
): boolean {
  // First trick must start with 2 of Clubs
  if (isFirstTrick && trick.cards.length === 0) {
    return isTwoOfClubs(card);
  }

  // If leading
  if (isLead) {
    // Can't lead hearts until broken (unless only hearts left)
    if (isHeart(card) && !heartsBroken) {
      const hasNonHeart = hand.some(c => !isHeart(c));
      if (hasNonHeart) return false;
    }
    return true;
  }

  // Must follow suit if possible
  const leadSuit = trick.leadSuit;
  if (leadSuit) {
    const hasLeadSuit = hand.some(c => c.suit === leadSuit);
    if (hasLeadSuit) {
      return card.suit === leadSuit;
    }
  }

  // First trick: can't play hearts or Queen of Spades
  if (isFirstTrick) {
    if (isHeart(card) || isQueenOfSpades(card)) {
      // Unless that's all you have
      const hasOther = hand.some(c => !isHeart(c) && !isQueenOfSpades(c));
      if (hasOther) return false;
    }
  }

  return true;
}

/**
 * Determine the winner of a trick
 */
export function resolveTrick(trick: Trick): PlayerPosition {
  const leadSuit = trick.leadSuit;
  if (!leadSuit) return trick.leader;

  let winner = trick.leader;
  let highestRank = -1;

  for (const play of trick.cards) {
    if (play.card.suit === leadSuit) {
      const rank = getRankValue(play.card.rank);
      if (rank > highestRank) {
        highestRank = rank;
        winner = play.player;
      }
    }
  }

  return winner;
}

/**
 * Calculate round scores and check for shooting the moon
 */
export function calculateScores(players: Player[]): Player[] {
  // Check if anyone shot the moon (took all 26 points)
  const moonShooter = players.find(p => countPoints(p.collectedCards) === 26);

  return players.map(player => {
    if (moonShooter) {
      // If someone shot the moon, everyone else gets 26 points
      if (player.position === moonShooter.position) {
        return { ...player, roundScore: 0 };
      } else {
        return { ...player, roundScore: 26 };
      }
    } else {
      const points = countPoints(player.collectedCards);
      return { ...player, roundScore: points };
    }
  });
}

/**
 * Select 3 cards for AI to pass
 */
export function selectAIPassCards(hand: Card[]): Card[] {
  const sorted = sortHand(hand);
  const toPass: Card[] = [];

  // Strategy: Pass dangerous cards
  // 1. Queen of Spades and high spades
  // 2. High hearts (A, K, Q)
  // 3. High cards in general

  const queensOfSpades = sorted.filter(c => isQueenOfSpades(c));
  const highSpades = sorted.filter(c => c.suit === 'spades' && getRankValue(c.rank) >= 10 && !isQueenOfSpades(c));
  const highHearts = sorted.filter(c => isHeart(c) && getRankValue(c.rank) >= 10);
  const highCards = sorted.filter(c => getRankValue(c.rank) >= 10).sort((a, b) => getRankValue(b.rank) - getRankValue(a.rank));

  // Add Queen of Spades first
  toPass.push(...queensOfSpades);

  // Then high spades (K, A)
  for (const card of highSpades) {
    if (toPass.length >= 3) break;
    toPass.push(card);
  }

  // Then high hearts
  for (const card of highHearts) {
    if (toPass.length >= 3) break;
    toPass.push(card);
  }

  // Fill remaining with highest cards
  for (const card of highCards) {
    if (toPass.length >= 3) break;
    if (!toPass.includes(card)) {
      toPass.push(card);
    }
  }

  // If still need cards (rare), take from end of sorted hand
  for (let i = sorted.length - 1; i >= 0 && toPass.length < 3; i--) {
    if (!toPass.includes(sorted[i])) {
      toPass.push(sorted[i]);
    }
  }

  return toPass.slice(0, 3);
}

/**
 * AI selects a card to play
 */
export function selectAICard(
  player: Player,
  trick: Card[],
  leadSuit: string | null,
  heartsBroken: boolean,
  isFirstTrick: boolean
): Card {
  const hand = player.hand;
  const validCards = hand.filter(card =>
    isValidPlay(card, hand, { cards: trick.map(c => ({ card: c, player: player.position })), leadSuit: leadSuit as any, leader: player.position, complete: false }, heartsBroken, isFirstTrick, trick.length === 0)
  );

  if (validCards.length === 0) {
    // Should never happen, but return first card as fallback
    return hand[0];
  }

  // If leading
  if (trick.length === 0) {
    // Lead with low card, prefer not hearts
    const nonHearts = validCards.filter(c => !isHeart(c));
    const candidates = nonHearts.length > 0 ? nonHearts : validCards;

    // Lead lowest card
    return candidates.sort((a, b) => getRankValue(a.rank) - getRankValue(b.rank))[0];
  }

  // If following suit
  if (leadSuit) {
    const following = validCards.filter(c => c.suit === leadSuit);

    if (following.length > 0) {
      // Try to play under the highest card of the suit
      const highestPlayed = Math.max(...trick.filter(c => c.suit === leadSuit).map(c => getRankValue(c.rank)));

      // Find highest card that's still under the current winning card
      const underCards = following.filter(c => getRankValue(c.rank) < highestPlayed);

      if (underCards.length > 0) {
        // Play highest under card
        return underCards.sort((a, b) => getRankValue(b.rank) - getRankValue(a.rank))[0];
      }

      // Can't go under, play lowest to minimize damage
      return following.sort((a, b) => getRankValue(a.rank) - getRankValue(b.rank))[0];
    }

    // Can't follow suit - dump a dangerous card
    // Queen of Spades first, then high hearts, then high cards
    const queenOfSpades = validCards.find(c => isQueenOfSpades(c));
    if (queenOfSpades) return queenOfSpades;

    const highHearts = validCards.filter(c => isHeart(c) && getRankValue(c.rank) >= 10);
    if (highHearts.length > 0) {
      return highHearts.sort((a, b) => getRankValue(b.rank) - getRankValue(a.rank))[0];
    }

    const hearts = validCards.filter(c => isHeart(c));
    if (hearts.length > 0) {
      return hearts.sort((a, b) => getRankValue(b.rank) - getRankValue(a.rank))[0];
    }

    // Dump highest card
    return validCards.sort((a, b) => getRankValue(b.rank) - getRankValue(a.rank))[0];
  }

  // Fallback - play lowest valid card
  return validCards.sort((a, b) => getRankValue(a.rank) - getRankValue(b.rank))[0];
}

/**
 * Get pass direction for a round
 */
export function getPassDirection(roundNumber: number): PassDirection {
  const directions: PassDirection[] = ['left', 'right', 'across', 'none'];
  return directions[(roundNumber - 1) % 4];
}

/**
 * Get target player for passing based on direction
 */
export function getPassTarget(
  fromPlayer: PlayerPosition,
  direction: PassDirection
): PlayerPosition {
  switch (direction) {
    case 'left':
      return getPlayerToLeft(fromPlayer);
    case 'right':
      return getPlayerToRight(fromPlayer);
    case 'across':
      return getPlayerAcross(fromPlayer);
    case 'none':
      return fromPlayer;
  }
}

/**
 * Execute card pass between players
 */
export function executePass(
  players: Player[],
  passCards: Record<PlayerPosition, Card[]>,
  direction: PassDirection
): Player[] {
  return players.map(player => {
    const cardsBeingPassed = passCards[player.position] || [];

    // Remove passed cards from hand
    const newHand = player.hand.filter(
      card => !cardsBeingPassed.some(passed => passed.id === card.id)
    );

    // Find who we're receiving from
    let fromPlayer: PlayerPosition;
    switch (direction) {
      case 'left':
        fromPlayer = getPlayerToRight(player.position);
        break;
      case 'right':
        fromPlayer = getPlayerToLeft(player.position);
        break;
      case 'across':
        fromPlayer = getPlayerAcross(player.position);
        break;
      case 'none':
        fromPlayer = player.position;
        break;
    }

    // Add received cards
    const receivedCards = passCards[fromPlayer] || [];
    newHand.push(...receivedCards);

    return {
      ...player,
      hand: sortHand(newHand),
    };
  });
}

/**
 * Check if game is over (someone reached 100 points)
 */
export function isGameOver(players: Player[]): boolean {
  return players.some(p => p.score >= 100);
}

/**
 * Get game winner (lowest score)
 */
export function getWinner(players: Player[]): Player {
  return players.reduce((winner, player) =>
    player.score < winner.score ? player : winner
  );
}
