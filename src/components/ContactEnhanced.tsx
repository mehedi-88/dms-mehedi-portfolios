'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MessageCircle, Linkedin, Github } from 'lucide-react';

export function ContactEnhanced() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    service: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setSubmitted(true);
      setFormData({ fullName: '', email: '', phone: '', service: '', message: '' });

      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    } catch (err) {
      setError('Failed to send message. Please try again.');
      console.error('Error submitting form:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <motion.h2 variants={itemVariants} className="heading-2 mb-4 text-center">
          Get In <span className="text-[#00C4FF]">Touch</span>
        </motion.h2>
        <motion.p
          variants={itemVariants}
          className="body-text text-center text-[#8D8D8D] mb-12 max-w-2xl mx-auto"
        >
          Have a project in mind? Let's collaborate and create something amazing together.
        </motion.p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Information */}
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="glass rounded-xl p-6 border-2 border-[#1254FF] border-opacity-30 hover:border-[#00C4FF] transition-all shadow-lg shadow-[#1254FF]/10 hover:shadow-[#00C4FF]/20">
              <h3 className="heading-3 text-[#1254FF] mb-4">Direct Contact</h3>
              <div className="space-y-4">
                <motion.div
                  className="flex items-center space-x-3"
                  whileHover={{ x: 5 }}
                >
                  <Mail className="w-6 h-6 text-[#00C4FF]" />
                  <a
                    href="mailto:dmsmehedis@gmail.com"
                    className="text-[#8D8D8D] hover:text-[#00C4FF] transition-colors"
                  >
                    dmsmehedis@gmail.com
                  </a>
                </motion.div>
                <motion.div
                  className="flex items-center space-x-3"
                  whileHover={{ x: 5 }}
                >
                  <MessageCircle className="w-6 h-6 text-[#00C4FF]" />
                  <a
                    href="https://wa.me/8801817938342"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#8D8D8D] hover:text-[#00C4FF] transition-colors"
                  >
                    Chat on WhatsApp
                  </a>
                </motion.div>
                <motion.div
                  className="flex items-center space-x-3"
                  whileHover={{ x: 5 }}
                >
                  <Phone className="w-6 h-6 text-[#00C4FF]" />
                  <a
                    href="tel:+8801817938342"
                    className="text-[#8D8D8D] hover:text-[#00C4FF] transition-colors"
                  >
                    +880 1817 938342
                  </a>
                </motion.div>
              </div>
            </div>

            <div className="glass rounded-xl p-6 border border-[#1254FF] border-opacity-20 hover:border-[#00C4FF] transition-colors">
              <h3 className="heading-3 text-[#1254FF] mb-4">Connect with Me</h3>
              <div className="flex gap-6">
                <motion.a
                  href="https://www.linkedin.com/in/dms-mehedi-digital-marketing-expert-bangladesh/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#8D8D8D] hover:text-[#00C4FF] transition-colors"
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-8 h-8" />
                </motion.a>
                <motion.a
                  href="https://github.com/mehedi-88"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#8D8D8D] hover:text-[#00C4FF] transition-colors"
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  aria-label="GitHub"
                >
                  <Github className="w-8 h-8" />
                </motion.a>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.form
            variants={itemVariants}
            onSubmit={handleSubmit}
            className="glass rounded-xl p-8 space-y-4 border border-[#1254FF] border-opacity-20"
          >
            <div>
              <label className="block text-[#00C4FF] mb-2 font-semibold">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full bg-black bg-opacity-50 border border-[#1254FF] border-opacity-30 rounded-lg px-4 py-2 text-white placeholder-[#8D8D8D] focus:outline-none focus:border-[#00C4FF] transition-colors"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className="block text-[#00C4FF] mb-2 font-semibold">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-black bg-opacity-50 border border-[#1254FF] border-opacity-30 rounded-lg px-4 py-2 text-white placeholder-[#8D8D8D] focus:outline-none focus:border-[#00C4FF] transition-colors"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-[#00C4FF] mb-2 font-semibold">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-black bg-opacity-50 border border-[#1254FF] border-opacity-30 rounded-lg px-4 py-2 text-white placeholder-[#8D8D8D] focus:outline-none focus:border-[#00C4FF] transition-colors"
                placeholder="(123) 456-7890"
              />
            </div>

            <div>
              <label className="block text-[#00C4FF] mb-2 font-semibold">
                Service
              </label>
              <select
                name="service"
                value={formData.service}
                onChange={handleChange}
                required
                className="w-full bg-black bg-opacity-50 border border-[#1254FF] border-opacity-30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00C4FF] transition-colors"
              >
                <option value="" disabled>
                  Select a service
                </option>
                <option value="Digital Marketing">Digital Marketing</option>
                <option value="Web Development">Web Development</option>
                <option value="Shopify Dropshipping">Shopify Dropshipping</option>
                <option value="AI Integration">AI Integration</option>
                <option value="Consulting">Consulting</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-[#00C4FF] mb-2 font-semibold">
                Message
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={4}
                className="w-full bg-black bg-opacity-50 border border-[#1254FF] border-opacity-30 rounded-lg px-4 py-2 text-white placeholder-[#8D8D8D] focus:outline-none focus:border-[#00C4FF] resize-none transition-colors"
                placeholder="Your message..."
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            <motion.button
              type="submit"
              className="button-primary w-full flex items-center justify-center"
              disabled={isSubmitting || submitted}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </>
              ) : submitted ? (
                '✓ Thanks for messaging!'
              ) : (
                'Send Message'
              )}
            </motion.button>
          </motion.form>
        </div>
      </motion.div>
    </section>
  );
}

