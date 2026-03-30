import { useState, useCallback, useEffect, useRef } from 'preact/hooks';
import type { GameState, Player, DialogState, Language, OwnableProperty, Difficulty } from './types';
import { t } from './translations';
import { TOKEN_EMOJIS } from './constants';
import {
  createInitialGameState,
  rollDice,
  isDoubles,
  movePlayer,
  getPropertyOwner,
  buyProperty,
  payRent,
  startAuction,
  drawCard,
  executeCardAction,
  goToJail,
  payJailFine,
  useJailCard,
  jailRollForDoubles,
  buildHouse,
  sellHouse,
  mortgageProperty,
  unmortgageProperty,
  endTurn,
} from './game-logic';
import {
  decideBuy,
  decideAuctionBid,
  decideBuild,
  decideJailEscape,
} from './ai';
import { Board } from './components/Board';
import { Dice } from './components/Dice';
import { ScoreBoard } from './components/ScoreBoard';
import { BuyPropertyDialog } from './components/Dialogs/BuyPropertyDialog';
import { AuctionDialog } from './components/Dialogs/AuctionDialog';
import { BuildDialog } from './components/Dialogs/BuildDialog';
import { MortgageDialog } from './components/Dialogs/MortgageDialog';
import { CardDialog } from './components/Dialogs/CardDialog';
import { JailDialog } from './components/Dialogs/JailDialog';
import { HelpDialog } from './components/Dialogs/HelpDialog';
import { GameOverDialog } from './components/Dialogs/GameOverDialog';
import './matador.css';

interface MatadorProps {
  language: Language;
}

