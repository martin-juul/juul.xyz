// Ludo Game Types

export type PlayerColor = 'red' | 'green' | 'yellow' | 'blue';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type TokenState = 'home' | 'active' | 'finished';
export type GamePhase = 'setup' | 'rolling' | 'selectToken' | 'aiTurn' | 'gameover';

export interface Token {
  id: string;
  color: PlayerColor;
  state: TokenState;
  position: number; // -1 = home, 0-51 = main track, 52-57 = home stretch
}

export interface Player {
  id: number;
  color: PlayerColor;
  name: string;
  isHuman: boolean;
  difficulty?: Difficulty;
  tokens: Token[];
  finishedTokens: number;
  consecutiveSixes: number;
}

export interface Hint {
  tokenId: string;
  reason: string;
  priority: 'recommended' | 'suggested' | 'possible';
}

export interface GameState {
  players: Player[];
  currentPlayer: number;
  phase: GamePhase;
  dice: number;
  diceRolled: boolean;
  lastRoll: number | null;
  movableTokens: string[];
  winner: number | null;
  turnCount: number;
  hints: Hint[];
  hintsEnabled: boolean;
  turnMessage: string | null;
}

export interface LudoStats {
  gamesPlayed: number;
  gamesWon: number;
  gamesWonByDifficulty: { easy: number; medium: number; hard: number };
  tokensFinished: number;
  tokensCaptured: number;
  tokensLost: number;
  currentStreak: number;
  bestStreak: number;
  hasPlayedBefore: boolean;
}

export interface DialogState {
  setup: boolean;
  tutorial: boolean;
  help: boolean;
  gameOver: boolean;
}

export type Language = 'en' | 'da';
