'use client';

import { useState, useEffect } from 'react';
import type { ReferralFormData } from '@/lib/types';
import { sendToN8N } from '@/lib/utils';

const WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_REFERRALS_WEBHOOK_URL;

interface StoredReferral extends ReferralFormData {
  id: string;
  timestamp: number;
}

export default function Referrals() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submittedReferrals, setSubmittedReferrals] = useState<StoredReferral[]>([]);
  const [showSubmittedReferrals, setShowSubmittedReferrals] = useState(false);

  const [formData, setFormData] = useState<ReferralFormData>({
    yourName: '',
    yourEmail: '',
    referralName: '',
    referralContact: '',
    referralCompany: '',
    helpNeeded: ''
  });

  useEffect(() => {
    // Load submitted referrals from localStorage
    const stored = localStorage.getItem('automagicly_submitted_referrals');
    if (stored) {
      try {
        setSubmittedReferrals(JSON.parse(stored));
      } catch (e) {
        // Log error and clear corrupted data
        console.error('Failed to parse stored referrals, clearing corrupted data:', e);
        localStorage.removeItem('automagicly_submitted_referrals');
        // Note: User will see empty state, which is better than showing corrupted data
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const success = await sendToN8N(WEBHOOK_URL, formData);

      if (success) {
        // Store in localStorage
        const newReferral: StoredReferral = {
          ...formData,
          id: `referral_${Date.now()}`,
          timestamp: Date.now()
        };

        const updated = [...submittedReferrals, newReferral];
        setSubmittedReferrals(updated);
        localStorage.setItem('automagicly_submitted_referrals', JSON.stringify(updated));

        setSubmitSuccess(true);
        setFormData({
          yourName: '',
          yourEmail: '',
          referralName: '',
          referralContact: '',
          referralCompany: '',
          helpNeeded: ''
        });

        setTimeout(() => {
          setSubmitSuccess(false);
        }, 5000);
      } else {
        setSubmitError('Something went wrong. Please try again.');
      }
    } catch (error) {
      setSubmitError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="referrals" className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Refer a Business
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Know someone who could benefit from automation? Send them our way.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          {submitSuccess ? (
            <div className="bg-white rounded-xl shadow-xl p-12 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Thank You!
              </h3>
              <p className="text-gray-600 mb-6">
                We'll reach out to your referral respectfully and keep you updated.
              </p>
              <button
                onClick={() => setSubmitSuccess(false)}
                className="text-brand-600 hover:underline"
              >
                Submit Another Referral
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-xl p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="referral-your-name" className="block text-sm font-semibold text-gray-700 mb-2">
                      Your Name *
                    </label>
                    <input
                      id="referral-your-name"
                      type="text"
                      required
                      value={formData.yourName}
                      onChange={(e) => setFormData(prev => ({ ...prev, yourName: e.target.value }))}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label htmlFor="referral-your-email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Your Email *
                    </label>
                    <input
                      id="referral-your-email"
                      type="email"
                      required
                      value={formData.yourEmail}
                      onChange={(e) => setFormData(prev => ({ ...prev, yourEmail: e.target.value }))}
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="border-t-2 border-gray-200 pt-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Referral Information
                  </h3>

                  <div className="space-y-6">
                    <div>
                      <label htmlFor="referral-name" className="block text-sm font-semibold text-gray-700 mb-2">
                        Referral Name *
                      </label>
                      <input
                        id="referral-name"
                        type="text"
                        required
                        value={formData.referralName}
                        onChange={(e) => setFormData(prev => ({ ...prev, referralName: e.target.value }))}
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label htmlFor="referral-contact" className="block text-sm font-semibold text-gray-700 mb-2">
                        Referral Email or Phone *
                      </label>
                      <input
                        id="referral-contact"
                        type="text"
                        required
                        value={formData.referralContact}
                        onChange={(e) => setFormData(prev => ({ ...prev, referralContact: e.target.value }))}
                        className="input-field"
                        placeholder="email@example.com or (555) 123-4567"
                      />
                    </div>

                    <div>
                      <label htmlFor="referral-company" className="block text-sm font-semibold text-gray-700 mb-2">
                        Referral Company (optional)
                      </label>
                      <input
                        id="referral-company"
                        type="text"
                        value={formData.referralCompany}
                        onChange={(e) => setFormData(prev => ({ ...prev, referralCompany: e.target.value }))}
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label htmlFor="referral-help-needed" className="block text-sm font-semibold text-gray-700 mb-2">
                        What do they need help with? *
                      </label>
                      <textarea
                        id="referral-help-needed"
                        required
                        rows={4}
                        value={formData.helpNeeded}
                        onChange={(e) => setFormData(prev => ({ ...prev, helpNeeded: e.target.value }))}
                        className="input-field"
                        placeholder="e.g., Drowning in manual invoicing, need better lead follow-up..."
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-brand-50 border border-brand-200 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>We'll reach out respectfully. No spam.</strong> Thank you - referrals help us grow.
                  </p>
                </div>

                {submitError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{submitError}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Referral'}
                </button>
              </form>
            </div>
          )}

          {/* Submitted Referrals - Gamified Collapsible */}
          {submittedReferrals.length > 0 && !submitSuccess && (
            <div className="mt-8">
              <div className="bg-gradient-to-r from-purple-50 to-brand-50 rounded-lg p-4 border-2 border-purple-200">
                <button
                  onClick={() => setShowSubmittedReferrals(!showSubmittedReferrals)}
                  className="w-full flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {submittedReferrals.length >= 10 ? '💎' :
                       submittedReferrals.length >= 5 ? '🥇' :
                       submittedReferrals.length >= 3 ? '🥈' : '🥉'}
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-gray-900">
                        {submittedReferrals.length} Referral{submittedReferrals.length !== 1 ? 's' : ''} Submitted
                      </div>
                      <div className="text-xs text-gray-600">
                        {submittedReferrals.length < 3 ? `${3 - submittedReferrals.length} more to Silver tier` :
                         submittedReferrals.length < 5 ? `${5 - submittedReferrals.length} more to Gold tier` :
                         submittedReferrals.length < 10 ? `${10 - submittedReferrals.length} more to Diamond tier` :
                         'Diamond tier achieved! 🎉'}
                      </div>
                    </div>
                  </div>
                  <svg
                    className={`w-5 h-5 transition-transform ${showSubmittedReferrals ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-brand-500 to-accent-500 h-2 rounded-full transition-all duration-500"
                      style={{width: `${Math.min((submittedReferrals.length / 10) * 100, 100)}%`}}
                    />
                  </div>
                </div>

                {/* Expandable Content */}
                {showSubmittedReferrals && (
                  <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
                    {submittedReferrals.map((referral) => (
                      <div key={referral.id} className="bg-white rounded p-3 text-sm">
                        <div className="font-semibold text-gray-900">
                          {referral.referralName}
                          {referral.referralCompany && ` - ${referral.referralCompany}`}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <span>{referral.referralContact}</span>
                          <span>•</span>
                          <span>{new Date(referral.timestamp).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
