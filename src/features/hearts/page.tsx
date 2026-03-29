import { useState, useCallback, useEffect, useRef } from 'preact/hooks';
import { useLanguage } from '../../context/language-context';
import { useStatus } from '../../context/status-context';
import { SUIT_SYMBOLS, SUIT_COLORS, type Suit, type Card } from '../../lib/card-games';
import type {
  Player,
  Trick,
  GamePhase,
  PlayerPosition,
  PassDirection,
} from './types';
import {
  dealCards,
  sortHand,
  countPoints,
  getPlayerToLeft,
  getPlayerToRight,
  getPlayerAcross,
} from './deck';
import {
  isValidPlay,
  resolveTrick,
  calculateScores,
  selectAIPassCards,
  selectAICard,
  getPassDirection,
  getPassTarget,
  executePass,
  isGameOver,
  getWinner,
} from './game-logic';
import './hearts.css';

const PLAYERS: PlayerPosition[] = ['south', 'west', 'north', 'east'];

export function Hearts() {
  const { t, language } = useLanguage();
  const { setStatusText } = useStatus();
  const txt = t.hearts;

  // Game state
  const [players, setPlayers] = useState<Player[]>(() => dealCards());
  const [phase, setPhase] = useState<GamePhase>('passing');
  const [currentPlayer, setCurrentPlayer] = useState<PlayerPosition>('south');
  const [currentTrick, setCurrentTrick] = useState<Trick>({
    cards: [],
    leader: 'south',
    complete: false,
  });
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [heartsBroken, setHeartsBroken] = useState(false);
  const [roundNumber, setRoundNumber] = useState(1);
  const [passDirection, setPassDirection] = useState<PassDirection>(getPassDirection(1));
  const [trickNumber, setTrickNumber] = useState(1);
  const [aiPassCards, setAiPassCards] = useState<Record<PlayerPosition, string[]>>({
    south: [],
    west: [],
    north: [],
    east: [],
  });
  const [showScoreboard, setShowScoreboard] = useState(false);
  const [animationDelay, setAnimationDelay] = useState(false);

  const trickTimerRef = useRef<number[]>([]);

  // Helper to schedule timeout and track ID
  const scheduleTimeout = useCallback((callback: () => void, delay: number) => {
    const id = window.setTimeout(() => {
      // Remove this timeout ID from the array after it fires
      trickTimerRef.current = trickTimerRef.current.filter(t => t !== id);
      callback();
    }, delay);
    trickTimerRef.current.push(id);
    return id;
  }, []);

  // Helper to clear all pending timeouts
  const clearAllTimeouts = useCallback(() => {
    trickTimerRef.current.forEach(id => clearTimeout(id));
    trickTimerRef.current = [];
  }, []);

  // Ref to always get fresh state (solves stale closure issues)
  const gameStateRef = useRef({ players, phase, currentPlayer, currentTrick, heartsBroken, trickNumber });
  gameStateRef.current = { players, phase, currentPlayer, currentTrick, heartsBroken, trickNumber };

  // Turn counter to force AI effect re-runs on turn changes
  const [turnCounter, setTurnCounter] = useState(0);

  // Track which player the AI was last processing to detect player changes
  const lastProcessedPlayerRef = useRef<PlayerPosition>('south');

  // Track if we're currently processing an AI turn (prevents re-entry)
  const isProcessingRef = useRef(false);

  // Update status message based on game state
  useEffect(() => {
    switch (phase) {
      case 'passing':
        setStatusText(txt.status.passing);
        break;
      case 'playing':
        if (currentPlayer === 'south') {
          setStatusText(txt.status.playing.replace('{player}', txt.players.south));
        } else {
          setStatusText(txt.status.playing.replace('{player}', txt.players[currentPlayer]));
        }
        break;
      case 'trickEnd':
        const winner = currentTrick.winner;
        if (winner) {
          setStatusText(txt.status.trickEnd.replace('{player}', txt.players[winner]));
        }
        break;
      case 'roundEnd':
        // Round end status is set separately
        break;
      case 'gameEnd':
        // Game end status is set separately
        break;
    }
  }, [phase, currentPlayer, currentTrick.winner]);

  // AI turns - Fixed implementation using Matador pattern
  useEffect(() => {
    // Get fresh state from ref
    const currentState = gameStateRef.current;
    if (currentState.phase !== 'playing') {
      return;
    }

    const player = currentState.players.find(p => p.position === currentState.currentPlayer);
    if (!player || player.isHuman) {
      // Human player - enable controls
      lastProcessedPlayerRef.current = currentState.currentPlayer;
      isProcessingRef.current = false;
      return;
    }

    // Check if this is a new player's turn
    const playerChanged = lastProcessedPlayerRef.current !== currentState.currentPlayer;

    // Prevent re-entry: if we're already processing this player, don't start again
    if (!playerChanged && isProcessingRef.current) {
      return;
    }

    console.log('[Hearts AI] Starting turn for:', player.position);
    lastProcessedPlayerRef.current = currentState.currentPlayer;
    isProcessingRef.current = true;

    // AI plays a card
    const playAICard = () => {
      const state = gameStateRef.current;
      const aiPlayer = state.players.find(p => p.position === state.currentPlayer);
      if (!aiPlayer) return;

      const isFirstTrick = state.trickNumber === 1 && state.currentTrick.cards.length === 0;
      const isLead = state.currentTrick.cards.length === 0;

      const cardToPlay = selectAICard(
        aiPlayer,
        state.currentTrick.cards.map(c => c.card),
        state.currentTrick.leadSuit || null,
        state.heartsBroken,
        isFirstTrick
      );

      // Validate
      if (!isValidPlay(cardToPlay, aiPlayer.hand, state.currentTrick, state.heartsBroken, isFirstTrick, isLead)) {
        console.error('[Hearts AI] Invalid card selected');
        return;
      }

      console.log('[Hearts AI] Playing card:', cardToPlay.rank, 'of', cardToPlay.suit);

      // Play the card
      const newHand = aiPlayer.hand.filter(c => c.id !== cardToPlay.id);
      const newTrickCards = [
        ...state.currentTrick.cards,
        { card: cardToPlay, player: state.currentPlayer }
      ];

      const newHeartsBroken = state.heartsBroken || cardToPlay.suit === 'hearts';

      // Update state
      setPlayers(prev => prev.map(p => p.position === state.currentPlayer ? { ...p, hand: newHand } : p));
      setCurrentTrick(prev => ({
        ...prev,
        cards: newTrickCards,
        leadSuit: prev.leadSuit || cardToPlay.suit,
      }));
      setHeartsBroken(newHeartsBroken);

      // Check if trick is complete
      if (newTrickCards.length === 4) {
        // Trick complete
        setPhase('trickEnd');
        setAnimationDelay(true);

        const winner = resolveTrick({
          ...state.currentTrick,
          cards: newTrickCards,
          leadSuit: state.currentTrick.leadSuit || cardToPlay.suit,
        });

        scheduleTimeout(() => {
          setPlayers(prev => prev.map(p => {
            if (p.position === winner) {
              return {
                ...p,
                collectedCards: [
                  ...p.collectedCards,
                  ...newTrickCards.map(c => c.card)
                ]
              };
            }
            return p;
          }));

          setCurrentPlayer(winner);
          setStatusText(txt.status.trickEnd.replace('{player}', txt.players[winner]));

          scheduleTimeout(() => {
            setAnimationDelay(false);
            isProcessingRef.current = false;

            if (state.trickNumber === 13) {
              endRound();
            } else {
              setPhase('playing');
              setTrickNumber(prev => prev + 1);
              setCurrentTrick({
                cards: [],
                leader: winner,
                complete: false,
              });
              setTurnCounter(c => c + 1); // Force effect re-run
            }
          }, 1000);
        }, 1500);
      } else {
        // Move to next player
        const nextPlayer = getPlayerToLeft(state.currentPlayer);
        setCurrentPlayer(nextPlayer);
        isProcessingRef.current = false;
        setTurnCounter(c => c + 1); // Force effect re-run
      }
    };

    // Start AI turn after short delay
    scheduleTimeout(playAICard, 600);

    return () => {
      clearAllTimeouts();
    };
  }, [turnCounter]); // Only depend on turnCounter to avoid stale closures

  // Handle card selection for passing
  const toggleCardSelection = useCallback((cardId: string) => {
    if (phase !== 'passing') return;

    setSelectedCards(prev => {
      if (prev.includes(cardId)) {
        return prev.filter(id => id !== cardId);
      } else if (prev.length < 3) {
        return [...prev, cardId];
      }
      return prev;
    });
  }, [phase]);

  // Confirm card pass
  const confirmPass = useCallback(() => {
    if (selectedCards.length !== 3) return;

    const humanPlayer = players.find(p => p.position === 'south');
    if (!humanPlayer) return;

    const passingCards: Record<PlayerPosition, string[]> = {
      south: selectedCards,
      west: [],
      north: [],
      east: [],
    };

    // AI players select their pass cards
    const aiPlayers = players.filter(p => !p.isHuman);
    for (const player of aiPlayers) {
      const cardsToPass = selectAIPassCards(player.hand);
      passingCards[player.position] = cardsToPass.map(c => c.id);
    }

    setAiPassCards(passingCards);

    // Execute the pass
    const passCardObjects: Record<PlayerPosition, Card[]> = {
      south: [],
      west: [],
      north: [],
      east: [],
    };
    for (const pos of PLAYERS) {
      const player = players.find(p => p.position === pos);
      if (!player) continue;
      passCardObjects[pos] = player.hand.filter(c =>
        passingCards[pos].includes(c.id)
      );
    }

    const newPlayers = executePass(players, passCardObjects, passDirection);
    setPlayers(newPlayers);
    setSelectedCards([]);
    setPhase('playing');

    // Find who has 2 of Clubs to start
    for (const player of newPlayers) {
      if (player.hand.some(c => c.suit === 'clubs' && c.rank === '2')) {
        setCurrentPlayer(player.position);
        setCurrentTrick({
          cards: [],
          leader: player.position,
          complete: false,
        });
        // Trigger AI effect if AI starts
        if (player.position !== 'south') {
          setTurnCounter(c => c + 1);
        }
        break;
      }
    }
  }, [selectedCards, players, passDirection]);

  // Handle card play
  const playCard = useCallback((cardId: string) => {
    if (phase !== 'playing' || currentPlayer !== 'south') return;

    const player = players.find(p => p.position === 'south');
    if (!player) return;

    const card = player.hand.find(c => c.id === cardId);
    if (!card) return;

    const isFirstTrick = trickNumber === 1 && currentTrick.cards.length === 0;
    const isLead = currentTrick.cards.length === 0;

    if (!isValidPlay(card, player.hand, currentTrick, heartsBroken, isFirstTrick, isLead)) {
      return; // Invalid play
    }

    // Play the card
    const newHand = player.hand.filter(c => c.id !== cardId);
    const newPlayer = { ...player, hand: newHand };

    const newTrick = {
      ...currentTrick,
      cards: [
        ...currentTrick.cards,
        { card, player: 'south' as PlayerPosition }
      ],
      leadSuit: currentTrick.leadSuit || card.suit,
    };

    setPlayers(prev => prev.map(p => p.position === 'south' ? newPlayer : p));
    setCurrentTrick(newTrick);

    // Check if hearts broken
    if (!heartsBroken && card.suit === 'hearts') {
      setHeartsBroken(true);
    }

    // Move to next player or resolve trick
    if (newTrick.cards.length === 4) {
      // Trick complete
      setPhase('trickEnd');
      setAnimationDelay(true);

      scheduleTimeout(() => {
        const winner = resolveTrick(newTrick);
        const completedTrick = { ...newTrick, winner, complete: true };

        // Give cards to winner
        setPlayers(prev => prev.map(p => {
          if (p.position === winner) {
            return {
              ...p,
              collectedCards: [
                ...p.collectedCards,
                ...newTrick.cards.map(c => c.card)
              ]
            };
          }
          return p;
        }));

        setCurrentPlayer(winner);

        scheduleTimeout(() => {
          setAnimationDelay(false);
          setPhase('playing');

          // Check if round is over (13 tricks)
          if (trickNumber === 13) {
            endRound();
          } else {
            setTrickNumber(prev => prev + 1);
            setCurrentTrick({
              cards: [],
              leader: winner,
              complete: false,
            });

            // Trigger AI effect re-run
            setTurnCounter(c => c + 1);
          }
        }, 1000);
      }, 1500);
    } else {
      setCurrentPlayer(getPlayerToLeft('south'));
      setTurnCounter(c => c + 1); // Trigger AI effect
    }
  }, [phase, currentPlayer, players, currentTrick, heartsBroken, trickNumber]);

  // AI turn handling
  const playAITurn = useCallback((playerPos: PlayerPosition) => {
    if (phase !== 'playing') return;

    const player = players.find(p => p.position === playerPos);
    if (!player) return;

    const isFirstTrick = trickNumber === 1 && currentTrick.cards.length === 0;
    const isLead = currentTrick.cards.length === 0;

    const cardToPlay = selectAICard(
      player,
      currentTrick.cards.map(c => c.card),
      currentTrick.leadSuit || null,
      heartsBroken,
      isFirstTrick
    );

    // Validate and play
    if (!isValidPlay(cardToPlay, player.hand, currentTrick, heartsBroken, isFirstTrick, isLead)) {
      // Shouldn't happen, but fallback to first valid card
      console.error('AI selected invalid card');
      return;
    }

    const newHand = player.hand.filter(c => c.id !== cardToPlay.id);
    const newPlayer = { ...player, hand: newHand };

    const newTrick = {
      ...currentTrick,
      cards: [
        ...currentTrick.cards,
        { card: cardToPlay, player: playerPos }
      ],
      leadSuit: currentTrick.leadSuit || cardToPlay.suit,
    };

    setPlayers(prev => prev.map(p => p.position === playerPos ? newPlayer : p));
    setCurrentTrick(newTrick);

    // Check if hearts broken
    if (!heartsBroken && cardToPlay.suit === 'hearts') {
      setHeartsBroken(true);
    }

    // Move to next player or resolve trick
    if (newTrick.cards.length === 4) {
      // Trick complete
      setPhase('trickEnd');
      setAnimationDelay(true);

      scheduleTimeout(() => {
        const winner = resolveTrick(newTrick);

        // Give cards to winner
        setPlayers(prev => prev.map(p => {
          if (p.position === winner) {
            return {
              ...p,
              collectedCards: [
                ...p.collectedCards,
                ...newTrick.cards.map(c => c.card)
              ]
            };
          }
          return p;
        }));

        setCurrentPlayer(winner);

        scheduleTimeout(() => {
          setAnimationDelay(false);
          setPhase('playing');

          // Check if round is over
          if (trickNumber === 13) {
            endRound();
          } else {
            setTrickNumber(prev => prev + 1);
            setCurrentTrick({
              cards: [],
              leader: winner,
              complete: false,
            });

            // If winner is AI, trigger next play
            if (winner !== 'south') {
              setTimeout(() => playAITurn(winner), 500);
            }
          }
        }, 1000);
      }, 1500);
    } else {
      const nextPlayer = getPlayerToLeft(playerPos);
      setCurrentPlayer(nextPlayer);

      // If next player is AI, continue
      if (nextPlayer !== 'south') {
        setTimeout(() => playAITurn(nextPlayer), 500);
      }
    }
  }, [phase, players, currentTrick, heartsBroken, trickNumber]);

  // End round and show scoreboard
  const endRound = useCallback(() => {
    const playersWithScores = calculateScores(players);

    // Add round scores to total scores
    const updatedPlayers = playersWithScores.map(p => ({
      ...p,
      score: p.score + p.roundScore,
      collectedCards: [],
      hand: [], // Will be dealt new cards
    }));

    setPlayers(updatedPlayers);
    setPhase('roundEnd');
    setShowScoreboard(true);
  }, [players]);

  // Start new round
  const startNewRound = useCallback(() => {
    const newRoundNum = roundNumber + 1;
    const newPassDirection = getPassDirection(newRoundNum);

    const newPlayers = dealCards();
    // Preserve total scores
    const playersWithScores = newPlayers.map(p => ({
      ...p,
      score: players.find(old => old.position === p.position)?.score || 0,
    }));

    setPlayers(playersWithScores);
    setRoundNumber(newRoundNum);
    setPassDirection(newPassDirection);
    setPhase(newPassDirection === 'none' ? 'playing' : 'passing');
    setTrickNumber(1);
    setHeartsBroken(false);
    setSelectedCards([]);
    setShowScoreboard(false);
    setCurrentTrick({
      cards: [],
      leader: 'south',
      complete: false,
    });

    // Find who has 2 of Clubs if no passing
    if (newPassDirection === 'none') {
      for (const player of playersWithScores) {
        if (player.hand.some(c => c.suit === 'clubs' && c.rank === '2')) {
          setCurrentPlayer(player.position);
          setCurrentTrick({
            cards: [],
            leader: player.position,
            complete: false,
          });

          // Trigger AI effect if AI starts
          if (player.position !== 'south') {
            setTurnCounter(c => c + 1);
          }
          break;
        }
      }
    }
  }, [roundNumber, players]);

  // Start new game
  const startNewGame = useCallback(() => {
    const newPlayers = dealCards();
    setPlayers(newPlayers);
    setRoundNumber(1);
    setPassDirection(getPassDirection(1));
    setPhase('passing');
    setTrickNumber(1);
    setHeartsBroken(false);
    setSelectedCards([]);
    setShowScoreboard(false);
    setCurrentTrick({
      cards: [],
      leader: 'south',
      complete: false,
    });
  }, []);

  // Cleanup timers
  useEffect(() => {
    return () => {
      clearAllTimeouts();
    };
  }, [clearAllTimeouts]);

  // Check game over when entering roundEnd
  useEffect(() => {
    if (phase === 'roundEnd') {
      const playersWithScores = calculateScores(players);
      if (isGameOver(players.map(p => ({ ...p, score: p.score + p.roundScore })))) {
        setPhase('gameEnd');
      }
    }
  }, [phase, players]);

  // Get pass direction text
  const getPassDirectionText = () => {
    switch (passDirection) {
      case 'left': return txt.game.passLeft;
      case 'right': return txt.game.passRight;
      case 'across': return txt.game.passAcross;
      case 'none': return txt.game.passNone;
    }
  };

  // Render card
  const renderCard = (card: Card, isSelected: boolean = false, isSmall: boolean = false, onClick: (() => void) | null = null) => {
    const colorClass = SUIT_COLORS[card.suit as Suit];
    const sizeClass = isSmall ? 'hearts-card-small' : 'hearts-card';

    return (
      <div
        class={`hearts-card ${sizeClass} ${colorClass} ${isSelected ? 'selected' : ''}`}
        onClick={onClick || undefined}
        style={onClick ? { cursor: 'pointer' } : {}}
      >
        <div class="hearts-card-rank">{card.rank}</div>
        <div class="hearts-card-suit">{SUIT_SYMBOLS[card.suit]}</div>
      </div>
    );
  };

  // Render player hand (human)
  const renderPlayerHand = (player: Player) => {
    return (
      <div class="hearts-player-hand">
        {player.hand.map(card => {
          const isSelected = selectedCards.includes(card.id);
          const canPlay = phase === 'playing' && currentPlayer === 'south';
          const canSelect = phase === 'passing' && selectedCards.length < 3;
          const isValid = canPlay && isValidPlay(
            card,
            player.hand,
            currentTrick,
            heartsBroken,
            trickNumber === 1 && currentTrick.cards.length === 0,
            currentTrick.cards.length === 0
          );
          const isClickable = (phase === 'passing' && canSelect) || isValid;

          return (
            <div
              key={card.id}
              onClick={() => {
                if (phase === 'passing' && canSelect) {
                  toggleCardSelection(card.id);
                } else if (canPlay) {
                  playCard(card.id);
                }
              }}
            >
              {renderCard(card, isSelected || canPlay, false, isClickable ? () => {} : null)}
            </div>
          );
        })}
      </div>
    );
  };

  // Render AI player (face down cards)
  const renderAIPlayer = (player: Player) => {
    const positionClass = `hearts-player-${player.position}`;
    const isActive = currentPlayer === player.position && phase === 'playing';

    return (
      <div class={`hearts-ai-player ${positionClass} ${isActive ? 'active' : ''}`}>
        <div class="hearts-player-name">
          {txt.players[player.position]}
          <span class="hearts-player-score">({player.score})</span>
        </div>
        <div class="hearts-cards-count">
          {player.hand.length} {language === 'da' ? 'kort' : 'cards'}
        </div>
      </div>
    );
  };

  // Render center trick area
  const renderTrickArea = () => {
    return (
      <div class="hearts-trick-area">
        {currentTrick.cards.map(play => {
          const positionClass = `hearts-trick-${play.player}`;
          return (
            <div key={play.card.id} class={`hearts-trick-card ${positionClass}`}>
              {renderCard(play.card, false, true, null)}
            </div>
          );
        })}
        {currentTrick.cards.length === 0 && (
          <div class="hearts-trick-empty">
            {phase === 'passing' ? getPassDirectionText() : txt.game.waiting}
          </div>
        )}
      </div>
    );
  };

  // Render scoreboard
  const renderScoreboard = () => {
    const playersWithScores = calculateScores(players);

    return (
      <div class="hearts-scoreboard-overlay">
        <div class="hearts-scoreboard">
          <h2>{txt.messages.roundOver}</h2>
          <table>
            <thead>
              <tr>
                <th>{txt.scoreboard.player}</th>
                <th>{txt.scoreboard.round}</th>
                <th>{txt.scoreboard.total}</th>
              </tr>
            </thead>
            <tbody>
              {playersWithScores.map(p => {
                const totalScore = p.score + p.roundScore;
                return (
                  <tr key={p.position}>
                    <td>{txt.players[p.position]}</td>
                    <td>{p.roundScore}</td>
                    <td>{totalScore}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {phase === 'gameEnd' ? (
            <div>
              <p class="hearts-winner-message">
                {txt.messages.gameWinner.replace(
                  '{player}',
                  txt.players[getWinner(playersWithScores.map(p => ({
                    ...p,
                    score: p.score + p.roundScore
                  }))).position]
                )}
              </p>
              <button onClick={startNewGame} class="hearts-btn">
                {txt.game.new}
              </button>
            </div>
          ) : (
            <button onClick={startNewRound} class="hearts-btn">
              {txt.scoreboard.continue}
            </button>
          )}
        </div>
      </div>
    );
  };

  // Render passing phase UI
  const renderPassingUI = () => {
    if (phase !== 'passing') return null;

    return (
      <div class="hearts-passing-ui">
        <div class="hearts-passing-info">
          <p>{getPassDirectionText()}</p>
          <p>{txt.game.selectThree} ({selectedCards.length}/3)</p>
        </div>
        <button
          class="hearts-btn hearts-pass-btn"
          onClick={confirmPass}
          disabled={selectedCards.length !== 3}
        >
          {txt.game.passConfirm}
        </button>
      </div>
    );
  };

  // Render game menu
  const renderMenu = () => {
    return (
      <div class="hearts-menu">
        <button onClick={startNewGame} class="hearts-btn">
          {txt.game.new}
        </button>
      </div>
    );
  };

  return (
    <div class="hearts-container">
      {renderMenu()}

      {renderPassingUI()}

      <div class="hearts-table">
        {renderAIPlayer(players.find(p => p.position === 'north')!)}
        {renderAIPlayer(players.find(p => p.position === 'west')!)}
        {renderAIPlayer(players.find(p => p.position === 'east')!)}

        {renderTrickArea()}

        <div class="hearts-south-player">
          <div class="hearts-player-name">
            {txt.players.south}
            <span class="hearts-player-score">({players.find(p => p.position === 'south')?.score || 0})</span>
          </div>
          {renderPlayerHand(players.find(p => p.position === 'south')!)}
        </div>
      </div>

      {(showScoreboard || phase === 'roundEnd' || phase === 'gameEnd') && renderScoreboard()}
    </div>
  );
}
