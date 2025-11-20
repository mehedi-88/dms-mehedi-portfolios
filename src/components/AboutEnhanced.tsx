'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { ABOUT_SECTION_CONTENT, PROFILE_IMAGES } from '@/lib/assets';
const handleDownload = () => {
  // Create an anchor link in memory
  const link = document.createElement('a');
  link.href = '/DMS-MEHEDI-CV.pdf';
  link.download = 'DMS-MEHEDI-CV.pdf';
  
  // Append to the document, click, and then remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export function AboutEnhanced() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-br from-white via-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="space-y-8 md:space-y-12"
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className="text-center space-y-3 md:space-y-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#1254FF] to-[#00C4FF] bg-clip-text text-transparent">
              {ABOUT_SECTION_CONTENT.title}
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted font-medium">
              {ABOUT_SECTION_CONTENT.subtitle}
            </p>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
            {/* Left Side: Profile Image with Modern Square Frame */}
            <motion.div
              variants={itemVariants}
              className="flex justify-center items-center"
            >
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-96 lg:h-96 group">
                {/* Modern Square Glow Background - Rotating */}
                <motion.div
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background: 'conic-gradient(from 0deg, #1254FF, #00C4FF, #1254FF)',
                    filter: 'blur(40px)',
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                />

                {/* Secondary Glow Layer */}
                <motion.div
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background: 'linear-gradient(45deg, #00C4FF, #1254FF, #00C4FF)',
                    filter: 'blur(25px)',
                    opacity: 0.8,
                  }}
                  animate={{
                    opacity: [0.8, 1, 0.8],
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                />

                {/* Pulse Border Effect */}
                <motion.div
                  className="absolute inset-0 rounded-2xl border-2 border-[#00C4FF]"
                  animate={{
                    boxShadow: [
                      '0 0 25px rgba(0, 196, 255, 0.5)',
                      '0 0 50px rgba(18, 84, 255, 0.9)',
                      '0 0 25px rgba(0, 196, 255, 0.5)',
                    ],
                  }}
                  transition={{ duration: 3.5, repeat: Infinity }}
                />

                {/* Profile Image Container */}
                <motion.div
                  className="absolute inset-4 rounded-xl overflow-hidden border-2 border-white/20 bg-gradient-to-br from-[#1254FF]/10 to-[#00C4FF]/10 backdrop-blur-sm flex items-center justify-center"
                  whileHover={{
                    scale: 1.02,
                    boxShadow: '0 0 35px rgba(0, 196, 255, 0.7)'
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <Image
                    src={PROFILE_IMAGES.secondary.src}
                    alt={PROFILE_IMAGES.secondary.alt}
                    width={320}
                    height={320}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </motion.div>

                {/* Corner Accents */}
                <div className="absolute top-3 left-3 w-5 h-5 border-l-2 border-t-2 border-[#00C4FF] rounded-tl-lg"></div>
                <div className="absolute top-3 right-3 w-5 h-5 border-r-2 border-t-2 border-[#1254FF] rounded-tr-lg"></div>
                <div className="absolute bottom-3 left-3 w-5 h-5 border-l-2 border-b-2 border-[#1254FF] rounded-bl-lg"></div>
                <div className="absolute bottom-3 right-3 w-5 h-5 border-r-2 border-b-2 border-[#00C4FF] rounded-br-lg"></div>
              </div>
            </motion.div>

            {/* Right Side: About Content */}
            <motion.div variants={itemVariants} className="space-y-6">
              <div className="space-y-4">
                {ABOUT_SECTION_CONTENT.description.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className="body-text text-muted">
                    {paragraph}
                  </p>
                ))}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-primary">Key Expertise</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ABOUT_SECTION_CONTENT.skills.map((skill, idx) => (
                    <motion.div
                      key={idx}
                      className="px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-sm sm:text-base font-medium dark:bg-[#00C4FF] dark:bg-opacity-20 dark:border-[#00C4FF] dark:border-opacity-30 dark:text-[#00C4FF] text-center"
                      whileHover={{ scale: 1.05 }}
                    >
                      {skill}
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-primary">Experience</h3>
                <div className="space-y-3">
                  {ABOUT_SECTION_CONTENT.experience.map((exp, idx) => (
                    <motion.div
                      key={idx}
                      className="p-3 sm:p-4 rounded-lg bg-white/80 border border-slate-200 shadow-sm dark:bg-gray-800/50 dark:border-[#1254FF]/20"
                      whileHover={{ scale: 1.02 }}
                    >
                      <h4 className="font-semibold text-secondary text-sm sm:text-base">{exp.title}</h4>
                      <p className="text-xs sm:text-sm text-muted">{exp.company} • {exp.period}</p>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-300 mt-1">{exp.description}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-primary">Key Achievements</h3>
                <ul className="space-y-2 sm:space-y-3">
                  {ABOUT_SECTION_CONTENT.achievements.map((achievement, idx) => (
                    <motion.li
                      key={idx}
                      className="flex items-start gap-2 sm:gap-3 text-muted text-sm sm:text-base"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <span className="text-secondary mt-1 flex-shrink-0">✓</span>
                      <span>{achievement}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              <motion.button
  onClick={handleDownload}
  className="button-primary w-full sm:w-auto mt-10 sm:mt-12"
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Download My Resume
</motion.button>
            </motion.div>
          </div>
        
        </motion.div>
      </div>
    </section>
  );
}

export default AboutEnhanced;