export type CellType = 'empty' | 'wall' | 'building-h' | 'building-v' | 'trapped';

export type Ball = {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  color: string;
};

export type GameState = 'idle' | 'playing' | 'building' | 'won' | 'lost';

export type BuildDirection = 'horizontal' | 'vertical';

export type GameData = {
  grid: CellType[][];
  balls: Ball[];
  lives: number;
  level: number;
  percentageCleared: number;
  highScore: number;
  gameState: GameState;
  buildDirection: BuildDirection;
  buildStart: { row: number; col: number } | null;
  buildProgress: number;
  ballsHit: number;
};
