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
    <section className="py-20 px-4 md:px-8 max-w-6xl mx-auto">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={containerVariants}
      >
        <motion.h2 variants={itemVariants} className="heading-2 mb-12 text-center">
          Skills & <span className="text-[#00C4FF]">Expertise</span>
        </motion.h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {skillCategories.map((category, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="glass rounded-xl p-6 hover:border-[#00C4FF] transition-all duration-300"
            >
              <h3 className="heading-3 text-[#1254FF] mb-4">{category.category}</h3>
              <div className="flex flex-wrap gap-2">
                {category.skills.map((skill, idx) => (
                  <motion.span
                    key={idx}
                    whileHover={{ scale: 1.1 }}
                    className="px-3 py-2 rounded-lg bg-gradient-to-r from-[#1254FF] to-[#00C4FF] text-white text-sm font-semibold cursor-pointer transition-all"
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

