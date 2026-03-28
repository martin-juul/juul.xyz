import type { ObstacleType } from './types';

// Color palette for sprites
const COLORS = {
  // Skin tones
  skinLight: '#ffd93d',
  skinMedium: '#e8b84a',

  // Clothing
  jacketRed: '#e74c3c',
  jacketDarkRed: '#c0392b',
  jacketBlue: '#3498db',
  jacketDarkBlue: '#2980b9',
  jacketGreen: '#2ecc71',
  jacketDarkGreen: '#27ae60',
  jacketPurple: '#9b59b6',
  jacketDarkPurple: '#8e44ad',

  // Snow pants
  pantsBlack: '#2c3e50',
  pantsGray: '#7f8c8d',
  pantsBlue: '#34495e',

  // Snow/ice
  snowWhite: '#ffffff',
  snowLight: '#f0f3f4',
  snowShadow: '#d5dbdb',

  // Nature
  treeGreen: '#27ae60',
  treeDarkGreen: '#1e8449',
  treeBrown: '#8b4513',
  bushGreen: '#2ecc71',
  bushDarkGreen: '#27ae60',
  berryRed: '#e74c3c',

  // Rocks
  rockGray: '#95a5a6',
  rockDarkGray: '#7f8c8d',
  rockLight: '#bdc3c7',

  // Yeti
  yetiWhite: '#ecf0f1',
  yetiLightGray: '#d5dbdb',
  yetiFace: '#fadbd8',

  // Misc
  skiBrown: '#a0522d',
  shadow: 'rgba(0, 0, 0, 0.3)',
};

// Draw a pixel sprite from a string array
export function drawPixelSprite(
  ctx: CanvasRenderingContext2D,
  pixels: string[] | string[][],
  x: number,
  y: number,
  scale: number = 1,
  flip: boolean = false
) {
  // Convert 1D array to 2D if needed
  const pixelArray = typeof pixels[0] === 'string'
    ? (pixels as string[]).map(row => [row])
    : pixels as string[][];

  const height = pixelArray.length;
  const width = pixelArray[0][0].length;

  ctx.save();
  ctx.translate(x, y);

  if (flip) {
    ctx.scale(-1, 1);
  }

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const colorCode = pixelArray[row][0][col];
      if (colorCode !== '.') {
        ctx.fillStyle = getColorFromCode(colorCode);
        ctx.fillRect(
          (col - width / 2) * scale,
          (row - height / 2) * scale,
          scale,
          scale
        );
      }
    }
  }

  ctx.restore();
}

function getColorFromCode(code: string): string {
  const colorMap: Record<string, string> = {
    // Skin
    '1': COLORS.skinLight,
    '2': COLORS.skinMedium,

    // Red jacket
    'R': COLORS.jacketRed,
    'r': COLORS.jacketDarkRed,

    // Blue jacket
    'B': COLORS.jacketBlue,
    'b': COLORS.jacketDarkBlue,

    // Green jacket
    'G': COLORS.jacketGreen,
    'g': COLORS.jacketDarkGreen,

    // Purple jacket
    'P': COLORS.jacketPurple,
    'p': COLORS.jacketDarkPurple,

    // Pants
    'L': COLORS.pantsBlack,
    'l': COLORS.pantsGray,
    'D': COLORS.pantsBlue,

    // Snow
    'W': COLORS.snowWhite,
    'w': COLORS.snowLight,
    's': COLORS.snowShadow,

    // Trees
    'T': COLORS.treeGreen,
    't': COLORS.treeDarkGreen,
    'K': COLORS.treeBrown,
    'k': COLORS.treeBrown,

    // Bushes
    'U': COLORS.bushGreen,
    'u': COLORS.bushDarkGreen,
    'E': COLORS.berryRed,

    // Rocks
    'Y': COLORS.rockGray,
    'y': COLORS.rockDarkGray,
    'z': COLORS.rockLight,

    // Yeti
    'F': COLORS.yetiWhite,
    'f': COLORS.yetiLightGray,
    'A': COLORS.yetiFace,

    // Skis
    'I': COLORS.skiBrown,
    'i': COLORS.skiBrown,
  };

  return colorMap[code] || COLORS.snowWhite;
}

