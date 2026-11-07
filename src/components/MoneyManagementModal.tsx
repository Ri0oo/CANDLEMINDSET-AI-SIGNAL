import React, { useState } from 'react';
import { DollarSign, ShieldAlert, Check, X, Calculator, TrendingUp, AlertTriangle } from 'lucide-react';

interface MoneyManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MoneyManagementModal: React.FC<MoneyManagementModalProps> = ({ isOpen, onClose }) => {
  const [balance, setBalance] = useState<number>(100);

  if (!isOpen) return null;

  const trade1Percent = Math.max(1, Math.round(balance * 0.01 * 10) / 10);
  const trade2Percent = Math.max(1, Math.round(balance * 0.02 * 10) / 10);
  const trade5Percent = Math.max(1, Math.round(balance * 0.05 * 10) / 10);

  // MTG1 is 2.2x of primary entry (standard Quotex 85-87% payout recovery)
  const mtg1Amount = Math.round(trade1Percent * 2.2 * 10) / 10;

  const targetProfit = Math.round(balance * 0.10);
  const stopLoss = Math.round(balance * 0.05);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="liquid-glass-card rounded-3xl max-w-md w-full p-6 sm:p-7 border border-amber-400/40 shadow-2xl relative overflow-hidden">
        {/* Amber laser glow top bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_15px_#f59e0b]" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.35)] shrink-0">
            <Calculator className="w-6 h-6 text-amber-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-amber-300 font-terminal tracking-wide text-glow-amber">
              MONEY MANAGEMENT
            </h3>
            <p className="text-xs text-slate-300 font-terminal">
              Quotex mathematical trade sizing & capital protection
            </p>
          </div>
        </div>

        {/* Balance Input */}
        <div className="mb-5">
          <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider font-terminal mb-2">
            YOUR QUOTEX ACCOUNT BALANCE ($)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-cyan-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <input
              type="number"
              min="10"
              step="5"
              value={balance}
              onChange={(e) => setBalance(Math.max(1, Number(e.target.value) || 0))}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/90 border border-cyan-500/40 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 text-white font-terminal text-lg font-black outline-none shadow-inner"
            />
          </div>
          <div className="flex gap-2 mt-2.5">
            {[50, 100, 250, 500].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setBalance(preset)}
                className={`px-3 py-1.5 text-xs rounded-xl font-terminal font-bold transition cursor-pointer ${
                  balance === preset
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md'
                    : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-700/80'
                }`}
              >
                ${preset}
              </button>
            ))}
          </div>
        </div>

        {/* Recommended Sizes Grid */}
        <div className="space-y-3 mb-5 font-terminal text-xs">
          <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 flex items-center justify-between shadow-md">
            <div>
              <div className="text-emerald-300 font-extrabold flex items-center gap-1.5 text-xs sm:text-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>1% Safe Trade Size (Recommended)</span>
              </div>
              <div className="text-[11px] text-slate-300 mt-0.5">Maximum consistency, zero account blow risk</div>
            </div>
            <div className="text-right">
              <span className="text-lg font-black text-emerald-300 text-glow-emerald">${trade1Percent}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/40 flex items-center justify-between shadow-md">
            <div>
              <div className="text-cyan-300 font-extrabold flex items-center gap-1.5 text-xs sm:text-sm">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>2% Moderate Trade Size</span>
              </div>
              <div className="text-[11px] text-slate-300 mt-0.5">Balanced capital growth for experienced traders</div>
            </div>
            <div className="text-right">
              <span className="text-lg font-black text-cyan-300 text-glow-cyan">${trade2Percent}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-purple-950/50 border border-purple-500/40 flex items-center justify-between shadow-md">
            <div>
              <div className="text-purple-300 font-extrabold flex items-center gap-1.5 text-xs sm:text-sm">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                <span>MTG1 Recovery Bet (2.2x)</span>
              </div>
              <div className="text-[11px] text-slate-300 mt-0.5">Execute only if 1st candle closes against signal</div>
            </div>
            <div className="text-right">
              <span className="text-lg font-black text-purple-300">${mtg1Amount}</span>
            </div>
          </div>
        </div>

        {/* Daily Target & Stop Loss Rules */}
        <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-700/80 font-terminal text-xs mb-5 space-y-2 shadow-inner">
          <div className="flex justify-between items-center text-slate-200">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <TrendingUp className="w-4 h-4" />
              <span>Daily Profit Target (+10%):</span>
            </span>
            <span className="font-extrabold text-emerald-300">+${targetProfit}</span>
          </div>
          <div className="flex justify-between items-center text-slate-200">
            <span className="flex items-center gap-1.5 text-rose-400 font-bold">
              <AlertTriangle className="w-4 h-4" />
              <span>Daily Stop Loss (-5%):</span>
            </span>
            <span className="font-extrabold text-rose-400">-${stopLoss}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider font-terminal hover:from-amber-400 hover:to-yellow-500 shadow-xl cursor-pointer transition"
        >
          APPLY MONEY MANAGEMENT
        </button>
      </div>
    </div>
  );
};
