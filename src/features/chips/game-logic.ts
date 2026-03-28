import {
  TileType,
  Direction,
  Position,
  Level,
  GameData,
  MovementResult,
  Inventory,
  KeyColor,
  GameState,
  Monster,
} from './types';
import { initializeMonsters } from './monster-ai';

// Helper: Check if position is valid
export function isValidPosition(grid: TileType[][], pos: Position): boolean {
  return pos.y >= 0 && pos.y < grid.length && pos.x >= 0 && pos.x < grid[0].length;
}

// Helper: Check if tile is walkable
export function isWalkable(tile: TileType, inventory: Inventory): boolean {
  if (tile === TileType.EMPTY || tile === TileType.FLOOR || tile === TileType.GRAVEL) {
    return true;
  }
  if (tile === TileType.DIRT) {
    return true;
  }
  if (tile === TileType.CHIP) {
    return true;
  }
  if (tile === TileType.EXIT) {
    return true;
  }
  if (tile === TileType.ICE && inventory.boots.includes('ice')) {
    return true;
  }
  if (tile === TileType.WATER && inventory.boots.includes('water')) {
    return true;
  }
  if (tile === TileType.FIRE && inventory.boots.includes('fire')) {
    return true;
  }
  if (tile === TileType.HINT) {
    return true;
  }
  // Boot pickups
  if (tile === TileType.BOOTS_ICE || tile === TileType.BOOTS_WATER || tile === TileType.BOOTS_FIRE) {
    return true;
  }
  return false;
}

// Helper: Check if tile is a key
export function isKeyTile(tile: TileType): tile is TileType {
  return tile === TileType.KEY_RED ||
         tile === TileType.KEY_BLUE ||
         tile === TileType.KEY_GREEN ||
         tile === TileType.KEY_YELLOW;
}

// Helper: Check if tile is a door
export function isDoorTile(tile: TileType): tile is TileType {
  return tile === TileType.DOOR_RED ||
         tile === TileType.DOOR_BLUE ||
         tile === TileType.DOOR_GREEN ||
         tile === TileType.DOOR_YELLOW;
}

// Helper: Get key color from tile
export function getKeyColor(tile: TileType): KeyColor | null {
  switch (tile) {
    case TileType.KEY_RED: case TileType.DOOR_RED: return 'red';
    case TileType.KEY_BLUE: case TileType.DOOR_BLUE: return 'blue';
    case TileType.KEY_GREEN: case TileType.DOOR_GREEN: return 'green';
    case TileType.KEY_YELLOW: case TileType.DOOR_YELLOW: return 'yellow';
    default: return null;
  }
}

// Helper: Get door for key color
export function getDoorForKey(color: KeyColor): TileType {
  switch (color) {
    case 'red': return TileType.DOOR_RED;
    case 'blue': return TileType.DOOR_BLUE;
    case 'green': return TileType.DOOR_GREEN;
    case 'yellow': return TileType.DOOR_YELLOW;
  }
}

// Helper: Get boot type from tile
export function getBootType(tile: TileType): 'ice' | 'water' | 'fire' | null {
  switch (tile) {
    case TileType.BOOTS_ICE: return 'ice';
    case TileType.BOOTS_WATER: return 'water';
    case TileType.BOOTS_FIRE: return 'fire';
    default: return null;
  }
}

// Get position in direction
export function getPositionInDirection(pos: Position, direction: Direction): Position {
  switch (direction) {
    case 'up': return { x: pos.x, y: pos.y - 1 };
    case 'down': return { x: pos.x, y: pos.y + 1 };
    case 'left': return { x: pos.x - 1, y: pos.y };
    case 'right': return { x: pos.x + 1, y: pos.y };
  }
}

