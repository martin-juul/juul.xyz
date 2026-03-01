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

// Calculate wedge style for each space on the circular board
function getWedgeStyle(position: number, _isCorner: boolean): preact.JSX.CSSProperties {
  // 40 spaces, each spanning 9 degrees (360/40)
  // Position 0 is at the top
  const degreesPerSpace = 9;
  const rotationAngle = position * degreesPerSpace;

  // Wedge dimensions
  const outerRadius = 196; // Almost to edge of 400px board
  const innerRadius = 80; // Inner edge of the ring
  const halfWedge = 4.4; // Half of wedge angle in degrees (slightly less than 4.5 to have small gaps)

  // Convert to radians
  const halfWedgeRad = halfWedge * (Math.PI / 180);

  // Calculate clip path points for a wedge pointing UP (before rotation)
  // The wedge is centered on the vertical axis, so we calculate points
  // for a wedge that goes from the center toward the top of the board
  const centerX = 200;
  const centerY = 200;

  // For a wedge pointing up (toward -Y), at the top of the board:
  // - Outer edge is at y = centerY - outerRadius (near top of board)
  // - Inner edge is at y = centerY - innerRadius (closer to center)
  // - Left side angles off to the left
  // - Right side angles off to the right

  const points = [
    // Outer-left point
    { x: centerX - outerRadius * Math.sin(halfWedgeRad), y: centerY - outerRadius * Math.cos(halfWedgeRad) },
    // Outer-right point
    { x: centerX + outerRadius * Math.sin(halfWedgeRad), y: centerY - outerRadius * Math.cos(halfWedgeRad) },
    // Inner-right point
    { x: centerX + innerRadius * Math.sin(halfWedgeRad), y: centerY - innerRadius * Math.cos(halfWedgeRad) },
    // Inner-left point
    { x: centerX - innerRadius * Math.sin(halfWedgeRad), y: centerY - innerRadius * Math.cos(halfWedgeRad) },
  ];

  const clipPath = `polygon(${points.map(p => `${p.x}px ${p.y}px`).join(', ')})`;

  return {
    clipPath,
    transform: `rotate(${rotationAngle}deg)`,
    transformOrigin: `${centerX}px ${centerY}px`,
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
        const isCornerSpace = isCorner(space.position);
        const cornerClass = isCornerSpace ? 'corner' : '';
        const owner = getPropertyOwner(state, space.position);
        const ownedProps = owner !== null
          ? state.players[owner].properties.find(p => p.property.position === space.position)
          : undefined;

        return (
          <div
            key={space.position}
            className={`board-space ${colorClass} ${typeClass} ${cornerClass}`}
            style={getWedgeStyle(space.position, isCornerSpace)}
            onClick={() => onSpaceClick(space.position)}
          >
            <div className="wedge-content">
              <SpaceContent
                space={space}
                owner={owner}
                ownedProps={ownedProps}
                lang={language}
              />
            </div>
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
