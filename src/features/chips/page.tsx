import { useState, useCallback, useEffect, useRef } from 'preact/hooks';
import { useLanguage } from '../../context/language-context';
import { useStatus } from '../../context/status-context';
import {
  createInitialGame,
  tryMove,
  handleIceSlide,
  countChips,
  getLevel,
  LEVELS,
} from './game-logic';
import { moveMonsters } from './monster-ai';
import { playSound, initAudio, toggleSound, isSoundEnabled, preloadSounds } from './sounds';
import { loadHighScores, updateHighScore, getLevelHighScore } from './statistics';
import { saveGame, loadSavedGame, hasSavedGame as checkHasSavedGame, autoSaveGame } from './save-game';
import { generatePassword, validatePassword } from './passwords';
import { LevelEditor } from './editor';
import type { GameData, Direction, HighScores, Level } from './types';
import './chips.css';

export function Chip() {
  const { t } = useLanguage();
  const { setStatusText } = useStatus();
  const txt = t.chips;

  const [gameData, setGameData] = useState<GameData>(() =>
    createInitialGame(getLevel(1))
  );
  const [timer, setTimer] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showHighScores, setShowHighScores] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [activeMenu, setActiveMenu] = useState<'game' | 'level' | null>(null);
  const [highScores, setHighScores] = useState<HighScores>({});
  const [hasSavedGame, setHasSavedGame] = useState(false);
  const [newRecordInfo, setNewRecordInfo] = useState<{ newRecord: boolean; newTimeRecord: boolean; newMovesRecord: boolean } | null>(null);
  const timerRef = useRef<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const audioInitialized = useRef(false);

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

  // Initialize audio on first user interaction
  useEffect(() => {
    const handleUserInteraction = () => {
      if (!audioInitialized.current) {
        initAudio();
        preloadSounds();
        audioInitialized.current = true;
      }
    };

    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, []);

  // Load high scores and saved game on mount
  useEffect(() => {
    setHighScores(loadHighScores());
    setHasSavedGame(checkHasSavedGame());
  }, []);

  // Timer logic
  useEffect(() => {
    if (gameData.gameState === 'playing') {
      timerRef.current = window.setInterval(() => {
        setTimer((t) => t + 1);
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

  // Update status bar with game info
  useEffect(() => {
    if (gameData.gameState === 'playing') {
      setStatusText(
        `${txt.level}: ${gameData.currentLevel} | ${txt.chips}: ${gameData.chipsCollected}/${gameData.chipsRequired} | ${txt.time}: ${formatTime(timer)} | ${txt.moves}: ${gameData.moveCount}`
      );
    } else if (gameData.gameState === 'won') {
      setStatusText(txt.levelComplete);
    } else if (gameData.gameState === 'lost') {
      setStatusText(`${txt.gameOver}: ${gameData.deathReason || ''}`);
    } else {
      setStatusText(txt.clickToStart);
    }
  }, [gameData, timer, txt, setStatusText]);

  // Format time as MM:SS
  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // Get monster sprite
  function getMonsterSprite(type: string): string {
    switch (type) {
      case 'monster_bug': return '🐛';
      case 'monster_fireball': return '🔥';
      case 'monster_ball': return '⚽';
      case 'monster_ghost': return '👻';
      case 'monster_tank': return '🛡️';
      default: return '👾';
    }
  }

  // Start game
  const startGame = useCallback(() => {
    setGameData((prev: GameData) => ({ ...prev, gameState: 'playing' as const }));
  }, []);

  // New game
  const newGame = useCallback(() => {
    const level = getLevel(gameData.currentLevel);
    setGameData(createInitialGame(level));
    setTimer(0);
    setActiveMenu(null);
  }, [gameData.currentLevel]);

  // Load specific level
  const loadLevel = useCallback((levelNum: number) => {
    const level = getLevel(levelNum);
    setGameData(createInitialGame(level));
    setTimer(0);
    setActiveMenu(null);
  }, []);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showInstructions) return;

      // Start game on Enter if idle
      if (e.key === 'Enter' && gameData.gameState === 'idle') {
        e.preventDefault();
        startGame();
        return;
      }

      // Movement controls
      if (gameData.gameState === 'playing') {
        let direction: Direction | null = null;
        if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') direction = 'up';
        if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') direction = 'down';
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') direction = 'left';
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') direction = 'right';

        if (direction) {
          e.preventDefault();
          handleMove(direction);
        }

        // New game with N
        if ((e.key === 'n' || e.key === 'N') && gameData.gameState === 'playing') {
          e.preventDefault();
          newGame();
        }
      }

      // Restart on R if won/lost
      if ((e.key === 'r' || e.key === 'R') && (gameData.gameState === 'won' || gameData.gameState === 'lost')) {
        e.preventDefault();
        newGame();
      }

      // Help with F1
      if (e.key === 'F1') {
        e.preventDefault();
        setShowInstructions(!showInstructions);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameData, showInstructions, startGame, newGame]);

  // Handle player movement
  const handleMove = useCallback((direction: Direction) => {
    setGameData((prev: GameData) => {
      // First, try to move one step
      const moveResult = tryMove(prev.grid, prev.playerPosition, direction, prev.inventory);

      if (moveResult.died) {
        playSound('death');
        return {
          ...prev,
          gameState: 'lost' as const,
          deathReason: moveResult.deathReason || 'unknown',
          playerPosition: moveResult.newPosition,
        };
      }

      if (moveResult.newPosition.x === prev.playerPosition.x &&
          moveResult.newPosition.y === prev.playerPosition.y) {
        // Blocked by wall
        return prev;
      }

      let newGrid = moveResult.updatedGrid;
      let newPos = moveResult.newPosition;
      let newInventory = { ...prev.inventory };
      let newChipsCollected = prev.chipsCollected + (moveResult.chipsCollected ? 1 : 0);

      // Collect key
      if (moveResult.keyCollected) {
        newInventory.keys = [...newInventory.keys, moveResult.keyCollected!];
        playSound('keyPickup');
      }

      // Collect boot
      if (moveResult.bootCollected) {
        newInventory.boots = [...newInventory.boots, moveResult.bootCollected!];
        playSound('bootPickup');
      }

      // Collect chip
      if (moveResult.chipsCollected) {
        playSound('collect');
      }

      // Open door
      if (moveResult.doorOpened) {
        playSound('doorOpen');
      }

      // Check for ice sliding
      if (moveResult.slippedOnIce) {
        playSound('slide');
        const slideResult = handleIceSlide(newGrid, newPos, direction, newInventory);
        newGrid = slideResult.finalGrid;
        newPos = slideResult.finalPos;

        if (slideResult.died) {
          playSound('death');
          return {
            ...prev,
            gameState: 'lost' as const,
            deathReason: slideResult.deathReason || 'unknown',
            playerPosition: newPos,
          };
        }
      }

      // Check for exit
      if (moveResult.exited) {
        if (newChipsCollected >= prev.chipsRequired) {
          // Level complete - update high scores
          const scoreResult = updateHighScore(highScores, prev.currentLevel, timer, prev.moveCount + 1);
          setHighScores(scoreResult.updatedScores);
          setNewRecordInfo(scoreResult);
          playSound('levelComplete');

          return {
            ...prev,
            gameState: 'won' as const,
            playerPosition: newPos,
            grid: newGrid,
            chipsCollected: newChipsCollected,
            moveCount: prev.moveCount + 1,
            levelCompleted: true,
          };
        } else {
          // Need more chips
          return prev;
        }
      }

      // Move monsters
      let updatedMonsters = prev.monsters || [];
      const turnNumber = (prev.turnNumber || 0) + 1;

      if (updatedMonsters.length > 0) {
        const monsterResult = moveMonsters(updatedMonsters, newPos, newGrid, turnNumber);
        updatedMonsters = monsterResult.updatedMonsters;

        if (monsterResult.playerDied) {
          playSound('death');
          return {
            ...prev,
            gameState: 'lost' as const,
            deathReason: 'monster',
            playerPosition: newPos,
            monsters: updatedMonsters,
            turnNumber,
          };
        }
      }

      return {
        ...prev,
        grid: newGrid,
        playerPosition: newPos,
        chipsCollected: newChipsCollected,
        inventory: newInventory,
        moveCount: prev.moveCount + 1,
        monsters: updatedMonsters,
        turnNumber,
      };
    });
  }, [highScores, timer]);

  const handleGridClick = useCallback((e: MouseEvent) => {
    if (gameData.gameState === 'idle') {
      startGame();
    }
  }, [gameData.gameState, startGame]);

  // Toggle sound
  const handleToggleSound = useCallback(() => {
    toggleSound();
    initAudio();
  }, []);

  // Save game
  const handleSaveGame = useCallback(() => {
    const savedGame = {
      currentLevel: gameData.currentLevel,
      playerPosition: gameData.playerPosition,
      grid: gameData.grid,
      chipsCollected: gameData.chipsCollected,
      chipsRequired: gameData.chipsRequired,
      timeElapsed: timer,
      moveCount: gameData.moveCount,
      inventory: gameData.inventory,
      savedAt: Date.now(),
    };
    const success = saveGame(savedGame);
    if (success) {
      setHasSavedGame(true);
      alert(txt.saveGame.gameSaved);
    }
    setActiveMenu(null);
  }, [gameData, timer, txt]);

  // Load game
  const handleLoadGame = useCallback(() => {
    const savedGame = loadSavedGame();
    if (savedGame) {
      setGameData({
        currentLevel: savedGame.currentLevel,
        grid: savedGame.grid,
        playerPosition: savedGame.playerPosition,
        chipsCollected: savedGame.chipsCollected,
        chipsRequired: savedGame.chipsRequired,
        timeElapsed: savedGame.timeElapsed,
        moveCount: savedGame.moveCount,
        inventory: savedGame.inventory,
        gameState: 'idle',
        levelCompleted: false,
      });
      setTimer(savedGame.timeElapsed);
      alert(txt.saveGame.gameLoaded);
    } else {
      alert(txt.saveGame.noSavedGame);
    }
    setActiveMenu(null);
  }, [txt]);

  // Submit password
  const handleSubmitPassword = useCallback(() => {
    const level = validatePassword(passwordInput, LEVELS.length);
    if (level) {
      loadLevel(level);
      setShowPassword(false);
      setPasswordInput('');
      setPasswordMessage('');
    } else {
      setPasswordMessage(txt.password.invalid);
    }
  }, [passwordInput, txt]);

  // Copy password to clipboard
  const handleCopyPassword = useCallback(() => {
    const password = generatePassword(gameData.currentLevel);
    navigator.clipboard.writeText(password).then(() => {
      setPasswordMessage(txt.password.copied);
      setTimeout(() => setPasswordMessage(''), 2000);
    });
  }, [gameData.currentLevel, txt]);

  // Get current level info
  const currentLevelInfo = getLevel(gameData.currentLevel);
  const currentPassword = generatePassword(gameData.currentLevel);

  // Load level from editor
  const handleLoadEditorLevel = useCallback((level: Level) => {
    setGameData(createInitialGame(level));
    setTimer(0);
    setShowEditor(false);
  }, []);

  return (
    <div class="chips-container" onClick={handleGridClick}>
      {/* Menu bar */}
      <div class="chips-menu-bar" ref={menuRef}>
        <div class="menu-item">
          <button
            onClick={() => setActiveMenu(activeMenu === 'game' ? null : 'game')}
          >
            {txt.menu.game}
          </button>
          {activeMenu === 'game' && (
            <div class="menu-dropdown">
              <div class="menu-item" onClick={newGame}>{txt.menu.new}</div>
              <div class="menu-item" onClick={handleSaveGame}>{txt.menu.save}</div>
              <div class="menu-item" onClick={handleLoadGame}>{txt.menu.load}</div>
              <div class="menu-item" onClick={() => setShowPassword(true)}>{txt.menu.password}</div>
              <div class="menu-item" onClick={() => setShowHighScores(true)}>{txt.menu.highScores}</div>
              <div class="menu-item" onClick={() => setShowEditor(true)}>{txt.menu.editor}</div>
              <div class="menu-item" onClick={handleToggleSound}>
                {isSoundEnabled() ? txt.sound.enabled : txt.sound.disabled}
              </div>
              <div class="menu-item" onClick={() => setShowInstructions(true)}>{txt.menu.instructions}</div>
            </div>
          )}
        </div>
        <div class="menu-item">
          <button
            onClick={() => setActiveMenu(activeMenu === 'level' ? null : 'level')}
          >
            {txt.menu.level}
          </button>
          {activeMenu === 'level' && (
            <div class="menu-dropdown">
              {LEVELS.map((level) => (
                <div
                  key={level.number}
                  class={`menu-item ${gameData.currentLevel === level.number ? 'selected' : ''}`}
                  onClick={() => loadLevel(level.number)}
                >
                  {level.number}. {level.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Game area */}
      <div class="chips-game-area">
        {gameData.gameState === 'idle' && (
          <div class="chips-overlay">
            <div class="chips-message">
              <h2>{currentLevelInfo.name}</h2>
              <p>{txt.clickToStart}</p>
              {currentLevelInfo.hint && (
                <p class="chips-hint">💡 {currentLevelInfo.hint}</p>
              )}
              <div class="chips-tutorial">
                <h3>{txt.instructions.title}</h3>
                <p>{txt.instructions.objective}</p>
                <div class="chips-legend">
                  <p><strong>{txt.instructions.legend}:</strong></p>
                  <p>🤖 = {txt.instructions.you}</p>
                  <p>💎 = {txt.instructions.chip}</p>
                  <p>🔑 = {txt.instructions.key}</p>
                  <p>🚪 = {txt.instructions.door}</p>
                  <p>⬜ = {txt.instructions.wall}</p>
                </div>
                <div class="chips-controls">
                  <p><strong>{txt.instructions.controls}:</strong></p>
                  <p>⬆️⬇️⬅️➡️ / WASD - {txt.instructions.move}</p>
                  <p>Enter - {txt.instructions.start}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {gameData.gameState === 'won' && (
          <div class="chips-overlay">
            <div class="chips-message chips-win">
              <h2>{txt.levelComplete}</h2>
              <p>{txt.stats.time}: {formatTime(timer)}</p>
              <p>{txt.stats.moves}: {gameData.moveCount}</p>
              {newRecordInfo && newRecordInfo.newRecord && (
                <p class="chips-new-record">
                  {newRecordInfo.newTimeRecord && !newRecordInfo.newMovesRecord && txt.highScores.timeRecord}
                  {newRecordInfo.newMovesRecord && !newRecordInfo.newTimeRecord && txt.highScores.movesRecord}
                  {newRecordInfo.newTimeRecord && newRecordInfo.newMovesRecord && txt.highScores.newRecord}
                </p>
              )}
              <p class="chips-password-hint">
                {txt.password.yourPassword} <code>{currentPassword}</code>
              </p>
              {gameData.currentLevel < LEVELS.length && (
                <button onClick={() => loadLevel(gameData.currentLevel + 1)}>
                  {txt.nextLevel}
                </button>
              )}
              <button onClick={newGame}>{txt.menu.restart}</button>
            </div>
          </div>
        )}

        {gameData.gameState === 'lost' && (
          <div class="chips-overlay">
            <div class="chips-message chips-lose">
              <h2>{txt.gameOver}</h2>
              <p>{txt.deathReasons[gameData.deathReason as keyof typeof txt.deathReasons] || txt.gameOver}</p>
              <button onClick={newGame}>{txt.tryAgain}</button>
            </div>
          </div>
        )}

        {/* Game grid */}
        <div
          class="chips-grid"
          style={{
            gridTemplateColumns: `repeat(${gameData.grid[0]?.length || 20}, 24px)`,
          }}
        >
          {gameData.grid.map((row: string[], y: number) =>
            row.map((tile: string, x: number) => {
              const isPlayer = gameData.playerPosition.x === x && gameData.playerPosition.y === y;
              const monster = gameData.monsters?.find(m => m.position.x === x && m.position.y === y);
              return (
                <div
                  key={`${x}-${y}`}
                  class={`chips-tile chips-tile-${tile} ${isPlayer ? 'chips-player' : ''}`}
                  data-x={x}
                  data-y={y}
                >
                  {isPlayer && <div class="chips-player-sprite">🤖</div>}
                  {monster && !isPlayer && <div class="chips-monster chips-monster-${monster.type}">{getMonsterSprite(monster.type)}</div>}
                  {tile === 'chip' && !isPlayer && !monster && <div class="chips-chip">💎</div>}
                  {tile === 'key_red' && !monster && <div class="chips-key">🔑</div>}
                  {tile === 'key_blue' && !monster && <div class="chips-key">🔑</div>}
                  {tile === 'key_green' && !monster && <div class="chips-key">🔑</div>}
                  {tile === 'key_yellow' && !monster && <div class="chips-key">🔑</div>}
                  {tile === 'door_red' && <div class="chips-door">🚪</div>}
                  {tile === 'door_blue' && <div class="chips-door">🚪</div>}
                  {tile === 'door_green' && <div class="chips-door">🚪</div>}
                  {tile === 'door_yellow' && <div class="chips-door">🚪</div>}
                  {tile === 'exit' && <div class="chips-exit">🚪</div>}
                  {tile === 'boots_ice' && <div class="chips-boots">🥾</div>}
                  {tile === 'boots_water' && <div class="chips-boots">🥾</div>}
                  {tile === 'boots_fire' && <div class="chips-boots">🥾</div>}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Inventory display */}
      <div class="chips-inventory">
        <div class="chips-inventory-section">
          <span class="chips-inventory-label">{txt.keys}:</span>
          {gameData.inventory.keys.map((key: string, i: number) => (
            <span key={i} class={`chips-key-inventory chips-key-${key}`}>🔑</span>
          ))}
          {gameData.inventory.keys.length === 0 && <span class="chips-empty">-</span>}
        </div>
        <div class="chips-inventory-section">
          <span class="chips-inventory-label">{txt.boots}:</span>
          {gameData.inventory.boots.map((boot: string, i: number) => (
            <span key={i} class={`chips-boot-inventory chips-boot-${boot}`}>🥾</span>
          ))}
          {gameData.inventory.boots.length === 0 && <span class="chips-empty">-</span>}
        </div>
      </div>

      {/* Instructions modal */}
      {showInstructions && (
        <div class="chips-modal" onClick={() => setShowInstructions(false)}>
          <div class="chips-modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{txt.instructions.title}</h2>
            <p>{txt.instructions.objective}</p>
            <ul>
              {txt.instructions.rules.map((rule: string, i: number) => (
                <li key={i}>{rule}</li>
              ))}
            </ul>
            <div class="chips-controls">
              <h3>{txt.instructions.controls}</h3>
              <p>⬆️⬇️⬅️➡️ / WASD - {txt.instructions.move}</p>
              <p>Enter - {txt.instructions.start}</p>
              <p>N - {txt.instructions.newGame}</p>
              <p>R - {txt.instructions.restart}</p>
              <p>F1 - {txt.instructions.help}</p>
            </div>
            <button onClick={() => setShowInstructions(false)}>{txt.instructions.close}</button>
          </div>
        </div>
      )}

      {/* High scores modal */}
      {showHighScores && (
        <div class="chips-modal" onClick={() => setShowHighScores(false)}>
          <div class="chips-modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{txt.highScores.title}</h2>
            {Object.keys(highScores).length === 0 ? (
              <p>{txt.highScores.noScores}</p>
            ) : (
              <div class="chips-high-scores-list">
                {Object.entries(highScores)
                  .sort(([a], [b]) => parseInt(a) - parseInt(b))
                  .map(([level, score]) => (
                    <div key={level} class="chips-high-score-entry">
                      <span>{txt.highScores.level} {level}:</span>
                      <span>{txt.highScores.bestTime}: {formatTime(score.bestTime)}</span>
                      <span>{txt.highScores.bestMoves}: {score.bestMoves}</span>
                    </div>
                  ))}
              </div>
            )}
            <button onClick={() => setShowHighScores(false)}>{txt.highScores.close}</button>
          </div>
        </div>
      )}

      {/* Password modal */}
      {showPassword && (
        <div class="chips-modal" onClick={() => setShowPassword(false)}>
          <div class="chips-modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{txt.password.title}</h2>
            <div class="chips-password-current">
              <p>{txt.password.yourPassword}</p>
              <div class="chips-password-display">
                <code>{currentPassword}</code>
                <button onClick={handleCopyPassword}>📋</button>
              </div>
            </div>
            <div class="chips-password-input">
              <p>{txt.password.enter}</p>
              <input
                type="text"
                value={passwordInput}
                onInput={(e) => setPasswordInput((e.target as HTMLInputElement).value.toUpperCase())}
                maxLength={4}
                placeholder="ABCD"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSubmitPassword();
                  }
                }}
              />
              {passwordMessage && (
                <p class={`chips-password-message ${passwordMessage === txt.password.invalid ? 'error' : 'success'}`}>
                  {passwordMessage}
                </p>
              )}
            </div>
            <button onClick={handleSubmitPassword}>{txt.password.jump}</button>
            <button onClick={() => {
              setShowPassword(false);
              setPasswordInput('');
              setPasswordMessage('');
            }}>{txt.highScores.close}</button>
          </div>
        </div>
      )}

      {/* Level Editor */}
      {showEditor && (
        <div class="chips-modal chips-editor-modal">
          <LevelEditor
            onClose={() => setShowEditor(false)}
            onLoadLevel={handleLoadEditorLevel}
          />
        </div>
      )}
    </div>
  );
}
