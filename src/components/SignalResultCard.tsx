import React, { useState } from 'react';
import { motion } from 'motion/react';
import { SignalData } from '../types/signal';
import { ArrowUp, ArrowDown, Clock, Copy, Check, Download } from 'lucide-react';
import { CountdownTimer } from './CountdownTimer';

interface SignalResultCardProps {
  signal: SignalData;
}

export const SignalResultCard: React.FC<SignalResultCardProps> = ({ signal }) => {
  const isUp = signal.direction === 'UP';
  const [copied, setCopied] = useState(false);

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
    const text = `🔥 CANDLE MINDSET AI SIGNAL 🔥\n📊 Market: ${signal.market}\n⏰ Entry: ${signal.entryM1Formatted}\n🎯 Direction: ${signal.direction} ${isUp ? '⬆️' : '⬇️'}\n🛡️ MTG 1: ${mtg1Formatted} (1-Step Backup)\n👉 Join: https://t.me/CANDLEMINDSET`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download high-resolution PNG card image
  const handleDownloadCard = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 700;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background gradient
    const bgGradient = ctx.createLinearGradient(0, 0, 600, 700);
    bgGradient.addColorStop(0, '#05070d');
    bgGradient.addColorStop(0.5, isUp ? '#062015' : '#230a10');
    bgGradient.addColorStop(1, '#05070d');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 600, 700);

    // Glowing border
    ctx.strokeStyle = isUp ? '#22c55e' : '#ef4444';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, 580, 680);

    // Branding
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px "JetBrains Mono", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CANDLE MINDSET', 300, 65);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 16px "JetBrains Mono", sans-serif';
    ctx.fillText('AI SIGNAL TERMINAL', 300, 95);

    // Market
    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px "JetBrains Mono", sans-serif';
    ctx.fillText('MARKET ASSET', 300, 150);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px "JetBrains Mono", sans-serif';
    ctx.fillText(signal.market, 300, 195);

    // Entry Time
    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px "JetBrains Mono", sans-serif';
    ctx.fillText('TIMEFRAME & ENTRY', 300, 255);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 30px "JetBrains Mono", sans-serif';
    ctx.fillText(signal.entryM1Formatted, 300, 295);

    // Signal Direction
    ctx.fillStyle = isUp ? '#22c55e' : '#ef4444';
    ctx.font = '900 70px "JetBrains Mono", sans-serif';
    ctx.fillText(`${signal.direction} ${isUp ? '▲' : '▼'}`, 300, 410);

    // MTG 1 Backup
    ctx.fillStyle = '#a855f7';
    ctx.font = 'bold 16px "JetBrains Mono", sans-serif';
    ctx.fillText(`MTG 1 BACKUP: ${mtg1Formatted}`, 300, 480);
    ctx.fillStyle = '#64748b';
    ctx.font = '12px sans-serif';
    ctx.fillText('(Execute only if 1st candle closes against signal)', 300, 505);

    // Telegram info
    ctx.fillStyle = '#0284c7';
    ctx.font = 'bold 15px "JetBrains Mono", sans-serif';
    ctx.fillText('Telegram: t.me/CANDLEMINDSET', 300, 610);

    ctx.fillStyle = '#475569';
    ctx.font = '11px sans-serif';
    ctx.fillText('Binary Options Trading AI Assistance', 300, 640);

    const a = document.createElement('a');
    a.download = `Candle_Mindset_${signal.market.replace('/', '_')}_${signal.direction}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
      className="w-full max-w-xl mx-auto px-4 mb-3"
    >
      <div
        className={`rounded-3xl p-5 sm:p-6 border relative overflow-hidden transition-all duration-300 ${
          isUp
            ? 'liquid-glass-up animate-card-glow-up'
            : 'liquid-glass-down animate-card-glow-down'
        }`}
      >
        {/* Subtle moving light reflection sheen */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 animate-shimmer-sweep" />
        </div>

        {/* Header Row: Market Name + Entry Time */}
        <div className="flex items-center justify-between gap-3 mb-3.5 pb-2.5 border-b border-white/10 relative z-10">
          <span className="text-xl sm:text-2xl font-black text-white font-terminal tracking-wider text-glow-white drop-shadow-md">
            {signal.market}
          </span>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-cyan-400/40 text-sm sm:text-base font-terminal font-black text-cyan-300 text-glow-cyan shadow-inner">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>{signal.entryM1Formatted}</span>
          </div>
        </div>

        {/* Row 2: Direction (UP / DOWN) & Countdown & MTG1 */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 my-2.5 relative z-10">
          {/* Main Direction Badge with motion bounce */}
          <motion.div
            initial={{ scale: 0.85 }}
            animate={{ scale: [0.85, 1.05, 1] }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className={`inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl font-black font-terminal text-2xl sm:text-3xl tracking-widest shadow-2xl ${
              isUp
                ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/60 shadow-[0_0_35px_rgba(52,211,153,0.5)] text-glow-emerald'
                : 'bg-rose-500/25 text-rose-300 border border-rose-400/60 shadow-[0_0_35px_rgba(248,113,113,0.5)] text-glow-rose'
            }`}
          >
            <span>{signal.direction}</span>
            {isUp ? (
              <ArrowUp className="w-7 h-7 stroke-[3.5] text-emerald-300 animate-arrow-up" />
            ) : (
              <ArrowDown className="w-7 h-7 stroke-[3.5] text-rose-300 animate-arrow-down" />
            )}
          </motion.div>

          {/* Right side: Countdown + MTG1 tag */}
          <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
            <CountdownTimer entryTimestamp={signal.entryTimestamp} direction={signal.direction} />
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-950/70 border border-purple-400/40 text-purple-200 text-xs font-terminal font-bold shadow-md">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
              <span>MTG 1: {mtg1Formatted}</span>
            </div>
          </div>
        </div>

        {/* Row 3: Quick Action buttons */}
        <div className="pt-2.5 mt-2.5 border-t border-white/10 flex items-center justify-end text-xs font-terminal relative z-10">
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.94 }}
              type="button"
              onClick={handleCopy}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 transition flex items-center gap-1.5 text-xs font-bold cursor-pointer shadow-md"
              title="Copy signal"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.94 }}
              type="button"
              onClick={handleDownloadCard}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 transition flex items-center gap-1.5 text-xs font-bold cursor-pointer shadow-md"
              title="Save card image"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Save</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
