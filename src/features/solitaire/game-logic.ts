// Klondike Solitaire game logic

import {
  type Card,
  type KlondikeGameState,
} from './types';
import {
  createSeededRandom,
  shuffleDeck,
  getRankValue,
  isRed,
  createDeck,
} from '../../lib/card-games';
import { TABLEAU_COLUMNS, FOUNDATION_SUITS } from './constants';

/**
 * Create the initial game state
 */
export function createInitialGame(gameNumber?: number): KlondikeGameState {
  // Create standard 52-card deck
  const deck = createDeck();

  // Seed random with game number
  const seed = gameNumber || Math.floor(Math.random() * 32000) + 1;
  const random = createSeededRandom(seed);

  // Shuffle the deck
  shuffleDeck(deck, random);

  // Deal to 7 columns: 1-7 cards each, top card face up
  const tableau: Card[][] = [];
  let cardIndex = 0;

  for (let col = 0; col < TABLEAU_COLUMNS; col++) {
    const cardCount = col + 1; // Column 0 gets 1 card, column 6 gets 7 cards
    const column: Card[] = [];

    for (let row = 0; row < cardCount; row++) {
      const card = deck[cardIndex++];
      // Top card is face-up
      card.faceUp = row === cardCount - 1;
      column.push(card);
    }
    tableau.push(column);
  }

  // Remaining 24 cards go to stock (face down)
  const stock = deck.slice(28).map(c => ({ ...c, faceUp: false }));
  const waste: Card[] = [];
  const foundations: Card[][] = [[], [], [], []];

  return {
    tableau,
    stock,
    waste,
    foundations,
    passCount: 0,
  };
}

/**
 * Check if a card sequence is valid for tableau building (alternating colors, descending)
 */
export function isValidTableauSequence(cards: Card[]): boolean {
  if (cards.length <= 1) return true;

  for (let i = 0; i < cards.length - 1; i++) {
    const current = cards[i];
    const next = cards[i + 1];

    // Must be face-up
    if (!current.faceUp || !next.faceUp) return false;

    // Must be alternating colors
    if (isRed(current.suit) === isRed(next.suit)) return false;

    // Must be descending order
    if (getRankValue(current.rank) !== getRankValue(next.rank) + 1) return false;
  }

  return true;
}

/**
 * Check if a card can be placed on a tableau column
 */
export function canPlaceOnTableau(card: Card, column: Card[]): boolean {
  // Empty column: only Kings can be placed
  if (column.length === 0) {
    return card.rank === 'K';
  }

  const topCard = column[column.length - 1];
  if (!topCard.faceUp) return false;

  // Must be opposite color and one rank lower
  if (isRed(card.suit) === isRed(topCard.suit)) return false;
  return getRankValue(card.rank) === getRankValue(topCard.rank) - 1;
}

/**
 * Check if a card can be placed on a foundation
 */
export function canPlaceOnFoundation(card: Card, foundationIndex: number, foundations: Card[][]): boolean {
  const targetSuit = FOUNDATION_SUITS[foundationIndex];
  if (card.suit !== targetSuit) return false;

  const foundation = foundations[foundationIndex];

  if (foundation.length === 0) {
    return card.rank === 'A';
  }

  const topCard = foundation[foundation.length - 1];
  return getRankValue(card.rank) === getRankValue(topCard.rank) + 1;
}

/**
 * Deal one card from stock to waste
 */
export function dealFromStock(state: KlondikeGameState): KlondikeGameState {
  if (state.stock.length === 0) {
    // Recycle waste back to stock
    if (state.waste.length === 0) return state;

    return {
      ...state,
      stock: state.waste.reverse().map(c => ({ ...c, faceUp: false })),
      waste: [],
      passCount: state.passCount + 1,
    };
  }

  // Deal one card to waste
  const card = { ...state.stock[state.stock.length - 1], faceUp: true };
  return {
    ...state,
    stock: state.stock.slice(0, -1),
    waste: [...state.waste, card],
  };
}

