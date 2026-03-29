/**
 * Mahjong Solitaire Translations
 * English and Danish text
 */

export const mahjongTranslations = {
  en: {
    menu: {
      game: 'Game',
      help: 'Help',
    },
    game: {
      new: 'New Game',
      undo: 'Undo',
      shuffle: 'Shuffle',
      hint: 'Hint',
      pause: 'Pause',
      resume: 'Resume',
    },
    stats: {
      moves: 'Moves',
      time: 'Time',
      remaining: 'Tiles',
    },
    instructions: {
      title: 'How to Play',
      objective: 'Match pairs of free tiles to clear the board. A tile is free if it is not covered by another tile and has at least one side (left or right) open.',
      controls: 'Controls',
      rules: [
        'Click a tile to select it',
        'Click another free tile with the same symbol to match',
        'Match all tiles to win',
        'H - Get a hint',
        'U - Undo last move',
        'S - Shuffle tiles (when no moves available)',
        'N - New game',
        'P - Pause',
      ],
    },
    messages: {
      clickToStart: 'Click any tile to start',
      paused: 'Paused',
      pressToContinue: 'Press P or click to continue',
      youWon: 'Congratulations! You Won!',
      noMoves: 'No moves available. Shuffle tiles to continue.',
    },
  },
  da: {
    menu: {
      game: 'Spil',
      help: 'Hjælp',
    },
    game: {
      new: 'Nyt spil',
      undo: 'Fortryd',
      shuffle: 'Bland',
      hint: 'Fif',
      pause: 'Pause',
      resume: 'Fortsæt',
    },
    stats: {
      moves: 'Træk',
      time: 'Tid',
      remaining: 'Brikker',
    },
    instructions: {
      title: 'Sådan spilles',
      objective: 'Match par af frie brikker for at rydde brættet. En brik er fri, hvis den ikke er dækket af en anden brik og har mindst én side (venstre eller højre) åben.',
      controls: 'Styring',
      rules: [
        'Klik på en brik for at vælge den',
        'Klik på en anden fri brik med samme symbol for at matche',
        'Match alle brikker for at vinde',
        'H - Få et fif',
        'U - Fortryd sidste træk',
        'S - Bland brikker (når ingen træk er mulige)',
        'N - Nyt spil',
        'P - Pause',
      ],
    },
    messages: {
      clickToStart: 'Klik på en brik for at starte',
      paused: 'Pauset',
      pressToContinue: 'Tryk P eller klik for at fortsætte',
      youWon: 'Tillykke! Du vandt!',
      noMoves: 'Ingen træk mulige. Bland brikker for at fortsætte.',
    },
  },
};
