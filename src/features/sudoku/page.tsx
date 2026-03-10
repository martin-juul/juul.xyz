import { useState, useCallback, useEffect, useRef } from 'preact/hooks';
import { useLanguage } from '../../context/language-context';
import './sudoku.css';

type Difficulty = 'easy' | 'medium' | 'hard';

type Cell = {
  value: number | null;
  isGiven: boolean;
  notes: Set<number>;
};

type GameState = 'idle' | 'playing' | 'won';

type Position = {
  row: number;
  col: number;
};

const DIFFICULTY_CELLS_TO_REMOVE = {
  easy: 35,
  medium: 45,
  hard: 55,
};

// Create an empty 9x9 grid
function createEmptyGrid(): Cell[][] {
  return Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, () => ({
      value: null,
      isGiven: false,
      notes: new Set<number>(),
    }))
  );
}

// Check if a number can be placed at a position
function isValidPlacement(grid: (number | null)[][], row: number, col: number, num: number): boolean {
  // Check row
  for (let c = 0; c < 9; c++) {
    if (grid[row][c] === num) return false;
  }

  // Check column
  for (let r = 0; r < 9; r++) {
    if (grid[r][col] === num) return false;
  }

  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (grid[r][c] === num) return false;
    }
  }

  return true;
}

// Generate a complete valid Sudoku solution using backtracking
function generateSolution(): (number | null)[][] {
  const grid: (number | null)[][] = Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, () => null)
  );

  function solve(): boolean {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === null) {
          // Shuffle numbers 1-9 for randomness
          const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);

          for (const num of numbers) {
            if (isValidPlacement(grid, row, col, num)) {
              grid[row][col] = num;

              if (solve()) {
                return true;
              }

              grid[row][col] = null;
            }
          }

          return false;
        }
      }
    }

    return true;
  }

  solve();
  return grid;
}

// Create a puzzle by removing cells from the solution
function createPuzzle(solution: (number | null)[][], difficulty: Difficulty): Cell[][] {
  const cellsToRemove = DIFFICULTY_CELLS_TO_REMOVE[difficulty];
  const grid = createEmptyGrid();

  // Copy solution to grid
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      grid[row][col].value = solution[row][col];
      grid[row][col].isGiven = true;
    }
  }

  // Remove cells randomly
  let removed = 0;
  const positions: Position[] = [];
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      positions.push({ row, col });
    }
  }

  // Shuffle positions
  positions.sort(() => Math.random() - 0.5);

  for (const pos of positions) {
    if (removed >= cellsToRemove) break;

    grid[pos.row][pos.col].value = null;
    grid[pos.row][pos.col].isGiven = false;
    removed++;
  }

  return grid;
}

// Get all cells that conflict with the value at a position
function getConflictingCells(grid: Cell[][], row: number, col: number): Position[] {
  const value = grid[row][col].value;
  if (value === null) return [];

  const conflicts: Position[] = [];

  // Check row
  for (let c = 0; c < 9; c++) {
    if (c !== col && grid[row][c].value === value) {
      conflicts.push({ row, col: c });
    }
  }

  // Check column
  for (let r = 0; r < 9; r++) {
    if (r !== row && grid[r][col].value === value) {
      conflicts.push({ row: r, col });
    }
  }

  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (r !== row && c !== col && grid[r][c].value === value) {
        conflicts.push({ row: r, col: c });
      }
    }
  }

  return conflicts;
}

