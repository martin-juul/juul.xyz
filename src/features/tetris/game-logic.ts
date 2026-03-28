/**
 * Tetris Game Logic
 * Core game mechanics including collision detection, movement, rotation, and line clearing
 */

import { Board, GameState, MoveResult, Position, RotationDirection, Tetromino, TetrominoType } from './types';
import {
  BOARD_COLS,
  BOARD_ROWS,
  getDropSpeed,
  LINES_PER_LEVEL,
  START_POSITION,
  TETROMINO_COLORS,
  TETROMINO_SHAPES,
  calculateScore,
} from './constants';

/**
 * Create an empty board
 */
export function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_ROWS }, () => Array(BOARD_COLS).fill(null));
}

/**
 * Get a random tetromino type
 */
export function getRandomTetrominoType(): TetrominoType {
  const types: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
  return types[Math.floor(Math.random() * types.length)];
}

/**
 * Create a new tetromino piece
 */
export function createTetromino(type: TetrominoType, position: Position = START_POSITION): Tetromino {
  const shapes = TETROMINO_SHAPES[type];
  return {
    type,
    shape: shapes[0], // Start with first rotation state
    position: { ...position },
    color: TETROMINO_COLORS[type],
  };
}

/**
 * Create initial game state
 */
export function createInitialGame(): GameState {
  const currentPiece = createTetromino(getRandomTetrominoType());
  const nextPiece = createTetromino(getRandomTetrominoType());

  return {
    board: createEmptyBoard(),
    currentPiece,
    nextPiece,
    score: 0,
    level: 0,
    lines: 0,
    isGameOver: false,
    isPaused: false,
  };
}

/**
 * Check if a move is valid (no collisions or out of bounds)
 */
export function isValidMove(board: Board, piece: Tetromino, newPosition: Position, newShape: number[][]): boolean {
  for (let row = 0; row < newShape.length; row++) {
    for (let col = 0; col < newShape[row].length; col++) {
      if (newShape[row][col]) {
        const boardRow = newPosition.row + row;
        const boardCol = newPosition.col + col;

        // Check bounds
        if (boardCol < 0 || boardCol >= BOARD_COLS || boardRow >= BOARD_ROWS) {
          return false;
        }

        // Check collision with locked pieces (ignore rows above board)
        if (boardRow >= 0 && board[boardRow][boardCol]) {
          return false;
        }
      }
    }
  }
  return true;
}

/**
 * Rotate a tetromino clockwise or counterclockwise
 */
export function rotatePiece(piece: Tetromino, direction: RotationDirection = 'clockwise'): Tetromino {
  const shapes = TETROMINO_SHAPES[piece.type];
  const currentRotation = shapes.findIndex(shape => shape === piece.shape);

  let newRotation: number;
  if (direction === 'clockwise') {
    newRotation = (currentRotation + 1) % shapes.length;
  } else {
    newRotation = (currentRotation - 1 + shapes.length) % shapes.length;
  }

  return {
    ...piece,
    shape: shapes[newRotation],
  };
}

/**
 * Try to rotate a piece with wall kick support
 */
export function tryRotate(board: Board, piece: Tetromino, direction: RotationDirection = 'clockwise'): Tetromino | null {
  const rotated = rotatePiece(piece, direction);

  // Try rotation at current position
  if (isValidMove(board, piece, piece.position, rotated.shape)) {
    return { ...piece, shape: rotated.shape };
  }

  // Try wall kicks (move left/right/up to fit rotation)
  const kickOffsets = [
    { col: -1, row: 0 }, // Left
    { col: 1, row: 0 },  // Right
    { col: -2, row: 0 }, // Left 2
    { col: 2, row: 0 },  // Right 2
    { col: 0, row: -1 }, // Up
  ];

  for (const offset of kickOffsets) {
    const newPosition = {
      col: piece.position.col + offset.col,
      row: piece.position.row + offset.row,
    };
    if (isValidMove(board, piece, newPosition, rotated.shape)) {
      return { ...piece, shape: rotated.shape, position: newPosition };
    }
  }

  // Rotation failed, return original piece
  return piece;
}

/**
 * Move a piece in a direction
 */
export function movePiece(board: Board, piece: Tetromino, direction: 'left' | 'right' | 'down'): Tetromino | null {
  const offsetMap = {
    left: { col: -1, row: 0 },
    right: { col: 1, row: 0 },
    down: { col: 0, row: 1 },
  };

  const newPosition = {
    col: piece.position.col + offsetMap[direction].col,
    row: piece.position.row + offsetMap[direction].row,
  };

  if (isValidMove(board, piece, newPosition, piece.shape)) {
    return { ...piece, position: newPosition };
  }

  return null; // Move failed
}

