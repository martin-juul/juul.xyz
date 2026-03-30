import { useState, useCallback, useEffect, useRef } from 'preact/hooks';
import { useLanguage } from '../../context/language-context';
import { useStatus } from '../../context/status-context';
import { createInitialGame, getLevel, LEVELS } from './game-logic';
import { TileType, type Level, type Position } from './types';
import './chips.css';
import './editor.css';

// Tile palette configuration
const TILE_PALETTE = [
  { type: TileType.WALL, label: 'Wall', icon: '' },
  { type: TileType.FLOOR, label: 'Floor', icon: '' },
  { type: TileType.CHIP, label: 'Chip', icon: '💎' },
  { type: TileType.EXIT, label: 'Exit', icon: '🚪' },
  { type: TileType.KEY_RED, label: 'Red Key', icon: '🔑' },
  { type: TileType.DOOR_RED, label: 'Red Door', icon: '' },
  { type: TileType.KEY_BLUE, label: 'Blue Key', icon: '🔑' },
  { type: TileType.DOOR_BLUE, label: 'Blue Door', icon: '' },
  { type: TileType.KEY_GREEN, label: 'Green Key', icon: '🔑' },
  { type: TileType.DOOR_GREEN, label: 'Green Door', icon: '' },
  { type: TileType.KEY_YELLOW, label: 'Yellow Key', icon: '🔑' },
  { type: TileType.DOOR_YELLOW, label: 'Yellow Door', icon: '' },
  { type: TileType.ICE, label: 'Ice', icon: '' },
  { type: TileType.WATER, label: 'Water', icon: '' },
  { type: TileType.FIRE, label: 'Fire', icon: '' },
  { type: TileType.BOOTS_ICE, label: 'Ice Boots', icon: '🥾' },
  { type: TileType.BOOTS_WATER, label: 'Water Boots', icon: '🥾' },
  { type: TileType.BOOTS_FIRE, label: 'Fire Boots', icon: '🥾' },
  { type: TileType.DIRT, label: 'Dirt', icon: '' },
  { type: TileType.EMPTY, label: 'Empty', icon: '' },
  { type: TileType.GRAVEL, label: 'Gravel', icon: '' },
];

// Default editor grid
const DEFAULT_GRID_SIZE = { width: 20, height: 15 };
const createEmptyGrid = (width: number, height: number): TileType[][] => {
  return Array(height).fill(null).map(() =>
    Array(width).fill(TileType.FLOOR)
  );
};

type EditorProps = {
  onClose: () => void;
  onLoadLevel?: (level: Level) => void;
};

