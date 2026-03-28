export type ObstacleType = 'tree' | 'rock' | 'bush' | 'dog' | 'snowboarder' | 'stump' | 'ice-patch' | 'ramp' | 'sign' | 'skier';

export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
  crashed: boolean;
  inAir: boolean;
  airTime: number;
  jumpY: number;
  jumpVelocity: number;
}

export interface Obstacle {
  id: string;
  type: ObstacleType;
  x: number;
  y: number;
  width: number;
  height: number;
  vx?: number; // For moving obstacles (dogs, snowboarders, skiers)
  frame?: number; // Animation frame
}

export interface TrailPoint {
  x: number;
  y: number;
  time: number;
  speed: number;
  width: number;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  type: 'snow' | 'sparkle' | 'crash' | 'trail';
  color: string;
  size: number;
}

export interface Collectible {
  id: string;
  type: 'coin' | 'star' | 'boost' | 'extra-life';
  x: number;
  y: number;
  collected: boolean;
  spawnTime: number;
}

export type GameState = 'idle' | 'playing' | 'crashed' | 'yeti';

export interface GameData {
  player: Player;
  obstacles: Obstacle[];
  trails: TrailPoint[];
  particles: Particle[];
  collectibles: Collectible[];
  distance: number;
  score: number;
  gameState: GameState;
  yeti: Player | null;
  yetiActive: boolean;
  yetiFrame: number;
  frameCount: number;
  highScore: number;
  terrainType: 'powder' | 'groomed' | 'ice' | 'mogul';
}

export type KeysPressed = Set<string>;
