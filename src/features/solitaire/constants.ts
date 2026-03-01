// Klondike Solitaire constants

import { type Suit } from '../../lib/card-games';

export const TABLEAU_COLUMNS = 7;
export const FOUNDATION_COUNT = 4;

// Standard Windows scoring
export const POINTS_WASTE_TO_TABLEAU = 5;
export const POINTS_WASTE_TO_FOUNDATION = 10;
export const POINTS_TABLEAU_TO_FOUNDATION = 10;
export const POINTS_FLIP_CARD = 5;
export const POINTS_RECYCLE_WASTE = -20;
export const POINTS_TIME_PENALTY = -2; // Every 10 seconds (optional)

// Foundation suits order (standard: left to right)
export const FOUNDATION_SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
