import { useState, useCallback, useEffect, useRef } from 'preact/hooks';
import { memo } from 'preact/compat';
import './freecell.css';
import {
  type Suit,
  type Card,
  type GameStats,
  SUIT_SYMBOLS,
  SUIT_COLORS,
  createSeededRandom,
  shuffleDeck,
  createDeck,
  getRankValue,
  isRed,
  loadStats,
  saveStats,
} from '../../lib/card-games';

type FreeCellCardProps = {
  card: Card;
  isSelected?: boolean;
  isHint?: boolean;
  isDragging?: boolean;
};

const FreeCellCard = memo(function FreeCellCard({
  card,
  isSelected = false,
  isHint = false,
  isDragging = false,
}: FreeCellCardProps) {
  const colorClass = SUIT_COLORS[card.suit];

  return (
    <div
      class={`fc-card ${colorClass} ${isSelected ? 'selected' : ''} ${isHint ? 'hint' : ''} ${isDragging ? 'dragging' : ''}`}
      data-testid={`freecell-card-${card.suit}-${card.rank}`}
      data-suit={card.suit}
      data-rank={card.rank}
    >
      <div class="fc-card-rank">{card.rank}</div>
      <div class="fc-card-suit">{SUIT_SYMBOLS[card.suit]}</div>
    </div>
  );
});

type GameState = {
  tableau: (Card | null)[][]; // 8 columns
  freeCells: (Card | null)[]; // 4 cells
  foundations: (Card | null)[]; // 4 piles (one per suit)
};

type Stats = GameStats;

type Hint = {
  source: string;
  index: number;
  cardIndex?: number;
  target: string;
  targetIndex: number;
};

type DragInfo = {
  source: string;
  index: number;
  cardIndex?: number;
  cards: Card[];
};

const FOUNDATION_SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];

// Create a shuffled deck and deal to tableau
function createInitialGame(gameNumber?: number): GameState {
  // Create deck using shared library
  const deck = createDeck();

  // Seed random with game number
  let seed = gameNumber || Math.floor(Math.random() * 32000) + 1;
  const random = createSeededRandom(seed);

  // Shuffle using shared library
  shuffleDeck(deck, random);

  // Deal to 8 columns (first 4 get 7 cards, last 4 get 6)
  const tableau: (Card | null)[][] = [[], [], [], [], [], [], [], []];
  let cardIndex = 0;

  for (let col = 0; col < 8; col++) {
    const cardCount = col < 4 ? 7 : 6;
    for (let row = 0; row < cardCount; row++) {
      tableau[col].push(deck[cardIndex++]);
    }
  }

  return {
    tableau,
    freeCells: [null, null, null, null],
    foundations: [null, null, null, null],
  };
}

// Calculate max movable cards: (free cells + 1) * 2^(empty columns)
function getMaxMovableCards(freeCells: number, emptyColumns: number): number {
  return (freeCells + 1) * Math.pow(2, emptyColumns);
}

// Check if a sequence of cards can be moved
function isValidSequence(cards: Card[]): boolean {
  for (let i = 0; i < cards.length - 1; i++) {
    const current = cards[i];
    const next = cards[i + 1];
    if (isRed(current.suit) === isRed(next.suit)) return false;
    if (getRankValue(current.rank) !== getRankValue(next.rank) + 1) return false;
  }
  return true;
}

// Check if card can go on foundation
function canPlaceOnFoundation(card: Card, foundationIndex: number, foundations: (Card | null)[]): boolean {
  const targetSuit = FOUNDATION_SUITS[foundationIndex];
  if (card.suit !== targetSuit) return false;

  const currentTop = foundations[foundationIndex];
  if (!currentTop) {
    return card.rank === 'A';
  }

  return getRankValue(card.rank) === getRankValue(currentTop.rank) + 1;
}

// Check if card can be placed on tableau column
function canPlaceOnTableau(card: Card, column: (Card | null)[]): boolean {
  if (column.length === 0) return true;

  const topCard = column[column.length - 1];
  if (!topCard) return true;

  // Must be opposite color and one rank lower
  if (isRed(card.suit) === isRed(topCard.suit)) return false;
  return getRankValue(card.rank) === getRankValue(topCard.rank) - 1;
}

