import React, { useState } from 'react';
import { Volume2, VolumeX, Calculator, Lock, Clock, Sliders } from 'lucide-react';
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
    <header className="w-full max-w-xl mx-auto px-4 py-2.5 flex items-center justify-between glass-panel rounded-2xl my-2 border border-white/10 shadow-2xl relative z-20">
      {/* Brand: Logo + Title */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full p-[1px] bg-gradient-to-tr from-purple-400 via-white/50 to-indigo-500 shadow-[0_0_15px_rgba(168,85,247,0.35)] overflow-hidden shrink-0">
          <img
            src={LOGO_SRC}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = LOGO_FALLBACK;
            }}
            alt="Candle Mindset Logo"
            className="w-full h-full rounded-full object-cover"
          />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-display font-bold tracking-tight text-white drop-shadow-sm">
              CANDLE MINDSET
            </span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isAnalyzing ? 'bg-purple-400 animate-ping' : 'bg-emerald-400 shadow-[0_0_6px_#34d399]'
              }`}
            />
          </div>
          <span className="text-[10px] text-purple-300 font-medium tracking-wider uppercase font-display -mt-0.5">
            AI Indicator
          </span>
        </div>
      </div>

      {/* Right Controls: Circular Transparent Glass Buttons */}
      <div className="flex items-center gap-1.5">
        {liveDhakaTime && (
          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full glass-panel-subtle text-[11px] font-terminal text-slate-300">
            <Clock className="w-3 h-3 text-purple-300" />
            <span>{liveDhakaTime}</span>
          </div>
        )}

        {onOpenCalculator && (
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            type="button"
            onClick={onOpenCalculator}
            className="w-8 h-8 rounded-full glass-panel-subtle hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-white border border-white/10 transition cursor-pointer"
            title="Money Management Calculator"
          >
            <Calculator className="w-3.5 h-3.5" />
          </motion.button>
        )}

        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          type="button"
          onClick={handleToggleSound}
          className={`w-8 h-8 rounded-full flex items-center justify-center border transition cursor-pointer ${
            soundOn
              ? 'glass-panel-subtle text-purple-300 border-purple-400/30 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
              : 'glass-panel-subtle text-slate-500 border-white/5 hover:text-slate-300'
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
            className="w-8 h-8 rounded-full glass-panel-subtle hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition flex items-center justify-center cursor-pointer"
            title="Settings / Lock"
          >
            <Lock className="w-3.5 h-3.5" />
          </motion.button>
        )}
      </div>
    </header>
  );
};
