import { useState, useCallback, useEffect, useRef } from 'preact/hooks';
import { useLanguage } from '../../context/language-context';
import {
  createInitialGame,
  startNextLevel,
  updateBalls,
  startWallBuild,
  updateWallBuild,
  toggleBuildDirection,
  formatTime,
  GRID_COLS,
  GRID_ROWS,
} from './game-logic';
import type { GameData, GameState } from './types';
import './jezzball.css';

export function Jezzball() {
  const { t } = useLanguage();
  const txt = t.jezzball;

  const [gameData, setGameData] = useState<GameData>(() => createInitialGame());
  const [timer, setTimer] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);
  const [activeMenu, setActiveMenu] = useState<'game' | 'help' | null>(null);
  const timerRef = useRef<number | null>(null);
  const ballIntervalRef = useRef<number | null>(null);
  const buildIntervalRef = useRef<number | null>(null);
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
    if (gameData.gameState === 'playing' || gameData.gameState === 'building') {
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
  }, [gameData.gameState]);

  // Ball movement loop
  useEffect(() => {
    if (gameData.gameState !== 'playing' && gameData.gameState !== 'building') {
      if (ballIntervalRef.current) {
        clearInterval(ballIntervalRef.current);
        ballIntervalRef.current = null;
      }
      return;
    }

    ballIntervalRef.current = setInterval(() => {
      setGameData((prev: GameData) => updateBalls(prev));
    }, 50);

    return () => {
      if (ballIntervalRef.current) {
        clearInterval(ballIntervalRef.current);
      }
    };
  }, [gameData.gameState]);

  // Wall building loop
  useEffect(() => {
    if (gameData.gameState !== 'building') {
      if (buildIntervalRef.current) {
        clearInterval(buildIntervalRef.current);
        buildIntervalRef.current = null;
      }
      return;
    }

    buildIntervalRef.current = setInterval(() => {
      setGameData((prev: GameData) => updateWallBuild(prev));
    }, 50);

    return () => {
      if (buildIntervalRef.current) {
        clearInterval(buildIntervalRef.current);
      }
    };
  }, [gameData.gameState]);

  // Keyboard handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' && gameData.gameState !== 'won' && gameData.gameState !== 'lost') {
        e.preventDefault();
        setGameData((prev: GameData) => toggleBuildDirection(prev));
      }

      if (e.key === 'Enter' && gameData.gameState === 'idle') {
        e.preventDefault();
        setGameData(prev => ({ ...prev, gameState: 'playing' as GameState }));
      }

      if ((e.key === 'n' || e.key === 'N') && gameData.gameState !== 'building') {
        e.preventDefault();
        newGame();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameData.gameState]);

  const newGame = useCallback(() => {
    setGameData(createInitialGame(gameData.highScore));
    setTimer(0);
    setActiveMenu(null);
  }, [gameData.highScore]);

  const nextLevel = useCallback(() => {
    setGameData(prev => startNextLevel(prev));
    setActiveMenu(null);
  }, []);

  const handleGridClick = useCallback((e: MouseEvent) => {
    if (gameData.gameState === 'won' || gameData.gameState === 'lost') {
      return;
    }

    if (gameData.gameState === 'idle') {
      setGameData(prev => ({ ...prev, gameState: 'playing' as GameState }));
      return;
    }

    const target = e.target as HTMLElement;
    const cell = target.closest('.jezzball-cell') as HTMLElement;
    if (!cell) return;

    const row = parseInt(cell.dataset.row || '0');
    const col = parseInt(cell.dataset.col || '0');

    setGameData((prev: GameData) => startWallBuild(prev, row, col));
  }, [gameData.gameState]);

  const handleToggleDirection = useCallback(() => {
    setGameData(prev => toggleBuildDirection(prev));
  }, []);

  const renderGrid = () => {
    const cells = [];

    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const cell = gameData.grid[row][col];
        let className = 'jezzball-cell';

        if (cell === 'wall') className += ' jezzball-cell-wall';
        if (cell === 'building-h') className += ' jezzball-cell-building-h';
        if (cell === 'building-v') className += ' jezzball-cell-building-v';
        if (cell === 'trapped') className += ' jezzball-cell-trapped';

        cells.push(
          <div
            class={className}
            data-row={row}
            data-col={col}
            data-testid={`jezzball-cell-${row}-${col}`}
          />
        );
      }
    }

    return cells;
  };

  const renderBalls = () => {
    return gameData.balls.map((ball) => {
      const left = (ball.x / GRID_COLS) * 100;
      const top = (ball.y / GRID_ROWS) * 100;

      return (
        <div
          class="jezzball-ball"
          style={{
            left: `${left}%`,
            top: `${top}%`,
            backgroundColor: ball.color,
          }}
          data-testid={`jezzball-ball-${ball.id}`}
          data-x={ball.x}
          data-y={ball.y}
        />
      );
    });
  };

  const renderBuildingWall = () => {
    if (!gameData.buildStart || gameData.gameState !== 'building') return null;

    const { row, col } = gameData.buildStart;
    const direction = gameData.buildDirection;
    const progress = gameData.buildProgress;

    if (direction === 'horizontal') {
      const width = (progress / 100) * 100;
      const left = (col / GRID_COLS) * 100;

      return (
        <div
          class="jezzball-building-wall jezzball-building-wall-h"
          style={{
            top: `${(row / GRID_ROWS) * 100}%`,
            left: `${left}%`,
            width: `${width}%`,
            height: `${100 / GRID_ROWS}%`,
          }}
        />
      );
    } else {
      const height = (progress / 100) * 100;
      const top = (row / GRID_ROWS) * 100;

      return (
        <div
          class="jezzball-building-wall jezzball-building-wall-v"
          style={{
            top: `${top}%`,
            left: `${(col / GRID_COLS) * 100}%`,
            width: `${100 / GRID_COLS}%`,
            height: `${height}%`,
          }}
        />
      );
    }
  };

  return (
    <div class="jezzball-container" data-testid="jezzball-container">
      <div class="jezzball-menu-bar" ref={menuRef} data-testid="jezzball-menu-bar">
        <div class="jezzball-menu-trigger">
          <span
            class={`jezzball-menu-item ${activeMenu === 'game' ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenu(activeMenu === 'game' ? null : 'game');
            }}
            data-testid="jezzball-menu-game"
          >
            {txt.menu.game}
          </span>
          {activeMenu === 'game' && (
            <div class="jezzball-dropdown" data-testid="jezzball-game-dropdown">
              <button class="jezzball-dropdown-item" onClick={newGame} data-testid="jezzball-new-game">
                <span class="jezzball-dropdown-text">{txt.game.new}</span>
              </button>
            </div>
          )}
        </div>
        <span
          class="jezzball-menu-item"
          onClick={() => setShowInstructions(!showInstructions)}
          data-testid="jezzball-menu-help"
        >
          {txt.menu.help}
        </span>
      </div>

      <div class="jezzball-content" data-testid="jezzball-content">
        <div class="jezzball-controls" data-testid="jezzball-controls">
          <div class="jezzball-stats">
            <div class="jezzball-stat" data-testid="jezzball-lives">
              <span class="jezzball-stat-label">{txt.game.lives}:</span>
              <span class="jezzball-stat-value">
                {'❤️'.repeat(gameData.lives)}
              </span>
            </div>
            <div class="jezzball-stat" data-testid="jezzball-level">
              <span class="jezzball-stat-label">{txt.game.level}:</span>
              <span class="jezzball-stat-value">{gameData.level}</span>
            </div>
            <div class="jezzball-stat" data-testid="jezzball-cleared">
              <span class="jezzball-stat-label">{txt.game.cleared}:</span>
              <span class="jezzball-stat-value">{gameData.percentageCleared}%</span>
            </div>
            <div class="jezzball-stat" data-testid="jezzball-timer">
              <span class="jezzball-stat-label">{txt.stats.time}:</span>
              <span class="jezzball-stat-value">{formatTime(timer)}</span>
            </div>
            {gameData.highScore > 0 && (
              <div class="jezzball-stat" data-testid="jezzball-highscore">
                <span class="jezzball-stat-label">{txt.game.highScore}:</span>
                <span class="jezzball-stat-value">{gameData.highScore}</span>
              </div>
            )}
          </div>

          <button
            class="jezzball-direction-btn"
            onClick={handleToggleDirection}
            data-testid="jezzball-direction-btn"
            title={txt.messages.pressSpace}
          >
            {txt.game.direction}: {gameData.buildDirection === 'horizontal' ? txt.game.horizontal : txt.game.vertical}
          </button>

          <button
            class="jezzball-new-btn"
            onClick={newGame}
            data-testid="jezzball-new-button"
          >
            {txt.game.new}
          </button>
        </div>

        {showInstructions && (
          <div class="jezzball-instructions" data-testid="jezzball-instructions">
            <h3>{txt.instructions.title}</h3>
            <p>{txt.instructions.objective}</p>
            <ul>
              {txt.instructions.rules.map((rule: string, i: number) => (
                <li key={i}>{rule}</li>
              ))}
            </ul>
          </div>
        )}

        {gameData.gameState === 'idle' && (
          <div class="jezzball-message jezzball-message-start" data-testid="jezzball-start-message">
            {txt.messages.clickToStart}
          </div>
        )}

        {gameData.gameState === 'lost' && (
          <div class="jezzball-message jezzball-message-gameover" data-testid="jezzball-gameover-message">
            {txt.messages.gameOver}
            <br />
            {txt.game.level}: {gameData.level} | {txt.game.cleared}: {gameData.percentageCleared}%
          </div>
        )}

        {gameData.gameState === 'won' && (
          <div class="jezzball-message jezzball-message-win" data-testid="jezzball-win-message">
            {txt.messages.youWin}
            <br />
            <button class="jezzball-next-level-btn" onClick={nextLevel} data-testid="jezzball-next-level">
              {txt.game.level} {gameData.level + 1} →
            </button>
          </div>
        )}

        <div
          class="jezzball-grid"
          onClick={handleGridClick}
          data-testid="jezzball-grid"
        >
          {renderGrid()}
          {renderBalls()}
          {renderBuildingWall()}
        </div>
      </div>
    </div>
  );
}
