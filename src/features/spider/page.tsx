import { useState, useCallback, useEffect, useRef } from 'preact/hooks';
import { memo } from 'preact/compat';
import { useLanguage } from '../../context/language-context';
import './spider.css';
import {
  type Card,
  SUIT_SYMBOLS,
  SUIT_COLORS,
  loadStats,
  saveStats,
} from '../../lib/card-games';
import {
  type SpiderDifficulty,
  type SpiderGameState,
  type SpiderStats,
  type DragInfo,
} from './types';
import {
  TABLEAU_COLUMNS,
  DIFFICULTY_CONFIG,
  POINTS_INITIAL,
  POINTS_PER_MOVE,
  POINTS_PER_SEQUENCE,
} from './constants';
import {
  createInitialGame,
  isValidSpiderSequence,
  canPlaceOnColumn,
  dealFromStock,
  canDeal,
  isGameWon,
  moveCards,
  autoCompleteSequences,
  getMaxMovableCards,
} from './game-logic';

type SpiderCardProps = {
  card: Card;
  column: number;
  cardIndex: number;
  topOffset: number;
  isSelected: boolean;
  isHinted: boolean;
  isBeingDragged: boolean;
  onClick: (column: number, cardIndex: number) => void;
  onDragStart: (e: DragEvent, column: number, cardIndex: number) => void;
  onDragEnd: () => void;
};

const SpiderCard = memo(function SpiderCard({
  card,
  column,
  cardIndex,
  topOffset,
  isSelected,
  isHinted,
  isBeingDragged,
  onClick,
  onDragStart,
  onDragEnd,
}: SpiderCardProps) {
  if (!card.faceUp) {
    return (
      <div
        class="spider-card face-down"
        style={`position: absolute; top: ${topOffset}px;`}
      />
    );
  }

  const colorClass = SUIT_COLORS[card.suit];

  return (
    <div
      class={`spider-card ${colorClass} ${isSelected ? 'selected' : ''} ${isHinted ? 'hint' : ''} ${isBeingDragged ? 'dragging' : ''}`}
      style={`position: absolute; top: ${topOffset}px;`}
      onClick={(e) => {
        e.stopPropagation();
        onClick(column, cardIndex);
      }}
      draggable={true}
      onDragStart={(e) => onDragStart(e, column, cardIndex)}
      onDragEnd={onDragEnd}
      data-testid={`spider-card-${card.suit}-${card.rank}`}
    >
      <div class="spider-card-rank">{card.rank}</div>
      <div class="spider-card-suit">{SUIT_SYMBOLS[card.suit]}</div>
    </div>
  );
});

