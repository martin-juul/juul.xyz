// Ludo Board Component

import { h, FunctionalComponent } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import type { GameState, PlayerColor, Token as TokenType } from '../types';
import {
  TRACK_POSITIONS,
  HOME_STRETCH_POSITIONS,
  HOME_BASE_POSITIONS,
  SAFE_SQUARES,
  PLAYER_COLORS,
  PLAYER_COLORS_CSS,
} from '../constants';

interface BoardProps {
  gameState: GameState;
  movableTokens: string[];
  hints: { tokenId: string; priority: string }[];
  onTokenClick: (tokenId: string) => void;
}

// Find token at a specific track position
function findTokenAtPosition(tokens: TokenType[], position: number): TokenType | null {
  return tokens.find(t => t.state === 'active' && t.position === position) || null;
}

// Get hint class for a token
function getHintClass(tokenId: string, hints: { tokenId: string; priority: string }[]): string {
  const hint = hints.find(h => h.tokenId === tokenId);
  if (!hint) return '';
  if (hint.priority === 'recommended') return 'hint-recommended';
  if (hint.priority === 'suggested') return 'hint-suggested';
  return '';
}

export const Board: FunctionalComponent<BoardProps> = ({
  gameState,
  movableTokens,
  hints,
  onTokenClick,
}) => {
  // Create a 15x15 grid
  const renderSquare = (x: number, y: number) => {
    // Check if this is a track position
    const trackIndex = TRACK_POSITIONS.findIndex(pos => pos.x === x && pos.y === y);

    // Check if this is a home stretch position
    let homeStretchInfo: { color: PlayerColor; index: number } | null = null;
    for (const color of PLAYER_COLORS) {
      const hsIndex = HOME_STRETCH_POSITIONS[color].findIndex(pos => pos.x === x && pos.y === y);
      if (hsIndex !== -1) {
        homeStretchInfo = { color, index: hsIndex };
        break;
      }
    }

    // Check if this is a home base area
    let homeBaseColor: PlayerColor | null = null;
    for (const color of PLAYER_COLORS) {
      const hbPos = HOME_BASE_POSITIONS[color];
      // Home base is a 5x5 area
      if (x >= hbPos.x && x < hbPos.x + 5 && y >= hbPos.y && y < hbPos.y + 5) {
        // Exclude the center 3x3 (which is part of track)
        const relX = x - hbPos.x;
        const relY = y - hbPos.y;
        if ((relX < 2 || relX > 2) && (relY < 2 || relY > 2)) {
          homeBaseColor = color;
        }
        break;
      }
    }

    // Check if this is finish area (center)
    const isFinish = x >= 6 && x <= 8 && y >= 6 && y <= 8;

    // Determine square class
    let squareClass = 'board-square';

    if (isFinish) {
      // Render finish area
      if (x === 7 && y === 7) {
        return (
          <div class="board-square finish" key={`${x}-${y}`}>
            {/* Finish tokens rendered here */}
            {gameState.players.map(player =>
              player.tokens
                .filter(t => t.state === 'finished')
                .map(token => (
                  <div
                    key={token.id}
                    class={`token ${token.color} finished`}
                    style={{
                      position: 'absolute',
                      width: '10px',
                      height: '10px',
                      transform: `translate(${Math.random() * 10 - 5}px, ${Math.random() * 10 - 5}px)`,
                    }}
                  />
                ))
            )}
          </div>
        );
      }
      return <div class="board-square finish" key={`${x}-${y}`} />;
    }

    if (homeBaseColor) {
      // Home base - render tokens here
      const hbPos = HOME_BASE_POSITIONS[homeBaseColor];
      const relX = x - hbPos.x;
      const relY = y - hbPos.y;

      // Only render in the 4 corners of home base (2x2 grid for 4 tokens)
      const homeSlots = [
        { x: 1, y: 1 },
        { x: 3, y: 1 },
        { x: 1, y: 3 },
        { x: 3, y: 3 },
      ];

      const slotIndex = homeSlots.findIndex(slot => slot.x === relX && slot.y === relY);

      const player = gameState.players.find(p => p.color === homeBaseColor);
      const homeTokens = player?.tokens.filter(t => t.state === 'home') || [];

      if (slotIndex !== -1 && slotIndex < homeTokens.length) {
        const token = homeTokens[slotIndex];
        const isMovable = movableTokens.includes(token.id);
        const hintClass = getHintClass(token.id, hints);

        return (
          <div
            class={`board-square ${homeBaseColor}-home`}
            key={`${x}-${y}`}
          >
            <div
              class={`token ${token.color} ${isMovable ? 'movable' : ''} ${hintClass}`}
              onClick={() => isMovable && onTokenClick(token.id)}
              role="button"
              tabIndex={isMovable ? 0 : -1}
            />
          </div>
        );
      }

      return <div class={`board-square ${homeBaseColor}-home`} key={`${x}-${y}`} />;
    }

    if (trackIndex !== -1) {
      // Main track square
      const isSafe = SAFE_SQUARES.includes(trackIndex);
      squareClass += isSafe ? ' safe' : '';

      // Find token at this position
      let tokenHere: TokenType | null = null;
      for (const player of gameState.players) {
        const found = findTokenAtPosition(player.tokens, trackIndex);
        if (found) {
          tokenHere = found;
          break;
        }
      }

      if (tokenHere) {
        const isMovable = movableTokens.includes(tokenHere.id);
        const hintClass = getHintClass(tokenHere.id, hints);

        return (
          <div class={squareClass} key={`${x}-${y}`}>
            <div
              class={`token ${tokenHere.color} ${isMovable ? 'movable' : ''} ${hintClass}`}
              onClick={() => isMovable && onTokenClick(tokenHere!.id)}
              role="button"
              tabIndex={isMovable ? 0 : -1}
            />
          </div>
        );
      }

      return <div class={squareClass} key={`${x}-${y}`} />;
    }

    if (homeStretchInfo) {
      // Home stretch square
      const { color, index } = homeStretchInfo;
      squareClass += ` ${color}-stretch`;

      // Find token at this home stretch position
      const player = gameState.players.find(p => p.color === color);
      const tokenHere = player?.tokens.find(
        t => t.state === 'active' && t.position >= 52 && (t.position - 52) === index
      );

      if (tokenHere) {
        const isMovable = movableTokens.includes(tokenHere.id);
        const hintClass = getHintClass(tokenHere.id, hints);

        return (
          <div class={squareClass} key={`${x}-${y}`}>
            <div
              class={`token ${tokenHere.color} ${isMovable ? 'movable' : ''} ${hintClass}`}
              onClick={() => isMovable && onTokenClick(tokenHere.id)}
              role="button"
              tabIndex={isMovable ? 0 : -1}
            />
          </div>
        );
      }

      return <div class={squareClass} key={`${x}-${y}`} />;
    }

    // Empty square
    return <div class="board-square empty" key={`${x}-${y}`} />;
  };

  // Render 15x15 grid
  const squares = [];
  for (let y = 0; y < 15; y++) {
    for (let x = 0; x < 15; x++) {
      squares.push(renderSquare(x, y));
    }
  }

  return (
    <div class="ludo-board">
      {squares}
    </div>
  );
};
