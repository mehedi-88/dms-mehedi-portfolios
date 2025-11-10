'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { SpiderWebBackground } from '../../components/SpiderWebBackground';

const AIAssistantModal = dynamic(() => import('../../components/AIAssistantModal'), { ssr: false });

export type ProjectDetailProps = {
  title: string;
  logo: string;
  tagline: string;
  description: string;
  role: string;
  achievements: string[];
  technologies: string[];
  previewImage: string;
};

export default function ProjectDetailLayout({
  title,
  logo,
  tagline,
  description,
  role,
  achievements,
  technologies,
  previewImage,
}: ProjectDetailProps) {
  const [aiOpen, setAiOpen] = useState(false);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-12 bg-black relative overflow-hidden">
      {/* Spider Web Background Animation */}
      <SpiderWebBackground />

      {/* Content wrapper with z-index to appear above animation */}
      <div className="relative z-10 w-full flex flex-col items-center">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="w-full max-w-2xl glassmorphism rounded-3xl shadow-2xl p-8 mb-8 flex flex-col items-center border border-[#1254FF] border-opacity-60"
        >
          <div className="w-24 h-24 mb-4 relative drop-shadow-[0_0_20px_#00C4FF]">
            <Image
              src={logo}
              alt={title}
              fill
              className="object-contain rounded-2xl border-4 border-[#00C4FF]"
              sizes="96px"
            />
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-2 text-center tracking-wide drop-shadow-lg">
            {title}
          </h1>
          <p className="text-lg text-[#00C4FF] mb-2 text-center font-semibold italic">
            {tagline}
          </p>
        </motion.div>

        {/* About Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-2xl glassmorphism rounded-2xl shadow-xl p-6 mb-6 border border-[#1254FF] border-opacity-50"
        >
          <h2 className="text-2xl font-bold text-white mb-3">About</h2>
          <p className="text-base text-gray-200 mb-2 leading-relaxed">{description}</p>
        </motion.div>

        {/* Role Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="w-full max-w-2xl glassmorphism rounded-2xl shadow-xl p-6 mb-6 border border-[#1254FF] border-opacity-50"
        >
          <h2 className="text-2xl font-bold text-white mb-3">Role</h2>
          <p className="text-base text-gray-200 mb-2 leading-relaxed">{role}</p>
        </motion.div>

        {/* Achievements & Technologies Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full max-w-2xl glassmorphism rounded-2xl shadow-xl p-6 mb-6 border border-[#1254FF] border-opacity-50"
        >
          <h2 className="text-2xl font-bold text-white mb-4">Key Achievements & Technologies</h2>

          {/* Achievements */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
            {achievements.map((ach, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-[#1254FF]/20 to-[#00C4FF]/10 rounded-lg p-3 text-white font-semibold text-sm text-center shadow-md border border-[#1254FF] border-opacity-30 hover:border-opacity-60 transition-all"
              >
                {ach}
              </div>
            ))}
          </div>

          {/* Technologies */}
          <div className="flex flex-wrap gap-2 justify-center">
            {technologies.map((tech, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-full bg-gradient-to-r from-[#1254FF]/30 to-[#00C4FF]/20 text-white text-xs font-bold border border-[#00C4FF]/40 shadow-md hover:shadow-lg hover:border-[#00C4FF]/70 transition-all"
              >
                {tech}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Preview Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="w-full max-w-2xl glassmorphism rounded-2xl shadow-xl p-6 mb-8 border border-[#1254FF] border-opacity-50 flex flex-col items-center"
        >
          <h2 className="text-2xl font-bold text-white mb-4">Preview</h2>
          <div className="w-full h-56 sm:h-72 md:h-96 relative rounded-xl overflow-hidden border-2 border-[#00C4FF] shadow-lg">
            <Image
              src={previewImage}
              alt={`${title} preview`}
              fill
              className="object-cover"
              sizes="100vw"
            />
          </div>
        </motion.div>

        {/* Call-to-Action & AI Assistant Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="w-full max-w-2xl flex flex-col sm:flex-row justify-center items-center gap-4 mb-8"
        >
          <Link
            href="#"
            className="bg-gradient-to-r from-[#1254FF] to-[#00C4FF] text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-2xl hover:shadow-[#00C4FF]/50 transition-all transform hover:scale-105 active:scale-95"
          >
            View Case Study
          </Link>
          <motion.button
            onClick={() => setAiOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-[#1254FF] to-[#00C4FF] text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-2xl hover:shadow-[#00C4FF]/50 transition-all"
          >
            Ask AI Assistant
          </motion.button>
        </motion.div>

        {/* AI Modal */}
        <AIAssistantModal
          open={aiOpen}
          onClose={() => setAiOpen(false)}
          project={{ title, role, achievements, technologies, description }}
        />
      </div>
    </div>
  );
}
