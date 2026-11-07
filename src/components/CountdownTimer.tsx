import React, { useEffect, useState, useRef } from 'react';
import { Clock, Zap } from 'lucide-react';
import { soundEngine } from '../utils/audio';
import { triggerSignalCompleteVibration } from '../utils/haptics';

interface CountdownTimerProps {
  entryTimestamp: number;
  direction: 'UP' | 'DOWN';
  showBar?: boolean;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  entryTimestamp,
  direction,
  showBar = true,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    return Math.max(0, Math.ceil((entryTimestamp - Date.now()) / 1000));
  });

  const bellFiredRef = useRef(false);

  useEffect(() => {
    bellFiredRef.current = false;

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

  // Percentage progress from 0% (60s remaining) loading up to 100% (0s entry moment)
  const elapsedSeconds = 60 - Math.max(0, Math.min(60, secondsRemaining));
  const loadPercentage = Math.min(100, Math.max(0, Math.round((elapsedSeconds / 60) * 100)));

  return (
    <div className="flex flex-col items-end gap-1.5">
      {/* Countdown Badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-pill text-xs font-mono shadow-sm">
        <Clock className="w-3.5 h-3.5 text-purple-300 shrink-0" />
        {isEntryNow ? (
          <span className="text-emerald-400 font-bold tracking-wide flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Zap className="w-3 h-3 fill-current text-emerald-400" />
            <span>ENTRY NOW</span>
          </span>
        ) : isExpired ? (
          <span className="text-slate-400 font-medium">Candle closed</span>
        ) : (
          <span className="text-white font-bold tracking-wider">
            Entry in {secondsRemaining < 10 ? `0${secondsRemaining}s` : `${secondsRemaining}s`}
          </span>
        )}
      </div>

      {/* Loading Progress Bar attached directly with the Entry Timer */}
      {showBar && !isExpired && (
        <div className="w-28 sm:w-36 flex flex-col gap-0.5">
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden relative shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-300 ease-linear ${
                isEntryNow
                  ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 shadow-[0_0_12px_#34d399]'
                  : 'bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 shadow-[0_0_8px_rgba(168,85,247,0.7)]'
              }`}
              style={{ width: `${isEntryNow ? 100 : loadPercentage}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 px-0.5">
            <span>{isEntryNow ? 'Ready' : 'Loading'}</span>
            <span className={isEntryNow ? 'text-emerald-300 font-bold' : 'text-purple-300'}>
              {isEntryNow ? '100%' : `${loadPercentage}%`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
