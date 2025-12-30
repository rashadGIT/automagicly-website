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
  const [showSubmittedReviews, setShowSubmittedReviews] = useState(false);
  const [approvedReviews, setApprovedReviews] = useState<ReviewFormData[]>([]);
  const [displayReviews, setDisplayReviews] = useState<ReviewFormData[]>([]);
  const [loadingApproved, setLoadingApproved] = useState(true);

  const [formData, setFormData] = useState<ReviewFormData>({
    name: '',
    email: '',
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

    // Load approved reviews from API
    loadApprovedReviews();
  }, []);

  const loadApprovedReviews = async () => {
    setLoadingApproved(true);
    try {
      const response = await fetch('/api/reviews-simple');
      const data = await response.json();
      // Filter for approved reviews with 3+ stars on client side
      const approved = (data.reviews || []).filter((r: ReviewFormData) =>
        r.status === 'approved' && r.rating >= 3
      );
      setApprovedReviews(approved);

      // Separate featured and non-featured reviews
      const featured = approved.filter((r: ReviewFormData) => r.featured);
      const nonFeatured = approved.filter((r: ReviewFormData) => !r.featured);

      // Shuffle non-featured reviews
      const shuffled = nonFeatured.sort(() => 0.5 - Math.random());

      // Show: Featured first + 5-8 random others
      const randomOthers = shuffled.slice(0, 8);
      setDisplayReviews([...featured, ...randomOthers]);
    } catch (error) {
      console.error('Error loading approved reviews:', error);
    } finally {
      setLoadingApproved(false);
    }
  };

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
          email: '',
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

        {/* Approved Reviews */}
        <div className="mb-12">
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
            What Our Clients Say
          </h3>

          {loadingApproved ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading reviews...</p>
            </div>
          ) : displayReviews.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-gray-600">
                Reviews will appear here once approved by our team.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayReviews.map((review, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow relative"
                >
                  {review.featured && (
                    <div className="absolute top-4 right-4">
                      <span className="text-2xl" title="Featured Review">⭐</span>
                    </div>
                  )}

                  <div className="mb-4">
                    {renderStars(review.rating)}
                  </div>

                  <p className="text-gray-700 mb-4 italic">"{review.reviewText}"</p>

                  <div className="border-t pt-4">
                    {review.name && (
                      <p className="font-semibold text-gray-900">{review.name}</p>
                    )}
                    {review.company && (
                      <p className="text-sm text-gray-600">{review.company}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">{review.serviceType}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
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
                      Email (optional)
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="your.email@example.com"
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

        {/* Your Submitted Reviews - Gamified Collapsible */}
        {submittedReviews.length > 0 && (
          <div className="max-w-4xl mx-auto mt-8">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border-2 border-purple-200">
              <button
                onClick={() => setShowSubmittedReviews(!showSubmittedReviews)}
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">
                    {submittedReviews.length >= 10 ? '💎' :
                     submittedReviews.length >= 5 ? '🥇' :
                     submittedReviews.length >= 3 ? '🥈' : '🥉'}
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-gray-900">
                      {submittedReviews.length} Review{submittedReviews.length !== 1 ? 's' : ''} Submitted
                    </div>
                    <div className="text-xs text-gray-600">
                      {submittedReviews.length < 3 ? `${3 - submittedReviews.length} more to Silver tier` :
                       submittedReviews.length < 5 ? `${5 - submittedReviews.length} more to Gold tier` :
                       submittedReviews.length < 10 ? `${10 - submittedReviews.length} more to Diamond tier` :
                       'Diamond tier achieved! 🎉'}
                    </div>
                  </div>
                </div>
                <svg
                  className={`w-5 h-5 transition-transform ${showSubmittedReviews ? 'rotate-180' : ''}`}
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
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{width: `${Math.min((submittedReviews.length / 10) * 100, 100)}%`}}
                  />
                </div>
              </div>

              {/* Expandable Content */}
              {showSubmittedReviews && (
                <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
                  {submittedReviews.map((review) => (
                    <div key={review.id} className="bg-white rounded p-3 text-sm">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 mb-1">
                            {review.reviewText.length > 80
                              ? `${review.reviewText.substring(0, 80)}...`
                              : review.reviewText}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="flex">{renderStars(review.rating)}</span>
                            <span>•</span>
                            <span>{review.serviceType}</span>
                            <span>•</span>
                            <span>{new Date(review.timestamp).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