// Check if the puzzle is complete and valid
function isPuzzleComplete(grid: Cell[][]): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col].value === null) return false;
      const conflicts = getConflictingCells(grid, row, col);
      if (conflicts.length > 0) return false;
    }
  }
  return true;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function Sudoku() {
  const { t } = useLanguage();
  const txt = t.sudoku;

  const [grid, setGrid] = useState<Cell[][]>(() => {
    const solution = generateSolution();
    return createPuzzle(solution, 'easy');
  });
  const [solution, setSolution] = useState<(number | null)[][]>(() => generateSolution());
  const [selectedCell, setSelectedCell] = useState<Position | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [gameState, setGameState] = useState<GameState>('idle');
  const [timer, setTimer] = useState(0);
  const [activeMenu, setActiveMenu] = useState<'game' | 'help' | null>(null);
  const timerRef = useRef<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Timer logic
  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = window.setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameState]);

  // Keyboard handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedCell || gameState === 'won') return;

      const { row, col } = selectedCell;
      const cell = grid[row][col];

      // Number input (1-9)
      if (e.key >= '1' && e.key <= '9' && !cell.isGiven) {
        const num = parseInt(e.key);
        const newGrid = grid.map(r => r.map(c => ({ ...c, notes: new Set(c.notes) })));
        newGrid[row][col].value = num;
        newGrid[row][col].notes.clear();
        setGrid(newGrid);

        if (gameState === 'idle') {
          setGameState('playing');
        }

        // Check win
        if (isPuzzleComplete(newGrid)) {
          setGameState('won');
        }
      }

      // Delete/Backspace to clear
      if ((e.key === 'Delete' || e.key === 'Backspace') && !cell.isGiven) {
        const newGrid = grid.map(r => r.map(c => ({ ...c, notes: new Set(c.notes) })));
        newGrid[row][col].value = null;
        setGrid(newGrid);
      }

      // Arrow key navigation
      if (e.key === 'ArrowUp' && row > 0) {
        setSelectedCell({ row: row - 1, col });
      }
      if (e.key === 'ArrowDown' && row < 8) {
        setSelectedCell({ row: row + 1, col });
      }
      if (e.key === 'ArrowLeft' && col > 0) {
        setSelectedCell({ row, col: col - 1 });
      }
      if (e.key === 'ArrowRight' && col < 8) {
        setSelectedCell({ row, col: col + 1 });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, grid, gameState]);

  const newGame = useCallback((newDifficulty?: Difficulty) => {
    const diff = newDifficulty || difficulty;
    const newSolution = generateSolution();
    const newGrid = createPuzzle(newSolution, diff);

    setSolution(newSolution);
    setGrid(newGrid);
    setSelectedCell(null);
    setGameState('idle');
    setTimer(0);
    if (newDifficulty) {
      setDifficulty(newDifficulty);
    }
    setActiveMenu(null);
  }, [difficulty]);

  const handleCellClick = useCallback((row: number, col: number) => {
    setSelectedCell({ row, col });
  }, []);

  const handleNumberPadClick = useCallback((num: number) => {
    if (!selectedCell || gameState === 'won') return;

    const { row, col } = selectedCell;
    const cell = grid[row][col];

    if (cell.isGiven) return;

    const newGrid = grid.map(r => r.map(c => ({ ...c, notes: new Set(c.notes) })));
    newGrid[row][col].value = num;
    newGrid[row][col].notes.clear();
    setGrid(newGrid);

    if (gameState === 'idle') {
      setGameState('playing');
    }

    // Check win
    if (isPuzzleComplete(newGrid)) {
      setGameState('won');
    }
  }, [selectedCell, grid, gameState]);

  const handleClear = useCallback(() => {
    if (!selectedCell || gameState === 'won') return;

    const { row, col } = selectedCell;
    const cell = grid[row][col];

    if (cell.isGiven) return;

    const newGrid = grid.map(r => r.map(c => ({ ...c, notes: new Set(c.notes) })));
    newGrid[row][col].value = null;
    setGrid(newGrid);
  }, [selectedCell, grid, gameState]);

  // Get all conflicts for highlighting
  const getAllConflicts = useCallback(() => {
    const conflicts = new Set<string>();
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const cellConflicts = getConflictingCells(grid, row, col);
        for (const c of cellConflicts) {
          conflicts.add(`${c.row}-${c.col}`);
        }
        if (cellConflicts.length > 0) {
          conflicts.add(`${row}-${col}`);
        }
      }
    }
    return conflicts;
  }, [grid]);

  const conflicts = getAllConflicts();

  const renderCell = (cell: Cell, row: number, col: number) => {
    const isSelected = selectedCell?.row === row && selectedCell?.col === col;
    const isConflict = conflicts.has(`${row}-${col}`);

    let className = 'sudoku-cell';

    // 3x3 box borders
    if (col % 3 === 0 && col !== 0) {
      className += ' sudoku-cell-box-left';
    }
    if (row % 3 === 0 && row !== 0) {
      className += ' sudoku-cell-box-top';
    }

    if (cell.isGiven) {
      className += ' sudoku-cell-given';
    } else {
      className += ' sudoku-cell-user';
    }

    if (isSelected) {
      className += ' sudoku-cell-selected';
    }

    if (isConflict && cell.value !== null) {
      className += ' sudoku-cell-conflict';
    }

    return (
      <div
        class={className}
        onClick={() => handleCellClick(row, col)}
        data-testid={`sudoku-cell-${row}-${col}`}
        data-row={row}
        data-col={col}
        data-value={cell.value ?? ''}
        data-given={cell.isGiven}
      >
        {cell.value !== null ? cell.value : ''}
      </div>
    );
  };

  return (
    <div class="sudoku-container" data-testid="sudoku-container">
      <div class="sudoku-menu-bar" ref={menuRef} data-testid="sudoku-menu-bar">
        <div class="sudoku-menu-trigger">
          <span
            class={`sudoku-menu-item ${activeMenu === 'game' ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenu(activeMenu === 'game' ? null : 'game');
            }}
            data-testid="sudoku-menu-game"
          >
            {txt.menu.game}
          </span>
          {activeMenu === 'game' && (
            <div class="sudoku-dropdown" data-testid="sudoku-game-dropdown">
              <button class="sudoku-dropdown-item" onClick={() => newGame()} data-testid="sudoku-new-game">
                <span class="sudoku-dropdown-text">{txt.game.new}</span>
              </button>
              <div class="sudoku-dropdown-separator" />
              <button
                class={`sudoku-dropdown-item ${difficulty === 'easy' ? 'checked' : ''}`}
                onClick={() => newGame('easy')}
                data-testid="sudoku-difficulty-easy"
              >
                <span class="sudoku-dropdown-check">{difficulty === 'easy' ? '✓' : ''}</span>
                <span class="sudoku-dropdown-text">{txt.game.easy}</span>
              </button>
              <button
                class={`sudoku-dropdown-item ${difficulty === 'medium' ? 'checked' : ''}`}
                onClick={() => newGame('medium')}
                data-testid="sudoku-difficulty-medium"
              >
                <span class="sudoku-dropdown-check">{difficulty === 'medium' ? '✓' : ''}</span>
                <span class="sudoku-dropdown-text">{txt.game.medium}</span>
              </button>
              <button
                class={`sudoku-dropdown-item ${difficulty === 'hard' ? 'checked' : ''}`}
                onClick={() => newGame('hard')}
                data-testid="sudoku-difficulty-hard"
              >
                <span class="sudoku-dropdown-check">{difficulty === 'hard' ? '✓' : ''}</span>
                <span class="sudoku-dropdown-text">{txt.game.hard}</span>
              </button>
            </div>
          )}
        </div>
        <span class="sudoku-menu-item" data-testid="sudoku-menu-help">{txt.menu.help}</span>
      </div>

      <div class="sudoku-game-area" data-testid="sudoku-game-area">
        <div class="sudoku-controls" data-testid="sudoku-controls">
          <div class="sudoku-timer" data-testid="sudoku-timer">
            <span class="sudoku-timer-label">{txt.stats.time}:</span>
            <span class="sudoku-timer-value">{formatTime(timer)}</span>
          </div>
          <button
            class="sudoku-new-btn"
            onClick={() => newGame()}
            data-testid="sudoku-new-button"
          >
            {txt.game.new}
          </button>
        </div>

        {gameState === 'won' && (
          <div class="sudoku-win-message" data-testid="sudoku-win-message">
            Congratulations! You solved it in {formatTime(timer)}!
          </div>
        )}

        <div class="sudoku-grid" data-testid="sudoku-grid">
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => renderCell(cell, rowIndex, colIndex))
          )}
        </div>

        <div class="sudoku-number-pad" data-testid="sudoku-number-pad">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              class="sudoku-number-btn"
              onClick={() => handleNumberPadClick(num)}
              data-testid={`sudoku-num-${num}`}
              key={num}
            >
              {num}
            </button>
          ))}
          <button
            class="sudoku-number-btn sudoku-clear-btn"
            onClick={handleClear}
            data-testid="sudoku-clear"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
