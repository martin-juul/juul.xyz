import { useState, useCallback, useEffect, useRef } from 'preact/hooks';
import { memo } from 'preact/compat';
import './solitaire.css';
import {
  type Card,
  SUIT_SYMBOLS,
  SUIT_COLORS,
  loadStats,
  saveStats,
  isRed,
} from '../../lib/card-games';
import {
  type KlondikeGameState,
  type KlondikeStats,
  type DragInfo,
} from './types';
import {
  FOUNDATION_SUITS,
  POINTS_WASTE_TO_TABLEAU,
  POINTS_WASTE_TO_FOUNDATION,
  POINTS_TABLEAU_TO_FOUNDATION,
  POINTS_FLIP_CARD,
  POINTS_RECYCLE_WASTE,
} from './constants';
import {
  createInitialGame,
  canPlaceOnTableau,
  canPlaceOnFoundation,
  dealFromStock,
  moveCards,
  isGameWon,
  findHint,
  autoMoveToFoundation,
} from './game-logic';

type SolitaireCardProps = {
  card: Card;
  columnIndex?: number;
  cardIndex?: number;
  topOffset: number;
  isSelected: boolean;
  isHinted: boolean;
  isBeingDragged: boolean;
  onClick: (source: 'tableau' | 'waste' | 'foundation', columnIndex?: number, cardIndex?: number) => void;
  onDoubleClick: (source: 'tableau' | 'waste' | 'foundation', columnIndex?: number, cardIndex?: number) => void;
  onDragStart: (e: DragEvent, source: 'tableau' | 'waste' | 'foundation', columnIndex?: number, cardIndex?: number) => void;
  onDragEnd: () => void;
};

const SolitaireCard = memo(function SolitaireCard({
  card,
  columnIndex,
  cardIndex,
  topOffset,
  isSelected,
  isHinted,
  isBeingDragged,
  onClick,
  onDoubleClick,
  onDragStart,
  onDragEnd,
}: SolitaireCardProps) {
  if (!card.faceUp) {
    return (
      <div
        class="solitaire-card face-down"
        style={`position: absolute; top: ${topOffset}px;`}
      />
    );
  }

  const colorClass = SUIT_COLORS[card.suit];

  return (
    <div
      class={`solitaire-card ${colorClass} ${isSelected ? 'selected' : ''} ${isHinted ? 'hint' : ''} ${isBeingDragged ? 'dragging' : ''}`}
      style={`position: absolute; top: ${topOffset}px;`}
      onClick={(e) => {
        e.stopPropagation();
        onClick('tableau', columnIndex, cardIndex);
      }}
      onDblClick={(e) => {
        e.stopPropagation();
        onDoubleClick('tableau', columnIndex, cardIndex);
      }}
      draggable={true}
      onDragStart={(e) => onDragStart(e, 'tableau', columnIndex, cardIndex)}
      onDragEnd={onDragEnd}
      data-testid={`solitaire-card-${card.suit}-${card.rank}`}
    >
      <div class="solitaire-card-rank">{card.rank}</div>
      <div class="solitaire-card-suit">{SUIT_SYMBOLS[card.suit]}</div>
    </div>
  );
});

