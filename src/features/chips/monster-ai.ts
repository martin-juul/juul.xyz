// Monster AI for Chips Challenge

import {
  TileType,
  Position,
  Monster,
  MonsterType,
  Direction,
} from './types';
import { isValidPosition, getPositionInDirection, isWalkable } from './game-logic';

// Simple Manhattan distance calculation
function manhattanDistance(a: Position, b: Position): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

// Get valid adjacent positions
function getAdjacentPositions(pos: Position, grid: TileType[][]): Position[] {
  const directions: Direction[] = ['up', 'down', 'left', 'right'];
  const adjacent: Position[] = [];

  for (const dir of directions) {
    const newPos = getPositionInDirection(pos, dir);
    if (isValidPosition(grid, newPos)) {
      const tile = grid[newPos.y][newPos.x];
      // Check if tile is walkable (different for monsters)
      if (isWalkableForMonster(tile)) {
        adjacent.push(newPos);
      }
    }
  }

  return adjacent;
}

// Check if tile is walkable for monster
function isWalkableForMonster(tile: TileType): boolean {
  // Monsters can walk on: floor, ice, gravel, dirt, empty
  // Some monsters have special abilities (fire, water, walls)
  return [
    TileType.FLOOR,
    TileType.ICE,
    TileType.GRAVEL,
    TileType.DIRT,
    TileType.EMPTY,
    TileType.CHIP,
  ].includes(tile);
}

// Check if tile is walkable (simple version for monsters)
function isTileWalkableForMonster(tile: TileType): boolean {
  return [
    TileType.FLOOR,
    TileType.ICE,
    TileType.GRAVEL,
    TileType.DIRT,
    TileType.EMPTY,
    TileType.CHIP,
  ].includes(tile);
}

// Get valid positions for fireball monster (can walk on fire)
function getAdjacentPositionsFireball(pos: Position, grid: TileType[][]): Position[] {
  const directions: Direction[] = ['up', 'down', 'left', 'right'];
  const adjacent: Position[] = [];

  for (const dir of directions) {
    const newPos = getPositionInDirection(pos, dir);
    if (isValidPosition(grid, newPos)) {
      const tile = grid[newPos.y][newPos.x];
      if ([
        TileType.FLOOR,
        TileType.ICE,
        TileType.GRAVEL,
        TileType.DIRT,
        TileType.EMPTY,
        TileType.CHIP,
        TileType.FIRE,
      ].includes(tile)) {
        adjacent.push(newPos);
      }
    }
  }

  return adjacent;
}

// Get valid positions for ghost monster (can walk through walls)
function getAdjacentPositionsGhost(pos: Position, grid: TileType[][]): Position[] {
  const directions: Direction[] = ['up', 'down', 'left', 'right'];
  const adjacent: Position[] = [];

  for (const dir of directions) {
    const newPos = getPositionInDirection(pos, dir);
    if (isValidPosition(grid, newPos)) {
      adjacent.push(newPos);
    }
  }

  return adjacent;
}

// Bug monster: moves toward player, blocked by walls
export function moveBug(monster: Monster, playerPos: Position, grid: TileType[][]): Position {
  const adjacent = getAdjacentPositions(monster.position, grid);
  if (adjacent.length === 0) return monster.position;

  // Find position closest to player
  let bestPos = monster.position;
  let bestDist = manhattanDistance(monster.position, playerPos);

  for (const pos of adjacent) {
    const dist = manhattanDistance(pos, playerPos);
    if (dist < bestDist) {
      bestDist = dist;
      bestPos = pos;
    }
  }

  return bestPos;
}

// Fireball monster: moves toward player, can walk on fire, dies in water
export function moveFireball(monster: Monster, playerPos: Position, grid: TileType[][]): Position {
  const adjacent = getAdjacentPositionsFireball(monster.position, grid);
  if (adjacent.length === 0) return monster.position;

  // Check if current position is water (fireball dies)
  const currentTile = grid[monster.position.y][monster.position.x];
  if (currentTile === TileType.WATER) {
    return { x: -1, y: -1 }; // Signal to remove monster
  }

  let bestPos = monster.position;
  let bestDist = manhattanDistance(monster.position, playerPos);

  for (const pos of adjacent) {
    const tile = grid[pos.y][pos.x];
    // Don't walk into water
    if (tile === TileType.WATER) continue;

    const dist = manhattanDistance(pos, playerPos);
    if (dist < bestDist) {
      bestDist = dist;
      bestPos = pos;
    }
  }

  return bestPos;
}

