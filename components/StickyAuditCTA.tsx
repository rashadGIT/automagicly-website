'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, X } from 'lucide-react';
import { scrollToElement } from '@/lib/utils';

export default function StickyAuditCTA() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      if (!dismissed) {
        setVisible(window.scrollY > 500);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [dismissed]);

  const handleDismiss = () => {
    setDismissed(true);
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-full shadow-2xl border border-brand-500/40 backdrop-blur-sm"
        >
          <Zap className="w-4 h-4 text-brand-200 flex-shrink-0" />
          <span className="text-sm font-semibold whitespace-nowrap">
            Find out what to automate first —
          </span>
          <button
            onClick={() => scrollToElement('audit')}
            className="text-sm font-bold underline underline-offset-2 decoration-brand-300 hover:decoration-white transition-colors whitespace-nowrap"
          >
            Start Free Audit
          </button>
          <button
            onClick={handleDismiss}
            className="ml-1 text-brand-200 hover:text-white transition-colors flex-shrink-0"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
