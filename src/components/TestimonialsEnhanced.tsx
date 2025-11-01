'use client';

import React from 'react';
import { motion } from 'framer-motion';

const testimonials = [
  {
    name: 'John Smith',
    role: 'CEO, Tech Startup',
    text: 'DMS helped us scale our business from 0 to 6 figures in just 6 months with his digital marketing expertise.',
    rating: 5,
  },
  {
    name: 'Sarah Johnson',
    role: 'E-commerce Manager',
    text: 'The Shopify automation solutions transformed our store operations. Highly recommended!',
    rating: 5,
  },
  {
    name: 'Mike Chen',
    role: 'Product Manager',
    text: 'Exceptional web development skills. DMS delivered our project ahead of schedule with outstanding quality.',
    rating: 5,
  },
  {
    name: 'Emily Davis',
    role: 'Marketing Director',
    text: 'Working with DMS was a game-changer for our digital marketing strategy. Results exceeded expectations.',
    rating: 5,
  },
  {
    name: 'Alex Rodriguez',
    role: 'Founder, Digital Agency',
    text: 'The best developer I\'ve worked with. Professional, reliable, and incredibly talented.',
    rating: 5,
  },
];

export function TestimonialsEnhanced() {
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

  // Split testimonials into two rows for alternating animation
  const firstRow = testimonials.slice(0, Math.ceil(testimonials.length / 2));
  const secondRow = testimonials.slice(Math.ceil(testimonials.length / 2));

  return (
    <section className="py-20 px-4 md:px-8 max-w-6xl mx-auto overflow-hidden">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={containerVariants}
      >
        <motion.h2 variants={itemVariants} className="heading-2 mb-4 text-center">
          Client <span className="text-[#00C4FF]">Testimonials</span>
        </motion.h2>
        <motion.p
          variants={itemVariants}
          className="body-text text-center text-[#8D8D8D] mb-12 max-w-2xl mx-auto"
        >
          Hear from clients who have experienced the impact of our services.
        </motion.p>

        {/* First Row - Scrolling Right to Left */}
        <div className="mb-8 overflow-hidden">
          <motion.div
            className="flex gap-6"
            animate={{ x: ['0%', '-100%'] }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            {[...firstRow, ...firstRow].map((testimonial, index) => (
              <motion.div
                key={index}
                className="flex-shrink-0 w-96 glass rounded-xl p-8 border border-[#1254FF] border-opacity-20"
                whileHover={{
                  borderColor: '#00C4FF',
                  boxShadow: '0 0 30px rgba(0, 196, 255, 0.3)',
                }}
              >
                {/* Star Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-[#00C4FF]">
                      ★
                    </span>
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="body-text text-[#8D8D8D] mb-6 italic">
                  "{testimonial.text}"
                </p>

                {/* Author */}
                <div>
                  <p className="text-[#00C4FF] font-semibold">{testimonial.name}</p>
                  <p className="text-[#8D8D8D] text-sm">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Second Row - Scrolling Left to Right */}
        <div className="overflow-hidden">
          <motion.div
            className="flex gap-6"
            animate={{ x: ['-100%', '0%'] }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            {[...secondRow, ...secondRow].map((testimonial, index) => (
              <motion.div
                key={index}
                className="flex-shrink-0 w-96 glass rounded-xl p-8 border border-[#1254FF] border-opacity-20"
                whileHover={{
                  borderColor: '#00C4FF',
                  boxShadow: '0 0 30px rgba(0, 196, 255, 0.3)',
                }}
              >
                {/* Star Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-[#00C4FF]">
                      ★
                    </span>
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="body-text text-[#8D8D8D] mb-6 italic">
                  "{testimonial.text}"
                </p>

                {/* Author */}
                <div>
                  <p className="text-[#00C4FF] font-semibold">{testimonial.name}</p>
                  <p className="text-[#8D8D8D] text-sm">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

