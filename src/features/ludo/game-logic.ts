// Ludo Game Logic

import type { GameState, Player, Token, PlayerColor, Hint } from './types';
import {
  BOARD_SIZE,
  HOME_STRETCH_SIZE,
  TOKENS_PER_PLAYER,
  ENTRY_POINTS,
  SAFE_SQUARES,
  COLORED_ENTRY_SQUARES,
  HOME_STRETCH_ENTRY,
  PLAYER_COLORS,
  MAX_CONSECUTIVE_SIXES,
} from './constants';

// Create initial token for a player
export function createToken(color: PlayerColor, index: number): Token {
  return {
    id: `${color}-${index}`,
    color,
    state: 'home',
    position: -1,
  };
}

// Create initial player
export function createPlayer(
  id: number,
  color: PlayerColor,
  isHuman: boolean,
  difficulty?: 'easy' | 'medium' | 'hard'
): Player {
  return {
    id,
    color,
    name: color.charAt(0).toUpperCase() + color.slice(1),
    isHuman,
    difficulty,
    tokens: Array.from({ length: TOKENS_PER_PLAYER }, (_, i) => createToken(color, i)),
    finishedTokens: 0,
    consecutiveSixes: 0,
  };
}

// Create initial game state
export function createInitialGameState(difficulty: 'easy' | 'medium' | 'hard'): GameState {
  const players: Player[] = [
    createPlayer(0, 'red', true), // Human player
    createPlayer(1, 'green', false, difficulty),
    createPlayer(2, 'yellow', false, difficulty),
    createPlayer(3, 'blue', false, difficulty),
  ];

  return {
    players,
    currentPlayer: 0,
    phase: 'rolling',
    dice: 1,
    diceRolled: false,
    lastRoll: null,
    movableTokens: [],
    winner: null,
    turnCount: 1,
    hints: [],
    hintsEnabled: true,
    turnMessage: null,
  };
}

// Roll a single die
export function rollDie(): number {
  return Math.floor(Math.random() * 6) + 1;
}

// Convert absolute position to player-relative position
// This helps determine where a token is in relation to its home stretch
export function getRelativePosition(absolutePos: number, color: PlayerColor): number {
  const entryPoint = ENTRY_POINTS[color];

  if (absolutePos >= entryPoint) {
    return absolutePos - entryPoint;
  } else {
    return BOARD_SIZE - entryPoint + absolutePos;
  }
}

// Check if a position is safe
export function isSafeSquare(position: number): boolean {
  return SAFE_SQUARES.includes(position);
}

// Check if a position is a colored entry square (always safe)
export function isColoredEntrySquare(position: number): boolean {
  return Object.values(COLORED_ENTRY_SQUARES).includes(position);
}

// Get the home stretch entry point for a color
export function getHomeStretchEntryPoint(color: PlayerColor): number {
  return HOME_STRETCH_ENTRY[color];
}

// Check if a token is in its home stretch
export function isInHomeStretch(token: Token): boolean {
  return token.state === 'active' && token.position >= BOARD_SIZE;
}

// Get the home stretch position (0-5) for a token in home stretch
export function getHomeStretchPosition(token: Token): number {
  if (!isInHomeStretch(token)) return -1;
  return token.position - BOARD_SIZE;
}

// Calculate new position after move
export function calculateNewPosition(token: Token, diceValue: number, color: PlayerColor): number {
  if (token.state === 'home') {
    // Entering the board
    return ENTRY_POINTS[color];
  }

  if (token.state === 'finished') {
    return token.position;
  }

  const currentPos = token.position;
  const relativePos = getRelativePosition(currentPos, color);

  // Check if token should enter home stretch
  // Token enters home stretch when it would pass or land on the entry point
  const homeStretchEntry = getHomeStretchEntryPoint(color);
  const distToHomeEntry = (homeStretchEntry - currentPos + BOARD_SIZE) % BOARD_SIZE;

  // If token is on main track (position < BOARD_SIZE)
  if (currentPos < BOARD_SIZE) {
    // If moving would take us past the home stretch entry
    if (distToHomeEntry <= diceValue && distToHomeEntry > 0) {
      // Enter home stretch
      const stepsIntoHomeStretch = diceValue - distToHomeEntry;
      return BOARD_SIZE + stepsIntoHomeStretch - 1; // -1 because we count from 0
    }

    // Normal movement on main track
    return (currentPos + diceValue) % BOARD_SIZE;
  }

  // Already in home stretch
  const currentHomePos = currentPos - BOARD_SIZE;
  const newHomePos = currentHomePos + diceValue;

  // Check if exact roll to finish (position 57 = BOARD_SIZE + HOME_STRETCH_SIZE - 1 = finish)
  if (newHomePos === HOME_STRETCH_SIZE - 1) {
    return BOARD_SIZE + HOME_STRETCH_SIZE - 1; // Finish position
  }

  // Can't move if would overshoot
  if (newHomePos > HOME_STRETCH_SIZE - 1) {
    return currentPos; // Stay in place
  }

  return BOARD_SIZE + newHomePos;
}

