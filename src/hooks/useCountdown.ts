import { useState, useEffect } from 'react';

interface CountdownResult {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
  totalSeconds: number;
}

export function useCountdown(targetDate: string | null): CountdownResult {
  const [result, setResult] = useState<CountdownResult>(calculateCountdown(targetDate));

  useEffect(() => {
    if (!targetDate) return;

    const interval = setInterval(() => {
      setResult(calculateCountdown(targetDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return result;
}

function calculateCountdown(targetDate: string | null): CountdownResult {
  const empty = { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false, totalSeconds: 0 };
  if (!targetDate) return empty;

  const diff = new Date(targetDate).getTime() - Date.now();
  if (diff <= 0) return { ...empty, isPast: true };

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds, isPast: false, totalSeconds };
}
