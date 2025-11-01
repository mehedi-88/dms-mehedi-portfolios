'use client';

import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@/components/ThemeProvider';
import { PreloaderAI } from '@/components/PreloaderAI';
import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';

// ✅ Removed ChatbotWidget - now using ChatbotWidgetSupabase in page.tsx
// This prevents duplicate chatbot rendering and conflicts

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <body className="overflow-x-hidden bg-gradient-to-br from-[#f5f7fa] to-[#d4e4f7] dark:from-black dark:to-[#0a0e27]">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem enableColorScheme>
          <PreloaderAI isLoading={true} />
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
        <PreloaderAI isLoading={isLoading} />
        <Navbar />
        {children}
        <Footer />
        {/* ✅ ChatbotWidgetSupabase is rendered in page.tsx */}
      </ThemeProvider>
    </body>
  );
}
