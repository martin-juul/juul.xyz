import type {
  GameState,
  Player,
  OwnableProperty,
  StreetProperty,
  Difficulty,
  TradeOffer,
} from './types';

import {
  COLOR_GROUPS,
  JAIL_FINE,
} from './constants';

import {
  ownsColorGroup,
  calculateNetWorth,
  countRailwaysOwned,
  countBreweriesOwned,
} from './game-logic';

// Property valuation for AI decision-making
// Returns a multiplier (1.0 to max 1.15) for strategic value
function getPropertyStrategicMultiplier(property: OwnableProperty, player: Player): number {
  let multiplier = 1.0;

  // Bonus for completing color group
  if (property.type === 'street') {
    const street = property as StreetProperty;
    const groupPositions = COLOR_GROUPS[street.colorGroup];
    const ownedInGroup = groupPositions.filter(pos =>
      player.properties.some(p => p.property.position === pos)
    ).length;

    // Higher value if close to monopoly
    if (ownedInGroup === groupPositions.length - 1) {
      multiplier += 0.10; // Would complete monopoly
    } else if (ownedInGroup > 0) {
      multiplier += 0.05; // Already own in group
    }

    // Small premium for dark blue and green (high rent)
    if (street.colorGroup === 'darkblue' || street.colorGroup === 'green') {
      multiplier += 0.03;
    }
  }

  // Railway value increases with ownership
  if (property.type === 'railway') {
    const owned = countRailwaysOwned(player);
    if (owned === 3) multiplier += 0.08; // Would have all 4
    else if (owned >= 2) multiplier += 0.04;
  }

  // Brewery value increases with ownership
  if (property.type === 'brewery') {
    const owned = countBreweriesOwned(player);
    if (owned === 1) multiplier += 0.05; // Would have both
  }

  // Cap at 1.15 (15% over base price)
  return Math.min(multiplier, 1.15);
}

// AI decision to buy property
export function decideBuy(
  state: GameState,
  property: OwnableProperty,
  difficulty: Difficulty
): boolean {
  const player = state.players[state.currentPlayer];
  const cashAfterPurchase = player.cash - property.price;

  // Easy: Random decision with slight preference
  if (difficulty === 'easy') {
    if (cashAfterPurchase < 500) return false; // Keep some cash
    return Math.random() > 0.3; // 70% chance to buy
  }

  const strategicMultiplier = getPropertyStrategicMultiplier(property, player);

  // Medium: Strategic buying
  if (difficulty === 'medium') {
    // Always buy if it completes a color group
    if (property.type === 'street') {
      const street = property as StreetProperty;
      const groupPositions = COLOR_GROUPS[street.colorGroup];
      const ownedInGroup = groupPositions.filter(pos =>
        player.properties.some(p => p.property.position === pos)
      ).length;
      if (ownedInGroup === groupPositions.length - 1 && cashAfterPurchase > 0) {
        return true;
      }
    }

    // Buy if good strategic value and enough cash
    if (strategicMultiplier > 1.05 && cashAfterPurchase > 1000) {
      return true;
    }

    // Buy if affordable and not too low on cash
    return cashAfterPurchase > 2000 && strategicMultiplier >= 1;
  }

  // Hard: Optimal decision making
  if (difficulty === 'hard') {
    // Always complete monopolies
    if (property.type === 'street') {
      const street = property as StreetProperty;
      const groupPositions = COLOR_GROUPS[street.colorGroup];
      const ownedInGroup = groupPositions.filter(pos =>
        player.properties.some(p => p.property.position === pos)
      ).length;
      if (ownedInGroup === groupPositions.length - 1) {
        return true; // Even if it means low cash
      }
    }

    // Calculate future earning potential
    const potentialRent = calculatePotentialRent(property, player);
    const turnsToRecoup = property.price / potentialRent;

    // Buy if good investment
    if (turnsToRecoup < 10 && cashAfterPurchase > 500) {
      return true;
    }

    // Consider blocking others
    const blockingValue = calculateBlockingValue(property, state);
    if (blockingValue > property.price * 0.5 && cashAfterPurchase > 1000) {
      return true;
    }

    return strategicMultiplier > 1.08 && cashAfterPurchase > 1500;
  }

  return false;
}

// Calculate potential rent for a property
function calculatePotentialRent(property: OwnableProperty, player: Player): number {
  if (property.type === 'street') {
    const street = property as StreetProperty;
    const hasMonopoly = ownsColorGroup(player, street.colorGroup);
    return hasMonopoly ? street.baseRent * 2 : street.baseRent;
  }
  if (property.type === 'railway') {
    const count = countRailwaysOwned(player) + 1;
    return property.rentByOwnership[Math.min(count, 4) - 1];
  }
  if (property.type === 'brewery') {
    // Average dice roll is 7
    return 7 * property.multiplierOneOwned;
  }
  return 0;
}

