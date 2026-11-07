import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full max-w-xl mx-auto px-4 py-2 text-center text-[10px] text-slate-600 font-terminal">
      © {new Date().getFullYear()} CANDLE MINDSET AI • QUOTEX ALIGNED
    </footer>
  );
};
