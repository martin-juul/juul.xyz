import { useState, useCallback, useEffect, useRef } from 'preact/hooks';
import { useLanguage } from '../../context/language-context';
import './minesweeper.css';

type Difficulty = 'beginner' | 'intermediate' | 'expert';

type Cell = {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  adjacentMines: number;
};

type GameState = 'idle' | 'playing' | 'won' | 'lost';

const DIFFICULTY_CONFIG = {
  beginner: { rows: 9, cols: 9, mines: 10 },
  intermediate: { rows: 16, cols: 16, mines: 40 },
  expert: { rows: 16, cols: 30, mines: 99 },
};

function createEmptyGrid(rows: number, cols: number): Cell[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      isMine: false,
      isRevealed: false,
      isFlagged: false,
      adjacentMines: 0,
    }))
  );
}

function placeMines(grid: Cell[][], rows: number, cols: number, mineCount: number, excludeRow: number, excludeCol: number): Cell[][] {
  const newGrid = grid.map(row => row.map(cell => ({ ...cell, isMine: false })));
  let placed = 0;

  while (placed < mineCount) {
    const row = Math.floor(Math.random() * rows);
    const col = Math.floor(Math.random() * cols);

    // Don't place mine on first click or adjacent cells
    const isExcluded = Math.abs(row - excludeRow) <= 1 && Math.abs(col - excludeCol) <= 1;

    if (!newGrid[row][col].isMine && !isExcluded) {
      newGrid[row][col].isMine = true;
      placed++;
    }
  }

  // Calculate adjacent mines
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!newGrid[r][c].isMine) {
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && newGrid[nr][nc].isMine) {
              count++;
            }
          }
        }
        newGrid[r][c].adjacentMines = count;
      }
    }
  }

  return newGrid;
}

function revealCell(grid: Cell[][], rows: number, cols: number, row: number, col: number): Cell[][] {
  const newGrid = grid.map(r => r.map(c => ({ ...c })));

  function flood(r: number, c: number) {
    if (r < 0 || r >= rows || c < 0 || c >= cols) return;
    if (newGrid[r][c].isRevealed || newGrid[r][c].isFlagged) return;

    newGrid[r][c].isRevealed = true;

    if (newGrid[r][c].adjacentMines === 0 && !newGrid[r][c].isMine) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          flood(r + dr, c + dc);
        }
      }
    }
  }

  flood(row, col);
  return newGrid;
}

function revealAllMines(grid: Cell[][]): Cell[][] {
  return grid.map(row =>
    row.map(cell => ({
      ...cell,
      isRevealed: cell.isMine ? true : cell.isRevealed,
    }))
  );
}

function chordReveal(grid: Cell[][], rows: number, cols: number, row: number, col: number): Cell[][] | null {
  const cell = grid[row][col];
  if (!cell.isRevealed || cell.adjacentMines === 0) return null;

  // Count adjacent flags
  let flagCount = 0;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc].isFlagged) {
        flagCount++;
      }
    }
  }

  // If flags match adjacent mines, reveal all unflagged adjacent cells
  if (flagCount === cell.adjacentMines) {
    let newGrid = grid.map(r => r.map(c => ({ ...c })));
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = row + dr;
        const nc = col + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !newGrid[nr][nc].isFlagged && !newGrid[nr][nc].isRevealed) {
          if (newGrid[nr][nc].isMine) {
            return null; // Will trigger game over
          }
          newGrid = revealCell(newGrid, rows, cols, nr, nc);
        }
      }
    }
    return newGrid;
  }

  return null;
}

function formatNumber(num: number): string {
  if (num < 0) return '-' + Math.abs(num).toString().padStart(2, '0');
  return num.toString().padStart(3, '0');
}