export function Spider() {
  const { t } = useLanguage();
  const txt = t.spider;
  // Game settings
  const [difficulty, setDifficulty] = useState<SpiderDifficulty>(1);
  const [gameNumber, setGameNumber] = useState<number>(() => Math.floor(Math.random() * 32000) + 1);

  // Game state
  const [gameState, setGameState] = useState<SpiderGameState>(() => createInitialGame(1));

  // UI state
  const [selectedCard, setSelectedCard] = useState<{ column: number; cardIndex: number } | null>(null);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(POINTS_INITIAL);
  const [timer, setTimer] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [activeMenu, setActiveMenu] = useState<'game' | 'help' | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showDifficulty, setShowDifficulty] = useState(false);
  const [showSelectGame, setShowSelectGame] = useState(false);
  const [selectGameInput, setSelectGameInput] = useState('');
  const [hintCard, setHintCard] = useState<{ column: number; cardIndex: number } | null>(null);

  // Drag and drop
  const [draggedCard, setDraggedCard] = useState<DragInfo | null>(null);
  const [dropTarget, setDropTarget] = useState<number | null>(null);

  // Undo system
  const [moveHistory, setMoveHistory] = useState<{ state: SpiderGameState; moves: number; score: number }[]>([]);

  // Statistics
  const [stats, setStats] = useState<SpiderStats>(() => loadStats('spider-stats') as SpiderStats);
  const gameCountedRef = useRef(false);
  const timerRef = useRef<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Save stats to localStorage
  useEffect(() => {
    saveStats('spider-stats', stats);
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
        const finalScore = score + POINTS_PER_SEQUENCE * gameState.completed.length;
        setStats(prev => ({
          ...prev,
          gamesPlayed: prev.gamesPlayed + 1,
          gamesWon: prev.gamesWon + 1,
          currentStreak: prev.currentStreak + 1,
          bestStreak: Math.max(prev.bestStreak, prev.currentStreak + 1),
          bestScore: Math.max(prev.bestScore || 0, finalScore),
          bestTime: Math.min(prev.bestTime || Infinity, timer),
        }));
        gameCountedRef.current = true;
      }
    }
  }, [gameState, score, timer]);

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
  const newGame = useCallback((newNumber?: number, newDifficulty?: SpiderDifficulty) => {
    const num = newNumber || Math.floor(Math.random() * 32000) + 1;
    const diff = newDifficulty !== undefined ? newDifficulty : difficulty;
    setGameNumber(num);
    setDifficulty(diff);
    setGameState(createInitialGame(diff, num));
    setSelectedCard(null);
    setMoves(0);
    setScore(POINTS_INITIAL);
    setTimer(0);
    setIsWon(false);
    setActiveMenu(null);
    setMoveHistory([]);
    setHintCard(null);
    setShowSelectGame(false);
    setShowDifficulty(false);
    setDraggedCard(null);
    setDropTarget(null);
    gameCountedRef.current = false;
  }, [difficulty]);

  // Handle dealing from stock
  const handleDeal = useCallback(() => {
    if (!canDeal(gameState) || isWon) return;

    saveState();
    const newState = dealFromStock(gameState);
    if (newState) {
      // Auto-complete any sequences after dealing
      const completedState = autoCompleteSequences(newState);
      setGameState(completedState);
      setMoves(m => m + 1);
      setScore(s => s + POINTS_PER_MOVE);
    }
  }, [gameState, isWon, saveState]);

  // Execute a card move
  const executeMove = useCallback((fromColumn: number, fromIndex: number, toColumn: number) => {
    if (isWon) return false;

    const newState = moveCards(gameState, fromColumn, fromIndex, toColumn, difficulty);
    if (!newState) return false;

    saveState();

    // Auto-complete any sequences
    const completedState = autoCompleteSequences(newState);
    const sequencesCompleted = completedState.completed.length - gameState.completed.length;

    setGameState(completedState);
    setMoves(m => m + 1);
    setScore(s => s + POINTS_PER_MOVE + (sequencesCompleted * POINTS_PER_SEQUENCE));

    return true;
  }, [gameState, difficulty, isWon, saveState]);

  // Handle card click
  const handleCardClick = useCallback((column: number, cardIndex: number) => {
    if (isWon) return;

    const columnCards = gameState.tableau[column];
    const card = columnCards[cardIndex];

    // Can't click face-down cards
    if (!card.faceUp) return;

    if (!selectedCard) {
      // Select the card and any valid sequence below it
      const cardsToSelect = columnCards.slice(cardIndex);
      if (isValidSpiderSequence(cardsToSelect, difficulty)) {
        setSelectedCard({ column, cardIndex });
      }
    } else {
      // Try to move to this column
      if (column !== selectedCard.column) {
        executeMove(selectedCard.column, selectedCard.cardIndex, column);
      }
      setSelectedCard(null);
    }
    setHintCard(null);
  }, [gameState, difficulty, selectedCard, isWon, executeMove]);

  // Handle empty column click
  const handleEmptyColumnClick = useCallback((column: number) => {
    if (!selectedCard || isWon) return;

    executeMove(selectedCard.column, selectedCard.cardIndex, column);
    setSelectedCard(null);
    setHintCard(null);
  }, [selectedCard, isWon, executeMove]);

  // Drag handlers
  const handleDragStart = useCallback((e: DragEvent, column: number, cardIndex: number) => {
    if (isWon) {
      e.preventDefault();
      return;
    }

    const columnCards = gameState.tableau[column];
    const cardsToMove = columnCards.slice(cardIndex);

    if (!isValidSpiderSequence(cardsToMove, difficulty)) {
      e.preventDefault();
      return;
    }

    setDraggedCard({ source: 'tableau', columnIndex: column, cardIndex, cards: cardsToMove });
    setSelectedCard(null);

    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', '');
    }
  }, [gameState, difficulty, isWon]);

  const handleDragEnd = useCallback(() => {
    setDraggedCard(null);
    setDropTarget(null);
  }, []);

  const handleDragOver = useCallback((e: DragEvent, column: number) => {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
    setDropTarget(column);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDropTarget(null);
  }, []);

  const handleDrop = useCallback((e: DragEvent, column: number) => {
    e.preventDefault();
    if (!draggedCard) return;

    executeMove(draggedCard.columnIndex, draggedCard.cardIndex, column);

    setDraggedCard(null);
    setDropTarget(null);
  }, [draggedCard, executeMove]);

  // Check if drop target is valid
  const isValidDropTarget = useCallback((column: number): boolean => {
    if (!draggedCard) return false;
    if (draggedCard.columnIndex === column) return false;
    return canPlaceOnColumn(draggedCard.cards, gameState.tableau[column]);
  }, [draggedCard, gameState.tableau]);

  // Find a hint
  const findHint = useCallback((): { column: number; cardIndex: number; targetColumn: number } | null => {
    // Find any valid move
    for (let fromCol = 0; fromCol < TABLEAU_COLUMNS; fromCol++) {
      const column = gameState.tableau[fromCol];

      for (let cardIdx = column.length - 1; cardIdx >= 0; cardIdx--) {
        const card = column[cardIdx];
        if (!card.faceUp) break;

        const cardsToMove = column.slice(cardIdx);
        if (!isValidSpiderSequence(cardsToMove, difficulty)) continue;

        // Check if sequence length is within max movable
        if (cardsToMove.length > 1) {
          const suit = cardsToMove[0].suit;
          if (!cardsToMove.every(c => c.suit === suit)) continue;
        }

        for (let toCol = 0; toCol < TABLEAU_COLUMNS; toCol++) {
          if (toCol === fromCol) continue;
          if (canPlaceOnColumn(cardsToMove, gameState.tableau[toCol])) {
            // Check max movable cards for this destination
            const maxMovable = getMaxMovableCards(gameState, difficulty, toCol);
            if (cardsToMove.length > maxMovable) continue;

            // Don't suggest moving to empty column unless it's a King
            if (gameState.tableau[toCol].length === 0 && card.rank !== 'K') continue;
            return { column: fromCol, cardIndex: cardIdx, targetColumn: toCol };
          }
        }
      }
    }
    return null;
  }, [gameState, difficulty]);

  // Show hint
  const showHint = useCallback(() => {
    if (isWon) return;
    const hint = findHint();
    if (hint) {
      setHintCard({ column: hint.column, cardIndex: hint.cardIndex });
      setTimeout(() => setHintCard(null), 2000);
    }
  }, [findHint, isWon]);

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
    });
  };

  const getDifficultyLabel = () => DIFFICULTY_CONFIG[difficulty].label;

  return (
    <div class="spider-container">
      {/* Menu Bar */}
      <div class="spider-menu-bar" ref={menuRef}>
        <div class="spider-menu-trigger">
          <span
            class={`spider-menu-item ${activeMenu === 'game' ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenu(activeMenu === 'game' ? null : 'game');
            }}
          >
            {txt.menu.game}
          </span>
          {activeMenu === 'game' && (
            <div class="spider-dropdown">
              <button class="spider-dropdown-item" onClick={() => { newGame(); setActiveMenu(null); }}>
                <span class="spider-dropdown-check"></span>
                <span class="spider-dropdown-text">{txt.game.newGame}</span>
                <span class="spider-dropdown-shortcut">F2</span>
              </button>
              <button class="spider-dropdown-item" onClick={() => { newGame(gameNumber); setActiveMenu(null); }}>
                <span class="spider-dropdown-check"></span>
                <span class="spider-dropdown-text">{txt.game.restartGame}</span>
              </button>
              <button class="spider-dropdown-item" onClick={() => { setShowSelectGame(true); setActiveMenu(null); }}>
                <span class="spider-dropdown-check"></span>
                <span class="spider-dropdown-text">{txt.game.selectGame}</span>
                <span class="spider-dropdown-shortcut">F3</span>
              </button>
              <div class="spider-dropdown-separator" />
              <button class="spider-dropdown-item" onClick={() => { undo(); setActiveMenu(null); }} disabled={moveHistory.length === 0}>
                <span class="spider-dropdown-check"></span>
                <span class="spider-dropdown-text">{txt.game.undo}</span>
                <span class="spider-dropdown-shortcut">Ctrl+Z</span>
              </button>
              <div class="spider-dropdown-separator" />
              <button class="spider-dropdown-item" onClick={() => { setShowStats(true); setActiveMenu(null); }}>
                <span class="spider-dropdown-check"></span>
                <span class="spider-dropdown-text">{txt.game.statistics}</span>
              </button>
              <div class="spider-dropdown-separator" />
              <button class="spider-dropdown-item" onClick={() => { setShowDifficulty(true); setActiveMenu(null); }}>
                <span class="spider-dropdown-check"></span>
                <span class="spider-dropdown-text">{txt.game.difficulty}</span>
              </button>
            </div>
          )}
        </div>
        <div class="spider-menu-trigger">
          <span
            class={`spider-menu-item ${activeMenu === 'help' ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenu(activeMenu === 'help' ? null : 'help');
            }}
          >
            {txt.menu.help}
          </span>
          {activeMenu === 'help' && (
            <div class="spider-dropdown">
              <button class="spider-dropdown-item" onClick={() => { setShowHelp(true); setActiveMenu(null); }}>
                <span class="spider-dropdown-check"></span>
                <span class="spider-dropdown-text">{txt.help.howToPlay}</span>
              </button>
              <button class="spider-dropdown-item" onClick={() => { showHint(); setActiveMenu(null); }}>
                <span class="spider-dropdown-check"></span>
                <span class="spider-dropdown-text">{txt.help.hint}</span>
                <span class="spider-dropdown-shortcut">H</span>
              </button>
              <div class="spider-dropdown-separator" />
              <button class="spider-dropdown-item" onClick={() => setActiveMenu(null)}>
                <span class="spider-dropdown-check"></span>
                <span class="spider-dropdown-text">{txt.help.about}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Game Area */}
      <div class="spider-game-area" onClick={() => setSelectedCard(null)}>
        {/* Tableau */}
        <div class="spider-tableau">
          {gameState.tableau.map((column, colIndex) => {
            const isDropTargetHere = dropTarget === colIndex;
            const isValidTarget = isDropTargetHere && isValidDropTarget(colIndex);

            return (
              <div
                class={`spider-column ${isValidTarget ? 'spider-drop-valid' : ''} ${isDropTargetHere && !isValidTarget ? 'spider-drop-invalid' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (column.length === 0) {
                    handleEmptyColumnClick(colIndex);
                  }
                }}
                onDragOver={(e) => handleDragOver(e, colIndex)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, colIndex)}
              >
                {column.length === 0 && (
                  <div class="spider-slot" />
                )}
                {column.map((card, cardIndex) => {
                  const topOffset = cardIndex * 18;
                  const isSelected = selectedCard?.column === colIndex && selectedCard?.cardIndex <= cardIndex;
                  const isHinted = hintCard?.column === colIndex && hintCard?.cardIndex <= cardIndex;
                  const isBeingDragged = draggedCard?.columnIndex === colIndex && draggedCard?.cardIndex <= cardIndex;

                  return (
                    <SpiderCard
                      card={card}
                      column={colIndex}
                      cardIndex={cardIndex}
                      topOffset={topOffset}
                      isSelected={isSelected}
                      isHinted={isHinted}
                      isBeingDragged={isBeingDragged}
                      onClick={handleCardClick}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Bottom Row - Completed and Stock */}
        <div class="spider-bottom-row">
          {/* Completed sequences */}
          <div class="spider-completed">
            {[...Array(8)].map((_, i) => {
              const sequence = gameState.completed[i];
              if (sequence) {
                const suit = sequence[0].suit;
                const colorClass = SUIT_COLORS[suit];
                return (
                  <div class="spider-completed-slot filled">
                    <span class={`spider-completed-suit ${colorClass}`}>
                      {SUIT_SYMBOLS[suit]}
                    </span>
                  </div>
                );
              }
              return <div class="spider-completed-slot" />;
            })}
          </div>

          {/* Stock piles */}
          <div class="spider-stock">
            {[...Array(5)].map((_, i) => {
              const cardsRemaining = gameState.stock.length;
              const pileIndex = 4 - i;
              const pileHasCards = cardsRemaining > pileIndex * 10;

              return (
                <div
                  class={`spider-stock-pile ${!pileHasCards ? 'empty' : ''}`}
                  onClick={pileHasCards ? handleDeal : undefined}
                  style={`z-index: ${i};`}
                >
                  {pileHasCards && pileIndex === Math.floor(cardsRemaining / 10) && (
                    <span class="spider-stock-count">{cardsRemaining}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div class="spider-status">
        <div class="spider-status-left">
          <span>{txt.status.moves}: {moves}</span>
          <span>{txt.status.score}: {score}</span>
          <span>{txt.status.time}: {formatTime(timer)}</span>
        </div>
        <div class="spider-status-right">
          <span class="spider-difficulty-badge">{getDifficultyLabel()}</span>
          <span>{txt.status.game}: {gameNumber}</span>
        </div>
      </div>

      {/* Win overlay */}
      {isWon && (
        <div class="spider-win-overlay">
          <div class="spider-win-message">
            <div class="spider-win-title">{txt.win.congratulations}</div>
            <div class="spider-win-stats">
              <div>{txt.win.youWon}</div>
              <div>{txt.win.score}: {score}</div>
              <div>{txt.win.time}: {formatTime(timer)}</div>
              <div>{txt.win.moves}: {moves}</div>
              <div>{txt.win.gameNumber.replace('{number}', String(gameNumber))}</div>
              <div class="spider-win-streak">{txt.win.currentStreak}: {stats.currentStreak}</div>
            </div>
            <button class="spider-win-btn" onClick={() => newGame()}>
              {txt.win.newGame}
            </button>
          </div>
        </div>
      )}

      {/* Help Dialog */}
      {showHelp && (
        <div class="spider-help-overlay" onClick={() => setShowHelp(false)}>
          <div class="spider-help-dialog" onClick={(e) => e.stopPropagation()}>
            <div class="spider-help-titlebar">
              <span>{txt.helpDialog.title}</span>
              <button class="spider-help-close" onClick={() => setShowHelp(false)}>×</button>
            </div>
            <div class="spider-help-content">
              <h3>Object of the Game</h3>
              <p>Build eight sequences of cards in descending order from King to Ace, all of the same suit. Complete sequences are automatically removed to the foundation.</p>

              <h3>Layout</h3>
              <ul>
                <li><strong>Tableau:</strong> 10 columns of cards. First 4 columns have 6 cards, last 6 have 5 cards. Only the top card is face-up initially.</li>
                <li><strong>Stock:</strong> 50 remaining cards (5 deals of 10 cards each). Click to deal one card to each column.</li>
                <li><strong>Completed:</strong> Eight spaces for completed K-A sequences.</li>
              </ul>

              <h3>Rules</h3>
              <ul>
                <li><strong>Building:</strong> Cards can be placed on any card that is one rank higher, regardless of suit.</li>
                <li><strong>Moving sequences:</strong> A sequence of cards in descending order can be moved together. However, you can only move a sequence if it's all the same suit.</li>
                <li><strong>Empty columns:</strong> Any card or valid sequence can be moved to an empty column.</li>
                <li><strong>Dealing:</strong> Click the stock to deal one card to each column. All columns must have at least one card to deal.</li>
                <li><strong>Completing:</strong> When you create a complete K-A sequence of the same suit, it automatically moves to the foundation.</li>
              </ul>

              <h3>Difficulty Levels</h3>
              <ul>
                <li><strong>1 Suit (Easy):</strong> All cards are Spades. Easier to build sequences.</li>
                <li><strong>2 Suits (Medium):</strong> Spades and Hearts. More challenging.</li>
                <li><strong>4 Suits (Hard):</strong> All four suits. Most challenging - only same-suit sequences can be moved together.</li>
              </ul>

              <h3>Controls</h3>
              <ul>
                <li><strong>Click</strong> a card to select it, then click a destination.</li>
                <li><strong>Drag</strong> cards and drop them on a valid column.</li>
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
                <li>Start with 500 points</li>
                <li>Each move costs 1 point</li>
                <li>Complete a sequence: +100 points</li>
              </ul>
            </div>
            <div class="spider-help-buttons">
              <button class="spider-win-btn" onClick={() => setShowHelp(false)}>{txt.helpDialog.ok}</button>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Dialog */}
      {showStats && (
        <div class="spider-help-overlay" onClick={() => setShowStats(false)}>
          <div class="spider-stats-dialog" onClick={(e) => e.stopPropagation()}>
            <div class="spider-help-titlebar">
              <span>{txt.stats.title}</span>
              <button class="spider-help-close" onClick={() => setShowStats(false)}>×</button>
            </div>
            <div class="spider-stats-content">
              <div class="spider-stat-row">
                <span class="spider-stat-label">{txt.stats.gamesPlayed}:</span>
                <span class="spider-stat-value">{stats.gamesPlayed}</span>
              </div>
              <div class="spider-stat-row">
                <span class="spider-stat-label">{txt.stats.gamesWon}:</span>
                <span class="spider-stat-value">{stats.gamesWon}</span>
              </div>
              <div class="spider-stat-row">
                <span class="spider-stat-label">{txt.stats.winPercentage}:</span>
                <span class="spider-stat-value">{stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0}%</span>
              </div>
              <div class="spider-stat-row">
                <span class="spider-stat-label">{txt.stats.currentStreak}:</span>
                <span class="spider-stat-value">{stats.currentStreak}</span>
              </div>
              <div class="spider-stat-row">
                <span class="spider-stat-label">{txt.stats.bestStreak}:</span>
                <span class="spider-stat-value">{stats.bestStreak}</span>
              </div>
              <div class="spider-stat-row">
                <span class="spider-stat-label">{txt.stats.bestScore}:</span>
                <span class="spider-stat-value">{stats.bestScore || 0}</span>
              </div>
            </div>
            <div class="spider-stats-buttons">
              <button class="spider-win-btn" onClick={resetStats}>{txt.stats.reset}</button>
              <button class="spider-win-btn" onClick={() => setShowStats(false)}>{txt.stats.ok}</button>
            </div>
          </div>
        </div>
      )}

      {/* Select Difficulty Dialog */}
      {showDifficulty && (
        <div class="spider-help-overlay" onClick={() => setShowDifficulty(false)}>
          <div class="spider-difficulty-dialog" onClick={(e) => e.stopPropagation()}>
            <div class="spider-help-titlebar">
              <span>{txt.difficulty.title}</span>
              <button class="spider-help-close" onClick={() => setShowDifficulty(false)}>×</button>
            </div>
            <div class="spider-difficulty-content">
              <p>{txt.difficulty.prompt}</p>
              <div class="spider-difficulty-options">
                {([1, 2, 4] as SpiderDifficulty[]).map((diff) => (
                  <div
                    class={`spider-difficulty-option ${difficulty === diff ? 'selected' : ''}`}
                    onClick={() => {
                      newGame(undefined, diff);
                      setShowDifficulty(false);
                    }}
                  >
                    <div class="spider-difficulty-radio" />
                    <span class="spider-difficulty-label">{diff === 1 ? txt.difficulty.oneSuit : diff === 2 ? txt.difficulty.twoSuits : txt.difficulty.fourSuits}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Select Game Dialog */}
      {showSelectGame && (
        <div class="spider-help-overlay" onClick={() => setShowSelectGame(false)}>
          <div class="spider-stats-dialog" onClick={(e) => e.stopPropagation()}>
            <div class="spider-help-titlebar">
              <span>{txt.selectGame.title}</span>
              <button class="spider-help-close" onClick={() => setShowSelectGame(false)}>×</button>
            </div>
            <div class="spider-difficulty-content">
              <p>{txt.selectGame.prompt}</p>
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
            <div class="spider-stats-buttons">
              <button class="spider-win-btn" onClick={() => {
                const num = parseInt(selectGameInput) || gameNumber;
                if (num >= 1 && num <= 32000) {
                  newGame(num);
                  setShowSelectGame(false);
                  setSelectGameInput('');
                }
              }}>{txt.selectGame.ok}</button>
              <button class="spider-win-btn" onClick={() => { setShowSelectGame(false); setSelectGameInput(''); }}>{txt.selectGame.cancel}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
