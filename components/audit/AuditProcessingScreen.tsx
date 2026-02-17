'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Sparkles } from 'lucide-react';

/**
 * Processing animation shown while AI generates audit results
 * Displays for 5 seconds before showing completion options
 */
function AuditProcessingScreen() {
  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card p-12 text-center"
      >
        <div className="relative w-20 h-20 mx-auto mb-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0"
          >
            <Loader2 className="w-20 h-20 text-brand-500" />
          </motion.div>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Sparkles className="w-10 h-10 text-brand-600" />
          </motion.div>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          Analyzing Your Business...
        </h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Our AI is processing your responses and identifying the best automation
          opportunities for your specific needs.
        </p>
        <div className="mt-8 flex flex-col gap-2 text-sm text-gray-500" role="status" aria-live="polite">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            ✓ Understanding your workflow
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            ✓ Identifying pain points
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5 }}
          >
            ✓ Generating recommendations
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3.5 }}
          >
            ✓ Preparing your custom audit
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

// Memoize to prevent unnecessary re-renders during processing
export default memo(AuditProcessingScreen);
