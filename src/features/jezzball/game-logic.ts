import type { CellType, Ball, GameData, BuildDirection, GameState } from './types';

export type { GameData, GameState } from './types';

export const GRID_COLS = 50;
export const GRID_ROWS = 40;
export const INITIAL_LIVES = 3;
export const WIN_PERCENTAGE = 50; // Lowered for testing
export const BALL_SPEED_MS = 50;
export const WALL_BUILD_TIME_MS = 500;

const BALL_COLORS = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];

function createEmptyGrid(): CellType[][] {
  return Array.from({ length: GRID_ROWS }, () =>
    Array.from({ length: GRID_COLS }, () => 'empty' as CellType)
  );
}

function createBall(id: number, existingBalls: Ball[]): Ball {
  // Find a starting position that's not too close to other balls
  let x: number, y: number;
  let attempts = 0;

  do {
    x = Math.floor(Math.random() * (GRID_COLS - 4)) + 2;
    y = Math.floor(Math.random() * (GRID_ROWS - 4)) + 2;
    attempts++;
  } while (
    attempts < 100 &&
    existingBalls.some(b => Math.abs(b.x - x) < 5 && Math.abs(b.y - y) < 5)
  );

  // Random direction
  const dx = Math.random() < 0.5 ? -1 : 1;
  const dy = Math.random() < 0.5 ? -1 : 1;

  return {
    id,
    x,
    y,
    dx,
    dy,
    color: BALL_COLORS[id % BALL_COLORS.length],
  };
}

function moveBall(ball: Ball, grid: CellType[][]): Ball {
  // Round current position to integers for grid checking
  const currentX = Math.round(ball.x);
  const currentY = Math.round(ball.y);

  // Calculate new position
  let newX = ball.x + ball.dx;
  let newY = ball.y + ball.dy;
  let newDx = ball.dx;
  let newDy = ball.dy;

  // Round new position for grid checking
  const newGridX = Math.round(newX);
  const newGridY = Math.round(newY);

  // Check wall collision at new position
  if (newGridY >= 0 && newGridY < GRID_ROWS && newGridX >= 0 && newGridX < GRID_COLS) {
    const targetCell = grid[newGridY][newGridX];
    if (targetCell === 'wall' || targetCell === 'building-h' || targetCell === 'building-v') {
      // Bounce back - reverse both directions
      newDx = -ball.dx;
      newDy = -ball.dy;
      newX = ball.x;
      newY = ball.y;
    }
  }

  // Edge collision (bounce off screen edges)
  if (newX < 0) {
    newX = 0;
    newDx = 1;
  } else if (newX >= GRID_COLS - 1) {
    newX = GRID_COLS - 1;
    newDx = -1;
  }

  if (newY < 0) {
    newY = 0;
    newDy = 1;
  } else if (newY >= GRID_ROWS - 1) {
    newY = GRID_ROWS - 1;
    newDy = -1;
  }

  return { ...ball, x: newX, y: newY, dx: newDx, dy: newDy };
}

function checkBallCollisionWithBuilding(
  balls: Ball[],
  grid: CellType[][]
): { hit: boolean; ballId: number | null } {
  for (const ball of balls) {
    const gridX = Math.round(ball.x);
    const gridY = Math.round(ball.y);
    if (gridY >= 0 && gridY < GRID_ROWS && gridX >= 0 && gridX < GRID_COLS) {
      const cell = grid[gridY][gridX];
      if (cell === 'building-h' || cell === 'building-v') {
        return { hit: true, ballId: ball.id };
      }
    }
  }
  return { hit: false, ballId: null };
}

export function createInitialGame(highScore: number = 0): GameData {
  const grid = createEmptyGrid();
  const balls = [createBall(0, [])];

  return {
    grid,
    balls,
    lives: INITIAL_LIVES,
    level: 1,
    percentageCleared: 0,
    highScore,
    gameState: 'idle' as GameState,
    buildDirection: 'horizontal' as BuildDirection,
    buildStart: null,
    buildProgress: 0,
    ballsHit: 0,
  };
}

export function startNextLevel(currentData: GameData): GameData {
  const grid = createEmptyGrid();
  const ballCount = Math.min(currentData.level + 1, 8);
  const balls: Ball[] = [];

  for (let i = 0; i < ballCount; i++) {
    balls.push(createBall(i, balls));
  }

  return {
    ...currentData,
    grid,
    balls,
    level: currentData.level + 1,
    percentageCleared: 0,
    gameState: 'idle' as GameState,
    buildStart: null,
    buildProgress: 0,
    ballsHit: 0,
  };
}

