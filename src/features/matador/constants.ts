// Matador (Danish Monopoly) Game Constants
// Based on authentic BRIO/Algas Copenhagen edition

import type {
  BoardSpace,
  Card,
  TokenType,
  Difficulty,
} from './types';

// Player tokens
export const TOKENS: TokenType[] = ['car', 'dog', 'shoe', 'hat'];

export const TOKEN_NAMES = {
  car: { en: 'Car', da: 'Bil' },
  dog: { en: 'Dog', da: 'Hund' },
  shoe: { en: 'Shoe', da: 'Sko' },
  hat: { en: 'Hat', da: 'Hat' },
};

export const TOKEN_EMOJIS: Record<TokenType, string> = {
  car: '🚗',
  dog: '🐕',
  shoe: '👞',
  hat: '🎩',
};

// AI difficulty levels
export const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];

// Game settings
export const STARTING_CASH = 30000;
export const PASS_GO_AMOUNT = 4000;
export const JAIL_FINE = 1000;
export const INCOME_TAX = 4000;
export const INCOME_TAX_PERCENTAGE = 10;
export const LUXURY_TAX = 2000;
export const MAX_HOUSES = 32;
export const MAX_HOTELS = 12;
export const MAX_JAIL_TURNS = 3;

// Color group colors (CSS)
export const COLOR_GROUP_COLORS: Record<string, string> = {
  brown: '#8B4513',
  lightblue: '#87CEEB',
  pink: '#FF69B4',
  orange: '#FFA500',
  red: '#FF0000',
  yellow: '#FFD700',
  green: '#008000',
  darkblue: '#00008B',
};

