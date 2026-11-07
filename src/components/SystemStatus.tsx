import React, { useEffect, useState } from 'react';
import { getLiveDhakaTime } from '../utils/time';
import { Clock } from 'lucide-react';

interface SystemStatusProps {
  isAnalyzing: boolean;
}

export const SystemStatus: React.FC<SystemStatusProps> = ({ isAnalyzing }) => {
  const [dhakaTime, setDhakaTime] = useState(getLiveDhakaTime());

  useEffect(() => {
    const timer = setInterval(() => {
      setDhakaTime(getLiveDhakaTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full max-w-xl mx-auto px-4 mb-4">
      <div className="liquid-glass rounded-xl px-4 py-2.5 flex items-center justify-between border border-white/5 shadow-lg">
        {/* Status indicator */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center">
            {isAnalyzing ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping absolute" />
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 relative shadow-[0_0_12px_#38bdf8]" />
              </>
            ) : (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse absolute opacity-75" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 relative shadow-[0_0_12px_#34d399]" />
              </>
            )}
          </div>
          <span className="text-xs sm:text-sm font-semibold tracking-wider font-terminal uppercase">
            {isAnalyzing ? (
              <span className="text-cyan-300">SYSTEM STATUS: ANALYZING</span>
            ) : (
              <span className="text-emerald-400">SYSTEM STATUS: READY</span>
            )}
          </span>
        </div>

        {/* Live Asia/Dhaka Clock (UTC+6) */}
        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-400 font-terminal">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-300 font-semibold">{dhakaTime}</span>
          <span className="text-[10px] px-1 py-0.5 rounded bg-slate-800 text-slate-400 font-medium">UTC+6</span>
        </div>
      </div>
    </div>
  );
};
