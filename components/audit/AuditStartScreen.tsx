'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, MessageSquare } from 'lucide-react';

interface AuditStartScreenProps {
  onStart: () => void;
  isLoading?: boolean;
}

/**
 * Initial screen for the AI Business Audit
 * Shows value proposition and starts the audit process
 */
function AuditStartScreen({ onStart, isLoading }: AuditStartScreenProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-8 text-center"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          AI Business Audit
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Answer a few questions about your business, and our AI will identify
          automation opportunities tailored to your specific needs.
        </p>
        <ul className="text-left text-sm text-gray-600 mb-8 space-y-2 max-w-sm mx-auto">
          <li className="flex items-center gap-2">
            <span className="w-5 h-5 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
            Answer 3 discovery questions
          </li>
          <li className="flex items-center gap-2">
            <span className="w-5 h-5 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
            AI asks follow-up questions
          </li>
          <li className="flex items-center gap-2">
            <span className="w-5 h-5 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center text-xs font-bold">3</span>
            Get personalized recommendations
          </li>
        </ul>
        <button
          onClick={onStart}
          disabled={isLoading}
          className="btn-primary flex items-center gap-2 mx-auto"
          aria-label="Start your free AI business audit"
        >
          <MessageSquare className="w-5 h-5" />
          Start Your Free Audit
        </button>
      </motion.div>
    </div>
  );
}

// Memoize to prevent unnecessary re-renders
export default memo(AuditStartScreen);