export function FreeCell() {
  const [gameState, setGameState] = useState<GameState>(() => createInitialGame());
  const [selectedCard, setSelectedCard] = useState<{ source: string; index: number; cardIndex?: number } | null>(null);
  const [gameNumber, setGameNumber] = useState<number>(() => Math.floor(Math.random() * 32000) + 1);
  const [moves, setMoves] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [activeMenu, setActiveMenu] = useState<'game' | 'help' | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showSelectGame, setShowSelectGame] = useState(false);
  const [selectGameInput, setSelectGameInput] = useState('');

  // Undo system
  const [moveHistory, setMoveHistory] = useState<GameState[]>([]);
  const [moveCountHistory, setMoveCountHistory] = useState<number[]>([]);

  // Hint system
  const [hintCard, setHintCard] = useState<{ source: string; index: number; cardIndex?: number } | null>(null);

  // Drag and drop
  const [draggedCard, setDraggedCard] = useState<DragInfo | null>(null);
  const [dropTarget, setDropTarget] = useState<{ type: string; index: number } | null>(null);

  // Statistics - use shared library
  const [stats, setStats] = useState<Stats>(() => loadStats('freecell-stats'));

  // Track if game has been counted as played
  const gameCountedRef = useRef(false);

  const timerRef = useRef<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Save stats to localStorage using shared library
  useEffect(() => {
    saveStats('freecell-stats', stats);
  }, [stats]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Timer
  useEffect(() => {
    if (moves > 0 && !isWon) {
      timerRef.current = window.setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [moves, isWon]);

  // Check for win
  useEffect(() => {
    const allFoundationsFull = gameState.foundations.every(f => f?.rank === 'K');
    if (allFoundationsFull) {
      setIsWon(true);
      // Update stats on win
      if (!gameCountedRef.current) {
        setStats(prev => ({
          ...prev,
          gamesPlayed: prev.gamesPlayed + 1,
          gamesWon: prev.gamesWon + 1,
          currentStreak: prev.currentStreak + 1,
          bestStreak: Math.max(prev.bestStreak, prev.currentStreak + 1),
        }));
        gameCountedRef.current = true;
      }
    }
  }, [gameState.foundations]);

  // Count game as played on first move
  useEffect(() => {
    if (moves === 1 && !gameCountedRef.current) {
      setStats(prev => ({
        ...prev,
        gamesPlayed: prev.gamesPlayed + 1,
      }));
      gameCountedRef.current = true;
    }
  }, [moves]);

  // Save state before each move
  const saveState = useCallback(() => {
    setMoveHistory(prev => [...prev, {
      tableau: gameState.tableau.map(col => [...col]),
      freeCells: [...gameState.freeCells],
      foundations: [...gameState.foundations],
    }]);
    setMoveCountHistory(prev => [...prev, moves]);
  }, [gameState, moves]);

  // Undo function
  const undo = useCallback(() => {
    if (moveHistory.length === 0) return;
    const prevState = moveHistory[moveHistory.length - 1];
    const prevMoves = moveCountHistory[moveCountHistory.length - 1];
    setGameState(prevState);
    setMoveHistory(prev => prev.slice(0, -1));
    setMoveCountHistory(prev => prev.slice(0, -1));
    setMoves(prevMoves);
    setSelectedCard(null);
    setHintCard(null);
  }, [moveHistory, moveCountHistory]);

  // Auto-move to foundation
  const autoMoveToFoundation = useCallback((state: GameState): GameState => {
    let newState = { ...state, tableau: state.tableau.map(col => [...col]), freeCells: [...state.freeCells], foundations: [...state.foundations] };
    let moved = true;

    while (moved) {
      moved = false;

      // Check tableau
      for (let col = 0; col < 8; col++) {
        const column = newState.tableau[col];
        if (column.length === 0) continue;

        const card = column[column.length - 1];
        if (!card) continue;

        for (let f = 0; f < 4; f++) {
          if (canPlaceOnFoundation(card, f, newState.foundations)) {
            // Only auto-move Aces and 2s, or if safe
            if (card.rank === 'A' || card.rank === '2' ||
                (card.rank === '3' && newState.foundations.filter(f => f).length >= 2)) {
              newState.foundations[f] = card;
              newState.tableau[col].pop();
              moved = true;
              break;
            }
          }
        }
        if (moved) break;
      }

      // Check free cells
      if (!moved) {
        for (let i = 0; i < 4; i++) {
          const card = newState.freeCells[i];
          if (!card) continue;

          for (let f = 0; f < 4; f++) {
            if (canPlaceOnFoundation(card, f, newState.foundations)) {
              if (card.rank === 'A' || card.rank === '2') {
                newState.foundations[f] = card;
                newState.freeCells[i] = null;
                moved = true;
                break;
              }
            }
          }
          if (moved) break;
        }
      }
    }

    return newState;
  }, []);

  // Find a hint
  const findHint = useCallback((): Hint | null => {
    const { tableau, freeCells, foundations } = gameState;

    // Priority 1: Can any card go to foundation?
    // Check tableau tops
    for (let col = 0; col < 8; col++) {
      const column = tableau[col];
      if (column.length === 0) continue;
      const card = column[column.length - 1];
      if (!card) continue;

      for (let f = 0; f < 4; f++) {
        if (canPlaceOnFoundation(card, f, foundations)) {
          return { source: 'tableau', index: col, cardIndex: column.length - 1, target: 'foundation', targetIndex: f };
        }
      }
    }

    // Check free cells
    for (let i = 0; i < 4; i++) {
      const card = freeCells[i];
      if (!card) continue;

      for (let f = 0; f < 4; f++) {
        if (canPlaceOnFoundation(card, f, foundations)) {
          return { source: 'freecell', index: i, target: 'foundation', targetIndex: f };
        }
      }
    }

    // Priority 2: Can we move to an empty column to free up space?
    const emptyColumns = tableau.map((col, i) => col.length === 0 ? i : -1).filter(i => i >= 0);

    if (emptyColumns.length > 0) {
      // Find a card sequence that would benefit from being on an empty column
      for (let col = 0; col < 8; col++) {
        const column = tableau[col];
        if (column.length <= 1) continue;

        // Check if there's a valid sequence starting somewhere in the column
        for (let cardIdx = 0; cardIdx < column.length - 1; cardIdx++) {
          const cards = column.slice(cardIdx).filter((c): c is Card => c !== null);
          if (cards.length > 1 && isValidSequence(cards)) {
            // Found a sequence - suggest moving to empty column
            return { source: 'tableau', index: col, cardIndex: cardIdx, target: 'tableau', targetIndex: emptyColumns[0] };
          }
        }
      }
    }

    // Priority 3: Any valid tableau move
    for (let col = 0; col < 8; col++) {
      const column = tableau[col];
      if (column.length === 0) continue;

      const card = column[column.length - 1];
      if (!card) continue;

      // Try to place on other tableau columns
      for (let targetCol = 0; targetCol < 8; targetCol++) {
        if (targetCol === col) continue;
        if (canPlaceOnTableau(card, tableau[targetCol])) {
          // Don't suggest moving to empty column if we're just moving a single card
          if (tableau[targetCol].length === 0 && column.length === 1) continue;
          return { source: 'tableau', index: col, cardIndex: column.length - 1, target: 'tableau', targetIndex: targetCol };
        }
      }
    }

    // Priority 4: Move from free cell to tableau
    for (let i = 0; i < 4; i++) {
      const card = freeCells[i];
      if (!card) continue;

      for (let targetCol = 0; targetCol < 8; targetCol++) {
        if (canPlaceOnTableau(card, tableau[targetCol])) {
          return { source: 'freecell', index: i, target: 'tableau', targetIndex: targetCol };
        }
      }
    }

    return null;
  }, [gameState]);

  // Show hint
  const showHint = useCallback(() => {
    if (isWon) return;
    const hint = findHint();
    if (hint) {
      setHintCard({ source: hint.source, index: hint.index, cardIndex: hint.cardIndex });
      setTimeout(() => setHintCard(null), 2000);
    }
  }, [findHint, isWon]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F2 or Ctrl+N: New game
      if (e.key === 'F2' || (e.ctrlKey && e.key === 'n')) {
        e.preventDefault();
        newGame();
      }
      // F3: Show game select dialog
      if (e.key === 'F3') {
        e.preventDefault();
        setShowSelectGame(true);
        setActiveMenu(null);
      }
      // Ctrl+Z: Undo
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        undo();
      }
      // H: Show hint
      if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        showHint();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, showHint]);

  // Check if auto-complete is possible
  const canAutoComplete = useCallback((): boolean => {
    if (isWon) return false;

    // Calculate foundation total
    const foundationTotal = gameState.foundations.reduce((sum, f) =>
      sum + (f ? getRankValue(f.rank) + 1 : 0), 0);

    // Need at least 48 cards in foundations (most cards done)
    return foundationTotal >= 48;
  }, [gameState.foundations, isWon]);

  // Auto-complete function
  const autoComplete = useCallback(() => {
    if (!canAutoComplete()) return;

    const interval = setInterval(() => {
      setGameState(prev => {
        const newState = { ...prev, tableau: prev.tableau.map(col => [...col]), freeCells: [...prev.freeCells], foundations: [...prev.foundations] };
        let moved = false;

        // Find any card that can go to foundation
        for (let col = 0; col < 8; col++) {
          const column = newState.tableau[col];
          if (column.length === 0) continue;
          const card = column[column.length - 1];
          if (!card) continue;

          for (let f = 0; f < 4; f++) {
            if (canPlaceOnFoundation(card, f, newState.foundations)) {
              newState.foundations[f] = card;
              newState.tableau[col].pop();
              moved = true;
              break;
            }
          }
          if (moved) break;
        }

        // Check free cells
        if (!moved) {
          for (let i = 0; i < 4; i++) {
            const card = newState.freeCells[i];
            if (!card) continue;

            for (let f = 0; f < 4; f++) {
              if (canPlaceOnFoundation(card, f, newState.foundations)) {
                newState.foundations[f] = card;
                newState.freeCells[i] = null;
                moved = true;
                break;
              }
            }
            if (moved) break;
          }
        }

        // Check if done
        if (newState.foundations.every(f => f?.rank === 'K')) {
          clearInterval(interval);
          setIsWon(true);
        }

        if (!moved) {
          clearInterval(interval);
        }

        return newState;
      });
      setMoves(m => m + 1);
    }, 100);
  }, [canAutoComplete]);

  const newGame = useCallback((newNumber?: number) => {
    const num = newNumber || Math.floor(Math.random() * 32000) + 1;
    setGameNumber(num);
    setGameState(createInitialGame(num));
    setSelectedCard(null);
    setMoves(0);
    setTimer(0);
    setIsWon(false);
    setActiveMenu(null);
    setMoveHistory([]);
    setMoveCountHistory([]);
    setHintCard(null);
    setShowSelectGame(false);
    setDraggedCard(null);
    setDropTarget(null);
    gameCountedRef.current = false;
  }, []);

  // Execute a move from source to target
  const executeMove = useCallback((dragInfo: DragInfo, targetType: string, targetIndex: number) => {
    if (isWon) return false;

    const { source, index, cardIndex, cards: cardsToMove } = dragInfo;

    let newState = {
      ...gameState,
      tableau: gameState.tableau.map(col => [...col]),
      freeCells: [...gameState.freeCells],
      foundations: [...gameState.foundations]
    };
    let moveMade = false;

    // Calculate available spaces for multi-card moves
    const freeCellCount = newState.freeCells.filter(c => c === null).length;
    const emptyColumnCount = newState.tableau.filter(col => col.length === 0).length;
    const maxMovable = getMaxMovableCards(freeCellCount, emptyColumnCount);

    if (targetType === 'freecell' && cardsToMove.length === 1) {
      // Moving to free cell
      if (newState.freeCells[targetIndex] === null) {
        newState.freeCells[targetIndex] = cardsToMove[0];
        moveMade = true;
      }
    } else if (targetType === 'foundation' && cardsToMove.length === 1) {
      // Moving to foundation
      if (canPlaceOnFoundation(cardsToMove[0], targetIndex, newState.foundations)) {
        newState.foundations[targetIndex] = cardsToMove[0];
        moveMade = true;
      }
    } else if (targetType === 'tableau') {
      // Moving to tableau
      const targetColumn = newState.tableau[targetIndex];

      // Check if moving back to same column
      if (source === 'tableau' && index === targetIndex) {
        return false;
      }

      if (cardsToMove.length <= maxMovable && canPlaceOnTableau(cardsToMove[0], targetColumn)) {
        // Add to target
        newState.tableau[targetIndex] = [...targetColumn, ...cardsToMove];
        moveMade = true;
      }
    }

    if (moveMade) {
      saveState();

      // Clear source
      if (source === 'tableau') {
        newState.tableau[index] = newState.tableau[index].slice(0, cardIndex);
      } else if (source === 'freecell') {
        newState.freeCells[index] = null;
      }

      // Auto-move to foundations
      newState = autoMoveToFoundation(newState);

      setGameState(newState);
      setMoves(m => m + 1);
    }

    return moveMade;
  }, [gameState, isWon, saveState, autoMoveToFoundation]);

  // Handle double-click to move to foundation
  const handleDoubleClick = useCallback((source: string, index: number, cardIndex?: number) => {
    if (isWon) return;

    let card: Card | null = null;

    if (source === 'tableau') {
      const column = gameState.tableau[index];
      // Only allow double-click on top card
      if (cardIndex !== column.length - 1) return;
      card = column[column.length - 1];
    } else if (source === 'freecell') {
      card = gameState.freeCells[index];
    }

    if (!card) return;

    const foundationIndex = FOUNDATION_SUITS.indexOf(card.suit);
    if (canPlaceOnFoundation(card, foundationIndex, gameState.foundations)) {
      const dragInfo: DragInfo = {
        source,
        index,
        cardIndex: cardIndex ?? 0,
        cards: [card]
      };
      executeMove(dragInfo, 'foundation', foundationIndex);
      setSelectedCard(null);
    }
  }, [gameState, isWon, executeMove]);

  // Drag handlers
  const handleDragStart = useCallback((e: DragEvent, source: string, index: number, cardIndex?: number) => {
    if (isWon) {
      e.preventDefault();
      return;
    }

    let cards: Card[] = [];

    if (source === 'tableau') {
      const column = gameState.tableau[index];
      cards = column.slice(cardIndex!).filter((c): c is Card => c !== null);
      if (!isValidSequence(cards)) {
        e.preventDefault();
        return;
      }
    } else if (source === 'freecell') {
      const card = gameState.freeCells[index];
      if (card) {
        cards = [card];
      }
    }

    if (cards.length === 0) {
      e.preventDefault();
      return;
    }

    setDraggedCard({ source, index, cardIndex, cards });
    setSelectedCard(null);

    // Set drag image
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', ''); // Required for Firefox
    }
  }, [gameState, isWon]);

  const handleDragEnd = useCallback(() => {
    setDraggedCard(null);
    setDropTarget(null);
  }, []);

  const handleDragOver = useCallback((e: DragEvent, type: string, index: number) => {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
    setDropTarget({ type, index });
  }, []);

  const handleDragLeave = useCallback(() => {
    setDropTarget(null);
  }, []);

  const handleDrop = useCallback((e: DragEvent, targetType: string, targetIndex: number) => {
    e.preventDefault();
    if (!draggedCard) return;

    executeMove(draggedCard, targetType, targetIndex);

    setDraggedCard(null);
    setDropTarget(null);
  }, [draggedCard, executeMove]);

  // Check if a drop target is valid
  const isValidDropTarget = useCallback((type: string, index: number): boolean => {
    if (!draggedCard) return false;

    const { source, cards: cardsToMove } = draggedCard;

    // Same location
    if (source === type && draggedCard.index === index) return false;

    if (type === 'freecell') {
      return cardsToMove.length === 1 && gameState.freeCells[index] === null;
    }

    if (type === 'foundation') {
      return cardsToMove.length === 1 && canPlaceOnFoundation(cardsToMove[0], index, gameState.foundations);
    }

    if (type === 'tableau') {
      const freeCellCount = gameState.freeCells.filter(c => c === null).length;
      const emptyColumnCount = gameState.tableau.filter(col => col.length === 0).length;
      const maxMovable = getMaxMovableCards(freeCellCount, emptyColumnCount);

      return cardsToMove.length <= maxMovable && canPlaceOnTableau(cardsToMove[0], gameState.tableau[index]);
    }

    return false;
  }, [draggedCard, gameState]);

  const handleCardClick = useCallback((source: string, index: number, cardIndex?: number) => {
    if (isWon) return;

    if (!selectedCard) {
      // Select card
      setSelectedCard({ source, index, cardIndex });
    } else {
      // Try to move using the shared executeMove function
      let cardsToMove: Card[] = [];

      if (selectedCard.source === 'tableau') {
        const col = gameState.tableau[selectedCard.index];
        cardsToMove = col.slice(selectedCard.cardIndex!).filter((c): c is Card => c !== null);
        if (!isValidSequence(cardsToMove)) {
          setSelectedCard(null);
          return;
        }
      } else if (selectedCard.source === 'freecell') {
        cardsToMove = [gameState.freeCells[selectedCard.index]!];
      }

      const dragInfo: DragInfo = {
        source: selectedCard.source,
        index: selectedCard.index,
        cardIndex: selectedCard.cardIndex,
        cards: cardsToMove
      };

      executeMove(dragInfo, source, index);
      setSelectedCard(null);
    }
  }, [gameState, selectedCard, isWon, executeMove]);

  // Handle clicking on empty free cell or foundation
  const handleSlotClick = useCallback((type: 'freecell' | 'foundation', index: number) => {
    if (!selectedCard) return;

    if (type === 'freecell') {
      // Only single cards can go to free cells
      if (selectedCard.source === 'tableau') {
        const col = gameState.tableau[selectedCard.index];
        if (selectedCard.cardIndex !== col.length - 1) {
          setSelectedCard(null);
          return;
        }
      }
    }

    handleCardClick(type, index);
  }, [selectedCard, gameState.tableau, handleCardClick]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const resetStats = () => {
    setStats({ gamesPlayed: 0, gamesWon: 0, currentStreak: 0, bestStreak: 0 });
  };

  return (
    <div class="fc-container">
      <div class="fc-menu-bar" ref={menuRef}>
        <div class="fc-menu-trigger">
          <span
            class={`fc-menu-item ${activeMenu === 'game' ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenu(activeMenu === 'game' ? null : 'game');
            }}
          >
            Game
          </span>
          {activeMenu === 'game' && (
            <div class="fc-dropdown">
              <button class="fc-dropdown-item" onClick={() => { newGame(); setActiveMenu(null); }}>
                <span class="fc-dropdown-check"></span>
                <span class="fc-dropdown-text">New Game</span>
                <span class="fc-dropdown-shortcut">F2</span>
              </button>
              <button class="fc-dropdown-item" onClick={() => { newGame(gameNumber); setActiveMenu(null); }}>
                <span class="fc-dropdown-check"></span>
                <span class="fc-dropdown-text">Restart Game</span>
              </button>
              <button class="fc-dropdown-item" onClick={() => { setShowSelectGame(true); setActiveMenu(null); }}>
                <span class="fc-dropdown-check"></span>
                <span class="fc-dropdown-text">Select Game...</span>
                <span class="fc-dropdown-shortcut">F3</span>
              </button>
              <div class="fc-dropdown-separator" />
              <button class="fc-dropdown-item" onClick={() => { undo(); setActiveMenu(null); }} disabled={moveHistory.length === 0}>
                <span class="fc-dropdown-check"></span>
                <span class="fc-dropdown-text">Undo</span>
                <span class="fc-dropdown-shortcut">Ctrl+Z</span>
              </button>
              <div class="fc-dropdown-separator" />
              <button class="fc-dropdown-item" onClick={() => { setShowStats(true); setActiveMenu(null); }}>
                <span class="fc-dropdown-check"></span>
                <span class="fc-dropdown-text">Statistics...</span>
              </button>
            </div>
          )}
        </div>
        <div class="fc-menu-trigger">
          <span
            class={`fc-menu-item ${activeMenu === 'help' ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenu(activeMenu === 'help' ? null : 'help');
            }}
          >
            Help
          </span>
          {activeMenu === 'help' && (
            <div class="fc-dropdown">
              <button class="fc-dropdown-item" onClick={() => { setShowHelp(true); setActiveMenu(null); }}>
                <span class="fc-dropdown-check"></span>
                <span class="fc-dropdown-text">How to Play</span>
              </button>
              <button class="fc-dropdown-item" onClick={() => { showHint(); setActiveMenu(null); }}>
                <span class="fc-dropdown-check"></span>
                <span class="fc-dropdown-text">Hint</span>
                <span class="fc-dropdown-shortcut">H</span>
              </button>
              <div class="fc-dropdown-separator" />
              <button class="fc-dropdown-item" onClick={() => setActiveMenu(null)}>
                <span class="fc-dropdown-check"></span>
                <span class="fc-dropdown-text">About FreeCell</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div class="fc-game-area" onClick={() => setSelectedCard(null)}>
        {/* Free Cells and Foundations */}
        <div class="fc-top-row">
          {/* Free Cells */}
          <div class="fc-cells-group">
            {gameState.freeCells.map((card, i) => {
              const isSelected = selectedCard?.source === 'freecell' && selectedCard?.index === i;
              const isHint = hintCard?.source === 'freecell' && hintCard?.index === i;
              const isBeingDragged = draggedCard?.source === 'freecell' && draggedCard?.index === i;
              const isDropTargetHere = dropTarget?.type === 'freecell' && dropTarget?.index === i;
              const isValidTarget = isDropTargetHere && isValidDropTarget('freecell', i);

              return (
                <div
                  class={`fc-slot ${!card ? 'fc-slot-empty' : ''} ${isValidTarget ? 'fc-drop-valid' : ''} ${isDropTargetHere && !isValidTarget ? 'fc-drop-invalid' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (card) {
                      handleCardClick('freecell', i);
                    } else if (selectedCard) {
                      handleSlotClick('freecell', i);
                    }
                  }}
                  onDblClick={(e) => {
                    e.stopPropagation();
                    if (card) {
                      handleDoubleClick('freecell', i);
                    }
                  }}
                  onDragOver={(e) => handleDragOver(e, 'freecell', i)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, 'freecell', i)}
                >
                  {card && <FreeCellCard card={card} isSelected={isSelected} isHint={isHint} isDragging={isBeingDragged} />}
                </div>
              );
            })}
          </div>

          {/* Foundations */}
          <div class="fc-cells-group">
            {gameState.foundations.map((card, i) => {
              const targetSuit = FOUNDATION_SUITS[i];
              const isDropTargetHere = dropTarget?.type === 'foundation' && dropTarget?.index === i;
              const isValidTarget = isDropTargetHere && isValidDropTarget('foundation', i);

              return (
                <div
                  class={`fc-slot fc-foundation-slot ${!card ? 'fc-slot-empty' : ''} ${isValidTarget ? 'fc-drop-valid' : ''} ${isDropTargetHere && !isValidTarget ? 'fc-drop-invalid' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (selectedCard) {
                      handleSlotClick('foundation', i);
                    }
                  }}
                  onDragOver={(e) => handleDragOver(e, 'foundation', i)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, 'foundation', i)}
                >
                  {!card && (
                    <span style={`font-size: 28px; opacity: 0.3; color: ${isRed(targetSuit) ? '#cc0000' : '#000'};`}>
                      {SUIT_SYMBOLS[targetSuit]}
                    </span>
                  )}
                  {card && <FreeCellCard card={card} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Tableau */}
        <div class="fc-tableau">
          {gameState.tableau.map((column, colIndex) => {
            const isDropTargetHere = dropTarget?.type === 'tableau' && dropTarget?.index === colIndex;
            const isValidTarget = isDropTargetHere && isValidDropTarget('tableau', colIndex);

            return (
              <div
                class={`fc-column ${isValidTarget ? 'fc-drop-valid' : ''} ${isDropTargetHere && !isValidTarget ? 'fc-drop-invalid' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (column.length === 0 && selectedCard) {
                    handleCardClick('tableau', colIndex);
                  }
                }}
                onDragOver={(e) => handleDragOver(e, 'tableau', colIndex)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'tableau', colIndex)}
              >
                {column.length === 0 && (
                  <div class="fc-slot fc-slot-empty" style="position: absolute; top: 0;" />
                )}
                {column.map((card, cardIndex) => {
                  if (!card) return null;
                  const isSelected = selectedCard?.source === 'tableau' &&
                                     selectedCard?.index === colIndex &&
                                     selectedCard?.cardIndex! <= cardIndex;
                  const isHint = hintCard?.source === 'tableau' &&
                                 hintCard?.index === colIndex &&
                                 (hintCard?.cardIndex ?? 0) <= cardIndex;
                  const isBeingDragged = draggedCard?.source === 'tableau' &&
                                         draggedCard?.index === colIndex &&
                                         (draggedCard?.cardIndex ?? 0) <= cardIndex;

                  return (
                    <div
                      style={`position: absolute; top: ${cardIndex * 20}px;`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCardClick('tableau', colIndex, cardIndex);
                      }}
                      onDblClick={(e) => {
                        e.stopPropagation();
                        handleDoubleClick('tableau', colIndex, cardIndex);
                      }}
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, 'tableau', colIndex, cardIndex)}
                      onDragEnd={handleDragEnd}
                    >
                      <FreeCellCard card={card} isSelected={isSelected} isHint={isHint} isDragging={isBeingDragged} />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Status bar */}
      <div class="fc-status">
        <span>Moves: {moves}</span>
        <span>Time: {formatTime(timer)}</span>
        <span>Game: {gameNumber}</span>
        {canAutoComplete() && (
          <button class="fc-autocomplete-btn" onClick={autoComplete}>
            Auto Complete
          </button>
        )}
      </div>

      {/* Win overlay */}
      {isWon && (
        <div class="fc-win-overlay">
          <div class="fc-win-message">
            <div class="fc-win-title">Congratulations!</div>
            <div class="fc-win-stats">
              <div>You won in {moves} moves!</div>
              <div>Time: {formatTime(timer)}</div>
              <div>Game #{gameNumber}</div>
              <div class="fc-win-streak">Current Streak: {stats.currentStreak}</div>
            </div>
            <button class="fc-win-btn" onClick={() => newGame()}>
              New Game
            </button>
          </div>
        </div>
      )}

      {/* Help Dialog */}
      {showHelp && (
        <div class="fc-help-overlay" onClick={() => setShowHelp(false)}>
          <div class="fc-help-dialog" onClick={(e) => e.stopPropagation()}>
            <div class="fc-help-titlebar">
              <span>FreeCell Help</span>
              <button class="fc-help-close" onClick={() => setShowHelp(false)}>×</button>
            </div>
            <div class="fc-help-content">
              <h3>Object of the Game</h3>
              <p>Move all the cards to the four foundation piles, building each up by suit from Ace to King.</p>

              <h3>Layout</h3>
              <ul>
                <li><strong>Free Cells (top-left):</strong> 4 cells where you can temporarily store any single card.</li>
                <li><strong>Foundations (top-right):</strong> 4 piles where you build up each suit from Ace to King.</li>
                <li><strong>Tableau:</strong> 8 columns where all 52 cards are dealt face-up at the start.</li>
              </ul>

              <h3>Rules</h3>
              <ul>
                <li><strong>Tableau building:</strong> Stack cards in descending order with alternating colors (red on black, black on red).</li>
                <li><strong>Foundations:</strong> Build up by suit from Ace to King (A, 2, 3... Q, K).</li>
                <li><strong>Free Cells:</strong> Only one card can occupy each free cell at a time.</li>
                <li><strong>Moving sequences:</strong> The number of cards you can move at once depends on empty free cells and empty columns:<br/>
                <em>Max cards = (free cells + 1) × 2^(empty columns)</em></li>
              </ul>

              <h3>Controls</h3>
              <ul>
                <li><strong>Click</strong> a card to select it (highlighted in yellow), then click a destination.</li>
                <li><strong>Drag</strong> a card and drop it on a valid location.</li>
                <li><strong>Double-click</strong> a card to auto-move it to a foundation if possible.</li>
              </ul>

              <h3>Keyboard Shortcuts</h3>
              <ul>
                <li><strong>F2</strong> or <strong>Ctrl+N</strong> - New Game</li>
                <li><strong>F3</strong> - Select Game</li>
                <li><strong>Ctrl+Z</strong> - Undo</li>
                <li><strong>H</strong> - Show Hint</li>
              </ul>

              <h3>Tips</h3>
              <ul>
                <li>Keep free cells empty when possible for more flexibility.</li>
                <li>Empty columns are very valuable - they double your moving capacity.</li>
                <li>Try to uncover Aces and low cards early.</li>
              </ul>
            </div>
            <div class="fc-help-buttons">
              <button class="fc-win-btn" onClick={() => setShowHelp(false)}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Dialog */}
      {showStats && (
        <div class="fc-help-overlay" onClick={() => setShowStats(false)}>
          <div class="fc-stats-dialog" onClick={(e) => e.stopPropagation()}>
            <div class="fc-help-titlebar">
              <span>FreeCell Statistics</span>
              <button class="fc-help-close" onClick={() => setShowStats(false)}>×</button>
            </div>
            <div class="fc-stats-content">
              <div class="fc-stat-row">
                <span class="fc-stat-label">Games Played:</span>
                <span class="fc-stat-value">{stats.gamesPlayed}</span>
              </div>
              <div class="fc-stat-row">
                <span class="fc-stat-label">Games Won:</span>
                <span class="fc-stat-value">{stats.gamesWon}</span>
              </div>
              <div class="fc-stat-row">
                <span class="fc-stat-label">Win Percentage:</span>
                <span class="fc-stat-value">{stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0}%</span>
              </div>
              <div class="fc-stat-row">
                <span class="fc-stat-label">Current Streak:</span>
                <span class="fc-stat-value">{stats.currentStreak}</span>
              </div>
              <div class="fc-stat-row">
                <span class="fc-stat-label">Best Streak:</span>
                <span class="fc-stat-value">{stats.bestStreak}</span>
              </div>
            </div>
            <div class="fc-stats-buttons">
              <button class="fc-win-btn" onClick={resetStats}>Reset</button>
              <button class="fc-win-btn" onClick={() => setShowStats(false)}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* Select Game Dialog */}
      {showSelectGame && (
        <div class="fc-help-overlay" onClick={() => setShowSelectGame(false)}>
          <div class="fc-stats-dialog" onClick={(e) => e.stopPropagation()}>
            <div class="fc-help-titlebar">
              <span>Select Game</span>
              <button class="fc-help-close" onClick={() => setShowSelectGame(false)}>×</button>
            </div>
            <div class="fc-selectgame-content">
              <p>Enter a game number (1-32000):</p>
              <input
                type="number"
                min="1"
                max="32000"
                value={selectGameInput || gameNumber}
                onInput={(e) => setSelectGameInput((e.target as HTMLInputElement).value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const num = parseInt(selectGameInput);
                    if (num >= 1 && num <= 32000) {
                      newGame(num);
                      setShowSelectGame(false);
                      setSelectGameInput('');
                    }
                  }
                }}
                autofocus
              />
            </div>
            <div class="fc-stats-buttons">
              <button class="fc-win-btn" onClick={() => {
                const num = parseInt(selectGameInput) || gameNumber;
                if (num >= 1 && num <= 32000) {
                  newGame(num);
                  setShowSelectGame(false);
                  setSelectGameInput('');
                }
              }}>OK</button>
              <button class="fc-win-btn" onClick={() => { setShowSelectGame(false); setSelectGameInput(''); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