/**
 * Calculate ghost piece position (where piece will land)
 */
export function getGhostPosition(board: Board, piece: Tetromino): Position {
  let ghostPosition = { ...piece.position };

  while (isValidMove(board, piece, { ...ghostPosition, row: ghostPosition.row + 1 }, piece.shape)) {
    ghostPosition.row++;
  }

  return ghostPosition;
}

/**
 * Hard drop (instantly drop piece to bottom)
 */
export function hardDrop(board: Board, piece: Tetromino): Tetromino {
  const ghostPosition = getGhostPosition(board, piece);
  return { ...piece, position: ghostPosition };
}

/**
 * Lock a piece into the board
 */
export function lockPiece(board: Board, piece: Tetromino): Board {
  const newBoard = board.map(row => [...row]);

  for (let row = 0; row < piece.shape.length; row++) {
    for (let col = 0; col < piece.shape[row].length; col++) {
      if (piece.shape[row][col]) {
        const boardRow = piece.position.row + row;
        const boardCol = piece.position.col + col;

        if (boardRow >= 0 && boardRow < BOARD_ROWS && boardCol >= 0 && boardCol < BOARD_COLS) {
          newBoard[boardRow][boardCol] = piece.color;
        }
      }
    }
  }

  return newBoard;
}

/**
 * Clear completed lines and return new board with lines cleared
 */
export function clearLines(board: Board): { newBoard: Board; linesCleared: number } {
  const linesToClear: number[] = [];

  // Find full lines
  for (let row = 0; row < BOARD_ROWS; row++) {
    if (board[row].every(cell => cell !== null)) {
      linesToClear.push(row);
    }
  }

  if (linesToClear.length === 0) {
    return { newBoard: board, linesCleared: 0 };
  }

  // Remove filled lines and add empty lines at top
  const newBoard = board.filter((_, index) => !linesToClear.includes(index));
  const emptyLines = Array.from({ length: linesToClear.length }, () => Array(BOARD_COLS).fill(null));

  return {
    newBoard: [...emptyLines, ...newBoard],
    linesCleared: linesToClear.length,
  };
}

/**
 * Check if game is over (new piece cannot spawn)
 */
export function checkGameOver(board: Board, piece: Tetromino): boolean {
  // Check if piece overlaps with existing pieces at spawn position
  for (let row = 0; row < piece.shape.length; row++) {
    for (let col = 0; col < piece.shape[row].length; col++) {
      if (piece.shape[row][col]) {
        const boardRow = piece.position.row + row;
        const boardCol = piece.position.col + col;

        if (boardRow >= 0 && boardRow < BOARD_ROWS && boardCol >= 0 && boardCol < BOARD_COLS) {
          if (board[boardRow][boardCol]) {
            return true;
          }
        }
      }
    }
  }
  return false;
}

/**
 * Process a move (left, right, down) and return result
 */
export function processMove(board: Board, piece: Tetromino, direction: 'left' | 'right' | 'down'): MoveResult {
  const movedPiece = movePiece(board, piece, direction);

  if (movedPiece) {
    return { success: true, newPiece: movedPiece };
  }

  // Move failed - if moving down, lock the piece
  if (direction === 'down') {
    const lockedBoard = lockPiece(board, piece);
    const { newBoard, linesCleared } = clearLines(lockedBoard);

    return {
      success: true,
      locked: true,
      newBoard,  // Return the updated board with locked piece
      linesCleared,
    };
  }

  return { success: false };
}

/**
 * Spawn next piece and update game state
 */
export function spawnNextPiece(gameState: GameState): GameState {
  const { board, nextPiece, score, level, lines } = gameState;

  const newCurrentPiece = nextPiece;
  const newNextPiece = createTetromino(getRandomTetrominoType());

  // Check game over
  const isGameOver = checkGameOver(board, newCurrentPiece);

  return {
    ...gameState,
    currentPiece: newCurrentPiece,
    nextPiece: newNextPiece,
    isGameOver,
  };
}

/**
 * Update score and level after clearing lines
 * If linesCleared is 0, returns the unchanged state (caller should still update if board changed)
 */
export function updateScore(gameState: GameState, linesCleared: number): GameState {
  if (linesCleared === 0) return gameState;

  const newScore = gameState.score + calculateScore(linesCleared, gameState.level);
  const newLines = gameState.lines + linesCleared;
  const newLevel = Math.floor(newLines / LINES_PER_LEVEL);

  return {
    ...gameState,
    score: newScore,
    lines: newLines,
    level: newLevel,
  };
}

/**
 * Get drop interval based on current level
 */
export function getDropInterval(level: number): number {
  return getDropSpeed(level);
}