// Setup screen component
function SetupScreen({ language, onStartGame }: {
  language: Language;
  onStartGame: (players: Omit<Player, 'cash' | 'position' | 'properties' | 'inJail' | 'jailTurns' | 'getOutOfJailCards' | 'doublesCount' | 'bankrupt'>[]) => void;
}) {
  const [players, setPlayers] = useState<Omit<Player, 'cash' | 'position' | 'properties' | 'inJail' | 'jailTurns' | 'getOutOfJailCards' | 'doublesCount' | 'bankrupt'>[]>([
    { id: 0, name: 'Player 1', token: 'car', isHuman: true },
    { id: 1, name: 'AI Let', token: 'dog', isHuman: false, difficulty: 'easy' },
    { id: 2, name: 'AI Medium', token: 'shoe', isHuman: false, difficulty: 'medium' },
    { id: 3, name: 'AI Svær', token: 'hat', isHuman: false, difficulty: 'hard' },
  ]);

  const handleStart = () => {
    onStartGame(players);
  };

  return (
    <div className="setup-screen">
      <div className="setup-dialog">
        <div className="setup-header">
          🎲 {t('gameTitle', language)}
        </div>
        <div className="setup-content">
          <div style="text-align: center; margin-bottom: 16px;">
            <div style="font-size: 24px; color: #800000;">{t('gameTitle', language)}</div>
            <div style="font-size: 12px; color: #404040;">{t('gameSubtitle', language)}</div>
          </div>

          {players.map((player, index) => (
            <div key={player.id} className={`setup-player ${player.isHuman ? 'human' : ''}`}>
              <span style="font-size: 20px;">{TOKEN_EMOJIS[player.token]}</span>
              <div className="setup-player-name">
                {player.isHuman ? (
                  <strong>{language === 'da' ? 'Dig' : 'You'}</strong>
                ) : (
                  <span>{language === 'da' ? 'Computer' : 'Computer'}</span>
                )}
              </div>
              {!player.isHuman && (
                <select
                  className="setup-difficulty"
                  value={player.difficulty || 'medium'}
                  onChange={(e) => {
                    const newPlayers = [...players];
                    newPlayers[index] = {
                      ...player,
                      difficulty: (e.target as HTMLSelectElement).value as Difficulty,
                      name: `AI ${(e.target as HTMLSelectElement).value}`,
                    };
                    setPlayers(newPlayers);
                  }}
                >
                  <option value="easy">{language === 'da' ? 'Let' : 'Easy'}</option>
                  <option value="medium">{language === 'da' ? 'Mellem' : 'Medium'}</option>
                  <option value="hard">{language === 'da' ? 'Svær' : 'Hard'}</option>
                </select>
              )}
            </div>
          ))}

          <div className="setup-buttons">
            <button className="action-btn primary" onClick={handleStart}>
              {t('startGame', language)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Matador({ language }: MatadorProps) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [showSetup, setShowSetup] = useState(true);
  const [dialogs, setDialogs] = useState<DialogState>({
    buyProperty: false,
    auction: false,
    trade: false,
    build: false,
    mortgage: false,
    jail: false,
    card: false,
    help: false,
    gameOver: false,
  });
  const [pendingProperty, setPendingProperty] = useState<OwnableProperty | null>(null);
  const [rolling, setRolling] = useState(false);

  // Ref to always get fresh game state (solves stale closure issues)
  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  // Turn counter to force AI effect re-runs on turn changes
  const [turnCounter, setTurnCounter] = useState(0);

  // Track last dice for doubles check after async operations
  const lastDiceRef = useRef<[number, number] | null>(null);

  // Start new game
  const handleStartGame = useCallback((players: Omit<Player, 'cash' | 'position' | 'properties' | 'inJail' | 'jailTurns' | 'getOutOfJailCards' | 'doublesCount' | 'bankrupt'>[]) => {
    const state = createInitialGameState(players);
    setGameState(state);
    setShowSetup(false);
  }, []);

  // Roll dice handler
  const handleRollDice = useCallback(() => {
    if (!gameState || rolling) return;

    const player = gameState.players[gameState.currentPlayer];
    if (!player.isHuman) return;

    setRolling(true);

    // Animate dice roll
    scheduleTimeout(() => {
      const dice = rollDice();
      const doubles = isDoubles(dice);
      let newState: GameState = { ...gameState, dice, lastRoll: dice, diceRolled: true };

      // Check for three doubles
      if (doubles) {
        const newDoublesCount = player.doublesCount + 1;
        if (newDoublesCount >= 3) {
          // Go to jail for three doubles
          newState = goToJail(newState);
          newState.players[newState.currentPlayer].doublesCount = 0;
          setRolling(false);
          setGameState(newState);
          return;
        }
        newState.players[newState.currentPlayer].doublesCount = newDoublesCount;
      } else {
        newState.players[newState.currentPlayer].doublesCount = 0;
      }

      // Move player
      const total = dice[0] + dice[1];
      newState = movePlayer(newState, total);

      // Handle landing on space
      const space = newState.spaces[newState.players[newState.currentPlayer].position];

      // Check what player landed on
      if (space.type === 'street' || space.type === 'railway' || space.type === 'brewery') {
        const property = space as OwnableProperty;
        const owner = getPropertyOwner(newState, property.position);

        if (owner === null) {
          // Unowned property - show buy dialog
          setPendingProperty(property);
          setDialogs(d => ({ ...d, buyProperty: true }));
        } else if (owner !== newState.currentPlayer) {
          // Pay rent
          newState = payRent(newState, property, total);
        }
      } else if (space.type === 'chance') {
        // Draw chance card
        newState = drawCard(newState, 'chance');
        setDialogs(d => ({ ...d, card: true }));
      } else if (space.type === 'chest') {
        // Draw community chest card
        newState = drawCard(newState, 'chest');
        setDialogs(d => ({ ...d, card: true }));
      } else if (space.type === 'gotojail') {
        newState = goToJail(newState);
      } else if (space.type === 'tax') {
        const taxSpace = space;
        const taxAmount = taxSpace.percentage
          ? Math.min(taxSpace.amount, Math.floor(calculatePlayerAssets(newState.players[newState.currentPlayer]) * taxSpace.percentage / 100))
          : taxSpace.amount;
        newState.players[newState.currentPlayer].cash -= taxAmount;
      }

      setRolling(false);
      setGameState(newState);
    }, 500);
  }, [gameState, rolling]);

  // Calculate player assets for tax
  const calculatePlayerAssets = (player: Player): number => {
    let assets = player.cash;
    player.properties.forEach(p => {
      assets += p.property.price;
      if (p.houses > 0 && p.property.type === 'street') {
        const street = p.property as any;
        assets += p.houses * street.houseCost;
      }
    });
    return assets;
  };

  // Buy property handler
  const handleBuyProperty = useCallback(() => {
    if (!gameState || !pendingProperty) return;

    const newState = buyProperty(gameState, gameState.currentPlayer, pendingProperty);
    setGameState(newState);
    setPendingProperty(null);
    setDialogs(d => ({ ...d, buyProperty: false }));
  }, [gameState, pendingProperty]);

  // Start auction handler
  const handleStartAuction = useCallback(() => {
    if (!gameState || !pendingProperty) return;

    const newState = startAuction(gameState, pendingProperty);
    setGameState(newState);
    setPendingProperty(null);
    setDialogs(d => ({ ...d, buyProperty: false, auction: true }));
  }, [gameState, pendingProperty]);

  // Auction bid handler
  const handleAuctionBid = useCallback((playerIndex: number, amount: number) => {
    if (!gameState || !gameState.auction) return;

    const newState = { ...gameState };
    if (newState.auction) {
      newState.auction = {
        ...newState.auction,
        currentBid: amount,
        currentBidder: playerIndex,
      };
    }
    setGameState(newState);
  }, [gameState]);

  // Auction pass handler
  const handleAuctionPass = useCallback((playerIndex: number) => {
    if (!gameState || !gameState.auction) return;

    const auction = gameState.auction;
    const newPassed = [...auction.passed, playerIndex];
    const remainingParticipants = auction.participants.filter(p => !newPassed.includes(p));

    // Check if auction is over
    if (remainingParticipants.length <= 1 || newPassed.length >= auction.participants.length) {
      if (auction.currentBidder !== null) {
        // Winner gets the property
        const winner = gameState.players[auction.currentBidder];
        const updatedPlayers = [...gameState.players];
        updatedPlayers[auction.currentBidder] = {
          ...winner,
          cash: winner.cash - auction.currentBid,
          properties: [...winner.properties, { property: auction.property, mortgaged: false, houses: 0 }],
        };
        const newState = {
          ...gameState,
          players: updatedPlayers,
          auction: null,
          phase: 'rolling' as const,
          diceRolled: true,
          message: {
            en: `${winner.name} won ${auction.property.nameDa} for ${auction.currentBid} kr`,
            da: `${winner.name} vandt ${auction.property.nameDa} for ${auction.currentBid} kr`,
          },
        };
        setGameState(newState);
      } else {
        // No one bought it
        const newState = {
          ...gameState,
          auction: null,
          phase: 'rolling' as const,
          diceRolled: true,
          message: {
            en: 'No one bought the property',
            da: 'Ingen købte grunden',
          },
        };
        setGameState(newState);
      }
      setDialogs(d => ({ ...d, auction: false }));

      // After auction completes, we need to continue the turn flow
      // Check if current player is AI - if so, schedule finishTurn
      const currentPlayer = gameState.players[gameState.currentPlayer];
      if (!currentPlayer.isHuman && gameState.lastRoll) {
        const doubles = isDoubles(gameState.lastRoll);
        scheduleTimeout(() => {
          if (doubles) {
            // Continue turn for doubles
            setGameState(prev => {
              if (!prev) return prev;
              return { ...prev, diceRolled: false };
            });
            setTurnCounter(c => c + 1);
          } else {
            // End turn
            setGameState(prev => {
              if (!prev) return prev;
              const next = endTurn(prev);
              return next;
            });
            setTurnCounter(c => c + 1);
          }
        }, 800);
      }
    } else {
      // Continue auction
      const newState = { ...gameState };
      if (newState.auction) {
        newState.auction = {
          ...newState.auction,
          passed: newPassed,
        };
      }
      setGameState(newState);
    }
  }, [gameState]);

  // Card confirm handler
  const handleCardConfirm = useCallback(() => {
    if (!gameState || !gameState.currentCard) return;

    const newState = executeCardAction(gameState, gameState.lastRoll || gameState.dice);
    newState.diceRolled = true;
    newState.phase = 'rolling';
    setGameState(newState);
    setDialogs(d => ({ ...d, card: false }));
  }, [gameState]);

  // Jail handlers
  const handlePayFine = useCallback(() => {
    if (!gameState) return;
    const newState = payJailFine(gameState);
    setGameState(newState);
  }, [gameState]);

  const handleUseJailCard = useCallback(() => {
    if (!gameState) return;
    const newState = useJailCard(gameState);
    setGameState(newState);
  }, [gameState]);

  const handleRollForDoubles = useCallback(() => {
    if (!gameState) return;

    const dice = rollDice();
    const newState = jailRollForDoubles(gameState, dice);
    setGameState(newState);
  }, [gameState]);

  // End turn handler
  const handleEndTurn = useCallback(() => {
    if (!gameState) return;

    let newState = { ...gameState };

    // Check for doubles - get extra turn
    if (newState.lastRoll && isDoubles(newState.lastRoll)) {
      const player = newState.players[newState.currentPlayer];
      if (!player.inJail && player.doublesCount < 3) {
        newState = {
          ...newState,
          phase: 'rolling',
          diceRolled: false,
          message: {
            en: `${player.name} rolled doubles! Roll again!`,
            da: `${player.name} slog slag! Kast igen!`,
          },
        };
        setGameState(newState);
        return;
      }
    }

    newState = endTurn(newState);
    setGameState(newState);
  }, [gameState]);

  // Build handler
  const handleBuild = useCallback((position: number) => {
    if (!gameState) return;
    const newState = buildHouse(gameState, position);
    setGameState(newState);
  }, [gameState]);

  // Sell house handler
  const handleSellHouse = useCallback((position: number) => {
    if (!gameState) return;
    const newState = sellHouse(gameState, position);
    setGameState(newState);
  }, [gameState]);

  // Mortgage handlers
  const handleMortgage = useCallback((position: number) => {
    if (!gameState) return;
    const newState = mortgageProperty(gameState, position);
    setGameState(newState);
  }, [gameState]);

  const handleUnmortgage = useCallback((position: number) => {
    if (!gameState) return;
    const newState = unmortgageProperty(gameState, position);
    setGameState(newState);
  }, [gameState]);

  // New game handler
  const handleNewGame = useCallback(() => {
    setGameState(null);
    setShowSetup(true);
    setDialogs({
      buyProperty: false,
      auction: false,
      trade: false,
      build: false,
      mortgage: false,
      jail: false,
      card: false,
      help: false,
      gameOver: false,
    });
  }, []);

  // Handle space click
  const handleSpaceClick = useCallback((position: number) => {
    // Could show property info
    console.log('Clicked space:', position);
  }, []);

  // Track which player the AI was last processing to detect player changes
  const lastProcessedPlayerRef = useRef<number>(-1);

  // Track if we're currently processing an AI turn (prevents re-entry)
  const isProcessingRef = useRef(false);

  // Store timeout IDs in a ref so they survive effect cleanups
  const timeoutIdsRef = useRef<number[]>([]);

  // Helper to schedule a timeout that survives effect cleanups
  const scheduleTimeout = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      // Remove this timeout from the list
      timeoutIdsRef.current = timeoutIdsRef.current.filter(t => t !== id);
      fn();
    }, ms);
    timeoutIdsRef.current.push(id);
    return id;
  }, []);

  // Clear all timeouts
  const clearAllTimeouts = useCallback(() => {
    timeoutIdsRef.current.forEach(id => clearTimeout(id));
    timeoutIdsRef.current = [];
  }, []);

  // AI turns - Fixed implementation with ref-based state access
  useEffect(() => {
    // Get fresh state from ref
    const currentState = gameStateRef.current;
    if (!currentState || currentState.phase === 'gameover') {
      console.log('[AI] Effect: No state or game over');
      return;
    }

    const player = currentState.players[currentState.currentPlayer];
    console.log('[AI] Effect: Player:', player.name, 'isHuman:', player.isHuman, 'diceRolled:', currentState.diceRolled);

    // Only process AI turns, not human players
    if (player.isHuman) {
      console.log('[AI] Human player turn - enabling controls');
      lastProcessedPlayerRef.current = currentState.currentPlayer;
      isProcessingRef.current = false;
      return;
    }

    // Check if this is a new player's turn (not already being processed)
    const playerChanged = lastProcessedPlayerRef.current !== currentState.currentPlayer;

    // Only process if dice hasn't been rolled yet this turn
    if (currentState.diceRolled) {
      console.log('[AI] Dice already rolled, waiting for turn to complete...');
      return;
    }

    // Prevent re-entry: if we're already processing this player, don't start again
    if (!playerChanged && isProcessingRef.current) {
      console.log('[AI] Already processing this player, skipping');
      return;
    }

    console.log('[AI] Starting AI turn for:', player.name);
    lastProcessedPlayerRef.current = currentState.currentPlayer;
    isProcessingRef.current = true;

    // Process end of turn - check doubles and continue or end
    const finishTurn = (wasDoubles: boolean, currentDice: [number, number]) => {
      console.log('[AI] FinishTurn - wasDoubles:', wasDoubles, 'dice:', currentDice);

      if (wasDoubles) {
        // Doubles - continue turn: reset processing flag to allow re-entry
        scheduleTimeout(() => {
          console.log('[AI] Continuing turn for doubles');
          isProcessingRef.current = false;
          setGameState(prev => {
            if (!prev) return prev;
            return { ...prev, diceRolled: false };
          });
          setTurnCounter(c => c + 1);
        }, 800);
      } else {
        // No doubles - end turn and hand over to next player
        scheduleTimeout(() => {
          console.log('[AI] Ending turn - no doubles, handing over to next player');
          isProcessingRef.current = false;
          setGameState(prev => {
            if (!prev) return prev;
            const next = endTurn(prev);
            console.log('[AI] Next player:', next.players[next.currentPlayer].name, '(Human:', next.players[next.currentPlayer].isHuman + ')');
            lastProcessedPlayerRef.current = next.currentPlayer;
            return next;
          });
          setTurnCounter(c => c + 1);
        }, 800);
      }
    };

    // Process a single roll/action for AI
    const processRoll = () => {
      // Always get fresh state from ref
      const currentState = gameStateRef.current;
      if (!currentState || currentState.phase === 'gameover') {
        console.log('[AI] No state or game over, aborting');
        return;
      }

      const currentPlayer = currentState.players[currentState.currentPlayer];

      // Handle jail
      if (currentPlayer.inJail) {
        console.log('[AI] Player in jail, handling jail turn');
        const decision = decideJailEscape(currentState, currentPlayer.difficulty || 'medium');
        console.log('[AI] Jail decision:', decision);

        if (decision === 'pay') {
          setGameState(payJailFine(currentState));
          scheduleTimeout(() => processRoll(), 500);
        } else if (decision === 'card' && currentPlayer.getOutOfJailCards > 0) {
          setGameState(useJailCard(currentState));
          scheduleTimeout(() => processRoll(), 500);
        } else {
          const dice = rollDice();
          const doubles = isDoubles(dice);
          console.log('[AI] Jail roll:', dice, 'doubles:', doubles);

          const newState = jailRollForDoubles(currentState, dice);
          lastDiceRef.current = dice;
          setGameState(newState);

          if (doubles) {
            console.log('[AI] Escaped jail with doubles, continuing turn');
            scheduleTimeout(() => processRoll(), 800);
          } else {
            finishTurn(false, dice);
          }
        }
        return;
      }

      // Roll dice
      const dice = rollDice();
      const doubles = isDoubles(dice);
      console.log('[AI] Rolled:', dice, 'doubles:', doubles);
      lastDiceRef.current = dice;

      let newState: GameState = {
        ...currentState,
        dice,
        lastRoll: dice,
        diceRolled: true,
      };

      // Check for three doubles
      if (doubles) {
        const newDoublesCount = (currentPlayer.doublesCount || 0) + 1;
        console.log('[AI] Doubles count:', newDoublesCount);
        if (newDoublesCount >= 3) {
          console.log('[AI] Three doubles! Going to jail');
          newState = goToJail(newState);
          newState.players[newState.currentPlayer].doublesCount = 0;
          setGameState(newState);
          finishTurn(false, dice);
          return;
        }
        newState.players[newState.currentPlayer].doublesCount = newDoublesCount;
      } else {
        newState.players[newState.currentPlayer].doublesCount = 0;
      }

      // Move player
      const total = dice[0] + dice[1];
      newState = movePlayer(newState, total);
      console.log('[AI] Moved', total, 'spaces to position', newState.players[newState.currentPlayer].position);

      // Handle landing
      const space = newState.spaces[newState.players[newState.currentPlayer].position];
      console.log('[AI] Landed on:', space.type, space.nameDa);

      if (space.type === 'street' || space.type === 'railway' || space.type === 'brewery') {
        const property = space as OwnableProperty;
        const owner = getPropertyOwner(newState, property.position);

        if (owner === null) {
          const shouldBuy = decideBuy(newState, property, currentPlayer.difficulty || 'medium');
          console.log('[AI] Unowned property, shouldBuy:', shouldBuy);

          if (shouldBuy && newState.players[newState.currentPlayer].cash >= property.price) {
            setGameState(prev => {
              if (!prev) return prev;
              const updatedState = buyProperty(prev, prev.currentPlayer, property);
              console.log('[AI] Bought property:', property.nameDa);
              return updatedState;
            });
            finishTurn(doubles, dice);
            return;
          } else {
            // Start auction - show dialog so human can participate
            console.log('[AI] Starting auction for:', property.nameDa);
            const auctionState = startAuction(newState, property);
            setGameState(auctionState);
            setDialogs(d => ({ ...d, auction: true }));

            // Reset processing flag so AI can continue after auction
            isProcessingRef.current = false;

            // AI bidding will be handled by the AuctionDialog's auto-bid effect
            // Don't automatically finish - let the auction play out
            return;
          }
        } else if (owner !== newState.currentPlayer) {
          console.log('[AI] Paying rent to player', owner);
          newState = payRent(newState, property, total);
        }
      } else if (space.type === 'chance' || space.type === 'chest') {
        console.log('[AI] Drawing card');
        newState = drawCard(newState, space.type === 'chance' ? 'chance' : 'chest');
        if (newState.currentCard) {
          setGameState(newState);
          scheduleTimeout(() => {
            console.log('[AI] Executing card action');
            setGameState(prev => {
              if (!prev) return prev;
              let updated = executeCardAction(prev, dice);
              updated.diceRolled = true;
              return updated;
            });
            finishTurn(doubles, dice);
          }, 1500);
          return;
        }
      } else if (space.type === 'gotojail') {
        console.log('[AI] Go to jail!');
        newState = goToJail(newState);
        setGameState(newState);
        finishTurn(false, dice);
        return;
      } else if (space.type === 'tax') {
        const taxAmount = (space as any).amount || 0;
        console.log('[AI] Paying tax:', taxAmount);
        newState.players[newState.currentPlayer].cash -= taxAmount;
      }

      // AI building phase (only if not doubles)
      if (!doubles) {
        const builds = decideBuild(newState, currentPlayer.difficulty || 'medium');
        if (builds.length > 0) {
          console.log('[AI] Building houses');
          builds.forEach(build => {
            for (let i = 0; i < build.houses; i++) {
              const result = buildHouse(newState, build.position);
              if (result !== newState) {
                newState = result;
              }
            }
          });
        }
      }

      setGameState(newState);
      finishTurn(doubles, dice);
    };

    // Start AI turn after short delay
    scheduleTimeout(() => processRoll(), 500);

    // No cleanup needed for effect re-runs - timeouts are stored in ref
    // Timeouts are only cleared on component unmount via the separate effect
    return () => {
      // Intentionally empty - timeouts survive effect re-runs
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState?.currentPlayer, gameState?.diceRolled, turnCounter]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      clearAllTimeouts();
    };
  }, [clearAllTimeouts]);

  // Check for game over
  useEffect(() => {
    if (!gameState) return;

    const activePlayers = gameState.players.filter(p => !p.bankrupt);
    if (activePlayers.length === 1) {
      const winnerIndex = gameState.players.findIndex(p => !p.bankrupt);
      setGameState(prev => prev ? { ...prev, phase: 'gameover', winner: winnerIndex } : prev);
      setDialogs(d => ({ ...d, gameOver: true }));
    }
  }, [gameState?.players]);

  if (showSetup) {
    return (
      <div class="matador-game">
        <SetupScreen language={language} onStartGame={handleStartGame} />
      </div>
    );
  }

  if (!gameState) return null;

  const player = gameState.players[gameState.currentPlayer];
  const isDoublesRoll = gameState.lastRoll ? isDoubles(gameState.lastRoll) : false;

  return (
    <div class="matador-game">
      <div class="game-container">
        <div class="board-container">
          <Board
            state={gameState}
            language={language}
            onSpaceClick={handleSpaceClick}
          />
          <div class="board-center">
            <div class="game-logo">{t('gameTitle', language)}</div>
            <div class="game-subtitle">{t('gameSubtitle', language)}</div>
            <Dice
              dice={gameState.dice}
              rolling={rolling}
              isDoubles={isDoublesRoll}
            />
            <div style="font-size: 10px; margin-top: 8px;">
              {TOKEN_EMOJIS[player.token]} {player.isHuman
                ? (language === 'da' ? 'Din tur' : 'Your turn')
                : `${player.name}...`
              }
            </div>
            <button
              class="action-btn"
              style="margin-top: 8px; font-size: 10px; padding: 2px 8px;"
              onClick={() => setDialogs(d => ({ ...d, help: true }))}
            >
              ❓ {t('help', language)}
            </button>
          </div>
        </div>
        <ScoreBoard
          state={gameState}
          language={language}
          onRollDice={handleRollDice}
          onEndTurn={handleEndTurn}
          onOpenTrade={() => {}}
          onOpenBuild={() => setDialogs(d => ({ ...d, build: true }))}
          onOpenMortgage={() => setDialogs(d => ({ ...d, mortgage: true }))}
          onPayFine={handlePayFine}
          onUseCard={handleUseJailCard}
          onRollForDoubles={handleRollForDoubles}
          rolling={rolling}
        />
      </div>

      {/* Dialogs */}
      {dialogs.buyProperty && pendingProperty && (
        <BuyPropertyDialog
          property={pendingProperty}
          language={language}
          onBuy={handleBuyProperty}
          onAuction={handleStartAuction}
          onClose={() => {
            setPendingProperty(null);
            setDialogs(d => ({ ...d, buyProperty: false }));
          }}
        />
      )}

      {dialogs.auction && gameState.auction && (
        <AuctionDialog
          state={gameState}
          language={language}
          onBid={handleAuctionBid}
          onPass={handleAuctionPass}
          onClose={() => setDialogs(d => ({ ...d, auction: false }))}
        />
      )}

      {dialogs.build && (
        <BuildDialog
          state={gameState}
          language={language}
          onBuild={handleBuild}
          onSell={handleSellHouse}
          onClose={() => setDialogs(d => ({ ...d, build: false }))}
        />
      )}

      {dialogs.mortgage && (
        <MortgageDialog
          state={gameState}
          language={language}
          onMortgage={handleMortgage}
          onUnmortgage={handleUnmortgage}
          onClose={() => setDialogs(d => ({ ...d, mortgage: false }))}
        />
      )}

      {dialogs.card && gameState.currentCard && (
        <CardDialog
          card={gameState.currentCard}
          language={language}
          onConfirm={handleCardConfirm}
        />
      )}

      {player.isHuman && player.inJail && gameState.phase === 'jail' && (
        <JailDialog
          player={player}
          language={language}
          onPayFine={handlePayFine}
          onUseCard={handleUseJailCard}
          onRollForDoubles={handleRollForDoubles}
        />
      )}

      {dialogs.help && (
        <HelpDialog
          language={language}
          onClose={() => setDialogs(d => ({ ...d, help: false }))}
        />
      )}

      {dialogs.gameOver && (
        <GameOverDialog
          state={gameState}
          language={language}
          onNewGame={handleNewGame}
          onClose={() => setDialogs(d => ({ ...d, gameOver: false }))}
        />
      )}
    </div>
  );
}
