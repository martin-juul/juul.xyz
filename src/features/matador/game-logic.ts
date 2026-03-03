import type {
  GameState,
  Player,
  BoardSpace,
  OwnableProperty,
  StreetProperty,
  OwnedProperty,
  TradeOffer,
  GamePhase,
} from './types';

import {
  BOARD_SPACES,
  CHANCE_CARDS,
  CHEST_CARDS,
  STARTING_CASH,
  PASS_GO_AMOUNT,
  JAIL_FINE,
  MAX_HOUSES,
  MAX_HOTELS,
  MAX_JAIL_TURNS,
  COLOR_GROUPS,
  RAILWAY_POSITIONS,
  BREWERY_POSITIONS,
  JAIL_POSITION,
} from './constants';

// Shuffle array using Fisher-Yates
function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Create initial game state
export function createInitialGameState(players: Omit<Player, 'cash' | 'position' | 'properties' | 'inJail' | 'jailTurns' | 'getOutOfJailCards' | 'doublesCount' | 'bankrupt'>[]): GameState {
  const fullPlayers: Player[] = players.map(p => ({
    ...p,
    cash: STARTING_CASH,
    position: 0,
    properties: [],
    inJail: false,
    jailTurns: 0,
    getOutOfJailCards: 0,
    doublesCount: 0,
    bankrupt: false,
  }));

  return {
    players: fullPlayers,
    currentPlayer: 0,
    phase: 'rolling',
    dice: [1, 1],
    diceRolled: false,
    spaces: BOARD_SPACES,
    chanceDeck: shuffle(CHANCE_CARDS),
    chestDeck: shuffle(CHEST_CARDS),
    usedChanceCards: [],
    usedChestCards: [],
    currentCard: null,
    auction: null,
    tradeOffer: null,
    housesAvailable: MAX_HOUSES,
    hotelsAvailable: MAX_HOTELS,
    lastRoll: null,
    message: null,
    winner: null,
    turnCount: 1,
  };
}

// Roll dice
export function rollDice(): [number, number] {
  return [
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1,
  ];
}

// Check if roll is doubles
export function isDoubles(dice: [number, number]): boolean {
  return dice[0] === dice[1];
}

// Get next player index
export function getNextPlayer(state: GameState): number {
  let next = (state.currentPlayer + 1) % state.players.length;
  while (state.players[next].bankrupt) {
    next = (next + 1) % state.players.length;
    if (next === state.currentPlayer) break;
  }
  return next;
}

// Move player and handle passing start
export function movePlayer(state: GameState, spaces: number): GameState {
  const player = state.players[state.currentPlayer];
  const oldPosition = player.position;
  const newPosition = (oldPosition + spaces) % 40;
  const passedStart = oldPosition > newPosition && newPosition !== 0;

  const updatedPlayers = [...state.players];
  updatedPlayers[state.currentPlayer] = {
    ...player,
    position: newPosition,
    cash: passedStart && !player.inJail ? player.cash + PASS_GO_AMOUNT : player.cash,
  };

  return {
    ...state,
    players: updatedPlayers,
    message: passedStart && !player.inJail
      ? { en: `Passed Start! Collect ${PASS_GO_AMOUNT} kr`, da: `Passerede Start! Modtag ${PASS_GO_AMOUNT} kr` }
      : null,
  };
}

// Move player to specific position
export function moveToPosition(state: GameState, position: number, collectPassGo: boolean = true): GameState {
  const player = state.players[state.currentPlayer];
  const oldPosition = player.position;
  const passedStart = collectPassGo && (oldPosition > position || (position === 0 && oldPosition !== 0));

  const updatedPlayers = [...state.players];
  updatedPlayers[state.currentPlayer] = {
    ...player,
    position,
    cash: passedStart ? player.cash + PASS_GO_AMOUNT : player.cash,
  };

  return {
    ...state,
    players: updatedPlayers,
  };
}

// Get space at position
export function getSpaceAtPosition(position: number): BoardSpace {
  return BOARD_SPACES[position];
}

