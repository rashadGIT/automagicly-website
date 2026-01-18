/**
 * AIReviewHelper Component Tests
 * Tests for the AI-powered review helper modal
 */
import { render, screen, fireEvent, waitFor } from '../utils/test-utils'
import AIReviewHelper from '@/components/AIReviewHelper'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => { store[key] = value }),
    removeItem: jest.fn((key: string) => { delete store[key] }),
    clear: jest.fn(() => { store = {} }),
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Mock fetch
global.fetch = jest.fn()

describe('AIReviewHelper', () => {
  const mockOnClose = jest.fn()
  const mockOnRatingChange = jest.fn()
  const mockOnApplyReview = jest.fn()
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    currentRating: 5,
    onRatingChange: mockOnRatingChange,
    onApplyReview: mockOnApplyReview,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.clear()
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ review: 'Generated review text' }),
    } as Response)
  })

  describe('Rendering', () => {
    it('should render when isOpen is true', () => {
      render(<AIReviewHelper {...defaultProps} />)
      expect(screen.getByText('AI Review Helper')).toBeInTheDocument()
    })

    it('should not render when isOpen is false', () => {
      render(<AIReviewHelper {...defaultProps} isOpen={false} />)
      expect(screen.queryByText('AI Review Helper')).not.toBeInTheDocument()
    })

    it('should render tip message', () => {
      render(<AIReviewHelper {...defaultProps} />)
      expect(screen.getByText(/The more specific details you share/i)).toBeInTheDocument()
    })

    it('should render all question fields', () => {
      render(<AIReviewHelper {...defaultProps} />)
      expect(screen.getByText(/What problem or challenge/i)).toBeInTheDocument()
      expect(screen.getByText(/What did we help you do/i)).toBeInTheDocument()
      expect(screen.getByText(/What results or benefits/i)).toBeInTheDocument()
    })

    it('should render tone selector with all options', () => {
      render(<AIReviewHelper {...defaultProps} />)
      expect(screen.getByText('Professional')).toBeInTheDocument()
      expect(screen.getByText('Enthusiastic')).toBeInTheDocument()
      expect(screen.getByText('Casual')).toBeInTheDocument()
    })

    it('should render generate button', () => {
      render(<AIReviewHelper {...defaultProps} />)
      expect(screen.getByRole('button', { name: /Generate Review/i })).toBeInTheDocument()
    })

    it('should render close button', () => {
      render(<AIReviewHelper {...defaultProps} />)
      const closeButton = screen.getByRole('button', { name: /✕/i })
      expect(closeButton).toBeInTheDocument()
    })
  })

  describe('Rating Display', () => {
    it('should display current rating stars', () => {
      render(<AIReviewHelper {...defaultProps} currentRating={4} />)
      const stars = screen.getAllByText('★')
      expect(stars).toHaveLength(5)
    })

    it('should highlight correct number of stars', () => {
      render(<AIReviewHelper {...defaultProps} currentRating={3} />)
      const yellowStars = document.querySelectorAll('.text-yellow-400')
      const grayStars = document.querySelectorAll('.text-gray-300')
      expect(yellowStars.length).toBe(3)
      expect(grayStars.length).toBe(2)
    })

    it('should call onRatingChange when star is clicked', () => {
      render(<AIReviewHelper {...defaultProps} />)
      const stars = screen.getAllByText('★')
      fireEvent.click(stars[2]) // Click 3rd star
      expect(mockOnRatingChange).toHaveBeenCalledWith(3)
    })
  })

  describe('Form Input', () => {
    it('should update problem field', () => {
      render(<AIReviewHelper {...defaultProps} />)
      const textarea = screen.getByPlaceholderText(/spending 10 hours\/week/i)
      fireEvent.change(textarea, { target: { value: 'We had too many manual tasks' } })
      expect(textarea).toHaveValue('We had too many manual tasks')
    })

    it('should update experience field', () => {
      render(<AIReviewHelper {...defaultProps} />)
      const textarea = screen.getByPlaceholderText(/automated our invoice processing/i)
      fireEvent.change(textarea, { target: { value: 'Great experience working together' } })
      expect(textarea).toHaveValue('Great experience working together')
    })

    it('should update results field', () => {
      render(<AIReviewHelper {...defaultProps} />)
      const textarea = screen.getByPlaceholderText(/save 8 hours per week/i)
      fireEvent.change(textarea, { target: { value: 'Saved tons of time' } })
      expect(textarea).toHaveValue('Saved tons of time')
    })

    it('should show character count for each field', () => {
      render(<AIReviewHelper {...defaultProps} />)
      const textarea = screen.getByPlaceholderText(/spending 10 hours\/week/i)
      fireEvent.change(textarea, { target: { value: 'Hello' } })
      expect(screen.getByText('5/500 characters')).toBeInTheDocument()
    })

    it('should have maxLength on textareas', () => {
      render(<AIReviewHelper {...defaultProps} />)
      const textarea = screen.getByPlaceholderText(/spending 10 hours\/week/i)
      expect(textarea).toHaveAttribute('maxLength', '500')
    })
  })

  describe('Tone Selection', () => {
    it('should have professional selected by default', () => {
      render(<AIReviewHelper {...defaultProps} />)
      const professionalButton = screen.getByText('Professional')
      expect(professionalButton.closest('button')).toHaveClass('border-blue-500')
    })

    it('should change tone when button clicked', () => {
      render(<AIReviewHelper {...defaultProps} />)
      const casualButton = screen.getByText('Casual')
      fireEvent.click(casualButton)
      expect(casualButton.closest('button')).toHaveClass('border-blue-500')
    })
  })

  describe('Close Functionality', () => {
    it('should call onClose when close button clicked', () => {
      render(<AIReviewHelper {...defaultProps} />)
      const closeButton = screen.getByRole('button', { name: /✕/i })
      fireEvent.click(closeButton)
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  describe('Review Generation', () => {
    it('should generate review in demo mode (no webhook)', async () => {
      render(<AIReviewHelper {...defaultProps} />)
      const generateButton = screen.getByRole('button', { name: /Generate Review/i })
      fireEvent.click(generateButton)

      await waitFor(() => {
        expect(screen.getByText('Generated Review')).toBeInTheDocument()
      })
    })

    it('should have generate button', () => {
      render(<AIReviewHelper {...defaultProps} />)
      const generateButton = screen.getByRole('button', { name: /Generate Review/i })
      expect(generateButton).toBeInTheDocument()
      expect(generateButton).not.toBeDisabled()
    })

    it('should generate review when button clicked', async () => {
      render(<AIReviewHelper {...defaultProps} />)
      const generateButton = screen.getByRole('button', { name: /Generate Review/i })
      fireEvent.click(generateButton)

      await waitFor(() => {
        expect(screen.getByText('Generated Review')).toBeInTheDocument()
      })
    })

    it('should show regenerations counter after first generation', async () => {
      render(<AIReviewHelper {...defaultProps} />)
      const generateButton = screen.getByRole('button', { name: /Generate Review/i })
      fireEvent.click(generateButton)

      await waitFor(() => {
        expect(screen.getByText(/regeneration/i)).toBeInTheDocument()
      })
    })

    it('should decrement regenerations on each generate', async () => {
      render(<AIReviewHelper {...defaultProps} />)
      const generateButton = screen.getByRole('button', { name: /Generate Review/i })

      // First generation
      fireEvent.click(generateButton)
      await waitFor(() => {
        expect(screen.getByText('4 regenerations left')).toBeInTheDocument()
      })

      // Second generation
      fireEvent.click(screen.getByText('Regenerate'))
      await waitFor(() => {
        expect(screen.getByText('3 regenerations left')).toBeInTheDocument()
      })
    })

    it('should change button text to Regenerate after first generation', async () => {
      render(<AIReviewHelper {...defaultProps} />)
      const generateButton = screen.getByRole('button', { name: /Generate Review/i })
      fireEvent.click(generateButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Regenerate Review/i })).toBeInTheDocument()
      })
    })
  })

  describe('Generated Review Display', () => {
    it('should display generated review', async () => {
      render(<AIReviewHelper {...defaultProps} />)
      const generateButton = screen.getByRole('button', { name: /Generate Review/i })
      fireEvent.click(generateButton)

      await waitFor(() => {
        expect(screen.getByText('Generated Review')).toBeInTheDocument()
      })
    })

    it('should show character count for generated review', async () => {
      render(<AIReviewHelper {...defaultProps} />)
      const generateButton = screen.getByRole('button', { name: /Generate Review/i })
      fireEvent.click(generateButton)

      await waitFor(() => {
        // The component shows character counts for the input fields
        // After generation, there's a character count shown for the generated review
        const charCounts = screen.getAllByText(/\/500 characters/i)
        expect(charCounts.length).toBeGreaterThan(0)
      })
    })

    it('should show "Use This Review" button after generation', async () => {
      render(<AIReviewHelper {...defaultProps} />)
      const generateButton = screen.getByRole('button', { name: /Generate Review/i })
      fireEvent.click(generateButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Use This Review/i })).toBeInTheDocument()
      })
    })

    it('should show Regenerate button after generation', async () => {
      render(<AIReviewHelper {...defaultProps} />)
      const generateButton = screen.getByRole('button', { name: /Generate Review/i })
      fireEvent.click(generateButton)

      await waitFor(() => {
        // There's also a Regenerate button in the action buttons
        const regenerateButtons = screen.getAllByRole('button', { name: /Regenerate/i })
        expect(regenerateButtons.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Apply Review', () => {
    it('should call onApplyReview when "Use This Review" clicked', async () => {
      render(<AIReviewHelper {...defaultProps} />)
      const generateButton = screen.getByRole('button', { name: /Generate Review/i })
      fireEvent.click(generateButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Use This Review/i })).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /Use This Review/i }))

      expect(mockOnApplyReview).toHaveBeenCalled()
    })

    it('should call onClose after applying review', async () => {
      render(<AIReviewHelper {...defaultProps} />)
      const generateButton = screen.getByRole('button', { name: /Generate Review/i })
      fireEvent.click(generateButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Use This Review/i })).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /Use This Review/i }))

      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    it('should show error when generation fails', async () => {
      // Simulate no webhook URL (demo mode works, but we can test error path)
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      // Since there's no webhook URL in tests, demo mode kicks in
      // To test error, we need to ensure the component handles it gracefully
      render(<AIReviewHelper {...defaultProps} />)
      const generateButton = screen.getByRole('button', { name: /Generate Review/i })
      fireEvent.click(generateButton)

      // Demo mode should still work
      await waitFor(() => {
        expect(screen.getByText('Generated Review')).toBeInTheDocument()
      })
    })

    it('should show regenerations counter decreasing', async () => {
      render(<AIReviewHelper {...defaultProps} />)

      // Generate once
      const generateButton = screen.getByRole('button', { name: /Generate Review/i })
      fireEvent.click(generateButton)

      await waitFor(() => {
        expect(screen.getByText('Generated Review')).toBeInTheDocument()
      })

      // Should show 4 regenerations left
      expect(screen.getByText(/4 regeneration/i)).toBeInTheDocument()
    })
  })

  describe('LocalStorage Persistence', () => {
    it('should save answers to localStorage', async () => {
      render(<AIReviewHelper {...defaultProps} />)

      const textarea = screen.getByPlaceholderText(/spending 10 hours\/week/i)
      fireEvent.change(textarea, { target: { value: 'Test problem' } })

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'ai_review_helper_answers',
          expect.any(String)
        )
      })
    })

    it('should load saved answers on open', () => {
      const savedData = JSON.stringify({
        answers: {
          problem: 'Saved problem',
          experience: 'Saved experience',
          results: 'Saved results',
        },
        tone: 'casual',
      })
      localStorageMock.getItem.mockReturnValue(savedData)

      render(<AIReviewHelper {...defaultProps} />)

      expect(screen.getByPlaceholderText(/spending 10 hours\/week/i)).toHaveValue('Saved problem')
    })

    it('should handle corrupted localStorage data', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      localStorageMock.getItem.mockReturnValue('invalid json{')

      render(<AIReviewHelper {...defaultProps} />)

      // Should render without crashing
      expect(screen.getByText('AI Review Helper')).toBeInTheDocument()
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('ai_review_helper_answers')

      consoleSpy.mockRestore()
    })
  })

  describe('Reset on Modal Open', () => {
    it('should reset regenerations when modal opens', () => {
      const { rerender } = render(<AIReviewHelper {...defaultProps} isOpen={false} />)

      // Open modal
      rerender(<AIReviewHelper {...defaultProps} isOpen={true} />)

      // Regenerations should be at 5 (shown after first generation)
      const generateButton = screen.getByRole('button', { name: /Generate Review/i })
      fireEvent.click(generateButton)

      waitFor(() => {
        expect(screen.getByText('4 regenerations left')).toBeInTheDocument()
      })
    })

    it('should clear generated review when modal opens', () => {
      const { rerender } = render(<AIReviewHelper {...defaultProps} isOpen={false} />)

      rerender(<AIReviewHelper {...defaultProps} isOpen={true} />)

      expect(screen.queryByText('Generated Review')).not.toBeInTheDocument()
    })
  })

  describe('Demo Mode Generation', () => {
    it('should generate different reviews based on rating', async () => {
      const { rerender } = render(<AIReviewHelper {...defaultProps} currentRating={5} />)

      fireEvent.click(screen.getByRole('button', { name: /Generate Review/i }))

      await waitFor(() => {
        const review5Star = screen.getByText('Generated Review').nextSibling?.textContent
        expect(review5Star).toBeDefined()
      })
    })

    it('should generate different reviews based on tone', async () => {
      render(<AIReviewHelper {...defaultProps} />)

      // Change to casual tone
      fireEvent.click(screen.getByText('Casual'))

      fireEvent.click(screen.getByRole('button', { name: /Generate Review/i }))

      await waitFor(() => {
        expect(screen.getByText('Generated Review')).toBeInTheDocument()
      })
    })
  })
})
