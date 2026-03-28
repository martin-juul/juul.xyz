// Pipe Dream Game Types

export type CellType = 'empty' | 'vertical' | 'horizontal' | 'ne' | 'nw' | 'se' | 'sw' | 'cross' | 'start' | 'end';

export type FlowState = 'none' | 'flowing' | 'filled' | 'spilled';

export type Direction = 'up' | 'down' | 'left' | 'right';

export type Cell = {
  type: CellType;
  flowState: FlowState;
  flowDirection?: Direction;
};

export type GameData = {
  grid: Cell[][];
  queue: CellType[];
  flowPosition: { row: number; col: number } | null;
  flowDirection: Direction | null;
  gameState: 'idle' | 'playing' | 'flowing' | 'won' | 'lost';
  level: number;
  score: number;
  pipesPlaced: number;
  highScore: number;
  flowDelay: number; // ms before flow starts
  flowSpeed: number; // ms per tile
  flowTimer: number; // countdown until flow starts (ms)
  lastFlowAdvance: number; // timestamp of last flow advance
};

// Grid dimensions
export const GRID_COLS = 10;
export const GRID_ROWS = 8;

// Pipe types that can appear in the queue (randomly generated)
export const QUEUE_PIPE_TYPES: CellType[] = ['vertical', 'horizontal', 'ne', 'nw', 'se', 'sw'];

// Get opposite direction
export function getOppositeDirection(dir: Direction): Direction {
  switch (dir) {
    case 'up': return 'down';
    case 'down': return 'up';
    case 'left': return 'right';
    case 'right': return 'left';
  }
}

// Get all directions a pipe type connects to
export function getPipeConnections(type: CellType): Direction[] {
  switch (type) {
    case 'vertical': return ['up', 'down'];
    case 'horizontal': return ['left', 'right'];
    case 'ne': return ['up', 'right'];
    case 'nw': return ['up', 'left'];
    case 'se': return ['down', 'right'];
    case 'sw': return ['down', 'left'];
    case 'cross': return ['up', 'down', 'left', 'right'];
    case 'start': return ['right']; // Start flows to the right initially
    case 'end': return ['left', 'right', 'up', 'down']; // Can accept from any direction
    case 'empty': return [];
    default: return [];
  }
}

// Check if a pipe type can connect in a specific direction
export function canConnect(type: CellType, dir: Direction): boolean {
  return getPipeConnections(type).includes(dir);
}

// Get the output direction given an input direction for a pipe
export function getOutputDirection(type: CellType, inputDir: Direction): Direction | null {
  if (type === 'end') return null; // End doesn't output
  if (type === 'cross') return getOppositeDirection(inputDir); // Cross goes straight through

  const connections = getPipeConnections(type);
  const inputOpposite = getOppositeDirection(inputDir);

  for (const dir of connections) {
    if (dir !== inputOpposite) {
      return dir;
    }
  }

  return null;
}