// Calculate value of blocking other players
function calculateBlockingValue(property: OwnableProperty, state: GameState): number {
  let value = 0;

  state.players.forEach((player, index) => {
    if (index === state.currentPlayer || player.bankrupt) return;

    if (property.type === 'street') {
      const street = property as StreetProperty;
      const groupPositions = COLOR_GROUPS[street.colorGroup];
      const ownedInGroup = groupPositions.filter(pos =>
        player.properties.some(p => p.property.position === pos)
      ).length;

      // High value to block someone close to monopoly
      if (ownedInGroup === groupPositions.length - 1) {
        value += property.price * 0.3;
      }
    }
  });

  return value;
}

// AI decision for auction bidding
export function decideAuctionBid(
  state: GameState,
  property: OwnableProperty,
  currentBid: number,
  difficulty: Difficulty,
  bidderIndex: number
): number | null { // null means pass
  const bidder = state.players[bidderIndex];

  // Don't bid if we can't afford even the minimum
  if (bidder.cash <= currentBid) return null;

  // Get strategic multiplier for this property (max 1.15)
  const multiplier = getPropertyStrategicMultiplier(property, bidder);
  const maxBid = Math.min(bidder.cash, Math.floor(property.price * multiplier));

  // Never bid more than our max
  if (currentBid >= maxBid) return null;

  // Easy: Random bidding, tends to pass more often
  if (difficulty === 'easy') {
    if (Math.random() < 0.5) return null; // 50% chance to pass
    const increase = Math.floor(Math.random() * 100) + 50;
    const newBid = currentBid + increase;
    return newBid <= maxBid ? newBid : null;
  }

  // Medium: Value-based bidding
  if (difficulty === 'medium') {
    if (currentBid >= maxBid) return null;
    const increase = Math.min(100, maxBid - currentBid);
    return increase > 0 ? currentBid + increase : null;
  }

  // Hard: Strategic bidding
  if (difficulty === 'hard') {
    // Small blocking bonus
    const blockingValue = calculateBlockingValue(property, state);
    const hardMaxBid = Math.min(bidder.cash, Math.floor(maxBid + blockingValue * 0.5));

    if (currentBid >= hardMaxBid) return null;

    // Bid in small increments to minimize cost
    const increase = Math.min(50, hardMaxBid - currentBid);
    return increase > 0 ? currentBid + increase : null;
  }

  return null;
}

// AI decision for building houses
export function decideBuild(
  state: GameState,
  difficulty: Difficulty
): { position: number; houses: number }[] {
  const player = state.players[state.currentPlayer];
  const builds: { position: number; houses: number }[] = [];

  // Find all properties where we can build
  const buildableStreets: { property: StreetProperty; priority: number }[] = [];

  player.properties.forEach(ownedProp => {
    if (ownedProp.property.type !== 'street') return;
    if (ownedProp.mortgaged) return;
    if (ownedProp.houses >= 5) return; // Already has hotel

    const street = ownedProp.property as StreetProperty;
    if (!ownsColorGroup(player, street.colorGroup)) return;

    // Check even building rule
    const groupPositions = COLOR_GROUPS[street.colorGroup];
    const minHouses = Math.min(
      ...groupPositions.map(pos => {
        const prop = player.properties.find(p => p.property.position === pos);
        return prop?.houses || 0;
      })
    );

    if (ownedProp.houses > minHouses) return;

    // Calculate priority
    let priority = street.rentWithHotel / street.houseCost; // ROI

    // Bonus for orange and red (most landed on)
    if (street.colorGroup === 'orange' || street.colorGroup === 'red') {
      priority *= 1.3;
    }

    buildableStreets.push({ property: street, priority });
  });

  if (buildableStreets.length === 0) return [];

  // Sort by priority
  buildableStreets.sort((a, b) => b.priority - a.priority);

  // Easy: Build randomly, maybe 1-2 houses
  if (difficulty === 'easy') {
    const budget = Math.min(player.cash * 0.3, 2000);
    let spent = 0;

    for (const { property } of buildableStreets) {
      if (spent + property.houseCost > budget) break;
      builds.push({ position: property.position, houses: 1 });
      spent += property.houseCost;
    }

    return builds;
  }

  // Medium: Build strategically on best ROI
  if (difficulty === 'medium') {
    const budget = Math.min(player.cash * 0.5, 4000);
    let spent = 0;

    for (const { property } of buildableStreets) {
      while (spent + property.houseCost <= budget) {
        const existing = builds.find(b => b.position === property.position);
        if (existing) {
          if (existing.houses >= 4) break;
          existing.houses++;
        } else {
          builds.push({ position: property.position, houses: 1 });
        }
        spent += property.houseCost;
      }
    }

    return builds;
  }

  // Hard: Build optimally, consider blocking opponents
  if (difficulty === 'hard') {
    const budget = player.cash * 0.6;
    let spent = 0;

    // Build up to 3 houses on each property (sweet spot for rent)
    for (const { property } of buildableStreets) {
      const targetHouses = 3;
      let currentHouses = 0;

      while (currentHouses < targetHouses && spent + property.houseCost <= budget) {
        currentHouses++;
        spent += property.houseCost;
      }

      if (currentHouses > 0) {
        builds.push({ position: property.position, houses: currentHouses });
      }
    }

    return builds;
  }

  return [];
}

