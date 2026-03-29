/**
 * Mahjong Solitaire Type Definitions
 */

/**
 * Position in 3D space (row, column, layer)
 */
export interface Position {
  row: number;
  col: number;
  layer: number;
}

/**
 * Tile suit types
 */
export type TileSuit =
  | 'dot'
  | 'bamboo'
  | 'character'
  | 'wind'
  | 'dragon'
  | 'flower'
  | 'season';

/**
 * Tile value based on suit
 * - Dots, Bamboo, Characters: 1-9
 * - Winds: east, south, west, north
 * - Dragons: red, green, white
 * - Flowers: 1-4 (match each other)
 * - Seasons: 1-4 (match each other)
 */
export type TileValue = number | 'east' | 'south' | 'west' | 'north' | 'red' | 'green' | 'white';

/**
 * Individual tile
 */
export interface Tile {
  id: string;
  suit: TileSuit;
  value: TileValue;
  position: Position;
  isFree: boolean;
  isMatched: boolean;
}

/**
 * Game state
 */
export interface GameState {
  tiles: Tile[];
  selectedTile: Tile | null;
  history: GameState[];
  moves: number;
  timer: number;
  isPlaying: boolean;
  isPaused: boolean;
  isWon: boolean;
  isGameOver: boolean;
  noMovesAvailable: boolean;
}

/**
 * Tile matching result
 */
export interface MatchResult {
  isMatch: boolean;
  reason?: string;
}

/**
 * Hint result
 */
export interface HintResult {
  tile1: Tile | null;
  tile2: Tile | null;
}
