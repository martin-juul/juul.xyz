import type { Player, Obstacle, GameData, ObstacleType, KeysPressed, Collectible } from './types';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  PLAYER_INITIAL_SPEED,
  PLAYER_MAX_SPEED,
  PLAYER_ACCELERATION,
  TURN_SPEED,
  GRAVITY,
  JUMP_FORCE,
  OBSTACLE_SPAWN_RATE,
  YETI_DISTANCE,
  YETI_SPEED,
  YETI_WIDTH,
  YETI_HEIGHT,
  OBSTACLE_CONFIGS,
  OBSTACLE_TYPES,
  OBSTACLE_WEIGHTS,
  TERRAIN_TYPES,
  TERRAIN_EFFECTS,
  COLLECTIBLE_CONFIGS,
} from './constants';
import { addTrailPoint, createCrashParticles, createParticle, updateParticles } from './effects';

export type { GameData, GameState } from './types';

let obstacleIdCounter = 0;
let collectibleIdCounter = 0;

function createObstacleId(): string {
  return `obstacle-${obstacleIdCounter++}`;
}

function getRandomObstacleType(): ObstacleType {
  const totalWeight = OBSTACLE_WEIGHTS.reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < OBSTACLE_TYPES.length; i++) {
    random -= OBSTACLE_WEIGHTS[i];
    if (random <= 0) {
      return OBSTACLE_TYPES[i] as ObstacleType;
    }
  }

  return 'tree';
}

export function createInitialGame(highScore: number = 0): GameData {
  return {
    player: {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
      vx: 0,
      vy: PLAYER_INITIAL_SPEED,
      speed: PLAYER_INITIAL_SPEED,
      crashed: false,
      inAir: false,
      airTime: 0,
      jumpY: 0,
      jumpVelocity: 0,
    },
    obstacles: [],
    trails: [],
    particles: [],
    collectibles: [],
    distance: 0,
    score: 0,
    gameState: 'idle',
    yeti: null,
    yetiActive: false,
    yetiFrame: 0,
    frameCount: 0,
    highScore,
    terrainType: 'groomed',
  };
}

function updatePlayerPosition(
  player: Player,
  keys: KeysPressed,
  deltaTime: number,
  terrainType: string
): Player {
  let vx = player.vx;
  let vy = player.vy;
  let speed = player.speed;

  // Get terrain effects
  const terrain = TERRAIN_EFFECTS[terrainType as keyof typeof TERRAIN_EFFECTS] || TERRAIN_EFFECTS.groomed;
  const turnSpeed = TURN_SPEED * terrain.turnMultiplier;
  const maxSpeed = PLAYER_MAX_SPEED * terrain.speedMultiplier;

  // Horizontal movement (steering)
  if (keys.has('ArrowLeft') || keys.has('a') || keys.has('A')) {
    vx = -turnSpeed;
  } else if (keys.has('ArrowRight') || keys.has('d') || keys.has('D')) {
    vx = turnSpeed;
  } else {
    vx = 0;
  }

  // Vertical speed control
  if (keys.has('ArrowUp') || keys.has('w') || keys.has('W')) {
    speed = Math.max(speed - PLAYER_ACCELERATION * deltaTime * 2, PLAYER_INITIAL_SPEED * 0.5);
  } else if (keys.has('ArrowDown') || keys.has('s') || keys.has('S')) {
    speed = Math.min(speed + PLAYER_ACCELERATION * deltaTime * 2, maxSpeed);
  } else {
    // Natural acceleration
    speed = Math.min(speed + PLAYER_ACCELERATION * deltaTime, maxSpeed);
  }

  vy = speed;

  // Handle jumping physics
  let jumpY = player.jumpY;
  let jumpVelocity = player.jumpVelocity;
  let inAir = player.inAir;
  let airTime = player.airTime;

  if (inAir) {
    // Apply gravity to jump
    jumpVelocity -= GRAVITY * deltaTime;
    jumpY += jumpVelocity * deltaTime;
    airTime += deltaTime;

    // Check if landed
    if (jumpY <= 0) {
      jumpY = 0;
      jumpVelocity = 0;
      inAir = false;
      airTime = 0;
    }
  }

  // Update position
  let newX = player.x + vx * deltaTime;
  let newY = player.y - vy * deltaTime; // Negative because moving up reduces world Y

  // Keep player in bounds (with some margin)
  const margin = PLAYER_WIDTH / 2;
  newX = Math.max(margin, Math.min(CANVAS_WIDTH - margin, newX));

  return {
    ...player,
    x: newX,
    y: newY,
    vx,
    vy,
    speed,
    inAir,
    airTime,
    jumpY,
    jumpVelocity,
  };
}

