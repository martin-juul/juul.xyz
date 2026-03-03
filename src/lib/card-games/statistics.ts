// Statistics utilities for card games

import { type GameStats } from './types';

/**
 * Load game statistics from localStorage
 */
export function loadStats(storageKey: string): GameStats {
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // Ignore errors
  }
  return { gamesPlayed: 0, gamesWon: 0, currentStreak: 0, bestStreak: 0 };
}

/**
 * Save game statistics to localStorage
 */
export function saveStats(storageKey: string, stats: GameStats): void {
  try {
    localStorage.setItem(storageKey, JSON.stringify(stats));
  } catch {
    // Ignore errors
  }
}

/**
 * Record a game as played (call on first move)
 */
export function recordGamePlayed(stats: GameStats): GameStats {
  return {
    ...stats,
    gamesPlayed: stats.gamesPlayed + 1,
  };
}

/**
 * Record a game as won
 */
export function recordGameWon(stats: GameStats): GameStats {
  const newStreak = stats.currentStreak + 1;
  return {
    ...stats,
    gamesWon: stats.gamesWon + 1,
    currentStreak: newStreak,
    bestStreak: Math.max(stats.bestStreak, newStreak),
  };
}

/**
 * Reset statistics
 */
export function resetStats(): GameStats {
  return { gamesPlayed: 0, gamesWon: 0, currentStreak: 0, bestStreak: 0 };
}
