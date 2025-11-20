'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

import Link from 'next/link';

const projects = [
  {
    id: 1,
    slug: 'move-x-health',
    title: 'Move X Health',
    description: 'A health and fitness platform focused on movement and wellness.',
    image: '/move-x.jpg',
    tags: ['Health', 'Fitness', 'Wellness'],
  },
  {
    id: 2,
    slug: 'feusar',
    title: 'Feusar',
    description: 'A next-gen platform for seamless business operations.',
    image: '/feusar.com.png',
    tags: ['Business', 'Operations', 'Platform'],
  },
  {
    id: 3,
    slug: 'softollyo',
    title: 'Softollyo',
    description: 'Software solutions for modern enterprises.',
    image: '/softollyo.com.jpg',
    tags: ['Software', 'Enterprise', 'Solutions'],
  },
  {
    id: 4,
    slug: 'hello-matlab',
    title: 'Hello Matlab',
    description: 'Matlab learning and collaboration hub.',
    image: '/hello-matlab.jpg',
    tags: ['Matlab', 'Learning', 'Collaboration'],
  },
  {
    id: 5,
    slug: 'elita-mart',
    title: 'Elita Mart',
    description: 'E-commerce platform for premium products.',
    image: '/Elita mart.png',
    tags: ['E-commerce', 'Premium', 'Products'],
  },
  {
    id: 6,
    slug: 'ai-portfolio-platform',
    title: 'AI LLM Platform',
    description: 'Next.js powered portfolio with AI integration.',
    image: '/llm-applications-main.jpg',
    tags: ['Next.js', 'AI', 'LLM'],
  },
];

export function Projects() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

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
          Featured <span className="text-[#00C4FF]">Projects</span>
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {projects.map((project) => (
            <motion.div
              key={project.id}
              variants={itemVariants}
              onMouseEnter={() => setHoveredId(project.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="relative h-64 sm:h-72 md:h-80 cursor-pointer group"
            >
              <motion.div
                animate={{
                  rotateY: hoveredId === project.id ? 180 : 0,
                }}
                transition={{ duration: 0.6 }}
                className="w-full h-full"
                style={{
                  transformStyle: 'preserve-3d',
                  transform:
                    hoveredId === project.id ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
              >
                {/* Front side */}
                <div
                  className="absolute w-full h-full glass rounded-xl p-4 sm:p-6 flex flex-col justify-center items-center"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="w-20 h-20 mb-3 sm:mb-4 relative">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="object-contain rounded-xl border-2 border-[#00C4FF] w-full h-full"
                    />
                  </div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-center text-[#1254FF]">
                    {project.title}
                  </h3>
                </div>

                {/* Back side */}
                <div
                  className="absolute w-full h-full glass rounded-xl p-4 sm:p-6 flex flex-col justify-between"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  <div>
                    <p className="text-sm sm:text-base md:text-lg text-[#8D8D8D] mb-3 sm:mb-4 leading-relaxed">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 sm:px-3 py-1 rounded text-xs sm:text-sm bg-[#1254FF] bg-opacity-20 text-[#00C4FF]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Link
                    href={`/projects/${project.slug}`}
                    className="button-primary w-full mt-3 sm:mt-4 flex justify-center items-center text-sm sm:text-base"
                  >
                    View Project
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