function generateObstacles(
  currentY: number,
  existingObstacles: Obstacle[],
  deltaTime: number
): Obstacle[] {
  // Spawn obstacles based on time
  const shouldSpawn = Math.random() < OBSTACLE_SPAWN_RATE * deltaTime;

  if (!shouldSpawn) {
    return existingObstacles;
  }

  // Only spawn if we don't have too many obstacles
  if (existingObstacles.length > 50) {
    return existingObstacles;
  }

  // Spawn ahead of player (negative Y direction)
  const spawnY = currentY - CANVAS_HEIGHT - 100;
  const type = getRandomObstacleType();
  const config = OBSTACLE_CONFIGS[type];

  const obstacle: Obstacle = {
    id: createObstacleId(),
    type,
    x: Math.random() * (CANVAS_WIDTH - config.width),
    y: spawnY,
    width: config.width,
    height: config.height,
    vx: config.vx,
  };

  return [...existingObstacles, obstacle];
}

function createCollectibleId(): string {
  return `collectible-${collectibleIdCounter++}`;
}

function generateCollectibles(
  currentY: number,
  existingCollectibles: Collectible[],
  deltaTime: number
): Collectible[] {
  // Rare spawn rate for collectibles
  const shouldSpawn = Math.random() < 0.02 * deltaTime;

  if (!shouldSpawn || existingCollectibles.length > 10) {
    return existingCollectibles;
  }

  // Determine type
  const types: Array<'coin' | 'star' | 'boost' | 'extra-life'> = ['coin', 'coin', 'coin', 'star', 'boost', 'extra-life'];
  const type = types[Math.floor(Math.random() * types.length)];

  const collectible: Collectible = {
    id: createCollectibleId(),
    type,
    x: 50 + Math.random() * (CANVAS_WIDTH - 100),
    y: currentY - CANVAS_HEIGHT - Math.random() * 200,
    collected: false,
    spawnTime: Date.now(),
  };

  return [...existingCollectibles, collectible];
}

function checkCollectibleCollision(player: Player, collectibles: Collectible[]): { collected: Collectible[]; scoreBonus: number } {
  const collected: Collectible[] = [];
  let scoreBonus = 0;

  for (const collectible of collectibles) {
    if (collectible.collected) continue;

    const dx = player.x - collectible.x;
    const dy = player.y - collectible.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 30) {
      collected.push({ ...collectible, collected: true });
      const config = COLLECTIBLE_CONFIGS[collectible.type];
      scoreBonus += config.points;
    }
  }

  return { collected, scoreBonus };
}

function checkCollision(player: Player, obstacles: Obstacle[]): { crashed: boolean; launched: boolean } {
  for (const obstacle of obstacles) {
    // Convert player position to world coordinates for collision
    const playerWorldY = player.y;
    const obstacleWorldY = obstacle.y;

    // Check if obstacle is close enough to player (in viewport)
    if (Math.abs(obstacleWorldY - playerWorldY) > CANVAS_HEIGHT / 2) {
      continue;
    }

    // Skip collision if player is high in the air (jumped over obstacle)
    if (player.jumpY > 20) {
      continue;
    }

    // Simple AABB collision detection
    const playerLeft = player.x - PLAYER_WIDTH / 2;
    const playerRight = player.x + PLAYER_WIDTH / 2;
    const playerTop = playerWorldY - PLAYER_HEIGHT / 2;
    const playerBottom = playerWorldY + PLAYER_HEIGHT / 2;

    const obstacleLeft = obstacle.x;
    const obstacleRight = obstacle.x + obstacle.width;
    const obstacleTop = obstacleWorldY;
    const obstacleBottom = obstacleWorldY + obstacle.height;

    if (
      playerLeft < obstacleRight &&
      playerRight > obstacleLeft &&
      playerTop < obstacleBottom &&
      playerBottom > obstacleTop
    ) {
      // Check if it's a ramp
      if (obstacle.type === 'ramp' && !player.inAir) {
        return { crashed: false, launched: true };
      }
      // Check if it's an ice patch (slippery but not a crash)
      if (obstacle.type === 'ice-patch') {
        return { crashed: false, launched: false };
      }
      // Signs and decorative items don't crash
      if (obstacle.type === 'sign') {
        return { crashed: false, launched: false };
      }
      return { crashed: true, launched: false };
    }
  }

  return { crashed: false, launched: false };
}

