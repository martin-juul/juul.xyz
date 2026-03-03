// Ludo Game Constants

import type { PlayerColor } from './types';

// Board configuration
export const BOARD_SIZE = 52; // Total squares on main track
export const HOME_STRETCH_SIZE = 6; // Squares in each player's home stretch
export const TOKENS_PER_PLAYER = 4;

// Entry points - where each color enters the main track
export const ENTRY_POINTS: Record<PlayerColor, number> = {
  red: 0,
  green: 13,
  yellow: 26,
  blue: 39,
};

// Safe squares - star positions where tokens cannot be captured
export const SAFE_SQUARES = [0, 8, 13, 21, 26, 34, 39, 47];

// Colored entry squares (also safe)
export const COLORED_ENTRY_SQUARES: Record<PlayerColor, number> = {
  red: 0,
  green: 13,
  yellow: 26,
  blue: 39,
};

// Home stretch entry points - where each color enters their final stretch
export const HOME_STRETCH_ENTRY: Record<PlayerColor, number> = {
  red: 50, // After position 51, red enters home stretch
  green: 11, // After position 11, green enters home stretch
  yellow: 24, // After position 24, yellow enters home stretch
  blue: 37, // After position 37, blue enters home stretch
};

// Player colors in turn order
export const PLAYER_COLORS: PlayerColor[] = ['red', 'green', 'yellow', 'blue'];

// Player names
export const PLAYER_NAMES = {
  red: { en: 'Red', da: 'Rød' },
  green: { en: 'Green', da: 'Grøn' },
  yellow: { en: 'Yellow', da: 'Gul' },
  blue: { en: 'Blue', da: 'Blå' },
};

// AI player names
export const AI_NAMES = {
  easy: { en: 'Novice', da: 'Nybegynder' },
  medium: { en: 'Skilled', da: 'Dygtig' },
  hard: { en: 'Expert', da: 'Ekspert' },
};

// Color CSS values
export const PLAYER_COLORS_CSS: Record<PlayerColor, string> = {
  red: '#dc3545',
  green: '#28a745',
  yellow: '#ffc107',
  blue: '#007bff',
};

// Lighter versions for backgrounds
export const PLAYER_COLORS_LIGHT: Record<PlayerColor, string> = {
  red: '#f8d7da',
  green: '#d4edda',
  yellow: '#fff3cd',
  blue: '#cce5ff',
};

// Board layout positions for rendering
// The board is a cross shape with the center being the finish area
// Each arm of the cross has 6 squares leading to a home base

// Track square positions (relative to a conceptual grid)
// The board is rendered as 15x15 grid where:
// - Corners are home bases
// - Center is the finish area
// - Arms are the tracks

export interface BoardPosition {
  x: number;
  y: number;
}

// Main track positions (0-51) mapped to grid coordinates
// Starting from red's entry (top-left arm) going clockwise
export const TRACK_POSITIONS: BoardPosition[] = [
  // Red's entry arm (going down from home base)
  { x: 6, y: 1 },  // 0 - Red entry (safe)
  { x: 6, y: 2 },  // 1
  { x: 6, y: 3 },  // 2
  { x: 6, y: 4 },  // 3
  { x: 6, y: 5 },  // 4
  // Top arm (going right)
  { x: 5, y: 6 },  // 5
  { x: 4, y: 6 },  // 6
  { x: 3, y: 6 },  // 7
  { x: 2, y: 6 },  // 8 - Safe
  { x: 1, y: 6 },  // 9
  { x: 0, y: 6 },  // 10
  // Green's home stretch entry point at 11
  { x: 0, y: 7 },  // 11
  { x: 0, y: 8 },  // 12
  // Green's entry arm (going right)
  { x: 1, y: 8 },  // 13 - Green entry (safe)
  { x: 2, y: 8 },  // 14
  { x: 3, y: 8 },  // 15
  { x: 4, y: 8 },  // 16
  { x: 5, y: 8 },  // 17
  // Left arm (going down)
  { x: 6, y: 9 },  // 18
  { x: 6, y: 10 }, // 19
  { x: 6, y: 11 }, // 20
  { x: 6, y: 12 }, // 21 - Safe
  { x: 6, y: 13 }, // 22
  { x: 6, y: 14 }, // 23
  // Yellow's home stretch entry point at 24
  { x: 7, y: 14 }, // 24
  { x: 8, y: 14 }, // 25
  // Yellow's entry arm (going left)
  { x: 8, y: 13 }, // 26 - Yellow entry (safe)
  { x: 8, y: 12 }, // 27
  { x: 8, y: 11 }, // 28
  { x: 8, y: 10 }, // 29
  { x: 8, y: 9 },  // 30
  // Bottom arm (going left)
  { x: 9, y: 8 },  // 31
  { x: 10, y: 8 }, // 32
  { x: 11, y: 8 }, // 33
  { x: 12, y: 8 }, // 34 - Safe
  { x: 13, y: 8 }, // 35
  { x: 14, y: 8 }, // 36
  // Blue's home stretch entry point at 37
  { x: 14, y: 7 }, // 37
  { x: 14, y: 6 }, // 38
  // Blue's entry arm (going up)
  { x: 13, y: 6 }, // 39 - Blue entry (safe)
  { x: 12, y: 6 }, // 40
  { x: 11, y: 6 }, // 41
  { x: 10, y: 6 }, // 42
  { x: 9, y: 6 },  // 43
  // Right arm (going up)
  { x: 8, y: 5 },  // 44
  { x: 8, y: 4 },  // 45
  { x: 8, y: 3 },  // 46
  { x: 8, y: 2 },  // 47 - Safe
  { x: 8, y: 1 },  // 48
  { x: 8, y: 0 },  // 49
  // Red's home stretch entry point at 50
  { x: 7, y: 0 },  // 50
  { x: 6, y: 0 },  // 51
];

// Home stretch positions for each color (6 squares leading to center)
export const HOME_STRETCH_POSITIONS: Record<PlayerColor, BoardPosition[]> = {
  red: [
    { x: 7, y: 1 },
    { x: 7, y: 2 },
    { x: 7, y: 3 },
    { x: 7, y: 4 },
    { x: 7, y: 5 },
    { x: 7, y: 6 },
  ],
  green: [
    { x: 1, y: 7 },
    { x: 2, y: 7 },
    { x: 3, y: 7 },
    { x: 4, y: 7 },
    { x: 5, y: 7 },
    { x: 6, y: 7 },
  ],
  yellow: [
    { x: 7, y: 13 },
    { x: 7, y: 12 },
    { x: 7, y: 11 },
    { x: 7, y: 10 },
    { x: 7, y: 9 },
    { x: 7, y: 8 },
  ],
  blue: [
    { x: 13, y: 7 },
    { x: 12, y: 7 },
    { x: 11, y: 7 },
    { x: 10, y: 7 },
    { x: 9, y: 7 },
    { x: 8, y: 7 },
  ],
};

// Home base positions (where tokens start)
export const HOME_BASE_POSITIONS: Record<PlayerColor, BoardPosition> = {
  red: { x: 1, y: 1 },
  green: { x: 1, y: 10 },
  yellow: { x: 10, y: 10 },
  blue: { x: 10, y: 1 },
};

// Finish area (center of board)
export const FINISH_POSITIONS: BoardPosition[] = [
  { x: 7, y: 7 },  // Center
];

// Maximum consecutive sixes before turn ends
export const MAX_CONSECUTIVE_SIXES = 3;
