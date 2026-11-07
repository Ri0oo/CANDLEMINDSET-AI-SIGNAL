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
      <div className="glass-panel rounded-2xl p-4 border border-white/15 shadow-2xl">
        <div className="flex items-center justify-between text-xs sm:text-sm mb-2.5">
          <div className="flex items-center gap-2 text-purple-200 font-display font-medium">
            <RotateCw className="w-4 h-4 animate-spin text-purple-300 shrink-0" />
            <span className="truncate max-w-[240px] text-white">{stageInfo.label}</span>
          </div>
          <span className="text-white font-terminal font-bold text-xs">{progressPercent}%</span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/10">
          <div
            className="h-full bg-gradient-to-r from-purple-500 via-indigo-400 to-white transition-all duration-200 shadow-[0_0_12px_rgba(168,85,247,0.5)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
