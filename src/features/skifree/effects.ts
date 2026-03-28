import type { TrailPoint, Particle, GameData } from './types';
import { TRAIL_FADE_TIME, MAX_PARTICLES, MAX_TRAIL_POINTS, CANVAS_WIDTH, CANVAS_HEIGHT } from './constants';

// Trail system
export function addTrailPoint(trails: TrailPoint[], x: number, y: number, speed: number): TrailPoint[] {
  const now = Date.now();
  const width = 3 + Math.min(speed / 100, 5); // Trail gets wider with speed

  const newTrail: TrailPoint = {
    x,
    y,
    time: now,
    speed,
    width,
  };

  const updatedTrails = [...trails, newTrail];

  // Remove old trail points
  return updatedTrails.filter(point => now - point.time < TRAIL_FADE_TIME).slice(-MAX_TRAIL_POINTS);
}

export function updateTrails(trails: TrailPoint[]): TrailPoint[] {
  const now = Date.now();
  return trails.filter(point => now - point.time < TRAIL_FADE_TIME);
}

export function renderTrails(ctx: CanvasRenderingContext2D, trails: TrailPoint[], viewportOffsetY: number) {
  const now = Date.now();

  for (let i = 1; i < trails.length; i++) {
    const prev = trails[i - 1];
    const curr = trails[i];

    // Convert world coordinates to screen coordinates
    const prevY = prev.y - viewportOffsetY;
    const currY = curr.y - viewportOffsetY;

    // Skip if off screen
    if (prevY < -50 || prevY > CANVAS_HEIGHT + 50) continue;
    if (currY < -50 || currY > CANVAS_HEIGHT + 50) continue;

    // Calculate opacity based on age
    const age = now - curr.time;
    const opacity = 1 - (age / TRAIL_FADE_TIME);

    if (opacity <= 0) continue;

    // Draw trail segment
    ctx.beginPath();
    ctx.moveTo(prev.x, prevY);
    ctx.lineTo(curr.x, currY);

    // Trail color and style based on speed
    const trailColor = curr.speed > 350 ? 'rgba(200, 220, 255,' : 'rgba(180, 200, 220,';
    ctx.strokeStyle = trailColor + opacity + ')';
    ctx.lineWidth = curr.width * opacity;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  }
}

// Particle system
export function createParticle(
  x: number,
  y: number,
  type: 'snow' | 'sparkle' | 'crash' | 'trail',
  vx: number = 0,
  vy: number = 0
): Particle {
  return {
    id: `particle-${Date.now()}-${Math.random()}`,
    x,
    y,
    vx: vx + (Math.random() - 0.5) * 50,
    vy: vy + (Math.random() - 0.5) * 50,
    life: 0,
    maxLife: type === 'crash' ? 1000 : type === 'sparkle' ? 500 : 2000,
    type,
    color: getParticleColor(type),
    size: Math.random() * 3 + 1,
  };
}

function getParticleColor(type: string): string {
  switch (type) {
    case 'snow':
      return 'rgba(255, 255, 255,';
    case 'sparkle':
      return 'rgba(200, 230, 255,';
    case 'crash':
      return 'rgba(255, 200, 150,';
    case 'trail':
      return 'rgba(200, 220, 240,';
    default:
      return 'rgba(255, 255, 255,';
  }
}

export function updateParticles(particles: Particle[], deltaTime: number): Particle[] {
  const updatedParticles = particles
    .map(p => ({
      ...p,
      x: p.x + p.vx * deltaTime,
      y: p.y + p.vy * deltaTime,
      vy: p.vy + 100 * deltaTime, // Gravity
      life: p.life + deltaTime * 1000,
    }))
    .filter(p => p.life < p.maxLife);

  return updatedParticles.slice(-MAX_PARTICLES);
}