// Get property at position (if ownable)
export function getPropertyAtPosition(position: number): OwnableProperty | null {
  const space = BOARD_SPACES[position];
  if (space.type === 'street' || space.type === 'railway' || space.type === 'brewery') {
    return space as OwnableProperty;
  }
  return null;
}

// Get owner of property at position
export function getPropertyOwner(state: GameState, position: number): number | null {
  for (let i = 0; i < state.players.length; i++) {
    const player = state.players[i];
    if (player.properties.some(p => p.property.position === position)) {
      return i;
    }
  }
  return null;
}

// Check if player owns all properties in a color group
export function ownsColorGroup(player: Player, colorGroup: string): boolean {
  const groupPositions = COLOR_GROUPS[colorGroup];
  if (!groupPositions) return false;

  return groupPositions.every(pos =>
    player.properties.some(p => p.property.position === pos)
  );
}

// Count railways owned
export function countRailwaysOwned(player: Player): number {
  return player.properties.filter(p =>
    RAILWAY_POSITIONS.includes(p.property.position)
  ).length;
}

// Count breweries owned
export function countBreweriesOwned(player: Player): number {
  return player.properties.filter(p =>
    BREWERY_POSITIONS.includes(p.property.position)
  ).length;
}

// Calculate rent for a property
export function calculateRent(
  property: OwnableProperty,
  owner: Player,
  diceValue?: number,
  isDoublesRoll: boolean = false
): number {
  if (property.type === 'street') {
    const street = property as StreetProperty;
    const ownedProp = owner.properties.find(p => p.property.position === street.position);
    if (!ownedProp || ownedProp.mortgaged) return 0;

    // Has houses or hotel
    if (ownedProp.houses > 0) {
      if (ownedProp.houses === 5) {
        return street.rentWithHotel;
      }
      return street.rentWithHouses[ownedProp.houses - 1];
    }

    // No houses - check monopoly
    const hasMonopoly = ownsColorGroup(owner, street.colorGroup);
    return hasMonopoly ? street.baseRent * 2 : street.baseRent;
  }

  if (property.type === 'railway') {
    const count = countRailwaysOwned(owner);
    return property.rentByOwnership[count - 1];
  }

  if (property.type === 'brewery') {
    const count = countBreweriesOwned(owner);
    const multiplier = count === 2 ? property.multiplierTwoOwned : property.multiplierOneOwned;
    return (diceValue || 2) * multiplier;
  }

  return 0;
}

// Buy property
export function buyProperty(state: GameState, playerIndex: number, property: OwnableProperty): GameState {
  const player = state.players[playerIndex];

  if (player.cash < property.price) {
    return state; // Cannot afford
  }

  const updatedPlayers = [...state.players];
  updatedPlayers[playerIndex] = {
    ...player,
    cash: player.cash - property.price,
    properties: [...player.properties, { property, mortgaged: false, houses: 0 }],
  };

  return {
    ...state,
    players: updatedPlayers,
    message: {
      en: `${player.name} bought ${property.nameDa} for ${property.price} kr`,
      da: `${player.name} købte ${property.nameDa} for ${property.price} kr`,
    },
  };
}

// Pay rent
export function payRent(state: GameState, property: OwnableProperty, diceValue: number): GameState {
  const currentPlayer = state.players[state.currentPlayer];
  const ownerIndex = getPropertyOwner(state, property.position);

  if (ownerIndex === null || ownerIndex === state.currentPlayer) {
    return state;
  }

  const owner = state.players[ownerIndex];
  const ownedProp = owner.properties.find(p => p.property.position === property.position);

  if (!ownedProp || ownedProp.mortgaged) {
    return state;
  }

  const rent = calculateRent(property, owner, diceValue);

  const updatedPlayers = [...state.players];
  updatedPlayers[state.currentPlayer] = {
    ...currentPlayer,
    cash: currentPlayer.cash - rent,
  };
  updatedPlayers[ownerIndex] = {
    ...owner,
    cash: owner.cash + rent,
  };

  return {
    ...state,
    players: updatedPlayers,
    message: {
      en: `${currentPlayer.name} paid ${rent} kr rent to ${owner.name}`,
      da: `${currentPlayer.name} betalte ${rent} kr leje til ${owner.name}`,
    },
  };
}

