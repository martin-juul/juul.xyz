export const CANVAS_WIDTH = 400;
export const CANVAS_HEIGHT = 500;
export const PLAYER_WIDTH = 20;
export const PLAYER_HEIGHT = 30;
export const PLAYER_INITIAL_SPEED = 200;
export const PLAYER_MAX_SPEED = 500;
export const PLAYER_ACCELERATION = 20;
export const TURN_SPEED = 350;
export const GRAVITY = 800;
export const JUMP_FORCE = 400;
export const OBSTACLE_SPAWN_RATE = 0.3;
export const YETI_DISTANCE = 2000;
export const YETI_SPEED = 230;
export const YETI_WIDTH = 30;
export const YETI_HEIGHT = 40;

export const OBSTACLE_CONFIGS: Record<string, { width: number; height: number; vx?: number }> = {
  tree: { width: 30, height: 40 },
  rock: { width: 25, height: 20 },
  bush: { width: 20, height: 20 },
  dog: { width: 25, height: 15, vx: 80 },
  snowboarder: { width: 25, height: 30, vx: 0 },
  stump: { width: 20, height: 12 },
  'ice-patch': { width: 30, height: 15 },
  ramp: { width: 35, height: 20 },
  sign: { width: 15, height: 35 },
  skier: { width: 25, height: 30, vx: 60 },
};

export const OBSTACLE_TYPES: string[] = ['tree', 'rock', 'bush', 'dog', 'snowboarder', 'stump', 'ice-patch', 'ramp', 'sign', 'skier'];

export const OBSTACLE_WEIGHTS = [25, 15, 15, 8, 5, 10, 8, 7, 3, 4]; // Balanced distribution

export const TRAIL_FADE_TIME = 3000; // Trail points fade after 3 seconds
export const MAX_TRAIL_POINTS = 200; // Maximum trail points to track
export const MAX_PARTICLES = 100; // Maximum active particles

export const COLLECTIBLE_CONFIGS = {
  coin: { points: 10, color: '#f1c40f', size: 8 },
  star: { points: 50, color: '#f39c12', size: 10 },
  boost: { points: 0, color: '#3498db', size: 12 },
  'extra-life': { points: 0, color: '#e74c3c', size: 10 },
};

export const TERRAIN_TYPES = ['powder', 'groomed', 'ice', 'mogul'] as const;

export const TERRAIN_EFFECTS = {
  powder: { speedMultiplier: 0.85, turnMultiplier: 0.9, description: 'Powder Snow' },
  groomed: { speedMultiplier: 1.0, turnMultiplier: 1.0, description: 'Groomed Trail' },
  ice: { speedMultiplier: 1.3, turnMultiplier: 0.7, description: 'Ice' },
  mogul: { speedMultiplier: 0.9, turnMultiplier: 0.8, description: 'Moguls' },
};
