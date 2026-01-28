'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { sanitizeHtml } from '@/lib/utils';
import toast, { Toaster } from 'react-hot-toast';

interface Review {
  id: string;
  name?: string;
  email?: string;
  company?: string;
  rating: number;
  reviewText: string;
  serviceType: string;
  status: 'pending' | 'approved' | 'rejected';
  featured?: boolean;
  submittedAt: string;
  approvedAt?: string;
}

export default function AdminReviews() {
  const { data: session, status } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [loading, setLoading] = useState(false);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/reviews-simple');

      if (!response.ok) {
        throw new Error(`Failed to load reviews: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Check for API error
      if (!data.success && data.error) {
        throw new Error(data.error);
      }

      // Filter client-side
      let filtered = data.reviews || [];
      if (filter !== 'all') {
        filtered = filtered.filter((r: Review) => r.status === filter);
      }
      setReviews(filtered);
    } catch (error) {
      // Log error and show toast notification
      console.error('Error loading reviews:', error);
      toast.error('Failed to load reviews. Please refresh the page.');
      // Set empty array so UI shows "no reviews" rather than stale data
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    if (status === 'authenticated') {
      loadReviews();
    }
  }, [status, loadReviews]);

  const updateReviewStatus = async (id: string, status: 'approved' | 'rejected') => {
    const loadingToast = toast.loading(`${status === 'approved' ? 'Approving' : 'Rejecting'} review...`);
    try {
      const response = await fetch('/api/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });

      if (response.ok) {
        toast.success(`Review ${status}!`, { id: loadingToast });
        loadReviews();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update review', { id: loadingToast });
      }
    } catch (error) {
      toast.error('Failed to update review', { id: loadingToast });
    }
  };

  const toggleFeatured = async (id: string, currentFeatured: boolean) => {
    const action = currentFeatured ? 'Unfeaturing' : 'Featuring';
    const loadingToast = toast.loading(`${action} review...`);
    try {
      const response = await fetch('/api/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, featured: !currentFeatured })
      });

      if (response.ok) {
        toast.success(`Review ${currentFeatured ? 'unfeatured' : 'featured'}!`, { id: loadingToast });
        loadReviews();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update featured status', { id: loadingToast });
      }
    } catch (error) {
      toast.error('Failed to update featured status', { id: loadingToast });
    }
  };

  const deleteReview = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    const loadingToast = toast.loading('Deleting review...');
    try {
      const response = await fetch(`/api/reviews?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Review deleted!', { id: loadingToast });
        loadReviews();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete review', { id: loadingToast });
      }
    } catch (error) {
      toast.error('Failed to delete review', { id: loadingToast });
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={star <= rating ? 'text-yellow-400 text-xl' : 'text-gray-300 text-xl'}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Admin dashboard
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Review Management</h1>
              <p className="text-sm text-gray-600 mt-1">
                Signed in as {session?.user?.email}
              </p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex gap-4">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-6 py-2 rounded-lg font-semibold transition ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
          <div className="mt-4">
            <button
              onClick={loadReviews}
              disabled={loading}
              className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
            >
              {loading ? 'Loading...' : '🔄 Refresh'}
            </button>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-xl shadow p-12 text-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-12 text-center">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-600">No {filter !== 'all' ? filter : ''} reviews found</p>
              <p className="text-sm text-gray-500 mt-2">
                Reviews will appear here when submitted through your website
              </p>
            </div>
          ) : (
            reviews.map((review) => (
              <div
                key={review.id}
                className={`bg-white rounded-xl shadow-lg p-6 ${
                  review.status === 'approved'
                    ? 'border-l-4 border-green-500'
                    : review.status === 'rejected'
                    ? 'border-l-4 border-red-500'
                    : 'border-l-4 border-yellow-500'
                }`}
              >
                {/* Review Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        {sanitizeHtml(review.name || 'Anonymous')}
                      </h3>
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-semibold ${
                          review.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : review.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {review.status.toUpperCase()}
                      </span>
                      {review.featured && (
                        <span className="text-xs px-3 py-1 rounded-full font-semibold bg-purple-100 text-purple-800">
                          ⭐ FEATURED
                        </span>
                      )}
                      {review.status === 'approved' && (
                        <button
                          onClick={() => toggleFeatured(review.id, review.featured || false)}
                          className={`text-xs px-3 py-1 rounded-full font-semibold transition ${
                            review.featured
                              ? 'bg-purple-600 text-white hover:bg-purple-700'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                          title={review.featured ? 'Remove from featured' : 'Feature this review'}
                        >
                          {review.featured ? '⭐ Unfeature' : '☆ Feature'}
                        </button>
                      )}
                    </div>
                    {review.email && (
                      <p className="text-sm text-gray-600">📧 {sanitizeHtml(review.email)}</p>
                    )}
                    {review.company && (
                      <p className="text-sm text-gray-600">🏢 {sanitizeHtml(review.company)}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Service: {sanitizeHtml(review.serviceType)} • Submitted: {new Date(review.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                  {renderStars(review.rating)}
                </div>

                {/* Review Text */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-gray-800 whitespace-pre-wrap">{sanitizeHtml(review.reviewText)}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  {review.status !== 'approved' && (
                    <button
                      onClick={() => updateReviewStatus(review.id, 'approved')}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                    >
                      ✓ Approve
                    </button>
                  )}
                  {review.status !== 'rejected' && (
                    <button
                      onClick={() => updateReviewStatus(review.id, 'rejected')}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                    >
                      ✗ Reject
                    </button>
                  )}
                  <button
                    onClick={() => deleteReview(review.id)}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
