import { useState, useCallback, useEffect, useRef } from 'preact/hooks';
import { useLanguage } from '../../context/language-context';
import {
  createInitialGame,
  placePipe,
  startFlow,
  advanceFlow,
  updateFlowTimer,
  startNextLevel,
} from './game-logic';
import type { GameData, CellType } from './types';
import './pipedream.css';

export function PipeDream() {
  const { t } = useLanguage();
  const txt = t.pipedream;

  const [gameData, setGameData] = useState<GameData>(() => createInitialGame());
  const [activeMenu, setActiveMenu] = useState<'game' | 'help' | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(Date.now());
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

  // Game loop for flow animation
  useEffect(() => {
    const gameLoop = () => {
      const now = Date.now();
      const deltaTime = now - lastTimeRef.current;
      lastTimeRef.current = now;

      setGameData((prev: GameData) => {
        // Update flow timer if not flowing
        let updated = updateFlowTimer(prev, deltaTime);

        // Advance flow if time has passed
        if (updated.gameState === 'flowing') {
          const timeSinceLastAdvance = now - updated.lastFlowAdvance;
          if (timeSinceLastAdvance >= updated.flowSpeed) {
            updated = advanceFlow(updated);
          }
        }

        return updated;
      });

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const newGame = useCallback(() => {
    setGameData(createInitialGame(gameData.highScore, 1));
    setActiveMenu(null);
  }, [gameData.highScore]);

  const nextLevel = useCallback(() => {
    setGameData((prev: GameData) => startNextLevel(prev));
    setActiveMenu(null);
  }, []);

  const handleCellClick = useCallback((row: number, col: number) => {
    setGameData((prev: GameData) => {
      const result = placePipe(prev, row, col);
      return result || prev;
    });
  }, []);

  const renderCornerPipeSVG = (cellType: CellType, flowState: string) => {
    const isFlowing = flowState === 'flowing' || flowState === 'filled';
    const strokeWidth = 14;

    const getCornerPath = (): string => {
      switch (cellType) {
        case 'ne':
          return 'M 20 0 Q 20 20 40 20';
        case 'nw':
          return 'M 20 0 Q 20 20 0 20';
        case 'se':
          return 'M 40 20 Q 20 20 20 40';
        case 'sw':
          return 'M 0 20 Q 20 20 20 40';
        default:
          return '';
      }
    };

    const path = getCornerPath();

    return (
      <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="cornerPipeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#808080', stopOpacity: 1 }} />
            <stop offset="25%" style={{ stopColor: '#ffffff', stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: '#c0c0c0', stopOpacity: 1 }} />
            <stop offset="75%" style={{ stopColor: '#808080', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#404040', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        <g>
          {/* Pipe shadow/border */}
          <path
            d={path}
            stroke="#404040"
            strokeWidth={strokeWidth + 2}
            fill="none"
            strokeLinecap="round"
          />
          {/* Main pipe */}
          <path
            d={path}
            stroke="url(#cornerPipeGradient)"
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
          />
          {/* Fluid overlay */}
          {isFlowing && (
            <path
              d={path}
              stroke="#00aaff"
              strokeWidth={strokeWidth - 4}
              fill="none"
              strokeLinecap="round"
              style={{ filter: 'drop-shadow(0 0 2px rgba(0, 150, 255, 0.8))' }}
            />
          )}
        </g>
      </svg>
    );
  };

  const renderQueuePreview = (pipeType: CellType, index: number) => {
    const isCorner = pipeType === 'ne' || pipeType === 'nw' || pipeType === 'se' || pipeType === 'sw';
    const className = isCorner ? '' : `pipedream-cell-${pipeType}`;

    return (
      <div
        key={index}
        class={`pipedream-queue-item ${className}`}
        data-testid={`pipedream-queue-${index}`}
      >
        {isCorner ? renderCornerPipeSVG(pipeType, 'none') : renderStraightPipeCSS(pipeType, 'none')}
      </div>
    );
  };

  const renderStraightPipeCSS = (cellType: CellType, flowState: string) => {
    const isFlowing = flowState === 'flowing' || flowState === 'filled';
    const className = `pipedream-cell-${cellType}`;

    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <div class={className} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />
        {isFlowing && cellType === 'cross' && (
          <>
            <div class="pipedream-fluid" />
            <div class="pipedream-fluid" />
          </>
        )}
        {isFlowing && cellType !== 'cross' && (
          <div class="pipedream-fluid" />
        )}
      </div>
    );
  };

  const renderCell = (cell: any, row: number, col: number) => {
    let className = 'pipedream-cell';

    // Add pipe type class for CSS styling
    if (cell.type !== 'empty' && cell.type !== 'start' && cell.type !== 'end') {
      const isCorner = cell.type === 'ne' || cell.type === 'nw' || cell.type === 'se' || cell.type === 'sw';
      if (!isCorner) {
        className += ` pipedream-cell-${cell.type}`;
      }
    }

    // Add flow state class
    if (cell.flowState === 'spilled') {
      className += ' pipedream-cell-spilled';
    }

    const isCorner = cell.type === 'ne' || cell.type === 'nw' || cell.type === 'se' || cell.type === 'sw';
    const isStraight = cell.type === 'vertical' || cell.type === 'horizontal' || cell.type === 'cross';

    return (
      <div
        key={`${row}-${col}`}
        class={className}
        onClick={() => handleCellClick(row, col)}
        data-testid={`pipedream-cell-${row}-${col}`}
        data-row={row}
        data-col={col}
        data-type={cell.type}
        data-flow-state={cell.flowState}
      >
        {cell.type === 'start' && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '20px', height: '20px', background: '#ffff00', border: '2px solid #000', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>S</div>
        )}
        {cell.type === 'end' && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '20px', height: '20px', background: '#ff0000', border: '2px solid #000', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px', color: '#fff' }}>E</div>
        )}
        {isCorner && renderCornerPipeSVG(cell.type, cell.flowState)}
        {isStraight && (
          <>
            {(cell.flowState === 'flowing' || cell.flowState === 'filled') && cell.type === 'cross' && (
              <>
                <div class="pipedream-fluid" />
                <div class="pipedream-fluid" />
              </>
            )}
            {(cell.flowState === 'flowing' || cell.flowState === 'filled') && cell.type !== 'cross' && (
              <div class="pipedream-fluid" />
            )}
          </>
        )}
      </div>
    );
  };

  const formatTime = (ms: number) => {
    const seconds = Math.ceil(ms / 1000);
    return `${seconds}s`;
  };

  return (
    <div class="pipedream-container" data-testid="pipedream-container">
      <div class="pipedream-menu-bar" ref={menuRef} data-testid="pipedream-menu-bar">
        <div class="pipedream-menu-trigger">
          <span
            class={`pipedream-menu-item ${activeMenu === 'game' ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenu(activeMenu === 'game' ? null : 'game');
            }}
            data-testid="pipedream-menu-game"
          >
            {txt.menu.game}
          </span>
          {activeMenu === 'game' && (
            <div class="pipedream-dropdown" data-testid="pipedream-game-dropdown">
              <button class="pipedream-dropdown-item" onClick={newGame} data-testid="pipedream-new-game">
                <span class="pipedropdown-text">{txt.game.new}</span>
              </button>
            </div>
          )}
        </div>
        <span
          class="pipedream-menu-item"
          data-testid="pipedream-menu-help"
        >
          {txt.menu.help}
        </span>
      </div>

      <div class="pipedream-content" data-testid="pipedream-content">
        <div class="pipedream-controls" data-testid="pipedream-controls">
          <div class="pipedream-stats">
            <div class="pipedream-stat" data-testid="pipedream-score">
              <span class="pipedream-stat-label">{txt.stats.score}:</span>
              <span class="pipedream-stat-value">{gameData.score}</span>
            </div>
            <div class="pipedream-stat" data-testid="pipedream-level">
              <span class="pipedream-stat-label">{txt.stats.level}:</span>
              <span class="pipedream-stat-value">{gameData.level}</span>
            </div>
            <div class="pipedream-stat" data-testid="pipedream-pipes">
              <span class="pipedream-stat-label">{txt.stats.pipes}:</span>
              <span class="pipedream-stat-value">{gameData.pipesPlaced}</span>
            </div>
            {gameData.highScore > 0 && (
              <div class="pipedream-stat" data-testid="pipedream-highscore">
                <span class="pipedream-stat-label">{txt.stats.highScore}:</span>
                <span class="pipedream-stat-value">{gameData.highScore}</span>
              </div>
            )}
          </div>

          <div class="pipedream-timer-bar" data-testid="pipedream-timer-bar">
            <div
              class="pipedream-timer-fill"
              style={{
                width: gameData.gameState === 'flowing' || gameData.gameState === 'won' || gameData.gameState === 'lost'
                  ? '100%'
                  : `${(gameData.flowTimer / gameData.flowDelay) * 100}%`,
              }}
            />
            <span class="pipedream-timer-text">
              {gameData.gameState === 'flowing' ? txt.messages.flowing : formatTime(gameData.flowTimer)}
            </span>
          </div>

          <button
            class="pipedream-new-btn"
            onClick={newGame}
            data-testid="pipedream-new-button"
          >
            {txt.game.new}
          </button>
        </div>

        <div class="pipedream-main">
          <div class="pipedream-queue-section" data-testid="pipedream-queue-section">
            <div class="pipedream-queue-title">{txt.game.next}</div>
            <div class="pipedream-queue" data-testid="pipedream-queue">
              {gameData.queue.map((pipeType, index) => renderQueuePreview(pipeType, index))}
            </div>
          </div>

          <div class="pipedream-grid-container" style={{ position: 'relative' }}>
            <div class="pipedream-grid" data-testid="pipedream-grid">
              {gameData.grid.map((row, rowIndex) =>
                row.map((cell, colIndex) => renderCell(cell, rowIndex, colIndex))
              )}
            </div>

            {gameData.gameState === 'won' && (
              <div class="pipedream-message pipedream-message-win" data-testid="pipedream-win-message">
                {txt.messages.youWin}
                <br />
                {txt.stats.score}: {gameData.score}
                <br />
                <button class="pipedream-new-btn" onClick={nextLevel} style={{ marginTop: '8px' }}>
                  {txt.game.nextLevel} →
                </button>
              </div>
            )}

            {gameData.gameState === 'lost' && (
              <div class="pipedream-message pipedream-message-gameover" data-testid="pipedream-gameover-message">
                {txt.messages.gameOver}
                <br />
                {txt.stats.score}: {gameData.score}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
