import { useState, useCallback, useEffect, useRef } from 'preact/hooks';
import { useLanguage } from '../../context/language-context';
import { useStatus } from '../../context/status-context';
import {
  createInitialGame,
  moveSnake,
  changeDirection,
  formatTime,
  type GameData,
  type Direction,
  type GameState,
  GRID_COLS,
  GRID_ROWS,
} from './game-logic';
import { nibblesTranslations } from './translations';
import './nibbles.css';

const HIGH_SCORE_KEY = 'nibbles_highscore';
const HIGH_SCORES_KEY = 'nibbles_highscores';

interface HighScoreEntry {
  score: number;
  date: string;
}

export function Nibbles() {
  const { t, language } = useLanguage();
  const { setStatusText } = useStatus();
  const txt = nibblesTranslations[language];

  // Game state
  const [gameData, setGameData] = useState<GameData>(() => {
    const highScore = loadHighScore();
    return createInitialGame(highScore);
  });
  const [timer, setTimer] = useState(0);
  const [highScore, setHighScore] = useState(() => loadHighScore());
  const [highScores, setHighScores] = useState<HighScoreEntry[]>(() => loadHighScores());
  const [activeMenu, setActiveMenu] = useState<'game' | 'help' | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showHighScores, setShowHighScores] = useState(false);

  // Refs for intervals and menu
  const gameLoopRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load high score from localStorage
  function loadHighScore(): number {
    try {
      const stored = localStorage.getItem(HIGH_SCORE_KEY);
      return stored ? parseInt(stored, 10) : 0;
    } catch {
      return 0;
    }
  }

  // Load high scores from localStorage
  function loadHighScores(): HighScoreEntry[] {
    try {
      const stored = localStorage.getItem(HIGH_SCORES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  // Save high score to localStorage
  function saveHighScore(score: number): void {
    try {
      localStorage.setItem(HIGH_SCORE_KEY, score.toString());
      setHighScore(score);
    } catch {
      // Ignore storage errors
    }
  }

  // Save high scores to localStorage
  function saveHighScores(scores: HighScoreEntry[]): void {
    try {
      localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(scores));
      setHighScores(scores);
    } catch {
      // Ignore storage errors
    }
  }

  // Add score to high scores list
  function addToHighScores(score: number): void {
    const newEntry: HighScoreEntry = {
      score,
      date: new Date().toLocaleDateString(),
    };

    const updated = [...highScores, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10); // Keep top 10

    saveHighScores(updated);
  }

  // New game
  const newGame = useCallback(() => {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setGameData(createInitialGame(highScore));
    setTimer(0);
    setStatusText('Press any arrow key to start');
  }, [highScore, setStatusText]);

  // Toggle pause
  const togglePause = useCallback(() => {
    setGameData(prev => {
      if (prev.gameState === 'playing') {
        return { ...prev, gameState: 'paused' };
      } else if (prev.gameState === 'paused') {
        return { ...prev, gameState: 'playing' };
      }
      return prev;
    });
  }, []);

  // Handle keyboard input
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Prevent default for arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }

      // N - New game
      if (e.key === 'n' || e.key === 'N') {
        newGame();
        return;
      }

      // P - Pause
      if (e.key === 'p' || e.key === 'P') {
        togglePause();
        return;
      }

      // Escape - Close dialogs
      if (e.key === 'Escape') {
        if (showHelp) setShowHelp(false);
        if (showHighScores) setShowHighScores(false);
        return;
      }

      // Arrow keys - direction control
      const directionMap: Record<string, Direction> = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
      };

      const newDirection = directionMap[e.key];
      if (newDirection) {
        setGameData(prev => {
          // Start game on first arrow key press
          if (prev.gameState === 'idle') {
            const updated = changeDirection(prev, newDirection);
            return { ...updated, gameState: 'playing' };
          }
          // Resume if paused
          if (prev.gameState === 'paused') {
            const updated = changeDirection(prev, newDirection);
            return { ...updated, gameState: 'playing' };
          }
          // Change direction if playing
          if (prev.gameState === 'playing') {
            return changeDirection(prev, newDirection);
          }
          return prev;
        });
      }
    },
    [newGame, togglePause, showHelp, showHighScores]
  );

  // Game loop effect
  useEffect(() => {
    if (gameData.gameState === 'playing') {
      gameLoopRef.current = window.setInterval(() => {
        setGameData(prev => {
          const newData = moveSnake(prev);

          // Check for game over
          if (newData.gameState === 'gameover') {
            setStatusText(`Game Over! Score: ${prev.score}`);
            // Check for high score
            if (prev.score > highScore) {
              saveHighScore(prev.score);
              addToHighScores(prev.score);
            } else {
              addToHighScores(prev.score);
            }
            return newData;
          }

          // Update status with score
          if (prev.score !== newData.score) {
            setStatusText(`Score: ${newData.score} | Level: ${newData.level}`);
          }

          return newData;
        });
      }, gameData.speed);
    } else {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameData.gameState, gameData.speed, gameData.score, gameData.level, highScore, setStatusText]);

  // Timer effect
  useEffect(() => {
    if (gameData.gameState === 'playing') {
      timerRef.current = window.setInterval(() => {
        setTimer(prev => prev + 1);
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

  // Keyboard event listener
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('keydown', handleKeyDown);
      // Make container focusable
      container.tabIndex = 0;
      container.focus();
    }

    return () => {
      if (container) {
        container.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [handleKeyDown]);

  // Click outside to close menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    }

    if (activeMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [activeMenu]);

  // Set speed
  const setSpeed = useCallback((level: number) => {
    const speedMap: Record<number, number> = { 1: 200, 2: 175, 3: 150, 4: 125, 5: 100, 6: 85, 7: 75, 8: 65, 9: 50 };
    setGameData(prev => ({
      ...prev,
      level,
      speed: speedMap[level],
    }));
    setActiveMenu(null);
  }, []);

  // Render grid cells
  const renderGrid = () => {
    const cells = [];
    const snakeSet = new Set(gameData.snake.map(s => `${s.row},${s.col}`));
    const head = gameData.snake[gameData.snake.length - 1];

    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const key = `${row},${col}`;
        const isSnake = snakeSet.has(key);
        const isHead = head.row === row && head.col === col;
        const isFood = gameData.food.row === row && gameData.food.col === col;

        let cellClass = 'nibbles-cell';
        if (isHead) cellClass += ' nibbles-snake-head';
        else if (isSnake) cellClass += ' nibbles-snake';
        else if (isFood) cellClass += ' nibbles-food';

        cells.push(<div key={key} class={cellClass} data-testid={`cell-${row}-${col}`} />);
      }
    }
    return cells;
  };

  return (
    <div ref={containerRef} class="nibbles-container" data-testid="nibbles">
      {/* Menu Bar */}
      <div ref={menuRef} class="nibbles-menu-bar">
        <div class="nibbles-menu-trigger">
          <div
            class={`nibbles-menu-item ${activeMenu === 'game' ? 'active' : ''}`}
            onClick={() => setActiveMenu(activeMenu === 'game' ? null : 'game')}
          >
            {txt.menu.game}
          </div>
          {activeMenu === 'game' && (
            <div class="nibbles-dropdown">
              <button class="nibbles-dropdown-item" onClick={newGame}>
                <span class="nibbles-dropdown-text">
                  {txt.game.new} (N)
                </span>
              </button>
              <button
                class="nibbles-dropdown-item"
                onClick={togglePause}
                disabled={gameData.gameState === 'idle' || gameData.gameState === 'gameover'}
              >
                <span class="nibbles-dropdown-text">
                  {gameData.gameState === 'paused' ? txt.game.resume : txt.game.pause} (P)
                </span>
              </button>
              <div class="nibbles-dropdown-separator" />
              <div class="nibbles-dropdown-item" style={{ cursor: 'default' }}>
                <span class="nibbles-dropdown-text">{txt.game.speed}:</span>
              </div>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(level => (
                <button
                  key={level}
                  class={`nibbles-dropdown-item ${gameData.level === level ? 'checked' : ''}`}
                  onClick={() => setSpeed(level)}
                >
                  <span class="nibbles-dropdown-check">{gameData.level === level ? '✓' : ''}</span>
                  <span class="nibbles-dropdown-text">{level}</span>
                </button>
              ))}
              <div class="nibbles-dropdown-separator" />
              <button class="nibbles-dropdown-item" onClick={() => setShowHighScores(true)}>
                <span class="nibbles-dropdown-text">{txt.game.highScore}</span>
              </button>
            </div>
          )}
        </div>
        <div class="nibbles-menu-trigger">
          <div
            class={`nibbles-menu-item ${activeMenu === 'help' ? 'active' : ''}`}
            onClick={() => setActiveMenu(activeMenu === 'help' ? null : 'help')}
          >
            {txt.menu.help}
          </div>
          {activeMenu === 'help' && (
            <div class="nibbles-dropdown">
              <button class="nibbles-dropdown-item" onClick={() => setShowHelp(true)}>
                <span class="nibbles-dropdown-text">{txt.instructions.title}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Game Area */}
      <div class="nibbles-game-area">
        {/* Controls Panel */}
        <div class="nibbles-controls">
          <div class="nibbles-stats">
            <div class="nibbles-stat">
              <span class="nibbles-stat-label">{txt.stats.score}:</span>
              <span class="nibbles-stat-value" data-testid="score">{gameData.score}</span>
            </div>
            <div class="nibbles-stat">
              <span class="nibbles-stat-label">{txt.stats.level}:</span>
              <span class="nibbles-stat-value" data-testid="level">{gameData.level}</span>
            </div>
            <div class="nibbles-stat">
              <span class="nibbles-stat-label">{txt.stats.highScore}:</span>
              <span class="nibbles-stat-value" data-testid="high-score">{highScore}</span>
            </div>
          </div>
          <div class="nibbles-timer" data-testid="timer">{formatTime(timer)}</div>
        </div>

        {/* Game Grid */}
        <div class="nibbles-grid-container">
          <div class="nibbles-grid" data-testid="grid">
            {renderGrid()}
          </div>
        </div>

        {/* Message Overlays */}
        {gameData.gameState === 'idle' && (
          <div class="nibbles-message-overlay nibbles-message-idle" data-testid="message-idle">
            <div class="nibbles-message-title">{txt.messages.pressToStart}</div>
          </div>
        )}

        {gameData.gameState === 'paused' && (
          <div class="nibbles-message-overlay nibbles-message-paused" data-testid="message-paused">
            <div class="nibbles-message-title">{txt.messages.paused}</div>
            <div class="nibbles-message-text">Press P or any arrow key to continue</div>
          </div>
        )}

        {gameData.gameState === 'gameover' && (
          <div class="nibbles-message-overlay nibbles-message-gameover" data-testid="message-gameover">
            <div class="nibbles-message-title">{txt.messages.gameover}</div>
            <div class="nibbles-message-text">
              {txt.stats.score}: {gameData.score} | {txt.stats.level}: {gameData.level}
            </div>
            <div class="nibbles-message-text" style={{ marginTop: '8px' }}>
              Press N for new game
            </div>
          </div>
        )}
      </div>

      {/* Help Dialog */}
      {showHelp && (
        <div class="nibbles-dialog" data-testid="help-dialog">
          <div class="nibbles-dialog-header">
            <span>{txt.instructions.title}</span>
            <button class="nibbles-dialog-close" onClick={() => setShowHelp(false)}>
              ×
            </button>
          </div>
          <div class="nibbles-dialog-content">
            <div class="nibbles-dialog-title">{txt.instructions.objective}</div>
            <ul class="nibbles-dialog-rules">
              {txt.instructions.rules.map((rule, index) => (
                <li key={index}>{rule}</li>
              ))}
            </ul>
          </div>
          <div class="nibbles-dialog-footer">
            <button class="nibbles-button" onClick={() => setShowHelp(false)}>
              OK
            </button>
          </div>
        </div>
      )}

      {/* High Scores Dialog */}
      {showHighScores && (
        <div class="nibbles-dialog" data-testid="highscores-dialog">
          <div class="nibbles-dialog-header">
            <span>{txt.game.highScore}</span>
            <button class="nibbles-dialog-close" onClick={() => setShowHighScores(false)}>
              ×
            </button>
          </div>
          <div class="nibbles-dialog-content">
            {highScores.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>No scores yet</div>
            ) : (
              <ul class="nibbles-highscore-list">
                {highScores.map((entry, index) => (
                  <li key={index} class="nibbles-highscore-item">
                    <span class="nibbles-highscore-rank">#{index + 1}</span>
                    <span class="nibbles-highscore-score">{entry.score}</span>
                    <span class="nibbles-highscore-date">{entry.date}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div class="nibbles-dialog-footer">
            <button class="nibbles-button" onClick={() => setShowHighScores(false)}>
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
