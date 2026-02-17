'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Mail, Calendar, Eye, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { ContactInfo } from '@/lib/audit-types';

interface AuditCompletionOptionsProps {
  recommendationsCount: number;
  contactInfo?: ContactInfo | null;
  onEmailResults: () => Promise<void>;
  onScheduleCall: () => void;
  onViewResults: () => void;
}

/**
 * Completion options screen shown after audit finishes processing
 * Provides options to email results, schedule a call, or view results now
 */
export default function AuditCompletionOptions({
  recommendationsCount,
  contactInfo,
  onEmailResults,
  onScheduleCall,
  onViewResults
}: AuditCompletionOptionsProps) {
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const handleEmailResults = async () => {
    setEmailSending(true);
    setEmailError(null);

    try {
      await onEmailResults();
      setEmailSent(true);
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : 'Failed to send email');
    } finally {
      setEmailSending(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-8 text-center"
      >
        {/* Trophy/celebration icon */}
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: [0, -10, 10, -10, 10, 0] }}
          transition={{
            scale: { delay: 0.2, type: 'spring' },
            rotate: { delay: 0.5, duration: 0.5 }
          }}
          className="w-20 h-20 bg-gradient-to-br from-brand-500 to-accent-500 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <Trophy className="w-10 h-10 text-white" />
        </motion.div>

        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Audit Complete!
        </h3>
        <p className="text-gray-600 mb-6">
          We found <span className="font-semibold text-brand-600">
            {recommendationsCount} opportunit{recommendationsCount !== 1 ? 'ies' : 'y'}
          </span> to automate your business.
        </p>

        {emailSent ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-green-50 rounded-xl mb-6"
            role="status"
            aria-live="polite"
          >
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-green-700 font-medium">
              Results sent to {contactInfo?.email}!
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {/* Email option */}
            <button
              onClick={handleEmailResults}
              disabled={emailSending}
              className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-brand-300 hover:bg-brand-50 transition-all text-left flex items-center gap-4 disabled:opacity-50"
              aria-label="Email me my audit results"
            >
              <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-brand-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Email me my results</p>
                <p className="text-sm text-gray-500">Get a summary sent to {contactInfo?.email || 'your email'}</p>
              </div>
              {emailSending && <Loader2 className="w-5 h-5 animate-spin text-brand-500" />}
            </button>

            {/* Schedule call option */}
            <button
              onClick={onScheduleCall}
              className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-accent-300 hover:bg-accent-50 transition-all text-left flex items-center gap-4"
              aria-label="Schedule a call to discuss results"
            >
              <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Calendar className="w-6 h-6 text-accent-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Schedule a call</p>
                <p className="text-sm text-gray-500">Discuss results with an automation expert</p>
              </div>
            </button>

            {/* View now option */}
            <button
              onClick={onViewResults}
              className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all text-left flex items-center gap-4"
              aria-label="View audit results now"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Eye className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">View results now</p>
                <p className="text-sm text-gray-500">See your full automation report here</p>
              </div>
            </button>

            {/* Error message */}
            {emailError && (
              <p className="text-red-500 text-sm mt-2 flex items-center justify-center gap-2" role="alert" aria-live="assertive">
                <AlertCircle className="w-4 h-4" />
                {emailError}
              </p>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
