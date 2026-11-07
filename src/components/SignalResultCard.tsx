import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { SignalData } from '../types/signal';
import { ArrowUp, ArrowDown, Clock, Copy, Check, Download, Zap } from 'lucide-react';
import { CountdownTimer } from './CountdownTimer';

interface SignalResultCardProps {
  signal: SignalData;
}

export const SignalResultCard: React.FC<SignalResultCardProps> = ({ signal }) => {
  const isUp = signal.direction === 'UP';
  const [copied, setCopied] = useState(false);

  // Live timer tracking for entry countdown & loading bar
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    return Math.max(0, Math.ceil((signal.entryTimestamp - Date.now()) / 1000));
  });

  useEffect(() => {
    const update = () => {
      const diff = Math.ceil((signal.entryTimestamp - Date.now()) / 1000);
      setSecondsRemaining(diff);
    };
    update();
    const interval = setInterval(update, 500);
    return () => clearInterval(interval);
  }, [signal.entryTimestamp]);

  const isEntryNow = secondsRemaining <= 0 && secondsRemaining >= -60;
  const elapsedSeconds = 60 - Math.max(0, Math.min(60, secondsRemaining));
  const loadPercentage = Math.min(100, Math.max(0, Math.round((elapsedSeconds / 60) * 100)));

  // Calculate MTG1 next minute boundary
  const mtg1Timestamp = signal.entryTimestamp + 60000;
  const mtg1Formatted = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Dhaka',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(mtg1Timestamp));

  // Copy signal formatted for Telegram / WhatsApp
  const handleCopy = () => {
    const text = `🔥 CANDLE MINDSET AI SIGNAL 🔥\n📊 Market: ${signal.market}\n⏰ Entry Time: ${signal.entryM1Formatted}\n🎯 Direction: ${signal.direction} ${isUp ? '⬆️' : '⬇️'}\n🛡️ MTG 1: ${mtg1Formatted}\n👉 Join: https://t.me/CANDLEMINDSET`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download high-resolution PNG card image
  const handleDownloadCard = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background gradient
    const bgGradient = ctx.createLinearGradient(0, 0, 600, 720);
    bgGradient.addColorStop(0, '#030308');
    bgGradient.addColorStop(0.5, isUp ? '#0b1e15' : '#1e0c15');
    bgGradient.addColorStop(1, '#030308');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 600, 720);

    // Subtle glass border
    ctx.strokeStyle = isUp ? '#22c55e' : '#ef4444';
    ctx.lineWidth = 3;
    ctx.strokeRect(12, 12, 576, 696);

    // Branding
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CANDLE MINDSET AI', 300, 65);

    ctx.fillStyle = '#c084fc';
    ctx.font = '14px "Space Grotesk", sans-serif';
    ctx.fillText('AI SIGNAL RESULT', 300, 95);

    // Market
    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px "Inter", sans-serif';
    ctx.fillText('MARKET / PAIR', 300, 150);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px "Space Grotesk", sans-serif';
    ctx.fillText(signal.market, 300, 195);

    // Entry Time
    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px "Inter", sans-serif';
    ctx.fillText('ENTRY TIME (M1)', 300, 255);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 30px "JetBrains Mono", sans-serif';
    ctx.fillText(signal.entryM1Formatted, 300, 295);

    // Signal Direction
    ctx.fillStyle = isUp ? '#22c55e' : '#ef4444';
    ctx.font = '900 68px "Space Grotesk", sans-serif';
    ctx.fillText(`${signal.direction} ${isUp ? '▲' : '▼'}`, 300, 400);

    // MTG 1
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 18px "JetBrains Mono", sans-serif';
    ctx.fillText(`MTG 1: ${mtg1Formatted}`, 300, 480);

    // Telegram info
    ctx.fillStyle = '#c084fc';
    ctx.font = '14px "Inter", sans-serif';
    ctx.fillText('Telegram: t.me/CANDLEMINDSET', 300, 630);

    const a = document.createElement('a');
    a.download = `Candle_Mindset_${signal.market.replace('/', '_')}_${signal.direction}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
      className="w-full max-w-xl mx-auto px-4 mb-3"
    >
      <div
        className={`rounded-3xl p-6 border relative overflow-hidden transition-all duration-300 ${
          isUp ? 'glass-result-up' : 'glass-result-down'
        }`}
      >
        {/* Subtle cosmic light reflection sheen */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 animate-shimmer-sweep" />
        </div>

        {/* Card Header: AI Signal Result Title + Countdown */}
        <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-display font-bold uppercase tracking-wider text-purple-200">
              AI Signal Result
            </span>
          </div>

          <CountdownTimer entryTimestamp={signal.entryTimestamp} direction={signal.direction} />
        </div>

        {/* Row 1: Market / Pair & Entry Time */}
        <div className="flex items-center justify-between gap-3 mb-3 relative z-10">
          <div className="flex flex-col">
            <span className="text-[11px] font-sans text-slate-400">Market / Pair</span>
            <span className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              {signal.market}
            </span>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[11px] font-sans text-slate-400">Entry Time</span>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl glass-panel-subtle text-sm font-terminal font-bold text-white mt-0.5">
              <Clock className="w-3.5 h-3.5 text-purple-300" />
              <span>{signal.entryM1Formatted}</span>
            </div>
          </div>
        </div>

        {/* Real-time Entry Timer Loading Bar */}
        <div className="my-2.5 p-3 rounded-2xl glass-panel-subtle border border-white/10 relative overflow-hidden z-10">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-300 font-display font-medium flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isEntryNow ? 'bg-emerald-400 animate-ping' : 'bg-purple-400 animate-pulse'}`} />
              <span>Entry Timer Progress</span>
            </span>
            <span className="font-mono text-xs font-bold">
              {isEntryNow ? (
                <span className="text-emerald-300 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-emerald-400" />
                  <span>100% READY</span>
                </span>
              ) : (
                <span className="text-purple-300">{loadPercentage}% ({secondsRemaining > 0 ? `${secondsRemaining}s` : '0s'})</span>
              )}
            </span>
          </div>

          {/* Smooth Real-Time Progress Bar */}
          <div className="w-full h-2 rounded-full bg-black/40 border border-white/10 overflow-hidden relative shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-300 ease-linear relative ${
                isEntryNow
                  ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 shadow-[0_0_15px_#34d399]'
                  : 'bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 shadow-[0_0_12px_rgba(168,85,247,0.7)]'
              }`}
              style={{ width: `${isEntryNow ? 100 : loadPercentage}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent skew-x-12 animate-shimmer-sweep pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Row 2: Direction Badge (Subtle emerald / subtle red) */}
        <div className="flex items-center justify-between gap-3 my-4 relative z-10">
          <motion.div
            initial={{ scale: 0.88 }}
            animate={{ scale: [0.88, 1.04, 1] }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl font-display font-bold text-2xl sm:text-3xl tracking-wider shadow-xl ${
              isUp
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/40 shadow-[0_0_30px_rgba(52,211,153,0.35)]'
                : 'bg-rose-500/15 text-rose-300 border border-rose-400/40 shadow-[0_0_30px_rgba(244,63,94,0.35)]'
            }`}
          >
            <span>{signal.direction}</span>
            {isUp ? (
              <ArrowUp className="w-7 h-7 stroke-[3] text-emerald-300 animate-arrow-up" />
            ) : (
              <ArrowDown className="w-7 h-7 stroke-[3] text-rose-300 animate-arrow-down" />
            )}
          </motion.div>

          {/* MTG 1 Tag Only */}
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-sans text-slate-400 mb-0.5">Martingale 1</span>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-panel-subtle text-xs font-mono font-semibold text-purple-200">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              <span>MTG 1: {mtg1Formatted}</span>
            </div>
          </div>
        </div>

        {/* Row 3: Action Buttons */}
        <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-end text-xs font-sans relative z-10">
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.94 }}
              type="button"
              onClick={handleCopy}
              className="px-4 py-2 rounded-xl glass-panel-subtle hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 transition flex items-center gap-1.5 text-xs font-medium cursor-pointer"
              title="Copy signal"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-purple-300" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.94 }}
              type="button"
              onClick={handleDownloadCard}
              className="px-4 py-2 rounded-xl glass-panel-subtle hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 transition flex items-center gap-1.5 text-xs font-medium cursor-pointer"
              title="Save card image"
            >
              <Download className="w-3.5 h-3.5 text-purple-300" />
              <span>Save</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
