'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, RefreshCw, ArrowRight, AlertCircle } from 'lucide-react';
import { ContactInfo } from '@/lib/audit-types';

interface AuditContactFormProps {
  onSubmit: (contactInfo: ContactInfo) => void;
  onBack: () => void;
  isLoading?: boolean;
  error?: string | null;
}

/**
 * Contact information collection form for audit
 * Validates name and email before allowing submission
 */
export default function AuditContactForm({
  onSubmit,
  onBack,
  isLoading,
  error
}: AuditContactFormProps) {
  const [contactForm, setContactForm] = useState<ContactInfo>({ name: '', email: '', phone: '' });
  const [contactErrors, setContactErrors] = useState<Partial<ContactInfo>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Partial<ContactInfo> = {};

    if (!contactForm.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!contactForm.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactForm.email)) {
      errors.email = 'Please enter a valid email';
    }

    if (Object.keys(errors).length > 0) {
      setContactErrors(errors);
      return;
    }

    setContactErrors({});
    onSubmit(contactForm);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-8"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <User className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Before We Begin
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            We'll email your personalized audit results so you can review them anytime.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
          <div>
            <label htmlFor="audit-name" className="block text-sm font-medium text-gray-700 mb-1">
              Your Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
              <input
                type="text"
                id="audit-name"
                value={contactForm.name}
                onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="John Smith"
                aria-required="true"
                aria-invalid={!!contactErrors.name}
                aria-describedby={contactErrors.name ? 'name-error' : undefined}
                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
                  contactErrors.name ? 'border-red-300' : 'border-gray-200'
                }`}
              />
            </div>
            {contactErrors.name && (
              <p id="name-error" className="text-red-500 text-sm mt-1" role="alert">{contactErrors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="audit-email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
              <input
                type="email"
                id="audit-email"
                value={contactForm.email}
                onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="john@company.com"
                aria-required="true"
                aria-invalid={!!contactErrors.email}
                aria-describedby={contactErrors.email ? 'email-error' : undefined}
                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
                  contactErrors.email ? 'border-red-300' : 'border-gray-200'
                }`}
              />
            </div>
            {contactErrors.email && (
              <p id="email-error" className="text-red-500 text-sm mt-1" role="alert">{contactErrors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="audit-phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number <span className="text-gray-400">(optional)</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
              <input
                type="tel"
                id="audit-phone"
                value={contactForm.phone || ''}
                onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="(555) 123-4567"
                aria-required="false"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary flex items-center justify-center gap-2 mt-6"
            aria-label="Continue to audit questions"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                Continue to Audit
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onBack}
            className="w-full text-sm text-gray-500 hover:text-gray-700 mt-2"
            aria-label="Go back to start screen"
          >
            Go Back
          </button>
        </form>

        {error && (
          <p className="text-red-500 text-sm mt-4 flex items-center justify-center gap-2" role="alert" aria-live="assertive">
            <AlertCircle className="w-4 h-4" />
            {error}
          </p>
        )}
      </motion.div>
    </div>
  );
}