// Check if a move is valid
export function isValidMove(token: Token, diceValue: number, color: PlayerColor): boolean {
  // Can't move finished tokens
  if (token.state === 'finished') return false;

  // Need 6 to leave home
  if (token.state === 'home' && diceValue !== 6) return false;

  // Check if move would overshoot finish
  if (token.state === 'active' && isInHomeStretch(token)) {
    const homePos = getHomeStretchPosition(token);
    const newHomePos = homePos + diceValue;
    // Must be exact to finish
    return newHomePos <= HOME_STRETCH_SIZE - 1;
  }

  // Active token on main track can always move
  return true;
}

// Get all movable tokens for current roll
export function getMovableTokens(player: Player, diceValue: number): string[] {
  return player.tokens
    .filter(token => isValidMove(token, diceValue, player.color))
    .map(token => token.id);
}

// Find token at position (excluding finished tokens)
export function findTokenAtPosition(state: GameState, position: number, excludeColor?: PlayerColor): Token | null {
  for (const player of state.players) {
    if (excludeColor && player.color === excludeColor) continue;

    for (const token of player.tokens) {
      if (token.state === 'active' && token.position === position) {
        return token;
      }
    }
  }
  return null;
}

// Capture token (send back to home)
export function captureToken(token: Token): Token {
  return {
    ...token,
    state: 'home',
    position: -1,
  };
}

// Move token and handle captures
export function moveToken(
  state: GameState,
  tokenId: string,
  diceValue: number
): { newState: GameState; captured: boolean; finished: boolean; message: string } {
  const player = state.players[state.currentPlayer];
  const tokenIndex = player.tokens.findIndex(t => t.id === tokenId);
  const token = player.tokens[tokenIndex];

  if (!token || !isValidMove(token, diceValue, player.color)) {
    return { newState: state, captured: false, finished: false, message: '' };
  }

  let captured = false;
  let finished = false;
  let message = '';

  // Calculate new position
  const newPosition = calculateNewPosition(token, diceValue, player.color);
  const wasHome = token.state === 'home';

  // Check for finish
  if (newPosition >= BOARD_SIZE + HOME_STRETCH_SIZE - 1) {
    finished = true;
    message = `Token reaches the finish!`;
  } else if (wasHome) {
    message = `Token enters the board!`;
  }

  // Check for capture (only on main track, not on safe squares, not in home stretch)
  let capturedToken: Token | null = null;
  if (newPosition < BOARD_SIZE && !isSafeSquare(newPosition) && !isColoredEntrySquare(newPosition)) {
    capturedToken = findTokenAtPosition(state, newPosition, player.color);
    if (capturedToken) {
      captured = true;
      message = `Captured opponent's token!`;
    }
  }

  // Create new state
  const newPlayers = state.players.map((p, pIndex) => {
    if (pIndex === state.currentPlayer) {
      const newTokens = p.tokens.map((t, tIndex) => {
        if (tIndex === tokenIndex) {
          return {
            ...t,
            state: finished ? 'finished' as const : 'active' as const,
            position: newPosition,
          };
        }
        return t;
      });

      return {
        ...p,
        tokens: newTokens,
        finishedTokens: newTokens.filter(t => t.state === 'finished').length,
      };
    }

    // Handle captured token
    if (capturedToken && p.color === capturedToken.color) {
      const newTokens = p.tokens.map(t => {
        if (t.id === capturedToken!.id) {
          return captureToken(t);
        }
        return t;
      });

      return {
        ...p,
        tokens: newTokens,
      };
    }

    return p;
  });

  const newState: GameState = {
    ...state,
    players: newPlayers,
    phase: 'rolling',
    diceRolled: false,
    lastRoll: diceValue,
    turnMessage: message,
  };

  // Check for win
  const currentPlayerAfter = newPlayers[state.currentPlayer];
  if (currentPlayerAfter.finishedTokens === TOKENS_PER_PLAYER) {
    newState.winner = state.currentPlayer;
    newState.phase = 'gameover';
  }

  // Handle extra turn for rolling 6 (unless three 6s)
  if (diceValue === 6 && !finished && !newState.winner) {
    const consecutiveSixes = player.consecutiveSixes + 1;

    if (consecutiveSixes >= MAX_CONSECUTIVE_SIXES) {
      // Three 6s - end turn
      newState.turnMessage = 'Three 6s! Turn ends.';
      newState.players[state.currentPlayer] = {
        ...newState.players[state.currentPlayer],
        consecutiveSixes: 0,
      };
      return { newState: getNextPlayer(newState), captured, finished, message: newState.turnMessage };
    } else {
      // Extra turn
      newState.turnMessage = 'Rolled a 6! Roll again!';
      newState.players[state.currentPlayer] = {
        ...newState.players[state.currentPlayer],
        consecutiveSixes: consecutiveSixes,
      };
      newState.movableTokens = [];
      return { newState, captured, finished, message: newState.turnMessage };
    }
  }

  // Reset consecutive sixes and move to next player
  newState.players[state.currentPlayer] = {
    ...newState.players[state.currentPlayer],
    consecutiveSixes: 0,
  };

  return { newState: getNextPlayer(newState), captured, finished, message };
}