// AI decision for escaping jail
export function decideJailEscape(
  state: GameState,
  difficulty: Difficulty
): 'pay' | 'roll' | 'card' {
  const player = state.players[state.currentPlayer];

  // Early game: try to stay in jail (safe haven)
  const isEarlyGame = state.turnCount < 10;

  // If we have a card, consider using it
  if (player.getOutOfJailCards > 0) {
    // Easy: Use card immediately
    if (difficulty === 'easy') return 'card';

    // Medium: Save card for late game unless early
    if (difficulty === 'medium') {
      if (player.jailTurns >= 2 || !isEarlyGame) return 'card';
    }

    // Hard: Strategic use
    if (difficulty === 'hard') {
      // Use card if we're losing or in late game
      const myNetWorth = calculateNetWorth(player);
      const avgNetWorth = state.players
        .filter(p => !p.bankrupt)
        .reduce((sum, p) => sum + calculateNetWorth(p), 0) / state.players.filter(p => !p.bankrupt).length;

      if (myNetWorth < avgNetWorth || player.jailTurns >= 2) {
        return 'card';
      }
    }
  }

  // Pay fine if we can afford it and need to move
  if (player.cash >= JAIL_FINE) {
    // Easy: Random choice
    if (difficulty === 'easy') {
      return Math.random() > 0.5 ? 'pay' : 'roll';
    }

    // Medium: Pay if we have lots of cash or late in jail
    if (difficulty === 'medium') {
      if (player.jailTurns >= 2 || player.cash > 5000) return 'pay';
    }

    // Hard: Strategic decision
    if (difficulty === 'hard') {
      // In early game with low cash, stay in jail
      if (isEarlyGame && player.cash < 3000) return 'roll';

      // If we have properties to collect rent on, stay in jail
      if (player.properties.length > 5 && player.jailTurns < 2) return 'roll';

      // Otherwise pay to get out
      if (player.jailTurns >= 1) return 'pay';
    }
  }

  return 'roll';
}

// AI decision for trade proposal
export function decideTradeProposal(
  state: GameState,
  targetPlayerIndex: number,
  difficulty: Difficulty
): TradeOffer | null {
  const player = state.players[state.currentPlayer];
  const target = state.players[targetPlayerIndex];

  if (target.bankrupt || player.properties.length === 0) return null;

  // Find properties we want (to complete monopolies)
  const wantedProperties: number[] = [];
  const offeredProperties: number[] = [];

  player.properties.forEach(ownedProp => {
    if (ownedProp.property.type !== 'street') return;
    const street = ownedProp.property as StreetProperty;
    const groupPositions = COLOR_GROUPS[street.colorGroup];
    const ownedInGroup = groupPositions.filter(pos =>
      player.properties.some(p => p.property.position === pos)
    ).length;

    // If we only have 1 in group and don't have monopoly, consider trading it
    if (ownedInGroup === 1 && !ownsColorGroup(player, street.colorGroup)) {
      // Check if target has others in this group
      const targetHasInGroup = groupPositions.filter(pos =>
        target.properties.some(p => p.property.position === pos)
      ).length;
      if (targetHasInGroup === 0) {
        offeredProperties.push(ownedProp.property.position);
      }
    }
  });

  // Find properties target has that we want
  target.properties.forEach(ownedProp => {
    if (ownedProp.property.type !== 'street') return;
    const street = ownedProp.property as StreetProperty;
    const groupPositions = COLOR_GROUPS[street.colorGroup];
    const ownedInGroup = groupPositions.filter(pos =>
      player.properties.some(p => p.property.position === pos)
    ).length;

    // If we have all but one in group, we want this property
    if (ownedInGroup === groupPositions.length - 1) {
      wantedProperties.push(ownedProp.property.position);
    }
  });

  if (wantedProperties.length === 0 || offeredProperties.length === 0) {
    return null;
  }

  // Easy: Don't initiate trades
  if (difficulty === 'easy') return null;

  // Medium: Simple one-for-one trade
  if (difficulty === 'medium') {
    return {
      fromPlayer: state.currentPlayer,
      toPlayer: targetPlayerIndex,
      propertiesOffered: [offeredProperties[0]],
      propertiesRequested: [wantedProperties[0]],
      cashOffered: 0,
      cashRequested: 0,
    };
  }

  // Hard: Calculate fair trade with cash adjustment
  if (difficulty === 'hard') {
    const offeredValue = offeredProperties.slice(0, 2).reduce((sum, pos) => {
      const prop = player.properties.find(p => p.property.position === pos);
      return sum + (prop ? prop.property.price : 0);
    }, 0);

    const requestedValue = wantedProperties.slice(0, 2).reduce((sum, pos) => {
      const prop = target.properties.find(p => p.property.position === pos);
      return sum + (prop ? prop.property.price : 0);
    }, 0);

    const cashAdjustment = Math.abs(offeredValue - requestedValue);

    return {
      fromPlayer: state.currentPlayer,
      toPlayer: targetPlayerIndex,
      propertiesOffered: offeredProperties.slice(0, 2),
      propertiesRequested: wantedProperties.slice(0, 2),
      cashOffered: offeredValue < requestedValue ? cashAdjustment : 0,
      cashRequested: offeredValue > requestedValue ? Math.floor(cashAdjustment * 0.8) : 0,
    };
  }

  return null;
}

