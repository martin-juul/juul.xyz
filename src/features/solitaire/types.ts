// Klondike Solitaire types

import { type Suit, type Card, type GameStats } from '../../lib/card-games';

// Re-export for convenience
export type { Suit, Card, GameStats };

export type KlondikeGameState = {
  tableau: Card[][]; // 7 columns
  stock: Card[]; // Remaining cards to deal
  waste: Card[]; // Cards dealt from stock
  foundations: Card[][]; // 4 foundation piles (A-K by suit)
  passCount: number; // How many times waste has been recycled
};

export type KlondikeStats = GameStats & {
  bestScore: number;
  bestTime: number;
  bestMoves: number;
};

export type DragInfo = {
  source: 'tableau' | 'waste' | 'foundation';
  columnIndex?: number;
  cardIndex?: number;
  cards: Card[];
};

export type Hint = {
  source: 'tableau' | 'waste';
  columnIndex?: number;
  cardIndex?: number;
  target: 'tableau' | 'foundation';
  targetIndex: number;
};