// Get next player
export function getNextPlayer(state: GameState): GameState {
  let nextPlayer = (state.currentPlayer + 1) % state.players.length;
  let turnCount = state.turnCount;

  // Skip finished players (all tokens done)
  let attempts = 0;
  while (state.players[nextPlayer].finishedTokens === TOKENS_PER_PLAYER && attempts < 4) {
    nextPlayer = (nextPlayer + 1) % state.players.length;
    attempts++;
  }

  // Increment turn count when we get back to human player
  if (nextPlayer === 0) {
    turnCount++;
  }

  return {
    ...state,
    currentPlayer: nextPlayer,
    phase: nextPlayer === 0 ? 'rolling' : 'aiTurn',
    diceRolled: false,
    lastRoll: null,
    movableTokens: [],
    turnCount,
    turnMessage: null,
  };
}

// Roll dice for current player
export function rollDiceForPlayer(state: GameState): GameState {
  const diceValue = rollDie();
  const player = state.players[state.currentPlayer];
  const movableTokens = getMovableTokens(player, diceValue);

  return {
    ...state,
    dice: diceValue,
    diceRolled: true,
    lastRoll: diceValue,
    movableTokens,
    phase: movableTokens.length > 0 ? 'selectToken' : 'rolling',
    turnMessage: movableTokens.length === 0 ? 'No moves available' : null,
  };
}

// Generate hints for current move
export function generateHints(state: GameState, diceValue: number): Hint[] {
  const player = state.players[state.currentPlayer];
  const movableTokens = player.tokens.filter(t => isValidMove(t, diceValue, player.color));

  if (movableTokens.length === 0) return [];

  const hints: Hint[] = movableTokens.map(token => {
    const newPosition = calculateNewPosition(token, diceValue, player.color);
    let score = 0;
    let reason = '';

    // Check if can capture
    const canCapture = newPosition < BOARD_SIZE &&
      !isSafeSquare(newPosition) &&
      findTokenAtPosition(state, newPosition, player.color) !== null;

    // Check if finishing
    const isFinishing = newPosition >= BOARD_SIZE + HOME_STRETCH_SIZE - 1;

    // Check if entering board
    const isEntering = token.state === 'home';

    // Check if entering home stretch
    const enteringHomeStretch = token.state === 'active' &&
      token.position < BOARD_SIZE &&
      newPosition >= BOARD_SIZE;

    // Check if landing on safe square
    const landingOnSafe = isSafeSquare(newPosition);

    // Calculate progress score
    let progressScore = 0;
    if (token.state === 'active') {
      if (isInHomeStretch(token)) {
        progressScore = 80 + (newPosition - BOARD_SIZE) * 3;
      } else {
        const relativePos = getRelativePosition(newPosition, player.color);
        progressScore = Math.min(75, relativePos);
      }
    }

    // Score calculation
    if (isFinishing) {
      score = 100;
      reason = 'Reach the finish!';
    } else if (canCapture) {
      score = 90;
      reason = 'Capture opponent!';
    } else if (isEntering) {
      score = 70;
      reason = 'Enter the board';
    } else if (enteringHomeStretch) {
      score = 65;
      reason = 'Enter home stretch';
    } else if (landingOnSafe) {
      score = 50 + progressScore * 0.3;
      reason = 'Move to safety';
    } else {
      score = progressScore;
      reason = 'Make progress';
    }

    return {
      tokenId: token.id,
      reason,
      priority: score >= 70 ? 'recommended' : score >= 40 ? 'suggested' : 'possible',
    };
  });

  // Sort by score descending
  hints.sort((a, b) => {
    const aScore = a.priority === 'recommended' ? 2 : a.priority === 'suggested' ? 1 : 0;
    const bScore = b.priority === 'recommended' ? 2 : b.priority === 'suggested' ? 1 : 0;
    return bScore - aScore;
  });

  return hints;
}

// Check if all players have finished
export function checkAllPlayersFinished(state: GameState): boolean {
  return state.players.every(p => p.finishedTokens === TOKENS_PER_PLAYER);
}

// Get player ranking (for game over)
export function getPlayerRanking(state: GameState): Player[] {
  return [...state.players].sort((a, b) => {
    // Sort by finished tokens descending
    if (b.finishedTokens !== a.finishedTokens) {
      return b.finishedTokens - a.finishedTokens;
    }
    // Then by progress (tokens closest to finish)
    const aProgress = a.tokens.reduce((sum, t) => {
      if (t.state === 'finished') return sum + 100;
      if (t.state === 'active') return sum + getRelativePosition(t.position, a.color);
      return sum;
    }, 0);
    const bProgress = b.tokens.reduce((sum, t) => {
      if (t.state === 'finished') return sum + 100;
      if (t.state === 'active') return sum + getRelativePosition(t.position, b.color);
      return sum;
    }, 0);
    return bProgress - aProgress;
  });
}
