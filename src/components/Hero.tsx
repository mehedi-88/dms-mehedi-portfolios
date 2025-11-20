'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { database } from '@/lib/firebase';
import { ref, onValue, set } from 'firebase/database';
import { ImageUploader } from './ImageUploader';
import { motion } from 'framer-motion';

export function Hero() {
  const [heroImageUrl, setHeroImageUrl] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // 1. Fetch image URL from Firebase on component mount
  useEffect(() => {
    const heroImageRef = ref(database, 'content/heroImage');
    const unsubscribe = onValue(heroImageRef, (snapshot) => {
      const url = snapshot.val();
      if (url) {
        setHeroImageUrl(url);
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Handle successful upload
  const handleUploadSuccess = (url: string) => {
    setHeroImageUrl(url);
    // Save URL to Firebase Realtime Database
    set(ref(database, 'content/heroImage'), url)
      .then(() => console.log('Hero image URL saved to DB'))
      .catch((error) => console.error('Error saving hero image URL:', error));
    setIsEditing(false); // Exit editing mode after upload
  };


  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Particle system for NASA-inspired 3D motion canvas
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
    }> = [];

    // Initialize particles
    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.3,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Draw particle
        ctx.fillStyle = `rgba(18, 84, 255, ${particle.opacity})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();

        // Draw connections
        particles.forEach((otherParticle) => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.strokeStyle = `rgba(0, 196, 255, ${0.2 * (1 - distance / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.stroke();
          }
        });
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section className="relative w-full h-screen flex items-center justify-center overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0"
      />

      <div className="relative z-10 text-center px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Animated Round Image Placeholder */}
          {/* Simple Admin Toggle for Demo */}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-xs text-blue-400 hover:text-blue-600 mb-2"
          >
            {isEditing ? 'Exit Edit Mode' : 'Edit Hero Image'}
          </button>
          
          {isEditing && (
            <div className="mb-4">
              <ImageUploader 
                storagePath="hero-images" 
                onUploadSuccess={handleUploadSuccess} 
              />
            </div>
          )}
          
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 100, delay: 0.4 }}
            className="w-40 h-40 md:w-48 md:h-48 mx-auto mb-8 rounded-full border-4 border-[#00C4FF] shadow-lg shadow-[#00C4FF]/50 flex items-center justify-center overflow-hidden"
            style={{
              background: 'linear-gradient(45deg, #1254FF, #00C4FF)',
              boxShadow: '0 0 20px rgba(0, 196, 255, 0.8)',
            }}
            whileHover={{ scale: 1.05, rotate: 5 }}
          >
            {heroImageUrl ? (
              <Image
                src={heroImageUrl}
                alt="DMS Mehedi Profile"
                width={192}
                height={192}
                className="object-cover w-full h-full"
                priority
              />
            ) : (
              <span className="text-4xl text-white font-bold">Photo</span>
            )}
          </motion.div>
          <h1 className="heading-1 mb-4 bg-gradient-to-r from-[#1254FF] via-[#00C4FF] to-[#1254FF] bg-clip-text text-transparent">
            DMS Mehedi
          </h1>
          <p className="text-xl md:text-2xl text-[#00C4FF] mb-8">
            AI-Powered Developer • Digital Strategist • Creator
          </p>
          <p className="body-text max-w-2xl mx-auto text-[#8D8D8D] mb-12">
            Building the future of web with Next.js, Firebase, and AI integration.
            Specializing in digital marketing, web development, and automation.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col md:flex-row gap-4 justify-center"
        >
          <button className="button-primary">
            Explore My Work
          </button>
          <button className="button-secondary">
            Get In Touch
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 animate-bounce"
        >
          <svg
            className="w-6 h-6 mx-auto text-[#00C4FF]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </motion.div>
      </div>
    </section>
  );
}

