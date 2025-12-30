'use client';

import { useState, useEffect } from 'react';

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [loading, setLoading] = useState(false);

  // Simple password protection (in production, use proper authentication)
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';
    if (password === adminPassword) {
      setIsAuthenticated(true);
      loadReviews();
    } else {
      alert('Invalid password');
    }
  };

  const loadReviews = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/reviews-simple');
      const data = await response.json();
      // Filter client-side
      let filtered = data.reviews || [];
      if (filter !== 'all') {
        filtered = filtered.filter((r: Review) => r.status === filter);
      }
      setReviews(filtered);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateReviewStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const response = await fetch('/api/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });

      if (response.ok) {
        alert(`Review ${status}!`);
        loadReviews();
      }
    } catch (error) {
      console.error('Error updating review:', error);
      alert('Failed to update review');
    }
  };

  const toggleFeatured = async (id: string, currentFeatured: boolean) => {
    try {
      const response = await fetch('/api/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, featured: !currentFeatured })
      });

      if (response.ok) {
        loadReviews();
      }
    } catch (error) {
      console.error('Error toggling featured:', error);
      alert('Failed to update featured status');
    }
  };

  const deleteReview = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      const response = await fetch(`/api/reviews?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Review deleted!');
        loadReviews();
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review');
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

  useEffect(() => {
    if (isAuthenticated) {
      loadReviews();
    }
  }, [filter, isAuthenticated]);

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter admin password"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              Login
            </button>
            <p className="text-xs text-gray-500 mt-4">
              Default password: admin123 (change this in production!)
            </p>
          </form>
        </div>
      </div>
    );
  }

  // Admin dashboard
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Review Management</h1>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Logout
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
                        {review.name || 'Anonymous'}
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
                      <p className="text-sm text-gray-600">📧 {review.email}</p>
                    )}
                    {review.company && (
                      <p className="text-sm text-gray-600">🏢 {review.company}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Service: {review.serviceType} • Submitted: {new Date(review.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                  {renderStars(review.rating)}
                </div>

                {/* Review Text */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-gray-800 whitespace-pre-wrap">{review.reviewText}</p>
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
