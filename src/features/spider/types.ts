// Spider Solitaire types

import { type Suit, type Card, type GameStats } from '../../lib/card-games';

// Re-export for convenience
export type { Suit, Card, GameStats };

export type SpiderDifficulty = 1 | 2 | 4; // Number of suits

export type SpiderGameState = {
  tableau: Card[][]; // 10 columns
  stock: Card[]; // Remaining cards to deal
  completed: Card[][]; // Completed K-A sequences (8 total to win)
};

export type SpiderStats = GameStats & {
  bestScore: number;
  bestTime: number;
};

export type DragInfo = {
  source: 'tableau';
  columnIndex: number;
  cardIndex: number;
  cards: Card[];
};

export type SpiderDifficultyConfig = {
  suits: Suit[];
  label: string;
};
