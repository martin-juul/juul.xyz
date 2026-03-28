// Pipe Dream Game Logic

import type { Cell, CellType, GameData, Direction } from './types';
import {
  GRID_COLS,
  GRID_ROWS,
  QUEUE_PIPE_TYPES,
  getOppositeDirection,
  canConnect,
  getOutputDirection,
  getPipeConnections,
} from './types';

// Create empty grid
function createEmptyGrid(): Cell[][] {
  return Array.from({ length: GRID_ROWS }, () =>
    Array.from({ length: GRID_COLS }, () => ({
      type: 'empty' as CellType,
      flowState: 'none' as const,
    }))
  );
}

// Generate pipe type with weighting based on flow direction
function generatePipeType(flowDirection: Direction | null, availablePositions: number): CellType {
  const pipeTypes = QUEUE_PIPE_TYPES;

  // If no flow yet (game start), completely random
  if (!flowDirection) {
    return pipeTypes[Math.floor(Math.random() * pipeTypes.length)];
  }

  // Weight pipes based on flow direction
  // Give higher probability to pipes that can connect from the incoming direction
  const weights = pipeTypes.map(type => {
    const connections = getPipeConnections(type);

    // Check if this pipe can accept flow from current direction
    let canAccept = false;
    const oppositeDir = getOppositeDirection(flowDirection);

    for (const conn of connections) {
      if (conn === oppositeDir) {
        canAccept = true;
        break;
      }
    }

    // Higher weight for pipes that can accept the flow
    if (canAccept) {
      // If we have lots of space, favor straight pipes in flow direction
      if (availablePositions > 10) {
        if ((flowDirection === 'up' || flowDirection === 'down') && type === 'vertical') return 4;
        if ((flowDirection === 'left' || flowDirection === 'right') && type === 'horizontal') return 4;
        return 3;
      }
      return 2; // Normal weight for useful pipes
    }

    // Lower weight for pipes that don't connect well
    return 1;
  });

  // Weighted random selection
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < pipeTypes.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return pipeTypes[i];
    }
  }

  return pipeTypes[0];
}

// Generate initial queue of pipe types with smart weighting
function generateQueue(count: number, flowDirection: Direction | null = null, availablePositions: number = 80): CellType[] {
  return Array.from({ length: count }, () => generatePipeType(flowDirection, availablePositions));
}

// Create initial game state
export function createInitialGame(highScore: number = 0, level: number = 1): GameData {
  const grid = createEmptyGrid();

  // Place start at left edge, random row
  const startRow = Math.floor(Math.random() * (GRID_ROWS - 2)) + 1;
  grid[startRow][0] = { type: 'start', flowState: 'none' };

  // Place end at right edge, random row (not same as start)
  let endRow = Math.floor(Math.random() * (GRID_ROWS - 2)) + 1;
  while (endRow === startRow && GRID_ROWS > 2) {
    endRow = Math.floor(Math.random() * (GRID_ROWS - 2)) + 1;
  }
  grid[endRow][GRID_COLS - 1] = { type: 'end', flowState: 'none' };

  // Flow starts faster at higher levels (much more forgiving)
  const baseDelay = 20000; // 20 seconds base (was 10)
  const baseSpeed = 2000; // 2 seconds per tile base (was 1)
  const delayReduction = (level - 1) * 1000; // Reduce by 1s per level (was 500ms)
  const speedIncrease = (level - 1) * 100; // Increase by 100ms per level (was 50ms, but now also slower base)

  return {
    grid,
    queue: generateQueue(7), // Increased from 5 to 7 - more options
    flowPosition: { row: startRow, col: 0 },
    flowDirection: 'right',
    gameState: 'idle',
    level,
    score: 0,
    pipesPlaced: 0,
    highScore,
    flowDelay: Math.max(8000, baseDelay - delayReduction), // Min 8 seconds (was 3)
    flowSpeed: Math.max(500, baseSpeed - speedIncrease), // Min 500ms per tile (was 200)
    flowTimer: Math.max(8000, baseDelay - delayReduction),
    lastFlowAdvance: 0,
  };
}

// Place a pipe from the queue at the specified position
export function placePipe(game: GameData, row: number, col: number): GameData | null {
  // Can't place on start, end, or already filled cells
  const cell = game.grid[row][col];
  if (cell.type === 'start' || cell.type === 'end' || cell.type !== 'empty') {
    return null;
  }

  // Can't place if game is over
  if (game.gameState === 'won' || game.gameState === 'lost') {
    return null;
  }

  const newGrid = game.grid.map(r => r.map(c => ({ ...c })));
  const pipeType = game.queue[0];

  newGrid[row][col] = {
    type: pipeType,
    flowState: 'none',
  };

  // Count available empty positions for smarter queue generation
  let availablePositions = 0;
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      if (newGrid[r][c].type === 'empty') {
        availablePositions++;
      }
    }
  }

  // Remove first element from queue and add new smart pipe
  const newPipeType = generatePipeType(game.flowDirection, availablePositions);
  const newQueue = [...game.queue.slice(1), newPipeType];

  return {
    ...game,
    grid: newGrid,
    queue: newQueue,
    pipesPlaced: game.pipesPlaced + 1,
    gameState: 'playing' as const,
  };
}

