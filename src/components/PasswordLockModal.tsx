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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030308]/90 backdrop-blur-2xl">
      {/* Background purple nebula ambiance */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/15 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-indigo-600/10 blur-[100px] pointer-events-none rounded-full" />

      <div
        className={`w-full max-w-sm rounded-3xl p-6 sm:p-7 glass-panel shadow-2xl relative overflow-hidden transition-all duration-300 ${
          shake ? 'animate-shake' : ''
        }`}
      >
        {/* Top subtle highlight line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

        {/* Profile Logo */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative mb-3 group">
            <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full p-1 bg-gradient-to-tr from-purple-500/40 via-white/30 to-purple-400/20 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
              <img
                src={LOGO_SRC}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = LOGO_FALLBACK;
                }}
                alt="Candle Mindset Profile Logo"
                className="w-full h-full rounded-full object-cover bg-slate-950 border border-white/20"
              />
            </div>
            <div className="absolute bottom-0 right-1 w-6 h-6 rounded-full glass-panel-subtle flex items-center justify-center text-purple-300 shadow-md">
              <Lock className="w-3 h-3 stroke-[2.5]" />
            </div>
          </div>

          <h2 className="text-base sm:text-lg font-display font-bold tracking-tight text-white uppercase">
            CANDLE MINDSET
          </h2>
          <div className="text-xs font-semibold tracking-[0.2em] text-purple-300 font-display mb-1">
            AI INDICATOR
          </div>
          <p className="text-xs text-slate-400 font-sans">
            Enter authorized access password to continue
          </p>
        </div>

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <KeyRound className="w-4 h-4 text-purple-400" />
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
              className="w-full pl-10 pr-10 py-3.5 rounded-2xl bg-white/[0.04] border border-white/15 focus:border-purple-400/60 focus:ring-2 focus:ring-purple-500/20 text-white placeholder-slate-500 text-sm font-sans outline-none transition shadow-inner"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition cursor-pointer"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && (
            <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-500/30 text-red-300 text-xs flex items-center gap-2 font-sans animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>Invalid password. Please try again.</span>
            </div>
          )}

          <button
            type="submit"
            className="glass-button-silver w-full py-3.5 px-5 rounded-2xl font-display font-bold text-sm tracking-wide text-slate-950 flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl transition cursor-pointer active:scale-[0.98]"
          >
            <span>Enter Terminal</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>

        <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 font-sans">
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Protected Access</span>
          </div>
          <span className="text-slate-400">Encrypted</span>
        </div>
      </div>
    </div>
  );
};
