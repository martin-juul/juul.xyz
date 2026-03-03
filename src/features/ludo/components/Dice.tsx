// Dice Component

import { h, FunctionalComponent } from 'preact';
import { useState, useEffect } from 'preact/hooks';

interface DiceProps {
  value: number;
  rolling: boolean;
  onRollComplete?: () => void;
}

const DICE_CHARS = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

export const Dice: FunctionalComponent<DiceProps> = ({ value, rolling, onRollComplete }) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    if (rolling) {
      // Animate through random values
      let count = 0;
      const interval = setInterval(() => {
        setDisplayValue(Math.floor(Math.random() * 6) + 1);
        count++;
        if (count >= 6) {
          clearInterval(interval);
          setDisplayValue(value);
          onRollComplete?.();
        }
      }, 50);

      return () => clearInterval(interval);
    } else {
      setDisplayValue(value);
    }
  }, [rolling, value]);

  return (
    <div class={`dice ${rolling ? 'rolling' : ''}`}>
      <span class="dice-value">{DICE_CHARS[displayValue - 1]}</span>
    </div>
  );
};
