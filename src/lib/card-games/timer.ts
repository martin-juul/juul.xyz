// Timer hook for card games

import { useState, useEffect, useRef, useCallback } from 'preact/hooks';

/**
 * Hook for managing a game timer
 */
export function useGameTimer(isActive: boolean, isWon: boolean): {
  time: number;
  startTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
  formatTime: (seconds: number) => string;
} {
  const [time, setTime] = useState(0);
  const timerRef = useRef<number | null>(null);

  const startTimer = useCallback(() => {
    if (timerRef.current) return;
    timerRef.current = window.setInterval(() => {
      setTime(t => t + 1);
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const resetTimer = useCallback(() => {
    stopTimer();
    setTime(0);
  }, [stopTimer]);

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Auto-start when active and not won
  useEffect(() => {
    if (isActive && !isWon) {
      startTimer();
    }
    return () => stopTimer();
  }, [isActive, isWon, startTimer, stopTimer]);

  // Stop on win
  useEffect(() => {
    if (isWon) {
      stopTimer();
    }
  }, [isWon, stopTimer]);

  return { time, startTimer, stopTimer, resetTimer, formatTime };
}