// Board spaces - authentic Danish Matador (40 spaces, clockwise from Start)
export const BOARD_SPACES: BoardSpace[] = [
  // 0: Start
  { type: 'start', name: 'Start', nameDa: 'Start', position: 0 },

  // 1: Rødovrevej (Brown)
  {
    type: 'street',
    name: 'Rødovrevej',
    nameDa: 'Rødovrevej',
    colorGroup: 'brown',
    position: 1,
    price: 1200,
    mortgageValue: 600,
    baseRent: 50,
    rentWithHouses: [250, 750, 2250, 4000],
    rentWithHotel: 6000,
    houseCost: 1000,
  },

  // 2: Prøv Lykken (Chance)
  { type: 'chance', name: 'Chance', nameDa: 'Prøv Lykken', position: 2 },

  // 3: Hvidovrevej (Brown)
  {
    type: 'street',
    name: 'Hvidovrevej',
    nameDa: 'Hvidovrevej',
    colorGroup: 'brown',
    position: 3,
    price: 1200,
    mortgageValue: 600,
    baseRent: 50,
    rentWithHouses: [250, 750, 2250, 4000],
    rentWithHotel: 6000,
    houseCost: 1000,
  },

  // 4: Indkomstskat (Income Tax)
  {
    type: 'tax',
    name: 'Income Tax',
    nameDa: 'Indkomstskat',
    position: 4,
    amount: INCOME_TAX,
    percentage: INCOME_TAX_PERCENTAGE,
  },

  // 5: Hovedbanegården (Railway)
  {
    type: 'railway',
    name: 'Central Station',
    nameDa: 'Hovedbanegården',
    position: 5,
    price: 4000,
    mortgageValue: 2000,
    rentByOwnership: [500, 1000, 2000, 4000],
  },

  // 6: Roskildevej (Light Blue)
  {
    type: 'street',
    name: 'Roskildevej',
    nameDa: 'Roskildevej',
    colorGroup: 'lightblue',
    position: 6,
    price: 2000,
    mortgageValue: 1000,
    baseRent: 100,
    rentWithHouses: [500, 1500, 4500, 8000],
    rentWithHotel: 12000,
    houseCost: 1000,
  },

  // 7: Prøv Lykken (Chance)
  { type: 'chance', name: 'Chance', nameDa: 'Prøv Lykken', position: 7 },

  // 8: Valby Langgade (Light Blue)
  {
    type: 'street',
    name: 'Valby Langgade',
    nameDa: 'Valby Langgade',
    colorGroup: 'lightblue',
    position: 8,
    price: 2000,
    mortgageValue: 1000,
    baseRent: 100,
    rentWithHouses: [500, 1500, 4500, 8000],
    rentWithHotel: 12000,
    houseCost: 1000,
  },

  // 9: Allégade (Light Blue)
  {
    type: 'street',
    name: 'Allégade',
    nameDa: 'Allégade',
    colorGroup: 'lightblue',
    position: 9,
    price: 2400,
    mortgageValue: 1200,
    baseRent: 120,
    rentWithHouses: [600, 1800, 5400, 9600],
    rentWithHotel: 14400,
    houseCost: 1000,
  },

  // 10: I Fængsel / På Besøg (Jail)
  { type: 'jail', name: 'Jail', nameDa: 'I Fængsel / På Besøg', position: 10 },

  // 11: Frederiksberg Allé (Pink)
  {
    type: 'street',
    name: 'Frederiksberg Allé',
    nameDa: 'Frederiksberg Allé',
    colorGroup: 'pink',
    position: 11,
    price: 2800,
    mortgageValue: 1400,
    baseRent: 140,
    rentWithHouses: [700, 2100, 6300, 11200],
    rentWithHotel: 16800,
    houseCost: 2000,
  },

  // 12: Squash (Brewery)
  {
    type: 'brewery',
    name: 'Squash',
    nameDa: 'Squash',
    position: 12,
    price: 3000,
    mortgageValue: 1500,
    multiplierOneOwned: 100,
    multiplierTwoOwned: 200,
  },

  // 13: Bülowsvej (Pink)
  {
    type: 'street',
    name: 'Bülowsvej',
    nameDa: 'Bülowsvej',
    colorGroup: 'pink',
    position: 13,
    price: 2800,
    mortgageValue: 1400,
    baseRent: 140,
    rentWithHouses: [700, 2100, 6300, 11200],
    rentWithHotel: 16800,
    houseCost: 2000,
  },

  // 14: Gl. Kongevej (Pink)
  {
    type: 'street',
    name: 'Gl. Kongevej',
    nameDa: 'Gl. Kongevej',
    colorGroup: 'pink',
    position: 14,
    price: 3000,
    mortgageValue: 1500,
    baseRent: 150,
    rentWithHouses: [750, 2250, 6750, 12000],
    rentWithHotel: 18000,
    houseCost: 2000,
  },

  // 15: Østerport (Railway)
  {
    type: 'railway',
    name: 'Østerport',
    nameDa: 'Østerport',
    position: 15,
    price: 4000,
    mortgageValue: 2000,
    rentByOwnership: [500, 1000, 2000, 4000],
  },

  // 16: Bernstorffsvej (Orange)
  {
    type: 'street',
    name: 'Bernstorffsvej',
    nameDa: 'Bernstorffsvej',
    colorGroup: 'orange',
    position: 16,
    price: 3600,
    mortgageValue: 1800,
    baseRent: 180,
    rentWithHouses: [900, 2700, 8100, 14400],
    rentWithHotel: 21600,
    houseCost: 2000,
  },

  // 17: Prøv Lykken (Chance)
  { type: 'chance', name: 'Chance', nameDa: 'Prøv Lykken', position: 17 },

  // 18: Hellerupvej (Orange)
  {
    type: 'street',
    name: 'Hellerupvej',
    nameDa: 'Hellerupvej',
    colorGroup: 'orange',
    position: 18,
    price: 3600,
    mortgageValue: 1800,
    baseRent: 180,
    rentWithHouses: [900, 2700, 8100, 14400],
    rentWithHotel: 21600,
    houseCost: 2000,
  },

  // 19: Strandvejen (Orange)
  {
    type: 'street',
    name: 'Strandvejen',
    nameDa: 'Strandvejen',
    colorGroup: 'orange',
    position: 19,
    price: 4000,
    mortgageValue: 2000,
    baseRent: 200,
    rentWithHouses: [1000, 3000, 9000, 16000],
    rentWithHotel: 24000,
    houseCost: 2000,
  },

  // 20: Parkering (Parking)
  { type: 'parking', name: 'Parking', nameDa: 'Parkering', position: 20 },

  // 21: Trianglen (Red)
  {
    type: 'street',
    name: 'Trianglen',
    nameDa: 'Trianglen',
    colorGroup: 'red',
    position: 21,
    price: 4400,
    mortgageValue: 2200,
    baseRent: 220,
    rentWithHouses: [1100, 3300, 9900, 17600],
    rentWithHotel: 26400,
    houseCost: 3000,
  },

  // 22: Prøv Lykken (Chance)
  { type: 'chance', name: 'Chance', nameDa: 'Prøv Lykken', position: 22 },

  // 23: Østerbrogade (Red)
  {
    type: 'street',
    name: 'Østerbrogade',
    nameDa: 'Østerbrogade',
    colorGroup: 'red',
    position: 23,
    price: 4400,
    mortgageValue: 2200,
    baseRent: 220,
    rentWithHouses: [1100, 3300, 9900, 17600],
    rentWithHotel: 26400,
    houseCost: 3000,
  },

  // 24: Grønningen (Red)
  {
    type: 'street',
    name: 'Grønningen',
    nameDa: 'Grønningen',
    colorGroup: 'red',
    position: 24,
    price: 4800,
    mortgageValue: 2400,
    baseRent: 240,
    rentWithHouses: [1200, 3600, 10800, 19200],
    rentWithHotel: 28800,
    houseCost: 3000,
  },

  // 25: Nørreport (Railway)
  {
    type: 'railway',
    name: 'Nørreport',
    nameDa: 'Nørreport',
    position: 25,
    price: 4000,
    mortgageValue: 2000,
    rentByOwnership: [500, 1000, 2000, 4000],
  },

  // 26: Bredgade (Yellow)
  {
    type: 'street',
    name: 'Bredgade',
    nameDa: 'Bredgade',
    colorGroup: 'yellow',
    position: 26,
    price: 5200,
    mortgageValue: 2600,
    baseRent: 260,
    rentWithHouses: [1300, 3900, 11700, 20800],
    rentWithHotel: 31200,
    houseCost: 3000,
  },

  // 27: Kgs. Nytorv (Yellow)
  {
    type: 'street',
    name: 'Kgs. Nytorv',
    nameDa: 'Kgs. Nytorv',
    colorGroup: 'yellow',
    position: 27,
    price: 5200,
    mortgageValue: 2600,
    baseRent: 260,
    rentWithHouses: [1300, 3900, 11700, 20800],
    rentWithHotel: 31200,
    houseCost: 3000,
  },

  // 28: Carlsberg (Brewery)
  {
    type: 'brewery',
    name: 'Carlsberg',
    nameDa: 'Carlsberg',
    position: 28,
    price: 3000,
    mortgageValue: 1500,
    multiplierOneOwned: 100,
    multiplierTwoOwned: 200,
  },

  // 29: Østergade (Yellow)
  {
    type: 'street',
    name: 'Østergade',
    nameDa: 'Østergade',
    colorGroup: 'yellow',
    position: 29,
    price: 5600,
    mortgageValue: 2800,
    baseRent: 280,
    rentWithHouses: [1400, 4200, 12600, 22400],
    rentWithHotel: 33600,
    houseCost: 3000,
  },

  // 30: Gå i Fængsel (Go To Jail)
  { type: 'gotojail', name: 'Go To Jail', nameDa: 'Gå i Fængsel', position: 30 },

  // 31: Amagertorv (Green)
  {
    type: 'street',
    name: 'Amagertorv',
    nameDa: 'Amagertorv',
    colorGroup: 'green',
    position: 31,
    price: 6000,
    mortgageValue: 3000,
    baseRent: 300,
    rentWithHouses: [1500, 4500, 13500, 24000],
    rentWithHotel: 36000,
    houseCost: 4000,
  },

  // 32: Vimmelskaftet (Green)
  {
    type: 'street',
    name: 'Vimmelskaftet',
    nameDa: 'Vimmelskaftet',
    colorGroup: 'green',
    position: 32,
    price: 6000,
    mortgageValue: 3000,
    baseRent: 300,
    rentWithHouses: [1500, 4500, 13500, 24000],
    rentWithHotel: 36000,
    houseCost: 4000,
  },

  // 33: Prøv Lykken (Chance)
  { type: 'chance', name: 'Chance', nameDa: 'Prøv Lykken', position: 33 },

  // 34: Nygade (Green)
  {
    type: 'street',
    name: 'Nygade',
    nameDa: 'Nygade',
    colorGroup: 'green',
    position: 34,
    price: 6400,
    mortgageValue: 3200,
    baseRent: 320,
    rentWithHouses: [1600, 4800, 14400, 25600],
    rentWithHotel: 38400,
    houseCost: 4000,
  },

  // 35: Lyngby Station (Railway)
  {
    type: 'railway',
    name: 'Lyngby Station',
    nameDa: 'Lyngby Station',
    position: 35,
    price: 4000,
    mortgageValue: 2000,
    rentByOwnership: [500, 1000, 2000, 4000],
  },

  // 36: Frederiksberggade (Dark Blue)
  {
    type: 'street',
    name: 'Frederiksberggade',
    nameDa: 'Frederiksberggade',
    colorGroup: 'darkblue',
    position: 36,
    price: 7000,
    mortgageValue: 3500,
    baseRent: 350,
    rentWithHouses: [1750, 5250, 15750, 28000],
    rentWithHotel: 42000,
    houseCost: 4000,
  },

  // 37: Luksusskat (Luxury Tax)
  {
    type: 'tax',
    name: 'Luxury Tax',
    nameDa: 'Luksusskat',
    position: 37,
    amount: LUXURY_TAX,
  },

  // 38: Rådhuspladsen (Dark Blue)
  {
    type: 'street',
    name: 'Rådhuspladsen',
    nameDa: 'Rådhuspladsen',
    colorGroup: 'darkblue',
    position: 38,
    price: 8000,
    mortgageValue: 4000,
    baseRent: 400,
    rentWithHouses: [2000, 6000, 18000, 32000],
    rentWithHotel: 48000,
    houseCost: 4000,
  },

  // 39: Begivenhed (Community Chest)
  { type: 'chest', name: 'Community Chest', nameDa: 'Begivenhed', position: 39 },
];

