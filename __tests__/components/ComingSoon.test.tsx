/**
 * ComingSoon Component Tests
 * Tests for the coming soon/waitlist component
 */
import { render, screen, fireEvent, waitFor } from '../utils/test-utils'
import ComingSoon from '@/components/ComingSoon'

// Mock utils
jest.mock('@/lib/utils', () => ({
  sendToN8N: jest.fn(),
}))

import { sendToN8N } from '@/lib/utils'

const mockSendToN8N = sendToN8N as jest.MockedFunction<typeof sendToN8N>

describe('ComingSoon', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render the coming soon section', () => {
      render(<ComingSoon />)
      expect(screen.getByText('Coming Soon')).toBeInTheDocument()
    })

    it('should render description', () => {
      render(<ComingSoon />)
      expect(screen.getByText(/New products to make automation even easier/i)).toBeInTheDocument()
    })

    it('should render Business-in-a-Box product card', () => {
      render(<ComingSoon />)
      // There's both a heading and dropdown option with this text
      const heading = screen.getByRole('heading', { name: /Business-in-a-Box/i })
      expect(heading).toBeInTheDocument()
      expect(screen.getByText(/Prebuilt automation templates/i)).toBeInTheDocument()
    })

    it('should render Start-Up-in-a-Box card', () => {
      render(<ComingSoon />)
      const heading = screen.getByRole('heading', { name: /Start-Up-in-a-Box/i })
      expect(heading).toBeInTheDocument()
      expect(screen.getByText(/Lightweight, quick-start automations/i)).toBeInTheDocument()
    })

    it('should render Assistant-in-a-Box card', () => {
      render(<ComingSoon />)
      const heading = screen.getByRole('heading', { name: /Assistant-in-a-Box/i })
      expect(heading).toBeInTheDocument()
      expect(screen.getByText(/Lightweight, quick-start automations/i)).toBeInTheDocument()
    })

    it('should render waitlist form', () => {
      render(<ComingSoon />)
      expect(screen.getByText('Join the Waitlist')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('your@email.com')).toBeInTheDocument()
      expect(screen.getByLabelText(/I'm interested in/i)).toBeInTheDocument()
    })

    it('should render join button', () => {
      render(<ComingSoon />)
      expect(screen.getByRole('button', { name: /Join Waitlist/i })).toBeInTheDocument()
    })
  })

  describe('Product Cards Content', () => {
    it('should list Business-in-a-Box features', () => {
      render(<ComingSoon />)
      expect(screen.getByText(/Industry-specific packs/i)).toBeInTheDocument()
      expect(screen.getByText(/Pre-configured integrations/i)).toBeInTheDocument()
      expect(screen.getByText(/Documentation and training included/i)).toBeInTheDocument()
      expect(screen.getByText(/One-time purchase, yours forever/i)).toBeInTheDocument()
    })

    it('should list Automation Packs features', () => {
      render(<ComingSoon />)
      expect(screen.getByText(/Lead capture & follow-up starter/i)).toBeInTheDocument()
      expect(screen.getByText(/Invoice automation bundle/i)).toBeInTheDocument()
      expect(screen.getByText(/Customer onboarding kit/i)).toBeInTheDocument()
      expect(screen.getByText(/Fixed scope, fixed price, fast delivery/i)).toBeInTheDocument()
    })
  })

  describe('Form Input', () => {
    it('should update email field', () => {
      render(<ComingSoon />)
      const input = screen.getByPlaceholderText('your@email.com')
      fireEvent.change(input, { target: { value: 'test@example.com' } })
      expect(input).toHaveValue('test@example.com')
    })

    it('should have interest dropdown with default value', () => {
      render(<ComingSoon />)
      const select = screen.getByLabelText(/I'm interested in/i)
      expect(select).toHaveValue('business-in-a-box')
    })

    it('should allow changing interest selection', () => {
      render(<ComingSoon />)
      const select = screen.getByLabelText(/I'm interested in/i)
      fireEvent.change(select, { target: { value: 'automation-packs' } })
      expect(select).toHaveValue('automation-packs')
    })

    it('should have all interest options', () => {
      render(<ComingSoon />)
      const select = screen.getByLabelText(/I'm interested in/i)

      expect(screen.getByRole('option', { name: /Business-in-a-Box/i })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: /Start-Up-in-a-Box/i })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: /Assistant-in-a-Box/i })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: /All Products/i })).toBeInTheDocument()
    })
  })

  describe('Form Submission', () => {
    it('should call sendToN8N on submit', async () => {
      mockSendToN8N.mockResolvedValueOnce(true)
      render(<ComingSoon />)

      const emailInput = screen.getByPlaceholderText('your@email.com')
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })

      const submitButton = screen.getByRole('button', { name: /Join Waitlist/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockSendToN8N).toHaveBeenCalled()
      })

      // Verify the call arguments
      expect(mockSendToN8N).toHaveBeenCalledWith(
        expect.anything(), // WEBHOOK_URL from env (may be undefined or actual URL)
        expect.objectContaining({
          email: 'test@example.com',
          interest: 'business-in-a-box',
        })
      )
    })

    it('should send correct interest value when changed', async () => {
      mockSendToN8N.mockResolvedValueOnce(true)
      render(<ComingSoon />)

      const emailInput = screen.getByPlaceholderText('your@email.com')
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })

      const select = screen.getByLabelText(/I'm interested in/i)
      fireEvent.change(select, { target: { value: 'both' } })

      const submitButton = screen.getByRole('button', { name: /Join Waitlist/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockSendToN8N).toHaveBeenCalled()
      })

      expect(mockSendToN8N).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          email: 'test@example.com',
          interest: 'both',
        })
      )
    })

    it('should show joining state during submission', async () => {
      
      mockSendToN8N.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(true), 100)))
      render(<ComingSoon />)

      const emailInput = screen.getByPlaceholderText('your@email.com')
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })

      const submitButton = screen.getByRole('button', { name: /Join Waitlist/i })
      fireEvent.click(submitButton)

      expect(screen.getByText('Joining...')).toBeInTheDocument()
      
    })

    it('should disable button during submission', async () => {
      
      mockSendToN8N.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(true), 100)))
      render(<ComingSoon />)

      const emailInput = screen.getByPlaceholderText('your@email.com')
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })

      const submitButton = screen.getByRole('button', { name: /Join Waitlist/i })
      fireEvent.click(submitButton)

      expect(submitButton).toBeDisabled()
    })
  })

  describe('Success State', () => {
    it('should show success message on successful submit', async () => {
      mockSendToN8N.mockResolvedValueOnce(true)
      render(<ComingSoon />)

      const emailInput = screen.getByPlaceholderText('your@email.com')
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })

      const submitButton = screen.getByRole('button', { name: /Join Waitlist/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText("You're on the List!")).toBeInTheDocument()
      })
    })

    it('should show confirmation text', async () => {
      mockSendToN8N.mockResolvedValueOnce(true)
      render(<ComingSoon />)

      const emailInput = screen.getByPlaceholderText('your@email.com')
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })

      const submitButton = screen.getByRole('button', { name: /Join Waitlist/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/email you when these products launch/i)).toBeInTheDocument()
      })
    })

    it('should show success state after form submission', async () => {
      mockSendToN8N.mockResolvedValueOnce(true)
      render(<ComingSoon />)

      const emailInput = screen.getByPlaceholderText('your@email.com')
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })

      const select = screen.getByLabelText(/I'm interested in/i)
      fireEvent.change(select, { target: { value: 'automation-packs' } })

      const submitButton = screen.getByRole('button', { name: /Join Waitlist/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText("You're on the List!")).toBeInTheDocument()
      })
    })
  })

  describe('Error State', () => {
    it('should show error message on failed submit', async () => {
      mockSendToN8N.mockResolvedValueOnce(false)
      render(<ComingSoon />)

      const emailInput = screen.getByPlaceholderText('your@email.com')
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })

      const submitButton = screen.getByRole('button', { name: /Join Waitlist/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument()
      })
    })

    it('should show error message on exception', async () => {
      mockSendToN8N.mockRejectedValueOnce(new Error('Network error'))
      render(<ComingSoon />)

      const emailInput = screen.getByPlaceholderText('your@email.com')
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })

      const submitButton = screen.getByRole('button', { name: /Join Waitlist/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument()
      })
    })

    it('should style error message appropriately', async () => {
      mockSendToN8N.mockResolvedValueOnce(false)
      render(<ComingSoon />)

      const emailInput = screen.getByPlaceholderText('your@email.com')
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })

      const submitButton = screen.getByRole('button', { name: /Join Waitlist/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        const errorElement = screen.getByText(/Something went wrong/i)
        expect(errorElement.closest('div')).toHaveClass('bg-red-50')
      })
    })

    it('should allow retry after error', async () => {
      mockSendToN8N.mockResolvedValueOnce(false).mockResolvedValueOnce(true)
      render(<ComingSoon />)

      const emailInput = screen.getByPlaceholderText('your@email.com')
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })

      const submitButton = screen.getByRole('button', { name: /Join Waitlist/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument()
      })

      // Retry
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText("You're on the List!")).toBeInTheDocument()
      })
    })
  })
})
