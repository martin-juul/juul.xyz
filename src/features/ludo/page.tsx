// Ludo Game Page Component

import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { useLanguage } from '../../context/language-context';
import { useStatus } from '../../context/status-context';
import type { DialogState, Difficulty, GameState, PlayerColor } from './types';
import { createInitialGameState, generateHints, moveToken, rollDiceForPlayer } from './game-logic';
import { decideMove } from './ai';
import { loadStats, saveStats, updateStats } from './stats';
import { Board } from './components/Board';
import { ActionPanel } from './components/ActionPanel';
import { ScoreBoard } from './components/ScoreBoard';
import { SetupDialog } from './components/Dialogs/SetupDialog';
import { TutorialDialog } from './components/Dialogs/TutorialDialog';
import { HelpDialog } from './components/Dialogs/HelpDialog';
import { GameOverDialog } from './components/Dialogs/GameOverDialog';
import './ludo.css';

export function Ludo() {
  const { t, language } = useLanguage();
  const { setStatusText } = useStatus();
  const txt = t.ludo;

  // Game state
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');

  // Dialog state
  const [dialogState, setDialogState] = useState<DialogState>({
    setup: true,
    tutorial: false,
    help: false,
    gameOver: false,
  });

  // UI state
  const [rolling, setRolling] = useState(false);
  const [hints, setHints] = useState<{ tokenId: string; priority: string }[]>([]);

  // Stats
  const [stats, setStats] = useState(loadStats());

  // Ref to always get fresh state (solves stale closure issues in AI turns)
  const gameStateRef = useRef<GameState | null>(null);
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Turn counter to force AI effect re-runs on turn changes
  const [turnCounter, setTurnCounter] = useState(0);

  // Track which player the AI was last processing to detect player changes
  const lastProcessedPlayerRef = useRef<number>(0);

  // Track if we're currently processing an AI turn (prevents re-entry)
  const isProcessingRef = useRef(false);

  // Helper to schedule timeouts
  const scheduleTimeout = useCallback((callback: () => void, delay: number) => {
    return window.setTimeout(callback, delay);
  }, []);

  // Update status message based on game state
  useEffect(() => {
    if (!gameState) {
      setStatusText('Welcome to Ludo!');
      return;
    }

    const currentPlayer = gameState.players[gameState.currentPlayer];
    const isHuman = currentPlayer.isHuman;

    switch (gameState.phase) {
      case 'rolling':
        if (isHuman) {
          setStatusText(txt.yourTurn);
        } else {
          setStatusText(`${txt[currentPlayer.color]} ${txt.aiThinking}`);
        }
        break;
      case 'selectToken':
        if (isHuman) {
          setStatusText(txt.selectToken);
        }
        break;
      case 'aiTurn':
        setStatusText(`${txt[currentPlayer.color]} ${txt.aiThinking}`);
        break;
      case 'gameover':
        if (gameState.winner !== null) {
          const winner = gameState.players[gameState.winner];
          setStatusText(`${txt.congratulations} ${winner.name}!`);
        }
        break;
    }
  }, [gameState, txt]);

  // AI turns - using the Hearts/Matador pattern to avoid stale closures
  useEffect(() => {
    const state = gameStateRef.current;
    if (!state || state.phase !== 'aiTurn') {
      return;
    }

    const player = state.players[state.currentPlayer];
    if (player.isHuman) {
      // Human player - should not be in aiTurn phase
      lastProcessedPlayerRef.current = state.currentPlayer;
      isProcessingRef.current = false;
      return;
    }

    // Check if this is a new player's turn
    const playerChanged = lastProcessedPlayerRef.current !== state.currentPlayer;

    // Prevent re-entry: if we're already processing this player, don't start again
    if (!playerChanged && isProcessingRef.current) {
      return;
    }

    console.log('[Ludo AI] Starting turn for:', player.color, 'difficulty:', player.difficulty);
    lastProcessedPlayerRef.current = state.currentPlayer;
    isProcessingRef.current = true;

    // AI turn sequence with proper timing
    // Step 1: Roll dice (500ms delay)
    scheduleTimeout(() => {
      let newState = rollDiceForPlayer(state);
      setRolling(true);

      scheduleTimeout(() => {
        setRolling(false);

        // Step 2: Check if no moves available
        if (newState.movableTokens.length === 0) {
          setStatusText(txt.noMovesAvailable);

          scheduleTimeout(() => {
            newState = getNextPlayer(newState);
            setGameState(newState);
            setTurnCounter(c => c + 1); // Trigger next AI
            isProcessingRef.current = false;
          }, 500);
          return;
        }

        // Step 3: Select and execute move (difficulty-based delay)
        const aiDelay = player.difficulty === 'easy' ? 1500 :
                        player.difficulty === 'medium' ? 1000 : 800;

        scheduleTimeout(() => {
          const tokenId = decideMove(newState, player.difficulty || 'medium');
          if (tokenId) {
            const { newState: finalState, captured, finished, message } =
              moveToken(newState, tokenId, newState.dice);

            setGameState(finalState);

            if (message) {
              setStatusText(message);
            }

            // Step 4: Check for extra turn or next player (500ms delay)
            scheduleTimeout(() => {
              if (finalState.phase === 'rolling' && finalState.currentPlayer !== state.currentPlayer) {
                // Extra turn for rolling 6
                setTurnCounter(c => c + 1); // Trigger AI again
                isProcessingRef.current = false;
              } else if (finalState.phase === 'gameover') {
                // Game over
                isProcessingRef.current = false;
                handleGameOver(finalState);
              } else {
                // Next player
                const nextPlayerState = getNextPlayer(finalState);
                setGameState(nextPlayerState);
                setTurnCounter(c => c + 1); // Trigger next AI
                isProcessingRef.current = false;
              }
            }, 500);
          }
        }, aiDelay);
      }, 500);
    }, 500);
  }, [turnCounter]); // IMPORTANT: Only depend on turnCounter, not state!

  // Handlers
  const handleStartGame = (selectedDifficulty: Difficulty) => {
    setDifficulty(selectedDifficulty);
    const newGameState = createInitialGameState(selectedDifficulty);
    setGameState(newGameState);
    setDialogState({
      setup: false,
      tutorial: !stats.hasPlayedBefore,
      help: false,
      gameOver: false,
    });

    setStatusText(txt.yourTurn);
  };

  const handleRollDice = () => {
    if (!gameState || gameState.phase !== 'rolling') return;

    const player = gameState.players[gameState.currentPlayer];
    if (!player.isHuman) return;

    setRolling(true);

    // Animate dice roll
    scheduleTimeout(() => {
      const newGameState = rollDiceForPlayer(gameState);
      setGameState(newGameState);
      setRolling(false);

      // Generate hints if tokens are movable
      if (newGameState.movableTokens.length > 0) {
        const newHints = generateHints(newGameState, newGameState.dice);
        setHints(newHints);
      }

      // If no moves available, automatically end turn
      if (newGameState.movableTokens.length === 0 && newGameState.phase === 'rolling') {
        setStatusText(txt.noMovesAvailable);

        scheduleTimeout(() => {
          const nextState = getNextPlayer(newGameState);
          setGameState(nextState);
          setTurnCounter(c => c + 1); // Trigger AI
        }, 1000);
      }

    }, 500);
  };

  const handleTokenClick = (tokenId: string) => {
    if (!gameState || gameState.phase !== 'selectToken') return;

    const player = gameState.players[gameState.currentPlayer];
    if (!player.isHuman) return;

    const { newState, captured, finished, message } = moveToken(gameState, tokenId, gameState.dice);

    setGameState(newState);
    setHints([]);

    if (message) {
      setStatusText(message);
    }

    // Check for game over
    if (newState.phase === 'gameover') {
      handleGameOver(newState);
      return;
    }

    // If not an extra turn, move to next player
    if (newState.phase === 'rolling' && newState.currentPlayer !== gameState.currentPlayer) {
      // Extra turn for rolling 6
      setStatusText(txt.gotSix);
    } else {
      scheduleTimeout(() => {
        const nextPlayerState = getNextPlayer(newState);
        setGameState(nextPlayerState);
        setTurnCounter(c => c + 1); // Trigger AI
      }, 500);
    }
  };

  const handleToggleHints = () => {
    if (gameState) {
      setGameState({
        ...gameState,
        hintsEnabled: !gameState.hintsEnabled,
      });
    }
  };

  const handleHelp = () => {
    setDialogState(prev => ({ ...prev, help: true }));
  };

  const handleCloseTutorial = () => {
    setDialogState(prev => ({ ...prev, tutorial: false }));
  };

  const handleCloseHelp = () => {
    setDialogState(prev => ({ ...prev, help: false }));
  };

  const handlePlayAgain = () => {
    setDialogState({
      setup: true,
      tutorial: false,
      help: false,
      gameOver: false,
    });
    setGameState(null);
    setHints([]);
    setStatusText('Welcome to Ludo!');
  };

  const handleCloseGameOver = () => {
    setDialogState(prev => ({ ...prev, gameOver: false }));
  };

  const handleGameOver = (finalState: GameState) => {
    if (finalState.winner === null) return;

    const winner = finalState.players[finalState.winner];
    const humanPlayer = finalState.players[0];
    const didWin = finalState.winner === 0;

    // Update stats
    const tokensFinished = humanPlayer.finishedTokens;
    const tokensCaptured = countCaptures(finalState, humanPlayer.color);
    const tokensLost = countLosses(finalState, humanPlayer.color);

    const newStats = updateStats(
      stats,
      didWin,
      difficulty,
      tokensFinished,
      tokensCaptured,
      tokensLost
    );

    setStats(newStats);
    saveStats(newStats);

    // Show game over dialog
    scheduleTimeout(() => {
      setDialogState(prev => ({ ...prev, gameOver: true }));
    }, 1000);
  };

  // Helper function to get next player (imported from game-logic)
  function getNextPlayer(state: GameState): GameState {
    let nextPlayer = (state.currentPlayer + 1) % state.players.length;
    let turnCount = state.turnCount;

    // Skip finished players (all tokens done)
    let attempts = 0;
    while (state.players[nextPlayer].finishedTokens === 4 && attempts < 4) {
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

  // Helper functions for stats
  function countCaptures(state: GameState, playerColor: PlayerColor): number {
    // This is a simplified version - you'd need to track captures during the game
    return 0;
  }

  function countLosses(state: GameState, playerColor: PlayerColor): number {
    // This is a simplified version - you'd need to track losses during the game
    return 0;
  }

  // Render
  return (
    <div class="ludo-game">
      {/* Dialogs */}
      {dialogState.setup && (
        <SetupDialog lang={language} onStart={handleStartGame} />
      )}

      {dialogState.tutorial && (
        <TutorialDialog
          lang={language}
          onComplete={handleCloseTutorial}
          onSkip={handleCloseTutorial}
        />
      )}

      {dialogState.help && (
        <HelpDialog lang={language} onClose={handleCloseHelp} />
      )}

      {dialogState.gameOver && gameState && (
        <GameOverDialog
          lang={language}
          gameState={gameState}
          onPlayAgain={handlePlayAgain}
          onClose={handleCloseGameOver}
        />
      )}


      {/* Game board */}
      {gameState && !dialogState.setup && !dialogState.tutorial && (
        <div class="game-container">
          <div class="ludo-board-container">
            <div class="ludo-board-wrapper">
              <Board
                gameState={gameState}
                movableTokens={gameState.movableTokens}
                hints={hints}
                onTokenClick={handleTokenClick}
              />
            </div>
          </div>

          <div class="right-panel">
            <ScoreBoard gameState={gameState} lang={language} />
            <ActionPanel
              diceValue={gameState.dice}
              rolling={rolling}
              phase={gameState.phase}
              isHumanTurn={gameState.players[gameState.currentPlayer].isHuman}
              hintsEnabled={gameState.hintsEnabled}
              message={gameState.turnMessage}
              lang={language}
              onRoll={handleRollDice}
              onToggleHints={handleToggleHints}
              onHelp={handleHelp}
            />
          </div>
        </div>
      )}
    </div>
  );
}