export function Minesweeper() {
  const { t } = useLanguage();
  const txt = t.minesweeper;
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
  const [grid, setGrid] = useState<Cell[][]>(() => {
    const config = DIFFICULTY_CONFIG['beginner'];
    return createEmptyGrid(config.rows, config.cols);
  });
  const [gameState, setGameState] = useState<GameState>('idle');
  const [minesLeft, setMinesLeft] = useState(10);
  const [timer, setTimer] = useState(0);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [pressedCell, setPressedCell] = useState<{ row: number; col: number } | null>(null);
  const [activeMenu, setActiveMenu] = useState<'game' | 'help' | null>(null);
  const timerRef = useRef<number | null>(null);
  const isFirstClick = useRef(true);
  const menuRef = useRef<HTMLDivElement>(null);

  const config = DIFFICULTY_CONFIG[difficulty];

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
        setTimer(t => Math.min(t + 1, 999));
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

  const resetGame = useCallback((newDifficulty?: Difficulty) => {
    const diff = newDifficulty || difficulty;
    const cfg = DIFFICULTY_CONFIG[diff];
    setGrid(createEmptyGrid(cfg.rows, cfg.cols));
    setGameState('idle');
    setMinesLeft(cfg.mines);
    setTimer(0);
    isFirstClick.current = true;
    if (newDifficulty) {
      setDifficulty(newDifficulty);
    }
    setActiveMenu(null);
  }, [difficulty]);

  const handleCellMouseDown = useCallback((row: number, col: number, e: MouseEvent) => {
    e.preventDefault();

    if (gameState === 'won' || gameState === 'lost') return;

    const cell = grid[row][col];

    if (e.button === 0) { // Left click
      if (cell.isFlagged) return;
      setIsMouseDown(true);
      setPressedCell({ row, col });
    }
  }, [grid, gameState]);

  const handleCellMouseUp = useCallback((row: number, col: number, e: MouseEvent) => {
    e.preventDefault();

    if (gameState === 'won' || gameState === 'lost') return;

    const cell = grid[row][col];

    if (e.button === 0) { // Left click
      setIsMouseDown(false);
      setPressedCell(null);

      if (cell.isFlagged || cell.isRevealed) return;

      // First click - place mines
      let currentGrid = grid;
      if (isFirstClick.current) {
        currentGrid = placeMines(grid, config.rows, config.cols, config.mines, row, col);
        isFirstClick.current = false;
        setGameState('playing');
      }

      if (currentGrid[row][col].isMine) {
        setGrid(revealAllMines(currentGrid));
        setGameState('lost');
      } else {
        const newGrid = revealCell(currentGrid, config.rows, config.cols, row, col);
        setGrid(newGrid);

        // Check win
        const allNonMinesRevealed = newGrid.every(r =>
          r.every(c => c.isMine || c.isRevealed)
        );
        if (allNonMinesRevealed) {
          setGameState('won');
        }
      }
    }
  }, [grid, gameState, config]);

  const handleCellContextMenu = useCallback((row: number, col: number, e: MouseEvent) => {
    e.preventDefault();

    if (gameState === 'won' || gameState === 'lost') return;
    if (grid[row][col].isRevealed) return;

    const cell = grid[row][col];
    const newGrid = grid.map(r => r.map(c => ({ ...c })));
    newGrid[row][col].isFlagged = !cell.isFlagged;
    setGrid(newGrid);
    setMinesLeft(prev => cell.isFlagged ? prev + 1 : prev - 1);

    if (gameState === 'idle') {
      setGameState('playing');
    }
  }, [grid, gameState]);

  const handleCellDoubleClick = useCallback((row: number, col: number, e: MouseEvent) => {
    e.preventDefault();

    if (gameState === 'won' || gameState === 'lost') return;

    const result = chordReveal(grid, config.rows, config.cols, row, col);
    if (result) {
      // Check if any mine was hit (chord on wrong flags)
      const hitMine = result.some(r => r.some(c => c.isRevealed && c.isMine));
      if (hitMine) {
        setGrid(revealAllMines(result));
        setGameState('lost');
      } else {
        setGrid(result);
        // Check win
        const allNonMinesRevealed = result.every(r =>
          r.every(c => c.isMine || c.isRevealed)
        );
        if (allNonMinesRevealed) {
          setGameState('won');
        }
      }
    }
  }, [grid, gameState, config]);

  const getFaceEmoji = () => {
    switch (gameState) {
      case 'won': return '😎';
      case 'lost': return '😵';
      default: return isMouseDown ? '😮' : '🙂';
    }
  };

  const renderCell = (cell: Cell, row: number, col: number) => {
    const isPressed = pressedCell?.row === row && pressedCell?.col === col && isMouseDown;

    let content = '';
    let className = 'ms-cell';

    if (cell.isRevealed) {
      className += ' ms-cell-revealed';
      if (cell.isMine) {
        content = '💣';
        className += ' ms-mine';
      } else if (cell.adjacentMines > 0) {
        content = cell.adjacentMines.toString();
        className += ` ms-num-${cell.adjacentMines}`;
      }
    } else {
      if (isPressed) {
        className += ' ms-cell-pressed';
      }
      if (cell.isFlagged) {
        content = '🚩';
      }
    }

    if (gameState === 'lost' && cell.isMine && !cell.isFlagged) {
      className += ' ms-mine-exploded';
    }

    return (
      <div
        class={className}
        onMouseDown={(e) => handleCellMouseDown(row, col, e)}
        onMouseUp={(e) => handleCellMouseUp(row, col, e)}
        onMouseLeave={() => {
          setIsMouseDown(false);
          setPressedCell(null);
        }}
        onContextMenu={(e) => handleCellContextMenu(row, col, e)}
        onDblClick={(e) => handleCellDoubleClick(row, col, e)}
        data-testid={`minesweeper-cell-${row}-${col}`}
        data-row={row}
        data-col={col}
        data-revealed={cell.isRevealed}
        data-flagged={cell.isFlagged}
        data-mine={cell.isMine}
      >
        {content}
      </div>
    );
  };

  return (
    <div class="ms-container" data-testid="minesweeper-container">
      <div class="ms-menu-bar" ref={menuRef} data-testid="minesweeper-menu-bar">
        <div class="ms-menu-trigger">
          <span
            class={`ms-menu-item ${activeMenu === 'game' ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenu(activeMenu === 'game' ? null : 'game');
            }}
            data-testid="minesweeper-menu-game"
          >
            {txt.menu.game}
          </span>
          {activeMenu === 'game' && (
            <div class="ms-dropdown" data-testid="minesweeper-game-dropdown">
              <button class="ms-dropdown-item" onClick={() => resetGame()} data-testid="minesweeper-new-game">
                <span class="ms-dropdown-text">{txt.game.new}</span>
              </button>
              <div class="ms-dropdown-separator" />
              <button
                class={`ms-dropdown-item ${difficulty === 'beginner' ? 'checked' : ''}`}
                onClick={() => resetGame('beginner')}
                data-testid="minesweeper-difficulty-beginner"
              >
                <span class="ms-dropdown-check">{difficulty === 'beginner' ? '✓' : ''}</span>
                <span class="ms-dropdown-text">{txt.game.beginner}</span>
              </button>
              <button
                class={`ms-dropdown-item ${difficulty === 'intermediate' ? 'checked' : ''}`}
                onClick={() => resetGame('intermediate')}
                data-testid="minesweeper-difficulty-intermediate"
              >
                <span class="ms-dropdown-check">{difficulty === 'intermediate' ? '✓' : ''}</span>
                <span class="ms-dropdown-text">{txt.game.intermediate}</span>
              </button>
              <button
                class={`ms-dropdown-item ${difficulty === 'expert' ? 'checked' : ''}`}
                onClick={() => resetGame('expert')}
                data-testid="minesweeper-difficulty-expert"
              >
                <span class="ms-dropdown-check">{difficulty === 'expert' ? '✓' : ''}</span>
                <span class="ms-dropdown-text">{txt.game.expert}</span>
              </button>
            </div>
          )}
        </div>
        <span class="ms-menu-item" data-testid="minesweeper-menu-help">{txt.menu.help}</span>
      </div>

      <div class="ms-game-area" data-testid="minesweeper-game-area">
        <div class="ms-controls" data-testid="minesweeper-controls">
          <div class="ms-led ms-mines-left" data-testid="minesweeper-mine-counter">{formatNumber(minesLeft)}</div>
          <button
            class="ms-face-btn"
            onClick={() => resetGame()}
            onMouseDown={() => setIsMouseDown(true)}
            onMouseUp={() => setIsMouseDown(false)}
            data-testid="minesweeper-face-button"
          >
            {getFaceEmoji()}
          </button>
          <div class="ms-led ms-timer" data-testid="minesweeper-timer">{formatNumber(timer)}</div>
        </div>

        <div
          class="ms-grid"
          style={{
            gridTemplateColumns: `repeat(${config.cols}, 16px)`,
            gridTemplateRows: `repeat(${config.rows}, 16px)`,
          }}
          data-testid="minesweeper-grid"
        >
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => renderCell(cell, rowIndex, colIndex))
          )}
        </div>
      </div>
    </div>
  );
}
