// Spider Solitaire game logic

import {
  type Suit,
  type Card,
  type SpiderDifficulty,
  type SpiderGameState,
} from './types';
import {
  RANKS,
  createSeededRandom,
  shuffleDeck,
  getRankValue,
} from '../../lib/card-games';
import { TABLEAU_COLUMNS, DIFFICULTY_CONFIG } from './constants';

/**
 * Create the initial game state
 */
export function createInitialGame(
  difficulty: SpiderDifficulty,
  gameNumber?: number
): SpiderGameState {
  const config = DIFFICULTY_CONFIG[difficulty];
  const suits = config.suits;

  // Create 104 cards (8 complete sets of the selected suits)
  const deck: Card[] = [];
  let cardIndex = 0;

  // We need 104 cards total, distributed evenly across the selected suits
  // For 1 suit: 8 copies of each card in that suit
  // For 2 suits: 4 copies of each card in each suit
  // For 4 suits: 2 copies of each card in each suit (standard 2 decks)
  const copiesPerSuit = 8 / suits.length;

  for (let copy = 0; copy < copiesPerSuit; copy++) {
    for (const suit of suits) {
      for (const rank of RANKS) {
        deck.push({
          suit,
          rank,
          id: `${suit}-${rank}-${cardIndex++}`,
          faceUp: false,
        });
      }
    }
  }

  // Seed random with game number
  const seed = gameNumber || Math.floor(Math.random() * 32000) + 1;
  const random = createSeededRandom(seed);

  // Shuffle the deck
  shuffleDeck(deck, random);

  // Deal to 10 columns: first 4 get 6 cards, last 6 get 5 cards (54 total)
  // Top card of each column is face-up
  const tableau: Card[][] = [];
  let cardIndex2 = 0;

  for (let col = 0; col < TABLEAU_COLUMNS; col++) {
    const cardCount = col < 4 ? 6 : 5;
    const column: Card[] = [];

    for (let row = 0; row < cardCount; row++) {
      const card = deck[cardIndex2++];
      // Top card is face-up
      card.faceUp = row === cardCount - 1;
      column.push(card);
    }
    tableau.push(column);
  }

  // Remaining 50 cards go to stock
  const stock = deck.slice(54);

  return {
    tableau,
    stock,
    completed: [],
  };
}

/**
 * Check if a sequence of cards is valid for Spider (descending same-suit for moving)
 * In Spider, you can only move same-suit sequences regardless of difficulty.
 * Difficulty only affects which suits are in the deck, not movement rules.
 */
export function isValidSpiderSequence(
  cards: Card[],
  difficulty: SpiderDifficulty
): boolean {
  if (cards.length <= 1) return true;

  const config = DIFFICULTY_CONFIG[difficulty];
  const allowedSuits = config.suits;

  for (let i = 0; i < cards.length - 1; i++) {
    const current = cards[i];
    const next = cards[i + 1];

    // Must be face-up
    if (!current.faceUp || !next.faceUp) return false;

    // Must be in descending order
    if (getRankValue(current.rank) !== getRankValue(next.rank) + 1) return false;

    // Must be same suit to move as a sequence (Spider rule)
    if (current.suit !== next.suit) return false;

    // Verify cards are from allowed suits for this difficulty
    if (!allowedSuits.includes(current.suit) || !allowedSuits.includes(next.suit)) {
      return false;
    }
  }

  return true;
}

/**
 * Check if a card/sequence can be placed on a tableau column
 */
export function canPlaceOnColumn(
  cards: Card[],
  targetColumn: Card[]
): boolean {
  // Can always place on empty column
  if (targetColumn.length === 0) return true;

  const topCard = targetColumn[targetColumn.length - 1];
  if (!topCard.faceUp) return false;

  // Must be descending (next rank down)
  const movingCard = cards[0];
  return getRankValue(topCard.rank) === getRankValue(movingCard.rank) + 1;
}

/**
 * Find a complete K-A same-suit sequence in a column (for auto-removal)
 */
export function findCompleteSequence(column: Card[]): { start: number; suit: Suit } | null {
  if (column.length < 13) return null;

  // Look for K at any position that could start a complete sequence
  for (let i = column.length - 13; i >= 0; i--) {
    const potentialKing = column[i];
    if (!potentialKing.faceUp || potentialKing.rank !== 'K') continue;

    const suit = potentialKing.suit;
    let isComplete = true;

    // Check if we have K-A in same suit
    for (let j = 0; j < 13; j++) {
      const card = column[i + j];
      if (!card.faceUp ||
          card.suit !== suit ||
          card.rank !== RANKS[12 - j]) {
        isComplete = false;
        break;
      }
    }

    if (isComplete) {
      return { start: i, suit };
    }
  }

  return null;
}

