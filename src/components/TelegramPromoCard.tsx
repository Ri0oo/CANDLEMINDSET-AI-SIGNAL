import React from 'react';
import { Send, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

export const TelegramPromoCard: React.FC = () => {
  const TELEGRAM_URL = 'https://t.me/CANDLEMINDSET';

  const handleClick = () => {
    window.open(TELEGRAM_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 mt-3 mb-2">
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleClick();
          }
        }}
        className="glass-panel rounded-2xl p-4 sm:p-5 hover:border-purple-400/30 flex items-center justify-between cursor-pointer transition-all duration-300 shadow-xl group"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl glass-panel-subtle flex items-center justify-center text-purple-300 group-hover:scale-105 group-hover:text-white transition">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-display font-bold text-white group-hover:text-purple-200 transition">
              Join Our Telegram
            </h4>
            <p className="text-xs text-slate-400 font-sans">
              Get updates, analysis & more.
            </p>
          </div>
        </div>

        <div className="w-8 h-8 rounded-full glass-panel-subtle flex items-center justify-center text-slate-400 group-hover:text-white transition">
          <ExternalLink className="w-4 h-4" />
        </div>
      </motion.div>
    </div>
  );
};
