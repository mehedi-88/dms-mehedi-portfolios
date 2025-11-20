'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

const services = [
  {
    title: 'Digital Marketing Expert',
    description: 'Comprehensive digital marketing strategies including SEO optimization, funnel creation, and paid advertising campaigns to maximize your ROI.',
    icon: '📊',
    features: ['SEO', 'Funnels', 'Paid Ads', 'Analytics', 'Conversion Optimization'],
    color: 'from-[#1254FF] to-[#00C4FF]',
  },
  {
    title: 'Web Development',
    description: 'Modern, scalable web applications built with cutting-edge technologies. Full-stack development with Next.js, React, and Firebase integration.',
    icon: '💻',
    features: ['Next.js', 'React', 'TypeScript', 'Firebase', 'Responsive Design'],
    color: 'from-[#00C4FF] to-[#1254FF]',
  },
  {
    title: 'Shopify Dropshipping Specialist',
    description: 'End-to-end e-commerce solutions with automated workflows, advanced integrations, and optimization for maximum profitability.',
    icon: '🛍️',
    features: ['Store Setup', 'Automation', 'Integrations', 'Optimization', 'Analytics'],
    color: 'from-[#1254FF] via-[#00C4FF] to-[#1254FF]',
  },
];

export function ServicesEnhanced() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

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
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 md:px-8 lg:px-12 max-w-7xl mx-auto">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={containerVariants}
      >
        <motion.h2 variants={itemVariants} className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 text-center">
          Digital <span className="text-[#00C4FF]">Services</span>
        </motion.h2>
        <motion.p
          variants={itemVariants}
          className="text-base sm:text-lg md:text-xl text-center text-[#8D8D8D] mb-8 md:mb-12 max-w-2xl mx-auto leading-relaxed"
        >
          Comprehensive solutions tailored to elevate your digital presence and drive business growth.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              onHoverStart={() => setHoveredIndex(index)}
              onHoverEnd={() => setHoveredIndex(null)}
              className="relative group cursor-pointer"
            >
              {/* Animated Background Glow */}
              <motion.div
                className={`absolute inset-0 rounded-xl bg-gradient-to-r ${service.color} opacity-0 blur-xl`}
                animate={{
                  opacity: hoveredIndex === index ? 0.3 : 0,
                }}
                transition={{ duration: 0.3 }}
              />

              {/* Card Container */}
              <motion.div
                className="glass rounded-xl p-4 sm:p-6 md:p-8 h-full relative z-10 border border-[#1254FF] border-opacity-20"
                animate={{
                  y: hoveredIndex === index ? -10 : 0,
                  borderColor: hoveredIndex === index ? '#00C4FF' : 'rgba(18, 84, 255, 0.2)',
                }}
                transition={{ duration: 0.3 }}
              >
                {/* Icon with Rotation */}
                <motion.div
                  className="text-4xl sm:text-5xl md:text-6xl mb-4 sm:mb-6 inline-block"
                  animate={{
                    rotate: hoveredIndex === index ? 360 : 0,
                    scale: hoveredIndex === index ? 1.2 : 1,
                  }}
                  transition={{ duration: 0.6 }}
                >
                  {service.icon}
                </motion.div>

                {/* Title */}
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 text-[#1254FF] group-hover:text-[#00C4FF] transition-colors">
                  {service.title}
                </h3>

                {/* Description */}
                <p className="text-sm sm:text-base md:text-lg text-[#8D8D8D] mb-4 sm:mb-6 leading-relaxed">
                  {service.description}
                </p>

                {/* Features */}
                <div className="flex flex-wrap gap-2">
                  {service.features.map((feature, idx) => (
                    <motion.span
                      key={idx}
                      className="px-3 py-1 rounded-full text-xs bg-[#1254FF] bg-opacity-20 text-[#00C4FF] border border-[#1254FF] border-opacity-30"
                      animate={{
                        scale: hoveredIndex === index ? 1.1 : 1,
                      }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      {feature}
                    </motion.span>
                  ))}
                </div>

                {/* Hover CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{
                    opacity: hoveredIndex === index ? 1 : 0,
                    y: hoveredIndex === index ? 0 : 10,
                  }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-[#1254FF] border-opacity-20"
                >
                  <button className="text-[#00C4FF] hover:text-white text-sm sm:text-base font-semibold transition-colors">
                    Learn More →
                  </button>
                </motion.div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

