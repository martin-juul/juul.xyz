// High score tracking for Chips Challenge

import type { HighScores } from './types';

const STORAGE_KEY = 'chips_highscores';

/**
 * Load high scores from localStorage
 */
export function loadHighScores(): HighScores {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // Ignore errors
  }
  return {};
}

/**
 * Save high scores to localStorage
 */
export function saveHighScores(scores: HighScores): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
  } catch {
    // Ignore errors (quota exceeded, etc.)
  }
}

/**
 * Update high score for a level
 * Returns true if a new record was set
 */
export function updateHighScore(
  scores: HighScores,
  levelNumber: number,
  time: number,
  moves: number
): { updatedScores: HighScores; newRecord: boolean; newTimeRecord: boolean; newMovesRecord: boolean } {
  const current = scores[levelNumber];

  if (!current) {
    // First completion of this level
    const updatedScores = {
      ...scores,
      [levelNumber]: { bestTime: time, bestMoves: moves },
    };
    saveHighScores(updatedScores);
    return { updatedScores, newRecord: true, newTimeRecord: true, newMovesRecord: true };
  }

  let newTimeRecord = false;
  let newMovesRecord = false;

  const newBestTime = Math.min(current.bestTime, time);
  const newBestMoves = Math.min(current.bestMoves, moves);

  if (time < current.bestTime) newTimeRecord = true;
  if (moves < current.bestMoves) newMovesRecord = true;

  const updatedScores = {
    ...scores,
    [levelNumber]: {
      bestTime: newBestTime,
      bestMoves: newBestMoves,
    },
  };

  saveHighScores(updatedScores);
  return {
    updatedScores,
    newRecord: newTimeRecord || newMovesRecord,
    newTimeRecord,
    newMovesRecord,
  };
}

/**
 * Get high score for a specific level
 */
export function getLevelHighScore(scores: HighScores, levelNumber: number): { bestTime: number; bestMoves: number } | null {
  return scores[levelNumber] || null;
}

/**
 * Reset all high scores
 */
export function resetHighScores(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore errors
  }
}

/**
 * Get total statistics across all levels
 */
export function getTotalStats(scores: HighScores): {
  levelsCompleted: number;
  totalBestTime: number;
  totalBestMoves: number;
} {
  const levelsCompleted = Object.keys(scores).length;
  const totalBestTime = Object.values(scores).reduce((sum, s) => sum + s.bestTime, 0);
  const totalBestMoves = Object.values(scores).reduce((sum, s) => sum + s.bestMoves, 0);

  return { levelsCompleted, totalBestTime, totalBestMoves };
}