// Chance cards (Prøv Lykken) - 16 cards
export const CHANCE_CARDS: Card[] = [
  {
    id: 'chance-1',
    type: 'chance',
    action: 'moveTo',
    position: 0,
    text: {
      en: 'Advance to Start. Collect 4,000 kr.',
      da: 'Ryk frem til Start. Modtag 4.000 kr.',
    },
  },
  {
    id: 'chance-2',
    type: 'chance',
    action: 'moveTo',
    position: 38,
    text: {
      en: 'Advance to Rådhuspladsen.',
      da: 'Ryk frem til Rådhuspladsen.',
    },
  },
  {
    id: 'chance-3',
    type: 'chance',
    action: 'payPerHouse',
    perHouseAmount: 500,
    perHotelAmount: 2000,
    text: {
      en: 'Make general repairs on all your properties. Pay 500 kr per house, 2,000 kr per hotel.',
      da: 'Udfør generelle reparationer på alle dine grunde. Betal 500 kr pr. hus, 2.000 kr pr. hotel.',
    },
  },
  {
    id: 'chance-4',
    type: 'chance',
    action: 'collectFromBank',
    amount: 1500,
    text: {
      en: 'Bank error in your favor. Collect 1,500 kr.',
      da: 'Bankfejl til din fordel. Modtag 1.500 kr.',
    },
  },
  {
    id: 'chance-5',
    type: 'chance',
    action: 'goToJail',
    text: {
      en: 'Go to jail. Do not pass Start, do not collect 4,000 kr.',
      da: 'Gå i fængsel. Ryk ikke forbi Start, modtag ikke 4.000 kr.',
    },
  },
  {
    id: 'chance-6',
    type: 'chance',
    action: 'getOutOfJail',
    text: {
      en: 'Get out of jail free. Keep this card until needed.',
      da: 'Kom ud af fængsel gratis. Behold dette kort indtil det skal bruges.',
    },
  },
  {
    id: 'chance-7',
    type: 'chance',
    action: 'moveTo',
    position: 35,
    text: {
      en: 'Advance to Lyngby Station. If owned, pay twice the rent.',
      da: 'Ryk frem til Lyngby Station. Hvis ejet, betal dobbelt leje.',
    },
  },
  {
    id: 'chance-8',
    type: 'chance',
    action: 'moveBack',
    position: 3,
    text: {
      en: 'Go back 3 spaces.',
      da: 'Gå 3 felter tilbage.',
    },
  },
  {
    id: 'chance-9',
    type: 'chance',
    action: 'pay',
    amount: 2000,
    text: {
      en: 'Speeding fine. Pay 2,000 kr.',
      da: 'Bøde for fartovertrædelse. Betal 2.000 kr.',
    },
  },
  {
    id: 'chance-10',
    type: 'chance',
    action: 'collectFromEach',
    amount: 500,
    text: {
      en: 'It\'s your birthday. Collect 500 kr from each player.',
      da: 'Det er din fødselsdag. Modtag 500 kr fra hver spiller.',
    },
  },
  {
    id: 'chance-11',
    type: 'chance',
    action: 'collectFromBank',
    amount: 2000,
    text: {
      en: 'You have won a crossword competition. Collect 2,000 kr.',
      da: 'Du har vundet en krydsordkonkurrence. Modtag 2.000 kr.',
    },
  },
  {
    id: 'chance-12',
    type: 'chance',
    action: 'moveTo',
    position: 11,
    text: {
      en: 'Advance to Frederiksberg Allé.',
      da: 'Ryk frem til Frederiksberg Allé.',
    },
  },
  {
    id: 'chance-13',
    type: 'chance',
    action: 'payToEach',
    amount: 500,
    text: {
      en: 'You are elected chairman of the board. Pay each player 500 kr.',
      da: 'Du er valgt som bestyrelsesformand. Betal hver spiller 500 kr.',
    },
  },
  {
    id: 'chance-14',
    type: 'chance',
    action: 'moveToNearest',
    positionType: 'railway',
    text: {
      en: 'Advance to the nearest railway. Pay twice the rent.',
      da: 'Ryk frem til nærmeste station. Betal dobbelt leje.',
    },
  },
  {
    id: 'chance-15',
    type: 'chance',
    action: 'moveToNearest',
    positionType: 'brewery',
    text: {
      en: 'Advance to the nearest brewery. If owned, pay twice the dice roll.',
      da: 'Ryk frem til nærmeste bryggeri. Hvis ejet, betal dobbelt terningkast.',
    },
  },
  {
    id: 'chance-16',
    type: 'chance',
    action: 'collectFromBank',
    amount: 1000,
    text: {
      en: 'Your building loan matures. Collect 1,000 kr.',
      da: 'Dit byggelån er forfaldent. Modtag 1.000 kr.',
    },
  },
];

