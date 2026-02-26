// Deck creation and card utilities

import { type Suit, type Rank, type Card, SUITS, RANKS } from './types';

/**
 * Get the numeric value of a rank (A=0, 2=1, ..., K=12)
 */
export function getRankValue(rank: Rank): number {
  return RANKS.indexOf(rank);
}

/**
 * Check if a suit is red (hearts or diamonds)
 */
export function isRed(suit: Suit): boolean {
  return suit === 'hearts' || suit === 'diamonds';
}

/**
 * Create a standard 52-card deck
 */
export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank, id: `${suit}-${rank}` });
    }
  }
  return deck;
}

/**
 * Create multiple decks (for games like Spider that use 2 decks)
 */
export function createDecks(count: number): Card[] {
  const deck: Card[] = [];
  for (let i = 0; i < count; i++) {
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        deck.push({ suit, rank, id: `${suit}-${rank}-${i}` });
      }
    }
  }
  return deck;
}

/**
 * Create a deck with only specific suits (for Spider difficulty levels)
 */
export function createDeckWithSuits(suits: Suit[], decks: number = 1): Card[] {
  const deck: Card[] = [];
  let cardIndex = 0;
  for (let d = 0; d < decks; d++) {
    for (const suit of suits) {
      for (const rank of RANKS) {
        deck.push({ suit, rank, id: `${suit}-${rank}-${cardIndex++}` });
      }
    }
  }
  return deck;
}
