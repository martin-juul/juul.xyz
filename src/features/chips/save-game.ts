// Save game management for Chips Challenge

import type { SavedGame } from './types';

const STORAGE_KEY = 'chips_savegame';
const AUTO_SAVE_KEY = 'chips_autosave';

/**
 * Save game state to localStorage
 */
export function saveGame(gameState: SavedGame): boolean {
  try {
    const data = JSON.stringify(gameState);
    localStorage.setItem(STORAGE_KEY, data);
    return true;
  } catch {
    return false; // Quota exceeded or other error
  }
}

/**
 * Auto-save game state (for quick recovery)
 */
export function autoSaveGame(gameState: SavedGame): boolean {
  try {
    const data = JSON.stringify(gameState);
    localStorage.setItem(AUTO_SAVE_KEY, data);
    return true;
  } catch {
    return false;
  }
}

/**
 * Load saved game from localStorage
 */
export function loadSavedGame(): SavedGame | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const gameState = JSON.parse(saved) as SavedGame;
      // Validate the saved game has required fields
      if (gameState.currentLevel && gameState.grid && gameState.playerPosition) {
        return gameState;
      }
    }
  } catch {
    // Ignore errors
  }
  return null;
}

/**
 * Load auto-saved game
 */
export function loadAutoSave(): SavedGame | null {
  try {
    const saved = localStorage.getItem(AUTO_SAVE_KEY);
    if (saved) {
      const gameState = JSON.parse(saved) as SavedGame;
      if (gameState.currentLevel && gameState.grid && gameState.playerPosition) {
        return gameState;
      }
    }
  } catch {
    // Ignore errors
  }
  return null;
}

/**
 * Check if a saved game exists
 */
export function hasSavedGame(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null;
}

/**
 * Check if an auto-save exists
 */
export function hasAutoSave(): boolean {
  return localStorage.getItem(AUTO_SAVE_KEY) !== null;
}

/**
 * Delete saved game
 */
export function deleteSavedGame(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore errors
  }
}

/**
 * Delete auto-save
 */
export function deleteAutoSave(): void {
  try {
    localStorage.removeItem(AUTO_SAVE_KEY);
  } catch {
    // Ignore errors
  }
}

/**
 * Get saved game metadata (without loading full state)
 */
export function getSavedGameInfo(): { level: number; savedAt: number } | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const gameState = JSON.parse(saved) as SavedGame;
      return {
        level: gameState.currentLevel,
        savedAt: gameState.savedAt,
      };
    }
  } catch {
    // Ignore errors
  }
  return null;
}
