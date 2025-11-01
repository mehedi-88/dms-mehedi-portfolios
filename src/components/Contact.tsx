'use client';

import React, { useState } from 'react';
import { database } from '@/lib/firebase';
import { ref, push } from 'firebase/database';
import { Mail, Phone, MessageCircle, Linkedin, Github } from 'lucide-react'; // Assuming lucide-react is available or will be installed
import { motion } from 'framer-motion';

export function Contact() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    service: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Save data to Firebase Realtime Database
      const contactRef = ref(database, 'contact_submissions');
      await push(contactRef, {
        ...formData,
        timestamp: Date.now(),
      });

      // 2. Show success confirmation
      setSubmitted(true);
      
      // 3. Reset form after a delay
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ fullName: '', email: '', phone: '', service: '', message: '' });
      }, 3000);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to send message. Please try again.');
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
    <section className="py-20 px-4 md:px-8 max-w-4xl mx-auto">
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
          className="body-text text-center text-[#8D8D8D] mb-12"
        >
          Have a project in mind? Let's collaborate and create something amazing together.
        </motion.p>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="glass rounded-xl p-6">
              <h3 className="heading-3 text-[#1254FF] mb-4">Direct Contact</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-6 h-6 text-[#00C4FF]" />
                  <a
                    href="mailto:hello@dmsmehedi.com"
                    className="text-[#8D8D8D] hover:text-[#00C4FF] transition-colors"
                  >
                    hello@dmsmehedi.com
                  </a>
                </div>
                <div className="flex items-center space-x-3">
                  <MessageCircle className="w-6 h-6 text-[#00C4FF]" />
                  <a
                    href="https://wa.me/01817938342"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#8D8D8D] hover:text-[#00C4FF] transition-colors"
                  >
                    Chat on WhatsApp
                  </a>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-6 h-6 text-[#00C4FF]" />
                  <span className="text-[#8D8D8D]">+88 (018) 1179-38342</span>
                </div>
              </div>
            </div>
            <div className="glass rounded-xl p-6">
              <h3 className="heading-3 text-[#1254FF] mb-4">Connect with Me</h3>
              <div className="flex gap-6">
                <a
                  href="https://www.linkedin.com/in/dmsmehedi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#8D8D8D] hover:text-[#00C4FF] transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-8 h-8" />
                </a>
                <a
                  href="https://github.com/dmsmehedi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#8D8D8D] hover:text-[#00C4FF] transition-colors"
                  aria-label="GitHub"
                >
                  <Github className="w-8 h-8" />
                </a>
                {/* Add more social icons as needed */}
              </div>
            </div>
          </motion.div>

          <motion.form
            variants={itemVariants}
            onSubmit={handleSubmit}
            className="glass rounded-xl p-8 space-y-4"
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
                className="w-full bg-black bg-opacity-50 border border-[#1254FF] border-opacity-30 rounded-lg px-4 py-2 text-white placeholder-[#8D8D8D] focus:outline-none focus:border-[#00C4FF]"
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
                className="w-full bg-black bg-opacity-50 border border-[#1254FF] border-opacity-30 rounded-lg px-4 py-2 text-white placeholder-[#8D8D8D] focus:outline-none focus:border-[#00C4FF]"
                placeholder="your@email.com"
              />
            </div>
            {/* New Field: Phone Number */}
            <div>
              <label className="block text-[#00C4FF] mb-2 font-semibold">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-black bg-opacity-50 border border-[#1254FF] border-opacity-30 rounded-lg px-4 py-2 text-white placeholder-[#8D8D8D] focus:outline-none focus:border-[#00C4FF]"
                placeholder="(123) 456-7890"
              />
            </div>
            {/* New Field: Service Select */}
            <div>
              <label className="block text-[#00C4FF] mb-2 font-semibold">
                Service
              </label>
              <select
                name="service"
                value={formData.service}
                onChange={(e) => handleChange(e as any)} // Cast to any to satisfy the select element
                required
                className="w-full bg-black bg-opacity-50 border border-[#1254FF] border-opacity-30 rounded-lg px-4 py-2 text-white placeholder-[#8D8D8D] focus:outline-none focus:border-[#00C4FF]"
              >
                <option value="" disabled>Select a service</option>
                <option value="Web Development">Web Development</option>
                <option value="Digital Marketing">Digital Marketing</option>
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
                  className="w-full bg-black bg-opacity-50 border border-[#1254FF] border-opacity-30 rounded-lg px-4 py-2 text-white placeholder-[#8D8D8D] focus:outline-none focus:border-[#00C4FF] resize-none"
                  placeholder="Your message..."
                />
              </div>
              <motion.button
                type="submit"
                className="button-primary w-full flex items-center justify-center"
                disabled={isSubmitting || submitted}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                animate={isSubmitting ? { rotate: 360, transition: { duration: 0.8, repeat: Infinity, ease: "linear" } } : { rotate: 0 }}
              >
                {isSubmitting ? (
                  <svg className="animate-spin h-5 w-5 text-white mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
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

