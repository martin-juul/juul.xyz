// Spider Solitaire constants

import { type Suit, type SpiderDifficulty, type SpiderDifficultyConfig } from './types';

export const TABLEAU_COLUMNS = 10;
export const TOTAL_DECKS = 2; // Spider uses 2 decks (104 cards)
export const CARDS_PER_DEAL = 10; // Deal 1 card to each column
export const TOTAL_COMPLETE_SEQUENCES = 8; // Need 8 K-A sequences to win

export const DIFFICULTY_CONFIG: Record<SpiderDifficulty, SpiderDifficultyConfig> = {
  1: {
    suits: ['spades'] as Suit[],
    label: '1 Suit (Easy)',
  },
  2: {
    suits: ['spades', 'hearts'] as Suit[],
    label: '2 Suits (Medium)',
  },
  4: {
    suits: ['spades', 'hearts', 'clubs', 'diamonds'] as Suit[],
    label: '4 Suits (Hard)',
  },
};

// Points system (classic Windows Spider scoring)
export const POINTS_INITIAL = 500;
export const POINTS_PER_MOVE = -1;
export const POINTS_PER_SEQUENCE = 100;
