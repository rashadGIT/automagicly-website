'use client';

import { useState } from 'react';
import type { AuditFormData } from '@/lib/types';
import { sendToN8N } from '@/lib/utils';

const CALENDLY_URL = process.env.NEXT_PUBLIC_CALENDLY_URL || 'https://calendly.com/your-handle/ai-audit';
const WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_AUDIT_WEBHOOK_URL;

const toolOptions = [
  'Google Workspace',
  'Microsoft 365',
  'QuickBooks',
  'HubSpot',
  'Salesforce',
  'Notion',
  'Slack',
  'Other'
];

export default function CalendlyBooking() {
  const [showFallbackForm, setShowFallbackForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [formData, setFormData] = useState<AuditFormData>({
    name: '',
    email: '',
    company: '',
    biggestTimeWaster: '',
    tools: [],
    preferredContact: 'email'
  });

  const handleToolToggle = (tool: string) => {
    setFormData(prev => ({
      ...prev,
      tools: prev.tools.includes(tool)
        ? prev.tools.filter(t => t !== tool)
        : [...prev.tools, tool]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const success = await sendToN8N(WEBHOOK_URL, formData);

      if (success) {
        setSubmitSuccess(true);
        setFormData({
          name: '',
          email: '',
          company: '',
          biggestTimeWaster: '',
          tools: [],
          preferredContact: 'email'
        });
      } else {
        setSubmitError('Something went wrong. Please try again or email us directly.');
      }
    } catch (error) {
      setSubmitError('Something went wrong. Please try again or email us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="booking" className="py-20 px-4 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Schedule Your Free AI Audit
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Let's identify where automation can save you the most time. Book a 30-minute discovery call.
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden">
          {!showFallbackForm ? (
            <div>
              {/* Calendly Embed */}
              <div className="aspect-video md:aspect-auto md:h-[700px] w-full">
                <iframe
                  src={CALENDLY_URL}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  title="Schedule AI Audit"
                  className="rounded-t-xl"
                />
              </div>

              {/* Fallback option */}
              <div className="p-6 bg-gray-50 border-t border-gray-200 text-center">
                <p className="text-sm text-gray-600 mb-3">
                  Can't see the calendar above?
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a
                    href={CALENDLY_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all"
                  >
                    Open in New Tab
                  </a>
                  <button
                    onClick={() => setShowFallbackForm(true)}
                    className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-all"
                  >
                    Use Contact Form Instead
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8">
              {submitSuccess ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">✓</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Request Received!
                  </h3>
                  <p className="text-gray-600 mb-6">
                    We'll reach out within 1 business day to schedule your AI Audit.
                  </p>
                  <button
                    onClick={() => {
                      setShowFallbackForm(false);
                      setSubmitSuccess(false);
                    }}
                    className="text-blue-600 hover:underline"
                  >
                    ← Back to calendar
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <button
                      onClick={() => setShowFallbackForm(false)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      ← Back to calendar
                    </button>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    Request an AI Audit
                  </h3>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Company *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.company}
                        onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        What's your biggest time-waster? *
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={formData.biggestTimeWaster}
                        onChange={(e) => setFormData(prev => ({ ...prev, biggestTimeWaster: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Manually following up with leads, processing invoices, scheduling..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        What tools do you use? (Select all that apply)
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {toolOptions.map(tool => (
                          <label key={tool} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.tools.includes(tool)}
                              onChange={() => handleToolToggle(tool)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{tool}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Preferred contact method *
                      </label>
                      <select
                        value={formData.preferredContact}
                        onChange={(e) => setFormData(prev => ({ ...prev, preferredContact: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="email">Email</option>
                        <option value="phone">Phone</option>
                        <option value="video">Video Call</option>
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
                      className="w-full px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg shadow-lg transition-all duration-200"
                    >
                      {isSubmitting ? 'Submitting...' : 'Request AI Audit'}
                    </button>
                  </form>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
