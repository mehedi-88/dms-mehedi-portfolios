'use client';

import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@/components/ThemeProvider';
import { PreloaderAI } from '@/components/PreloaderAI';
import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import { ChatbotWidgetSupabase } from '@/components/ChatbotWidgetSupabase';
import Robotic3DSystem from '@/components/Robotic3DSystem';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    
    // Detect network speed and set appropriate minimum load time
    const getMinLoadTimeBasedOnSpeed = (): number => {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      
      if (connection && connection.effectiveType) {
        const effectiveType = connection.effectiveType;
        
        // Network-based minimum load times
        switch (effectiveType) {
          case '4g':
            return 500; // Fast: 0.5-1s
          case '3g':
            return 1500; // Medium: 1.5-2s
          case '2g':
            return 3000; // Slow: 3s
          case 'slow-2g':
            return 3000; // Very slow: 3s
          default:
            return 1000; // Default: 1s
        }
      }
      
      // Fallback: Check device memory
      const deviceMemory = (navigator as any).deviceMemory;
      if (deviceMemory) {
        if (deviceMemory >= 8) return 500;
        if (deviceMemory >= 4) return 1000;
        return 1500;
      }
      
      return 1000; // Final fallback
    };

    // Track asset loading progress
    const trackAssetLoading = () => {
      let loadedAssets = 0;
      let totalAssets = 0;

      // Count images
      const images = document.querySelectorAll('img');
      totalAssets += images.length;

      images.forEach((img) => {
        if (img.complete) {
          loadedAssets++;
        } else {
          img.addEventListener('load', () => {
            loadedAssets++;
            updateProgress();
          });
          img.addEventListener('error', () => {
            loadedAssets++;
            updateProgress();
          });
        }
      });

      // Count stylesheets
      const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
      totalAssets += stylesheets.length;
      stylesheets.forEach(() => loadedAssets++); // CSS is typically loaded by now

      // Count scripts
      const scripts = document.querySelectorAll('script[src]');
      totalAssets += scripts.length;
      scripts.forEach(() => loadedAssets++); // Scripts are loaded by now

      const updateProgress = () => {
        const progress = totalAssets > 0 ? (loadedAssets / totalAssets) * 100 : 100;
        setLoadingProgress(Math.min(progress, 100));
      };

      updateProgress();
      return totalAssets > 0 ? (loadedAssets / totalAssets) >= 1 : true;
    };

    // Check if all critical resources are loaded
    const checkCriticalResourcesLoaded = () => {
      // Check document ready state
      const documentReady = document.readyState === 'complete';
      
      // Check if all images are loaded
      const images = Array.from(document.querySelectorAll('img'));
      const allImagesLoaded = images.length === 0 || images.every(img => img.complete);
      
      return documentReady && allImagesLoaded;
    };

    const minLoadTime = getMinLoadTimeBasedOnSpeed();
    const startTime = Date.now();
    let checkInterval: NodeJS.Timeout;

    const checkAndHidePreloader = () => {
      const elapsedTime = Date.now() - startTime;
      const resourcesLoaded = checkCriticalResourcesLoaded();
      trackAssetLoading();

      // Hide preloader when:
      // 1. Minimum time has passed AND
      // 2. All critical resources are loaded
      if (resourcesLoaded && elapsedTime >= minLoadTime) {
        setLoadingProgress(100);
        setTimeout(() => setIsLoading(false), 300);
        if (checkInterval) clearInterval(checkInterval);
      }
    };

    // For slow connections, keep checking until assets load
    if (minLoadTime >= 3000) {
      checkInterval = setInterval(checkAndHidePreloader, 200);
    }

    // Initial check
    if (document.readyState === 'complete') {
      trackAssetLoading();
      setTimeout(() => {
        setLoadingProgress(100);
        setIsLoading(false);
      }, minLoadTime);
    } else {
      // Listen for load event
      window.addEventListener('load', () => {
        trackAssetLoading();
        checkAndHidePreloader();
      });
      
      // Also set a timeout as backup
      setTimeout(checkAndHidePreloader, minLoadTime);
      
      // Start periodic checks
      checkInterval = setInterval(checkAndHidePreloader, 100);
    }

    return () => {
      window.removeEventListener('load', checkAndHidePreloader);
      if (checkInterval) clearInterval(checkInterval);
    };
  }, []);

  // Show brief preloader on route change
  useEffect(() => {
    if (!mounted) return;
    
    setIsLoading(true);
    setLoadingProgress(0);
    
    const timer = setTimeout(() => {
      setLoadingProgress(100);
      setTimeout(() => setIsLoading(false), 200);
    }, 400);

    return () => clearTimeout(timer);
  }, [pathname, mounted]);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <body className="overflow-x-hidden bg-gradient-to-br from-[#f5f7fa] to-[#d4e4f7] dark:from-black dark:to-[#0a0e27]">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem enableColorScheme>
          <PreloaderAI isLoading={true} progress={loadingProgress} />
        </ThemeProvider>
      </body>
    );
  }

  return (
    <body className="overflow-x-hidden bg-gradient-to-br from-white via-slate-50 to-blue-50 dark:from-black dark:to-[#0a0e27] transition-colors duration-300">
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        enableColorScheme
        disableTransitionOnChange={false}
      >
        <Robotic3DSystem>
          <PreloaderAI isLoading={isLoading} progress={loadingProgress} />
          
          <AnimatePresence mode="wait">
            {!isLoading && (
              <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Navbar />
                {children}
                <Footer />
                <ChatbotWidgetSupabase />
              </motion.div>
            )}
          </AnimatePresence>
        </Robotic3DSystem>
      </ThemeProvider>
    </body>
  );
}