// Player sprites
const PLAYER_STRAIGHT = [
  ['.....11.....'],
  ['....RRRR....'],
  ['...RRRRRR...'],
  ['..RWWWWWWWR..'],
  ['.RRRWWWWWRrR.'],
  ['.RRRWWWWWRrR.'],
  ['..RRRRRRRRrR..'],
  ['...RRRRRrRRR.'],
  ['....RRRrRRRR.'],
  ['...LLLLL.....'],
  ['..LLLLLLL....'],
  ['.LLLLLLLLL...'],
  ['..LLWWLL.....'],
  ['..LLLLLL.....'],
  ['...LLLLL.....'],
  ['..III...III..'],
];

const PLAYER_LEFT = [
  '..11.......',
  '.RRRR......',
  '..RRRRRR...',
  '.RWWWWWWWR..',
  'RRRWWWWWRrR.',
  'RRRRRRRRrR..',
  '.RRRRRrRRR.',
  '..RRRrRRRR.',
  '...LLLLL...',
  '..LLLLLLL...',
  '.LLLLLLLLL..',
  '..LLWWLL....',
  '..LLLLLL....',
  '...LLLLL....',
  '.III...III..',
];

const PLAYER_RIGHT = [
  '.......11..',
  '......RRRR.',
  '...RRRRRR..',
  '..RWWWWWWWR.',
  '.RRRWWWWWRrR',
  '..RRRRRRRRrR',
  '.RRRRRrRRR.',
  '..RRRrRRRR.',
  '...LLLLL...',
  '..LLLLLLL...',
  '.LLLLLLLLL..',
  '..LLWWLL....',
  '..LLLLLL....',
  '...LLLLL....',
  '..III...III.',
];

const PLAYER_JUMP = [
  '....11.....',
  '...RRRR....',
  '...WWWWWW..',
  '..RRRRRRRR..',
  '.RRRRWWWWWR.',
  '.RRRRWWWWWR.',
  '..RRRRRRRR..',
  '..LWWWWWWL..',
  '...LLLLL....',
  '..LLLLLLL...',
  '.....II....',
  '....II.II...',
];

const PLAYER_CRASH = [
  '..11...RRR.',
  '.RRRR.RRRR.',
  '.RRRRRRRRR.',
  'RWWWWWWWWWR',
  'RRRRRRRRRRR',
  'RWWWWWWWWWW',
  '.RRRRRRRRR.',
  '..LLLLLLL..',
  '.LLLLLLLLL.',
  '.LLLWWLLLL.',
  '..LLLLLL...',
  '.II....II..',
];

// Tree sprites (different variations)
const TREE_PINE_1 = [
  '....tttt....',
  '...tttttt...',
  '..tttttttt..',
  '..tKtKtKtK..',
  '.tttKtKtKtt.',
  '.tttKtKtKtt.',
  '..tttttttt..',
  '..tKtKtKtK..',
  '.tttKtKtKtt.',
  '.tttKtKtKtt.',
  '..ttKKKKtt..',
  '...KKKKKK...',
  '...KKKKKK...',
  '....KKKK....',
];

const TREE_PINE_2 = [
  '.....TT.....',
  '...TTTTT....',
  '..TTTTTTT...',
  '..TTKTKTKT..',
  '.TTTKTKTKTT.',
  '.TTTKTKTKTT.',
  '..TTTTTTTT..',
  '..TTKTKTKT..',
  '.TTTKTKTKTT.',
  '.TTTKTKTKTT.',
  '..TTKKKKTT..',
  '...KKKKKK...',
  '...KKKKKK...',
  '....KKKK....',
];

const TREE_DECIDUOUS = [
  '...TTTT....',
  '..TTTTTT...',
  '.TTTTTTTTT.',
  '.TTtTTtTTt.',
  'TTtTTtTTtTT',
  'TTtTTtTTtTT',
  '.TTTTTTTTT.',
  '...KKKK....',
  '...KKKK....',
  '...KKKK....',
  '...KKKK....',
  '...KKKK....',
  '...KKKK....',
];

// Rock sprites
const ROCK_SMALL = [
  '.yyy.',
  'yYyYy',
  'YYYYY',
  'YzYzY',
  '.yyy.',
];

const ROCK_MEDIUM = [
  '..yyyyy..',
  '.yYyYyYy.',
  'yYYYYYYYy',
  'YYYYYYYYY',
  'YzYzYzYzY',
  '.yyyyyyy.',
  '..yyyyy..',
];

const ROCK_LARGE = [
  '...yyyyy...',
  '..yYyYyYy..',
  '.yYYYYYYYy.',
  'yYYYYYYYYYy',
  'YYYYYYYYYYY',
  'YzYzYzYzYzY',
  '.yyyyyyyyy.',
  '..yyyyyyy..',
  '...yyyyy...',
];

