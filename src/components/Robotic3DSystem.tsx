'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { getModelForPath } from '../../models/config';

// Simple Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode; onError?: () => void },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode; onError?: () => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn('3D System Error:', error, errorInfo);
    this.props.onError?.();
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

// Dynamically import the 3D scene to avoid SSR issues
const Scene3D = dynamic(() => import('./Scene3D'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 -z-10 bg-black flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00C4FF]"></div>
    </div>
  )
});

interface Robotic3DSystemProps {
  children: React.ReactNode;
}

const Robotic3DSystem: React.FC<Robotic3DSystemProps> = ({ children }) => {
  const pathname = usePathname();
  const [currentModel, setCurrentModel] = useState<any>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Update model based on current path
  useEffect(() => {
    const modelConfig = getModelForPath(pathname);
    setCurrentModel(modelConfig);
    setIsLoaded(true);
  }, [pathname]);

  // Handle page transitions
  const handleTransitionStart = () => {
    setIsTransitioning(true);
  };

  const handleTransitionEnd = () => {
    setIsTransitioning(false);
  };

  // Error boundary for 3D system
  const handle3DError = () => {
    setHasError(true);
  };

  return (
    <div className="relative min-h-screen">
      {/* 3D Background Layer - only render if no error */}
      {!hasError && isLoaded && currentModel && (
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 1.5,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
            onAnimationStart={handleTransitionStart}
            onAnimationComplete={handleTransitionEnd}
          >
            <Suspense
              fallback={
                <div className="fixed inset-0 -z-10 bg-gradient-to-br from-black via-[#0f0f23] to-[#1a1a2e] flex items-center justify-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00C4FF]"></div>
                    <p className="text-[#00C4FF] text-sm font-medium">Loading 3D Environment...</p>
                  </div>
                </div>
              }
            >
              <ErrorBoundary fallback={<div />} onError={handle3DError}>
                <Scene3D
                  modelPath={currentModel.path}
                  modelConfig={currentModel}
                  isVisible={!isTransitioning}
                />
              </ErrorBoundary>
            </Suspense>
          </motion.div>
        </AnimatePresence>
      )}

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

      {/* Loading overlay for initial load */}
      <AnimatePresence>
        {!isLoaded && (
          <motion.div
            className="fixed inset-0 z-50 bg-black flex items-center justify-center"
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <div className="text-center">
              <motion.div
                className="w-16 h-16 border-4 border-[#00C4FF] border-t-transparent rounded-full mx-auto mb-4"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <motion.h2
                className="text-2xl font-bold text-[#00C4FF] mb-2"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                DMS MEHEDI
              </motion.h2>
              <p className="text-gray-400">Initializing 3D Environment...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Robotic3DSystem;