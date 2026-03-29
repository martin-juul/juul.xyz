/**
 * Mahjong Solitaire Constants
 * Tile definitions and traditional turtle layout
 */

import type { Position } from './types';

// Tile dimensions and spacing
export const TILE_WIDTH = 40;
export const TILE_HEIGHT = 56;
export const TILE_THICKNESS = 6;
export const TILE_SPACING = 4;

// Layer offsets for 3D effect
export const LAYER_OFFSET_X = 2;
export const LAYER_OFFSET_Y = 2;

// Z-index base for layers
export const Z_INDEX_BASE = 10;

/**
 * Tile suit definitions
 * Each tile appears 4 times in the set (except flowers/seasons which match across suits)
 */
export const TILE_DEFS = {
  // Dots: 1-9 (4 copies each = 36 tiles)
  dots: Array.from({ length: 9 }, (_, i) => ({ suit: 'dot', value: i + 1 })),
  // Bamboo: 1-9 (4 copies each = 36 tiles)
  bamboo: Array.from({ length: 9 }, (_, i) => ({ suit: 'bamboo', value: i + 1 })),
  // Characters: 1-9 (4 copies each = 36 tiles)
  character: Array.from({ length: 9 }, (_, i) => ({ suit: 'character', value: i + 1 })),
  // Winds: 4 directions (4 copies each = 16 tiles)
  winds: [
    { suit: 'wind', value: 'east' },
    { suit: 'wind', value: 'south' },
    { suit: 'wind', value: 'west' },
    { suit: 'wind', value: 'north' },
  ],
  // Dragons: 3 colors (4 copies each = 12 tiles)
  dragons: [
    { suit: 'dragon', value: 'red' },
    { suit: 'dragon', value: 'green' },
    { suit: 'dragon', value: 'white' },
  ],
  // Flowers: 4 tiles (match each other = 4 tiles)
  flowers: [
    { suit: 'flower', value: 1 },
    { suit: 'flower', value: 2 },
    { suit: 'flower', value: 3 },
    { suit: 'flower', value: 4 },
  ],
  // Seasons: 4 tiles (match each other = 4 tiles)
  seasons: [
    { suit: 'season', value: 1 },
    { suit: 'season', value: 2 },
    { suit: 'season', value: 3 },
    { suit: 'season', value: 4 },
  ],
} as const;

/**
 * Traditional turtle layout
 * 5 layers, coordinates are (row, col, layer)
 * Layer 0: Base foundation
 * Layer 1-4: Stacked tiles creating the turtle shape
 */
