// Hearts-specific types and interfaces

import type { Card } from '../../lib/card-games';

export type PlayerPosition = 'south' | 'west' | 'north' | 'east';
export type PassDirection = 'left' | 'right' | 'across' | 'none';
export type GamePhase = 'passing' | 'playing' | 'trickEnd' | 'roundEnd' | 'gameEnd';

export type Player = {
  position: PlayerPosition;
  isHuman: boolean;
  hand: Card[];
  score: number;
  roundScore: number;
  collectedCards: Card[]; // Cards taken in tricks this round
};

export type Trick = {
  cards: Array<{
    card: Card;
    player: PlayerPosition;
  }>;
  leader: PlayerPosition;
  winner?: PlayerPosition;
  leadSuit?: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  complete: boolean;
};

export type GameState = {
  phase: GamePhase;
  players: Player[];
  currentTrick: Trick;
  currentPlayer: PlayerPosition;
  passDirection: PassDirection;
  heartsBroken: boolean;
  roundNumber: number;
  selectedCards: Card[]; // For passing phase
  trickNumber: number;
};

export type AIDifficulty = 'easy' | 'medium' | 'hard';
