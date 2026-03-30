import { GameData } from '../types';

interface GameBoardProps {
  gameData: GameData;
}

// Get monster sprite based on type
function getMonsterSprite(type: string): string {
  const sprites: Record<string, string> = {
    monster_bug: '🐛',
    monster_fireball: '🔥',
    monster_ball: '⚽',
    monster_ghost: '👻',
    monster_tank: '🛡️',
  };
  return sprites[type] || '👾';
}

export function GameBoard({
  gameData,
}: GameBoardProps) {
  return (
    <div
      class="chips-grid"
      style={{
        gridTemplateColumns: `repeat(${gameData.grid[0]?.length || 20}, 24px)`,
      }}
    >
      {gameData.grid.map((row, y) =>
        row.map((tile, x) => {
          const isPlayer = gameData.playerPosition.x === x && gameData.playerPosition.y === y;
          const monster = gameData.monsters?.find(m => m.position.x === x && m.position.y === y);
          return (
            <div
              key={`${x}-${y}`}
              class={`chips-tile chips-tile-${tile} ${isPlayer ? 'chips-player' : ''}`}
              data-x={x}
              data-y={y}
            >
              {isPlayer && <div class="chips-player-sprite">🤖</div>}
              {monster && !isPlayer && <div class={`chips-monster chips-monster-${monster.type}`}>{getMonsterSprite(monster.type)}</div>}
              {tile === 'chip' && !isPlayer && !monster && <div class="chips-chip">💎</div>}
              {tile === 'key_red' && !monster && <div class="chips-key">🔑</div>}
              {tile === 'key_blue' && !monster && <div class="chips-key">🔑</div>}
              {tile === 'key_green' && !monster && <div class="chips-key">🔑</div>}
              {tile === 'key_yellow' && !monster && <div class="chips-key">🔑</div>}
              {tile === 'door_red' && <div class="chips-door">🚪</div>}
              {tile === 'door_blue' && <div class="chips-door">🚪</div>}
              {tile === 'door_green' && <div class="chips-door">🚪</div>}
              {tile === 'door_yellow' && <div class="chips-door">🚪</div>}
              {tile === 'exit' && <div class="chips-exit">🚪</div>}
              {tile === 'boots_ice' && <div class="chips-boots">🥾</div>}
              {tile === 'boots_water' && <div class="chips-boots">🥾</div>}
              {tile === 'boots_fire' && <div class="chips-boots">🥾</div>}
            </div>
          );
        })
      )}
    </div>
  );
}
