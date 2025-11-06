'use client';

import { HeroEnhanced } from '@/components/HeroEnhanced';
import { ScrollAnimationWrapper } from '@/components/ScrollAnimationWrapper';
import { AboutEnhanced } from '@/components/AboutEnhanced';
import { ServicesEnhanced } from '@/components/ServicesEnhanced';
import { Projects } from '@/components/Projects';
import { Skills } from '@/components/Skills';
import { ContactEnhanced } from '@/components/ContactEnhanced';
import { TestimonialsEnhanced } from '@/components/TestimonialsEnhanced';

export default function Home() {
  // ✅ Removed PreloaderAI - already rendered in RootLayoutClient
  // ✅ Removed Footer - already rendered in RootLayoutClient

  return (
    <>
      <main className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
        <HeroEnhanced />
        <div id="about">
          <ScrollAnimationWrapper>
            <AboutEnhanced />
          </ScrollAnimationWrapper>
        </div>
        <div id="services">
          <ScrollAnimationWrapper>
            <ServicesEnhanced />
          </ScrollAnimationWrapper>
        </div>
        <div id="testimonials">
          <ScrollAnimationWrapper>
            <TestimonialsEnhanced />
          </ScrollAnimationWrapper>
        </div>
        <div id="projects">
          <ScrollAnimationWrapper>
            <Projects />
          </ScrollAnimationWrapper>
        </div>
        <div id="skills">
          <ScrollAnimationWrapper>
            <Skills />
          </ScrollAnimationWrapper>
        </div>
        <div id="contact">
          <ScrollAnimationWrapper>
            <ContactEnhanced />
          </ScrollAnimationWrapper>
        </div>
        <div id="AiTool" className="hidden">
          {/* Hidden section for navigation */}
        </div>
        {/* ✅ Footer and PreloaderAI are rendered in RootLayoutClient */}

      </main>
    </>
  );
}