// Main movement logic
export function tryMove(
  grid: TileType[][],
  playerPos: Position,
  direction: Direction,
  inventory: Inventory
): MovementResult {
  const newPos = getPositionInDirection(playerPos, direction);

  // Check bounds
  if (!isValidPosition(grid, newPos)) {
    return {
      newPosition: playerPos,
      updatedGrid: grid,
      chipsCollected: false,
      died: false,
      exited: false,
      slippedOnIce: false,
    };
  }

  const targetTile = grid[newPos.y][newPos.x];

  // Check for walls
  if (targetTile === TileType.WALL || targetTile === TileType.ICE_WALL) {
    return {
      newPosition: playerPos,
      updatedGrid: grid,
      chipsCollected: false,
      died: false,
      exited: false,
      slippedOnIce: false,
    };
  }

  // Check for doors
  if (isDoorTile(targetTile)) {
    const keyColor = getKeyColor(targetTile);
    if (keyColor && inventory.keys.includes(keyColor)) {
      // Open door - remove it from grid
      const newGrid = grid.map(row => [...row]);
      newGrid[newPos.y][newPos.x] = TileType.FLOOR;
      return {
        newPosition: playerPos,
        updatedGrid: newGrid,
        chipsCollected: false,
        doorOpened: true,
        died: false,
        exited: false,
        slippedOnIce: false,
      };
    }
    // Can't open door - blocked
    return {
      newPosition: playerPos,
      updatedGrid: grid,
      chipsCollected: false,
      died: false,
      exited: false,
      slippedOnIce: false,
    };
  }

  // Check for hazards
  if (targetTile === TileType.WATER && !inventory.boots.includes('water')) {
    return {
      newPosition: newPos,
      updatedGrid: grid,
      chipsCollected: false,
      died: true,
      deathReason: 'drowned',
      exited: false,
      slippedOnIce: false,
    };
  }

  if (targetTile === TileType.FIRE && !inventory.boots.includes('fire')) {
    return {
      newPosition: newPos,
      updatedGrid: grid,
      chipsCollected: false,
      died: true,
      deathReason: 'burned',
      exited: false,
      slippedOnIce: false,
    };
  }

  // Check if walkable
  if (!isWalkable(targetTile, inventory)) {
    return {
      newPosition: playerPos,
      updatedGrid: grid,
      chipsCollected: false,
      died: false,
      exited: false,
      slippedOnIce: false,
    };
  }

  // Move is valid - update grid and collect items
  const newGrid = grid.map(row => [...row]);
  let chipsCollected = false;
  let keyCollected: KeyColor | undefined;
  let bootCollected: 'ice' | 'water' | 'fire' | undefined;

  // Check for chip
  if (targetTile === TileType.CHIP) {
    chipsCollected = true;
    newGrid[newPos.y][newPos.x] = TileType.FLOOR;
  }

  // Check for key
  if (isKeyTile(targetTile)) {
    const keyColor = getKeyColor(targetTile);
    if (keyColor) {
      keyCollected = keyColor;
      newGrid[newPos.y][newPos.x] = TileType.FLOOR;
    }
  }

  // Check for boots
  const bootType = getBootType(targetTile);
  if (bootType) {
    bootCollected = bootType;
    newGrid[newPos.y][newPos.x] = TileType.FLOOR;
  }

  // Check for dirt
  if (targetTile === TileType.DIRT) {
    newGrid[newPos.y][newPos.x] = TileType.FLOOR;
  }

  // Check for exit
  const exited = targetTile === TileType.EXIT;

  // Check for ice sliding
  let slippedOnIce = false;
  if (targetTile === TileType.ICE && !inventory.boots.includes('ice')) {
    slippedOnIce = true;
  }

  return {
    newPosition: newPos,
    updatedGrid: newGrid,
    chipsCollected,
    keyCollected,
    bootCollected,
    died: false,
    exited,
    slippedOnIce,
  };
}

