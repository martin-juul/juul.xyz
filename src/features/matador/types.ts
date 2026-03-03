// Matador (Danish Monopoly) Game Types

export type SpaceType =
  | 'start'
  | 'street'
  | 'railway'
  | 'brewery'
  | 'chance'
  | 'chest'
  | 'tax'
  | 'jail'
  | 'gotojail'
  | 'parking';

export type ColorGroup =
  | 'brown'
  | 'lightblue'
  | 'pink'
  | 'orange'
  | 'red'
  | 'yellow'
  | 'green'
  | 'darkblue';

export type TokenType = 'car' | 'dog' | 'shoe' | 'hat';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface StreetProperty {
  type: 'street';
  name: string;
  nameDa: string;
  colorGroup: ColorGroup;
  position: number;
  price: number;
  mortgageValue: number;
  baseRent: number;
  rentWithHouses: [number, number, number, number]; // 1-4 houses
  rentWithHotel: number;
  houseCost: number;
}

export interface RailwayProperty {
  type: 'railway';
  name: string;
  nameDa: string;
  position: number;
  price: number;
  mortgageValue: number;
  rentByOwnership: [number, number, number, number]; // 1-4 railways
}

export interface BreweryProperty {
  type: 'brewery';
  name: string;
  nameDa: string;
  position: number;
  price: number;
  mortgageValue: number;
  multiplierOneOwned: number;
  multiplierTwoOwned: number;
}

export type OwnableProperty = StreetProperty | RailwayProperty | BreweryProperty;

export interface TaxSpace {
  type: 'tax';
  name: string;
  nameDa: string;
  position: number;
  amount: number;
  percentage?: number;
}

export interface SpecialSpace {
  type: 'start' | 'jail' | 'gotojail' | 'parking';
  name: string;
  nameDa: string;
  position: number;
}

export interface CardSpace {
  type: 'chance' | 'chest';
  name: string;
  nameDa: string;
  position: number;
}

export type BoardSpace = OwnableProperty | TaxSpace | SpecialSpace | CardSpace;

export interface OwnedProperty {
  property: OwnableProperty;
  mortgaged: boolean;
  houses: number; // 0-4, 5 = hotel
}

export interface Player {
  id: number;
  name: string;
  token: TokenType;
  isHuman: boolean;
  difficulty?: Difficulty;
  cash: number;
  position: number;
  properties: OwnedProperty[];
  inJail: boolean;
  jailTurns: number;
  getOutOfJailCards: number;
  doublesCount: number;
  bankrupt: boolean;
}

export type CardAction =
  | 'collect'
  | 'pay'
  | 'collectFromEach'
  | 'payToEach'
  | 'moveTo'
  | 'moveBack'
  | 'moveToNearest'
  | 'goToJail'
  | 'getOutOfJail'
  | 'payPerHouse'
  | 'collectFromBank';

export interface Card {
  id: string;
  type: 'chance' | 'chest';
  action: CardAction;
  amount?: number;
  position?: number;
  positionType?: 'railway' | 'brewery';
  perHouseAmount?: number;
  perHotelAmount?: number;
  text: {
    en: string;
    da: string;
  };
}

export interface Auction {
  property: OwnableProperty;
  currentBid: number;
  currentBidder: number | null;
  participants: number[];
  passed: number[];
}

export interface TradeOffer {
  fromPlayer: number;
  toPlayer: number;
  propertiesOffered: number[]; // property positions
  propertiesRequested: number[];
  cashOffered: number;
  cashRequested: number;
}

export type GamePhase =
  | 'setup'
  | 'rolling'
  | 'moving'
  | 'landed'
  | 'buying'
  | 'auction'
  | 'card'
  | 'jail'
  | 'building'
  | 'trading'
  | 'mortgaging'
  | 'bankruptcy'
  | 'gameover';

export interface GameState {
  players: Player[];
  currentPlayer: number;
  phase: GamePhase;
  dice: [number, number];
  diceRolled: boolean;
  spaces: BoardSpace[];
  chanceDeck: Card[];
  chestDeck: Card[];
  usedChanceCards: Card[];
  usedChestCards: Card[];
  currentCard: Card | null;
  auction: Auction | null;
  tradeOffer: TradeOffer | null;
  housesAvailable: number;
  hotelsAvailable: number;
  lastRoll: [number, number] | null;
  message: {
    en: string;
    da: string;
  } | null;
  winner: number | null;
  turnCount: number;
}

export interface DialogState {
  buyProperty: boolean;
  auction: boolean;
  trade: boolean;
  build: boolean;
  mortgage: boolean;
  jail: boolean;
  card: boolean;
  help: boolean;
  gameOver: boolean;
}

export type Language = 'en' | 'da';
