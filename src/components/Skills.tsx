'use client';

import React from 'react';
import { motion } from 'framer-motion';

const skillCategories = [

  {
    category: 'Digital Marketing',
    skills: ['SEO', 'SEM', 'SMM', 'Content Marketing', 'Analytics', 'Funnels', 'LM'],

  },
  {
    category: 'E-Commerce',
    skills: ['Shopify', 'WooCommerce', 'Dropshipping', 'Automation', 'Integrations'],
  },
  {
    category: 'Video Editing',
    skills: ['Prmire Pro', 'After Effects', 'Devinci Resolve', 'Cuptut', 'Filmora'],
  },

  {
    category: 'Frontend',
    skills: ['React', 'Next.js', 'TypeScript', 'TailwindCSS', 'Framer Motion'],
  },
  {
    category: 'Backend',
    skills: ['Node.js', 'Firebase', 'PostgreSQL', 'Python'],
  },
  {
    category: 'AI & Tools',
    skills: ['Gemini API', 'OpenAI', 'Claude', 'LangChain', 'Automation'],
  },

];

export function Skills() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 md:px-8 lg:px-12 max-w-7xl mx-auto">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={containerVariants}
      >
        <motion.h2 variants={itemVariants} className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-8 md:mb-12 text-center">
          Skills & <span className="text-[#00C4FF]">Expertise</span>
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {skillCategories.map((category, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="glass rounded-xl p-4 sm:p-6 hover:border-[#00C4FF] transition-all duration-300"
            >
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#1254FF] mb-3 sm:mb-4">{category.category}</h3>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {category.skills.map((skill, idx) => (
                  <motion.span
                    key={idx}
                    whileHover={{ scale: 1.1 }}
                    className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-gradient-to-r from-[#1254FF] to-[#00C4FF] text-white text-xs sm:text-sm font-semibold cursor-pointer transition-all"
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

