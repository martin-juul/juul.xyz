/**
 * Mahjong Solitaire Game Logic
 * Core game mechanics: tile generation, matching, hints, shuffle, undo
 */

import type { Tile, Position, GameState, MatchResult, HintResult } from './types';
import { TILE_DEFS, TURTLE_LAYOUT, isPositionBlocked, isPositionCovered } from './constants';

/**
 * Generate initial tile set (144 tiles)
 */
export function generateTiles(): Tile[] {
  const tiles: Tile[] = [];

  // Create 4 copies of each base tile (136 tiles)
  const baseTiles = [
    ...TILE_DEFS.dots,
    ...TILE_DEFS.bamboo,
    ...TILE_DEFS.character,
    ...TILE_DEFS.winds,
    ...TILE_DEFS.dragons,
  ];

  for (const tileDef of baseTiles) {
    for (let i = 0; i < 4; i++) {
      tiles.push({
        id: `${tileDef.suit}-${tileDef.value}-${i}`,
        suit: tileDef.suit as any,
        value: tileDef.value as any,
        position: { row: 0, col: 0, layer: 0 },
        isFree: false,
        isMatched: false,
      });
    }
  }

  // Add flowers (4 tiles, match each other)
  for (const flower of TILE_DEFS.flowers) {
    tiles.push({
      id: `flower-${flower.value}`,
      suit: 'flower',
      value: flower.value,
      position: { row: 0, col: 0, layer: 0 },
      isFree: false,
      isMatched: false,
    });
  }

  // Add seasons (4 tiles, match each other)
  for (const season of TILE_DEFS.seasons) {
    tiles.push({
      id: `season-${season.value}`,
      suit: 'season',
      value: season.value,
      position: { row: 0, col: 0, layer: 0 },
      isFree: false,
      isMatched: false,
    });
  }

  // Shuffle tiles
  shuffleArray(tiles);

  // Assign positions using turtle layout
  for (let i = 0; i < Math.min(tiles.length, TURTLE_LAYOUT.length); i++) {
    tiles[i].position = { ...TURTLE_LAYOUT[i] };
  }

  // Calculate which tiles are free
  return updateFreeTiles(tiles);
}

/**
 * Shuffle array in place
 */
function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

/**
 * Check if a tile is free (can be selected)
 * A tile is free if:
 * - No tile is directly on top of it (covering it)
 * - At least one side (left or right) is not blocked by another tile on the same layer
 */
export function isTileFree(tile: Tile, allTiles: Tile[]): boolean {
  const activeTiles = allTiles.filter(t => !t.isMatched);

  // Check if covered from above
  const isCovered = activeTiles.some(
    t =>
      t !== tile &&
      t.position.layer === tile.position.layer + 1 &&
      Math.abs(t.position.row - tile.position.row) <= 1 &&
      Math.abs(t.position.col - tile.position.col) <= 1
  );

  if (isCovered) return false;

  // Check left side
  const isLeftBlocked = activeTiles.some(
    t =>
      t !== tile &&
      t.position.layer === tile.position.layer &&
      t.position.row === tile.position.row &&
      t.position.col === tile.position.col - 1
  );

  // Check right side
  const isRightBlocked = activeTiles.some(
    t =>
      t !== tile &&
      t.position.layer === tile.position.layer &&
      t.position.row === tile.position.row &&
      t.position.col === tile.position.col + 1
  );

  // Free if at least one side is not blocked
  return !isLeftBlocked || !isRightBlocked;
}

/**
 * Update isFree status for all tiles
 */
export function updateFreeTiles(tiles: Tile[]): Tile[] {
  return tiles.map(tile => ({
    ...tile,
    isFree: !tile.isMatched && isTileFree(tile, tiles),
  }));
}

/**
 * Check if two tiles match
 * Tiles match if:
 * - Same suit and value (except flowers/seasons)
 * - Flowers match any other flower
 * - Seasons match any other season
 */
export function tilesMatch(tile1: Tile, tile2: Tile): boolean {
  // Special case: flowers match any flower
  if (tile1.suit === 'flower' && tile2.suit === 'flower') {
    return true;
  }

  // Special case: seasons match any season
  if (tile1.suit === 'season' && tile2.suit === 'season') {
    return true;
  }

  // Normal case: same suit and value
  return tile1.suit === tile2.suit && tile1.value === tile2.value;
}

/**
 * Check if a tile can be selected and matched with another
 */
export function canSelectTile(tile: Tile, tiles: Tile[]): MatchResult {
  if (!tile.isFree) {
    return { isMatch: false, reason: 'tile is not free' };
  }

  if (tile.isMatched) {
    return { isMatch: false, reason: 'tile is already matched' };
  }

  return { isMatch: true };
}

/**
 * Match two tiles and remove them from the board
 */