// Start the fluid flowing
export function startFlow(game: GameData): GameData {
  // Mark start cell as flowing
  const newGrid = game.grid.map(r => r.map(c => ({ ...c })));
  const startPos = game.flowPosition!;

  newGrid[startPos.row][startPos.col] = {
    ...newGrid[startPos.row][startPos.col],
    flowState: 'flowing',
    flowDirection: game.flowDirection!,
  };

  return {
    ...game,
    grid: newGrid,
    gameState: 'flowing' as const,
    lastFlowAdvance: Date.now(),
  };
}

// Get next position based on direction
function getNextPosition(row: number, col: number, dir: Direction): { row: number; col: number } | null {
  switch (dir) {
    case 'up': return row > 0 ? { row: row - 1, col } : null;
    case 'down': return row < GRID_ROWS - 1 ? { row: row + 1, col } : null;
    case 'left': return col > 0 ? { row, col: col - 1 } : null;
    case 'right': return col < GRID_COLS - 1 ? { row, col: col + 1 } : null;
  }
}

// Advance the flow by one tile
export function advanceFlow(game: GameData): GameData {
  const currentPos = game.flowPosition;
  const currentDir = game.flowDirection;

  if (!currentPos || !currentDir) {
    return { ...game, gameState: 'lost' as const };
  }

  // Get next position
  const nextPos = getNextPosition(currentPos.row, currentPos.col, currentDir);

  if (!nextPos) {
    // Flow hit boundary - spill
    return spillFlow(game, currentPos.row, currentPos.col);
  }

  const nextCell = game.grid[nextPos.row][nextPos.col];

  // Check if next cell can accept flow
  if (nextCell.type === 'empty') {
    // Flow into empty cell - spill
    return spillFlow(game, nextPos.row, nextPos.col);
  }

  // Check if pipe connects from the incoming direction
  const incomingDir = getOppositeDirection(currentDir);
  if (!canConnect(nextCell.type, incomingDir)) {
    // Pipe doesn't connect - spill
    return spillFlow(game, nextPos.row, nextPos.col);
  }

  // Calculate score for filling this pipe
  const baseScore = 200; // Increased from 100
  const lengthBonus = game.pipesPlaced * 25; // Increased from 10
  const levelMultiplier = game.level;
  const newScore = game.score + (baseScore + lengthBonus) * levelMultiplier;

  // Create new grid with updated flow states
  const newGrid = game.grid.map(r => r.map(c => ({ ...c })));

  // Mark current cell as filled
  newGrid[currentPos.row][currentPos.col] = {
    ...newGrid[currentPos.row][currentPos.col],
    flowState: 'filled',
    flowDirection: currentDir,
  };

  // Check if reached end
  if (nextCell.type === 'end') {
    newGrid[nextPos.row][nextPos.col] = {
      ...nextCell,
      flowState: 'filled',
      flowDirection: incomingDir,
    };

    const finalScore = newScore + 2500 * game.level; // Increased from 1000
    const newHighScore = Math.max(game.highScore, finalScore);

    return {
      ...game,
      grid: newGrid,
      score: finalScore,
      highScore: newHighScore,
      gameState: 'won' as const,
    };
  }

  // Calculate new flow direction
  const newFlowDir = getOutputDirection(nextCell.type, incomingDir);

  if (!newFlowDir) {
    // Dead end - spill
    return spillFlow(game, nextPos.row, nextPos.col);
  }

  // Mark next cell as flowing
  newGrid[nextPos.row][nextPos.col] = {
    ...nextCell,
    flowState: 'flowing',
    flowDirection: newFlowDir,
  };

  return {
    ...game,
    grid: newGrid,
    flowPosition: nextPos,
    flowDirection: newFlowDir,
    score: newScore,
    lastFlowAdvance: Date.now(),
  };
}

// Handle flow spill (game over)
function spillFlow(game: GameData, row: number, col: number): GameData {
  const newGrid = game.grid.map(r => r.map(c => ({ ...c })));

  // Mark current position as spilled
  if (row >= 0 && row < GRID_ROWS && col >= 0 && col < GRID_COLS) {
    newGrid[row][col] = {
      ...newGrid[row][col],
      flowState: 'spilled',
    };
  }

  const newHighScore = Math.max(game.highScore, game.score);

  return {
    ...game,
    grid: newGrid,
    highScore: newHighScore,
    gameState: 'lost' as const,
  };
}

// Update flow timer (called every frame when not flowing)
export function updateFlowTimer(game: GameData, deltaTime: number): GameData {
  if (game.gameState === 'flowing' || game.gameState === 'won' || game.gameState === 'lost') {
    return game;
  }

  const newTimer = Math.max(0, game.flowTimer - deltaTime);

  // Auto-start flow when timer hits zero
  if (newTimer === 0) {
    return startFlow({ ...game, flowTimer: 0 });
  }

  return {
    ...game,
    flowTimer: newTimer,
  };
}

// Start next level
export function startNextLevel(game: GameData): GameData {
  return createInitialGame(game.highScore, game.level + 1);
}
