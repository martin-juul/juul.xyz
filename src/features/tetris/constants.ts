/**
 * Tetris Constants
 * Standard tetromino shapes, colors, and game rules
 */

import { TetrominoType } from './types';

/** Board dimensions */
export const BOARD_ROWS = 20;
export const BOARD_COLS = 10;

/** Standard Tetromino shapes (rotation states) */
export const TETROMINO_SHAPES: Record<TetrominoType, number[][][]> = {
  I: [
    [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]], // Horizontal
    [[0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0]], // Vertical
    [[0, 0, 0, 0], [0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0]], // Horizontal (flipped)
    [[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0]], // Vertical (flipped)
  ],
  O: [
    [[1, 1], [1, 1]],
    [[1, 1], [1, 1]],
    [[1, 1], [1, 1]],
    [[1, 1], [1, 1]],
  ],
  T: [
    [[0, 1, 0], [1, 1, 1], [0, 0, 0]], // T up
    [[0, 1, 0], [0, 1, 1], [0, 1, 0]], // T right
    [[0, 0, 0], [1, 1, 1], [0, 1, 0]], // T down
    [[0, 1, 0], [1, 1, 0], [0, 1, 0]], // T left
  ],
  S: [
    [[0, 1, 1], [1, 1, 0], [0, 0, 0]], // S horizontal
    [[0, 1, 0], [0, 1, 1], [0, 0, 1]], // S vertical
    [[0, 0, 0], [0, 1, 1], [1, 1, 0]], // S horizontal (flipped)
    [[1, 0, 0], [1, 1, 0], [0, 1, 0]], // S vertical (flipped)
  ],
  Z: [
    [[1, 1, 0], [0, 1, 1], [0, 0, 0]], // Z horizontal
    [[0, 0, 1], [0, 1, 1], [0, 1, 0]], // Z vertical
    [[0, 0, 0], [1, 1, 0], [0, 1, 1]], // Z horizontal (flipped)
    [[0, 1, 0], [1, 1, 0], [1, 0, 0]], // Z vertical (flipped)
  ],
  J: [
    [[1, 0, 0], [1, 1, 1], [0, 0, 0]], // J up
    [[0, 1, 1], [0, 1, 0], [0, 1, 0]], // J right
    [[0, 0, 0], [1, 1, 1], [0, 0, 1]], // J down
    [[0, 1, 0], [0, 1, 0], [1, 1, 0]], // J left
  ],
  L: [
    [[0, 0, 1], [1, 1, 1], [0, 0, 0]], // L up
    [[0, 1, 0], [0, 1, 0], [0, 1, 1]], // L right
    [[0, 0, 0], [1, 1, 1], [1, 0, 0]], // L down
    [[1, 1, 0], [0, 1, 0], [0, 1, 0]], // L left
  ],
};

/** Classic Tetromino colors (RGB hex) */
export const TETROMINO_COLORS: Record<TetrominoType, string> = {
  I: '#00f0f0', // Cyan
  O: '#f0f000', // Yellow
  T: '#a000f0', // Purple
  S: '#00f000', // Green
  Z: '#f00000', // Red
  J: '#0000f0', // Blue
  L: '#f0a000', // Orange
};

/** Starting position for new pieces (top center) */
export const START_POSITION = { row: 0, col: 3 };

/** Scoring rules (Nintendo system) */
export const SCORING = {
  1: 40,
  2: 100,
  3: 300,
  4: 1200,
};

/** Lines needed to level up */
export const LINES_PER_LEVEL = 10;

/** Speed calculation: max(100ms, 1000ms - (level * 100ms)) */
export function getDropSpeed(level: number): number {
  return Math.max(100, 1000 - level * 100);
}

/** Calculate score based on lines cleared and current level */
export function calculateScore(lines: number, level: number): number {
  const baseScore = SCORING[lines as keyof typeof SCORING] || 0;
  return baseScore * (level + 1);
}
