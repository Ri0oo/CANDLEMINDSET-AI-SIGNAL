import React, { useState } from 'react';
import { Volume2, VolumeX, Calculator, Lock, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { soundEngine } from '../utils/audio';

interface HeaderProps {
  onLock?: () => void;
  onOpenCalculator?: () => void;
  liveDhakaTime?: string;
  isAnalyzing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onLock,
  onOpenCalculator,
  liveDhakaTime,
  isAnalyzing = false,
}) => {
  const [soundOn, setSoundOn] = useState<boolean>(() => soundEngine.isEnabled());

  const LOGO_SRC = '/assets/candle-mindset-logo.jpg';
  const LOGO_FALLBACK = 'https://i.ibb.co/RkPQs2ny/Candle-Mindset-Logo.jpg';

  const handleToggleSound = () => {
    const newState = soundEngine.toggleSound();
    setSoundOn(newState);
  };

  return (
    <header className="w-full max-w-xl mx-auto px-4 py-2.5 flex items-center justify-between liquid-glass rounded-2xl my-2 border border-white/10 shadow-lg relative z-20">
      {/* Brand: Logo + Title */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full p-0.5 bg-gradient-to-tr from-cyan-400 to-indigo-600 shadow-[0_0_12px_rgba(6,182,212,0.5)] overflow-hidden shrink-0">
          <img
            src={LOGO_SRC}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = LOGO_FALLBACK;
            }}
            alt="Candle Mindset"
            className="w-full h-full rounded-full object-cover"
          />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-extrabold tracking-wider text-white font-terminal text-glow-white">
              CANDLE MINDSET
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                isAnalyzing ? 'bg-cyan-400 animate-ping' : 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
              }`}
            />
          </div>
          <span className="text-[10px] text-cyan-400 font-terminal tracking-wide">
            AI Indicator
          </span>
        </div>
      </div>

      {/* Right Controls: Highlighted Money Mgt + Clock + Audio + Lock */}
      <div className="flex items-center gap-2">
        {onOpenCalculator && (
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.94 }}
            type="button"
            onClick={onOpenCalculator}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/25 to-yellow-600/20 hover:from-amber-500/35 hover:to-yellow-500/30 text-amber-300 hover:text-amber-100 border border-amber-400/60 shadow-[0_0_14px_rgba(245,158,11,0.3)] transition-all cursor-pointer font-terminal text-xs font-bold relative overflow-hidden"
            title="Money Management Calculator"
          >
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-amber-200/20 to-transparent skew-x-12 animate-shimmer-sweep" />
            </div>
            <Calculator className="w-3.5 h-3.5 text-amber-400 animate-pulse relative z-10" />
            <span className="relative z-10 text-glow-amber">MONEY MGT</span>
          </motion.button>
        )}

        {liveDhakaTime && (
          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-950/80 border border-slate-700/70 text-xs font-terminal text-cyan-300 shadow-inner">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span className="font-bold">{liveDhakaTime}</span>
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          type="button"
          onClick={handleToggleSound}
          className={`p-2 rounded-xl border transition cursor-pointer ${
            soundOn
              ? 'bg-cyan-950/70 border-cyan-500/50 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
              : 'bg-slate-900/80 border-slate-700/60 text-slate-500 hover:text-slate-300'
          }`}
          title={soundOn ? 'Sound On' : 'Muted'}
        >
          {soundOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </motion.button>

        {onLock && (
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            type="button"
            onClick={onLock}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/60 transition cursor-pointer"
            title="Lock terminal"
          >
            <Lock className="w-3.5 h-3.5" />
          </motion.button>
        )}
      </div>
    </header>
  );
};
