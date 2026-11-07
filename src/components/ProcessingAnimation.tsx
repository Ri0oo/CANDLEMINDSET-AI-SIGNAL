import React from 'react';
import { SIGNAL_STAGES } from '../types/signal';
import { RotateCw } from 'lucide-react';

interface ProcessingAnimationProps {
  currentStage: number; // 1 to 8
  entryTimePreview?: string;
}

export const ProcessingAnimation: React.FC<ProcessingAnimationProps> = ({
  currentStage,
  entryTimePreview,
}) => {
  const stageInfo = SIGNAL_STAGES[currentStage] || SIGNAL_STAGES[1];
  const progressPercent = Math.min(100, Math.round((currentStage / 8) * 100));

  return (
    <div className="w-full max-w-xl mx-auto px-4 mb-3 transition-all duration-300 animate-in fade-in">
      <div className="liquid-glass-card rounded-2xl p-4 border border-cyan-500/50 shadow-2xl font-terminal">
        <div className="flex items-center justify-between text-xs sm:text-sm mb-2">
          <div className="flex items-center gap-2 text-cyan-300 font-extrabold">
            <RotateCw className="w-4 h-4 animate-spin text-cyan-400 shrink-0" />
            <span className="truncate max-w-[240px] text-white text-glow-white">{stageInfo.label}</span>
          </div>
          <span className="text-cyan-300 font-black text-glow-cyan text-sm">{progressPercent}%</span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-slate-950/90 rounded-full overflow-hidden border border-slate-700/80 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 transition-all duration-200 shadow-[0_0_15px_#22d3ee]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