// Start auction
export function startAuction(state: GameState, property: OwnableProperty): GameState {
  const participants = state.players
    .map((p, i) => ({ player: p, index: i }))
    .filter(({ player }) => !player.bankrupt && player.cash > 0)
    .map(({ index }) => index);

  return {
    ...state,
    phase: 'auction',
    auction: {
      property,
      currentBid: property.price, // Minimum bid is property price
      currentBidder: null,
      participants,
      passed: [],
    },
  };
}

// Place bid in auction
export function placeBid(state: GameState, playerIndex: number, bidAmount: number): GameState {
  if (!state.auction) return state;

  const player = state.players[playerIndex];
  if (player.cash < bidAmount) return state;

  return {
    ...state,
    auction: {
      ...state.auction,
      currentBid: bidAmount,
      currentBidder: playerIndex,
    },
  };
}

// Pass in auction
export function passAuction(state: GameState, playerIndex: number): GameState {
  if (!state.auction) return state;

  const newPassed = [...state.auction.passed, playerIndex];
  const remainingParticipants = state.auction.participants.filter(
    p => !newPassed.includes(p)
  );

  // If only one participant remains or all passed
  if (remainingParticipants.length <= 1 || newPassed.length >= state.auction.participants.length) {
    const winner = state.auction.currentBidder;
    if (winner !== null) {
      return completeAuction({
        ...state,
        auction: { ...state.auction, passed: newPassed },
      });
    }
    // No one bid - property remains unowned
    return {
      ...state,
      phase: 'rolling',
      auction: null,
      message: {
        en: 'No one bought the property',
        da: 'Ingen købte grunden',
      },
    };
  }

  return {
    ...state,
    auction: {
      ...state.auction,
      passed: newPassed,
    },
  };
}

// Complete auction
export function completeAuction(state: GameState): GameState {
  if (!state.auction || state.auction.currentBidder === null) return state;

  const winner = state.players[state.auction.currentBidder];
  const property = state.auction.property;

  const updatedPlayers = [...state.players];
  updatedPlayers[state.auction.currentBidder] = {
    ...winner,
    cash: winner.cash - state.auction.currentBid,
    properties: [...winner.properties, { property, mortgaged: false, houses: 0 }],
  };

  return {
    ...state,
    players: updatedPlayers,
    phase: 'rolling',
    auction: null,
    message: {
      en: `${winner.name} won ${property.nameDa} at auction for ${state.auction.currentBid} kr`,
      da: `${winner.name} vandt ${property.nameDa} på auktion for ${state.auction.currentBid} kr`,
    },
  };
}

// Build house
export function buildHouse(state: GameState, position: number): GameState {
  const player = state.players[state.currentPlayer];
  const ownedProp = player.properties.find(p => p.property.position === position);

  if (!ownedProp || ownedProp.property.type !== 'street') return state;

  const street = ownedProp.property as StreetProperty;

  // Check monopoly
  if (!ownsColorGroup(player, street.colorGroup)) return state;

  // Check even building
  const groupPositions = COLOR_GROUPS[street.colorGroup];
  const minHouses = Math.min(
    ...groupPositions.map(pos => {
      const prop = player.properties.find(p => p.property.position === pos);
      return prop?.houses || 0;
    })
  );

  if (ownedProp.houses > minHouses) return state;

  // Check if building hotel (5 houses)
  if (ownedProp.houses === 4 && state.hotelsAvailable === 0) return state;
  if (ownedProp.houses < 4 && state.housesAvailable === 0) return state;

  // Check cost
  if (player.cash < street.houseCost) return state;

  const updatedPlayers = [...state.players];
  const updatedProperties = player.properties.map(p => {
    if (p.property.position === position) {
      const newHouses = p.houses + 1;
      return {
        ...p,
        houses: newHouses > 4 ? 5 : newHouses, // 5 = hotel
      };
    }
    return p;
  });

  updatedPlayers[state.currentPlayer] = {
    ...player,
    cash: player.cash - street.houseCost,
    properties: updatedProperties,
  };

  return {
    ...state,
    players: updatedPlayers,
    housesAvailable: ownedProp.houses < 4 ? state.housesAvailable - 1 : state.housesAvailable,
    hotelsAvailable: ownedProp.houses === 4 ? state.hotelsAvailable - 1 : state.hotelsAvailable,
  };
}

