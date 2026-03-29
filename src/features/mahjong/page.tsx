/**
 * Mahjong Solitaire Component
 * Main game UI with tile rendering, selection, and game state management
 */

import { useState, useCallback, useEffect, useRef } from 'preact/hooks';
import { useLanguage } from '../../context/language-context';
import {
  createInitialGame,
  selectTile,
  startGame,
  togglePause,
  resetGame,
  findHint,
  shuffleTiles,
  undoMove,
  hasAvailableMoves,
  incrementTimer,
} from './game-logic';
import type { GameState, Tile } from './types';
import { TILE_WIDTH, TILE_HEIGHT, getPixelPosition, getZIndex } from './constants';
import { mahjongTranslations } from './translations';
import './mahjong.css';

export function Mahjong() {
  const { t, language } = useLanguage();
  const txt = t.mahjong;

  // Game state
  const [gameState, setGameState] = useState<GameState>(() => createInitialGame());
  const [showHint, setShowHint] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [activeMenu, setActiveMenu] = useState<'game' | 'help' | null>(null);
  const [hintTiles, setHintTiles] = useState<{ tile1: Tile | null; tile2: Tile | null }>({
    tile1: null,
    tile2: null,
  });

  // Refs
  const menuRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);

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

  // Timer effect
  useEffect(() => {
    if (gameState.isPlaying && !gameState.isPaused && !gameState.isWon) {
      timerRef.current = window.setInterval(() => {
        setGameState(prev => incrementTimer(prev));
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
  }, [gameState.isPlaying, gameState.isPaused, gameState.isWon]);

  // Check for no moves (only after game has started properly)
  useEffect(() => {
    // Don't check if no moves available right at start or if no tiles have been matched yet
    if (
      gameState.isPlaying &&
      !gameState.isPaused &&
      !gameState.isWon &&
      gameState.moves > 0 && // Only check after at least one move has been made
      !hasAvailableMoves(gameState.tiles)
    ) {
      setGameState(prev => ({ ...prev, noMovesAvailable: true }));
    } else if (gameState.moves > 0) {
      // Reset no moves flag if moves are now available
      setGameState(prev => ({ ...prev, noMovesAvailable: false }));
    }
  }, [gameState.tiles, gameState.isPlaying, gameState.isPaused, gameState.isWon, gameState.moves]);

  // Keyboard handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // N - New game
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        handleNewGame();
        return;
      }

      // P - Pause
      if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        handlePause();
        return;
      }

      // H - Hint
      if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        handleHint();
        return;
      }

      // U - Undo
      if (e.key === 'u' || e.key === 'U') {
        e.preventDefault();
        handleUndo();
        return;
      }

      // S - Shuffle
      if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        handleShuffle();
        return;
      }

      // Escape - Close dialogs
      if (e.key === 'Escape') {
        setShowInstructions(false);
        setShowHint(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  // New game
  const handleNewGame = useCallback(() => {
    setGameState(createInitialGame());
    setShowHint(false);
    setActiveMenu(null);
  }, []);

  // Pause
  const handlePause = useCallback(() => {
    if (gameState.isPlaying && !gameState.isWon) {
      setGameState(prev => togglePause(prev));
    }
  }, [gameState.isPlaying, gameState.isWon]);

  // Hint
  const handleHint = useCallback(() => {
    if (!gameState.isPlaying || gameState.isPaused || gameState.isWon) return;

    const hint = findHint(gameState.tiles);
    setHintTiles(hint);
    setShowHint(true);

    // Clear hint after 3 seconds
    setTimeout(() => setShowHint(false), 3000);
  }, [gameState.isPlaying, gameState.isPaused, gameState.isWon, gameState.tiles]);

  // Shuffle
  const handleShuffle = useCallback(() => {
    if (!gameState.isPlaying || gameState.isPaused || gameState.isWon) return;

    setGameState(prev => shuffleTiles(prev));
    setShowHint(false);
    setActiveMenu(null);
  }, [gameState.isPlaying, gameState.isPaused, gameState.isWon]);

  // Undo
  const handleUndo = useCallback(() => {
    if (!gameState.isPlaying || gameState.isPaused) return;

    const newState = undoMove(gameState);
    if (newState) {
      setGameState(newState);
    }
  }, [gameState.isPlaying, gameState.isPaused, gameState]);

  // Start game
  const handleStart = useCallback(() => {
    setGameState(prev => startGame(prev));
  }, []);

  // Handle tile click
  const handleTileClick = useCallback(
    (tileId: string) => {
      // Only prevent clicks if game is paused or won
      if (gameState.isPaused || gameState.isWon) return;

      setShowHint(false);

      // Start game on first click if not already playing
      if (!gameState.isPlaying) {
        setGameState(prev => startGame(prev));
      }

      // Handle tile selection
      const newState = selectTile(gameState, tileId);
      setGameState(newState);
    },
    [gameState.isPlaying, gameState.isPaused, gameState.isWon, gameState]
  );

  // Render a single tile
  const renderTile = (tile: Tile) => {
    if (tile.isMatched) return null;

    const pos = getPixelPosition(tile.position);
    const zIndex = getZIndex(tile.position.layer);
    const isSelected = gameState.selectedTile?.id === tile.id;
    const isHinted =
      showHint && (hintTiles.tile1?.id === tile.id || hintTiles.tile2?.id === tile.id);

    const tileClass = `mahjong-tile ${tile.isFree ? 'free' : 'blocked'} ${
      isSelected ? 'selected' : ''
    } ${isHinted ? 'hint' : ''}`;

    // Get tile symbol/color
    const tileStyle = getTileStyle(tile);

    return (
      <div
        key={tile.id}
        class={tileClass}
        style={{
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          zIndex: zIndex.toString(),
          ...tileStyle,
        }}
        onClick={() => handleTileClick(tile.id)}
        data-testid={`tile-${tile.id}`}
        data-free={tile.isFree}
        data-suit={tile.suit}
        data-value={tile.value.toString()}
      >
        <div class="mahjong-tile-face">
          {getTileContent(tile)}
        </div>
        <div class="mahjong-tile-top" />
        <div class="mahjong-tile-right" />
      </div>
    );
  };

  // Get tile color/style
  const getTileStyle = (tile: Tile): Record<string, string> => {
    const colors: Record<string, string> = {
      dot: '#e74c3c',
      bamboo: '#27ae60',
      character: '#3498db',
      wind: '#9b59b6',
      dragon: '#f39c12',
      flower: '#e91e63',
      season: '#00bcd4',
    };

    return {
      '--tile-color': colors[tile.suit] || '#333',
    };
  };

  // Get tile content (symbol/text)
  const getTileContent = (tile: Tile): string => {
    switch (tile.suit) {
      case 'dot':
        return '●'.repeat(tile.value as number);
      case 'bamboo':
        return '🎋'.repeat(tile.value as number);
      case 'character':
        return (tile.value as number).toString();
      case 'wind':
        const windSymbols: Record<string, string> = {
          east: '東',
          south: '南',
          west: '西',
          north: '北',
        };
        return windSymbols[tile.value as string];
      case 'dragon':
        const dragonSymbols: Record<string, string> = {
          red: '中',
          green: '發',
          white: '白',
        };
        return dragonSymbols[tile.value as string];
      case 'flower':
        return '🌸';
      case 'season':
        return '🍁';
      default:
        return '?';
    }
  };

  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div class="mahjong-container" data-testid="mahjong-container">
      {/* Menu Bar */}
      <div class="mahjong-menu-bar" ref={menuRef} data-testid="mahjong-menu-bar">
        <div class="mahjong-menu-trigger">
          <span
            class={`mahjong-menu-item ${activeMenu === 'game' ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenu(activeMenu === 'game' ? null : 'game');
            }}
            data-testid="mahjong-menu-game"
          >
            {txt.menu.game}
          </span>
          {activeMenu === 'game' && (
            <div class="mahjong-dropdown" data-testid="mahjong-game-dropdown">
              <button class="mahjong-dropdown-item" onClick={handleNewGame} data-testid="mahjong-new-game">
                <span class="mahjong-dropdown-text">{txt.game.new} (N)</span>
              </button>
              <button
                class="mahjong-dropdown-item"
                onClick={handleUndo}
                disabled={gameState.history.length === 0}
                data-testid="mahjong-undo"
              >
                <span class="mahjong-dropdown-text">{txt.game.undo} (U)</span>
              </button>
              <button
                class="mahjong-dropdown-item"
                onClick={handleShuffle}
                disabled={!gameState.noMovesAvailable}
                data-testid="mahjong-shuffle"
              >
                <span class="mahjong-dropdown-text">{txt.game.shuffle} (S)</span>
              </button>
              <div class="mahjong-dropdown-separator" />
              <button
                class="mahjong-dropdown-item"
                onClick={handleHint}
                disabled={!gameState.isPlaying || gameState.isPaused || gameState.isWon}
                data-testid="mahjong-hint"
              >
                <span class="mahjong-dropdown-text">{txt.game.hint} (H)</span>
              </button>
              <button
                class="mahjong-dropdown-item"
                onClick={handlePause}
                disabled={!gameState.isPlaying || gameState.isWon}
                data-testid="mahjong-pause"
              >
                <span class="mahjong-dropdown-text">
                  {gameState.isPaused ? txt.game.resume : txt.game.pause} (P)
                </span>
              </button>
            </div>
          )}
        </div>
        <span
          class="mahjong-menu-item"
          onClick={() => setShowInstructions(!showInstructions)}
          data-testid="mahjong-menu-help"
        >
          {txt.menu.help}
        </span>
      </div>

      {/* Game Area */}
      <div class="mahjong-game-area" data-testid="mahjong-game-area">
        {/* Controls Panel */}
        <div class="mahjong-controls" data-testid="mahjong-controls">
          <div class="mahjong-stats">
            <div class="mahjong-stat" data-testid="mahjong-moves">
              <span class="mahjong-stat-label">{txt.stats.moves}:</span>
              <span class="mahjong-stat-value">{gameState.moves}</span>
            </div>
            <div class="mahjong-stat" data-testid="mahjong-timer">
              <span class="mahjong-stat-label">{txt.stats.time}:</span>
              <span class="mahjong-stat-value">{formatTime(gameState.timer)}</span>
            </div>
            <div class="mahjong-stat" data-testid="mahjong-remaining">
              <span class="mahjong-stat-label">{txt.stats.remaining}:</span>
              <span class="mahjong-stat-value">{gameState.tiles.filter(t => !t.isMatched).length}</span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        {showInstructions && (
          <div class="mahjong-instructions" data-testid="mahjong-instructions">
            <h3>{txt.instructions.title}</h3>
            <p>{txt.instructions.objective}</p>
            <p>
              <strong>{txt.instructions.controls}:</strong>
            </p>
            <ul>
              {txt.instructions.rules.map((rule: string, i: number) => (
                <li key={i}>{rule}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Start Message */}
        {gameState.tiles.filter(t => !t.isMatched).length === 144 && !gameState.isPlaying && (
          <div class="mahjong-message-overlay" onClick={handleStart} data-testid="mahjong-start-message">
            <div class="mahjong-message-title">{txt.messages.clickToStart}</div>
          </div>
        )}

        {/* Pause Overlay */}
        {gameState.isPaused && (
          <div class="mahjong-message-overlay" data-testid="mahjong-pause-message">
            <div class="mahjong-message-title">{txt.messages.paused}</div>
            <div class="mahjong-message-text">{txt.messages.pressToContinue}</div>
          </div>
        )}

        {/* Win Overlay */}
        {gameState.isWon && (
          <div class="mahjong-message-overlay" data-testid="mahjong-win-message">
            <div class="mahjong-message-title">{txt.messages.youWon}</div>
            <div class="mahjong-message-text">
              {txt.stats.moves}: {gameState.moves}
            </div>
            <div class="mahjong-message-text">
              {txt.stats.time}: {formatTime(gameState.timer)}
            </div>
            <button class="mahjong-button" onClick={handleNewGame}>
              {txt.game.new}
            </button>
          </div>
        )}

        {/* No Moves Overlay */}
        {gameState.noMovesAvailable && !gameState.isWon && (
          <div class="mahjong-message-overlay" data-testid="mahjong-nomoves-message">
            <div class="mahjong-message-title">{txt.messages.noMoves}</div>
            <div class="mahjong-message-text">
              <button class="mahjong-button" onClick={handleShuffle}>
                {txt.game.shuffle} (S)
              </button>
            </div>
          </div>
        )}

        {/* Tile Board */}
        <div
          class="mahjong-board"
          style={{
            width: `${12 * (TILE_WIDTH + 4)}px`,
            height: `${10 * (TILE_HEIGHT + 4)}px`,
          }}
          data-testid="mahjong-board"
        >
          {gameState.tiles.map(tile => renderTile(tile))}
        </div>
      </div>
    </div>
  );
}