function updateMovingObstacles(obstacles: Obstacle[], deltaTime: number): Obstacle[] {
  return obstacles.map((obstacle) => {
    if (obstacle.vx !== undefined && obstacle.vx !== 0) {
      // Move horizontally (dogs)
      let newX = obstacle.x + obstacle.vx * deltaTime;

      // Bounce off walls
      if (newX <= 0 || newX + obstacle.width >= CANVAS_WIDTH) {
        newX = Math.max(0, Math.min(CANVAS_WIDTH - obstacle.width, newX));
      }

      return { ...obstacle, x: newX };
    }
    return obstacle;
  });
}

function removeOldObstacles(obstacles: Obstacle[], playerY: number): Obstacle[] {
  return obstacles.filter((obstacle) => obstacle.y < playerY + CANVAS_HEIGHT + 100);
}

function activateYeti(distance: number, player: Player): Player | null {
  if (distance >= YETI_DISTANCE && !player.crashed) {
    return {
      x: Math.random() * CANVAS_WIDTH,
      y: player.y - CANVAS_HEIGHT / 2,
      vx: 0,
      vy: YETI_SPEED,
      speed: YETI_SPEED,
      crashed: false,
      inAir: false,
      airTime: 0,
      jumpY: 0,
      jumpVelocity: 0,
    };
  }
  return null;
}

function updateYeti(yeti: Player, player: Player, deltaTime: number): Player {
  // Yeti chases player horizontally
  let vx = 0;
  const dx = player.x - yeti.x;

  if (Math.abs(dx) > 5) {
    vx = dx > 0 ? TURN_SPEED * 0.8 : -TURN_SPEED * 0.8;
  }

  // Yeti moves slightly faster than player
  const newX = yeti.x + vx * deltaTime;
  const newY = yeti.y - yeti.vy * deltaTime;

  return {
    ...yeti,
    x: Math.max(YETI_WIDTH / 2, Math.min(CANVAS_WIDTH - YETI_WIDTH / 2, newX)),
    y: newY,
    vx,
  };
}

function checkYetiCollision(player: Player, yeti: Player | null): boolean {
  if (!yeti) return false;

  const playerLeft = player.x - PLAYER_WIDTH / 2;
  const playerRight = player.x + PLAYER_WIDTH / 2;
  const playerTop = player.y - PLAYER_HEIGHT / 2;
  const playerBottom = player.y + PLAYER_HEIGHT / 2;

  const yetiLeft = yeti.x - YETI_WIDTH / 2;
  const yetiRight = yeti.x + YETI_WIDTH / 2;
  const yetiTop = yeti.y - YETI_HEIGHT / 2;
  const yetiBottom = yeti.y + YETI_HEIGHT / 2;

  return (
    playerLeft < yetiRight &&
    playerRight > yetiLeft &&
    playerTop < yetiBottom &&
    playerBottom > yetiTop
  );
}

