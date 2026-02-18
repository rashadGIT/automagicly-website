'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Menu, X, Zap } from 'lucide-react';
import { scrollToElement } from '@/lib/utils';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'What We Do', id: 'what-we-do' },
    { label: 'ROI Calculator', id: 'roi-calculator' },
    { label: 'Services', id: 'services' },
    { label: 'How It Works', id: 'how-it-works' },
    { label: 'FAQ', id: 'faq' },
    { label: 'Coming Soon', id: 'coming-soon' },
  ];

  const handleNavClick = (e: React.MouseEvent | React.TouchEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();

    // Close menu first for immediate feedback
    setIsMobileMenuOpen(false);

    // Small delay to allow menu close animation before scrolling
    setTimeout(() => {
      scrollToElement(id);
    }, 100);
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm py-3'
          : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className={`flex items-center gap-2 text-2xl font-bold hover:scale-105 transition-transform ${isScrolled ? 'gradient-text' : 'text-white'}`}
          >
            <Sparkles className={`w-6 h-6 ${isScrolled ? 'text-brand-600' : 'text-white'}`} />
            <span>AutoMagicly</span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={(e) => handleNavClick(e, item.id)}
                className={`font-medium transition-colors relative group ${isScrolled ? 'text-gray-700 hover:text-brand-600' : 'text-white/80 hover:text-white'}`}
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-600 group-hover:w-full transition-all duration-300" />
              </button>
            ))}
            <button
              onClick={(e) => handleNavClick(e, 'ai-audit')}
              className="btn-primary flex items-center gap-2 !py-2 !px-6"
            >
              <Zap className="w-4 h-4" />
              <span>Get Started</span>
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-gray-700 hover:text-brand-600 transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden mt-4 pb-4 border-t border-gray-200 pt-4 overflow-hidden"
            >
              <div className="flex flex-col gap-3">
                {navItems.map((item, index) => (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={(e) => handleNavClick(e, item.id)}
                    onTouchEnd={(e) => handleNavClick(e, item.id)}
                    className="text-left text-gray-700 hover:text-brand-600 font-medium py-3 px-2 transition-colors hover:translate-x-2 duration-200 cursor-pointer active:bg-gray-100 rounded"
                  >
                    {item.label}
                  </motion.button>
                ))}
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navItems.length * 0.05 }}
                  onClick={(e) => handleNavClick(e, 'ai-audit')}
                  onTouchEnd={(e) => handleNavClick(e, 'ai-audit')}
                  className="btn-primary flex items-center justify-center gap-2 !py-3 cursor-pointer active:opacity-90"
                >
                  <Zap className="w-4 h-4" />
                  <span>Get Started</span>
                </motion.button>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
