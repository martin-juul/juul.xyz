// Ludo AI System

import type { GameState, Player, Token, Difficulty } from './types';
import {
  isValidMove,
  calculateNewPosition,
  findTokenAtPosition,
  isSafeSquare,
  isInHomeStretch,
  getRelativePosition,
  getHomeStretchPosition,
} from './game-logic';
import { BOARD_SIZE, HOME_STRETCH_SIZE, ENTRY_POINTS } from './constants';

interface MoveScore {
  tokenId: string;
  score: number;
  reason: string;
}

// Evaluate a move for scoring
function evaluateMove(
  state: GameState,
  token: Token,
  diceValue: number,
  player: Player
): { score: number; reason: string } {
  if (!isValidMove(token, diceValue, player.color)) {
    return { score: -1, reason: 'Invalid move' };
  }

  const newPosition = calculateNewPosition(token, diceValue, player.color);
  let score = 0;
  const bonuses: string[] = [];

  // Base progress score (0-60)
  let progressScore = 0;

  if (token.state === 'home') {
    // Getting a token out is valuable
    progressScore = 15;
    bonuses.push('enter');
  } else if (token.state === 'finished') {
    // Already finished
    return { score: 0, reason: 'Already finished' };
  } else if (isInHomeStretch(token)) {
    // In home stretch - higher priority
    const homePos = getHomeStretchPosition(token);
    const newHomePos = homePos + diceValue;

    if (newHomePos >= HOME_STRETCH_SIZE - 1) {
      // Finishing!
      progressScore = 100;
      bonuses.push('finish');
    } else {
      // Progress in home stretch
      progressScore = 60 + newHomePos * 6;
    }
  } else {
    // On main track
    const currentRelative = getRelativePosition(token.position, player.color);
    const newRelative = getRelativePosition(newPosition, player.color);

    // Check if entering home stretch
    if (newPosition >= BOARD_SIZE) {
      progressScore = 70;
      bonuses.push('homeStretch');
    } else {
      // Normal progress
      progressScore = Math.min(55, newRelative);
    }
  }

  score += progressScore;

  // Capture bonus (0-30)
  if (newPosition < BOARD_SIZE && !isSafeSquare(newPosition)) {
    const targetToken = findTokenAtPosition(state, newPosition, player.color);
    if (targetToken) {
      // Big bonus for capturing
      score += 30;
      bonuses.push('capture');

      // Extra bonus if capturing a token that's close to finishing
      const targetRelative = getRelativePosition(targetToken.position, targetToken.color);
      if (targetRelative > 40) {
        score += 10; // Capturing a token near the end is very valuable
      }
    }
  }

  // Safety evaluation
  if (newPosition < BOARD_SIZE) {
    if (isSafeSquare(newPosition)) {
      // Landing on safe square
      score += 10;
      bonuses.push('safe');
    } else {
      // Check vulnerability - are opponent tokens nearby that could capture us?
      const vulnerabilityPenalty = calculateVulnerability(state, newPosition, player.color);
      score -= vulnerabilityPenalty;
    }
  }

  // Token distribution bonus (prefer having multiple active tokens)
  const activeTokens = player.tokens.filter(t => t.state === 'active').length;
  if (token.state === 'home' && activeTokens < 2) {
    // Bonus for getting more tokens active early game
    score += 10;
  }

  // Blocking bonus - landing where it blocks opponents
  const blockBonus = calculateBlockBonus(state, newPosition, player.color);
  score += blockBonus;

  // Generate reason
  let reason = 'Make progress';
  if (bonuses.includes('finish')) reason = 'Reach the finish!';
  else if (bonuses.includes('capture')) reason = 'Capture opponent!';
  else if (bonuses.includes('enter')) reason = 'Enter the board';
  else if (bonuses.includes('homeStretch')) reason = 'Enter home stretch';
  else if (bonuses.includes('safe')) reason = 'Move to safety';
  else if (blockBonus > 5) reason = 'Block opponents';

  return { score, reason };
}

// Calculate vulnerability (penalty for being in a dangerous position)
function calculateVulnerability(state: GameState, position: number, myColor: string): number {
  let vulnerability = 0;

  for (const player of state.players) {
    if (player.color === myColor) continue;

    for (const token of player.tokens) {
      if (token.state !== 'active') continue;
      if (isInHomeStretch(token)) continue;

      // Check if this token could reach our position in 1-6 moves
      const tokenPos = token.position;
      const distance = (position - tokenPos + BOARD_SIZE) % BOARD_SIZE;

      if (distance > 0 && distance <= 6) {
        // This token is threatening
        vulnerability += (7 - distance) * 2; // Closer = more dangerous
      }
    }
  }

  return Math.min(20, vulnerability); // Cap at 20
}

