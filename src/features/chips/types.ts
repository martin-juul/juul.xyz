// Tile types in Chip's Challenge
export enum TileType {
  EMPTY = 'empty',
  WALL = 'wall',
  FLOOR = 'floor',
  ICE = 'ice',
  WATER = 'water',
  FIRE = 'fire',
  CHIP = 'chip',
  EXIT = 'exit',
  KEY_RED = 'key_red',
  KEY_BLUE = 'key_blue',
  KEY_GREEN = 'key_green',
  KEY_YELLOW = 'key_yellow',
  DOOR_RED = 'door_red',
  DOOR_BLUE = 'door_blue',
  DOOR_GREEN = 'door_green',
  DOOR_YELLOW = 'door_yellow',
  ICE_WALL = 'ice_wall', // Indestructible wall on ice
  GRAVEL = 'gravel',
  DIRT = 'dirty', // Walk-over dirt
  HINT = 'hint', // Hint tile
  BOOTS_ICE = 'boots_ice', // Ice boots
  BOOTS_WATER = 'boots_water', // Water boots
  BOOTS_FIRE = 'boots_fire', // Fire boots
  FORCE_FLOOR = 'force_floor', // Arrow floor
  FORCE_NORTH = 'force_north',
  FORCE_EAST = 'force_east',
  FORCE_SOUTH = 'force_south',
  FORCE_WEST = 'force_west',
  MONSTER_BUG = 'monster_bug', // Bug monster
  MONSTER_FIREBALL = 'monster_fireball', // Fireball monster
  MONSTER_BALL = 'monster_ball', // Ball monster
  MONSTER_GHOST = 'monster_ghost', // Ghost monster
  MONSTER_TANK = 'monster_tank', // Tank monster
}

// Direction for movement
export type Direction = 'up' | 'down' | 'left' | 'right';

// Key colors
export type KeyColor = 'red' | 'blue' | 'green' | 'yellow';

// Boot types
export type BootType = 'ice' | 'water' | 'fire';

// Game state
export type GameState = 'idle' | 'playing' | 'won' | 'lost';

// Position on grid
export interface Position {
  x: number;
  y: number;
}

// Player inventory
export interface Inventory {
  keys: KeyColor[];
  boots: BootType[];
}

// Level data
export interface Level {
  number: number;
  name: string;
  grid: TileType[][];
  playerStart: Position;
  chipsRequired: number;
  timeLimit?: number; // Optional time limit in seconds
  hint?: string;
}

// Main game data
export interface GameData {
  currentLevel: number;
  grid: TileType[][];
  playerPosition: Position;
  chipsCollected: number;
  chipsRequired: number;
  timeElapsed: number;
  moveCount: number;
  inventory: Inventory;
  gameState: GameState;
  levelCompleted: boolean;
  deathReason?: string;
  monsters?: Monster[]; // Active monsters
  turnNumber?: number; // Track turns for tank monsters
}

// Movement result
export interface MovementResult {
  newPosition: Position;
  updatedGrid: TileType[][];
  chipsCollected: boolean;
  keyCollected?: KeyColor;
  doorOpened?: boolean;
  bootCollected?: BootType;
  died: boolean;
  deathReason?: string;
  exited: boolean;
  slippedOnIce: boolean;
}

// Level stats for tracking
export interface LevelStats {
  number: number;
  bestTime?: number;
  bestMoves?: number;
  completed: boolean;
}

// High scores per level
export interface HighScores {
  [levelNumber: number]: {
    bestTime: number;
    bestMoves: number;
  };
}

// Saved game state
export interface SavedGame {
  currentLevel: number;
  playerPosition: Position;
  grid: TileType[][];
  chipsCollected: number;
  chipsRequired: number;
  timeElapsed: number;
  moveCount: number;
  inventory: Inventory;
  savedAt: number; // timestamp
}

// Monster types
export enum MonsterType {
  BUG = 'monster_bug',
  FIREBALL = 'monster_fireball',
  BALL = 'monster_ball',
  GHOST = 'monster_ghost',
  TANK = 'monster_tank',
}

// Monster data
export interface Monster {
  type: MonsterType;
  position: Position;
  id: string;
}