/**
 * Move cards from one location to another
 */
export function moveCards(
  state: KlondikeGameState,
  from: { type: 'tableau' | 'waste' | 'foundation'; column?: number; cardIndex?: number },
  to: { type: 'tableau' | 'foundation'; index: number }
): KlondikeGameState | null {
  let cardsToMove: Card[] = [];
  let newTableau = state.tableau.map(col => [...col]);
  let newWaste = [...state.waste];
  let newFoundations = state.foundations.map(f => [...f]);

  // Get cards from source
  if (from.type === 'tableau' && from.column !== undefined && from.cardIndex !== undefined) {
    const column = newTableau[from.column];
    cardsToMove = column.slice(from.cardIndex);
    if (!isValidTableauSequence(cardsToMove)) return null;

    // Remove from source
    newTableau[from.column] = column.slice(0, from.cardIndex);

    // Flip new top card if exists
    if (newTableau[from.column].length > 0) {
      const topCard = newTableau[from.column][newTableau[from.column].length - 1];
      if (!topCard.faceUp) {
        newTableau[from.column][newTableau[from.column].length - 1] = { ...topCard, faceUp: true };
      }
    }
  } else if (from.type === 'waste') {
    if (newWaste.length === 0) return null;
    cardsToMove = [newWaste[newWaste.length - 1]];
    newWaste = newWaste.slice(0, -1);
  } else if (from.type === 'foundation' && from.column !== undefined) {
    const foundation = newFoundations[from.column];
    if (foundation.length === 0) return null;
    cardsToMove = [foundation[foundation.length - 1]];
    newFoundations[from.column] = foundation.slice(0, -1);
  }

  if (cardsToMove.length === 0) return null;

  // Place cards at destination
  if (to.type === 'tableau') {
    if (!canPlaceOnTableau(cardsToMove[0], newTableau[to.index])) return null;
    newTableau[to.index] = [...newTableau[to.index], ...cardsToMove];
  } else if (to.type === 'foundation') {
    if (cardsToMove.length !== 1) return null;
    if (!canPlaceOnFoundation(cardsToMove[0], to.index, newFoundations)) return null;
    newFoundations[to.index] = [...newFoundations[to.index], cardsToMove[0]];
  }

  return {
    ...state,
    tableau: newTableau,
    waste: newWaste,
    foundations: newFoundations,
  };
}

/**
 * Check if the game is won (all foundations have 13 cards)
 */
export function isGameWon(state: KlondikeGameState): boolean {
  return state.foundations.every(f => f.length === 13);
}

/**
 * Find a hint (a valid move)
 */
