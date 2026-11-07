import React, { useState } from 'react';
import { Lock, KeyRound, Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';

interface PasswordLockModalProps {
  onUnlock: () => void;
}

export const PasswordLockModal: React.FC<PasswordLockModalProps> = ({ onUnlock }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const CORRECT_PASSWORD = 'candlemindsetx';
  const LOGO_SRC = '/assets/candle-mindset-logo.jpg';
  const LOGO_FALLBACK = 'https://i.ibb.co/RkPQs2ny/Candle-Mindset-Logo.jpg';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim() === CORRECT_PASSWORD) {
      setError(false);
      onUnlock();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#05070D]/90 backdrop-blur-2xl">
      {/* Ambient background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/15 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-indigo-600/10 blur-[100px] pointer-events-none rounded-full" />

      <div
        className={`w-full max-w-sm rounded-3xl p-6 sm:p-7 liquid-glass-glow border border-cyan-500/40 shadow-[0_0_50px_-10px_rgba(6,182,212,0.3)] relative overflow-hidden transition-all duration-300 ${
          shake ? 'animate-shake' : ''
        }`}
      >
        {/* Top cyan laser line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee]" />

        {/* Profile Logo */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative mb-3 group">
            <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full p-1 bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 shadow-[0_0_25px_rgba(6,182,212,0.5)]">
              <img
                src={LOGO_SRC}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = LOGO_FALLBACK;
                }}
                alt="Candle Mindset Profile Logo"
                className="w-full h-full rounded-full object-cover bg-slate-900 border-2 border-slate-950"
              />
            </div>
            <div className="absolute bottom-0 right-1 w-6 h-6 rounded-full bg-cyan-950 border border-cyan-400 flex items-center justify-center text-cyan-300 shadow-md">
              <Lock className="w-3 h-3 stroke-[2.5]" />
            </div>
          </div>

          <h2 className="text-base sm:text-lg font-black tracking-wider text-white font-terminal uppercase">
            CANDLE MINDSET
          </h2>
          <div className="text-xs font-bold tracking-[0.25em] text-cyan-400 font-terminal mb-1">
            AI SIGNAL TERMINAL
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            Enter authorized access password to continue
          </p>
        </div>

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <KeyRound className="w-4 h-4 text-cyan-400" />
            </div>

            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(false);
              }}
              placeholder="Enter password..."
              autoFocus
              className="w-full pl-10 pr-10 py-3.5 rounded-xl bg-slate-950/80 border border-slate-700/80 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 text-white placeholder-slate-500 text-sm font-terminal outline-none transition-all shadow-inner"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-cyan-300 transition"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && (
            <div className="p-2.5 rounded-xl bg-red-950/70 border border-red-500/40 text-red-300 text-xs flex items-center gap-2 font-terminal animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>INVALID PASSWORD. PLEASE TRY AGAIN.</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm font-terminal tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] transition-all cursor-pointer transform active:scale-[0.98]"
          >
            <span>ENTER DASHBOARD</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>

        <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-terminal">
          <div className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>PROTECTED ACCESS</span>
          </div>
          <span className="text-slate-400 font-medium">SESSION LOCK</span>
        </div>
      </div>
    </div>
  );
};