// Bush sprites
const BUSH_SMALL = [
  '.UuU.',
  'uUuUu',
  'UUUEU',
  'uUuUu',
  '.UuU.',
];

const BUSH_MEDIUM = [
  '..UuUu..',
  '.uUuEuUu.',
  'UuUUUuUuU',
  'uUuUUuUu',
  '.uUuUu.',
  '..UuU..',
];

const BUSH_BERRY = [
  '..UuE..',
  '.uUEEu.',
  'UuEUEuU',
  '.uUEEu.',
  '..UuE..',
];

// Dog sprites
const DOG_RUNNING_1 = [
  '..kKKK....',
  '.kKKKk...',
  'kKKKKKk..',
  'KKK.1KKK.',
  'KKK11KKK.',
  'kKKKKKk..',
  '.kKKk....',
  '..kk..kk.',
  '...kk.kk.',
];

const DOG_RUNNING_2 = [
  '...kKKK...',
  '..kKKKk..',
  '.kKKKKKk.',
  'KKK.1KKKK',
  'KKK11KKK.',
  'kKKKKKk..',
  '.kKKk....',
  '..kk...kk.',
  '....kk.kk.',
];

// Snowboarder sprites
const SNOWBOARDER_1 = [
  '....11....',
  '...BBBB...',
  '..BBBBBB...',
  '..BB11BB..',
  '.BBBBBB.',
  '..BBBB..',
  '..IIII..',
];

const SNOWBOARDER_2 = [
  '...11.....',
  '...BBBB...',
  '..BBBBBB..',
  '..BB11BB..',
  '.BBBBBB.',
  '..BBBB..',
  '.IIIIII.',
];

// Yeti sprite
const YETI = [
  '.......F.......',
  '......FFF......',
  '.....FFFFF.....',
  '....FFFFFFF....',
  '...F.AAA.AF...',
  '..FF.A1.A.FF..',
  '..FFF.FFF.FFF..',
  '.FFFFF.FFFFFF.',
  '.FFFFFFFFFFF.',
  'FF.FFFFFFFF.FF',
  'FFF.FFFFFF.FFF',
  'FFFFFFFFFFF.',
  '.FF.....FF.',
  '..F.....F..',
];

// Stump sprite
const STUMP = [
  '..KKK..',
  '.KKKKK.',
  'KKKKKKK',
  'KWWWWK',
  'KWWWWK',
  'KKKKKKK',
  'KKKKKKK',
];

// Ice patch sprite
const ICE_PATCH = [
  '.wwwww.',
  'wWwWwWw',
  'WWwWwWW',
  'wWwWwWw',
  'WwWwWwW',
  '.wwwww.',
];

// Ramp sprite
const RAMP = [
  '..sss..',
  '.sssss.',
  '.ssWss.',
  'ssWWWWss',
  'sWWWWWWs',
  'sWWWWWWs',
];

// Sign sprite
const SIGN = [
  '..KKK..',
  '.KWWWK.',
  'KWW.WWK',
  'KWW.WWK',
  'KWW.WWK',
  '.KWWWK.',
  '..KKK..',
  '..K...',
  '..KKK..',
  '.KKKKK.',
  '..KKK..',
];

// NPC skier sprites
const SKIER_NPC_1 = [
  '....11.....',
  '...PPPP....',
  '...PPPP....',
  '..PPPPPP...',
  '.PPPPPPPrR.',
  '..PPPPPrR..',
  '...LLLL....',
  '..LLLLLL...',
  '.LLLLLLLL...',
  '..LLLLLL....',
  '..III...III.',
];

const SKIER_NPC_2 = [
  '....11.....',
  '...GGGG....',
  '...GGGG....',
  '..GGGGGG...',
  '.GGGGGGGgG.',
  '..GGGGGgG..',
  '...LLLL....',
  '..LLLLLL...',
  '.LLLLLLLL...',
  '..LLLLLL....',
  '...III.III..',
];

// Shadow sprites
const SHADOW_SMALL = [
  'yyyyy',
  'YYYYY',
  'YYYYY',
];

const SHADOW_MEDIUM = [
  '.yyyyyyy.',
  'yYYYYYYYy',
  'YYYYYYYYY',
  'yYYYYYYYy',
  '.yyyyyyy.',
];

const SHADOW_LARGE = [
  '..yyyyyyy..',
  '.yYYYYYYYy.',
  'yYYYYYYYYYy',
  'YYYYYYYYYYY',
  'yYYYYYYYYYy',
  '.yYYYYYYYy.',
  '..yyyyyyy..',
];

