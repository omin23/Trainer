import { useState, useRef, useCallback, useEffect } from 'react';
import {
  scheduleRestTimerNotification,
  cancelNotification,
} from '../services/notificationService';

export interface UseTimerReturn {
  timeRemaining: number;
  isRunning: boolean;
  totalTime: number;
  progress: number;
  start: (seconds: number) => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
}

export function useTimer(): UseTimerReturn {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [totalTime, setTotalTime] = useState(0);
  const endTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pausedRemainingRef = useRef<number>(0);
  const notificationIdRef = useRef<string | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    if (!endTimeRef.current) return;
    const remaining = Math.max(
      0,
      Math.ceil((endTimeRef.current - Date.now()) / 1000)
    );
    setTimeRemaining(remaining);
    if (remaining <= 0) {
      clearTimer();
      setIsRunning(false);
      endTimeRef.current = null;
    }
  }, [clearTimer]);

  const start = useCallback(
    (seconds: number) => {
      clearTimer();
      if (notificationIdRef.current) {
        cancelNotification(notificationIdRef.current);
      }
      setTotalTime(seconds);
      setTimeRemaining(seconds);
      endTimeRef.current = Date.now() + seconds * 1000;
      setIsRunning(true);

      intervalRef.current = setInterval(tick, 200);

      scheduleRestTimerNotification(seconds).then((id) => {
        notificationIdRef.current = id;
      });
    },
    [clearTimer, tick]
  );

  const pause = useCallback(() => {
    if (!isRunning || !endTimeRef.current) return;
    clearTimer();
    pausedRemainingRef.current = Math.max(
      0,
      Math.ceil((endTimeRef.current - Date.now()) / 1000)
    );
    endTimeRef.current = null;
    setIsRunning(false);
    if (notificationIdRef.current) {
      cancelNotification(notificationIdRef.current);
      notificationIdRef.current = null;
    }
  }, [isRunning, clearTimer]);

  const resume = useCallback(() => {
    if (isRunning || pausedRemainingRef.current <= 0) return;
    const remaining = pausedRemainingRef.current;
    endTimeRef.current = Date.now() + remaining * 1000;
    setIsRunning(true);
    intervalRef.current = setInterval(tick, 200);

    scheduleRestTimerNotification(remaining).then((id) => {
      notificationIdRef.current = id;
    });
  }, [isRunning, tick]);

  const reset = useCallback(() => {
    clearTimer();
    setTimeRemaining(0);
    setTotalTime(0);
    setIsRunning(false);
    endTimeRef.current = null;
    pausedRemainingRef.current = 0;
    if (notificationIdRef.current) {
      cancelNotification(notificationIdRef.current);
      notificationIdRef.current = null;
    }
  }, [clearTimer]);

  useEffect(() => {
    return () => {
      clearTimer();
      if (notificationIdRef.current) {
        cancelNotification(notificationIdRef.current);
      }
    };
  }, [clearTimer]);

  const progress = totalTime > 0 ? 1 - timeRemaining / totalTime : 0;

  return { timeRemaining, isRunning, totalTime, progress, start, pause, resume, reset };
}
