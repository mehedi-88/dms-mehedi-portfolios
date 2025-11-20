'use client';

import React from 'react';
import { motion } from 'framer-motion';

const services = [
  {
    title: 'Digital Marketing',
    description: 'SEO optimization, funnel creation, and paid advertising strategies.',
    icon: '📊',
    features: ['SEO', 'Funnels', 'Paid Ads', 'Analytics'],
  },
  {
    title: 'Web Development',
    description: 'Modern, scalable web applications built with Next.js and Firebase.',
    icon: '💻',
    features: ['Next.js', 'Firebase', 'TypeScript', 'Responsive Design'],
  },
  {
    title: 'Shopify Dropshipping',
    description: 'Automated e-commerce solutions with advanced automation and integrations.',
    icon: '🛍️',
    features: ['Store Setup', 'Automation', 'Integrations', 'Optimization'],
  },
];

export function Services() {
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
          Digital <span className="text-[#00C4FF]">Services</span>
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="glass rounded-xl p-8 hover:border-[#00C4FF] transition-all duration-300 hover:scale-105 cursor-pointer group"
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                {service.icon}
              </div>
              <h3 className="heading-3 mb-3 text-[#1254FF]">{service.title}</h3>
              <p className="body-text text-[#8D8D8D] mb-6">{service.description}</p>
              <div className="flex flex-wrap gap-2">
                {service.features.map((feature, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full text-sm bg-[#1254FF] bg-opacity-20 text-[#00C4FF] border border-[#1254FF] border-opacity-30"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