export function LevelEditor({ onClose, onLoadLevel }: EditorProps) {
  const { t } = useLanguage();
  const { setStatusText } = useStatus();
  const txt = t.chips;

  const [grid, setGrid] = useState<TileType[][]>(createEmptyGrid(DEFAULT_GRID_SIZE.width, DEFAULT_GRID_SIZE.height));
  const [selectedTile, setSelectedTile] = useState<TileType>(TileType.WALL);
  const [playerStart, setPlayerStart] = useState<Position>({ x: 1, y: 1 });
  const [isPlacingPlayer, setIsPlacingPlayer] = useState(false);
  const [levelName, setLevelName] = useState('Custom Level');
  const [chipsRequired, setChipsRequired] = useState(5);
  const [hint, setHint] = useState('');
  const [showTest, setShowTest] = useState(false);
  const [savedLevels, setSavedLevels] = useState<Level[]>([]);
  const [exportString, setExportString] = useState('');
  const [importString, setImportString] = useState('');
  const [gridSize, setGridSize] = useState(DEFAULT_GRID_SIZE);
  const isMouseDown = useRef(false);

  // Load saved levels on mount
  useEffect(() => {
    loadCustomLevels();
  }, []);

  // Load custom levels from localStorage
  const loadCustomLevels = useCallback(() => {
    try {
      const saved = localStorage.getItem('chips_custom_levels');
      if (saved) {
        const levels = JSON.parse(saved) as Level[];
        setSavedLevels(levels);
      }
    } catch {
      // Ignore errors
    }
  }, []);

  // Save level to localStorage
  const saveCustomLevel = useCallback(() => {
    const newLevel: Level = {
      number: LEVELS.length + savedLevels.length + 1,
      name: levelName,
      grid: grid.map(row => [...row]),
      playerStart: { ...playerStart },
      chipsRequired,
      hint: hint || undefined,
    };

    try {
      const updatedLevels = [...savedLevels, newLevel];
      localStorage.setItem('chips_custom_levels', JSON.stringify(updatedLevels));
      setSavedLevels(updatedLevels);
      setStatusText('Level saved!');
    } catch {
      setStatusText('Failed to save level!');
    }
  }, [grid, playerStart, levelName, chipsRequired, hint, savedLevels, setStatusText]);

  // Export level as string
  const exportLevel = useCallback(() => {
    const levelData = {
      name: levelName,
      grid: grid.map(row => row.map(tile => tile.toString())),
      playerStart,
      chipsRequired,
      hint,
    };
    const encoded = btoa(JSON.stringify(levelData));
    setExportString(encoded);
    setStatusText('Level exported! Copy the string below.');
  }, [grid, playerStart, levelName, chipsRequired, hint, setStatusText]);

  // Import level from string
  const importLevel = useCallback(() => {
    try {
      const decoded = atob(importString);
      const levelData = JSON.parse(decoded);
      setLevelName(levelData.name || 'Imported Level');
      setGrid(levelData.grid.map((row: string[]) => row.map((tile: string) => tile as TileType)));
      setPlayerStart(levelData.playerStart);
      setChipsRequired(levelData.chipsRequired || 0);
      setHint(levelData.hint || '');
      setGridSize({ width: levelData.grid[0]?.length || 20, height: levelData.grid.length || 15 });
      setStatusText('Level imported successfully!');
    } catch {
      setStatusText('Failed to import level!');
    }
  }, [importString, setStatusText]);

  // Load a saved level for editing
  const loadLevelForEdit = useCallback((level: Level) => {
    setLevelName(level.name);
    setGrid(level.grid.map(row => [...row]));
    setPlayerStart({ ...level.playerStart });
    setChipsRequired(level.chipsRequired);
    setHint(level.hint || '');
    setGridSize({ width: level.grid[0]?.length || 20, height: level.grid.length || 15 });
  }, []);

  // Resize grid
  const resizeGrid = useCallback((newWidth: number, newHeight: number) => {
    const newGrid = createEmptyGrid(newWidth, newHeight);
    // Copy existing grid content
    for (let y = 0; y < Math.min(grid.length, newHeight); y++) {
      for (let x = 0; x < Math.min(grid[0]?.length || 0, newWidth); x++) {
        newGrid[y][x] = grid[y][x];
      }
    }
    setGrid(newGrid);
    setGridSize({ width: newWidth, height: newHeight });
  }, [grid]);

  // Handle tile placement
  const handleTileClick = useCallback((x: number, y: number) => {
    if (isPlacingPlayer) {
      setPlayerStart({ x, y });
      setIsPlacingPlayer(false);
    } else {
      setGrid(prev => {
        const newGrid = prev.map(row => [...row]);
        newGrid[y][x] = selectedTile;
        return newGrid;
      });
    }
  }, [selectedTile, isPlacingPlayer]);

  // Handle mouse drag for painting
  const handleTileEnter = useCallback((x: number, y: number) => {
    if (isMouseDown.current && !isPlacingPlayer) {
      setGrid(prev => {
        const newGrid = prev.map(row => [...row]);
        newGrid[y][x] = selectedTile;
        return newGrid;
      });
    }
  }, [selectedTile, isPlacingPlayer]);

  // Count chips in grid
  const chipCount = grid.flat().filter(tile => tile === TileType.CHIP).length;
  const hasExit = grid.flat().some(tile => tile === TileType.EXIT);

  // Validate level
  const isValidLevel = chipCount >= chipsRequired && hasExit;

  // Test play the level
  const testLevel = useCallback(() => {
    const testLevelData: Level = {
      number: 999,
      name: levelName,
      grid: grid.map(row => [...row]),
      playerStart: { ...playerStart },
      chipsRequired,
      hint: hint || undefined,
    };
    if (onLoadLevel) {
      onLoadLevel(testLevelData);
    }
    onClose();
  }, [grid, playerStart, levelName, chipsRequired, hint, onLoadLevel, onClose]);

  if (showTest) {
    return (
      <div class="chips-editor-test">
        <div class="chips-editor-test-header">
          <h2>Testing: {levelName}</h2>
          <button onClick={() => setShowTest(false)}>Back to Editor</button>
        </div>
        {/* Test game would be rendered here */}
        <p>Test mode coming soon!</p>
      </div>
    );
  }

  return (
    <div class="chips-editor">
      <div class="chips-editor-header">
        <h2>Level Editor</h2>
        <div class="chips-editor-actions">
          <button onClick={onClose}>Close</button>
          <button onClick={() => setShowTest(true)} disabled={!isValidLevel}>
            Test Play
          </button>
          <button onClick={saveCustomLevel} disabled={!isValidLevel}>
            Save
          </button>
          <button onClick={exportLevel}>Export</button>
        </div>
      </div>

      <div class="chips-editor-content">
        {/* Tile Palette */}
        <div class="chips-palette">
          <h3>Tile Palette</h3>
          <div class="chips-palette-grid">
            {TILE_PALETTE.map(tile => (
              <button
                key={tile.type}
                class={`chips-palette-tile chips-tile chips-tile-${tile.type} ${selectedTile === tile.type ? 'selected' : ''}`}
                onClick={() => setSelectedTile(tile.type)}
                title={tile.label}
              >
                <span class="chips-palette-tile-visual">
                  {tile.icon && <span class="tile-icon">{tile.icon}</span>}
                </span>
                <span class="chips-palette-tile-label">{tile.label}</span>
              </button>
            ))}
            <button
              class={`chips-palette-tile ${isPlacingPlayer ? 'selected' : ''}`}
              onClick={() => setIsPlacingPlayer(!isPlacingPlayer)}
              title="Place Player Start"
            >
              <span class="chips-palette-tile-visual">🤖</span>
              <span class="chips-palette-tile-label">Player</span>
            </button>
          </div>

          {/* Grid Size */}
          <div class="chips-grid-size">
            <h4>Grid Size</h4>
            <div>
              <label>Width:</label>
              <input
                type="number"
                min="10"
                max="50"
                value={gridSize.width}
                onChange={(e) => resizeGrid(parseInt((e.target as HTMLInputElement).value), gridSize.height)}
              />
            </div>
            <div>
              <label>Height:</label>
              <input
                type="number"
                min="10"
                max="50"
                value={gridSize.height}
                onChange={(e) => resizeGrid(gridSize.width, parseInt((e.target as HTMLInputElement).value))}
              />
            </div>
          </div>

          {/* Saved Levels */}
          <div class="chips-saved-levels">
            <h4>Saved Levels</h4>
            {savedLevels.length === 0 ? (
              <p>No saved levels</p>
            ) : (
              <select
                onChange={(e) => {
                  const index = parseInt((e.target as HTMLSelectElement).value);
                  if (index >= 0) {
                    loadLevelForEdit(savedLevels[index]);
                  }
                }}
              >
                <option value="">Select a level...</option>
                {savedLevels.map((level, index) => (
                  <option key={index} value={index}>
                    {level.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Grid Editor */}
        <div class="chips-editor-grid-container">
          <div
            class="chips-editor-grid"
            style={{
              gridTemplateColumns: `repeat(${grid[0]?.length || 20}, 24px)`,
            }}
          >
            {grid.map((row, y) =>
              row.map((tile, x) => {
                const isPlayerStart = playerStart.x === x && playerStart.y === y;
                return (
                  <div
                    key={`${x}-${y}`}
                    class={`chips-editor-tile chips-tile-${tile} ${isPlayerStart ? 'player-start' : ''}`}
                    onMouseDown={() => {
                      isMouseDown.current = true;
                      handleTileClick(x, y);
                    }}
                    onMouseEnter={() => handleTileEnter(x, y)}
                    onMouseUp={() => isMouseDown.current = false}
                  >
                    {isPlayerStart && <span class="player-start-indicator">🤖</span>}
                    {tile === TileType.CHIP && <span class="tile-icon">💎</span>}
                    {tile === TileType.KEY_RED && <span class="tile-icon">🔑</span>}
                    {tile === TileType.KEY_BLUE && <span class="tile-icon">🔑</span>}
                    {tile === TileType.KEY_GREEN && <span class="tile-icon">🔑</span>}
                    {tile === TileType.KEY_YELLOW && <span class="tile-icon">🔑</span>}
                    {tile === TileType.EXIT && <span class="tile-icon">🚪</span>}
                    {tile === TileType.BOOTS_ICE && <span class="tile-icon">🥾</span>}
                    {tile === TileType.BOOTS_WATER && <span class="tile-icon">🥾</span>}
                    {tile === TileType.BOOTS_FIRE && <span class="tile-icon">🥾</span>}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Level Properties */}
        <div class="chips-level-properties">
          <h3>Level Properties</h3>

          <div class="chips-property">
            <label>Level Name:</label>
            <input
              type="text"
              value={levelName}
              onInput={(e) => setLevelName((e.target as HTMLInputElement).value)}
            />
          </div>

          <div class="chips-property">
            <label>Chips Required:</label>
            <input
              type="number"
              min="0"
              max={chipCount}
              value={chipsRequired}
              onChange={(e) => setChipsRequired(parseInt((e.target as HTMLInputElement).value))}
            />
            <span class="chips-property-hint">/ {chipCount} chips on board</span>
          </div>

          <div class="chips-property">
            <label>Hint (optional):</label>
            <input
              type="text"
              value={hint}
              onInput={(e) => setHint((e.target as HTMLInputElement).value)}
              placeholder="Level hint..."
            />
          </div>

          <div class="chips-validation">
            {!hasExit && <p class="error">⚠️ No exit tile!</p>}
            {chipCount < chipsRequired && <p class="error">⚠️ Not enough chips!</p>}
            {isValidLevel && <p class="success">✓ Level is valid!</p>}
          </div>

          {/* Import/Export */}
          <div class="chips-import-export">
            <h4>Import Level</h4>
            <textarea
              placeholder="Paste level export string..."
              value={importString}
              onInput={(e) => setImportString((e.target as HTMLTextAreaElement).value)}
            />
            <button onClick={importLevel}>Import</button>

            {exportString && (
              <>
                <h4>Exported Level</h4>
                <textarea
                  readOnly
                  value={exportString}
                  onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                />
                <button onClick={() => {
                  navigator.clipboard.writeText(exportString);
                  setStatusText('Copied to clipboard!');
                }}>
                  Copy to Clipboard
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
