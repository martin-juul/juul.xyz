// Token Component

import { h, FunctionalComponent } from 'preact';
import type { Token as TokenType, PlayerColor } from '../types';

interface TokenProps {
  token: TokenType;
  isMovable: boolean;
  hintPriority?: 'recommended' | 'suggested' | 'possible' | null;
  onClick?: () => void;
}

export const Token: FunctionalComponent<TokenProps> = ({
  token,
  isMovable,
  hintPriority,
  onClick,
}) => {
  const hintClass = hintPriority === 'recommended' ? 'hint-recommended' :
                    hintPriority === 'suggested' ? 'hint-suggested' : '';

  return (
    <div
      class={`token ${token.color} ${isMovable ? 'movable' : ''} ${hintClass}`}
      onClick={isMovable ? onClick : undefined}
      role="button"
      tabIndex={isMovable ? 0 : -1}
      aria-label={`${token.color} token`}
    />
  );
};
