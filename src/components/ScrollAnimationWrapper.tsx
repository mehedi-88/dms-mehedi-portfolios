'use client';

import { motion } from 'framer-motion';
import React from 'react';

interface ScrollAnimationWrapperProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

const variants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0 },
};

export function ScrollAnimationWrapper({ children, delay = 0, className = '' }: ScrollAnimationWrapperProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay: delay }}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}
