// Ludo Stats Persistence

import type { LudoStats } from './types';

const LUDO_STATS_KEY = 'ludo-stats';

// Create default stats object
export function createDefaultStats(): LudoStats {
  return {
    gamesPlayed: 0,
    gamesWon: 0,
    gamesWonByDifficulty: { easy: 0, medium: 0, hard: 0 },
    tokensFinished: 0,
    tokensCaptured: 0,
    tokensLost: 0,
    currentStreak: 0,
    bestStreak: 0,
    hasPlayedBefore: false,
  };
}

// Load stats from localStorage
export function loadStats(): LudoStats {
  try {
    const saved = localStorage.getItem(LUDO_STATS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load Ludo stats:', error);
  }
  return createDefaultStats();
}

// Save stats to localStorage
export function saveStats(stats: LudoStats): void {
  try {
    localStorage.setItem(LUDO_STATS_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error('Failed to save Ludo stats:', error);
  }
}

// Update stats after a game
export function updateStats(
  stats: LudoStats,
  won: boolean,
  difficulty: 'easy' | 'medium' | 'hard',
  tokensFinished: number,
  tokensCaptured: number,
  tokensLost: number
): LudoStats {
  const newStats = { ...stats };

  // Update game counts
  newStats.gamesPlayed += 1;

  if (won) {
    newStats.gamesWon += 1;
    newStats.gamesWonByDifficulty[difficulty] += 1;
    newStats.currentStreak += 1;

    // Update best streak
    if (newStats.currentStreak > newStats.bestStreak) {
      newStats.bestStreak = newStats.currentStreak;
    }
  } else {
    newStats.currentStreak = 0;
  }

  // Update token counts
  newStats.tokensFinished += tokensFinished;
  newStats.tokensCaptured += tokensCaptured;
  newStats.tokensLost += tokensLost;

  // Mark as played
  newStats.hasPlayedBefore = true;

  return newStats;
}
