import { useState, useEffect, useMemo, useRef, useCallback } from 'preact/hooks';
import { useLanguage } from '../../context/language-context';
import { taskManagerTranslations } from './translations';
import { type Page } from '../../shared/types';

type WindowData = {
  id: string;
  page: Page;
  state: 'normal' | 'minimized' | 'maximized';
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  isOpening: boolean;
};

type TaskManagerProps = {
  windows?: WindowData[];
  onCloseWindow: (id: string) => void;
  onFocusWindow: (id: string) => void;
  isMusicPlayerOpen?: boolean;
};

type Process = {
  imageName: string;
  pid: number;
  cpu: number;
  memUsage: number;
  page: Page | 'system';
};

// Map pages to executable names
const pageToExe: Record<Page | 'music' | 'taskmanager', string> = {
  home: 'home.exe',
  projects: 'projects.exe',
  resume: 'resume.exe',
  contact: 'outlook.exe',
  browser: 'iexplore.exe',
  music: 'winamp.exe',
  taskmanager: 'taskmgr.exe',
  minesweeper: 'winmine.exe',
  freecell: 'freecell.exe',
  gallery: 'shimgvw.exe',
  notfound: 'explorer.exe',
};

// Base memory values for processes (in KB)
const processBaseMemory: Record<string, number> = {
  'home.exe': 1248,
  'projects.exe': 1876,
  'resume.exe': 1432,
  'outlook.exe': 2344,
  'iexplore.exe': 4892,
  'winamp.exe': 3844,
  'taskmgr.exe': 2192,
  'freecell.exe': 2100,
  'shimgvw.exe': 2844,
  'explorer.exe': 1624,
  'System': 424,
};

// Get page display name
function getPageDisplayName(page: Page | 'music' | 'taskmanager'): string {
  switch (page) {
    case 'home': return 'Home';
    case 'projects': return 'Projects';
    case 'resume': return 'Resume';
    case 'contact': return 'Outlook Express';
    case 'browser': return 'Internet Explorer';
    case 'music': return 'Winamp';
    case 'taskmanager': return 'Task Manager';
    case 'minesweeper': return 'Minesweeper';
    case 'freecell': return 'FreeCell';
    case 'gallery': return 'Image Gallery';
    case 'notfound': return 'Explorer';
    default: return page;
  }
}

// Format number with commas
function formatNumber(num: number): string {
  return num.toLocaleString();
}