// Handle ice sliding
export function handleIceSlide(
  grid: TileType[][],
  playerPos: Position,
  direction: Direction,
  inventory: Inventory
): { finalPos: Position; finalGrid: TileType[][]; died: boolean; deathReason?: string } {
  let currentPos = playerPos;
  let currentGrid = grid;
  let currentDirection = direction;

  while (true) {
    const result = tryMove(currentGrid, currentPos, currentDirection, inventory);

    if (result.died) {
      return {
        finalPos: result.newPosition,
        finalGrid: result.updatedGrid,
        died: true,
        deathReason: result.deathReason,
      };
    }

    if (result.newPosition.x === currentPos.x && result.newPosition.y === currentPos.y) {
      // Hit a wall or obstacle
      return {
        finalPos: currentPos,
        finalGrid: currentGrid,
        died: false,
      };
    }

    currentPos = result.newPosition;
    currentGrid = result.updatedGrid;

    // Check if we're still on ice
    const currentTile = currentGrid[currentPos.y][currentPos.x];
    if (currentTile !== TileType.ICE) {
      // Sliding stopped
      return {
        finalPos: currentPos,
        finalGrid: currentGrid,
        died: false,
      };
    }

    // Continue sliding in same direction
  }
}

// Count chips in level
export function countChips(grid: TileType[][]): number {
  let count = 0;
  for (const row of grid) {
    for (const tile of row) {
      if (tile === TileType.CHIP) {
        count++;
      }
    }
  }
  return count;
}

// Create initial game data
export function createInitialGame(level: Level): GameData {
  const grid = level.grid.map(row => [...row]);
  const monsters = initializeMonsters(grid);

  // Remove monster spawn tiles from grid (replace with floor)
  for (const monster of monsters) {
    grid[monster.position.y][monster.position.x] = TileType.FLOOR;
  }

  return {
    currentLevel: level.number,
    grid,
    playerPosition: { ...level.playerStart },
    chipsCollected: 0,
    chipsRequired: level.chipsRequired,
    timeElapsed: 0,
    moveCount: 0,
    inventory: {
      keys: [],
      boots: [],
    },
    gameState: 'idle',
    levelCompleted: false,
    monsters,
    turnNumber: 0,
  };
}

// LEVEL DATA
// Tile mapping:
// # = Wall
// . = Floor
// * = Chip
// @ = Player start
// E = Exit
// R = Red key, r = Red door
// B = Blue key, b = Blue door
// G = Green key, g = Green door
// Y = Yellow key, y = Yellow door
// I = Ice
// W = Water
// F = Fire
// = Dirt
// O = Ice boots, S = Water boots, H = Fire boots
// space = Empty

function parseLevel(layout: string[]): TileType[][] {
  return layout.map(row =>
    row.split('').map(char => {
      switch (char) {
        case '#': return TileType.WALL;
        case '.': return TileType.FLOOR;
        case '*': return TileType.CHIP;
        case '@': return TileType.FLOOR; // Player start is floor
        case 'E': return TileType.EXIT;
        case 'R': return TileType.KEY_RED;
        case 'r': return TileType.DOOR_RED;
        case 'B': return TileType.KEY_BLUE;
        case 'b': return TileType.DOOR_BLUE;
        case 'G': return TileType.KEY_GREEN;
        case 'g': return TileType.DOOR_GREEN;
        case 'Y': return TileType.KEY_YELLOW;
        case 'y': return TileType.DOOR_YELLOW;
        case 'I': return TileType.ICE;
        case 'W': return TileType.WATER;
        case 'F': return TileType.FIRE;
        case '=': return TileType.DIRT;
        case 'O': return TileType.BOOTS_ICE;
        case 'S': return TileType.BOOTS_WATER;
        case 'H': return TileType.BOOTS_FIRE;
        case 'M': return TileType.MONSTER_BUG;
        case 'f': return TileType.MONSTER_FIREBALL;
        case 'L': return TileType.MONSTER_BALL;
        case 'h': return TileType.MONSTER_GHOST;
        case 'T': return TileType.MONSTER_TANK;
        default: return TileType.EMPTY;
      }
    })
  );
}

function findPlayerStart(layout: string[]): Position {
  for (let y = 0; y < layout.length; y++) {
    for (let x = 0; x < layout[y].length; x++) {
      if (layout[y][x] === '@') {
        return { x, y };
      }
    }
  }
  return { x: 1, y: 1 }; // Fallback
}