export function matchTiles(
  gameState: GameState,
  tile1Id: string,
  tile2Id: string
): GameState | null {
  const tile1 = gameState.tiles.find(t => t.id === tile1Id);
  const tile2 = gameState.tiles.find(t => t.id === tile2Id);

  if (!tile1 || !tile2) return null;
  if (!tile1.isFree || !tile2.isFree) return null;
  if (!tilesMatch(tile1, tile2)) return null;

  // Save current state to history
  const newHistory = [...gameState.history, JSON.parse(JSON.stringify(gameState))];

  // Mark tiles as matched
  const newTiles = gameState.tiles.map(tile => {
    if (tile.id === tile1Id || tile.id === tile2Id) {
      return { ...tile, isMatched: true, isFree: false };
    }
    return tile;
  });

  // Update free tiles
  const updatedTiles = updateFreeTiles(newTiles);

  return {
    ...gameState,
    tiles: updatedTiles,
    selectedTile: null,
    history: newHistory,
    moves: gameState.moves + 1,
  };
}

/**
 * Check if there are any available moves
 */
export function hasAvailableMoves(tiles: Tile[]): boolean {
  const freeTiles = tiles.filter(t => t.isFree && !t.isMatched);

  for (let i = 0; i < freeTiles.length; i++) {
    for (let j = i + 1; j < freeTiles.length; j++) {
      if (tilesMatch(freeTiles[i], freeTiles[j])) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Find a hint (matching pair of free tiles)
 */
export function findHint(tiles: Tile[]): HintResult {
  const freeTiles = tiles.filter(t => t.isFree && !t.isMatched);

  for (let i = 0; i < freeTiles.length; i++) {
    for (let j = i + 1; j < freeTiles.length; j++) {
      if (tilesMatch(freeTiles[i], freeTiles[j])) {
        return {
          tile1: freeTiles[i],
          tile2: freeTiles[j],
        };
      }
    }
  }

  return { tile1: null, tile2: null };
}

/**
 * Shuffle unmatched tiles while preserving the layout
 */
export function shuffleTiles(gameState: GameState): GameState {
  // Get all unmatched tiles
  const unmatchedTiles = gameState.tiles.filter(t => !t.isMatched);
  const matchedTiles = gameState.tiles.filter(t => t.isMatched);

  // Extract suits and values
  const tileDefinitions = unmatchedTiles.map(tile => ({
    suit: tile.suit,
    value: tile.value,
  }));

  // Shuffle definitions
  shuffleArray(tileDefinitions);

  // Reassign to tiles while keeping positions
  const shuffledTiles = unmatchedTiles.map((tile, index) => ({
    ...tile,
    suit: tileDefinitions[index].suit,
    value: tileDefinitions[index].value,
    id: `${tileDefinitions[index].suit}-${tileDefinitions[index].value}-${index}`,
  }));

  // Update free status
  const updatedTiles = updateFreeTiles([...shuffledTiles, ...matchedTiles]);

  return {
    ...gameState,
    tiles: updatedTiles,
  };
}

/**
 * Undo last move
 */
export function undoMove(gameState: GameState): GameState | null {
  if (gameState.history.length === 0) return null;

  const previousState = gameState.history[gameState.history.length - 1];

  return {
    ...previousState,
    history: gameState.history.slice(0, -1),
  };
}

/**
 * Check if game is won (all tiles matched)
 */
export function isGameWon(tiles: Tile[]): boolean {
  return tiles.every(tile => tile.isMatched);
}

/**
 * Create initial game state
 */
export function createInitialGame(): GameState {
  const tiles = generateTiles();

  return {
    tiles,
    selectedTile: null,
    history: [],
    moves: 0,
    timer: 0,
    isPlaying: false,
    isPaused: false,
    isWon: false,
    isGameOver: false,
    noMovesAvailable: false,
  };
}

/**
 * Select a tile
 */
export function selectTile(gameState: GameState, tileId: string): GameState {
  const tile = gameState.tiles.find(t => t.id === tileId);

  if (!tile || !tile.isFree || tile.isMatched) {
    return gameState;
  }

  // If no tile selected, select this one
  if (!gameState.selectedTile) {
    return {
      ...gameState,
      selectedTile: tile,
    };
  }

  // If same tile clicked, deselect
  if (gameState.selectedTile.id === tileId) {
    return {
      ...gameState,
      selectedTile: null,
    };
  }

  // Try to match
  const result = matchTiles(gameState, gameState.selectedTile.id, tileId);

  if (result) {
    // Check for win
    const won = isGameWon(result.tiles);
    const noMoves = !won && !hasAvailableMoves(result.tiles);

    return {
      ...result,
      isWon: won,
      noMovesAvailable: noMoves,
    };
  }

  // Can't match, select new tile
  return {
    ...gameState,
    selectedTile: tile,
  };
}

/**
 * Start the game
 */
export function startGame(gameState: GameState): GameState {
  return {
    ...gameState,
    isPlaying: true,
  };
}

/**
 * Pause/unpause the game
 */
export function togglePause(gameState: GameState): GameState {
  return {
    ...gameState,
    isPaused: !gameState.isPaused,
  };
}

/**
 * Reset the game
 */
export function resetGame(): GameState {
  return createInitialGame();
}

/**
 * Increment timer
 */
export function incrementTimer(gameState: GameState): GameState {
  if (!gameState.isPlaying || gameState.isPaused || gameState.isWon) {
    return gameState;
  }

  return {
    ...gameState,
    timer: gameState.timer + 1,
  };
}