export const TURTLE_LAYOUT: Position[] = [
  // Layer 0: Base foundation (8x12 grid, mostly empty center)
  // Top edge
  { row: 0, col: 4, layer: 0 },
  { row: 0, col: 5, layer: 0 },
  { row: 0, col: 6, layer: 0 },
  { row: 0, col: 7, layer: 0 },
  // Second row
  { row: 1, col: 3, layer: 0 },
  { row: 1, col: 4, layer: 0 },
  { row: 1, col: 5, layer: 0 },
  { row: 1, col: 6, layer: 0 },
  { row: 1, col: 7, layer: 0 },
  { row: 1, col: 8, layer: 0 },
  // Third row
  { row: 2, col: 2, layer: 0 },
  { row: 2, col: 3, layer: 0 },
  { row: 2, col: 4, layer: 0 },
  { row: 2, col: 5, layer: 0 },
  { row: 2, col: 6, layer: 0 },
  { row: 2, col: 7, layer: 0 },
  { row: 2, col: 8, layer: 0 },
  { row: 2, col: 9, layer: 0 },
  // Fourth row
  { row: 3, col: 1, layer: 0 },
  { row: 3, col: 2, layer: 0 },
  { row: 3, col: 3, layer: 0 },
  { row: 3, col: 4, layer: 0 },
  { row: 3, col: 5, layer: 0 },
  { row: 3, col: 6, layer: 0 },
  { row: 3, col: 7, layer: 0 },
  { row: 3, col: 8, layer: 0 },
  { row: 3, col: 9, layer: 0 },
  { row: 3, col: 10, layer: 0 },
  // Fifth row
  { row: 4, col: 0, layer: 0 },
  { row: 4, col: 1, layer: 0 },
  { row: 4, col: 2, layer: 0 },
  { row: 4, col: 3, layer: 0 },
  { row: 4, col: 4, layer: 0 },
  { row: 4, col: 5, layer: 0 },
  { row: 4, col: 6, layer: 0 },
  { row: 4, col: 7, layer: 0 },
  { row: 4, col: 8, layer: 0 },
  { row: 4, col: 9, layer: 0 },
  { row: 4, col: 10, layer: 0 },
  { row: 4, col: 11, layer: 0 },
  // Sixth row (same as fifth)
  { row: 5, col: 0, layer: 0 },
  { row: 5, col: 1, layer: 0 },
  { row: 5, col: 2, layer: 0 },
  { row: 5, col: 3, layer: 0 },
  { row: 5, col: 4, layer: 0 },
  { row: 5, col: 5, layer: 0 },
  { row: 5, col: 6, layer: 0 },
  { row: 5, col: 7, layer: 0 },
  { row: 5, col: 8, layer: 0 },
  { row: 5, col: 9, layer: 0 },
  { row: 5, col: 10, layer: 0 },
  { row: 5, col: 11, layer: 0 },
  // Seventh row (same as fourth)
  { row: 6, col: 1, layer: 0 },
  { row: 6, col: 2, layer: 0 },
  { row: 6, col: 3, layer: 0 },
  { row: 6, col: 4, layer: 0 },
  { row: 6, col: 5, layer: 0 },
  { row: 6, col: 6, layer: 0 },
  { row: 6, col: 7, layer: 0 },
  { row: 6, col: 8, layer: 0 },
  { row: 6, col: 9, layer: 0 },
  { row: 6, col: 10, layer: 0 },
  // Eighth row (same as third)
  { row: 7, col: 2, layer: 0 },
  { row: 7, col: 3, layer: 0 },
  { row: 7, col: 4, layer: 0 },
  { row: 7, col: 5, layer: 0 },
  { row: 7, col: 6, layer: 0 },
  { row: 7, col: 7, layer: 0 },
  { row: 7, col: 8, layer: 0 },
  { row: 7, col: 9, layer: 0 },
  // Ninth row (same as second)
  { row: 8, col: 3, layer: 0 },
  { row: 8, col: 4, layer: 0 },
  { row: 8, col: 5, layer: 0 },
  { row: 8, col: 6, layer: 0 },
  { row: 8, col: 7, layer: 0 },
  { row: 8, col: 8, layer: 0 },
  // Tenth row (same as top)
  { row: 9, col: 4, layer: 0 },
  { row: 9, col: 5, layer: 0 },
  { row: 9, col: 6, layer: 0 },
  { row: 9, col: 7, layer: 0 },

  // Layer 1: Inner turtle (6x8 grid)
  { row: 2, col: 4, layer: 1 },
  { row: 2, col: 5, layer: 1 },
  { row: 2, col: 6, layer: 1 },
  { row: 2, col: 7, layer: 1 },
  { row: 3, col: 3, layer: 1 },
  { row: 3, col: 4, layer: 1 },
  { row: 3, col: 5, layer: 1 },
  { row: 3, col: 6, layer: 1 },
  { row: 3, col: 7, layer: 1 },
  { row: 3, col: 8, layer: 1 },
  { row: 4, col: 2, layer: 1 },
  { row: 4, col: 3, layer: 1 },
  { row: 4, col: 4, layer: 1 },
  { row: 4, col: 5, layer: 1 },
  { row: 4, col: 6, layer: 1 },
  { row: 4, col: 7, layer: 1 },
  { row: 4, col: 8, layer: 1 },
  { row: 4, col: 9, layer: 1 },
  { row: 5, col: 2, layer: 1 },
  { row: 5, col: 3, layer: 1 },
  { row: 5, col: 4, layer: 1 },
  { row: 5, col: 5, layer: 1 },
  { row: 5, col: 6, layer: 1 },
  { row: 5, col: 7, layer: 1 },
  { row: 5, col: 8, layer: 1 },
  { row: 5, col: 9, layer: 1 },
  { row: 6, col: 3, layer: 1 },
  { row: 6, col: 4, layer: 1 },
  { row: 6, col: 5, layer: 1 },
  { row: 6, col: 6, layer: 1 },
  { row: 6, col: 7, layer: 1 },
  { row: 6, col: 8, layer: 1 },
  { row: 7, col: 4, layer: 1 },
  { row: 7, col: 5, layer: 1 },
  { row: 7, col: 6, layer: 1 },
  { row: 7, col: 7, layer: 1 },

  // Layer 2: Center stack (4x6 grid)
  { row: 3, col: 4, layer: 2 },
  { row: 3, col: 5, layer: 2 },
  { row: 3, col: 6, layer: 2 },
  { row: 3, col: 7, layer: 2 },
  { row: 4, col: 3, layer: 2 },
  { row: 4, col: 4, layer: 2 },
  { row: 4, col: 5, layer: 2 },
  { row: 4, col: 6, layer: 2 },
  { row: 4, col: 7, layer: 2 },
  { row: 4, col: 8, layer: 2 },
  { row: 5, col: 3, layer: 2 },
  { row: 5, col: 4, layer: 2 },
  { row: 5, col: 5, layer: 2 },
  { row: 5, col: 6, layer: 2 },
  { row: 5, col: 7, layer: 2 },
  { row: 5, col: 8, layer: 2 },
  { row: 6, col: 4, layer: 2 },
  { row: 6, col: 5, layer: 2 },
  { row: 6, col: 6, layer: 2 },
  { row: 6, col: 7, layer: 2 },

  // Layer 3: Inner center (2x4 grid)
  { row: 4, col: 4, layer: 3 },
  { row: 4, col: 5, layer: 3 },
  { row: 4, col: 6, layer: 3 },
  { row: 4, col: 7, layer: 3 },
  { row: 5, col: 4, layer: 3 },
  { row: 5, col: 5, layer: 3 },
  { row: 5, col: 6, layer: 3 },
  { row: 5, col: 7, layer: 3 },

  // Layer 4: Top (single tile - the head)
  { row: 4, col: 5, layer: 4 },
  { row: 4, col: 6, layer: 4 },
];

/**
 * Calculate pixel position from grid position
 */
export function getPixelPosition(position: Position): { x: number; y: number } {
  return {
    x: position.col * (TILE_WIDTH + TILE_SPACING) + position.layer * LAYER_OFFSET_X,
    y: position.row * (TILE_HEIGHT + TILE_SPACING) + position.layer * LAYER_OFFSET_Y,
  };
}

/**
 * Get z-index for a tile based on its layer
 */
export function getZIndex(layer: number): number {
  return Z_INDEX_BASE + layer * 10;
}

/**
 * Check if a position is blocked by another tile on the same layer
 */
export function isPositionBlocked(
  pos: Position,
  tiles: Array<{ position: Position }>
): boolean {
  return tiles.some(
    tile =>
      tile.position.layer === pos.layer &&
      tile.position.row === pos.row &&
      tile.position.col === pos.col
  );
}

/**
 * Check if a position is covered by a tile on the layer above
 */
export function isPositionCovered(
  pos: Position,
  tiles: Array<{ position: Position }>
): boolean {
  return tiles.some(
    tile =>
      tile.position.layer === pos.layer + 1 &&
      Math.abs(tile.position.row - pos.row) <= 1 &&
      Math.abs(tile.position.col - pos.col) <= 1
  );
}
