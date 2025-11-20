'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function Footer() {
  const year = new Date().getFullYear();

  const footerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, delay: 0.2 },
    },
  };

  const linkVariants = {
    hover: { scale: 1.05, color: '#00C4FF' },
    tap: { scale: 0.95 },
  };

  return (
    <motion.footer
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
      variants={footerVariants}
      className="glass-dark border-t border-[#1254FF] border-opacity-30 mt-20"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start space-y-8 md:space-y-0">
          {/* Google Map Embed */}
          <motion.div
            className="w-full md:w-1/3 h-48 rounded-xl overflow-hidden border border-[#00C4FF] shadow-lg shadow-[#00C4FF]/30"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, amount: 0.5 }}
          >
            {/* Placeholder for Google Map - Replace with actual embed code */}
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3664.0446892632667!2d90.7065781!3d23.314137300000002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3754f9296745f905%3A0xd1eadd36936ba411!2sDMS%20Mehedi!5e0!3m2!1sen!2sbd!4v1761998733692!5m2!1sen!2sbd"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Location Map"
            ></iframe>
          </motion.div>

          {/* Navigation Links */}
          <div className="flex flex-col gap-4 text-sm font-medium">
            <h3 className="text-xl font-bold text-[#1254FF] mb-2">Quick Links</h3>
            <motion.a
              href="#about"
              variants={linkVariants}
              whileHover="hover"
              whileTap="tap"
              className="text-white hover:text-[#00C4FF] transition-colors"
            >
              About
            </motion.a>
            <motion.a
              href="#services"
              variants={linkVariants}
              whileHover="hover"
              whileTap="tap"
              className="text-white hover:text-[#00C4FF] transition-colors"
            >
              Services
            </motion.a>
            <motion.a
              href="#projects"
              variants={linkVariants}
              whileHover="hover"
              whileTap="tap"
              className="text-white hover:text-[#00C4FF] transition-colors"
            >
              Projects
            </motion.a>
            <motion.a
              href="#contact"
              variants={linkVariants}
              whileHover="hover"
              whileTap="tap"
              className="text-white hover:text-[#00C4FF] transition-colors"
            >
              Contact
            </motion.a>
            <motion.a
              href="/dms-ai-powered"
              variants={linkVariants}
              whileHover="hover"
              whileTap="tap"
              className="text-white hover:text-[#00C4FF] transition-colors"
            >
              AI Tools
            </motion.a>
            <motion.a
              href="/faq"
              variants={linkVariants}
              whileHover="hover"
              whileTap="tap"
              className="text-white hover:text-[#00C4FF] transition-colors"
            >
              FAQ
            </motion.a>
          </div>

          {/* Copyright and Social Links */}
          <div className="flex flex-col gap-4 text-center md:text-left">
            <h3 className="text-xl font-bold text-[#1254FF] mb-2">DMS Mehedi</h3>
            <p className="text-sm text-[#8D8D8D]">
              &copy; {year} AI-Powered Digital Marketer. All rights reserved.
            </p>
            <div className="flex justify-center md:justify-start gap-4 mt-2">
              {/* Social Icons - Reusing the ones from Contact.tsx for consistency */}
              <motion.a
                href="https://www.linkedin.com/in/dms-mehedi-digital-marketing-expert-bangladesh/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#8D8D8D] hover:text-[#00C4FF] transition-colors"
                variants={linkVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.529-4 0v5.604h-3v-11h3v1.765c1.395-2.53 4-2.765 4-2.765s.235-1.135 0-1.765c-.235-.63-.783-.804-1.75-1.04v-.765c1.176 0 2.824.706 3.53 1.765.706 1.06 1.04 2.53 1.04 4.004v6.996z" />
                </svg>
              </motion.a>
              <motion.a
                href="https://github.com/mehedi-88"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#8D8D8D] hover:text-[#00C4FF] transition-colors"
                variants={linkVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.835 2.809 1.305 3.493.998.108-.776.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.046.138 3.003.404 2.292-1.552 3.301-1.23 3.301-1.23.653 1.653.242 2.874.118 3.176.766.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.923.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.29 24 12c0-6.627-5.373-12-12-12z" />
                </svg>
              </motion.a>
              {/* Add other social icons here if needed */}
            </div>
          </div>
        </div>

        {/* Futuristic Divider */}
        <div className="mt-8 pt-6 border-t border-[#00C4FF] border-opacity-20 text-center">
          <p className="text-xs text-[#8D8D8D] font-mono">
            DMS MEHEDI © 2025. All rights reserved.
          </p>
        </div>
      </div>
    </motion.footer>
  );
}
