'use client';

import { useState } from 'react';
import { Package, Zap, Bot } from 'lucide-react';
import type { WaitlistFormData } from '@/lib/types';
import { sendToN8N } from '@/lib/utils';

const WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_WAITLIST_WEBHOOK_URL;

export default function ComingSoon() {
  const [email, setEmail] = useState('');
  const [interest, setInterest] = useState('business-in-a-box');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    const formData: WaitlistFormData = {
      email,
      interest
    };

    try {
      const success = await sendToN8N(WEBHOOK_URL, formData);

      if (success) {
        setSubmitSuccess(true);
        setEmail('');
        setInterest('business-in-a-box');

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
    <section id="coming-soon" className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Coming Soon
          </h2>
          <p className="text-lg text-gray-600">
            New products to make automation even easier
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {/* Business-in-a-Box */}
          <div className="card p-8">
            <div className="w-14 h-14 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center mb-4"><Package className="w-7 h-7 text-white" /></div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Business-in-a-Box
            </h3>
            <p className="text-gray-600 mb-4">
              Prebuilt automation templates for common workflows, ready to deploy in minutes.
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-brand-600 font-bold">•</span>
                <span>Industry-specific packs (real estate, accounting, salons, home services)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-600 font-bold">•</span>
                <span>Pre-configured integrations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-600 font-bold">•</span>
                <span>Documentation and training included</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-600 font-bold">•</span>
                <span>One-time purchase, yours forever</span>
              </li>
            </ul>
          </div>

          {/* Start-Up-in-a-Box */}
          <div className="card p-8">
            <div className="w-14 h-14 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center mb-4"><Zap className="w-7 h-7 text-white" /></div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Start-Up-in-a-Box
            </h3>
            <p className="text-gray-600 mb-4">
              Lightweight, quick-start automations for common pain points.
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-brand-600 font-bold">•</span>
                <span>Lead capture & follow-up starter</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-600 font-bold">•</span>
                <span>Invoice automation bundle</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-600 font-bold">•</span>
                <span>Customer onboarding kit</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-600 font-bold">•</span>
                <span>Fixed scope, fixed price, fast delivery</span>
              </li>
            </ul>
          </div>

          {/* Assistant-in-a-Box */}
          <div className="card p-8">
            <div className="w-14 h-14 bg-gradient-to-br from-success-500 to-success-600 rounded-xl flex items-center justify-center mb-4"><Bot className="w-7 h-7 text-white" /></div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Assistant-in-a-Box
            </h3>
            <p className="text-gray-600 mb-4">
              Ready-to-use AI assistants that plug into your tools and teams.
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-brand-600 font-bold">•</span>
                <span>Customer support and FAQ automations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-600 font-bold">•</span>
                <span>Lead qualification and routing</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-600 font-bold">•</span>
                <span>Internal ops copilots for teams</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-600 font-bold">•</span>
                <span>Human handoff built in</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Waitlist Form */}
        <div className="max-w-xl mx-auto bg-white rounded-xl shadow-xl p-8">
          {submitSuccess ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">✓</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                You're on the List!
              </h3>
              <p className="text-gray-600">
                We'll email you when these products launch.
              </p>
            </div>
          ) : (
            <>
              <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                Join the Waitlist
              </h3>
              <p className="text-gray-600 mb-6 text-center">
                Be the first to know when we launch
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="waitlist-email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    id="waitlist-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="waitlist-interest" className="block text-sm font-semibold text-gray-700 mb-2">
                    I'm interested in *
                  </label>
                  <select
                    id="waitlist-interest"
                    value={interest}
                    onChange={(e) => setInterest(e.target.value)}
                    className="input-field"
                  >
                    <option value="business-in-a-box">Business-in-a-Box</option>
                    <option value="start-up-in-a-box">Start-Up-in-a-Box</option>
                    <option value="assistant-in-a-box">Assistant-in-a-Box</option>
                    <option value="all">All products</option>
                  </select>
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
                  {isSubmitting ? 'Joining...' : 'Join Waitlist'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
