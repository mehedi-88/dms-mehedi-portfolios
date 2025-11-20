'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Home, User, Code, Mail, Zap, Briefcase } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { NAVIGATION_LINKS, APP_LOGO } from '@/lib/assets';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  // Handle scroll to change navbar style
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getIcon = (iconName: string) => {
    const icons: { [key: string]: any } = {
      Home,
      User,
      Code,
      Mail,
      Zap,
      Briefcase
    };
    return icons[iconName] || Home;
  };

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, shouldScroll: boolean) => {
    setIsOpen(false);
    
    // Handle hash links for smooth scrolling
    if (href.startsWith('/#')) {
      const elementId = href.substring(2);
      const element = document.getElementById(elementId);
      
      if (element) {
        e.preventDefault();
        
        // Smooth scroll with offset for navbar
        const offset = 80;
        const elementPosition = element.offsetTop - offset;
        
        window.scrollTo({
          top: elementPosition,
          behavior: 'smooth'
        });
      }
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 dark:bg-gray-900/95 shadow-lg backdrop-blur-md border-b border-gray-200 dark:border-gray-800'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand Name */}
          <div className="flex-shrink-0">
            <Link 
              href={APP_LOGO.href} 
              className="flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent hover:from-blue-600 hover:to-cyan-400 dark:hover:from-cyan-400 dark:hover:to-blue-600 transition-all duration-300"
            >
              <img 
                src={APP_LOGO.src} 
                alt={APP_LOGO.alt}
                className="w-8 h-8 object-contain"
              />
              <span className="bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent">
                {APP_LOGO.text}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-4">
            {NAVIGATION_LINKS.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href, link.scroll)}
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-cyan-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                {link.name}
              </Link>
            ))}
            <ThemeToggle />
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <ThemeToggle />
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 ml-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-expanded={isOpen}
              aria-label="Toggle menu"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-gray-900 shadow-lg">
          {NAVIGATION_LINKS.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={(e) => handleLinkClick(e, link.href, link.scroll)}
              className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-cyan-400 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
            >
              {React.createElement(getIcon(link.icon), { 
                className: "inline-block h-5 w-5 mr-2", 
                "aria-hidden": true 
              })}
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
