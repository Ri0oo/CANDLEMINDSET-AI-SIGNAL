import React, { useEffect, useState, useRef } from 'react';
import { Clock, Zap, CheckCircle2 } from 'lucide-react';
import { soundEngine } from '../utils/audio';
import { triggerSignalCompleteVibration } from '../utils/haptics';

interface CountdownTimerProps {
  entryTimestamp: number;
  direction: 'UP' | 'DOWN';
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ entryTimestamp, direction }) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    return Math.max(0, Math.ceil((entryTimestamp - Date.now()) / 1000));
  });

  const [hasTriggeredBell, setHasTriggeredBell] = useState(false);
  const bellFiredRef = useRef(false);

  useEffect(() => {
    bellFiredRef.current = false;
    setHasTriggeredBell(false);

    const updateTimer = () => {
      const diff = Math.ceil((entryTimestamp - Date.now()) / 1000);
      setSecondsRemaining(diff);

      // Play tick beep on final 3 seconds (3, 2, 1)
      if (diff >= 1 && diff <= 3) {
        soundEngine.playTick();
      }

      // Exact entry moment reached!
      if (diff <= 0 && !bellFiredRef.current) {
        bellFiredRef.current = true;
        setHasTriggeredBell(true);
        soundEngine.playEntryBell();
        triggerSignalCompleteVibration(direction);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 500);

    return () => clearInterval(interval);
  }, [entryTimestamp, direction]);

  const isEntryNow = secondsRemaining <= 0 && secondsRemaining >= -60;
  const isExpired = secondsRemaining < -60;

  // Percentage progress from 60s down to 0s
  const progressPercent = Math.max(0, Math.min(100, (Math.max(0, secondsRemaining) / 60) * 100));

  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-xs font-terminal shadow-inner">
      <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
      {isEntryNow ? (
        <span className="text-emerald-400 font-black tracking-wide flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Zap className="w-3 h-3 fill-current text-emerald-400 animate-pulse" />
          <span className="animate-pulse">ENTRY ACTIVE!</span>
        </span>
      ) : isExpired ? (
        <span className="text-slate-500 font-semibold">CANDLE ENDED</span>
      ) : (
        <span className="text-cyan-300 font-extrabold tracking-wider">
          ENTRY IN {secondsRemaining < 10 ? `0${secondsRemaining}s` : `${secondsRemaining}s`}
        </span>
      )}
    </div>
  );
};
