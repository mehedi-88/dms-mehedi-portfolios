'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ThemeProvider } from '@/components/ThemeProvider';
import { PreloaderAI } from '@/components/PreloaderAI';
import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import { ChatbotWidgetSupabase } from '@/components/ChatbotWidgetSupabase';
import Robotic3DSystem from '@/components/Robotic3DSystem';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const pathname = usePathname();
  const previousPathname = useRef(pathname);

  // Main preloader effect - runs on every page load and navigation
  useEffect(() => {
    // Check if pathname changed (navigation occurred)
    const isNavigation = previousPathname.current !== pathname;
    
    if (isNavigation) {
      // Reset preloader for new page
      setIsLoading(true);
      setLoadingProgress(0);
      previousPathname.current = pathname;
    }

    // Detect network speed and set appropriate loading time
    const getNetworkBasedTiming = () => {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      
      if (connection) {
        const effectiveType = connection.effectiveType;
        const downlink = connection.downlink || 0;
        
        // Network-based loading times
        if (effectiveType === '4g' || downlink > 5) {
          return 1500; // Fast - 1.5 seconds
        } else if (effectiveType === '3g' || downlink > 2) {
          return 2500; // Medium - 2.5 seconds
        } else if (effectiveType === '2g' || effectiveType === 'slow-2g' || downlink <= 2) {
          return 4000; // Slow - 4 seconds
        }
      }
      
      // Fallback based on device memory
      const deviceMemory = (navigator as any).deviceMemory;
      if (deviceMemory) {
        if (deviceMemory >= 8) return 1500; // High memory - fast
        if (deviceMemory >= 4) return 2500; // Medium memory
        return 3500; // Low memory - slower
      }
      
      return 3000; // Default - 3 seconds
    };

    const duration = getNetworkBasedTiming();
    const startTime = Date.now();
    
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / duration) * 100, 95);
      setLoadingProgress(Math.round(progress));
      
      if (elapsed >= duration) {
        clearInterval(progressInterval);
        setLoadingProgress(100);
        setTimeout(() => {
          setIsLoading(false);
        }, 300);
      }
    }, 30);

    return () => {
      clearInterval(progressInterval);
    };
  }, [pathname]);

  return (
    <body className="overflow-x-hidden bg-black">
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        enableColorScheme
        disableTransitionOnChange={false}
      >
        <Robotic3DSystem>
          {/* Always render preloader */}
          <PreloaderAI isLoading={isLoading} progress={loadingProgress} />
          
          {/* Content with smooth transition */}
          {!isLoading && (
            <motion.div
              key={pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Navbar />
              {children}
              <Footer />
              <ChatbotWidgetSupabase />
            </motion.div>
          )}
        </Robotic3DSystem>
      </ThemeProvider>
    </body>
  );
}