export function renderParticles(ctx: CanvasRenderingContext2D, particles: Particle[], viewportOffsetY: number) {
  for (const particle of particles) {
    const screenY = particle.y - viewportOffsetY;

    // Skip if off screen
    if (screenY < -10 || screenY > CANVAS_HEIGHT + 10) continue;

    const opacity = 1 - (particle.life / particle.maxLife);
    if (opacity <= 0) continue;

    ctx.fillStyle = particle.color + opacity + ')';
    ctx.beginPath();
    ctx.arc(particle.x, screenY, particle.size * opacity, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function createCrashParticles(x: number, y: number, count: number = 20): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 200 + 100;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed - 100;
    particles.push(createParticle(x, y, 'crash', vx, vy));
  }
  return particles;
}

// Snow texture
const snowTextureCache: { [key: string]: HTMLCanvasElement } = {};

export function getSnowTexture(width: number, height: number): HTMLCanvasElement {
  const key = `${width}x${height}`;
  if (snowTextureCache[key]) {
    return snowTextureCache[key];
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Base white
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Add subtle texture
  for (let i = 0; i < 500; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const brightness = Math.random() * 20 + 235;
    ctx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness + 10})`;
    ctx.fillRect(x, y, 2, 2);
  }

  // Add sparkles
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    ctx.fillStyle = 'rgba(200, 230, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(x, y, Math.random() * 2 + 1, 0, Math.PI * 2);
    ctx.fill();
  }

  snowTextureCache[key] = canvas;
  return canvas;
}

// Snow overlay (falling snow effect)
export function renderSnowOverlay(ctx: CanvasRenderingContext2D, time: number) {
  const snowflakeCount = 100;
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;

  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';

  for (let i = 0; i < snowflakeCount; i++) {
    // Use deterministic positions based on time and index
    const speed = (i % 3 + 1) * 0.05;
    const x = ((i * 137.5 + time * speed * 50) % width);
    const y = ((i * 73.7 + time * speed * 30) % height);
    const size = (i % 3) + 1;

    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Shadow rendering
export function renderShadow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  opacity: number = 0.3
) {
  ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
  ctx.beginPath();
  ctx.ellipse(x, y + height / 2, width / 2, height / 6, 0, 0, Math.PI * 2);
  ctx.fill();
}

// Speed lines
export function renderSpeedLines(ctx: CanvasRenderingContext2D, speed: number, time: number) {
  if (speed < 350) return;

  const lineCount = Math.floor((speed - 350) / 20);
  const opacity = (speed - 350) / 150;

  ctx.strokeStyle = `rgba(200, 220, 255, ${opacity * 0.5})`;
  ctx.lineWidth = 1;

  for (let i = 0; i < lineCount; i++) {
    const x = (i * 47 + time * speed * 0.5) % CANVAS_WIDTH;
    const length = (speed - 300) / 20;

    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x - length * 0.3, length);
    ctx.stroke();
  }
}

// Fog effect at high distances
export function renderFog(ctx: CanvasRenderingContext2D, distance: number) {
  if (distance < 1500) return;

  const fogIntensity = Math.min((distance - 1500) / 500, 0.5);

  // Gradient overlay from top
  const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT / 2);
  gradient.addColorStop(0, `rgba(200, 210, 220, ${fogIntensity})`);
  gradient.addColorStop(1, 'rgba(200, 210, 220, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT / 2);
}

// Screen shake effect
export function renderScreenShake(ctx: CanvasRenderingContext2D, intensity: number, time: number) {
  if (intensity <= 0) return;

  const shakeX = Math.sin(time * 50) * intensity;
  const shakeY = Math.cos(time * 50) * intensity;

  ctx.translate(shakeX, shakeY);
}

// Ground texture with depth
export function renderGroundTexture(ctx: CanvasRenderingContext2D, distance: number) {
  // Subtle gradient based on distance for depth effect
  const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  const brightness = Math.max(0.95 - distance / 10000, 0.85);

  gradient.addColorStop(0, `rgb(${255 * brightness}, ${255 * brightness}, ${255 * brightness})`);
  gradient.addColorStop(1, `rgb(${255 * brightness * 0.95}, ${255 * brightness * 0.95}, ${255 * brightness * 0.95})`);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}
