// Board Component

import { useMemo } from 'preact/hooks';
import type { GameState, BoardSpace, Player, Language } from '../types';
import { PlayerToken } from './PlayerToken';
import { getPropertyOwner } from '../game-logic';

interface BoardProps {
  state: GameState;
  language: Language;
  onSpaceClick: (position: number) => void;
}

// Calculate position for each space on the board
function getSpaceStyle(position: number): preact.JSX.CSSProperties {
  // Board layout: circular with 40 spaces
  // Top: 0-10, Right: 11-20, Bottom: 21-30, Left: 31-39

  const centerX = 200;
  const centerY = 200;
  const radius = 165;

  // Angle for each space (360 / 40 = 9 degrees per space)
  // Start from top (270 degrees / -90)
  const angle = ((position * 9) - 90) * (Math.PI / 180);

  const x = centerX + (radius * Math.cos(angle));
  const y = centerY + (radius * Math.sin(angle));

  return {
    position: 'absolute' as const,
    left: `${x}px`,
    top: `${y}px`,
    transform: 'translate(-50%, -50%)',
  };
}

function getSpaceColorClass(space: BoardSpace): string {
  if (space.type === 'street') {
    return space.colorGroup;
  }
  return '';
}

function getSpaceTypeClass(space: BoardSpace): string {
  if (space.type === 'start') return 'start';
  if (space.type === 'jail') return 'jail';
  if (space.type === 'gotojail') return 'gotojail';
  if (space.type === 'parking') return 'parking';
  if (space.type === 'chance') return 'chance';
  if (space.type === 'chest') return 'chest';
  if (space.type === 'tax') return 'tax';
  return '';
}

function isCorner(position: number): boolean {
  return [0, 10, 20, 30].includes(position);
}

function SpaceContent({ space, owner, ownedProps, lang }: {
  space: BoardSpace;
  owner: number | null;
  ownedProps: Player['properties'][0] | undefined;
  lang: Language;
}) {
  const name = lang === 'da' ? space.nameDa : space.name;
  let price = '';

  if (space.type === 'street' || space.type === 'railway' || space.type === 'brewery') {
    price = `${space.price} kr`;
  } else if (space.type === 'tax') {
    price = space.percentage ? `${space.amount} kr / ${space.percentage}%` : `${space.amount} kr`;
  }

  const houses = ownedProps?.houses || 0;

  return (
    <>
      <div className="space-name">{name}</div>
      {price && <div className="space-price">{price}</div>}
      {houses > 0 && (
        <div className="buildings">
          {houses < 5 ? (
            Array.from({ length: houses }).map((_, i) => (
              <div key={i} className="house" />
            ))
          ) : (
            <div className="hotel" />
          )}
        </div>
      )}
      {ownedProps?.mortgaged && (
        <div className="mortgaged-indicator">P</div>
      )}
    </>
  );
}

export function Board({ state, language, onSpaceClick }: BoardProps) {
  // Get players grouped by position for token display
  const playersByPosition = useMemo(() => {
    const map = new Map<number, Player[]>();
    state.players.forEach(player => {
      if (!player.bankrupt) {
        const existing = map.get(player.position) || [];
        existing.push(player);
        map.set(player.position, existing);
      }
    });
    return map;
  }, [state.players]);

  return (
    <div className="board">
      {state.spaces.map((space) => {
        const colorClass = getSpaceColorClass(space);
        const typeClass = getSpaceTypeClass(space);
        const cornerClass = isCorner(space.position) ? 'corner' : '';
        const owner = getPropertyOwner(state, space.position);
        const ownedProps = owner !== null
          ? state.players[owner].properties.find(p => p.property.position === space.position)
          : undefined;

        return (
          <div
            key={space.position}
            className={`board-space ${colorClass} ${typeClass} ${cornerClass}`}
            style={getSpaceStyle(space.position)}
            onClick={() => onSpaceClick(space.position)}
          >
            <SpaceContent
              space={space}
              owner={owner}
              ownedProps={ownedProps}
              lang={language}
            />
          </div>
        );
      })}

      {/* Player tokens */}
      {state.players.map((player, idx) => {
        if (player.bankrupt) return null;
        const playersOnSpace = playersByPosition.get(player.position) || [];
        const indexOnSpace = playersOnSpace.indexOf(player);

        return (
          <PlayerToken
            key={player.id}
            token={player.token}
            position={player.position}
            isCurrent={state.currentPlayer === idx}
            index={indexOnSpace}
          />
        );
      })}
    </div>
  );
}