export const LEVELS: Level[] = [
  {
    number: 1,
    name: 'Lesson 1: The Basics',
    grid: parseLevel([
      '####################',
      '#@.................#',
      '#.*********.*******#',
      '#.................E#',
      '####################',
    ]),
    playerStart: { x: 1, y: 1 },
    chipsRequired: 3,
    hint: 'Collect all chips and reach the exit!',
  },
  {
    number: 2,
    name: 'Lesson 2: Keys and Doors',
    grid: parseLevel([
      '####################',
      '#@.......r........E#',
      '#.......###........#',
      '#.......R.......**.#',
      '#.********........#',
      '#..................#',
      '####################',
    ]),
    playerStart: { x: 1, y: 1 },
    chipsRequired: 3,
    hint: 'Find the key to open the door!',
  },
  {
    number: 3,
    name: 'Lesson 3: Ice Skating',
    grid: parseLevel([
      '####################',
      '#@.................#',
      '#.IIIIIIIIIIIIIIIE#',
      '#.********.........#',
      '#..................#',
      '####################',
    ]),
    playerStart: { x: 1, y: 1 },
    chipsRequired: 3,
    hint: 'Ice makes you slide! Find boots to stop sliding.',
  },
  {
    number: 4,
    name: 'Lesson 4: Water Hazard',
    grid: parseLevel([
      '####################',
      '#@.....WWWWWW......#',
      '#......WWWWWW......#',
      '#.S....WWWWWW...*.E#',
      '#..................#',
      '####################',
    ]),
    playerStart: { x: 1, y: 1 },
    chipsRequired: 1,
    hint: 'Water is deadly without boots!',
  },
  {
    number: 5,
    name: 'Lesson 5: Fire Walking',
    grid: parseLevel([
      '####################',
      '#@.....FFFF.......E#',
      '#......FFFF.......#',
      '#.H....FFFF...***.#',
      '#..................#',
      '####################',
    ]),
    playerStart: { x: 1, y: 1 },
    chipsRequired: 3,
    hint: 'Fire burns! Find fire boots to cross safely.',
  },
  {
    number: 6,
    name: 'Combination',
    grid: parseLevel([
      '####################',
      '#@..R....y.....g..E#',
      '#.#...#.#...#......#',
      '#.#...#.#...#.***.#',
      '#.#...#.#...#......#',
      '####################',
    ]),
    playerStart: { x: 1, y: 1 },
    chipsRequired: 3,
    hint: 'Find keys to open doors in order!',
  },
  {
    number: 7,
    name: 'Ice Maze',
    grid: parseLevel([
      '####################',
      '#@.................#',
      '#.###.I.###.I.###.E#',
      '#.#...I.#...I.#...#',
      '#.#.*****...I.***.#',
      '#.........I.......#',
      '####################',
    ]),
    playerStart: { x: 1, y: 1 },
    chipsRequired: 5,
    hint: 'Navigate the ice maze carefully!',
  },
  {
    number: 8,
    name: 'Boot Collection',
    grid: parseLevel([
      '####################',
      '#@................E#',
      '#.WWWW..FFFF..IIII.#',
      '#.OSHO...*...*....#',
      '#.WWWW..FFFF..IIII.#',
      '#..................#',
      '####################',
    ]),
    playerStart: { x: 1, y: 1 },
    chipsRequired: 2,
    hint: 'Collect all three types of boots!',
  },
  {
    number: 9,
    name: 'The Gauntlet',
    grid: parseLevel([
      '####################',
      '#@..r.......y.....E#',
      '#.####.....####.###',
      '#.#R#.....I.#Y#...#',
      '#.#.......I.......#',
      '#.****.I.****.***.#',
      '#.......I.........#',
      '####################',
    ]),
    playerStart: { x: 1, y: 1 },
    chipsRequired: 6,
    hint: 'Combine all your skills!',
  },
  {
    number: 10,
    name: 'Chip\'s Challenge',
    grid: parseLevel([
      '####################',
      '#@..r....I....g...E#',
      '#.###.####.####.###',
      '#.#R#.#...#.#G#...#',
      '#.#...#.***.#.....#',
      '#..................#',
      '####################',
    ]),
    playerStart: { x: 1, y: 1 },
    chipsRequired: 3,
    hint: 'Master of Chip\'s Challenge!',
  },
  // Intermediate Levels (11-20)
  {
    number: 11,
    name: 'Triple Lock',
    grid: parseLevel([
      '####################',
      '#@.r....g....b....E#',
      '#..###..###..###..##',
      '#..#R#..#G#..#B#..#',
      '#..#....#....#....#',
      '#.*******...*****.#',
      '#..................#',
      '####################',
    ]),
    playerStart: { x: 1, y: 1 },
    chipsRequired: 8,
    hint: 'Three doors, three keys!',
  },
  {
    number: 12,
    name: 'Ice Slide',
    grid: parseLevel([
      '####################',
      '#@.......I.......E#',
      '#.......I.I.......#',
      '#.O.....I.I.....**#',
      '#.......I.I.......#',
      '#.......I.......**#',
      '#..................#',
      '####################',
    ]),
    playerStart: { x: 1, y: 1 },
    chipsRequired: 4,
    hint: 'Ice boots make navigation easier!',
  },
  {
    number: 13,
    name: 'Water Way',
    grid: parseLevel([
      '####################',
      '#@..WWWWWWWWWW....E#',
      '#..WWWWWWWWWWW....#',
      '#.SWWWWWWWWWWW....#',
      '#..WWWWWWWWWWW...*.#',
      '#..WWWWWWWWWWWW...*#',
      '#..................#',
      '####################',
    ]),
    playerStart: { x: 1, y: 1 },
    chipsRequired: 2,
    hint: 'Water boots are essential!',
  },
  {
    number: 14,
    name: 'Fire Path',
    grid: parseLevel([
      '####################',
      '#@.............F..E#',
      '#............FFF..#',
      '#...H......FFFFF..#',
      '#..........FFFF..*.#',
      '#........FFF...***.#',
      '#..................#',
      '####################',
    ]),
    playerStart: { x: 1, y: 1 },
    chipsRequired: 4,
    hint: 'Find fire boots to survive the flames!',
  },
  {
    number: 15,
    name: 'Mixed Hazards',
    grid: parseLevel([
      '####################',
      '#@.W.....F.....I..E#',
      '#.WW....FFF....III#',
      '#.WWWWFFFFFIIIIII.#',
      '#.......***.......#',
      '#.****.........***.#',
      '#..................#',
      '####################',
    ]),
    playerStart: { x: 1, y: 1 },
    chipsRequired: 5,
    hint: 'You need all three boot types!',
  },
  {
    number: 16,
    name: 'Key Hunt',
    grid: parseLevel([
      '####################',
      '#@..R.......Y.....E#',
      '#...###.....###..###',
      '#...#B#.....#G#..#.#',
      '#.......***.......#',
      '#.*****.........***#',
      '#..................#',
      '####################',
    ]),
    playerStart: { x: 1, y: 1 },
    chipsRequired: 6,
    hint: 'Find all four colored keys!',
  },
  {
    number: 17,
    name: 'Dirt Path',
    grid: parseLevel([
      '####################',
      '#@===============E#',
      '#..................#',
      '#.***********.....#',
      '#.................#',
      '#........*****....#',
      '#..................#',
      '####################',
    ]),
    playerStart: { x: 1, y: 1 },
    chipsRequired: 8,
    hint: 'Dirt turns into floor when walked on!',
  },
  {
    number: 18,
    name: 'Ice Corridor',
    grid: parseLevel([
      '####################',
      '#@..III.........III#',
      '#..IIII.........III#',
      '#..IIII*********III#',
      '#..IIII.........III#',
      '#..IIII.....E...III#',
      '#..................#',
      '####################',
    ]),
    playerStart: { x: 1, y: 1 },
    chipsRequired: 5,
    hint: 'Momentum is your friend on ice!',
  },
  {
    number: 19,
    name: 'The Crossing',
    grid: parseLevel([
      '####################',
      '#@..W....W....W....E#',
      '#..WW...WW...WW....#',
      '#..WWWWWWWWWWWW...*#',
      '#..WW...WW...WW..**#',
      '#..W....W....W..***#',
      '#..................#',
      '####################',
    ]),
    playerStart: { x: 1, y: 1 },
    chipsRequired: 4,
    hint: 'Navigate the water channels carefully!',
  },
  {
    number: 20,
    name: 'Elemental Mastery',
    grid: parseLevel([
      '####################',
      '#@...W...F...I.....E#',
      '#...WWW.FFF.III....#',
      '#...WWWW.FFF.III..*#',
      '#OS...H..H...O....**#',
      '#.****.........****#',
      '#..................#',
      '####################',
    ]),
    playerStart: { x: 1, y: 1 },
    chipsRequired: 7,
    hint: 'Master all three elements!',
  },
  // Advanced Levels (21-30)
  {
    number: 21,
    name: 'Complex Keys',
    grid: parseLevel([
      '####################',
      '#@r..R..y..Y..g..G.E#',
      '#.##########.####.###',
      '#.#........#.#....#.#',
      '#.#.********.#.*..*.#',
      '#.#........#.#....#.#',
      '#.##########.####.###',
      '####################',
    ]),
    playerStart: { x: 1, y: 1 },
    chipsRequired: 8,
    hint: 'Strategic key use is essential!',
  },
  {
    number: 22,
    name: 'Ice Maze II',
    grid: parseLevel([
      '####################',
      '#@..###I###I###....E#',
      '#..###I###I###.I.###',
      '#..###I*I*I###.I.I.#',
      '#..###I###I###.I.I.#',
      '#.*****I*****I*I*I#',
      '#.......I.......I..#',
      '####################',
    ]),
    playerStart: { x: 1, y: 1 },
    chipsRequired: 6,
    hint: 'Plan your slides carefully!',
  },
  {
    number: 23,
    name: 'The Trap',
    grid: parseLevel([
      '####################',
      '#@..R..............#',
      '#.###......####....#',
      '#.#..r....r..#..r..#',
      '#.#...####...#..###.#',
      '#.#...*....*#......#',
      '#.........####....E#',
      '####################',
    ]),
    playerStart: { x: 1, y: 1 },
    chipsRequired: 4,
    hint: 'The obvious path isn\'t always best!',
  },
  {
    number: 24,
    name: 'Three Elements',
    grid: parseLevel([
      '####################',
      '#@..W...F...I......E#',
      '#..WWW..FFF..III...#',
      '#.WWWW..FFFF..IIII.#',
      '#..WWW..FFF..III..*#',
      '#.OOSH..HHH...O...**#',
      '#.******.......****#',
      '####################',
    ]),
    playerStart: { x: 1, y: 1 },
    chipsRequired: 10,
    hint: 'All three boot types required!',
  },
  {
    number: 25,
    name: 'Hidden Path',
    grid: parseLevel([
      '####################',
      '#@===============.#',
      '#.................#',
      '#.***************.#',
      '#.................#',
      '#..*************..#',
      '#.................E#',
      '####################',
    ]),
    playerStart: { x: 1, y: 1 },
    chipsRequired: 12,
    hint: 'Clear a path through the dirt!',
  },
  {
    number: 26,
    name: 'Key Puzzle',
    grid: parseLevel([
      '####################',
      '#@r..R..y..Y..g..b.E#',
      '#.###..###..###..###',
      '#.#G#..#B#..###..#.#',
      '#.......***.......#.#',
      '#.*****.....*****..#',
      '#..................#',
      '####################',
    ]),
    playerStart: { x: 1, y: 1 },
    chipsRequired: 9,
    hint: 'Sometimes you need to backtrack!',
  },
  {
    number: 27,
    name: 'Slippery Slope',
    grid: parseLevel([
      '####################',
      '#@..............I..E#',
      '#..............II..#',
      '#.*************II..#',
      '#..............II..#',
      '#.*************II..#',
      '#..................#',
      '####################',
    ]),
    playerStart: { x: 1, y: 1 },
    chipsRequired: 8,
    hint: 'Ice slides can be useful!',
  },
  {
    number: 28,
    name: 'The Final Lock',
    grid: parseLevel([
      '####################',
      '#@r.R.y.Y.g.G.b.B.E#',
      '#.###.###.###.###.###',
      '#..................#',
      '#.**********.*****.#',
      '#..................#',
      '#..................#',
      '####################',
    ]),
    playerStart: { x: 1, y: 1 },
    chipsRequired: 10,
    hint: 'All keys must be collected!',
  },
  {
    number: 29,
    name: 'Ice Water Fire',
    grid: parseLevel([
      '####################',
      '#@..IIIWWWWFFFF....E#',
      '#..IIIWWWWFFFF....##',
      '#.O..S..H...*....*##',
      '#.*****........****#',
      '#..................#',
      '#..................#',
      '####################',
    ]),
    playerStart: { x: 1, y: 1 },
    chipsRequired: 6,
    hint: 'Each hazard requires its own solution!',
  },
  {
    number: 30,
    name: 'Chip\'s Revenge',
    grid: parseLevel([
      '####################',
      '#@r..R..y..Y..g..G.E#',
      '#.###.###.###.####.###',
      '#.#W#.#F#.#I#.#W#.#F#',
      '#.WWW.FFF.III.WWW.FFF#',
      '#.OS...H..O...S...H..#',
      '#.****.....*****.....#',
      '####################',
    ]),
    playerStart: { x: 1, y: 1 },
    chipsRequired: 15,
    hint: 'The ultimate challenge!',
  },
  // Monster Levels (31-35)
  {
    number: 31,
    name: 'Bug Hunt',
    grid: parseLevel([
      '####################',
      '#@.......M.......E#',
      '#.......###........#',
      '#.***...#...#...**.#',
      '#.......M...M......#',
      '#.****.........****#',
      '#..................#',
      '####################',
    ]),
    playerStart: { x: 1, y: 1 },
    chipsRequired: 6,
    hint: 'Watch out for bugs! They chase you.',
  },
  {
    number: 32,
    name: 'Fireball Frenzy',
    grid: parseLevel([
      '####################',
      '#@F...f...FFF.....E#',
      '#.FFF.F...FFF.....#',
      '#.FFF...H..FFF...*.#',
      '#.......f.........#',
      '#.****.FFF.****.***#',
      '#..................#',
      '####################',
    ]),
    playerStart: { x: 1, y: 1 },
    chipsRequired: 4,
    hint: 'Fireballs can walk on fire! Get fire boots.',
  },
  {
    number: 33,
    name: 'Bouncing Balls',
    grid: parseLevel([
      '####################',
      '#@.......L.......E.#',
      '#.......###........#',
      '#.***...#...#...**.#',
      '#.......L...L......#',
      '#.****.........****#',
      '#..................#',
      '####################',
    ]),
    playerStart: { x: 1, y: 1 },
    chipsRequired: 6,
    hint: 'Balls bounce off walls in predictable patterns!',
  },
  {
    number: 34,
    name: 'Ghostly Encounter',
    grid: parseLevel([
      '####################',
      '#@.......h.......E.#',
      '#.......###........#',
      '#.***...#...#...**.#',
      '#.......h...h......#',
      '#.****.........****#',
      '#..................#',
      '####################',
    ]),
    playerStart: { x: 1, y: 1 },
    chipsRequired: 6,
    hint: 'Ghosts can walk through walls! Be careful!',
  },
  {
    number: 35,
    name: 'Tank Battalion',
    grid: parseLevel([
      '####################',
      '#@.......T.......E.#',
      '#.......###........#',
      '#.***...#...#...**.#',
      '#.......T...T......#',
      '#.****.........****#',
      '#..................#',
      '####################',
    ]),
    playerStart: { x: 1, y: 1 },
    chipsRequired: 6,
    hint: 'Tanks move slowly - every other turn.',
  },
];

export function getLevel(number: number): Level {
  return LEVELS.find(l => l.number === number) || LEVELS[0];
}
