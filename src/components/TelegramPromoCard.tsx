import React from 'react';
import { Send, ExternalLink } from 'lucide-react';

export const TelegramPromoCard: React.FC = () => {
  const TELEGRAM_URL = 'https://t.me/CANDLEMINDSET';

  const handleClick = () => {
    window.open(TELEGRAM_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 mt-2 mb-2">
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleClick();
          }
        }}
        className="liquid-glass rounded-2xl py-3 px-4 hover:border-cyan-400/50 flex items-center justify-between text-xs font-terminal cursor-pointer transition-all duration-300 shadow-md group"
      >
        <div className="flex items-center gap-2.5 text-cyan-300 group-hover:text-cyan-200">
          <Send className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition shrink-0" />
          <span className="font-extrabold text-xs sm:text-sm text-glow-cyan truncate">Join Official Telegram: @CANDLEMINDSET</span>
        </div>
        <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-cyan-300 transition shrink-0" />
      </div>
    </div>
  );
};
