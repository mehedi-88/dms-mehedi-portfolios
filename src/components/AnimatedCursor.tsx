'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const AnimatedCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [cursorVariant, setCursorVariant] = useState('default');

  useEffect(() => {
    const mouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      });
    };

    window.addEventListener('mousemove', mouseMove);

    return () => {
      window.removeEventListener('mousemove', mouseMove);
    };
  }, []);

  const variants = {
    default: {
      x: mousePosition.x - 8,
      y: mousePosition.y - 8,
      height: 16,
      width: 16,
      backgroundColor: 'rgba(18, 84, 255, 0.7)',
      mixBlendMode: 'normal',
    },
    text: {
      x: mousePosition.x - 20,
      y: mousePosition.y - 20,
      height: 40,
      width: 40,
      backgroundColor: 'rgba(0, 196, 255, 0.08)',
      mixBlendMode: 'normal',
      border: '2px solid #00C4FF',
    },
  };

  const textEnter = () => setCursorVariant('text');
  const textLeave = () => setCursorVariant('default');

  // Effect to handle hover state on interactive elements
  useEffect(() => {
    const elements = document.querySelectorAll('a, button, input, textarea, select');
    elements.forEach(el => {
      el.addEventListener('mouseenter', textEnter);
      el.addEventListener('mouseleave', textLeave);
    });

    return () => {
      elements.forEach(el => {
        el.removeEventListener('mouseenter', textEnter);
        el.removeEventListener('mouseleave', textLeave);
      });
    };
  }, []);

  return (
    <>
      {/* Main Cursor Core */}
      <motion.div
        className="fixed top-0 left-0 rounded-full pointer-events-none z-[9999]"
        variants={variants}
        animate={cursorVariant}
        transition={{
          type: 'spring',
          mass: 0.5,
          stiffness: 600,
          damping: 35,
        }}
        style={{
          filter: 'blur(0px)',
          boxShadow: cursorVariant === 'default' 
            ? '0 0 20px rgba(18, 84, 255, 0.6), 0 0 40px rgba(0, 196, 255, 0.3)' 
            : '0 0 30px rgba(0, 196, 255, 0.8), 0 0 60px rgba(18, 84, 255, 0.4)',
        }}
      />
      
      {/* Glow Trail Effect */}
      <motion.div
        className="fixed top-0 left-0 rounded-full pointer-events-none z-[9998]"
        animate={{
          x: mousePosition.x - 4,
          y: mousePosition.y - 4,
        }}
        transition={{
          type: 'spring',
          mass: 0.3,
          stiffness: 400,
          damping: 50,
        }}
        style={{
          width: 8,
          height: 8,
          background: 'radial-gradient(circle, rgba(0, 196, 255, 0.6), transparent)',
          filter: 'blur(8px)',
        }}
      />
      
      {/* Outer Pulse Ring */}
      <motion.div
        className="fixed top-0 left-0 rounded-full pointer-events-none z-[9997] border-2 border-blue-500/30"
        animate={{
          x: mousePosition.x - 12,
          y: mousePosition.y - 12,
          scale: [1, 1.5, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          width: 24,
          height: 24,
          filter: 'blur(4px)',
        }}
      />
      
      {/* Global style to hide default cursor */}
      <style jsx global>{`
        body {
          cursor: none;
        }
        
        @media (max-width: 768px) {
          body {
            cursor: auto !important;
          }
        }
      `}</style>
    </>
  );
};

export default AnimatedCursor;

