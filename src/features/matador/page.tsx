// Matador Game Main Page Component

import { useState, useCallback, useEffect } from 'preact/hooks';
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
import { ActionPanel } from './components/ActionPanel';
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
    setTimeout(() => {
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
        setGameState({
          ...gameState,
          players: updatedPlayers,
          auction: null,
          phase: 'rolling',
          message: {
            en: `${winner.name} won ${auction.property.nameDa} for ${auction.currentBid} kr`,
            da: `${winner.name} vandt ${auction.property.nameDa} for ${auction.currentBid} kr`,
          },
        });
      } else {
        // No one bought it
        setGameState({
          ...gameState,
          auction: null,
          phase: 'rolling',
          message: {
            en: 'No one bought the property',
            da: 'Ingen købte grunden',
          },
        });
      }
      setDialogs(d => ({ ...d, auction: false }));
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

  // AI turns
  useEffect(() => {
    if (!gameState || gameState.phase === 'gameover') return;

    const player = gameState.players[gameState.currentPlayer];

    // Only process AI turns, not human players
    if (player.isHuman) {
      return;
    }

    if (player.bankrupt) {
      // Skip bankrupt player
      const timer = window.setTimeout(() => {
        setGameState(prev => prev ? endTurn(prev) : prev);
      }, 500);
      return () => clearTimeout(timer);
    }

    // Only process if dice hasn't been rolled yet this turn
    if (gameState.diceRolled) {
      return;
    }

    console.log('Processing AI turn for:', player.name);

    let cancelled = false;
    const timeouts: number[] = [];

    const addTimeout = (fn: () => void, delay: number) => {
      const id = window.setTimeout(() => {
        if (!cancelled) fn();
      }, delay);
      timeouts.push(id);
      return id;
    };

    // AI turn processing - can be called recursively for doubles
    const processAITurn = (currentState: GameState, isExtraRoll: boolean = false) => {
      if (cancelled) return;

      let newState: GameState = { ...currentState };

      // Handle jail
      if (newState.players[newState.currentPlayer].inJail && !isExtraRoll) {
        const aiPlayer = newState.players[newState.currentPlayer];
        const decision = decideJailEscape(newState, aiPlayer.difficulty || 'medium');

        addTimeout(() => {
          if (cancelled) return;

          if (decision === 'pay') {
            newState = payJailFine(newState);
          } else if (decision === 'card' && aiPlayer.getOutOfJailCards > 0) {
            newState = useJailCard(newState);
          } else {
            const dice = rollDice();
            newState = jailRollForDoubles(newState, dice);
          }

          setGameState(newState);

          // After jail, end turn if not doubles
          if (!isDoubles(newState.dice)) {
            addTimeout(() => {
              setGameState(prev => prev ? endTurn(prev) : prev);
            }, 500);
          } else {
            // Got out of jail with doubles, continue turn
            newState.diceRolled = false;
            setGameState(newState);
          }
        }, 1000);
        return;
      }

      // Roll and move
      addTimeout(() => {
        if (cancelled) return;

        const dice = rollDice();
        const doubles = isDoubles(dice);
        const aiPlayer = newState.players[newState.currentPlayer];

        newState = { ...newState, dice, lastRoll: dice, diceRolled: true };

        // Check for three doubles
        if (doubles) {
          const newDoublesCount = (aiPlayer.doublesCount || 0) + 1;
          if (newDoublesCount >= 3) {
            newState = goToJail(newState);
            newState.players[newState.currentPlayer].doublesCount = 0;
            setGameState(newState);
            addTimeout(() => {
              setGameState(prev => prev ? endTurn(prev) : prev);
            }, 1000);
            return;
          }
          newState.players[newState.currentPlayer].doublesCount = newDoublesCount;
        } else {
          newState.players[newState.currentPlayer].doublesCount = 0;
        }

        // Move
        const total = dice[0] + dice[1];
        newState = movePlayer(newState, total);

        // Handle landing
        const space = newState.spaces[newState.players[newState.currentPlayer].position];

        if (space.type === 'street' || space.type === 'railway' || space.type === 'brewery') {
          const property = space as OwnableProperty;
          const owner = getPropertyOwner(newState, property.position);

          if (owner === null) {
            // Decide to buy or auction
            const shouldBuy = decideBuy(newState, property, aiPlayer.difficulty || 'medium');

            if (shouldBuy && newState.players[newState.currentPlayer].cash >= property.price) {
              newState = buyProperty(newState, newState.currentPlayer, property);
              console.log(`AI ${aiPlayer.name} bought ${property.nameDa} for ${property.price} kr`);
            } else {
              newState = startAuction(newState, property);
              setGameState(newState);
              return; // Auction will handle state updates
            }
          } else if (owner !== newState.currentPlayer) {
            newState = payRent(newState, property, total);
          }
        } else if (space.type === 'chance') {
          newState = drawCard(newState, 'chance');
          if (newState.currentCard) {
            setGameState(newState);
            addTimeout(() => {
              if (cancelled) return;
              let updatedState = executeCardAction(newState, dice);
              updatedState.diceRolled = true;
              setGameState(updatedState);

              // End AI turn after card
              if (!doubles) {
                addTimeout(() => {
                  setGameState(prev => prev ? endTurn(prev) : prev);
                }, 500);
              } else {
                // Doubles after card - roll again
                updatedState.diceRolled = false;
                setGameState(updatedState);
              }
            }, 1500);
            return;
          }
        } else if (space.type === 'chest') {
          newState = drawCard(newState, 'chest');
          if (newState.currentCard) {
            setGameState(newState);
            addTimeout(() => {
              if (cancelled) return;
              let updatedState = executeCardAction(newState, dice);
              updatedState.diceRolled = true;
              setGameState(updatedState);

              // End AI turn after card
              if (!doubles) {
                addTimeout(() => {
                  setGameState(prev => prev ? endTurn(prev) : prev);
                }, 500);
              } else {
                // Doubles after card - roll again
                updatedState.diceRolled = false;
                setGameState(updatedState);
              }
            }, 1500);
            return;
          }
        } else if (space.type === 'gotojail') {
          newState = goToJail(newState);
          setGameState(newState);
          addTimeout(() => {
            setGameState(prev => prev ? endTurn(prev) : prev);
          }, 1000);
          return;
        } else if (space.type === 'tax') {
          const taxSpace = space;
          const taxAmount = taxSpace.amount;
          newState.players[newState.currentPlayer].cash -= taxAmount;
        }

        // AI building phase (only at end of turn, not between doubles rolls)
        if (!doubles) {
          const builds = decideBuild(newState, aiPlayer.difficulty || 'medium');
          builds.forEach(build => {
            for (let i = 0; i < build.houses; i++) {
              newState = buildHouse(newState, build.position);
            }
          });
        }

        setGameState(newState);

        // End turn if not doubles, otherwise continue with extra roll
        if (!doubles) {
          addTimeout(() => {
            setGameState(prev => prev ? endTurn(prev) : prev);
          }, 1000);
        } else {
          // Roll again for doubles - reset diceRolled and process again
          addTimeout(() => {
            if (cancelled) return;
            newState.diceRolled = false;
            setGameState(newState);
            // Continue processing for doubles
            processAITurn(newState, true);
          }, 1000);
        }
      }, 1000);
    };

    addTimeout(() => processAITurn(gameState), 500);

    return () => {
      cancelled = true;
      timeouts.forEach(t => clearTimeout(t));
    };
  }, [gameState?.currentPlayer, gameState?.phase]);

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
        <ScoreBoard state={gameState} language={language} />
      </div>
      <ActionPanel
        state={gameState}
        language={language}
        onRollDice={handleRollDice}
        onEndTurn={handleEndTurn}
        onOpenBuild={() => setDialogs(d => ({ ...d, build: true }))}
        onOpenMortgage={() => setDialogs(d => ({ ...d, mortgage: true }))}
        onOpenTrade={() => {}}
        onPayFine={handlePayFine}
        onUseCard={handleUseJailCard}
        onRollForDoubles={handleRollForDoubles}
      />

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
