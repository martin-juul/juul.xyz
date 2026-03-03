// Ludo Game Translations

import type { Language } from './types';

export const ludoTranslations = {
  en: {
    // Game title
    gameTitle: 'Ludo',
    gameSubtitle: 'Classic Board Game',

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
    selectToken: 'Select a token to move',
    hints: 'Hints',
    hintsOn: 'Hints On',
    hintsOff: 'Hints Off',

    // Player stats
    finished: 'Finished',
    home: 'Home',
    active: 'Active',

    // Game phases
    yourTurn: 'Your turn',
    aiThinking: 'thinking...',
    rolling: 'Rolling...',

    // Dice messages
    youRolled: 'You rolled',
    rolled: 'rolled',
    gotSix: 'Rolled a 6!',
    extraTurn: 'Roll again!',
    threeSixes: 'Three 6s! Turn ends.',

    // Token messages
    tokenMoves: 'moves',
    tokenEnters: 'enters the board',
    tokenCaptures: 'captures',
    tokenCaptured: 'was captured!',
    tokenFinishes: 'reaches the finish!',
    tokenNeedsExact: 'Need exact roll to finish',

    // Hint messages
    hintRecommended: 'Recommended',
    hintSuggested: 'Suggested',
    hintPossible: 'Possible',
    hintReasonCapture: 'Capture opponent!',
    hintReasonFinish: 'Reach the finish!',
    hintReasonProgress: 'Make progress',
    hintReasonSafe: 'Move to safety',
    hintReasonEnter: 'Enter the board',
    hintReasonBlock: 'Block opponents',

    // Win/lose
    congratulations: 'Congratulations!',
    youWin: 'You won!',
    youLose: 'Game Over',
    winner: 'wins!',
    finalStandings: 'Final Standings',
    turns: 'Turns',
    playAgain: 'Play Again',

    // Tutorial
    tutorialTitle: 'Welcome to Ludo!',
    tutorialSkip: 'Skip',
    tutorialNext: 'Next',
    tutorialBack: 'Back',
    tutorialStart: 'Start Playing',

    tutorialStep1Title: 'Welcome to Ludo',
    tutorialStep1Text: 'Ludo is a classic board game where you race to get all 4 of your tokens from your home base to the center finish area. You are the Red player, competing against 3 computer opponents.',

    tutorialStep2Title: 'Rolling a 6',
    tutorialStep2Text: 'To move a token out of your home base onto the board, you must roll a 6. Rolling a 6 also gives you another turn! But be careful - roll three 6s in a row and your turn ends immediately.',

    tutorialStep3Title: 'Moving Tokens',
    tutorialStep3Text: 'Move your tokens clockwise around the board based on your dice roll. Each token must complete a full lap around the board before entering its home stretch toward the center.',

    tutorialStep4Title: 'Capturing Opponents',
    tutorialStep4Text: 'Land on an opponent\'s token to send it back to their home base! However, tokens on safe squares (marked with stars) cannot be captured. The colored entry squares are also safe.',

    tutorialStep5Title: 'Winning the Game',
    tutorialStep5Text: 'To finish a token, you must roll the exact number needed to reach the center. The first player to get all 4 tokens to the finish wins! Good luck!',

    // Help/Rules
    helpTitle: 'Ludo Rules',
    helpObjective: 'Objective',
    helpObjectiveText: 'Be the first player to move all 4 of your tokens from your home base to the center finish area.',

    helpSetup: 'Setup',
    helpSetupText: 'Each player has 4 tokens that start in their colored home base. Players take turns in order: Red, Green, Yellow, Blue.',

    helpStarting: 'Starting',
    helpStartingText: 'Roll a 6 to move a token from your home base onto the board at your colored entry point.',

    helpMovement: 'Movement',
    helpMovementText: 'Roll the die and move one of your tokens clockwise around the board by that many spaces. You must move if possible.',

    helpExtraTurn: 'Extra Turns',
    helpExtraTurnText: 'Rolling a 6 gives you another turn. However, if you roll three 6s in a row, your turn ends immediately.',

    helpCapturing: 'Capturing',
    helpCapturingText: 'Land on an opponent\'s token to send it back to its home base. The opponent must roll a 6 to bring it back out.',

    helpSafe: 'Safe Squares',
    helpSafeText: 'Tokens on safe squares (star symbols) and colored entry squares cannot be captured. Multiple tokens can share a safe square.',

    helpHomeStretch: 'Home Stretch',
    helpHomeStretchText: 'After completing a full lap, tokens enter their colored home stretch - a private path to the center finish.',

    helpFinishing: 'Finishing',
    helpFinishingText: 'You must roll the exact number to enter the finish. Extra spaces cannot be used. All 4 tokens must finish to win.',

    // Stats
    stats: 'Statistics',
    gamesPlayed: 'Games Played',
    gamesWon: 'Games Won',
    winRate: 'Win Rate',
    currentStreak: 'Current Streak',
    bestStreak: 'Best Streak',
    tokensFinished: 'Tokens Finished',
    tokensCaptured: 'Tokens Captured',
    tokensLost: 'Tokens Lost',

    // First turn guide
    firstTurnHint: 'Click "Roll Dice" to begin!',
    firstTurnSelect: 'Click on a highlighted token to move it',
    noMovesAvailable: 'No moves available',

    // Colors
    red: 'Red',
    green: 'Green',
    yellow: 'Yellow',
    blue: 'Blue',
  },

  da: {
    // Game title
    gameTitle: 'Ludo',
    gameSubtitle: 'Klassisk Brætspil',

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
    rollDice: 'Kast Terning',
    endTurn: 'Afslut Tur',
    selectToken: 'Vælg en brik at flytte',
    hints: 'Fif',
    hintsOn: 'Fif Til',
    hintsOff: 'Fif Fra',

    // Player stats
    finished: 'Færdig',
    home: 'Hjemme',
    active: 'Aktiv',

    // Game phases
    yourTurn: 'Din tur',
    aiThinking: 'tænker...',
    rolling: 'Kaster...',

    // Dice messages
    youRolled: 'Du kastede',
    rolled: 'kastede',
    gotSix: 'Kastede en 6\'er!',
    extraTurn: 'Kast igen!',
    threeSixes: 'Tre 6\'ere! Tur slutter.',

    // Token messages
    tokenMoves: 'flytter',
    tokenEnters: 'kommer på brættet',
    tokenCaptures: 'slår',
    tokenCaptured: 'blev slået hjem!',
    tokenFinishes: 'når i mål!',
    tokenNeedsExact: 'Kræver præcis kast for at blive færdig',

    // Hint messages
    hintRecommended: 'Anbefalet',
    hintSuggested: 'Foreslået',
    hintPossible: 'Mulig',
    hintReasonCapture: 'Slå modstander!',
    hintReasonFinish: 'Nå i mål!',
    hintReasonProgress: 'Gør fremskridt',
    hintReasonSafe: 'Flyt i sikkerhed',
    hintReasonEnter: 'Kom på brættet',
    hintReasonBlock: 'Blokér modstandere',

    // Win/lose
    congratulations: 'Tillykke!',
    youWin: 'Du vandt!',
    youLose: 'Spillet Slut',
    winner: 'vinder!',
    finalStandings: 'Slutstilling',
    turns: 'Ture',
    playAgain: 'Spil Igen',

    // Tutorial
    tutorialTitle: 'Velkommen til Ludo!',
    tutorialSkip: 'Spring over',
    tutorialNext: 'Næste',
    tutorialBack: 'Tilbage',
    tutorialStart: 'Start Spil',

    tutorialStep1Title: 'Velkommen til Ludo',
    tutorialStep1Text: 'Ludo er et klassisk brætspil hvor du kapløber om at få alle 4 brikker fra din hjemmebase til målet i midten. Du er den Røde spiller og konkurrerer mod 3 computer-modstandere.',

    tutorialStep2Title: 'At Kaste en 6\'er',
    tutorialStep2Text: 'For at flytte en brik ud af din hjemmebase og ind på brættet, skal du slå en 6\'er. At slå en 6\'er giver dig også en ekstra tur! Men pas på - slår du tre 6\'ere i træk, slutter din tur straks.',

    tutorialStep3Title: 'At Flytte Brikker',
    tutorialStep3Text: 'Flyt dine brikker uret rundt om brættet baseret på dit terningekast. Hver brik skal fuldføre en hel omgang rundt om brættet før den kan komme ind i sin hjemme-strækning mod midten.',

    tutorialStep4Title: 'At Slå Modstandere',
    tutorialStep4Text: 'Land på en modstanders brik for at sende den tilbage til deres hjemmebase! Brikker på sikre felter (markeret med stjerner) kan dog ikke slås. De farvede indgangsfelter er også sikre.',

    tutorialStep5Title: 'At Vinde Spillet',
    tutorialStep5Text: 'For at gøre en brik færdig, skal du slå det præcise antal øjne der kræves for at nå midten. Den første spiller der får alle 4 brikker i mål vinder! Held og lykke!',

    // Help/Rules
    helpTitle: 'Ludo Regler',
    helpObjective: 'Mål',
    helpObjectiveText: 'Vær den første spiller til at flytte alle 4 brikker fra din hjemmebase til målet i midten.',

    helpSetup: 'Opstart',
    helpSetupText: 'Hver spiller har 4 brikker der starter i deres farvede hjemmebase. Spillerne skiftes efter tur: Rød, Grøn, Gul, Blå.',

    helpStarting: 'Start',
    helpStartingText: 'Slå en 6\'er for at flytte en brik fra din hjemmebase ud på brættet ved dit farvede indgangsfelt.',

    helpMovement: 'Bevægelse',
    helpMovementText: 'Kast terningen og flyt en af dine brikker uret rundt om brættet det antal felter. Du skal flytte hvis muligt.',

    helpExtraTurn: 'Ekstra Ture',
    helpExtraTurnText: 'At slå en 6\'er giver dig en ekstra tur. Men hvis du slår tre 6\'ere i træk, slutter din tur straks.',

    helpCapturing: 'At Slå',
    helpCapturingText: 'Land på en modstanders brik for at sende den tilbage til deres hjemmebase. Modstanderen skal slå en 6\'er for at få den ud igen.',

    helpSafe: 'Sikre Felter',
    helpSafeText: 'Brikker på sikre felter (stjernesymboler) og farvede indgangsfelter kan ikke slås. Flere brikker kan dele et sikkert felt.',

    helpHomeStretch: 'Hjemme-strækning',
    helpHomeStretchText: 'Efter en hel omgang kommer brikkerne ind i deres farvede hjemme-strækning - en privat sti til målet i midten.',

    helpFinishing: 'Mål',
    helpFinishingText: 'Du skal slå det præcise antal for at komme i mål. Overskydende felter kan ikke bruges. Alle 4 brikker skal i mål for at vinde.',

    // Stats
    stats: 'Statistik',
    gamesPlayed: 'Spil Spillet',
    gamesWon: 'Vundne Spil',
    winRate: 'Sejrsprocent',
    currentStreak: 'Nuværende Stribe',
    bestStreak: 'Bedste Stribe',
    tokensFinished: 'Brikker i Mål',
    tokensCaptured: 'Brikker Slået',
    tokensLost: 'Brikker Mistet',

    // First turn guide
    firstTurnHint: 'Klik "Kast Terning" for at begynde!',
    firstTurnSelect: 'Klik på en fremhævet brik for at flytte den',
    noMovesAvailable: 'Ingen træk mulige',

    // Colors
    red: 'Rød',
    green: 'Grøn',
    yellow: 'Gul',
    blue: 'Blå',
  },
};

export function t(key: keyof typeof ludoTranslations.en, lang: Language): string {
  return ludoTranslations[lang][key] || ludoTranslations.en[key] || key;
}
