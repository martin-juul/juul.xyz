// Dice Component

import { useMemo } from 'preact/hooks';

interface DiceProps {
  dice: [number, number];
  rolling: boolean;
  isDoubles: boolean;
}

const DICE_CHARS = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

export function Dice({ dice, rolling, isDoubles }: DiceProps) {
  const die1 = useMemo(() => DICE_CHARS[dice[0]] || '⚀', [dice]);
  const die2 = useMemo(() => DICE_CHARS[dice[1]] || '⚀', [dice]);

  return (
    <div className="dice-container">
      <div className={`die ${rolling ? 'rolling' : ''}`}>
        {die1}
      </div>
      <div className={`die ${rolling ? 'rolling' : ''}`}>
        {die2}
      </div>
      {isDoubles && !rolling && (
        <div className="doubles-indicator">⭐</div>
      )}
    </div>
  );
}