export function updateBalls(data: GameData): GameData {
  if (data.gameState !== 'playing' && data.gameState !== 'building') {
    return data;
  }

  const newBalls = data.balls.map((ball: Ball) => moveBall(ball, data.grid));

  // Check if balls hit the building wall
  if (data.gameState === 'building') {
    const collision = checkBallCollisionWithBuilding(newBalls, data.grid);
    if (collision.hit) {
      return {
        ...data,
        balls: newBalls,
        ballsHit: data.ballsHit + 1,
      };
    }
  }

  return { ...data, balls: newBalls };
}

export function startWallBuild(
  data: GameData,
  row: number,
  col: number
): GameData {
  if (data.gameState === 'building' || data.grid[row][col] !== 'empty') {
    return data;
  }

  const newGrid = data.grid.map(r => [...r]);
  const direction = data.buildDirection;

  if (direction === 'horizontal') {
    // Build wall across entire row
    for (let c = 0; c < GRID_COLS; c++) {
      if (newGrid[row][c] === 'empty') {
        newGrid[row][c] = 'building-h';
      }
    }
  } else {
    // Build wall down entire column
    for (let r = 0; r < GRID_ROWS; r++) {
      if (newGrid[r][col] === 'empty') {
        newGrid[r][col] = 'building-v';
      }
    }
  }

  return {
    ...data,
    grid: newGrid,
    gameState: 'building' as GameState,
    buildStart: { row, col },
    buildProgress: 0,
    ballsHit: 0,
  };
}

export function updateWallBuild(data: GameData): GameData {
  if (data.gameState !== 'building') {
    return data;
  }

  if (data.ballsHit > 0) {
    // Ball hit the building wall - just cancel the wall, don't lose a life
    const newGrid = data.grid.map((row: CellType[]) =>
      row.map((cell: CellType) => (cell.startsWith('building-') ? 'empty' : cell))
    );

    return {
      ...data,
      grid: newGrid,
      gameState: 'playing' as GameState,
      buildStart: null,
      buildProgress: 0,
      ballsHit: 0,
    };
  }

  if (data.buildProgress >= 100) {
    return completeWallBuild(data);
  }

  return {
    ...data,
    buildProgress: data.buildProgress + 100 / (WALL_BUILD_TIME_MS / 50),
  };
}

function findTrappedRegions(grid: CellType[][], balls: Ball[]): Set<string> {
  const trapped = new Set<string>();
  const visited = new Set<string>();

  function flood(row: number, col: number) {
    const key = `${row},${col}`;
    if (visited.has(key)) return;
    if (row < 0 || row >= GRID_ROWS || col < 0 || col >= GRID_COLS) return;
    if (grid[row][col] === 'wall') return;
    if (grid[row][col] === 'trapped') return; // Already trapped areas are obstacles
    if (grid[row][col].startsWith('building-')) return;

    visited.add(key);
    flood(row + 1, col);
    flood(row - 1, col);
    flood(row, col + 1);
    flood(row, col - 1);
  }

  for (const ball of balls) {
    flood(Math.round(ball.y), Math.round(ball.x));
  }

  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      if (grid[r][c] === 'empty' && !visited.has(`${r},${c}`)) {
        trapped.add(`${r},${c}`);
      }
    }
  }

  return trapped;
}

function completeWallBuild(data: GameData): GameData {
  const newGrid = data.grid.map((row: CellType[]) =>
    row.map((cell: CellType) => {
      if (cell === 'building-h' || cell === 'building-v') {
        return 'wall' as CellType;
      }
      return cell;
    })
  );

  const trapped = findTrappedRegions(newGrid, data.balls);

  // Convert trapped cells
  for (const key of trapped) {
    const [r, c] = key.split(',').map(Number);
    newGrid[r][c] = 'trapped';
  }

  // Calculate percentage: walls + ALL trapped cells count as cleared
  // Need to count all 'trapped' cells on the grid, not just newly trapped ones
  const totalCells = GRID_ROWS * GRID_COLS;
  const wallCells = newGrid.flat().filter((c: CellType) => c === 'wall').length;
  const allTrappedCells = newGrid.flat().filter((c: CellType) => c === 'trapped').length;

  const clearedCells = wallCells + allTrappedCells;
  const percentageCleared = Math.round((clearedCells / totalCells) * 100);

  // Debug output
  console.log(`Jezzball: walls=${wallCells}, trapped=${allTrappedCells}, cleared=${clearedCells}, total=${totalCells}, percentage=${percentageCleared}%`);

  const newGameState: GameState =
    percentageCleared >= WIN_PERCENTAGE ? 'won' : 'playing';

  return {
    ...data,
    grid: newGrid,
    percentageCleared,
    gameState: newGameState,
    buildStart: null,
    buildProgress: 0,
  };
}

export function toggleBuildDirection(data: GameData): GameData {
  return {
    ...data,
    buildDirection: data.buildDirection === 'horizontal' ? 'vertical' : 'horizontal',
  };
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