export function findHint(state: KlondikeGameState): { source: 'tableau' | 'waste'; columnIndex?: number; cardIndex?: number; target: 'tableau' | 'foundation'; targetIndex: number } | null {
  const { tableau, waste, foundations } = state;

  // Priority 1: Can any card go to foundation?
  // Check tableau tops
  for (let col = 0; col < TABLEAU_COLUMNS; col++) {
    const column = tableau[col];
    if (column.length === 0) continue;
    const card = column[column.length - 1];
    if (!card.faceUp) continue;

    for (let f = 0; f < 4; f++) {
      if (canPlaceOnFoundation(card, f, foundations)) {
        return { source: 'tableau', columnIndex: col, cardIndex: column.length - 1, target: 'foundation', targetIndex: f };
      }
    }
  }

  // Check waste top
  if (waste.length > 0) {
    const card = waste[waste.length - 1];
    for (let f = 0; f < 4; f++) {
      if (canPlaceOnFoundation(card, f, foundations)) {
        return { source: 'waste', target: 'foundation', targetIndex: f };
      }
    }
  }

  // Priority 2: Can we move from waste to tableau?
  if (waste.length > 0) {
    const card = waste[waste.length - 1];
    for (let col = 0; col < TABLEAU_COLUMNS; col++) {
      if (canPlaceOnTableau(card, tableau[col])) {
        return { source: 'waste', target: 'tableau', targetIndex: col };
      }
    }
  }

  // Priority 3: Can we move a King to an empty column?
  const emptyColumns = tableau.map((col, i) => col.length === 0 ? i : -1).filter(i => i >= 0);

  if (emptyColumns.length > 0) {
    for (let col = 0; col < TABLEAU_COLUMNS; col++) {
      const column = tableau[col];
      // Find face-down cards - we want to uncover them
      const faceDownIndex = column.findIndex(c => !c.faceUp);
      if (faceDownIndex <= 0) continue;

      // Check if we can move the cards above the face-down section
      for (let cardIdx = 0; cardIdx < faceDownIndex; cardIdx++) {
        const card = column[cardIdx];
        if (card.rank === 'K') {
          return { source: 'tableau', columnIndex: col, cardIndex: cardIdx, target: 'tableau', targetIndex: emptyColumns[0] };
        }
      }
    }
  }

  // Priority 4: Any valid tableau move
  for (let col = 0; col < TABLEAU_COLUMNS; col++) {
    const column = tableau[col];
    if (column.length === 0) continue;

    // Find first face-up card
    const firstFaceUp = column.findIndex(c => c.faceUp);
    if (firstFaceUp === -1) continue;

    const cardsToMove = column.slice(firstFaceUp);
    if (!isValidTableauSequence(cardsToMove)) continue;

    for (let targetCol = 0; targetCol < TABLEAU_COLUMNS; targetCol++) {
      if (targetCol === col) continue;
      if (canPlaceOnTableau(cardsToMove[0], tableau[targetCol])) {
        // Don't suggest moving to empty column unless it's a King
        if (tableau[targetCol].length === 0 && cardsToMove[0].rank !== 'K') continue;
        return { source: 'tableau', columnIndex: col, cardIndex: firstFaceUp, target: 'tableau', targetIndex: targetCol };
      }
    }
  }

  return null;
}

/**
 * Auto-move cards to foundation if safe (only Aces and 2s automatically)
 */
export function autoMoveToFoundation(state: KlondikeGameState): KlondikeGameState {
  let newState = { ...state, tableau: state.tableau.map(col => [...col]), waste: [...state.waste], foundations: state.foundations.map(f => [...f]) };
  let moved = true;

  while (moved) {
    moved = false;

    // Check tableau
    for (let col = 0; col < TABLEAU_COLUMNS; col++) {
      const column = newState.tableau[col];
      if (column.length === 0) continue;
      const card = column[column.length - 1];
      if (!card.faceUp) continue;

      for (let f = 0; f < 4; f++) {
        if (canPlaceOnFoundation(card, f, newState.foundations)) {
          // Only auto-move Aces and 2s for safety
          if (card.rank === 'A' || card.rank === '2') {
            newState.foundations[f] = [...newState.foundations[f], card];
            newState.tableau[col] = column.slice(0, -1);

            // Flip new top card
            if (newState.tableau[col].length > 0) {
              const topCard = newState.tableau[col][newState.tableau[col].length - 1];
              if (!topCard.faceUp) {
                newState.tableau[col][newState.tableau[col].length - 1] = { ...topCard, faceUp: true };
              }
            }
            moved = true;
            break;
          }
        }
      }
      if (moved) break;
    }

    // Check waste
    if (!moved && newState.waste.length > 0) {
      const card = newState.waste[newState.waste.length - 1];
      for (let f = 0; f < 4; f++) {
        if (canPlaceOnFoundation(card, f, newState.foundations)) {
          if (card.rank === 'A' || card.rank === '2') {
            newState.foundations[f] = [...newState.foundations[f], card];
            newState.waste = newState.waste.slice(0, -1);
            moved = true;
            break;
          }
        }
      }
    }
  }

  return newState;
}
