'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function About() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
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
          About <span className="text-[#00C4FF]">Me</span>
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Image Placeholder with Float/Pulse Animation */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, delay: 0.5 }}
            className="w-full h-80 rounded-xl flex items-center justify-center p-4 order-1 md:order-2"
          >
            <motion.div
              animate={{
                y: [0, -10, 0],
                boxShadow: [
                  '0 0 20px rgba(0, 196, 255, 0.5)',
                  '0 0 30px rgba(0, 196, 255, 0.8)',
                  '0 0 20px rgba(0, 196, 255, 0.5)',
                ],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="w-64 h-64 rounded-full border-4 border-[#1254FF] shadow-xl flex items-center justify-center overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #1254FF, #00C4FF)',
              }}
            >
              <span className="text-3xl text-white font-bold">Your Photo</span>
            </motion.div>
          </motion.div>
          <motion.div variants={itemVariants} className="glass rounded-xl p-8 order-2 md:order-1">
            <p className="body-text text-[#8D8D8D] mb-6">
              I'm a futuristic-minded developer and digital strategist with a passion for
              creating cutting-edge web experiences. With expertise in Next.js, Firebase, and
              AI integration, I build scalable solutions that push the boundaries of what's
              possible on the web.
            </p>
            <p className="body-text text-[#8D8D8D] mb-6">
              My journey spans digital marketing, web development, and automation. I believe
              in the power of AI to transform businesses and create meaningful digital
              experiences.
            </p>
            <p className="body-text text-[#8D8D8D]">
              When I'm not coding, you'll find me exploring new technologies, creating content,
              or strategizing the next big digital transformation.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-4 order-3">
            <div className="glass rounded-lg p-6 hover:border-[#00C4FF] transition-colors">
              <h3 className="heading-3 text-[#1254FF] mb-2">🚀 Innovation</h3>
              <p className="text-[#8D8D8D]">
                Pushing boundaries with cutting-edge technologies and creative solutions.
              </p>
            </div>
            <div className="glass rounded-lg p-6 hover:border-[#00C4FF] transition-colors">
              <h3 className="heading-3 text-[#1254FF] mb-2">🎯 Strategy</h3>
              <p className="text-[#8D8D8D]">
                Data-driven approach to digital marketing and business growth.
              </p>
            </div>
            <div className="glass rounded-lg p-6 hover:border-[#00C4FF] transition-colors">
              <h3 className="heading-3 text-[#1254FF] mb-2">⚡ Performance</h3>
              <p className="text-[#8D8D8D]">
                Building fast, scalable, and responsive web applications.
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