// Sell house
export function sellHouse(state: GameState, position: number): GameState {
  const player = state.players[state.currentPlayer];
  const ownedProp = player.properties.find(p => p.property.position === position);

  if (!ownedProp || ownedProp.houses === 0) return state;

  const street = ownedProp.property as StreetProperty;
  const sellPrice = Math.floor(street.houseCost / 2);

  // Check even selling
  const groupPositions = COLOR_GROUPS[street.colorGroup];
  const maxHouses = Math.max(
    ...groupPositions.map(pos => {
      const prop = player.properties.find(p => p.property.position === pos);
      return prop?.houses || 0;
    })
  );

  if (ownedProp.houses < maxHouses) return state;

  const updatedPlayers = [...state.players];
  const updatedProperties = player.properties.map(p => {
    if (p.property.position === position) {
      const wasHotel = p.houses === 5;
      return {
        ...p,
        houses: p.houses - 1,
      };
    }
    return p;
  });

  const wasHotel = ownedProp.houses === 5;

  updatedPlayers[state.currentPlayer] = {
    ...player,
    cash: player.cash + sellPrice,
    properties: updatedProperties,
  };

  return {
    ...state,
    players: updatedPlayers,
    housesAvailable: wasHotel ? state.housesAvailable : state.housesAvailable + 1,
    hotelsAvailable: wasHotel ? state.hotelsAvailable + 1 : state.hotelsAvailable,
  };
}

// Mortgage property
export function mortgageProperty(state: GameState, position: number): GameState {
  const player = state.players[state.currentPlayer];
  const ownedProp = player.properties.find(p => p.property.position === position);

  if (!ownedProp || ownedProp.mortgaged || ownedProp.houses > 0) return state;

  const updatedPlayers = [...state.players];
  const updatedProperties = player.properties.map(p => {
    if (p.property.position === position) {
      return {
        ...p,
        mortgaged: true,
      };
    }
    return p;
  });

  updatedPlayers[state.currentPlayer] = {
    ...player,
    cash: player.cash + ownedProp.property.mortgageValue,
    properties: updatedProperties,
  };

  return {
    ...state,
    players: updatedPlayers,
  };
}

// Unmortgage property
export function unmortgageProperty(state: GameState, position: number): GameState {
  const player = state.players[state.currentPlayer];
  const ownedProp = player.properties.find(p => p.property.position === position);

  if (!ownedProp || !ownedProp.mortgaged) return state;

  const cost = Math.floor(ownedProp.property.mortgageValue * 1.1); // 10% interest

  if (player.cash < cost) return state;

  const updatedPlayers = [...state.players];
  const updatedProperties = player.properties.map(p => {
    if (p.property.position === position) {
      return {
        ...p,
        mortgaged: false,
      };
    }
    return p;
  });

  updatedPlayers[state.currentPlayer] = {
    ...player,
    cash: player.cash - cost,
    properties: updatedProperties,
  };

  return {
    ...state,
    players: updatedPlayers,
  };
}

// Go to jail
export function goToJail(state: GameState, playerIndex?: number): GameState {
  const idx = playerIndex ?? state.currentPlayer;
  const player = state.players[idx];

  const updatedPlayers = [...state.players];
  updatedPlayers[idx] = {
    ...player,
    position: JAIL_POSITION,
    inJail: true,
    jailTurns: 0,
    doublesCount: 0,
  };

  return {
    ...state,
    players: updatedPlayers,
    phase: 'jail',
    message: {
      en: `${player.name} went to jail!`,
      da: `${player.name} gik i fængsel!`,
    },
  };
}

