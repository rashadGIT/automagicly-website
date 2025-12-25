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
        console.error('Error loading referrals:', e);
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
                className="text-blue-600 hover:underline"
              >
                Submit Another Referral
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-xl p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.yourName}
                      onChange={(e) => setFormData(prev => ({ ...prev, yourName: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Your Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.yourEmail}
                      onChange={(e) => setFormData(prev => ({ ...prev, yourEmail: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="border-t-2 border-gray-200 pt-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Referral Information
                  </h3>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Referral Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.referralName}
                        onChange={(e) => setFormData(prev => ({ ...prev, referralName: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Referral Email or Phone *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.referralContact}
                        onChange={(e) => setFormData(prev => ({ ...prev, referralContact: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="email@example.com or (555) 123-4567"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Referral Company (optional)
                      </label>
                      <input
                        type="text"
                        value={formData.referralCompany}
                        onChange={(e) => setFormData(prev => ({ ...prev, referralCompany: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        What do they need help with? *
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={formData.helpNeeded}
                        onChange={(e) => setFormData(prev => ({ ...prev, helpNeeded: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Drowning in manual invoicing, need better lead follow-up..."
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
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
                  className="w-full px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg shadow-lg transition-all duration-200"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Referral'}
                </button>
              </form>
            </div>
          )}

          {/* Submitted Referrals */}
          {submittedReferrals.length > 0 && !submitSuccess && (
            <div className="mt-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Your Submitted Referrals
              </h3>
              <div className="space-y-3">
                {submittedReferrals.map((referral) => (
                  <div key={referral.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="font-semibold text-gray-900">
                      {referral.referralName}
                      {referral.referralCompany && ` - ${referral.referralCompany}`}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {referral.referralContact}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Submitted {new Date(referral.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
