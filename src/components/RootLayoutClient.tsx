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
    const getNetworkBasedTiming = () => {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      
      if (connection) {
        const effectiveType = connection.effectiveType;
        const downlink = connection.downlink || 0;
        
        // Network-based minimum load times
        if (effectiveType === '4g' || downlink > 5) {
          return { minTime: 500, checkInterval: 150, maxWaitTime: 10000 }; // Fast
        } else if (effectiveType === '3g' || downlink > 2) {
          return { minTime: 1000, checkInterval: 200, maxWaitTime: 15000 }; // Medium
        } else if (effectiveType === '2g' || effectiveType === 'slow-2g' || downlink <= 2) {
          return { minTime: 1500, checkInterval: 300, maxWaitTime: 20000 }; // Slow
        }
      }
      
      // Fallback based on device memory
      const deviceMemory = (navigator as any).deviceMemory;
      if (deviceMemory) {
        if (deviceMemory >= 8) return { minTime: 500, checkInterval: 150, maxWaitTime: 10000 };
        if (deviceMemory >= 4) return { minTime: 1000, checkInterval: 200, maxWaitTime: 15000 };
        return { minTime: 1500, checkInterval: 300, maxWaitTime: 20000 };
      }
      
      return { minTime: 800, checkInterval: 150, maxWaitTime: 10000 };
    };

    // Track asset loading progress in real-time
    const trackAssetLoadingRealtime = (callback: (progress: number) => void) => {
      const images = document.querySelectorAll('img');
      const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
      const scripts = document.querySelectorAll('script[src]');
      
      let loadedImages = 0;
      let totalImages = images.length;
      
      // Quick count for CSS and scripts (usually cached)
      const cssScriptCount = stylesheets.length + scripts.length;
      let processedCssScripts = cssScriptCount;

      // Update progress
      const updateProgress = () => {
        const imageProgress = totalImages > 0 ? (loadedImages / totalImages) * 70 : 70;
        const cssScriptProgress = processedCssScripts > 0 ? 20 : 0;
        const docProgress = document.readyState === 'complete' ? 10 : 0;
        
        const total = Math.min(imageProgress + cssScriptProgress + docProgress, 95);
        callback(Math.round(total));
      };

      if (totalImages === 0) {
        processedCssScripts = 90;
        updateProgress();
      } else {
        // Track individual image loads
        images.forEach((img) => {
          if (img.complete) {
            loadedImages++;
          } else {
            img.addEventListener('load', () => {
              loadedImages++;
              updateProgress();
            }, { once: true });
            img.addEventListener('error', () => {
              loadedImages++;
              updateProgress();
            }, { once: true });
          }
        });
      }

      updateProgress();
    };

    // Check if all critical resources are loaded
    const checkCriticalResourcesLoaded = () => {
      const documentReady = document.readyState === 'complete';
      const images = Array.from(document.querySelectorAll('img'));
      const allImagesLoaded = images.length === 0 || images.every(img => img.complete);
      return documentReady && allImagesLoaded;
    };

    const timing = getNetworkBasedTiming();
    const startTime = Date.now();
    let checkInterval: NodeJS.Timeout | undefined;
    let hidePreloaderCalled = false;

    const hidePreloader = () => {
      if (hidePreloaderCalled) return;
      hidePreloaderCalled = true;
      
      setLoadingProgress(100);
      if (checkInterval) clearInterval(checkInterval);
      
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    };

    const checkAndHidePreloader = () => {
      const elapsedTime = Date.now() - startTime;
      
      // Update progress in real-time
      trackAssetLoadingRealtime((progress) => {
        setLoadingProgress(progress);
      });

      const resourcesLoaded = checkCriticalResourcesLoaded();
      
      // Hide preloader when minimum time passed AND resources loaded, or max wait time exceeded
      if ((resourcesLoaded && elapsedTime >= timing.minTime) || elapsedTime >= timing.maxWaitTime) {
        hidePreloader();
      }
    };

    // Start initial check
    if (document.readyState === 'complete') {
      setTimeout(checkAndHidePreloader, timing.minTime);
    } else {
      // Listen for load event
      const loadHandler = () => {
        checkAndHidePreloader();
        window.removeEventListener('load', loadHandler);
      };
      
      window.addEventListener('load', loadHandler);
      
      // Set timeout as fallback
      setTimeout(checkAndHidePreloader, timing.minTime);
      
      // Start periodic checks
      checkInterval = setInterval(checkAndHidePreloader, timing.checkInterval) as unknown as NodeJS.Timeout;
    }

    return () => {
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