// Handle jail turn - pay fine
export function payJailFine(state: GameState): GameState {
  const player = state.players[state.currentPlayer];

  if (player.cash < JAIL_FINE) return state;

  const updatedPlayers = [...state.players];
  updatedPlayers[state.currentPlayer] = {
    ...player,
    cash: player.cash - JAIL_FINE,
    inJail: false,
    jailTurns: 0,
  };

  return {
    ...state,
    players: updatedPlayers,
    phase: 'rolling',
    diceRolled: false,
    message: {
      en: `${player.name} paid ${JAIL_FINE} kr and is out of jail`,
      da: `${player.name} betalte ${JAIL_FINE} kr og er ude af fængsel`,
    },
  };
}

// Handle jail turn - use get out of jail card
export function useJailCard(state: GameState): GameState {
  const player = state.players[state.currentPlayer];

  if (player.getOutOfJailCards === 0) return state;

  const updatedPlayers = [...state.players];
  updatedPlayers[state.currentPlayer] = {
    ...player,
    getOutOfJailCards: player.getOutOfJailCards - 1,
    inJail: false,
    jailTurns: 0,
  };

  return {
    ...state,
    players: updatedPlayers,
    phase: 'rolling',
    diceRolled: false,
    message: {
      en: `${player.name} used a Get Out of Jail Free card`,
      da: `${player.name} brugte et Kom ud af Fængsel kort`,
    },
  };
}

// Handle jail turn - roll for doubles
export function jailRollForDoubles(state: GameState, dice: [number, number]): GameState {
  const player = state.players[state.currentPlayer];
  const isDoublesRoll = isDoubles(dice);

  const updatedPlayers = [...state.players];
  let newPhase: GamePhase = 'jail';
  let newMessage = state.message;

  if (isDoublesRoll) {
    // Escape with doubles
    updatedPlayers[state.currentPlayer] = {
      ...player,
      inJail: false,
      jailTurns: 0,
    };
    newPhase = 'rolling';
    newMessage = {
      en: `${player.name} rolled doubles and escaped jail!`,
      da: `${player.name} slog slag og undslap fængsel!`,
    };
  } else if (player.jailTurns >= MAX_JAIL_TURNS - 1) {
    // Must pay after 3rd failed attempt
    if (player.cash >= JAIL_FINE) {
      updatedPlayers[state.currentPlayer] = {
        ...player,
        cash: player.cash - JAIL_FINE,
        inJail: false,
        jailTurns: 0,
      };
      newPhase = 'rolling';
      newMessage = {
        en: `${player.name} must pay ${JAIL_FINE} kr after 3 failed attempts`,
        da: `${player.name} skal betale ${JAIL_FINE} kr efter 3 mislykkede forsøg`,
      };
    } else {
      // Bankruptcy
      return handleBankruptcy(state);
    }
  } else {
    // Stay in jail
    updatedPlayers[state.currentPlayer] = {
      ...player,
      jailTurns: player.jailTurns + 1,
    };
    newMessage = {
      en: `${player.name} failed to roll doubles (${player.jailTurns + 1}/3)`,
      da: `${player.name} slog ikke slag (${player.jailTurns + 1}/3)`,
    };
  }

  return {
    ...state,
    players: updatedPlayers,
    phase: newPhase,
    diceRolled: true,
    dice,
    lastRoll: dice,
    message: newMessage,
  };
}

// Draw card
export function drawCard(state: GameState, type: 'chance' | 'chest'): GameState {
  const deck = type === 'chance' ? state.chanceDeck : state.chestDeck;
  const usedDeck = type === 'chance' ? state.usedChanceCards : state.usedChestCards;

  if (deck.length === 0) {
    // Reshuffle used cards
    const newState = {
      ...state,
      chanceDeck: type === 'chance' ? shuffle([...state.usedChanceCards]) : state.chanceDeck,
      chestDeck: type === 'chest' ? shuffle([...state.usedChestCards]) : state.chestDeck,
      usedChanceCards: type === 'chance' ? [] : state.usedChanceCards,
      usedChestCards: type === 'chest' ? [] : state.usedChestCards,
    };
    return drawCard(newState, type);
  }

  const card = deck[0];
  const remainingDeck = deck.slice(1);

  // Keep Get Out of Jail cards, return others to used pile
  const addToUsed = card.action !== 'getOutOfJail';

  return {
    ...state,
    chanceDeck: type === 'chance' ? remainingDeck : state.chanceDeck,
    chestDeck: type === 'chest' ? remainingDeck : state.chestDeck,
    usedChanceCards: type === 'chance' && addToUsed ? [...state.usedChanceCards, card] : state.usedChanceCards,
    usedChestCards: type === 'chest' && addToUsed ? [...state.usedChestCards, card] : state.usedChestCards,
    currentCard: card,
    phase: 'card',
  };
}