export function updateGame(
  data: GameData,
  keys: KeysPressed,
  deltaTime: number
): GameData {
  if (data.gameState !== 'playing') {
    return data;
  }

  // Update player position with terrain effects
  let updatedPlayer = updatePlayerPosition(data.player, keys, deltaTime, data.terrainType);

  // Update distance (in meters, assuming 1 pixel = 0.1 meters)
  const distanceDelta = updatedPlayer.vy * deltaTime * 0.1;
  const newDistance = data.distance + distanceDelta;

  // Update terrain type based on distance
  const terrainIndex = Math.floor(newDistance / 500) % TERRAIN_TYPES.length;
  const newTerrainType = TERRAIN_TYPES[terrainIndex];

  // Add trail points
  let updatedTrails = addTrailPoint(data.trails, updatedPlayer.x, updatedPlayer.y, updatedPlayer.speed);

  // Generate collectibles
  let updatedCollectibles = generateCollectibles(updatedPlayer.y, data.collectibles, deltaTime);
  updatedCollectibles = removeOldCollectibles(updatedCollectibles, updatedPlayer.y);

  // Check collectible collisions
  const collectibleResult = checkCollectibleCollision(updatedPlayer, updatedCollectibles);
  const scoreFromCollectibles = collectibleResult.scoreBonus;

  // Update collectibles with marked as collected
  updatedCollectibles = updatedCollectibles.map(c => {
    const found = collectibleResult.collected.find(col => col.id === c.id);
    return found || c;
  });

  // Generate and update obstacles
  let updatedObstacles = generateObstacles(updatedPlayer.y, data.obstacles, deltaTime);
  updatedObstacles = updateMovingObstacles(updatedObstacles, deltaTime);
  updatedObstacles = removeOldObstacles(updatedObstacles, updatedPlayer.y);

  // Check collisions
  const collisionResult = checkCollision(updatedPlayer, updatedObstacles);
  const yetiCaught = checkYetiCollision(updatedPlayer, data.yeti);

  // Handle ramp launch
  if (collisionResult.launched) {
    updatedPlayer = {
      ...updatedPlayer,
      inAir: true,
      jumpVelocity: JUMP_FORCE,
      jumpY: 1,
      airTime: 0,
    };
  }

  // Check for Yeti activation
  let yeti = data.yeti;
  let yetiActive = data.yetiActive;
  let yetiFrame = data.yetiFrame;

  if (!yetiActive && newDistance >= YETI_DISTANCE) {
    yeti = activateYeti(newDistance, updatedPlayer);
    yetiActive = yeti !== null;
  }

  // Update Yeti
  if (yeti && yetiActive) {
    yeti = updateYeti(yeti, updatedPlayer, deltaTime);
    yetiFrame += 1;
  }

  // Update particles
  let updatedParticles = [...data.particles];

  // Add particles for speed effect
  if (updatedPlayer.speed > 400 && Math.random() < 0.1) {
    updatedParticles.push(createParticle(
      updatedPlayer.x,
      updatedPlayer.y,
      'trail',
      0,
      updatedPlayer.speed
    ));
  }

  updatedParticles = updateParticles(updatedParticles, deltaTime);

  // Handle crash
  if (collisionResult.crashed) {
    // Add crash particles
    const crashParticles = createCrashParticles(updatedPlayer.x, updatedPlayer.y);
    updatedParticles = [...updatedParticles, ...crashParticles];

    return {
      ...data,
      player: { ...updatedPlayer, crashed: true },
      obstacles: updatedObstacles,
      trails: updatedTrails,
      particles: updatedParticles,
      collectibles: updatedCollectibles,
      distance: newDistance,
      score: Math.floor(newDistance + scoreFromCollectibles),
      frameCount: data.frameCount + 1,
      terrainType: newTerrainType,
      gameState: 'crashed',
    };
  }

  // Handle Yeti catch
  if (yetiCaught) {
    return {
      ...data,
      player: { ...updatedPlayer, crashed: true },
      obstacles: updatedObstacles,
      trails: updatedTrails,
      particles: updatedParticles,
      collectibles: updatedCollectibles,
      distance: newDistance,
      score: Math.floor(newDistance + scoreFromCollectibles),
      yeti,
      yetiActive,
      yetiFrame,
      frameCount: data.frameCount + 1,
      terrainType: newTerrainType,
      gameState: 'yeti',
    };
  }

  return {
    ...data,
    player: updatedPlayer,
    obstacles: updatedObstacles,
    trails: updatedTrails,
    particles: updatedParticles,
    collectibles: updatedCollectibles,
    distance: newDistance,
    score: Math.floor(newDistance + scoreFromCollectibles),
    yeti,
    yetiActive,
    yetiFrame,
    frameCount: data.frameCount + 1,
    terrainType: newTerrainType,
  };
}

function removeOldCollectibles(collectibles: Collectible[], playerY: number): Collectible[] {
  return collectibles.filter(c => !c.collected && c.y < playerY + CANVAS_HEIGHT + 100);
}

export function startGame(data: GameData): GameData {
  return {
    ...data,
    gameState: 'playing',
  };
}

export function resetGame(highScore: number): GameData {
  return createInitialGame(highScore);
}

export function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(2)} km`;
  }
  return `${Math.floor(meters)} m`;
}

export function formatSpeed(speed: number): string {
  // Convert pixels per second to km/h (assuming 1 pixel = 0.1 meters)
  const kmh = (speed * 0.1 * 3.6).toFixed(0);
  return `${kmh} km/h`;
}

// Re-export constants for use in other modules
export {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  PLAYER_INITIAL_SPEED,
  PLAYER_MAX_SPEED,
  PLAYER_ACCELERATION,
  TURN_SPEED,
  OBSTACLE_SPAWN_RATE,
  YETI_DISTANCE,
  YETI_SPEED,
  YETI_WIDTH,
  YETI_HEIGHT,
  TERRAIN_EFFECTS,
} from './constants';