// Ball monster: bounces off walls
export function moveBall(monster: Monster, playerPos: Position, grid: TileType[][], direction: Direction): { position: Position; newDirection: Direction } {
  // Try to continue in current direction
  const nextPos = getPositionInDirection(monster.position, direction);

  if (isValidPosition(grid, nextPos) && isTileWalkableForMonster(grid[nextPos.y][nextPos.x])) {
    return { position: nextPos, newDirection: direction };
  }

  // Bounce: try perpendicular directions
  const perpendicular: Direction[] = [];
  if (direction === 'up' || direction === 'down') {
    perpendicular.push('left', 'right');
  } else {
    perpendicular.push('up', 'down');
  }

  for (const dir of perpendicular) {
    const newPos = getPositionInDirection(monster.position, dir);
    if (isValidPosition(grid, newPos) && isTileWalkableForMonster(grid[newPos.y][newPos.x])) {
      return { position: newPos, newDirection: dir };
    }
  }

  // Reverse if blocked
  const reverse: Record<Direction, Direction> = {
    up: 'down',
    down: 'up',
    left: 'right',
    right: 'left',
  };

  const newPos = getPositionInDirection(monster.position, reverse[direction]);
  if (isValidPosition(grid, newPos) && isTileWalkableForMonster(grid[newPos.y][newPos.x])) {
    return { position: newPos, newDirection: reverse[direction] };
  }

  return { position: monster.position, newDirection: direction };
}

// Ghost monster: moves through walls toward player
export function moveGhost(monster: Monster, playerPos: Position, grid: TileType[][]): Position {
  const adjacent = getAdjacentPositionsGhost(monster.position, grid);
  if (adjacent.length === 0) return monster.position;

  let bestPos = monster.position;
  let bestDist = manhattanDistance(monster.position, playerPos);

  for (const pos of adjacent) {
    const dist = manhattanDistance(pos, playerPos);
    if (dist < bestDist) {
      bestDist = dist;
      bestPos = pos;
    }
  }

  return bestPos;
}

// Tank monster: moves every other turn
export function moveTank(monster: Monster, playerPos: Position, grid: TileType[][], turnNumber: number): Position {
  if (turnNumber % 2 !== 0) {
    return monster.position; // Skip every other turn
  }

  const adjacent = getAdjacentPositions(monster.position, grid);
  if (adjacent.length === 0) return monster.position;

  let bestPos = monster.position;
  let bestDist = manhattanDistance(monster.position, playerPos);

  for (const pos of adjacent) {
    const dist = manhattanDistance(pos, playerPos);
    if (dist < bestDist) {
      bestDist = dist;
      bestPos = pos;
    }
  }

  return bestPos;
}

// Move all monsters
export interface MonsterMoveResult {
  updatedMonsters: Monster[];
  playerDied: boolean;
}

export function moveMonsters(
  monsters: Monster[],
  playerPos: Position,
  grid: TileType[][],
  turnNumber: number
): MonsterMoveResult {
  const updatedMonsters: Monster[] = [];
  let playerDied = false;

  for (const monster of monsters) {
    let newPos: Position;

    switch (monster.type) {
      case MonsterType.BUG:
        newPos = moveBug(monster, playerPos, grid);
        break;
      case MonsterType.FIREBALL:
        newPos = moveFireball(monster, playerPos, grid);
        // Fireball dies in water
        if (newPos.x === -1 && newPos.y === -1) {
          continue; // Remove this monster
        }
        break;
      case MonsterType.BALL:
        // Balls maintain direction - for simplicity, random direction here
        const directions: Direction[] = ['up', 'down', 'left', 'right'];
        const randomDir = directions[Math.floor(Math.random() * directions.length)];
        const ballMove = moveBall(monster, playerPos, grid, randomDir);
        newPos = ballMove.position;
        break;
      case MonsterType.GHOST:
        newPos = moveGhost(monster, playerPos, grid);
        break;
      case MonsterType.TANK:
        newPos = moveTank(monster, playerPos, grid, turnNumber);
        break;
      default:
        newPos = monster.position;
    }

    // Check if monster caught the player
    if (newPos.x === playerPos.x && newPos.y === playerPos.y) {
      playerDied = true;
    }

    updatedMonsters.push({
      ...monster,
      position: newPos,
    });
  }

  return { updatedMonsters, playerDied };
}

// Initialize monsters from grid (find monster spawn points)
export function initializeMonsters(grid: TileType[][]): Monster[] {
  const monsters: Monster[] = [];
  let monsterId = 0;

  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const tile = grid[y][x];
      let monsterType: MonsterType | null = null;

      switch (tile) {
        case TileType.MONSTER_BUG:
          monsterType = MonsterType.BUG;
          break;
        case TileType.MONSTER_FIREBALL:
          monsterType = MonsterType.FIREBALL;
          break;
        case TileType.MONSTER_BALL:
          monsterType = MonsterType.BALL;
          break;
        case TileType.MONSTER_GHOST:
          monsterType = MonsterType.GHOST;
          break;
        case TileType.MONSTER_TANK:
          monsterType = MonsterType.TANK;
          break;
      }

      if (monsterType) {
        monsters.push({
          type: monsterType,
          position: { x, y },
          id: `monster-${monsterId++}`,
        });
      }
    }
  }

  return monsters;
}