export function drawPlayer(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  vx: number,
  inAir: boolean,
  crashed: boolean,
  scale: number = 2
) {
  if (crashed) {
    drawPixelSprite(ctx, PLAYER_CRASH, x, y, scale, false);
  } else if (inAir) {
    drawPixelSprite(ctx, PLAYER_JUMP, x, y, scale, false);
  } else if (vx < -50) {
    drawPixelSprite(ctx, PLAYER_LEFT, x, y, scale, false);
  } else if (vx > 50) {
    drawPixelSprite(ctx, PLAYER_RIGHT, x, y, scale, true);
  } else {
    drawPixelSprite(ctx, PLAYER_STRAIGHT, x, y, scale, false);
  }
}

export function drawTree(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number = 2
) {
  const variations = [TREE_PINE_1, TREE_PINE_2, TREE_DECIDUOUS];
  const index = Math.floor(Math.abs(x) % variations.length);
  drawPixelSprite(ctx, variations[index], x, y, scale, false);
}

export function drawRock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number = 2
) {
  const variations = [ROCK_SMALL, ROCK_MEDIUM, ROCK_LARGE];
  const index = Math.floor(Math.abs(x) % variations.length);
  drawPixelSprite(ctx, variations[index], x, y, scale, false);
}

export function drawBush(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number = 2
) {
  const variations = [BUSH_SMALL, BUSH_MEDIUM, BUSH_BERRY];
  const index = Math.floor(Math.abs(x) % variations.length);
  drawPixelSprite(ctx, variations[index], x, y, scale, false);
}

export function drawDog(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  frame: number,
  scale: number = 2
) {
  const sprite = frame % 2 === 0 ? DOG_RUNNING_1 : DOG_RUNNING_2;
  drawPixelSprite(ctx, sprite, x, y, scale, false);
}

export function drawSnowboarder(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  frame: number,
  scale: number = 2
) {
  const sprite = frame % 2 === 0 ? SNOWBOARDER_1 : SNOWBOARDER_2;
  drawPixelSprite(ctx, sprite, x, y, scale, false);
}

export function drawYeti(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  frame: number,
  scale: number = 2
) {
  // Add slight wobble to yeti
  const wobble = Math.sin(frame * 0.1) * 2;
  drawPixelSprite(ctx, YETI, x + wobble, y, scale, false);
}

export function drawStump(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number = 2
) {
  drawPixelSprite(ctx, STUMP, x, y, scale, false);
}

export function drawIcePatch(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number = 2
) {
  drawPixelSprite(ctx, ICE_PATCH, x, y, scale, false);
}

export function drawRamp(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number = 2
) {
  drawPixelSprite(ctx, RAMP, x, y, scale, false);
}

export function drawSign(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number = 2
) {
  drawPixelSprite(ctx, SIGN, x, y, scale, false);
}

export function drawNpcSkier(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  frame: number,
  scale: number = 2
) {
  const sprite = frame % 2 === 0 ? SKIER_NPC_1 : SKIER_NPC_2;
  drawPixelSprite(ctx, sprite, x, y, scale, false);
}

export function drawShadow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: 'small' | 'medium' | 'large',
  scale: number = 2
) {
  const shadowMap = {
    small: SHADOW_SMALL,
    medium: SHADOW_MEDIUM,
    large: SHADOW_LARGE,
  };
  drawPixelSprite(ctx, shadowMap[size], x, y, scale, false);
}

// Obstacle drawing dispatcher
export function drawObstacle(
  ctx: CanvasRenderingContext2D,
  type: ObstacleType,
  x: number,
  y: number,
  frame: number = 0,
  scale: number = 2
) {
  switch (type) {
    case 'tree':
      drawTree(ctx, x, y, scale);
      break;
    case 'rock':
      drawRock(ctx, x, y, scale);
      break;
    case 'bush':
      drawBush(ctx, x, y, scale);
      break;
    case 'dog':
      drawDog(ctx, x, y, frame, scale);
      break;
    case 'snowboarder':
      drawSnowboarder(ctx, x, y, frame, scale);
      break;
    case 'stump':
      drawStump(ctx, x, y, scale);
      break;
    case 'ice-patch':
      drawIcePatch(ctx, x, y, scale);
      break;
    case 'ramp':
      drawRamp(ctx, x, y, scale);
      break;
    case 'sign':
      drawSign(ctx, x, y, scale);
      break;
    case 'skier':
      drawNpcSkier(ctx, x, y, frame, scale);
      break;
  }
}
