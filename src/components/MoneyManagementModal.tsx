import React, { useState } from 'react';
import { DollarSign, X, Calculator, TrendingUp, AlertTriangle } from 'lucide-react';

interface MoneyManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MoneyManagementModal: React.FC<MoneyManagementModalProps> = ({ isOpen, onClose }) => {
  const [balance, setBalance] = useState<number>(100);

  if (!isOpen) return null;

  const trade1Percent = Math.max(1, Math.round(balance * 0.01 * 10) / 10);
  const trade2Percent = Math.max(1, Math.round(balance * 0.02 * 10) / 10);

  // MTG1 is 2.2x of primary entry (standard Quotex 85-87% payout recovery)
  const mtg1Amount = Math.round(trade1Percent * 2.2 * 10) / 10;

  const targetProfit = Math.round(balance * 0.10);
  const stopLoss = Math.round(balance * 0.05);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl animate-in fade-in">
      <div className="glass-panel rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative overflow-hidden">
        {/* Soft upper ambient highlight */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full glass-panel-subtle flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-11 h-11 rounded-2xl glass-panel-subtle flex items-center justify-center text-purple-300 shadow-sm shrink-0">
            <Calculator className="w-5 h-5 text-purple-300" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-display font-bold text-white tracking-tight">
              Money Management
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              Quotex mathematical trade sizing & capital protection
            </p>
          </div>
        </div>

        {/* Balance Input */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider font-display mb-2">
            Quotex Account Balance ($)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-400">
              <DollarSign className="w-4 h-4" />
            </div>
            <input
              type="number"
              min="10"
              step="5"
              value={balance}
              onChange={(e) => setBalance(Math.max(1, Number(e.target.value) || 0))}
              className="w-full pl-9 pr-4 py-3 rounded-2xl bg-white/[0.04] border border-white/15 focus:border-purple-400/60 focus:ring-2 focus:ring-purple-500/20 text-white font-mono text-lg font-bold outline-none transition"
            />
          </div>
          <div className="flex gap-2 mt-2.5">
            {[50, 100, 250, 500].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setBalance(preset)}
                className={`px-3 py-1.5 text-xs rounded-xl font-mono font-medium transition cursor-pointer ${
                  balance === preset
                    ? 'bg-white text-slate-950 font-bold shadow-md'
                    : 'glass-panel-subtle text-slate-300 hover:text-white'
                }`}
              >
                ${preset}
              </button>
            ))}
          </div>
        </div>

        {/* Recommended Sizes Grid */}
        <div className="space-y-2.5 mb-5 font-sans text-xs">
          <div className="p-3.5 rounded-2xl glass-panel-subtle border-emerald-500/20 flex items-center justify-between shadow-sm">
            <div>
              <div className="text-emerald-300 font-display font-semibold flex items-center gap-1.5 text-xs sm:text-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>1% Safe Trade Size (Recommended)</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Maximum consistency, zero account blow risk</div>
            </div>
            <div className="text-right">
              <span className="text-lg font-mono font-bold text-emerald-300">${trade1Percent}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl glass-panel-subtle border-purple-500/20 flex items-center justify-between shadow-sm">
            <div>
              <div className="text-purple-200 font-display font-semibold flex items-center gap-1.5 text-xs sm:text-sm">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                <span>2% Moderate Trade Size</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Balanced capital growth for experienced traders</div>
            </div>
            <div className="text-right">
              <span className="text-lg font-mono font-bold text-purple-200">${trade2Percent}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl glass-panel-subtle border-amber-500/20 flex items-center justify-between shadow-sm">
            <div>
              <div className="text-amber-200 font-display font-semibold flex items-center gap-1.5 text-xs sm:text-sm">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>MTG1 Recovery Bet (2.2x)</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Execute only if 1st candle closes against signal</div>
            </div>
            <div className="text-right">
              <span className="text-lg font-mono font-bold text-amber-200">${mtg1Amount}</span>
            </div>
          </div>
        </div>

        {/* Daily Target & Stop Loss Rules */}
        <div className="p-3.5 rounded-2xl glass-panel-subtle font-sans text-xs mb-5 space-y-2">
          <div className="flex justify-between items-center text-slate-300">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Daily Profit Target (+10%):</span>
            </span>
            <span className="font-mono font-bold text-emerald-300">+${targetProfit}</span>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span className="flex items-center gap-1.5 text-rose-400 font-medium">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Daily Stop Loss (-5%):</span>
            </span>
            <span className="font-mono font-bold text-rose-400">-${stopLoss}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="glass-button-silver w-full py-3.5 rounded-2xl font-display font-bold text-xs sm:text-sm tracking-wide text-slate-950 shadow-lg cursor-pointer transition"
        >
          Apply Money Management
        </button>
      </div>
    </div>
  );
};
