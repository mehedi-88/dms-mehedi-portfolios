import React from 'react';
import { motion } from 'framer-motion';

interface TypingIndicatorProps {
  label: string;
  align?: 'left' | 'right';
  isAI?: boolean;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ label, align = 'left', isAI }) => {
  const dotSize = isAI ? 'w-2.5 h-2.5' : 'w-2 h-2';
  const containerGradient = isAI
    ? 'from-[#89f7fe]/40 via-[#67e8f9]/50 to-[#4f98e2]/40'
    : 'from-[#00C4FF]/20 via-[#1254FF]/25 to-[#00C4FF]/15';
  const shadow = isAI
    ? 'shadow-[0_0_30px_8px_rgba(0,196,255,0.23)]'
    : 'shadow-[0_0_16px_2px_rgba(18,84,255,0.12)]';
  const alignClass = align === 'left' ? 'justify-start' : 'justify-end';
  return (
    <div className={`flex ${alignClass} my-1`}>
      <div
        className={`backdrop-blur-sm bg-gradient-to-br ${containerGradient} border border-white/30 rounded-lg px-4 py-2 flex gap-2 items-center ${shadow}`}
      >
        <span className="inline-flex gap-1">
          <motion.span
            animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0 }}
            className={`inline-block rounded-full bg-white ${dotSize}`}
          />
          <motion.span
            animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0.18 }}
            className={`inline-block rounded-full bg-white ${dotSize}`}
          />
          <motion.span
            animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0.33 }}
            className={`inline-block rounded-full bg-white ${dotSize}`}
          />
        </span>
        <span className="text-xs sm:text-sm text-white/90 font-medium ml-2 whitespace-nowrap select-none drop-shadow">
          {label}
        </span>
      </div>
    </div>
  );
};

export default TypingIndicator;
