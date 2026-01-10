'use client';

import { useState, useEffect } from 'react';
import type { ReviewFormData } from '@/lib/types';
import { sendToN8N, sanitizeHtml } from '@/lib/utils';
import AIReviewHelper from './AIReviewHelper';

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
  const [showAIHelper, setShowAIHelper] = useState(false);
  const [isAIAssisted, setIsAIAssisted] = useState(false);
  const [expandedReviewIndex, setExpandedReviewIndex] = useState<number | null>(null);
  const [drawerReview, setDrawerReview] = useState<ReviewFormData | null>(null);

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

  // Handle ESC key to close drawer
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && drawerReview) {
        setDrawerReview(null);
      }
    };

    if (drawerReview) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when drawer is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [drawerReview]);

  const loadApprovedReviews = async () => {
    setLoadingApproved(true);
    try {
      const response = await fetch('/api/reviews-simple');
      const data = await response.json();
      // Filter for approved reviews with rating > 3 (4 and 5 stars only)
      const approved = (data.reviews || []).filter((r: ReviewFormData) =>
        r.status === 'approved' && r.rating > 3
      );
      setApprovedReviews(approved);

      // Separate featured and non-featured reviews
      const featured = approved.filter((r: ReviewFormData) => r.featured === true);
      const nonFeatured = approved.filter((r: ReviewFormData) => r.featured !== true);

      // Randomize non-featured reviews
      const randomizedNonFeatured = [...nonFeatured].sort(() => 0.5 - Math.random());

      // Show featured first, then random non-featured, limit to 3 total
      const combined = [...featured, ...randomizedNonFeatured].slice(0, 3);
      setDisplayReviews(combined);
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
      // Clean up formData and set defaults for optional fields
      const cleanData: any = {
        name: formData.name && formData.name.trim() ? formData.name.trim() : 'Anonymous',
        email: formData.email,
        company: formData.company && formData.company.trim() ? formData.company.trim() : 'Anonymous Company',
        rating: formData.rating,
        reviewText: formData.reviewText,
        serviceType: formData.serviceType,
      };

      const success = await sendToN8N(WEBHOOK_URL, cleanData);

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

  const handleAIReviewApply = (review: string) => {
    setFormData(prev => ({ ...prev, reviewText: review }));
    setIsAIAssisted(true);
  };

  const handleRatingChange = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));
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
              {displayReviews.map((review, index) => {
                const reviewText = review.review_text || review.reviewText || '';
                const reviewLength = reviewText.length;
                const isExpanded = expandedReviewIndex === index;

                // Determine display logic based on length
                const needsTruncation = reviewLength > 300;
                const isLongReview = reviewLength > 1000; // Use drawer
                const isMediumReview = reviewLength > 300 && reviewLength <= 1000; // Inline expand

                // Truncate at last complete word before 300 chars, keeping the space
                let displayText = reviewText;
                if (needsTruncation && !isExpanded) {
                  const lastSpaceIndex = reviewText.lastIndexOf(' ', 300);
                  displayText = lastSpaceIndex > 0
                    ? reviewText.substring(0, lastSpaceIndex + 1)
                    : reviewText.substring(0, 300);
                }

                const handleExpand = () => {
                  if (isLongReview) {
                    setDrawerReview(review);
                  } else {
                    // Auto-collapse other reviews when expanding this one
                    setExpandedReviewIndex(isExpanded ? null : index);
                  }
                };

                return (
                  <div
                    key={index}
                    className={`bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 relative ${
                      isExpanded ? 'h-auto' : 'h-[400px]'
                    } flex flex-col`}
                  >
                    {review.featured && (
                      <div className="absolute top-4 right-4">
                        <span className="text-2xl" title="Featured Review">⭐</span>
                      </div>
                    )}

                    <div className="mb-4">
                      {renderStars(review.rating)}
                    </div>

                    <div className={isExpanded ? '' : 'flex-1 overflow-hidden'}>
                      <p className="text-gray-700 mb-4 italic transition-all duration-300">
                        "{sanitizeHtml(displayText)}{needsTruncation && !isExpanded && '...'}"
                      </p>

                      {needsTruncation && (
                        <button
                          onClick={handleExpand}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleExpand();
                            }
                          }}
                          className={`text-sm font-medium mb-4 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1 ${
                            isLongReview
                              ? 'text-purple-600 hover:text-purple-700'
                              : 'text-blue-600 hover:text-blue-700'
                          }`}
                          aria-expanded={isExpanded}
                          aria-label={isExpanded ? 'Show less' : isLongReview ? 'Read full review in panel' : 'Read more'}
                        >
                          {isExpanded ? (
                            <>Show less ↑</>
                          ) : isLongReview ? (
                            <>Read full review →</>
                          ) : (
                            <>Read more ↓</>
                          )}
                        </button>
                      )}
                    </div>

                    <div className="border-t pt-4 mt-auto">
                      <p className="font-semibold text-gray-900">{sanitizeHtml(review.name || 'Anonymous')}</p>
                      {review.company && review.company !== 'Anonymous Company' && (
                        <p className="text-sm text-gray-600">{sanitizeHtml(review.company)}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">{sanitizeHtml(review.service_type || review.serviceType)}</p>
                    </div>
                  </div>
                );
              })}
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
                      Email *
                    </label>
                    <input
                      type="email"
                      required
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
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Your Review *
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowAIHelper(true)}
                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                      >
                        <span className="text-lg">✨</span>
                        Get AI help
                      </button>
                    </div>
                    <textarea
                      required
                      rows={5}
                      maxLength={400}
                      value={formData.reviewText}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, reviewText: e.target.value }));
                        // If user manually edits, remove AI-assisted flag
                        if (isAIAssisted && e.target.value !== formData.reviewText) {
                          setIsAIAssisted(false);
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Tell us about your experience..."
                    />
                    <div className="flex justify-between items-center mt-1">
                      <div className="text-xs text-gray-500">
                        {formData.reviewText.length}/400 characters
                        {formData.reviewText.length >= 100 && formData.reviewText.length <= 350 && ' - great length!'}
                        {formData.reviewText.length > 0 && formData.reviewText.length < 100 && ' - consider adding more detail'}
                        {formData.reviewText.length > 350 && formData.reviewText.length < 400 && ' - getting close to limit'}
                      </div>
                      {isAIAssisted && (
                        <div className="flex items-center gap-1 text-xs text-purple-600">
                          <span>✨</span>
                          <span>AI-assisted review</span>
                        </div>
                      )}
                    </div>
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

      {/* Slide-in Drawer for Long Reviews */}
      {drawerReview && (
        <div
          className="fixed inset-0 z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="drawer-title"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
            onClick={() => setDrawerReview(null)}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div
            className="fixed inset-y-0 right-0 max-w-full flex"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-screen max-w-md md:max-w-lg lg:max-w-xl">
              <div className="h-full flex flex-col bg-white shadow-2xl animate-slide-in">
                {/* Header */}
                <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-gray-200">
                  <div className="flex items-start justify-between">
                    <h2
                      id="drawer-title"
                      className="text-2xl font-bold text-gray-900"
                    >
                      Full Review
                    </h2>
                    <button
                      onClick={() => setDrawerReview(null)}
                      className="text-gray-500 hover:text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 rounded p-1"
                      aria-label="Close panel"
                    >
                      <span className="text-2xl">✕</span>
                    </button>
                  </div>
                </div>

                {/* Content - Scrollable with custom smooth scrollbar */}
                <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
                  <div className="mb-6">
                    {renderStars(drawerReview.rating)}
                  </div>

                  <blockquote className="text-gray-700 text-lg italic leading-relaxed mb-6">
                    "{sanitizeHtml(drawerReview.review_text || drawerReview.reviewText)}"
                  </blockquote>

                  <div className="border-t pt-6">
                    <p className="font-semibold text-gray-900 text-lg">
                      {sanitizeHtml(drawerReview.name || 'Anonymous')}
                    </p>
                    {drawerReview.company && drawerReview.company !== 'Anonymous Company' && (
                      <p className="text-gray-600 mt-2">{sanitizeHtml(drawerReview.company)}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-2">
                      {sanitizeHtml(drawerReview.service_type || drawerReview.serviceType)}
                    </p>
                  </div>
                </div>

                {/* Footer with hint */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <p className="text-xs text-gray-500 text-center">
                    Press ESC or click outside to close
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Review Helper Modal */}
      <AIReviewHelper
        isOpen={showAIHelper}
        onClose={() => setShowAIHelper(false)}
        currentRating={formData.rating}
        onRatingChange={handleRatingChange}
        onApplyReview={handleAIReviewApply}
      />
    </section>
  );
}