export function Solitaire() {
  // Game state
  const [gameState, setGameState] = useState<KlondikeGameState>(() => createInitialGame());
  const [gameNumber, setGameNumber] = useState<number>(() => Math.floor(Math.random() * 32000) + 1);

  // UI state
  const [selectedCard, setSelectedCard] = useState<{ source: 'tableau' | 'waste' | 'foundation'; columnIndex?: number; cardIndex?: number } | null>(null);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [activeMenu, setActiveMenu] = useState<'game' | 'help' | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showSelectGame, setShowSelectGame] = useState(false);
  const [selectGameInput, setSelectGameInput] = useState('');
  const [hintCard, setHintCard] = useState<{ source: 'tableau' | 'waste'; columnIndex?: number; cardIndex?: number } | null>(null);

  // Drag and drop
  const [draggedCard, setDraggedCard] = useState<DragInfo | null>(null);
  const [dropTarget, setDropTarget] = useState<{ type: 'tableau' | 'foundation'; index: number } | null>(null);

  // Undo system
  const [moveHistory, setMoveHistory] = useState<{ state: KlondikeGameState; moves: number; score: number }[]>([]);

  // Statistics
  const [stats, setStats] = useState<KlondikeStats>(() => loadStats('solitaire-stats') as KlondikeStats);
  const gameCountedRef = useRef(false);
  const timerRef = useRef<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Save stats to localStorage
  useEffect(() => {
    saveStats('solitaire-stats', stats);
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
    if (isGameWon(gameState)) {
      setIsWon(true);
      if (!gameCountedRef.current) {
        setStats(prev => ({
          ...prev,
          gamesPlayed: prev.gamesPlayed + 1,
          gamesWon: prev.gamesWon + 1,
          currentStreak: prev.currentStreak + 1,
          bestStreak: Math.max(prev.bestStreak, prev.currentStreak + 1),
          bestScore: Math.max(prev.bestScore || 0, score),
          bestTime: Math.min(prev.bestTime || Infinity, timer),
          bestMoves: Math.min(prev.bestMoves || Infinity, moves),
        }));
        gameCountedRef.current = true;
      }
    }
  }, [gameState, score, timer, moves]);

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
    setMoveHistory(prev => [...prev, { state: gameState, moves, score }]);
  }, [gameState, moves, score]);

  // Undo function
  const undo = useCallback(() => {
    if (moveHistory.length === 0) return;
    const prev = moveHistory[moveHistory.length - 1];
    setGameState(prev.state);
    setMoves(prev.moves);
    setScore(prev.score);
    setMoveHistory(history => history.slice(0, -1));
    setSelectedCard(null);
    setHintCard(null);
  }, [moveHistory]);

  // Start new game
  const newGame = useCallback((newNumber?: number) => {
    const num = newNumber || Math.floor(Math.random() * 32000) + 1;
    setGameNumber(num);
    setGameState(createInitialGame(num));
    setSelectedCard(null);
    setMoves(0);
    setScore(0);
    setTimer(0);
    setIsWon(false);
    setActiveMenu(null);
    setMoveHistory([]);
    setHintCard(null);
    setShowSelectGame(false);
    setDraggedCard(null);
    setDropTarget(null);
    gameCountedRef.current = false;
  }, []);

  // Handle dealing from stock
  const handleDeal = useCallback(() => {
    if (isWon) return;

    saveState();
    const newState = dealFromStock(gameState);

    // Calculate score changes
    let scoreChange = 0;
    if (newState.stock.length < gameState.stock.length) {
      // Dealt a card - no points for dealing
    } else if (newState.waste.length === 0 && gameState.waste.length > 0) {
      // Recycled waste
      if (gameState.passCount >= 2) {
        scoreChange = POINTS_RECYCLE_WASTE;
      }
    }

    setGameState(newState);
    setMoves(m => m + 1);
    setScore(s => Math.max(0, s + scoreChange));
  }, [gameState, isWon, saveState]);

  // Execute a card move
  const executeMove = useCallback((
    from: { type: 'tableau' | 'waste' | 'foundation'; column?: number; cardIndex?: number },
    to: { type: 'tableau' | 'foundation'; index: number }
  ): boolean => {
    if (isWon) return false;

    const newState = moveCards(gameState, from, to);
    if (!newState) return false;

    saveState();

    // Calculate score changes
    let scoreChange = 0;
    if (from.type === 'waste' && to.type === 'tableau') {
      scoreChange = POINTS_WASTE_TO_TABLEAU;
    } else if (from.type === 'waste' && to.type === 'foundation') {
      scoreChange = POINTS_WASTE_TO_FOUNDATION;
    } else if (from.type === 'tableau' && to.type === 'foundation') {
      scoreChange = POINTS_TABLEAU_TO_FOUNDATION;
    }

    // Check if we flipped a card
    if (from.type === 'tableau' && from.column !== undefined && from.cardIndex !== undefined) {
      const oldColumn = gameState.tableau[from.column];
      const newColumn = newState.tableau[from.column];
      if (oldColumn.length > newColumn.length && newColumn.length > 0) {
        const newTopCard = newColumn[newColumn.length - 1];
        const oldTopAtNewLength = oldColumn[newColumn.length - 1];
        if (oldTopAtNewLength && !oldTopAtNewLength.faceUp && newTopCard.faceUp) {
          scoreChange += POINTS_FLIP_CARD;
        }
      }
    }

    // Auto-move to foundations
    const autoMovedState = autoMoveToFoundation(newState);

    setGameState(autoMovedState);
    setMoves(m => m + 1);
    setScore(s => Math.max(0, s + scoreChange));

    return true;
  }, [gameState, isWon, saveState]);

  // Handle double-click to auto-move to foundation
  const handleDoubleClick = useCallback((source: 'tableau' | 'waste' | 'foundation', columnIndex?: number, cardIndex?: number) => {
    if (isWon) return;

    let card: Card | null = null;

    if (source === 'tableau' && columnIndex !== undefined && cardIndex !== undefined) {
      const column = gameState.tableau[columnIndex];
      // Only double-click top card
      if (cardIndex !== column.length - 1) return;
      card = column[cardIndex];
    } else if (source === 'waste') {
      if (gameState.waste.length === 0) return;
      card = gameState.waste[gameState.waste.length - 1];
    }

    if (!card) return;

    // Find appropriate foundation
    for (let f = 0; f < 4; f++) {
      if (canPlaceOnFoundation(card, f, gameState.foundations)) {
        executeMove(
          { type: source, column: columnIndex, cardIndex },
          { type: 'foundation', index: f }
        );
        setSelectedCard(null);
        return;
      }
    }
  }, [gameState, isWon, executeMove]);

  // Handle card click
  const handleCardClick = useCallback((source: 'tableau' | 'waste' | 'foundation', columnIndex?: number, cardIndex?: number) => {
    if (isWon) return;

    if (!selectedCard) {
      setSelectedCard({ source, columnIndex, cardIndex });
    } else {
      // Try to move to the clicked location
      if (source === 'tableau' && columnIndex !== undefined) {
        executeMove(
          { type: selectedCard.source, column: selectedCard.columnIndex, cardIndex: selectedCard.cardIndex },
          { type: 'tableau', index: columnIndex }
        );
      } else if (source === 'foundation' && columnIndex !== undefined) {
        executeMove(
          { type: selectedCard.source, column: selectedCard.columnIndex, cardIndex: selectedCard.cardIndex },
          { type: 'foundation', index: columnIndex }
        );
      }
      setSelectedCard(null);
    }
    setHintCard(null);
  }, [selectedCard, isWon, executeMove]);

  // Handle empty column click
  const handleEmptyColumnClick = useCallback((columnIndex: number) => {
    if (!selectedCard || isWon) return;

    executeMove(
      { type: selectedCard.source, column: selectedCard.columnIndex, cardIndex: selectedCard.cardIndex },
      { type: 'tableau', index: columnIndex }
    );
    setSelectedCard(null);
    setHintCard(null);
  }, [selectedCard, isWon, executeMove]);

  // Handle foundation click
  const handleFoundationClick = useCallback((foundationIndex: number) => {
    if (!selectedCard || isWon) return;

    executeMove(
      { type: selectedCard.source, column: selectedCard.columnIndex, cardIndex: selectedCard.cardIndex },
      { type: 'foundation', index: foundationIndex }
    );
    setSelectedCard(null);
    setHintCard(null);
  }, [selectedCard, isWon, executeMove]);

  // Drag handlers
  const handleDragStart = useCallback((e: DragEvent, source: 'tableau' | 'waste' | 'foundation', columnIndex?: number, cardIndex?: number) => {
    if (isWon) {
      e.preventDefault();
      return;
    }

    let cards: Card[] = [];

    if (source === 'tableau' && columnIndex !== undefined && cardIndex !== undefined) {
      const column = gameState.tableau[columnIndex];
      cards = column.slice(cardIndex);
    } else if (source === 'waste') {
      if (gameState.waste.length > 0) {
        cards = [gameState.waste[gameState.waste.length - 1]];
      }
    } else if (source === 'foundation' && columnIndex !== undefined) {
      const foundation = gameState.foundations[columnIndex];
      if (foundation.length > 0) {
        cards = [foundation[foundation.length - 1]];
      }
    }

    if (cards.length === 0 || !cards[0].faceUp) {
      e.preventDefault();
      return;
    }

    setDraggedCard({ source, columnIndex, cardIndex, cards });
    setSelectedCard(null);

    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', '');
    }
  }, [gameState, isWon]);

  const handleDragEnd = useCallback(() => {
    setDraggedCard(null);
    setDropTarget(null);
  }, []);

  const handleDragOver = useCallback((e: DragEvent, type: 'tableau' | 'foundation', index: number) => {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
    setDropTarget({ type, index });
  }, []);

  const handleDragLeave = useCallback(() => {
    setDropTarget(null);
  }, []);

  const handleDrop = useCallback((e: DragEvent, type: 'tableau' | 'foundation', index: number) => {
    e.preventDefault();
    if (!draggedCard) return;

    executeMove(
      { type: draggedCard.source, column: draggedCard.columnIndex, cardIndex: draggedCard.cardIndex },
      { type, index }
    );

    setDraggedCard(null);
    setDropTarget(null);
  }, [draggedCard, executeMove]);

  // Check if drop target is valid
  const isValidDropTarget = useCallback((type: 'tableau' | 'foundation', index: number): boolean => {
    if (!draggedCard) return false;

    const { source, columnIndex, cards } = draggedCard;

    // Same location
    if (source === type && columnIndex === index) return false;

    if (type === 'tableau') {
      return canPlaceOnTableau(cards[0], gameState.tableau[index]);
    }

    if (type === 'foundation') {
      if (cards.length !== 1) return false;
      return canPlaceOnFoundation(cards[0], index, gameState.foundations);
    }

    return false;
  }, [draggedCard, gameState]);

  // Show hint
  const showHint = useCallback(() => {
    if (isWon) return;
    const hint = findHint(gameState);
    if (hint) {
      setHintCard({ source: hint.source, columnIndex: hint.columnIndex, cardIndex: hint.cardIndex });
      setTimeout(() => setHintCard(null), 2000);
    }
  }, [gameState, isWon]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2' || (e.ctrlKey && e.key === 'n')) {
        e.preventDefault();
        newGame();
      }
      if (e.key === 'F3') {
        e.preventDefault();
        setShowSelectGame(true);
        setActiveMenu(null);
      }
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        undo();
      }
      if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        showHint();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, showHint, newGame]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const resetStats = () => {
    setStats({
      gamesPlayed: 0,
      gamesWon: 0,
      currentStreak: 0,
      bestStreak: 0,
      bestScore: 0,
      bestTime: 0,
      bestMoves: 0,
    });
  };

  return (
    <div class="solitaire-container">
      {/* Menu Bar */}
      <div class="solitaire-menu-bar" ref={menuRef}>
        <div class="solitaire-menu-trigger">
          <span
            class={`solitaire-menu-item ${activeMenu === 'game' ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenu(activeMenu === 'game' ? null : 'game');
            }}
          >
            Game
          </span>
          {activeMenu === 'game' && (
            <div class="solitaire-dropdown">
              <button class="solitaire-dropdown-item" onClick={() => { newGame(); setActiveMenu(null); }}>
                <span class="solitaire-dropdown-check"></span>
                <span class="solitaire-dropdown-text">New Game</span>
                <span class="solitaire-dropdown-shortcut">F2</span>
              </button>
              <button class="solitaire-dropdown-item" onClick={() => { newGame(gameNumber); setActiveMenu(null); }}>
                <span class="solitaire-dropdown-check"></span>
                <span class="solitaire-dropdown-text">Restart Game</span>
              </button>
              <button class="solitaire-dropdown-item" onClick={() => { setShowSelectGame(true); setActiveMenu(null); }}>
                <span class="solitaire-dropdown-check"></span>
                <span class="solitaire-dropdown-text">Select Game...</span>
                <span class="solitaire-dropdown-shortcut">F3</span>
              </button>
              <div class="solitaire-dropdown-separator" />
              <button class="solitaire-dropdown-item" onClick={() => { undo(); setActiveMenu(null); }} disabled={moveHistory.length === 0}>
                <span class="solitaire-dropdown-check"></span>
                <span class="solitaire-dropdown-text">Undo</span>
                <span class="solitaire-dropdown-shortcut">Ctrl+Z</span>
              </button>
              <div class="solitaire-dropdown-separator" />
              <button class="solitaire-dropdown-item" onClick={() => { setShowStats(true); setActiveMenu(null); }}>
                <span class="solitaire-dropdown-check"></span>
                <span class="solitaire-dropdown-text">Statistics...</span>
              </button>
            </div>
          )}
        </div>
        <div class="solitaire-menu-trigger">
          <span
            class={`solitaire-menu-item ${activeMenu === 'help' ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenu(activeMenu === 'help' ? null : 'help');
            }}
          >
            Help
          </span>
          {activeMenu === 'help' && (
            <div class="solitaire-dropdown">
              <button class="solitaire-dropdown-item" onClick={() => { setShowHelp(true); setActiveMenu(null); }}>
                <span class="solitaire-dropdown-check"></span>
                <span class="solitaire-dropdown-text">How to Play</span>
              </button>
              <button class="solitaire-dropdown-item" onClick={() => { showHint(); setActiveMenu(null); }}>
                <span class="solitaire-dropdown-check"></span>
                <span class="solitaire-dropdown-text">Hint</span>
                <span class="solitaire-dropdown-shortcut">H</span>
              </button>
              <div class="solitaire-dropdown-separator" />
              <button class="solitaire-dropdown-item" onClick={() => setActiveMenu(null)}>
                <span class="solitaire-dropdown-check"></span>
                <span class="solitaire-dropdown-text">About Solitaire</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Game Area */}
      <div class="solitaire-game-area" onClick={() => setSelectedCard(null)}>
        {/* Top Row - Stock, Waste, and Foundations */}
        <div class="solitaire-top-row">
          {/* Stock and Waste */}
          <div class="solitaire-stock-area">
            {/* Stock */}
            <div
              class={`solitaire-stock ${gameState.stock.length === 0 ? 'empty' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                handleDeal();
              }}
            >
              {gameState.stock.length > 0 && (
                <div class="solitaire-stock-count">{gameState.stock.length}</div>
              )}
            </div>

            {/* Waste */}
            <div
              class={`solitaire-waste ${gameState.waste.length === 0 ? 'empty' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                if (gameState.waste.length > 0) {
                  handleCardClick('waste');
                }
              }}
              onDragOver={(e) => handleDragOver(e, 'tableau', -1)}
              onDragLeave={handleDragLeave}
            >
              {gameState.waste.length > 0 && (() => {
                const card = gameState.waste[gameState.waste.length - 1];
                const isSelected = selectedCard?.source === 'waste';
                const isHinted = hintCard?.source === 'waste';
                const isBeingDragged = draggedCard?.source === 'waste';

                return (
                  <div
                    class={`solitaire-card ${SUIT_COLORS[card.suit]} ${isSelected ? 'selected' : ''} ${isHinted ? 'hint' : ''} ${isBeingDragged ? 'dragging' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCardClick('waste');
                    }}
                    onDblClick={(e) => {
                      e.stopPropagation();
                      handleDoubleClick('waste');
                    }}
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, 'waste')}
                    onDragEnd={handleDragEnd}
                    style="position: absolute; top: 0; left: 0;"
                  >
                    <div class="solitaire-card-rank">{card.rank}</div>
                    <div class="solitaire-card-suit">{SUIT_SYMBOLS[card.suit]}</div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Foundations */}
          <div class="solitaire-foundations">
            {gameState.foundations.map((foundation, i) => {
              const targetSuit = FOUNDATION_SUITS[i];
              const isDropTargetHere = dropTarget?.type === 'foundation' && dropTarget?.index === i;
              const isValidTarget = isDropTargetHere && isValidDropTarget('foundation', i);
              const topCard = foundation.length > 0 ? foundation[foundation.length - 1] : null;

              return (
                <div
                  class={`solitaire-foundation ${isValidTarget ? 'solitaire-drop-valid' : ''} ${isDropTargetHere && !isValidTarget ? 'solitaire-drop-invalid' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFoundationClick(i);
                  }}
                  onDragOver={(e) => handleDragOver(e, 'foundation', i)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, 'foundation', i)}
                >
                  {!topCard && (
                    <span class="solitaire-foundation-placeholder" style={`color: ${isRed(targetSuit) ? '#cc0000' : '#000'};`}>
                      {SUIT_SYMBOLS[targetSuit]}
                    </span>
                  )}
                  {topCard && (
                    <div
                      class={`solitaire-card ${SUIT_COLORS[topCard.suit]}`}
                      style="position: absolute; top: 0; left: 0;"
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, 'foundation', i)}
                      onDragEnd={handleDragEnd}
                    >
                      <div class="solitaire-card-rank">{topCard.rank}</div>
                      <div class="solitaire-card-suit">{SUIT_SYMBOLS[topCard.suit]}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Tableau */}
        <div class="solitaire-tableau">
          {gameState.tableau.map((column, colIndex) => {
            const isDropTargetHere = dropTarget?.type === 'tableau' && dropTarget?.index === colIndex;
            const isValidTarget = isDropTargetHere && isValidDropTarget('tableau', colIndex);

            return (
              <div
                class={`solitaire-column ${isValidTarget ? 'solitaire-drop-valid' : ''} ${isDropTargetHere && !isValidTarget ? 'solitaire-drop-invalid' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (column.length === 0) {
                    handleEmptyColumnClick(colIndex);
                  }
                }}
                onDragOver={(e) => handleDragOver(e, 'tableau', colIndex)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'tableau', colIndex)}
              >
                {column.length === 0 && (
                  <div class="solitaire-slot" />
                )}
                {column.map((card, cardIndex) => {
                  const topOffset = cardIndex * 18;
                  const isSelected = selectedCard?.source === 'tableau' &&
                                     selectedCard?.columnIndex === colIndex &&
                                     selectedCard?.cardIndex !== undefined &&
                                     selectedCard?.cardIndex <= cardIndex;
                  const isHinted = hintCard?.source === 'tableau' &&
                                   hintCard?.columnIndex === colIndex &&
                                   hintCard?.cardIndex !== undefined &&
                                   hintCard?.cardIndex <= cardIndex;
                  const isBeingDragged = draggedCard?.source === 'tableau' &&
                                         draggedCard?.columnIndex === colIndex &&
                                         draggedCard?.cardIndex !== undefined &&
                                         draggedCard?.cardIndex <= cardIndex;

                  return (
                    <SolitaireCard
                      card={card}
                      columnIndex={colIndex}
                      cardIndex={cardIndex}
                      topOffset={topOffset}
                      isSelected={isSelected}
                      isHinted={isHinted}
                      isBeingDragged={isBeingDragged}
                      onClick={handleCardClick}
                      onDoubleClick={handleDoubleClick}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Status bar */}
      <div class="solitaire-status">
        <div class="solitaire-status-left">
          <span>Score: {score}</span>
          <span>Moves: {moves}</span>
          <span>Time: {formatTime(timer)}</span>
        </div>
        <div class="solitaire-status-right">
          <span>Game: {gameNumber}</span>
        </div>
      </div>

      {/* Win overlay */}
      {isWon && (
        <div class="solitaire-win-overlay">
          <div class="solitaire-win-message">
            <div class="solitaire-win-title">Congratulations!</div>
            <div class="solitaire-win-stats">
              <div>You won!</div>
              <div>Score: {score}</div>
              <div>Time: {formatTime(timer)}</div>
              <div>Moves: {moves}</div>
              <div>Game #{gameNumber}</div>
              <div class="solitaire-win-streak">Current Streak: {stats.currentStreak}</div>
            </div>
            <button class="solitaire-win-btn" onClick={() => newGame()}>
              New Game
            </button>
          </div>
        </div>
      )}

      {/* Help Dialog */}
      {showHelp && (
        <div class="solitaire-help-overlay" onClick={() => setShowHelp(false)}>
          <div class="solitaire-help-dialog" onClick={(e) => e.stopPropagation()}>
            <div class="solitaire-help-titlebar">
              <span>Solitaire Help</span>
              <button class="solitaire-help-close" onClick={() => setShowHelp(false)}>×</button>
            </div>
            <div class="solitaire-help-content">
              <h3>Object of the Game</h3>
              <p>Move all the cards to the four foundation piles, building each up by suit from Ace to King.</p>

              <h3>Layout</h3>
              <ul>
                <li><strong>Stock:</strong> Click to deal one card at a time to the waste pile.</li>
                <li><strong>Waste:</strong> Cards dealt from the stock. Top card can be played.</li>
                <li><strong>Foundations:</strong> Four piles where you build up each suit from Ace to King.</li>
                <li><strong>Tableau:</strong> Seven columns where you build down in alternating colors.</li>
              </ul>

              <h3>Rules</h3>
              <ul>
                <li><strong>Tableau building:</strong> Stack cards in descending order with alternating colors (red on black, black on red).</li>
                <li><strong>Empty columns:</strong> Only Kings can be placed on empty tableau columns.</li>
                <li><strong>Foundations:</strong> Build up by suit from Ace to King (A, 2, 3... Q, K).</li>
                <li><strong>Stock:</strong> Click to deal one card to waste. When empty, click to recycle waste back to stock.</li>
              </ul>

              <h3>Controls</h3>
              <ul>
                <li><strong>Click</strong> a card to select it, then click a destination.</li>
                <li><strong>Drag</strong> cards and drop them on a valid location.</li>
                <li><strong>Double-click</strong> a card to auto-move it to a foundation if possible.</li>
              </ul>

              <h3>Keyboard Shortcuts</h3>
              <ul>
                <li><strong>F2</strong> - New Game</li>
                <li><strong>F3</strong> - Select Game</li>
                <li><strong>Ctrl+Z</strong> - Undo</li>
                <li><strong>H</strong> - Show Hint</li>
              </ul>

              <h3>Scoring</h3>
              <ul>
                <li>Waste to tableau: +5 points</li>
                <li>Waste to foundation: +10 points</li>
                <li>Tableau to foundation: +10 points</li>
                <li>Flip a face-down card: +5 points</li>
                <li>Recycle waste (after 3 passes): -20 points</li>
              </ul>
            </div>
            <div class="solitaire-help-buttons">
              <button class="solitaire-win-btn" onClick={() => setShowHelp(false)}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Dialog */}
      {showStats && (
        <div class="solitaire-help-overlay" onClick={() => setShowStats(false)}>
          <div class="solitaire-stats-dialog" onClick={(e) => e.stopPropagation()}>
            <div class="solitaire-help-titlebar">
              <span>Solitaire Statistics</span>
              <button class="solitaire-help-close" onClick={() => setShowStats(false)}>×</button>
            </div>
            <div class="solitaire-stats-content">
              <div class="solitaire-stat-row">
                <span class="solitaire-stat-label">Games Played:</span>
                <span class="solitaire-stat-value">{stats.gamesPlayed}</span>
              </div>
              <div class="solitaire-stat-row">
                <span class="solitaire-stat-label">Games Won:</span>
                <span class="solitaire-stat-value">{stats.gamesWon}</span>
              </div>
              <div class="solitaire-stat-row">
                <span class="solitaire-stat-label">Win Percentage:</span>
                <span class="solitaire-stat-value">{stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0}%</span>
              </div>
              <div class="solitaire-stat-row">
                <span class="solitaire-stat-label">Current Streak:</span>
                <span class="solitaire-stat-value">{stats.currentStreak}</span>
              </div>
              <div class="solitaire-stat-row">
                <span class="solitaire-stat-label">Best Streak:</span>
                <span class="solitaire-stat-value">{stats.bestStreak}</span>
              </div>
              <div class="solitaire-stat-row">
                <span class="solitaire-stat-label">Best Score:</span>
                <span class="solitaire-stat-value">{stats.bestScore || 0}</span>
              </div>
              <div class="solitaire-stat-row">
                <span class="solitaire-stat-label">Best Time:</span>
                <span class="solitaire-stat-value">{stats.bestTime ? formatTime(stats.bestTime) : '-'}</span>
              </div>
            </div>
            <div class="solitaire-stats-buttons">
              <button class="solitaire-win-btn" onClick={resetStats}>Reset</button>
              <button class="solitaire-win-btn" onClick={() => setShowStats(false)}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* Select Game Dialog */}
      {showSelectGame && (
        <div class="solitaire-help-overlay" onClick={() => setShowSelectGame(false)}>
          <div class="solitaire-stats-dialog" onClick={(e) => e.stopPropagation()}>
            <div class="solitaire-help-titlebar">
              <span>Select Game</span>
              <button class="solitaire-help-close" onClick={() => setShowSelectGame(false)}>×</button>
            </div>
            <div class="solitaire-selectgame-content">
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
                style="width: 120px; padding: 4px 8px; border: 2px solid; border-color: #808080 #ffffff #ffffff #808080; background: white; font-family: 'MS Sans Serif', 'Segoe UI', Tahoma, sans-serif; font-size: 12px; text-align: center;"
              />
            </div>
            <div class="solitaire-stats-buttons">
              <button class="solitaire-win-btn" onClick={() => {
                const num = parseInt(selectGameInput) || gameNumber;
                if (num >= 1 && num <= 32000) {
                  newGame(num);
                  setShowSelectGame(false);
                  setSelectGameInput('');
                }
              }}>OK</button>
              <button class="solitaire-win-btn" onClick={() => { setShowSelectGame(false); setSelectGameInput(''); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