// AI decision to accept/reject trade
export function decideTradeAccept(
  state: GameState,
  trade: TradeOffer,
  difficulty: Difficulty
): boolean {
  const player = state.players[trade.toPlayer];

  // Easy: Random acceptance
  if (difficulty === 'easy') {
    return Math.random() > 0.5;
  }

  // Calculate value received vs given
  const receivedValue = trade.propertiesOffered.reduce((sum, pos) => {
    const prop = state.players[trade.fromPlayer].properties.find(p => p.property.position === pos);
    if (!prop) return sum;

    let value = prop.property.price;

    // Bonus if it helps complete our monopoly
    if (prop.property.type === 'street') {
      const street = prop.property as StreetProperty;
      const groupPositions = COLOR_GROUPS[street.colorGroup];
      const ownedInGroup = groupPositions.filter(p =>
        player.properties.some(op => op.property.position === p)
      ).length;

      if (ownedInGroup === groupPositions.length - 1) {
        value *= 1.5;
      }
    }

    return sum + value;
  }, 0) + trade.cashOffered;

  const givenValue = trade.propertiesRequested.reduce((sum, pos) => {
    const prop = player.properties.find(p => p.property.position === pos);
    if (!prop) return sum;

    let value = prop.property.price;

    // Penalty if it breaks our monopoly
    if (prop.property.type === 'street') {
      const street = prop.property as StreetProperty;
      if (ownsColorGroup(player, street.colorGroup)) {
        value *= 2; // Don't give up monopoly properties easily
      }
    }

    return sum + value;
  }, 0) + trade.cashRequested;

  // Medium: Accept if roughly fair
  if (difficulty === 'medium') {
    return receivedValue >= givenValue * 0.9;
  }

  // Hard: Accept only if beneficial
  if (difficulty === 'hard') {
    return receivedValue >= givenValue * 1.1;
  }

  return false;
}

// AI decision for mortgaging
export function decideMortgage(
  state: GameState,
  amountNeeded: number,
  difficulty: Difficulty
): number[] { // Returns positions to mortgage
  const player = state.players[state.currentPlayer];
  const toMortgage: { position: number; value: number }[] = [];

  let currentAmount = 0;

  // Find unmortgaged properties without houses
  const mortgagableProperties = player.properties.filter(p =>
    !p.mortgaged && p.houses === 0
  );

  // Sort by mortgage value (low to high for easy, high to low for hard)
  if (difficulty === 'easy') {
    mortgagableProperties.sort((a, b) => a.property.mortgageValue - b.property.mortgageValue);
  } else {
    mortgagableProperties.sort((a, b) => b.property.mortgageValue - a.property.mortgageValue);
  }

  for (const prop of mortgagableProperties) {
    if (currentAmount >= amountNeeded) break;

    // For hard difficulty, avoid mortgaging properties in monopolies
    if (difficulty === 'hard' && prop.property.type === 'street') {
      const street = prop.property as StreetProperty;
      if (ownsColorGroup(player, street.colorGroup)) continue;
    }

    toMortgage.push({
      position: prop.property.position,
      value: prop.property.mortgageValue,
    });
    currentAmount += prop.property.mortgageValue;
  }

  return toMortgage.map(m => m.position);
}