/**
 * Remove a complete sequence from a column
 */
export function removeCompleteSequence(
  state: SpiderGameState,
  columnIndex: number,
  startIndex: number
): SpiderGameState {
  const removedCards = state.tableau[columnIndex].slice(startIndex, startIndex + 13);

  const newTableau = state.tableau.map((col, i) => {
    if (i !== columnIndex) return [...col];
    const newCol = [...col];
    newCol.splice(startIndex, 13);
    // Flip the new top card if exists
    if (newCol.length > 0 && !newCol[newCol.length - 1].faceUp) {
      newCol[newCol.length - 1] = { ...newCol[newCol.length - 1], faceUp: true };
    }
    return newCol;
  });

  return {
    ...state,
    tableau: newTableau,
    completed: [...state.completed, removedCards],
  };
}

/**
 * Check if dealing from stock is allowed (all columns must have at least 1 card)
 */
export function canDeal(state: SpiderGameState): boolean {
  if (state.stock.length === 0) return false;
  return state.tableau.every(col => col.length > 0);
}

/**
 * Deal one card to each column from stock
 */
export function dealFromStock(state: SpiderGameState): SpiderGameState | null {
  if (!canDeal(state)) return null;

  const newStock = [...state.stock];
  const newTableau = state.tableau.map(col => {
    const card = newStock.pop()!;
    return [...col, { ...card, faceUp: true }];
  });

  return {
    ...state,
    tableau: newTableau,
    stock: newStock,
  };
}

/**
 * Check if the game is won (8 complete sequences)
 */
export function isGameWon(state: SpiderGameState): boolean {
  return state.completed.length >= 8;
}

/**
 * Get the maximum number of cards that can be moved based on empty columns
 * In Spider, you can move a sequence of length (1 + empty columns) cards
 * when the sequence is same-suit. If moving TO an empty column, don't count it.
 */
export function getMaxMovableCards(
  state: SpiderGameState,
  _difficulty: SpiderDifficulty,
  toColumn?: number
): number {
  // Count empty columns, excluding the destination if it's empty
  const emptyColumns = state.tableau.filter((col, i) => {
    if (col.length > 0) return false;
    if (toColumn !== undefined && i === toColumn) return false;
    return true;
  }).length;
  return 1 + emptyColumns;
}

/**
 * Move cards from one column to another
 */
export function moveCards(
  state: SpiderGameState,
  fromColumn: number,
  fromIndex: number,
  toColumn: number,
  difficulty: SpiderDifficulty
): SpiderGameState | null {
  const sourceColumn = state.tableau[fromColumn];
  const cardsToMove = sourceColumn.slice(fromIndex);

  // Validate the sequence (includes same-suit check)
  if (!isValidSpiderSequence(cardsToMove, difficulty)) return null;

  // Validate the destination
  const targetColumn = state.tableau[toColumn];
  if (!canPlaceOnColumn(cardsToMove, targetColumn)) return null;

  // Don't move to same column
  if (fromColumn === toColumn) return null;

  // Check max movable for sequences
  if (cardsToMove.length > 1) {
    const maxMovable = getMaxMovableCards(state, difficulty, toColumn);
    if (cardsToMove.length > maxMovable) return null;
  }

  // Execute the move
  const newTableau = state.tableau.map((col, i) => {
    if (i === fromColumn) {
      const newCol = [...col.slice(0, fromIndex)];
      // Flip the new top card if exists
      if (newCol.length > 0 && !newCol[newCol.length - 1].faceUp) {
        newCol[newCol.length - 1] = { ...newCol[newCol.length - 1], faceUp: true };
      }
      return newCol;
    }
    if (i === toColumn) {
      return [...col, ...cardsToMove];
    }
    return [...col];
  });

  return {
    ...state,
    tableau: newTableau,
  };
}

/**
 * Auto-remove any complete sequences from the tableau
 */
export function autoCompleteSequences(state: SpiderGameState): SpiderGameState {
  let newState = state;
  let changed = true;

  // Keep checking until no more complete sequences are found
  while (changed) {
    changed = false;

    for (let colIndex = 0; colIndex < newState.tableau.length; colIndex++) {
      const column = newState.tableau[colIndex];
      const complete = findCompleteSequence(column);

      if (complete) {
        newState = removeCompleteSequence(newState, colIndex, complete.start);
        changed = true;
        // Start over since columns have changed
        break;
      }
    }
  }

  return newState;
}
