'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface Robotic3DSystemProps {
  children: React.ReactNode;
}

const Robotic3DSystem: React.FC<Robotic3DSystemProps> = ({ children }) => {
  return (
    <div className="relative min-h-screen">
      {/* Content Layer */}
      <motion.div
        className="relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.8,
          delay: 0.5,
          ease: [0.25, 0.46, 0.45, 0.94]
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default Robotic3DSystem;