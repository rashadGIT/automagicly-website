'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';

interface AuditEscalatedScreenProps {
  escalationReason?: string | null;
  onScheduleCall: () => void;
  onReset: () => void;
}

/**
 * Escalation screen shown when the audit determines a personalized consultation is needed
 * Provides options to book a call or restart the audit
 */
function AuditEscalatedScreen({
  escalationReason,
  onScheduleCall,
  onReset
}: AuditEscalatedScreenProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-8 text-center"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Calendar className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          Let's Talk in Person
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Based on the information provided, we want to make sure you receive the best possible guidance.
          Your needs are unique and would benefit from a personalized consultation.
        </p>
        {escalationReason && (
          <p className="text-sm text-gray-500 mb-6 italic" role="status">
            "{escalationReason}"
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onScheduleCall}
            className="btn-primary flex items-center justify-center gap-2"
            aria-label="Schedule a free consultation call"
          >
            <Calendar className="w-5 h-5" />
            Book Free Consultation
          </button>
          <button
            onClick={onReset}
            className="btn-secondary"
            aria-label="Restart the audit process"
          >
            Try Audit Again
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// Memoize to prevent unnecessary re-renders
export default memo(AuditEscalatedScreen);