export function TaskManager({ windows = [], onCloseWindow, onFocusWindow, isMusicPlayerOpen = false }: TaskManagerProps) {
  const { language } = useLanguage();
  const t = taskManagerTranslations[language] || taskManagerTranslations.en;

  const [activeTab, setActiveTab] = useState<'applications' | 'processes' | 'performance'>('applications');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedProcessPid, setSelectedProcessPid] = useState<number | null>(null);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [cpuUsage, setCpuUsage] = useState(5);
  const [memoryUsage, setMemoryUsage] = useState(35);

  // Track previous window count to detect new windows
  const prevWindowCountRef = useRef(0);
  // Stable memory values that only grow
  const processMemoryRef = useRef<Map<string, number>>(new Map());
  // CPU spike tracker
  const cpuSpikeRef = useRef(0);

  // Only recompute when window IDs or pages change (not positions)
  const windowSignature = useMemo(() => {
    return windows.map(w => `${w.id}:${w.page}`).sort().join('|');
  }, [windows]);

  const openWindowCount = windows.length + (isMusicPlayerOpen ? 1 : 0);

  // Generate process list with realistic memory behavior
  useEffect(() => {
    const windowCountChanged = openWindowCount !== prevWindowCountRef.current;
    const newWindowOpened = openWindowCount > prevWindowCountRef.current;
    prevWindowCountRef.current = openWindowCount;

    // If new window opened, allocate memory for it
    if (newWindowOpened) {
      windows.forEach(w => {
        const key = `${w.id}-${w.page}`;
        if (!processMemoryRef.current.has(key)) {
          const exeName = pageToExe[w.page] || 'unknown.exe';
          const base = processBaseMemory[exeName] || 1000;
          // New windows start at base memory
          processMemoryRef.current.set(key, base);
        }
      });

      if (isMusicPlayerOpen && !processMemoryRef.current.has('music-player')) {
        processMemoryRef.current.set('music-player', processBaseMemory['winamp.exe']);
      }
    }

    // Initialize system processes
    if (!processMemoryRef.current.has('System')) {
      processMemoryRef.current.set('System', processBaseMemory['System']);
    }
    if (!processMemoryRef.current.has('explorer.exe')) {
      processMemoryRef.current.set('explorer.exe', processBaseMemory['explorer.exe']);
    }
    if (!processMemoryRef.current.has('taskmgr.exe')) {
      processMemoryRef.current.set('taskmgr.exe', processBaseMemory['taskmgr.exe']);
    }
    if (isMusicPlayerOpen && !processMemoryRef.current.has('music-player')) {
      processMemoryRef.current.set('music-player', processBaseMemory['winamp.exe']);
    }

    // Clean up closed windows
    const validKeys = new Set(['System', 'explorer.exe', 'taskmgr.exe', 'music-player']);
    windows.forEach(w => validKeys.add(`${w.id}-${w.page}`));
    processMemoryRef.current.forEach((_, key) => {
      if (!validKeys.has(key)) {
        processMemoryRef.current.delete(key);
      }
    });

    // Build process list
    const procs: Process[] = [];
    let pid = 1000;

    // System
    procs.push({
      imageName: 'System',
      pid: pid++,
      cpu: Math.random() < 0.1 ? 1 : 0, // Mostly 0, occasionally 1%
      memUsage: processMemoryRef.current.get('System')!,
      page: 'system',
    });

    // Explorer
    procs.push({
      imageName: 'explorer.exe',
      pid: pid++,
      cpu: Math.random() < 0.15 ? 1 : 0,
      memUsage: processMemoryRef.current.get('explorer.exe')!,
      page: 'system',
    });

    // Window processes
    windows.forEach(window => {
      const key = `${window.id}-${window.page}`;
      const exeName = pageToExe[window.page] || 'unknown.exe';

      // CPU: mostly idle, occasional spikes
      let cpu = 0;
      if (window.state !== 'minimized') {
        cpu = Math.random() < 0.2 ? Math.floor(Math.random() * 3) : 0;
      }

      procs.push({
        imageName: exeName,
        pid: pid++,
        cpu,
        memUsage: processMemoryRef.current.get(key) || processBaseMemory[exeName] || 1000,
        page: window.page,
      });
    });

    // Music player
    if (isMusicPlayerOpen) {
      procs.push({
        imageName: pageToExe['music'],
        pid: pid++,
        cpu: Math.random() < 0.3 ? Math.floor(Math.random() * 2) + 1 : 1,
        memUsage: processMemoryRef.current.get('music-player')!,
        page: 'music',
      });
    }

    // Task manager
    procs.push({
      imageName: pageToExe['taskmanager'],
      pid: pid++,
      cpu: Math.random() < 0.1 ? 1 : 0,
      memUsage: processMemoryRef.current.get('taskmgr.exe')!,
      page: 'taskmanager',
    });

    setProcesses(procs);

    // Calculate total memory from processes
    const totalMem = procs.reduce((sum, p) => sum + p.memUsage, 0);
    const totalCpu = procs.reduce((sum, p) => sum + p.cpu, 0);

    // CPU usage: base from processes + occasional spike
    if (cpuSpikeRef.current > 0) {
      cpuSpikeRef.current -= 2; // Decay spike
    }
    if (windowCountChanged) {
      cpuSpikeRef.current = Math.min(cpuSpikeRef.current + 15, 30);
    }
    // Random small activity
    if (Math.random() < 0.1) {
      cpuSpikeRef.current = Math.min(cpuSpikeRef.current + 5, 20);
    }

    setCpuUsage(Math.max(totalCpu, cpuSpikeRef.current) + Math.floor(Math.random() * 3));
    setMemoryUsage(Math.min(85, 30 + Math.floor(totalMem / 3000)));

  }, [windowSignature, isMusicPlayerOpen, openWindowCount, windows]);

  // Occasional small memory growth (simulates memory fragmentation/usage)
  useEffect(() => {
    const interval = setInterval(() => {
      // Small chance of memory growing
      if (Math.random() < 0.3) {
        const keys = Array.from(processMemoryRef.current.keys());
        if (keys.length > 0) {
          const randomKey = keys[Math.floor(Math.random() * keys.length)];
          const current = processMemoryRef.current.get(randomKey) || 0;
          // Grow by 4-16 KB
          processMemoryRef.current.set(randomKey, current + Math.floor(Math.random() * 12) + 4);
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Tasks for Applications tab (open windows only)
  const tasks = useMemo(() => {
    const taskList: { id: string; name: string; status: string; page: Page }[] = [];

    windows.forEach(window => {
      taskList.push({
        id: window.id,
        name: getPageDisplayName(window.page),
        status: t.statusRunning,
        page: window.page,
      });
    });

    if (isMusicPlayerOpen) {
      taskList.push({
        id: 'music-player',
        name: 'Winamp',
        status: t.statusRunning,
        page: 'music',
      });
    }

    return taskList;
  }, [windows, isMusicPlayerOpen, t.statusRunning]);

  // Handle End Task
  const handleEndTask = useCallback(() => {
    if (selectedTaskId) {
      if (selectedTaskId === 'music-player') {
        // Can't close music player from task manager - it's handled differently
        return;
      }
      onCloseWindow(selectedTaskId);
      setSelectedTaskId(null);
    }
  }, [selectedTaskId, onCloseWindow]);

  // Handle Switch To
  const handleSwitchTo = useCallback(() => {
    if (selectedTaskId) {
      if (selectedTaskId === 'music-player') {
        // Focus music player - this is handled separately
        return;
      }
      onFocusWindow(selectedTaskId);
    }
  }, [selectedTaskId, onFocusWindow]);

  // Calculate totals
  const totalProcesses = processes.length;
  const totalMemUsage = processes.reduce((sum, p) => sum + p.memUsage, 0);

  // Performance bar component
  const PerformanceBar = ({ value, color }: { value: number; color: string }) => {
    return (
      <div class="perf-bar">
        <div class="perf-bar-inner" style={{ width: `${value}%` }}>
          <div class={`perf-bar-fill perf-bar-${color}`}></div>
        </div>
        <span class="perf-bar-text">{value}%</span>
      </div>
    );
  };

  return (
    <div class="task-manager">
      {/* Menu Bar */}
      <div class="taskmgr-menu-bar">
        <span class="taskmgr-menu-item">{t.menuFile}</span>
        <span class="taskmgr-menu-item">{t.menuOptions}</span>
        <span class="taskmgr-menu-item">{t.menuView}</span>
        <span class="taskmgr-menu-item">{t.menuHelp}</span>
      </div>

      {/* Tab Bar */}
      <div class="taskmgr-tabs">
        <button
          class={`taskmgr-tab ${activeTab === 'applications' ? 'active' : ''}`}
          onClick={() => setActiveTab('applications')}
        >
          {t.tabApplications}
        </button>
        <button
          class={`taskmgr-tab ${activeTab === 'processes' ? 'active' : ''}`}
          onClick={() => setActiveTab('processes')}
        >
          {t.tabProcesses}
        </button>
        <button
          class={`taskmgr-tab ${activeTab === 'performance' ? 'active' : ''}`}
          onClick={() => setActiveTab('performance')}
        >
          {t.tabPerformance}
        </button>
      </div>

      {/* Content Area */}
      <div class="taskmgr-content">
        {activeTab === 'applications' && (
          <>
            <div class="taskmgr-list">
              <table class="taskmgr-table">
                <thead>
                  <tr>
                    <th>{t.taskColumn}</th>
                    <th>{t.statusColumn}</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.length === 0 ? (
                    <tr>
                      <td colSpan={2} style={{ textAlign: 'center', color: '#808080' }}>
                        No tasks running
                      </td>
                    </tr>
                  ) : (
                    tasks.map(task => (
                      <tr
                        key={task.id}
                        class={selectedTaskId === task.id ? 'selected' : ''}
                        onClick={() => setSelectedTaskId(task.id)}
                      >
                        <td>{task.name}</td>
                        <td>{task.status}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div class="taskmgr-buttons">
              <button
                onClick={handleEndTask}
                disabled={!selectedTaskId}
              >
                {t.endTask}
              </button>
              <button
                onClick={handleSwitchTo}
                disabled={!selectedTaskId}
              >
                {t.switchTo}
              </button>
              <button disabled>
                {t.newTask}
              </button>
            </div>
          </>
        )}

        {activeTab === 'processes' && (
          <div class="taskmgr-list taskmgr-list-full">
            <table class="taskmgr-table">
              <thead>
                <tr>
                  <th>{t.imageNameColumn}</th>
                  <th class="taskmgr-num">{t.pidColumn}</th>
                  <th class="taskmgr-num">{t.cpuColumn}</th>
                  <th class="taskmgr-num">{t.memUsageColumn}</th>
                </tr>
              </thead>
              <tbody>
                {processes.map(proc => (
                  <tr
                    key={proc.pid}
                    class={selectedProcessPid === proc.pid ? 'selected' : ''}
                    onClick={() => setSelectedProcessPid(proc.pid)}
                    onDblClick={() => {
                      if (proc.page !== 'system' && proc.page !== 'taskmanager') {
                        // Could switch to window
                      }
                    }}
                  >
                    <td>{proc.imageName}</td>
                    <td class="taskmgr-num">{proc.pid}</td>
                    <td class="taskmgr-num">{proc.cpu.toFixed(0)}%</td>
                    <td class="taskmgr-num">{formatNumber(proc.memUsage)} K</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'performance' && (
          <div class="taskmgr-performance">
            <div class="perf-section">
              <div class="perf-title">{t.cpuUsage}</div>
              <PerformanceBar value={cpuUsage} color="green" />
              <div class="perf-stats">
                <div class="perf-stat-line">
                  <span>{t.processes}:</span>
                  <span>{totalProcesses}</span>
                </div>
              </div>
            </div>

            <div class="perf-section">
              <div class="perf-title">{t.memUsage}</div>
              <PerformanceBar value={memoryUsage} color="blue" />
            </div>

            <div class="perf-sections-row">
              <div class="perf-section-box">
                <div class="perf-box-title">{t.physicalMemory}</div>
                <div class="perf-box-content">
                  <div class="perf-stat-line">
                    <span>{t.totaMemoryl}:</span>
                    <span>261,616 K</span>
                  </div>
                  <div class="perf-stat-line">
                    <span>{t.availableMemory}:</span>
                    <span>{formatNumber(261616 - totalMemUsage)} K</span>
                  </div>
                  <div class="perf-stat-line">
                    <span>{t.systemCache}:</span>
                    <span>74,844 K</span>
                  </div>
                </div>
              </div>

              <div class="perf-section-box">
                <div class="perf-box-title">{t.commitCharge}</div>
                <div class="perf-box-content">
                  <div class="perf-stat-line">
                    <span>{t.commitChargeTotal}:</span>
                    <span>{formatNumber(totalMemUsage + 50000)} K</span>
                  </div>
                  <div class="perf-stat-line">
                    <span>{t.commitChargeLimit}:</span>
                    <span>639,480 K</span>
                  </div>
                  <div class="perf-stat-line">
                    <span>{t.commitChargePeak}:</span>
                    <span>198,544 K</span>
                  </div>
                </div>
              </div>

              <div class="perf-section-box">
                <div class="perf-box-title">{t.kernelMemory}</div>
                <div class="perf-box-content">
                  <div class="perf-stat-line">
                    <span>{t.kernelMemoryTotal}:</span>
                    <span>6,548 K</span>
                  </div>
                  <div class="perf-stat-line">
                    <span>{t.kernelMemoryPaged}:</span>
                    <span>4,320 K</span>
                  </div>
                  <div class="perf-stat-line">
                    <span>{t.kernelMemoryNonpaged}:</span>
                    <span>2,228 K</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div class="taskmgr-status-bar">
        <span>{t.processes}: {totalProcesses}</span>
        <span>{t.cpuUsage}: {cpuUsage}%</span>
        <span>{t.memUsage}: {formatNumber(totalMemUsage)} K</span>
      </div>
    </div>
  );
}
