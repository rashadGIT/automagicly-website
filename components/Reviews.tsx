'use client';

import { useState, useEffect } from 'react';
import type { ReviewFormData } from '@/lib/types';
import { sendToN8N } from '@/lib/utils';

const WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_REVIEWS_WEBHOOK_URL;

interface StoredReview extends ReviewFormData {
  id: string;
  timestamp: number;
}

export default function Reviews() {
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submittedReviews, setSubmittedReviews] = useState<StoredReview[]>([]);

  const [formData, setFormData] = useState<ReviewFormData>({
    name: '',
    company: '',
    rating: 5,
    reviewText: '',
    serviceType: 'AI Audit'
  });

  useEffect(() => {
    // Load submitted reviews from localStorage
    const stored = localStorage.getItem('automagicly_submitted_reviews');
    if (stored) {
      try {
        setSubmittedReviews(JSON.parse(stored));
      } catch (e) {
        console.error('Error loading reviews:', e);
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
        const newReview: StoredReview = {
          ...formData,
          id: `review_${Date.now()}`,
          timestamp: Date.now()
        };

        const updated = [...submittedReviews, newReview];
        setSubmittedReviews(updated);
        localStorage.setItem('automagicly_submitted_reviews', JSON.stringify(updated));

        setSubmitSuccess(true);
        setFormData({
          name: '',
          company: '',
          rating: 5,
          reviewText: '',
          serviceType: 'AI Audit'
        });

        setTimeout(() => {
          setShowForm(false);
          setSubmitSuccess(false);
        }, 3000);
      } else {
        setSubmitError('Something went wrong. Please try again.');
      }
    } catch (error) {
      setSubmitError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <section id="reviews" className="py-20 px-4 bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Client Reviews
          </h2>
          <p className="text-lg text-gray-600">
            All reviews are moderated before appearing publicly
          </p>
        </div>

        {/* Approved Reviews (empty state) */}
        <div className="mb-12">
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Approved Reviews
          </h3>
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-gray-600">
              Reviews will appear here once approved by our team.
            </p>
          </div>
        </div>

        {/* Submit Review Button */}
        {!showForm && (
          <div className="text-center mb-12">
            <button
              onClick={() => setShowForm(true)}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-200"
            >
              Submit a Review
            </button>
          </div>
        )}

        {/* Review Form */}
        {showForm && (
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-xl p-8 mb-12">
            {submitSuccess ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">✓</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Thank You!
                </h3>
                <p className="text-gray-600">
                  Your review has been submitted and is pending moderation.
                </p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    Submit Your Review
                  </h3>
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Name (optional)
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Company (optional)
                    </label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your company"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Rating *
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                          className="text-3xl focus:outline-none"
                        >
                          <span className={star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'}>
                            ★
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Your Review *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.reviewText}
                      onChange={(e) => setFormData(prev => ({ ...prev, reviewText: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Tell us about your experience..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Service Type *
                    </label>
                    <select
                      value={formData.serviceType}
                      onChange={(e) => setFormData(prev => ({ ...prev, serviceType: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="AI Audit">AI Audit</option>
                      <option value="One-Off Workflow">One-Off Workflow</option>
                      <option value="AI Partnership">AI Partnership</option>
                      <option value="Other">Other</option>
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
                    {isSubmitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              </>
            )}
          </div>
        )}

        {/* Your Submitted Reviews */}
        {submittedReviews.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
              Your Submitted Reviews (Pending Moderation)
            </h3>
            <div className="grid gap-6">
              {submittedReviews.map((review) => (
                <div key={review.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      {review.name && <div className="font-semibold text-gray-900">{review.name}</div>}
                      {review.company && <div className="text-sm text-gray-600">{review.company}</div>}
                    </div>
                    {renderStars(review.rating)}
                  </div>
                  <p className="text-gray-700 mb-2">{review.reviewText}</p>
                  <div className="text-xs text-gray-500">Service: {review.serviceType}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
