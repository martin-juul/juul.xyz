// Hearts-specific deck utilities

import type { Card, Suit, Rank } from '../../lib/card-games';
import { createDeck, getRankValue } from '../../lib/card-games';
import type { Player } from './types';

const RANK_ORDER: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const SUIT_ORDER: Suit[] = ['clubs', 'diamonds', 'spades', 'hearts'];

/**
 * Deal cards to 4 players for Hearts
 */
export function dealCards(): Player[] {
  const deck = createDeck();

  // Shuffle using simple random (Hearts doesn't need seeded shuffle)
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  const positions: Array<'south' | 'west' | 'north' | 'east'> = ['south', 'west', 'north', 'east'];

  return positions.map((position, index) => ({
    position,
    isHuman: position === 'south',
    hand: deck.slice(index * 13, (index + 1) * 13),
    score: 0,
    roundScore: 0,
    collectedCards: [],
  }));
}

/**
 * Sort a hand by suit (clubs, diamonds, spades, hearts) then by rank (2-A)
 */
export function sortHand(hand: Card[]): Card[] {
  return [...hand].sort((a, b) => {
    const suitDiff = SUIT_ORDER.indexOf(a.suit) - SUIT_ORDER.indexOf(b.suit);
    if (suitDiff !== 0) return suitDiff;
    return RANK_ORDER.indexOf(a.rank) - RANK_ORDER.indexOf(b.rank);
  });
}

/**
 * Check if a card is the Queen of Spades
 */
export function isQueenOfSpades(card: Card): boolean {
  return card.suit === 'spades' && card.rank === 'Q';
}

/**
 * Check if a card is a heart
 */
export function isHeart(card: Card): boolean {
  return card.suit === 'hearts';
}

/**
 * Check if a card is the 2 of Clubs (must lead first trick)
 */
export function isTwoOfClubs(card: Card): boolean {
  return card.suit === 'clubs' && card.rank === '2';
}

/**
 * Count points in cards (hearts = 1, Queen of Spades = 13)
 */
export function countPoints(cards: Card[]): number {
  let points = 0;
  for (const card of cards) {
    if (isHeart(card)) points += 1;
    if (isQueenOfSpades(card)) points += 13;
  }
  return points;
}

/**
 * Get the player to the left of the given player
 */
export function getPlayerToLeft(position: 'south' | 'west' | 'north' | 'east'): 'south' | 'west' | 'north' | 'east' {
  const order: Array<'south' | 'west' | 'north' | 'east'> = ['south', 'west', 'north', 'east'];
  const index = order.indexOf(position);
  return order[(index + 1) % 4];
}

/**
 * Get the player to the right of the given player
 */
export function getPlayerToRight(position: 'south' | 'west' | 'north' | 'east'): 'south' | 'west' | 'north' | 'east' {
  const order: Array<'south' | 'west' | 'north' | 'east'> = ['south', 'west', 'north', 'east'];
  const index = order.indexOf(position);
  return order[(index + 3) % 4];
}

/**
 * Get the player across from the given player
 */
export function getPlayerAcross(position: 'south' | 'west' | 'north' | 'east'): 'south' | 'west' | 'north' | 'east' {
  const order: Array<'south' | 'west' | 'north' | 'east'> = ['south', 'west', 'north', 'east'];
  const index = order.indexOf(position);
  return order[(index + 2) % 4];
}
