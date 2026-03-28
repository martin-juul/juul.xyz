/**
 * Tetris Game Component
 * Main game loop, state management, and UI rendering
 */

import { useEffect, useRef, useState, useCallback } from 'preact/hooks';
import { useLanguage } from '../../context/language-context';
import { tetrisTranslations } from './translations';
import './index.css';
import {
  clearLines,
  createInitialGame,
  createTetromino,
  getRandomTetrominoType,
  getDropInterval,
  getGhostPosition,
  hardDrop,
  isValidMove,
  lockPiece,
  movePiece,
  processMove,
  rotatePiece,
  spawnNextPiece,
  tryRotate,
  updateScore,
} from './game-logic';
import { GameState, Position, Tetromino } from './types';
import { BOARD_COLS, BOARD_ROWS, START_POSITION } from './constants';
import { loadStats, saveStats, recordGamePlayed, recordGameWon, type GameStats } from '../../lib/card-games';

interface TetrisStats extends GameStats {
  highScore: number;
  totalLines: number;
}

export function Tetris() {
  const { t } = useLanguage();
  const txt = t.tetris;

  // Game state
  const [gameState, setGameState] = useState<GameState>(() => createInitialGame());
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // UI state
  const [activeMenu, setActiveMenu] = useState<'game' | 'help' | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [ghostPosition, setGhostPosition] = useState<Position>(START_POSITION);

  // Stats
  const [stats, setStats] = useState<TetrisStats>(() => {
    const defaultStats: TetrisStats = {
      gamesPlayed: 0,
      gamesWon: 0,
      currentStreak: 0,
      bestStreak: 0,
      highScore: 0,
      totalLines: 0,
    };
    const loaded = loadStats('tetris-stats');
    return { ...defaultStats, ...loaded } as TetrisStats;
  });

  // Refs for game loop and state access
  const gameStateRef = useRef(gameState);
  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const dropCounterRef = useRef<number>(0);
  const gameCountedRef = useRef(false);

  // Update ref whenever state changes
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Update ghost position when piece changes
  useEffect(() => {
    if (!gameState.isGameOver && !gameState.isPaused) {
      const ghostPos = getGhostPosition(gameState.board, gameState.currentPiece);
      setGhostPosition(ghostPos);
    }
  }, [gameState.currentPiece, gameState.board, gameState.isGameOver, gameState.isPaused]);

  // Game loop with automatic dropping
  useEffect(() => {
    if (!isPaused && !isGameOver && !gameState.isGameOver) {
      const animate = (time: number) => {
        const deltaTime = time - lastTimeRef.current;
        lastTimeRef.current = time;
        dropCounterRef.current += deltaTime;

        const dropInterval = getDropInterval(gameStateRef.current.level);

        if (dropCounterRef.current > dropInterval) {
          dropCounterRef.current = 0;
          const state = gameStateRef.current;
          const result = processMove(state.board, state.currentPiece, 'down');

          if (result.locked) {
            // Piece locked, use the updated board with locked piece
            const stateWithLockedBoard = {
              ...state,
              board: result.newBoard || state.board,
            };

            // Spawn next piece on the updated board
            const newState = spawnNextPiece(stateWithLockedBoard);

            // Update score if lines were cleared
            const updatedState = updateScore(newState, result.linesCleared || 0);

            // Always set game state to update board (even if no lines cleared)
            setGameState(updatedState);

            if (updatedState.isGameOver) {
              setIsGameOver(true);
              if (!gameCountedRef.current) {
                const baseStats = recordGamePlayed(stats);
                // Update high score if needed
                const newStats: TetrisStats = {
                  ...baseStats,
                  highScore: Math.max(stats.highScore || 0, state.score),
                  totalLines: (stats.totalLines || 0) + (result.linesCleared || 0),
                };
                setStats(newStats);
                saveStats('tetris-stats', newStats);
                gameCountedRef.current = true;
              }
            } else {
              // Check if game should be counted as won (reached certain score/level)
              if (!gameCountedRef.current && state.score >= 1000) {
                const baseStats = recordGameWon(stats);
                const newStats: TetrisStats = {
                  ...baseStats,
                  highScore: Math.max(stats.highScore || 0, state.score),
                  totalLines: (stats.totalLines || 0) + (result.linesCleared || 0),
                };
                setStats(newStats);
                saveStats('tetris-stats', newStats);
                gameCountedRef.current = true;
              }
            }
          } else if (result.newPiece) {
            setGameState({ ...state, currentPiece: result.newPiece });
          }
        }

        requestRef.current = requestAnimationFrame(animate);
      };

      requestRef.current = requestAnimationFrame(animate);
      return () => {
        if (requestRef.current) {
          cancelAnimationFrame(requestRef.current);
        }
      };
    }
  }, [isPaused, isGameOver, gameState.isGameOver, stats]);

  // Keyboard input handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showHelp || showStats || isGameOver) {
        if (e.key === 'Escape') {
          setShowHelp(false);
          setShowStats(false);
          if (isGameOver) {
            newGame();
          }
        }
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        setIsPaused(p => !p);
        return;
      }

      if (isPaused) return;

      const state = gameStateRef.current;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          const movedLeft = movePiece(state.board, state.currentPiece, 'left');
          if (movedLeft) {
            setGameState({ ...state, currentPiece: movedLeft });
          }
          break;

        case 'ArrowRight':
          e.preventDefault();
          const movedRight = movePiece(state.board, state.currentPiece, 'right');
          if (movedRight) {
            setGameState({ ...state, currentPiece: movedRight });
          }
          break;

        case 'ArrowDown':
          e.preventDefault();
          const result = processMove(state.board, state.currentPiece, 'down');
          if (result.locked) {
            // Piece locked, use the updated board with locked piece
            const stateWithLockedBoard = {
              ...state,
              board: result.newBoard || state.board,
            };

            // Spawn next piece on the updated board
            const newState = spawnNextPiece(stateWithLockedBoard);
            const updatedState = updateScore(newState, result.linesCleared || 0);

            // Always set game state to update board (even if no lines cleared)
            setGameState(updatedState);

            if (updatedState.isGameOver) {
              setIsGameOver(true);
              if (!gameCountedRef.current) {
                const baseStats = recordGamePlayed(stats);
                const newStats: TetrisStats = {
                  ...baseStats,
                  highScore: Math.max(stats.highScore || 0, state.score),
                  totalLines: (stats.totalLines || 0) + (result.linesCleared || 0),
                };
                setStats(newStats);
                saveStats('tetris-stats', newStats);
                gameCountedRef.current = true;
              }
            }
          } else if (result.newPiece) {
            setGameState({ ...state, currentPiece: result.newPiece });
          }
          break;

        case 'ArrowUp':
          e.preventDefault();
          const rotated = tryRotate(state.board, state.currentPiece, 'clockwise');
          if (rotated) {
            setGameState({ ...state, currentPiece: rotated });
          }
          break;

        case ' ':
          e.preventDefault();
          // Hard drop using game logic
          const dropped = hardDrop(state.board, state.currentPiece);
          const lockedBoard = lockPiece(state.board, dropped);
          const { newBoard, linesCleared } = clearLines(lockedBoard);

          // Spawn next piece with updated board
          let updatedState = spawnNextPiece({
            ...state,
            board: newBoard,
          });

          // Update score if lines were cleared
          updatedState = updateScore(updatedState, linesCleared);

          if (updatedState.isGameOver) {
            setIsGameOver(true);
            if (!gameCountedRef.current) {
              const baseStats = recordGamePlayed(stats);
              const newStats: TetrisStats = {
                ...baseStats,
                highScore: Math.max(stats.highScore || 0, state.score),
                totalLines: (stats.totalLines || 0) + linesCleared,
              };
              setStats(newStats);
              saveStats('tetris-stats', newStats);
              gameCountedRef.current = true;
            }
          } else {
            setGameState(updatedState);
          }
          break;

        case 'F2':
        case 'n':
        case 'N':
          if (e.ctrlKey || e.key === 'F2') {
            e.preventDefault();
            newGame();
          }
          break;

        case 'p':
        case 'P':
          e.preventDefault();
          setIsPaused(p => !p);
          break;

        case 'F1':
        case '?':
          e.preventDefault();
          setShowHelp(true);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showHelp, showStats, isGameOver, isPaused, stats]);

  const newGame = useCallback(() => {
    setGameState(createInitialGame());
    setIsGameOver(false);
    setIsPaused(false);
    setShowHelp(false);
    setShowStats(false);
    gameCountedRef.current = false;
  }, []);

  // Render a single cell
  const renderCell = (row: number, col: number) => {
    const state = gameState;
    const cellColor = state.board[row]?.[col];

    // Check if current piece occupies this cell
    const pieceAtCell = state.currentPiece.shape.some((pr, prIdx) =>
      pr.some((pc, pcIdx) => {
        if (!pc) return false;
        const prAbs = state.currentPiece.position.row + prIdx;
        const pcAbs = state.currentPiece.position.col + pcIdx;
        return prAbs === row && pcAbs === col;
      })
    );

    // Check if ghost piece occupies this cell
    const ghostAtCell = state.currentPiece.shape.some((pr, prIdx) =>
      pr.some((pc, pcIdx) => {
        if (!pc) return false;
        const prAbs = ghostPosition.row + prIdx;
        const pcAbs = ghostPosition.col + pcIdx;
        return prAbs === row && pcAbs === col;
      })
    );

    const isGhost = ghostAtCell && !pieceAtCell && !cellColor;
    const isPiece = pieceAtCell;
    const isLocked = cellColor !== null;

    let className = 'tetris-cell';
    if (isGhost) className += ' tetris-ghost';
    if (isPiece) className += ' tetris-piece';
    if (isLocked) className += ' tetris-locked';

    let style: Record<string, string> = {};
    if (isGhost) {
      style.backgroundColor = state.currentPiece.color;
      style.opacity = '0.3';
    } else if (isPiece) {
      style.backgroundColor = state.currentPiece.color;
    } else if (isLocked) {
      style.backgroundColor = cellColor;
    }

    return <div key={`${row}-${col}`} class={className} style={style} />;
  };

  // Render next piece preview
  const renderNextPiece = () => {
    const piece = gameState.nextPiece;
    const cells = [];

    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const hasBlock = piece.shape.some((pr, prIdx) =>
          pr.some((pc, pcIdx) => {
            if (!pc) return false;
            return prIdx === row && pcIdx === col;
          })
        );

        cells.push(
          <div
            key={`next-${row}-${col}`}
            class={`tetris-next-cell ${hasBlock ? 'tetris-next-piece' : ''}`}
            style={hasBlock ? { backgroundColor: piece.color } : {}}
          />
        );
      }
    }

    return <div class="tetris-next-grid">{cells}</div>;
  };

  return (
    <div class="tetris-container">
      {/* Menu bar */}
      <div class="tetris-menu-bar">
        <div class="tetris-menu-item">
          <button onClick={() => setActiveMenu(activeMenu === 'game' ? null : 'game')}>
            {txt.menu.game}
          </button>
          {activeMenu === 'game' && (
            <div class="tetris-dropdown">
              <div onClick={newGame}>{txt.game.newGame}</div>
              <div onClick={() => setIsPaused(p => !p)}>
                {isPaused ? txt.game.resume : txt.game.pause}
              </div>
              <div onClick={() => setShowStats(true)}>{txt.game.statistics}</div>
            </div>
          )}
        </div>
        <div class="tetris-menu-item">
          <button onClick={() => setActiveMenu(activeMenu === 'help' ? null : 'help')}>
            {txt.menu.help}
          </button>
          {activeMenu === 'help' && (
            <div class="tetris-dropdown">
              <div onClick={() => setShowHelp(true)}>{txt.help.howToPlay}</div>
            </div>
          )}
        </div>
      </div>

      {/* Main game area */}
      <div class="tetris-game-area">
        {/* Game board */}
        <div class="tetris-board">
          {Array.from({ length: BOARD_ROWS }, (_, row) =>
            Array.from({ length: BOARD_COLS }, (_, col) => renderCell(row, col))
          )}
        </div>

        {/* Side panel */}
        <div class="tetris-side-panel">
          {/* Next piece */}
          <div class="tetris-next-section">
            <div class="tetris-section-title">{txt.stats.next}</div>
            {renderNextPiece()}
          </div>

          {/* Score */}
          <div class="tetris-stats-section">
            <div class="tetris-section-title">{txt.stats.score}</div>
            <div class="tetris-stat-value">{gameState.score}</div>
          </div>

          {/* Level */}
          <div class="tetris-stats-section">
            <div class="tetris-section-title">{txt.stats.level}</div>
            <div class="tetris-stat-value">{gameState.level}</div>
          </div>

          {/* Lines */}
          <div class="tetris-stats-section">
            <div class="tetris-section-title">{txt.stats.lines}</div>
            <div class="tetris-stat-value">{gameState.lines}</div>
          </div>
        </div>
      </div>

      {/* Pause overlay */}
      {isPaused && !isGameOver && (
        <div class="tetris-overlay">
          <div class="tetris-overlay-content">
            <h2>{txt.game.paused}</h2>
            <p>{txt.controls.pressKeyToContinue.replace('{key}', 'P')}</p>
          </div>
        </div>
      )}

      {/* Game over overlay */}
      {isGameOver && (
        <div class="tetris-overlay">
          <div class="tetris-overlay-content">
            <h2>{txt.gameOver.title}</h2>
            <p>{txt.gameOver.finalScore}: {gameState.score}</p>
            <button onClick={newGame}>{txt.gameOver.playAgain}</button>
          </div>
        </div>
      )}

      {/* Help dialog */}
      {showHelp && (
        <div class="tetris-dialog">
          <div class="tetris-dialog-content">
            <h2>{txt.help.howToPlay}</h2>
            <p>{txt.help.objective}</p>
            <div class="tetris-controls-list">
              <div>{txt.controls.left}: ←</div>
              <div>{txt.controls.right}: →</div>
              <div>{txt.controls.rotate}: ↑</div>
              <div>{txt.controls.softDrop}: ↓</div>
              <div>{txt.controls.hardDrop}: Space</div>
              <div>{txt.controls.pause}: P</div>
              <div>{txt.controls.newGame}: F2</div>
            </div>
            <button onClick={() => setShowHelp(false)}>{txt.help.close}</button>
          </div>
        </div>
      )}

      {/* Stats dialog */}
      {showStats && (
        <div class="tetris-dialog">
          <div class="tetris-dialog-content">
            <h2>{txt.stats.title}</h2>
            <div class="tetris-stats-list">
              <div>{txt.stats.gamesPlayed}: {stats.gamesPlayed}</div>
              <div>{txt.stats.highScore}: {stats.highScore}</div>
              <div>{txt.stats.totalLines}: {stats.totalLines}</div>
            </div>
            <button onClick={() => setShowStats(false)}>{txt.stats.close}</button>
          </div>
        </div>
      )}
    </div>
  );
}