// Community Chest cards (Begivenhed) - 16 cards
export const CHEST_CARDS: Card[] = [
  {
    id: 'chest-1',
    type: 'chest',
    action: 'moveTo',
    position: 0,
    text: {
      en: 'Advance to Start. Collect 4,000 kr.',
      da: 'Ryk frem til Start. Modtag 4.000 kr.',
    },
  },
  {
    id: 'chest-2',
    type: 'chest',
    action: 'collectFromBank',
    amount: 2000,
    text: {
      en: 'Income tax refund. Collect 2,000 kr.',
      da: 'Skatterefusion. Modtag 2.000 kr.',
    },
  },
  {
    id: 'chest-3',
    type: 'chest',
    action: 'pay',
    amount: 1000,
    text: {
      en: 'Hospital fees. Pay 1,000 kr.',
      da: 'Hospitalsregning. Betal 1.000 kr.',
    },
  },
  {
    id: 'chest-4',
    type: 'chest',
    action: 'collectFromBank',
    amount: 500,
    text: {
      en: 'Receive interest on your loans. Collect 500 kr.',
      da: 'Modtag renter på dine lån. Modtag 500 kr.',
    },
  },
  {
    id: 'chest-5',
    type: 'chest',
    action: 'getOutOfJail',
    text: {
      en: 'Get out of jail free. Keep this card until needed.',
      da: 'Kom ud af fængsel gratis. Behold dette kort indtil det skal bruges.',
    },
  },
  {
    id: 'chest-6',
    type: 'chest',
    action: 'goToJail',
    text: {
      en: 'Go to jail. Do not pass Start, do not collect 4,000 kr.',
      da: 'Gå i fængsel. Ryk ikke forbi Start, modtag ikke 4.000 kr.',
    },
  },
  {
    id: 'chest-7',
    type: 'chest',
    action: 'collectFromBank',
    amount: 1000,
    text: {
      en: 'You inherit 1,000 kr.',
      da: 'Du arver 1.000 kr.',
    },
  },
  {
    id: 'chest-8',
    type: 'chest',
    action: 'collectFromBank',
    amount: 3000,
    text: {
      en: 'From sale of stock you get 3,000 kr.',
      da: 'Fra salg af aktier får du 3.000 kr.',
    },
  },
  {
    id: 'chest-9',
    type: 'chest',
    action: 'pay',
    amount: 500,
    text: {
      en: 'Doctor\'s fee. Pay 500 kr.',
      da: 'Lægeregelning. Betal 500 kr.',
    },
  },
  {
    id: 'chest-10',
    type: 'chest',
    action: 'collectFromBank',
    amount: 1000,
    text: {
      en: 'Life insurance matures. Collect 1,000 kr.',
      da: 'Livsforsikring er forfalden. Modtag 1.000 kr.',
    },
  },
  {
    id: 'chest-11',
    type: 'chest',
    action: 'payPerHouse',
    perHouseAmount: 400,
    perHotelAmount: 1150,
    text: {
      en: 'Street repairs. Pay 400 kr per house, 1,150 kr per hotel.',
      da: 'Gadereparationer. Betal 400 kr pr. hus, 1.150 kr pr. hotel.',
    },
  },
  {
    id: 'chest-12',
    type: 'chest',
    action: 'collectFromBank',
    amount: 2500,
    text: {
      en: 'You have won second prize in a beauty contest. Collect 2,500 kr.',
      da: 'Du har vundet anden præmie i en skønhedskonkurrence. Modtag 2.500 kr.',
    },
  },
  {
    id: 'chest-13',
    type: 'chest',
    action: 'collectFromBank',
    amount: 1000,
    text: {
      en: 'You won the lottery. Collect 1,000 kr.',
      da: 'Du vandt i lotto. Modtag 1.000 kr.',
    },
  },
  {
    id: 'chest-14',
    type: 'chest',
    action: 'pay',
    amount: 1500,
    text: {
      en: 'School fees. Pay 1,500 kr.',
      da: 'Skolepenge. Betal 1.500 kr.',
    },
  },
  {
    id: 'chest-15',
    type: 'chest',
    action: 'collectFromBank',
    amount: 250,
    text: {
      en: 'Receive 250 kr for consulting work.',
      da: 'Modtag 250 kr for konsulentarbejde.',
    },
  },
  {
    id: 'chest-16',
    type: 'chest',
    action: 'collectFromEach',
    amount: 250,
    text: {
      en: 'Opera night. Collect 250 kr from each player.',
      da: 'Opera aften. Modtag 250 kr fra hver spiller.',
    },
  },
];

// Color groups for monopoly checking
export const COLOR_GROUPS: Record<string, number[]> = {
  brown: [1, 3],
  lightblue: [6, 8, 9],
  pink: [11, 13, 14],
  orange: [16, 18, 19],
  red: [21, 23, 24],
  yellow: [26, 27, 29],
  green: [31, 32, 34],
  darkblue: [36, 38],
};

// Railway positions
export const RAILWAY_POSITIONS = [5, 15, 25, 35];

// Brewery positions
export const BREWERY_POSITIONS = [12, 28];

// Jail position
export const JAIL_POSITION = 10;
