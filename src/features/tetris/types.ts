/**
 * Tetris Type Definitions
 */

/** The 7 standard tetromino shapes */
export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

/** Position on the board (row, col) */
export interface Position {
  row: number;
  col: number;
}

/** A single tetromino piece */
export interface Tetromino {
  type: TetrominoType;
  shape: number[][]; // Binary matrix representing the piece shape
  position: Position;
  color: string;
}

/** Board is a 20x10 grid. null = empty, string = color of locked piece */
export type Board = (string | null)[][];

/** Complete game state */
export interface GameState {
  board: Board;
  currentPiece: Tetromino;
  nextPiece: Tetromino;
  score: number;
  level: number;
  lines: number;
  isGameOver: boolean;
  isPaused: boolean;
}

/** Statistics for tracking games */
export interface TetrisStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  bestStreak: number;
  highScore: number;
  totalLines: number;
}

/** Result of a move operation */
export interface MoveResult {
  success: boolean;
  newPiece?: Tetromino;
  locked?: boolean;
  newBoard?: Board;  // Updated board after locking
  linesCleared?: number;
  gameOver?: boolean;
}

/** Rotation direction */
export type RotationDirection = 'clockwise' | 'counterclockwise';