// Execute card action
export function executeCardAction(state: GameState, dice?: [number, number]): GameState {
  const card = state.currentCard;
  if (!card) return state;

  const player = state.players[state.currentPlayer];
  let newState = { ...state };
  const updatedPlayers = [...state.players];

  switch (card.action) {
    case 'collect':
    case 'collectFromBank':
      updatedPlayers[state.currentPlayer] = {
        ...player,
        cash: player.cash + (card.amount || 0),
      };
      break;

    case 'pay':
      updatedPlayers[state.currentPlayer] = {
        ...player,
        cash: player.cash - (card.amount || 0),
      };
      break;

    case 'collectFromEach':
      const activePlayers = state.players.filter(p => !p.bankrupt && p.id !== player.id);
      let totalCollected = 0;
      activePlayers.forEach((p, i) => {
        const amount = Math.min(card.amount || 0, p.cash);
        const playerIndex = state.players.findIndex(pl => pl.id === p.id);
        updatedPlayers[playerIndex] = {
          ...p,
          cash: p.cash - amount,
        };
        totalCollected += amount;
      });
      updatedPlayers[state.currentPlayer] = {
        ...player,
        cash: player.cash + totalCollected,
      };
      break;

    case 'payToEach':
      const activePlayersTo = state.players.filter(p => !p.bankrupt && p.id !== player.id);
      const totalToPay = (card.amount || 0) * activePlayersTo.length;
      if (player.cash < totalToPay) {
        return handleBankruptcy({ ...newState, players: updatedPlayers });
      }
      activePlayersTo.forEach(p => {
        const playerIndex = state.players.findIndex(pl => pl.id === p.id);
        updatedPlayers[playerIndex] = {
          ...p,
          cash: p.cash + (card.amount || 0),
        };
      });
      updatedPlayers[state.currentPlayer] = {
        ...player,
        cash: player.cash - totalToPay,
      };
      break;

    case 'moveTo':
      newState = moveToPosition(newState, card.position ?? 0, card.position !== 10 && card.position !== 30);
      break;

    case 'moveBack':
      const newPosition = (player.position - (card.position || 3) + 40) % 40;
      newState = moveToPosition({ ...newState, players: updatedPlayers }, newPosition, false);
      break;

    case 'moveToNearest':
      let targetPosition: number;
      if (card.positionType === 'railway') {
        const nextRailway = RAILWAY_POSITIONS.find(pos => pos > player.position);
        targetPosition = nextRailway ?? RAILWAY_POSITIONS[0];
      } else {
        const nextBrewery = BREWERY_POSITIONS.find(pos => pos > player.position);
        targetPosition = nextBrewery ?? BREWERY_POSITIONS[0];
      }
      newState = moveToPosition({ ...newState, players: updatedPlayers }, targetPosition, true);
      break;

    case 'goToJail':
      return goToJail({ ...newState, players: updatedPlayers });

    case 'getOutOfJail':
      updatedPlayers[state.currentPlayer] = {
        ...player,
        getOutOfJailCards: player.getOutOfJailCards + 1,
      };
      break;

    case 'payPerHouse':
      let totalHouseCost = 0;
      player.properties.forEach(p => {
        if (p.houses > 0 && p.houses < 5) {
          totalHouseCost += p.houses * (card.perHouseAmount || 0);
        } else if (p.houses === 5) {
          totalHouseCost += card.perHotelAmount || 0;
        }
      });
      updatedPlayers[state.currentPlayer] = {
        ...player,
        cash: player.cash - totalHouseCost,
      };
      break;
  }

  return {
    ...newState,
    players: updatedPlayers,
    currentCard: null,
    phase: 'landed',
  };
}

