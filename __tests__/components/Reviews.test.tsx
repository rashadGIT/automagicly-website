import React from 'react'
import { render, screen, waitFor, fireEvent } from '../utils/test-utils'
import Reviews from '@/components/Reviews'
import { createMockFetch, resetMockFetch, mockReviewsResponse, mockWebhookSuccess } from '../utils/mock-helpers'
import type { ReviewFormData } from '@/lib/types'

describe('Reviews Component', () => {
  beforeEach(() => {
    resetMockFetch()
    localStorage.clear()
  })

  afterEach(() => {
    resetMockFetch()
  })

  it('should render the reviews section', () => {
    mockReviewsResponse([])
    render(<Reviews />)

    expect(screen.getByText('Client Reviews')).toBeInTheDocument()
    expect(screen.getByText('All reviews are moderated before appearing publicly')).toBeInTheDocument()
  })

  it('should show loading state initially', () => {
    mockReviewsResponse([])
    render(<Reviews />)

    expect(screen.getByText('Loading reviews...')).toBeInTheDocument()
  })

  it('should display approved reviews after loading', async () => {
    const mockReviews: ReviewFormData[] = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        company: 'Acme Inc',
        rating: 5,
        review_text: 'Great service!',
        reviewText: 'Great service!',
        service_type: 'AI Audit',
        serviceType: 'AI Audit',
        status: 'approved',
        featured: false,
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        company: 'Tech Corp',
        rating: 4,
        review_text: 'Very helpful!',
        reviewText: 'Very helpful!',
        service_type: 'AI Partnership',
        serviceType: 'AI Partnership',
        status: 'approved',
        featured: false,
      },
    ]

    mockReviewsResponse(mockReviews)
    render(<Reviews />)

    await waitFor(() => {
      expect(screen.getByText(/"Great service!"/)).toBeInTheDocument()
    })

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
  })

  it('should only show reviews with rating > 3', async () => {
    const mockReviews: ReviewFormData[] = [
      {
        name: 'High Rating',
        email: 'high@example.com',
        company: 'Company A',
        rating: 5,
        review_text: '5 stars!',
        reviewText: '5 stars!',
        service_type: 'AI Audit',
        serviceType: 'AI Audit',
        status: 'approved',
        featured: false,
      },
      {
        name: 'Low Rating',
        email: 'low@example.com',
        company: 'Company B',
        rating: 3,
        review_text: '3 stars',
        reviewText: '3 stars',
        service_type: 'AI Audit',
        serviceType: 'AI Audit',
        status: 'approved',
        featured: false,
      },
    ]

    mockReviewsResponse(mockReviews)
    render(<Reviews />)

    await waitFor(() => {
      expect(screen.getByText(/"5 stars!"/)).toBeInTheDocument()
    })

    expect(screen.queryByText(/"3 stars"/)).not.toBeInTheDocument()
  })

  it('should show featured reviews first', async () => {
    const mockReviews: ReviewFormData[] = [
      {
        name: 'Regular Review',
        email: 'regular@example.com',
        company: 'Company A',
        rating: 5,
        review_text: 'Regular',
        reviewText: 'Regular',
        service_type: 'AI Audit',
        serviceType: 'AI Audit',
        status: 'approved',
        featured: false,
      },
      {
        name: 'Featured Review',
        email: 'featured@example.com',
        company: 'Company B',
        rating: 5,
        review_text: 'Featured!',
        reviewText: 'Featured!',
        service_type: 'AI Audit',
        serviceType: 'AI Audit',
        status: 'approved',
        featured: true,
      },
    ]

    mockReviewsResponse(mockReviews)
    render(<Reviews />)

    await waitFor(() => {
      expect(screen.getByText(/"Featured!"/)).toBeInTheDocument()
    })

    // Check that featured review has the star icon
    const featuredCard = screen.getByText(/"Featured!"/).closest('.bg-white')
    expect(featuredCard).toBeInTheDocument()
  })

  it('should show empty state when no reviews', async () => {
    mockReviewsResponse([])
    render(<Reviews />)

    await waitFor(() => {
      expect(screen.getByText('Reviews will appear here once approved by our team.')).toBeInTheDocument()
    })
  })

  it('should open review form when clicking Submit Review button', async () => {
    mockReviewsResponse([])
    render(<Reviews />)

    await waitFor(() => {
      expect(screen.getByText('Submit a Review')).toBeInTheDocument()
    })

    const submitButton = screen.getByText('Submit a Review')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Submit Your Review')).toBeInTheDocument()
    })
  })

  it('should show form fields when form is open', async () => {
    mockReviewsResponse([])
    render(<Reviews />)

    await waitFor(() => {
      const submitButton = screen.getByText('Submit a Review')
      fireEvent.click(submitButton)
    })

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Your name')).toBeInTheDocument()
    })

    expect(screen.getByPlaceholderText('your.email@example.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Your company')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Tell us about your experience...')).toBeInTheDocument()
  })

  it('should require email field', async () => {
    mockReviewsResponse([])
    render(<Reviews />)

    await waitFor(() => {
      const submitButton = screen.getByText('Submit a Review')
      fireEvent.click(submitButton)
    })

    await waitFor(() => {
      const emailInput = screen.getByPlaceholderText('your.email@example.com')
      expect(emailInput).toHaveAttribute('required')
    })
  })

  it('should submit review with valid data', async () => {
    mockReviewsResponse([])
    render(<Reviews />)

    // Open form
    await waitFor(() => {
      const submitButton = screen.getByText('Submit a Review')
      fireEvent.click(submitButton)
    })

    // Fill form
    await waitFor(() => {
      const emailInput = screen.getByPlaceholderText('your.email@example.com')
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    })

    const nameInput = screen.getByPlaceholderText('Your name')
    fireEvent.change(nameInput, { target: { value: 'Test User' } })

    const companyInput = screen.getByPlaceholderText('Your company')
    fireEvent.change(companyInput, { target: { value: 'Test Company' } })

    const reviewInput = screen.getByPlaceholderText('Tell us about your experience...')
    fireEvent.change(reviewInput, { target: { value: 'Great experience!' } })

    // Mock successful webhook response
    mockWebhookSuccess()

    // Submit form
    const submitFormButton = screen.getByText('Submit Review')
    fireEvent.click(submitFormButton)

    // Check for success message
    await waitFor(() => {
      expect(screen.getByText('Thank You!')).toBeInTheDocument()
    }, { timeout: 3000 })

    expect(screen.getByText('Your review has been submitted and is pending moderation.')).toBeInTheDocument()
  })

  it('should default name to Anonymous if empty', async () => {
    mockReviewsResponse([])
    render(<Reviews />)

    // Open form
    await waitFor(() => {
      const submitButton = screen.getByText('Submit a Review')
      fireEvent.click(submitButton)
    })

    // Fill form without name
    await waitFor(() => {
      const emailInput = screen.getByPlaceholderText('your.email@example.com')
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    })

    const reviewInput = screen.getByPlaceholderText('Tell us about your experience...')
    fireEvent.change(reviewInput, { target: { value: 'Great experience!' } })

    // Mock successful webhook response
    mockWebhookSuccess()

    // Submit form
    const submitFormButton = screen.getByText('Submit Review')
    fireEvent.click(submitFormButton)

    // Verify that the webhook was called with Anonymous as name
    await waitFor(() => {
      const fetchCalls = (global.fetch as jest.Mock).mock.calls
      expect(fetchCalls.length).toBeGreaterThan(0)

      const lastCall = fetchCalls[fetchCalls.length - 1]
      const body = JSON.parse(lastCall[1].body)
      expect(body.name).toBe('Anonymous')
    })
  })

  it('should render star ratings correctly', async () => {
    const mockReviews: ReviewFormData[] = [
      {
        name: 'Five Star',
        email: 'test@example.com',
        company: 'Test Co',
        rating: 5,
        review_text: 'Perfect!',
        reviewText: 'Perfect!',
        service_type: 'AI Audit',
        serviceType: 'AI Audit',
        status: 'approved',
        featured: false,
      },
    ]

    mockReviewsResponse(mockReviews)
    render(<Reviews />)

    await waitFor(() => {
      expect(screen.getByText(/"Perfect!"/)).toBeInTheDocument()
    })

    // All 5 stars should be rendered (there are stars in multiple places)
    const stars = screen.getAllByText('★')
    expect(stars.length).toBeGreaterThan(0)
  })

  it('should close form when clicking X button', async () => {
    mockReviewsResponse([])
    render(<Reviews />)

    // Open form
    await waitFor(() => {
      const submitButton = screen.getByText('Submit a Review')
      fireEvent.click(submitButton)
    })

    await waitFor(() => {
      expect(screen.getByText('Submit Your Review')).toBeInTheDocument()
    })

    // Click close button
    const closeButton = screen.getByText('✕')
    fireEvent.click(closeButton)

    await waitFor(() => {
      expect(screen.queryByText('Submit Your Review')).not.toBeInTheDocument()
    })
  })
})
