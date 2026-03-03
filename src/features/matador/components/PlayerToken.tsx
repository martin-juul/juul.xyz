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

// Calculate position on circular board with wedge layout (percentage-based)
function getTokenPosition(position: number, index: number): { top: string; left: string } {
  // Board center is 50%, 50%
  const centerX = 50;
  const centerY = 50;
  // Tokens should be in the middle of the wedge ring (between 20% and 49%)
  const radius = 35; // Middle of the wedge ring

  // Calculate angle (each space is 9 degrees)
  // Position 0 is at top, wedges start at 0 degrees rotation (pointing up)
  const baseAngle = position * 9;
  const angle = (baseAngle - 90) * (Math.PI / 180); // -90 to start at top

  // Small offset for multiple tokens on same space
  const offsetRadius = index * 2.5;
  const offsetAngle = index * 2 * (Math.PI / 180);

  const x = centerX + ((radius + offsetRadius) * Math.cos(angle + offsetAngle));
  const y = centerY + ((radius + offsetRadius) * Math.sin(angle + offsetAngle));

  return {
    top: `${y}%`,
    left: `${x}%`,
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
