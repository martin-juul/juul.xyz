export type Direction = 'up' | 'down' | 'left' | 'right';
export type GameState = 'idle' | 'playing' | 'paused' | 'gameover';

export interface Position {
  row: number;
  col: number;
}

export type Snake = Position[];

export interface GameData {
  snake: Snake;
  food: Position;
  direction: Direction;
  nextDirection: Direction;
  score: number;
  level: number;
  speed: number;
  gameState: GameState;
}

// Grid configuration
export const GRID_ROWS = 20;
export const GRID_COLS = 25;
export const CELL_SIZE = 16;

// Speed settings (milliseconds per move)
export const SPEED_LEVELS: Record<number, number> = {
  1: 200,
  2: 175,
  3: 150,
  4: 125,
  5: 100,
  6: 85,
  7: 75,
  8: 65,
  9: 50,
};

export const POINTS_PER_FOOD = 10;
export const FOOD_TO_LEVEL_UP = 5;

// Create initial game state
export function createInitialGame(highScore: number = 0): GameData {
  const startRow = Math.floor(GRID_ROWS / 2);
  const startCol = Math.floor(GRID_COLS / 2) - 1;

  // Snake should be oriented in the direction it will move (right)
  // Index 0 is tail, last index is head
  const snake: Snake = [
    { row: startRow, col: startCol - 2 },
    { row: startRow, col: startCol - 1 },
    { row: startRow, col: startCol },  // head
  ];

  const food = generateFood(snake);

  return {
    snake,
    food,
    direction: 'right',
    nextDirection: 'right',
    score: 0,
    level: 1,
    speed: SPEED_LEVELS[1],
    gameState: 'idle',
  };
}

// Generate food at random position not on snake
export function generateFood(snake: Snake): Position {
  let position: Position;
  let attempts = 0;
  const maxAttempts = 1000;

  do {
    position = {
      row: Math.floor(Math.random() * GRID_ROWS),
      col: Math.floor(Math.random() * GRID_COLS),
    };
    attempts++;
  } while (isOnSnake(position, snake) && attempts < maxAttempts);

  return position;
}

// Check if position is on snake
function isOnSnake(position: Position, snake: Snake): boolean {
  return snake.some(
    segment => segment.row === position.row && segment.col === position.col
  );
}

// Check for collision with walls or self
export function checkCollision(head: Position, snake: Snake): boolean {
  // Wall collision
  if (
    head.row < 0 ||
    head.row >= GRID_ROWS ||
    head.col < 0 ||
    head.col >= GRID_COLS
  ) {
    return true;
  }

  // Self collision (skip head)
  for (let i = 0; i < snake.length - 1; i++) {
    if (snake[i].row === head.row && snake[i].col === head.col) {
      return true;
    }
  }

  return false;
}

// Move snake one step
export function moveSnake(data: GameData): GameData {
  const { snake, direction, nextDirection, score, level, food, gameState } = data;

  // Don't move if not playing
  if (gameState !== 'playing') {
    return data;
  }

  // Use current direction (nextDirection will be applied after this move)
  const currentDirection = direction;
  const head = snake[snake.length - 1];

  // Calculate new head position
  const newHead: Position = { ...head };
  switch (currentDirection) {
    case 'up':
      newHead.row--;
      break;
    case 'down':
      newHead.row++;
      break;
    case 'left':
      newHead.col--;
      break;
    case 'right':
      newHead.col++;
      break;
  }

  // Check collision
  if (checkCollision(newHead, snake)) {
    return { ...data, gameState: 'gameover' };
  }

  // Add new head
  const newSnake = [...snake, newHead];

  // Check if food eaten
  if (newHead.row === food.row && newHead.col === food.col) {
    // Ate food - don't remove tail (snake grows)
    const newScore = score + POINTS_PER_FOOD;
    const newLevel = isLevelUp(newScore, level) ? getNextLevel(level) : level;
    const newSpeed = SPEED_LEVELS[newLevel];

    return {
      ...data,
      snake: newSnake,
      food: generateFood(newSnake),
      score: newScore,
      level: newLevel,
      speed: newSpeed,
      direction: nextDirection, // Apply the direction change for next move
    };
  } else {
    // No food - remove tail (snake moves)
    newSnake.shift();
    return {
      ...data,
      snake: newSnake,
      direction: nextDirection, // Apply the direction change for next move
    };
  }
}

// Change direction (prevents 180-degree turns)
export function changeDirection(
  data: GameData,
  newDirection: Direction
): GameData {
  const { direction } = data;

  // Prevent 180-degree turns
  const opposites: Record<Direction, Direction> = {
    up: 'down',
    down: 'up',
    left: 'right',
    right: 'left',
  };

  if (opposites[direction] === newDirection) {
    return data; // Ignore 180-degree turn
  }

  return { ...data, nextDirection: newDirection };
}

// Check if level up
export function isLevelUp(score: number, level: number): boolean {
  const pointsForNextLevel = level * FOOD_TO_LEVEL_UP * POINTS_PER_FOOD;
  return score >= pointsForNextLevel && level < 9;
}

// Get next level
export function getNextLevel(currentLevel: number): number {
  return Math.min(currentLevel + 1, 9);
}

// Format time as MM:SS
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
