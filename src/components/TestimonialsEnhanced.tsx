'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';

// --- TYPE DEFINITION ---
type Testimonial = {
  name: string;
  role: string;
  text: string;
  rating: number;
};

const testimonials: Testimonial[] = [
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
    text: "The best developer I've worked with. Professional, reliable, and incredibly talented.",
    rating: 5,
  },
  {
    name: 'Lucas Gray',
    role: 'Store Owner',
    text: 'They built a high-converting, one-product store for me. The design was clean, persuasive, and perfectly optimized for mobile. The store is a true sales machine.',
    rating: 5,
  },
  {
    name: 'Amanda Black',
    role: 'Corporate Comms',
    text: 'They built a blazingly fast, custom Next.js website for our corporate brand. The headless CMS they integrated is incredibly easy for our marketing team to use.',
    rating: 5,
  },
  {
    name: 'Robert Baker',
    role: 'Operations Manager',
    text: 'Our old website was slow, outdated, and not mobile-friendly. They did a complete redesign and rebuild. Our Core Web Vitals are now in the green.',
    rating: 5,
  },
  {
    name: 'Jessica Lee',
    role: 'Startup Founder',
    text: 'As a startup, we needed an MVP built quickly. They took our concept and turned it into a functional, scalable web application in record time.',
    rating: 5,
  },
  {
    name: 'William Green',
    role: 'E-commerce Director',
    text: "We needed a complex e-commerce solution with custom features that Shopify couldn't handle. They built a robust, secure platform from the ground up.",
    rating: 5,
  },
  {
    name: 'Eva Peron',
    role: 'Artist & Designer',
    text: "I'm an artist and needed a stunning, minimalist portfolio to showcase my work. They created a beautiful, responsive gallery site that perfectly captures my brand.",
    rating: 5,
  },
];

// --- PROP TYPES FOR MARQUEE ---
interface MarqueeRowProps {
  testimonials: Testimonial[];
  direction: 'left' | 'right';
  itemVariants: Variants;
}

// --- MARQUEE ROW COMPONENT ---
const MarqueeRow: React.FC<MarqueeRowProps> = ({
  testimonials,
  direction,
  itemVariants,
}) => {
  const duplicatedTestimonials = [...testimonials, ...testimonials];
  const duration = testimonials.length * 20;

  return (
    <motion.div
      variants={itemVariants}
      // Gradient mask for side fade animation
      className="flex w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent_0%,_black_10%,_black_90%,_transparent_100%)]"
    >
      <motion.div
        className="flex flex-row flex-nowrap"
        animate={{
          x: direction === 'left' ? ['0%', '-100%'] : ['-100%', '0%'],
        }}
        transition={{
          x: {
            repeat: Infinity,
            duration: duration,
            ease: 'linear',
          },
        }}
      >
        {duplicatedTestimonials.map((testimonial, index) => (
          <div
            key={index}
            // 3 cards on mobile (w-1/3), 4 on tablet (md:w-1/4), 5 on desktop (lg:w-1/5)
            className="flex-shrink-0 w-1/3 md:w-1/4 lg:w-1/5 p-2 md:p-3"
          >
            <motion.div
              // Small padding for small boxes
              className="glass rounded-xl p-3 sm:p-4 md:p-5 border border-[#1254FF] border-opacity-20 h-full"
              whileHover={{
                borderColor: '#00C4FF',
                boxShadow: '0 0 30px rgba(0, 196, 255, 0.3)',
              }}
            >
              {/* Star Rating */}
              <div className="flex gap-1 mb-2 md:mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-[#00C4FF] text-sm">
                    ★
                  </span>
                ))}
              </div>

              {/* Testimonial Text */}
              {/* Small font size for mobile */}
              <p className="text-xs sm:text-sm md:text-base text-[#8D8D8D] mb-3 md:mb-4 italic leading-relaxed">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div>
                {/* Small font size for mobile */}
                <p className="text-[#00C4FF] font-semibold text-xs sm:text-sm">
                  {testimonial.name}
                </p>
                <p className="text-[#8D8D8D] text-xs">
                  {testimonial.role}
                </p>
              </div>
            </motion.div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
};

// --- MAIN TESTIMONIALS COMPONENT ---
export function TestimonialsEnhanced() {
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
      transition: { duration: 0.8 },
    },
  };

  // --- DATA SPLITS ---

  // Desktop Split (2 rows)
  const desktopSplitIndex = Math.ceil(testimonials.length / 2);
  const desktopRow1 = testimonials.slice(0, desktopSplitIndex); // Has 6 items
  const desktopRow2 = testimonials.slice(desktopSplitIndex); // Has 5 items

  // Mobile Split (3 rows)
  const mobileRow1 = testimonials.slice(0, 4); // Has 4 items
  const mobileRow2 = testimonials.slice(4, 8); // Has 4 items
  const mobileRow3 = testimonials.slice(8); // Has 3 items

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 md:px-8 lg:px-12 max-w-7xl mx-auto overflow-hidden">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={containerVariants}
      >
        <motion.h2
          variants={itemVariants}
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 text-center"
        >
          Client <span className="text-[#00C4FF]">Testimonials</span>
        </motion.h2>
        <motion.p
          variants={itemVariants}
          className="text-base sm:text-lg md:text-xl text-center text-[#8D8D8D] mb-8 md:mb-12 max-w-2xl mx-auto leading-relaxed"
        >
          Hear from clients who have experienced the impact of our services.
        </motion.p>
        
        {/* --- RENDER LOGIC --- */}
        <div className="flex flex-col -mx-2 md:-mx-3">
          
          {/* --- DESKTOP VIEW (2 ROWS) --- */}
          {/* 'hidden md:flex' = Hides on mobile, shows on desktop */}
          <div className="hidden md:flex flex-col gap-4 md:gap-6">
            {/* Row 1 - Scrolls Right */}
            <MarqueeRow
              testimonials={desktopRow2}
              direction="right"
              itemVariants={itemVariants}
            />
            {/* Row 2 - Scrolls Left */}
            <MarqueeRow
              testimonials={desktopRow2}
              direction="left"
              itemVariants={itemVariants}
            />
          </div>

          {/* --- MOBILE VIEW (3 ROWS) --- */}
          {/* 'flex md:hidden' = Shows on mobile, hides on desktop */}
          <div className="flex md:hidden flex-col gap-4">
            {/* Row 1 - Scrolls Left */}
            <MarqueeRow
              testimonials={mobileRow3}
              direction="left"
              itemVariants={itemVariants}
            />
            {/* Row 2 - Scrolls Right */}
            <MarqueeRow
              testimonials={mobileRow3}
              direction="right"
              itemVariants={itemVariants}
            />
            {/* Row 3 - Scrolls Left */}
            <MarqueeRow
              testimonials={mobileRow3}
              direction="left"
              itemVariants={itemVariants}
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}