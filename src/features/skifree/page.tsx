import { useState, useCallback, useEffect, useRef } from 'preact/hooks';
import { useLanguage } from '../../context/language-context';
import {
  createInitialGame,
  startGame,
  resetGame,
  updateGame,
  formatDistance,
  formatSpeed,
  TERRAIN_EFFECTS,
} from './game-logic';
import type { GameData, KeysPressed } from './types';
import { skifreeTranslations } from './translations';
import {
  drawPlayer,
  drawObstacle,
  drawYeti,
  drawShadow,
} from './sprites';
import {
  renderTrails,
  renderParticles,
  getSnowTexture,
  renderSnowOverlay,
  renderShadow as renderShadowEffect,
  renderSpeedLines,
  renderFog,
  renderScreenShake,
  renderGroundTexture,
} from './effects';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants';
import './skifree.css';

export function Skifree() {
  const { t } = useLanguage();
  const txt = t.skifree;

  const [gameData, setGameData] = useState<GameData>(() => createInitialGame());
  const [isPlaying, setIsPlaying] = useState(false);
  const [keysPressed, setKeysPressed] = useState<Set<string>>(new Set());
  const [showInstructions, setShowInstructions] = useState(false);
  const [activeMenu, setActiveMenu] = useState<'game' | 'help' | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
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

  // Keyboard handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;

      // Prevent arrow key scrolling
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(key)) {
        e.preventDefault();
      }

      // Update keys pressed
      setKeysPressed((prev) => new Set(prev).add(key));

      // Start game with Enter
      if (key === 'Enter' && gameData.gameState === 'idle') {
        setGameData((prev) => startGame(prev));
        setIsPlaying(true);
      }

      // New game with N
      if ((key === 'n' || key === 'N') && gameData.gameState !== 'playing') {
        handleNewGame();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeysPressed((prev) => {
        const newSet = new Set(prev);
        newSet.delete(e.key);
        return newSet;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameData.gameState]);

  // Game loop
  useEffect(() => {
    if (!isPlaying) {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = undefined;
      }
      return;
    }

    lastTimeRef.current = performance.now();

    const loop = (currentTime: number) => {
      const deltaTime = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;

      // Limit deltaTime to prevent huge jumps
      const clampedDeltaTime = Math.min(deltaTime, 0.1);

      // Update game state
      const newState = updateGame(gameData, keysPressed, clampedDeltaTime);
      setGameData(newState);

      // Render to canvas
      render(canvasRef.current, newState);

      // Check if game ended
      if (newState.gameState === 'crashed' || newState.gameState === 'yeti') {
        setIsPlaying(false);
        const newHighScore = Math.max(gameData.highScore, newState.score);
        setGameData((prev) => ({ ...newState, highScore: newHighScore }));
      } else {
        gameLoopRef.current = requestAnimationFrame(loop);
      }
    };

    gameLoopRef.current = requestAnimationFrame(loop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [isPlaying, gameData, keysPressed]);

  // Initial render
  useEffect(() => {
    if (canvasRef.current) {
      render(canvasRef.current, gameData);
    }
  }, [gameData]);

  const handleNewGame = useCallback(() => {
    const newGame = resetGame(gameData.highScore);
    setGameData(newGame);
    setIsPlaying(true);
    setShowInstructions(false);
    setActiveMenu(null);
  }, [gameData.highScore]);

  const handleCanvasClick = useCallback(() => {
    if (gameData.gameState === 'idle') {
      setGameData((prev) => startGame(prev));
      setIsPlaying(true);
    }
  }, [gameData.gameState]);

  function render(canvas: HTMLCanvasElement | null, data: GameData) {
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();

    // Apply screen shake if crashed
    if (data.gameState === 'crashed' || data.gameState === 'yeti') {
      renderScreenShake(ctx, 5, data.frameCount / 60);
    }

    // Draw ground texture
    renderGroundTexture(ctx, data.distance);

    // Calculate viewport offset (player stays centered)
    const viewportOffsetY = data.player.y - CANVAS_HEIGHT / 2;

    // Draw shadows first (under everything)
    for (const obstacle of data.obstacles) {
      const screenY = obstacle.y - viewportOffsetY;
      if (screenY < -50 || screenY > CANVAS_HEIGHT + 50) continue;

      const shadowSize = obstacle.width < 20 ? 'small' : obstacle.width < 30 ? 'medium' : 'large';
      drawShadow(ctx, obstacle.x + obstacle.width / 2, screenY + obstacle.height, shadowSize, 2);
    }

    // Draw Yeti shadow
    if (data.yeti && data.yetiActive) {
      const yetiScreenY = data.yeti.y - viewportOffsetY;
      if (yetiScreenY > -50 && yetiScreenY < CANVAS_HEIGHT + 50) {
        drawShadow(ctx, data.yeti.x, yetiScreenY + 20, 'large', 2);
      }
    }

    // Draw trails
    renderTrails(ctx, data.trails, viewportOffsetY);

    // Draw collectibles
    for (const collectible of data.collectibles) {
      if (collectible.collected) continue;

      const screenY = collectible.y - viewportOffsetY;
      if (screenY < -20 || screenY > CANVAS_HEIGHT + 20) continue;

      // Animated collectible
      const bobble = Math.sin(data.frameCount * 0.1 + parseFloat(collectible.id.slice(-1))) * 3;
      const size = collectible.type === 'star' ? 12 : collectible.type === 'boost' ? 10 : 8;

      ctx.fillStyle = collectible.type === 'coin' ? '#f1c40f' :
                     collectible.type === 'star' ? '#f39c12' :
                     collectible.type === 'boost' ? '#3498db' : '#e74c3c';

      // Glow effect
      ctx.beginPath();
      ctx.arc(collectible.x, screenY + bobble, size + 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fill();

      // Main item
      ctx.beginPath();
      ctx.arc(collectible.x, screenY + bobble, size, 0, Math.PI * 2);
      ctx.fill();

      // Inner detail
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.beginPath();
      ctx.arc(collectible.x - 2, screenY + bobble - 2, size / 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw obstacles with sprites
    for (const obstacle of data.obstacles) {
      const screenY = obstacle.y - viewportOffsetY;
      if (screenY < -50 || screenY > CANVAS_HEIGHT + 50) continue;

      ctx.save();
      drawObstacle(ctx, obstacle.type, obstacle.x + obstacle.width / 2, screenY + obstacle.height / 2, data.frameCount, 2);
      ctx.restore();
    }

    // Draw Yeti if active
    if (data.yeti && data.yetiActive) {
      const yetiScreenY = data.yeti.y - viewportOffsetY;
      if (yetiScreenY > -50 && yetiScreenY < CANVAS_HEIGHT + 50) {
        drawYeti(ctx, data.yeti.x, yetiScreenY, data.yetiFrame, 2);
      }
    }

    // Draw player with jump offset
    const playerScreenY = CANVAS_HEIGHT / 2 - data.player.jumpY;
    drawPlayer(ctx, data.player.x, playerScreenY, data.player.vx, data.player.inAir, data.player.crashed, 2);

    // Draw particles
    renderParticles(ctx, data.particles, viewportOffsetY);

    // Draw speed lines at high speed
    if (data.player.speed > 350) {
      renderSpeedLines(ctx, data.player.speed, data.frameCount / 60);
    }

    // Draw fog at high distances
    renderFog(ctx, data.distance);

    // Draw snow overlay
    renderSnowOverlay(ctx, data.frameCount / 60);

    ctx.restore();
  }

  return (
    <div class="skifree-container" data-testid="skifree-container">
      <div class="skifree-menu-bar" ref={menuRef} data-testid="skifree-menu-bar">
        <div class="skifree-menu-trigger">
          <span
            class={`skifree-menu-item ${activeMenu === 'game' ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenu(activeMenu === 'game' ? null : 'game');
            }}
            data-testid="skifree-menu-game"
          >
            {txt.menu.game}
          </span>
          {activeMenu === 'game' && (
            <div class="skifree-dropdown" data-testid="skifree-game-dropdown">
              <button class="skifree-dropdown-item" onClick={handleNewGame} data-testid="skifree-new-game">
                <span class="skifree-dropdown-text">{txt.menu.new}</span>
              </button>
            </div>
          )}
        </div>
        <span
          class="skifree-menu-item"
          onClick={() => setShowInstructions(!showInstructions)}
          data-testid="skifree-menu-help"
        >
          {txt.menu.help}
        </span>
      </div>

      <div class="skifree-content" data-testid="skifree-content">
        <div class="skifree-controls" data-testid="skifree-controls">
          <div class="skifree-stats">
            <div class="skifree-stat" data-testid="skifree-distance">
              <span class="skifree-stat-label">{txt.game.distance}:</span>
              <span class="skifree-stat-value">{formatDistance(gameData.distance)}</span>
            </div>
            <div class="skifree-stat" data-testid="skifree-speed">
              <span class="skifree-stat-label">{txt.game.speed}:</span>
              <span class="skifree-stat-value">{formatSpeed(gameData.player.speed)}</span>
            </div>
            <div class="skifree-stat" data-testid="skifree-terrain">
              <span class="skifree-stat-label">{txt.game.terrain}:</span>
              <span class="skifree-stat-value">{TERRAIN_EFFECTS[gameData.terrainType].description}</span>
            </div>
            {gameData.highScore > 0 && (
              <div class="skifree-stat" data-testid="skifree-highscore">
                <span class="skifree-stat-label">{txt.game.highScore}:</span>
                <span class="skifree-stat-value">{formatDistance(gameData.highScore)}</span>
              </div>
            )}
          </div>

          <button
            class="skifree-new-btn"
            onClick={handleNewGame}
            data-testid="skifree-new-button"
          >
            {txt.game.new}
          </button>
        </div>

        {showInstructions && (
          <div class="skifree-instructions" data-testid="skifree-instructions">
            <h3>{txt.instructions.title}</h3>
            <p>{txt.instructions.objective}</p>
            <p><strong>{txt.instructions.controls}:</strong></p>
            <ul>
              {txt.instructions.rules.map((rule: string, i: number) => (
                <li key={i}>{rule}</li>
              ))}
            </ul>
          </div>
        )}

        {gameData.gameState === 'idle' && (
          <div class="skifree-message skifree-message-start" data-testid="skifree-start-message">
            {txt.messages.clickToStart}
          </div>
        )}

        {gameData.gameState === 'crashed' && (
          <div class="skifree-message skifree-message-gameover" data-testid="skifree-gameover-message">
            {txt.messages.crashed}
            <br />
            {txt.game.distance}: {formatDistance(gameData.distance)}
          </div>
        )}

        {gameData.gameState === 'yeti' && (
          <div class="skifree-message skifree-message-yeti" data-testid="skifree-yeti-message">
            {txt.messages.yeti}
            <br />
            {txt.game.distance}: {formatDistance(gameData.distance)}
          </div>
        )}

        <div class="skifree-canvas-container">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            class="skifree-canvas"
            onClick={handleCanvasClick}
            data-testid="skifree-canvas"
          />
        </div>
      </div>
    </div>
  );
}