// Calculate bonus for blocking opponent progress
function calculateBlockBonus(state: GameState, position: number, myColor: string): number {
  let blockBonus = 0;

  // Check if we're landing near opponent entry points
  const entryPoints = Object.values(ENTRY_POINTS);

  for (const entryPoint of entryPoints) {
    if (entryPoint === ENTRY_POINTS[myColor as keyof typeof ENTRY_POINTS]) continue;

    // Landing on or near opponent entry can block them
    const distance = Math.abs(position - entryPoint);
    if (distance <= 2 && !isSafeSquare(position)) {
      blockBonus += 5;
    }
  }

  return blockBonus;
}

// AI decision making
export function decideMove(state: GameState, difficulty: Difficulty): string | null {
  const player = state.players[state.currentPlayer];
  const diceValue = state.dice;

  // Get all valid moves
  const validTokens = player.tokens.filter(t => isValidMove(t, diceValue, player.color));

  if (validTokens.length === 0) return null;

  // Evaluate all moves
  const moveScores: MoveScore[] = validTokens.map(token => {
    const evaluation = evaluateMove(state, token, diceValue, player);
    return {
      tokenId: token.id,
      score: evaluation.score,
      reason: evaluation.reason,
    };
  });

  // Sort by score
  moveScores.sort((a, b) => b.score - a.score);

  // Apply difficulty-based selection
  switch (difficulty) {
    case 'easy':
      // 30% chance of random move, 70% chance of suboptimal move
      if (Math.random() < 0.3) {
        // Completely random
        return validTokens[Math.floor(Math.random() * validTokens.length)].id;
      } else {
        // Sometimes pick from lower scored moves
        const randomIndex = Math.floor(Math.random() * Math.min(3, moveScores.length));
        return moveScores[randomIndex].tokenId;
      }

    case 'medium':
      // 10% chance of not picking the best
      if (Math.random() < 0.1 && moveScores.length > 1) {
        return moveScores[1].tokenId;
      }
      return moveScores[0].tokenId;

    case 'hard':
      // Always pick the best move
      // But if multiple moves have same score, prefer finishing/capturing
      const bestScore = moveScores[0].score;
      const bestMoves = moveScores.filter(m => m.score === bestScore);

      if (bestMoves.length > 1) {
        // Prefer captures and finishes among equal moves
        for (const move of bestMoves) {
          const token = player.tokens.find(t => t.id === move.tokenId);
          if (token) {
            const newPos = calculateNewPosition(token, diceValue, player.color);
            // Check for finish
            if (newPos >= BOARD_SIZE + HOME_STRETCH_SIZE - 1) {
              return move.tokenId;
            }
            // Check for capture
            if (newPos < BOARD_SIZE && !isSafeSquare(newPos)) {
              const target = findTokenAtPosition(state, newPos, player.color);
              if (target) return move.tokenId;
            }
          }
        }
      }

      return moveScores[0].tokenId;

    default:
      return moveScores[0].tokenId;
  }
}

// Get AI move message
export function getAIMoveMessage(
  state: GameState,
  tokenId: string,
  diceValue: number,
  lang: 'en' | 'da'
): string {
  const player = state.players[state.currentPlayer];
  const token = player.tokens.find(t => t.id === tokenId);

  if (!token) return '';

  const newPosition = calculateNewPosition(token, diceValue, player.color);

  if (token.state === 'home') {
    return lang === 'en'
      ? `${player.name} enters the board with a 6!`
      : `${player.name} kommer på brættet med en 6'er!`;
  }

  if (newPosition >= BOARD_SIZE + HOME_STRETCH_SIZE - 1) {
    return lang === 'en'
      ? `${player.name}'s token reaches the finish!`
      : `${player.name}s brik når i mål!`;
  }

  // Check for capture
  if (newPosition < BOARD_SIZE && !isSafeSquare(newPosition)) {
    const target = findTokenAtPosition(state, newPosition, player.color);
    if (target) {
      return lang === 'en'
        ? `${player.name} captures ${target.color}!`
        : `${player.name} slår ${target.color}!`;
    }
  }

  if (newPosition >= BOARD_SIZE && token.position < BOARD_SIZE) {
    return lang === 'en'
      ? `${player.name} enters the home stretch!`
      : `${player.name} kommer ind i mål-strækningen!`;
  }

  return '';
}
