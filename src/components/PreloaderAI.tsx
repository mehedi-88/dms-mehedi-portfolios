'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PreloaderAIProps {
  isLoading: boolean;
  onLoadingComplete?: () => void;
  progress?: number;
}

export function PreloaderAI({ isLoading, onLoadingComplete, progress = 0 }: PreloaderAIProps) {
  const [displayText, setDisplayText] = useState('');
  const [networkType, setNetworkType] = useState('');
  const loadingText = 'Initializing AI Systems';

  useEffect(() => {
    // Get network type
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      setNetworkType(connection.effectiveType.toUpperCase());
    }
  }, []);

  useEffect(() => {
    if (!isLoading) return;

    let index = 0;
    const interval = setInterval(() => {
      if (index <= loadingText.length) {
        setDisplayText(loadingText.substring(0, index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isLoading]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden"
        >
          {/* Background Grid Effect */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `
                  linear-gradient(0deg, transparent 24%, rgba(18, 84, 255, 0.1) 25%, rgba(18, 84, 255, 0.1) 26%, transparent 27%, transparent 74%, rgba(18, 84, 255, 0.1) 75%, rgba(18, 84, 255, 0.1) 76%, transparent 77%, transparent),
                  linear-gradient(90deg, transparent 24%, rgba(18, 84, 255, 0.1) 25%, rgba(18, 84, 255, 0.1) 26%, transparent 27%, transparent 74%, rgba(18, 84, 255, 0.1) 75%, rgba(18, 84, 255, 0.1) 76%, transparent 77%, transparent)
                `,
                backgroundSize: '50px 50px',
              }}
            />
          </div>

          {/* Central AI Brain Animation - Smaller & Refined */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            {/* Rotating Outer Ring - Reduced size */}
            <div className="relative w-32 h-32 flex items-center justify-center">
              <motion.div
                className="absolute w-full h-full rounded-full border-2 border-transparent border-t-[#1254FF] border-r-[#00C4FF]"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              />

              {/* Middle Ring - Reduced size */}
              <motion.div
                className="absolute w-22 h-22 rounded-full border-2 border-transparent border-b-[#00C4FF] border-l-[#1254FF]"
                style={{ width: '88px', height: '88px' }}
                animate={{ rotate: -360 }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              />

              {/* Inner Pulsing Core - Reduced size */}
              <motion.div
                className="absolute rounded-full bg-gradient-to-r from-[#1254FF] to-[#00C4FF]"
                style={{ width: '48px', height: '48px' }}
                animate={{
                  scale: [1, 1.2, 1],
                  boxShadow: [
                    '0 0 15px rgba(18, 84, 255, 0.4)',
                    '0 0 30px rgba(0, 196, 255, 0.6)',
                    '0 0 15px rgba(18, 84, 255, 0.4)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>

            {/* Loading Text - Positioned lower for better balance */}
            <div className="mt-12 text-center space-y-3">
              <h2 className="text-xl font-bold text-[#00C4FF]">
                {displayText}
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                >
                  _
                </motion.span>
              </h2>

              {/* Progress Bar - Refined */}
              <div className="w-56 h-1 bg-[#1254FF] bg-opacity-20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#1254FF] to-[#00C4FF]"
                  initial={{ width: '0%' }}
                  animate={{ width: `${Math.max(progress, 10)}%` }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                />
              </div>

              {/* Loading Percentage */}
              <p className="text-sm text-[#00C4FF] font-medium">{Math.round(progress)}%</p>

              {/* Network Type Info */}
              {networkType && (
                <p className="text-xs text-[#8D8D8D] mt-1">{networkType} Connection</p>
              )}

              {/* Status Text */}
              <p className="text-xs text-[#8D8D8D]">Preparing your experience...</p>
            </div>
          </div>

          {/* Corner Accents */}
          <motion.div
            className="absolute top-10 left-10 w-20 h-20 border-2 border-[#1254FF] border-opacity-30"
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute bottom-10 right-10 w-20 h-20 border-2 border-[#00C4FF] border-opacity-30"
            animate={{ rotate: -360 }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
