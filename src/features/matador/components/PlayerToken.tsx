// Player Token Component

import { useMemo } from 'preact/hooks';
import type { TokenType } from '../types';
import { TOKEN_EMOJIS } from '../constants';

interface PlayerTokenProps {
  token: TokenType;
  position: number;
  isCurrent: boolean;
  index: number; // For offset when multiple tokens on same space
}

// Calculate position on circular board
function getTokenPosition(position: number, index: number): { top: string; left: string } {
  // Board dimensions (assuming 400px container, 70px spaces)
  const centerX = 200;
  const centerY = 200;
  const radius = 150;

  // Calculate angle (start at top, go clockwise)
  const angle = ((position * 9) - 90) * (Math.PI / 180);

  // Offset for multiple tokens
  const offsetAngle = index * 15 * (Math.PI / 180);

  const x = centerX + (radius * Math.cos(angle + offsetAngle));
  const y = centerY + (radius * Math.sin(angle + offsetAngle));

  return {
    top: `${y}px`,
    left: `${x}px`,
  };
}

export function PlayerToken({ token, position, isCurrent, index }: PlayerTokenProps) {
  const emoji = TOKEN_EMOJIS[token];
  const pos = useMemo(() => getTokenPosition(position, index), [position, index]);

  return (
    <div
      className={`player-token ${isCurrent ? 'current' : ''}`}
      style={{
        top: pos.top,
        left: pos.left,
        transform: 'translate(-50%, -50%)',
      }}
      title={`${token} - Position ${position}`}
    >
      {emoji}
    </div>
  );
}