// Handle bankruptcy
export function handleBankruptcy(state: GameState, creditorIndex?: number): GameState {
  const player = state.players[state.currentPlayer];
  const updatedPlayers = [...state.players];

  // Mark player as bankrupt
  updatedPlayers[state.currentPlayer] = {
    ...player,
    bankrupt: true,
    cash: 0,
    properties: [],
  };

  // Transfer properties to creditor or auction them
  if (creditorIndex !== undefined && creditorIndex >= 0) {
    const creditor = updatedPlayers[creditorIndex];
    updatedPlayers[creditorIndex] = {
      ...creditor,
      properties: [...creditor.properties, ...player.properties],
    };
  }

  // Check for winner
  const activePlayers = updatedPlayers.filter(p => !p.bankrupt);
  if (activePlayers.length === 1) {
    const winnerIndex = state.players.findIndex(p => !p.bankrupt);
    return {
      ...state,
      players: updatedPlayers,
      phase: 'gameover',
      winner: winnerIndex,
      message: {
        en: `${activePlayers[0].name} wins!`,
        da: `${activePlayers[0].name} vinder!`,
      },
    };
  }

  return {
    ...state,
    players: updatedPlayers,
    phase: 'rolling',
    currentPlayer: getNextPlayer({ ...state, players: updatedPlayers }),
    message: {
      en: `${player.name} is bankrupt!`,
      da: `${player.name} er konkurs!`,
    },
  };
}

// Calculate player net worth
export function calculateNetWorth(player: Player): number {
  let worth = player.cash;

  player.properties.forEach(ownedProp => {
    if (ownedProp.mortgaged) {
      worth += ownedProp.property.mortgageValue;
    } else {
      worth += ownedProp.property.price;
      if (ownedProp.houses > 0 && ownedProp.property.type === 'street') {
        const street = ownedProp.property as StreetProperty;
        worth += ownedProp.houses * street.houseCost;
      }
    }
  });

  return worth;
}

// End turn
export function endTurn(state: GameState): GameState {
  const nextPlayer = getNextPlayer(state);

  return {
    ...state,
    currentPlayer: nextPlayer,
    phase: state.players[nextPlayer].inJail ? 'jail' : 'rolling',
    diceRolled: false,
    dice: [1, 1],
    lastRoll: null,
    turnCount: state.turnCount + 1,
    message: null,
  };
}

// Check if can afford something
export function canAfford(player: Player, amount: number): boolean {
  return player.cash >= amount;
}

// Get all tradeable properties for a player
export function getTradeableProperties(player: Player): OwnedProperty[] {
  return player.properties.filter(p => !p.mortgaged);
}

// Execute trade
export function executeTrade(state: GameState, trade: TradeOffer): GameState {
  const fromPlayer = state.players[trade.fromPlayer];
  const toPlayer = state.players[trade.toPlayer];

  const updatedPlayers = [...state.players];

  // Transfer properties
  const fromProperties = fromPlayer.properties.filter(
    p => !trade.propertiesOffered.includes(p.property.position)
  );
  const toPropertiesFromOffer = fromPlayer.properties.filter(
    p => trade.propertiesOffered.includes(p.property.position)
  );

  const toProperties = toPlayer.properties.filter(
    p => !trade.propertiesRequested.includes(p.property.position)
  );
  const fromPropertiesFromRequest = toPlayer.properties.filter(
    p => trade.propertiesRequested.includes(p.property.position)
  );

  updatedPlayers[trade.fromPlayer] = {
    ...fromPlayer,
    cash: fromPlayer.cash + trade.cashRequested - trade.cashOffered,
    properties: [...fromProperties, ...fromPropertiesFromRequest],
  };

  updatedPlayers[trade.toPlayer] = {
    ...toPlayer,
    cash: toPlayer.cash + trade.cashOffered - trade.cashRequested,
    properties: [...toProperties, ...toPropertiesFromOffer],
  };

  return {
    ...state,
    players: updatedPlayers,
    tradeOffer: null,
    phase: 'rolling',
    message: {
      en: `Trade completed between ${fromPlayer.name} and ${toPlayer.name}`,
      da: `Byttehandel gennemført mellem ${fromPlayer.name} og ${toPlayer.name}`,
    },
  };
}
