// Matador (Danish Monopoly) Translations

import type { Language } from './types';

export const matadorTranslations = {
  en: {
    // Game title
    gameTitle: 'Matador',
    gameSubtitle: 'Danish Monopoly',

    // Menu
    newGame: 'New Game',
    options: 'Options',
    rules: 'Rules',
    help: 'Help',
    quit: 'Quit',

    // Player setup
    playerName: 'Player',
    humanPlayer: 'You',
    aiPlayer: 'Computer',
    difficulty: 'Difficulty',
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    startGame: 'Start Game',

    // Game actions
    rollDice: 'Roll Dice',
    endTurn: 'End Turn',
    buyProperty: 'Buy Property',
    auctionProperty: 'Auction',
    build: 'Build',
    mortgage: 'Mortgage',
    trade: 'Trade',
    payFine: 'Pay Fine',
    useCard: 'Use Card',
    rollForDoubles: 'Roll for Doubles',

    // Player stats
    cash: 'Cash',
    netWorth: 'Net Worth',
    properties: 'Properties',
    houses: 'Houses',
    hotels: 'Hotels',
    mortgaged: 'Mortgaged',
    inJail: 'In Jail',

    // Board spaces
    start: 'Start',
    jail: 'Jail',
    goToJail: 'Go To Jail',
    parking: 'Parking',
    chance: 'Chance',
    communityChest: 'Community Chest',
    incomeTax: 'Income Tax',
    luxuryTax: 'Luxury Tax',

    // Property types
    street: 'Street',
    railway: 'Railway',
    brewery: 'Brewery',

    // Dialogs
    buyPropertyTitle: 'Buy Property?',
    auctionTitle: 'Auction',
    tradeTitle: 'Trade',
    buildTitle: 'Build Houses',
    mortgageTitle: 'Mortgage Properties',
    jailTitle: 'In Jail',
    cardTitle: 'Card Drawn',
    helpTitle: 'Rules & Help',
    gameOverTitle: 'Game Over',

    // Messages
    youRolled: 'You rolled',
    rolled: 'rolled',
    doubles: 'Doubles!',
    extraTurn: 'Roll again!',
    threeDoubles: 'Three doubles! Go to jail!',
    passedStart: 'Passed Start! Collect',
    landedOn: 'landed on',
    boughtProperty: 'bought',
    paidRent: 'paid rent to',
    collectedRent: 'collected rent from',
    wentToJail: 'went to jail',
    bankrupt: 'is bankrupt!',
    winner: 'wins!',

    // Prices and money
    price: 'Price',
    rent: 'Rent',
    withHouses: 'with houses',
    withHotel: 'with hotel',
    houseCost: 'House Cost',
    mortgageValue: 'Mortgage Value',
    unmortgageCost: 'Unmortgage Cost',

    // Currency
    currency: 'kr',

    // Buttons
    yes: 'Yes',
    no: 'No',
    ok: 'OK',
    cancel: 'Cancel',
    close: 'Close',
    confirm: 'Confirm',

    // Auction
    currentBid: 'Current Bid',
    yourBid: 'Your Bid',
    pass: 'Pass',
    bid: 'Bid',
    soldTo: 'Sold to',

    // Trade
    offer: 'Offer',
    request: 'Request',
    propose: 'Propose',
    accept: 'Accept',
    reject: 'Reject',

    // Build
    selectProperty: 'Select Property',
    housesBuilt: 'Houses Built',
    hotelBuilt: 'Hotel Built',
    noBuildableProperties: 'No properties available for building',
    mustOwnAll: 'You must own all properties in the color group',
    buildEvenly: 'Build evenly across the color group',

    // Mortgage
    mortgageProperty: 'Mortgage Property',
    unmortgageProperty: 'Unmortgage Property',
    noMortgagableProperties: 'No properties to mortgage',

    // Jail
    inJailMessage: 'You are in jail. Choose how to escape:',
    payFineMessage: 'Pay 1,000 kr fine',
    rollDoublesMessage: 'Roll doubles (3 tries)',
    useCardMessage: 'Use Get Out of Jail Free card',
    turnsInJail: 'Turns in jail',

    // Game over
    congratulations: 'Congratulations!',
    youWin: 'You won!',
    youLose: 'Game Over',
    finalStandings: 'Final Standings',

    // Help topics
    helpObjective: 'Objective',
    helpObjectiveText: 'Be the last player remaining with assets, or have the highest net worth when time runs out.',
    helpSetup: 'Setup',
    helpSetupText: 'Each player starts with 30,000 kr and is placed on Start. Players take turns clockwise.',
    helpMovement: 'Movement',
    helpMovementText: 'Roll two dice and move your token clockwise. Roll doubles to take another turn.',
    helpProperty: 'Buying Property',
    helpPropertyText: 'When landing on an unowned property, you may buy it for the listed price or auction it.',
    helpRent: 'Paying Rent',
    helpRentText: 'When landing on a property owned by another player, pay the rent shown on the deed.',
    helpBuilding: 'Building Houses',
    helpBuildingText: 'When you own all properties in a color group, you can build houses. Build evenly across all properties in the group.',
    helpJail: 'Jail Rules',
    helpJailText: 'Go to jail by landing on "Go To Jail", rolling three doubles, or drawing a card. To escape: pay 1,000 kr, roll doubles, or use a Get Out of Jail Free card.',
    helpBankruptcy: 'Bankruptcy',
    helpBankruptcyText: 'If you cannot pay what you owe, you are bankrupt. Your assets transfer to your creditor.',
  },

  da: {
    // Game title
    gameTitle: 'Matador',
    gameSubtitle: 'Dansk Monopol',

    // Menu
    newGame: 'Nyt Spil',
    options: 'Indstillinger',
    rules: 'Regler',
    help: 'Hjælp',
    quit: 'Afslut',

    // Player setup
    playerName: 'Spiller',
    humanPlayer: 'Dig',
    aiPlayer: 'Computer',
    difficulty: 'Sværhedsgrad',
    easy: 'Let',
    medium: 'Mellem',
    hard: 'Svær',
    startGame: 'Start Spil',

    // Game actions
    rollDice: 'Kast Terninger',
    endTurn: 'Afslut Tur',
    buyProperty: 'Køb Grund',
    auctionProperty: 'Auktion',
    build: 'Byg',
    mortgage: 'Pantsæt',
    trade: 'Byt',
    payFine: 'Betal Bøde',
    useCard: 'Brug Kort',
    rollForDoubles: 'Kast for Slag',

    // Player stats
    cash: 'Penge',
    netWorth: 'Formue',
    properties: 'Grunde',
    houses: 'Huse',
    hotels: 'Hoteller',
    mortgaged: 'Pantsat',
    inJail: 'I Fængsel',

    // Board spaces
    start: 'Start',
    jail: 'Fængsel',
    goToJail: 'Gå i Fængsel',
    parking: 'Parkering',
    chance: 'Prøv Lykken',
    communityChest: 'Begivenhed',
    incomeTax: 'Indkomstskat',
    luxuryTax: 'Luksusskat',

    // Property types
    street: 'Gade',
    railway: 'Station',
    brewery: 'Bryggeri',

    // Dialogs
    buyPropertyTitle: 'Køb Grund?',
    auctionTitle: 'Auktion',
    tradeTitle: 'Byttehandel',
    buildTitle: 'Byg Huse',
    mortgageTitle: 'Pantsæt Grunde',
    jailTitle: 'I Fængsel',
    cardTitle: 'Trukket Kort',
    helpTitle: 'Regler & Hjælp',
    gameOverTitle: 'Spillet Slut',

    // Messages
    youRolled: 'Du kastede',
    rolled: 'kastet',
    doubles: 'Slag!',
    extraTurn: 'Kast igen!',
    threeDoubles: 'Tre slag! Gå i fængsel!',
    passedStart: 'Passerede Start! Modtag',
    landedOn: 'landede på',
    boughtProperty: 'købte',
    paidRent: 'betalte leje til',
    collectedRent: 'modtog leje fra',
    wentToJail: 'gik i fængsel',
    bankrupt: 'er konkurs!',
    winner: 'vinder!',

    // Prices and money
    price: 'Pris',
    rent: 'Leje',
    withHouses: 'med huse',
    withHotel: 'med hotel',
    houseCost: 'Hus Pris',
    mortgageValue: 'Pantværdi',
    unmortgageCost: 'Indløsningspris',

    // Currency
    currency: 'kr',

    // Buttons
    yes: 'Ja',
    no: 'Nej',
    ok: 'OK',
    cancel: 'Annuller',
    close: 'Luk',
    confirm: 'Bekræft',

    // Auction
    currentBid: 'Nuværende Bud',
    yourBid: 'Dit Bud',
    pass: 'Pas',
    bid: 'Byd',
    soldTo: 'Solgt til',

    // Trade
    offer: 'Tilbud',
    request: 'Anmodning',
    propose: 'Foreslå',
    accept: 'Accepter',
    reject: 'Afvis',

    // Build
    selectProperty: 'Vælg Grund',
    housesBuilt: 'Huse Bygget',
    hotelBuilt: 'Hotel Bygget',
    noBuildableProperties: 'Ingen grunde tilgængelige for byggeri',
    mustOwnAll: 'Du skal eje alle grunde i farvegruppen',
    buildEvenly: 'Byg jævnt i farvegruppen',

    // Mortgage
    mortgageProperty: 'Pantsæt Grund',
    unmortgageProperty: 'Indløs Grund',
    noMortgagableProperties: 'Ingen grunde at pantsætte',

    // Jail
    inJailMessage: 'Du er i fængsel. Vælg hvordan du vil ud:',
    payFineMessage: 'Betal 1.000 kr bøde',
    rollDoublesMessage: 'Kast slag (3 forsøg)',
    useCardMessage: 'Brug Kom ud af Fængsel kort',
    turnsInJail: 'Ture i fængsel',

    // Game over
    congratulations: 'Tillykke!',
    youWin: 'Du vandt!',
    youLose: 'Spillet Slut',
    finalStandings: 'Slutstilling',

    // Help topics
    helpObjective: 'Mål',
    helpObjectiveText: 'Vær den sidste spiller tilbage med aktiver, eller havn den højeste formue når tiden udløber.',
    helpSetup: 'Opstart',
    helpSetupText: 'Hver spiller starter med 30.000 kr og placeres på Start. Spillerne skiftes urets retning.',
    helpMovement: 'Bevægelse',
    helpMovementText: 'Kast to terninger og flyt din brik urets retning. Kast slag for at få en ekstra tur.',
    helpProperty: 'Køb af Grunde',
    helpPropertyText: 'Når du lander på en ikke-ejet grund, kan du købe den til den angivne pris eller sætte den på auktion.',
    helpRent: 'Betaling af Leje',
    helpRentText: 'Når du lander på en grund ejet af en anden spiller, betal lejen vist på skødet.',
    helpBuilding: 'Bygning af Huse',
    helpBuildingText: 'Når du ejer alle grunde i en farvegruppe, kan du bygge huse. Byg jævnt på alle grunde i gruppen.',
    helpJail: 'Fængselsregler',
    helpJailText: 'Gå i fængsel ved at lande på "Gå i Fængsel", kaste tre slag, eller trække et kort. For at komme ud: betal 1.000 kr, kast slag, eller brug et Kom ud af Fængsel kort.',
    helpBankruptcy: 'Konkurs',
    helpBankruptcyText: 'Hvis du ikke kan betale hvad du skylder, er du konkurs. Dine aktiver overgår til din kreditor.',
  },
};

export function t(key: keyof typeof matadorTranslations.en, lang: Language): string {
  return matadorTranslations[lang][key] || matadorTranslations.en[key] || key;
}
