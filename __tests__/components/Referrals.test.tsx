/**
 * Referrals Component Tests
 * Tests for the referral form component
 */
import { render, screen, fireEvent, waitFor, within } from '../utils/test-utils'
import Referrals from '@/components/Referrals'

// Mock utils
jest.mock('@/lib/utils', () => ({
  sendToN8N: jest.fn(),
}))

import { sendToN8N } from '@/lib/utils'

const mockSendToN8N = sendToN8N as jest.MockedFunction<typeof sendToN8N>

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

// Helper to find input by label text (for labels without htmlFor)
const getInputByLabelText = (labelText: RegExp) => {
  const label = screen.getByText(labelText)
  const container = label.closest('div')
  return container?.querySelector('input, textarea') as HTMLInputElement | HTMLTextAreaElement
}

describe('Referrals', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.clear()
  })

  describe('Rendering', () => {
    it('should render the referrals section', () => {
      render(<Referrals />)
      expect(screen.getByText('Refer a Business')).toBeInTheDocument()
    })

    it('should render description text', () => {
      render(<Referrals />)
      expect(screen.getByText(/Know someone who could benefit from automation/i)).toBeInTheDocument()
    })

    it('should render all form labels', () => {
      render(<Referrals />)
      expect(screen.getByText(/Your Name/)).toBeInTheDocument()
      expect(screen.getByText(/Your Email/)).toBeInTheDocument()
      expect(screen.getByText(/Referral Name/)).toBeInTheDocument()
      expect(screen.getByText(/Referral Email or Phone/)).toBeInTheDocument()
      expect(screen.getByText(/Referral Company/)).toBeInTheDocument()
      expect(screen.getByText(/What do they need help with/)).toBeInTheDocument()
    })

    it('should render submit button', () => {
      render(<Referrals />)
      expect(screen.getByRole('button', { name: /Submit Referral/i })).toBeInTheDocument()
    })

    it('should render privacy notice', () => {
      render(<Referrals />)
      expect(screen.getByText(/We'll reach out respectfully. No spam./i)).toBeInTheDocument()
    })
  })

  describe('Form Input', () => {
    it('should update Your Name field', () => {
      render(<Referrals />)
      const input = getInputByLabelText(/Your Name/)
      fireEvent.change(input, { target: { value: 'John Doe' } })
      expect(input).toHaveValue('John Doe')
    })

    it('should update Your Email field', () => {
      render(<Referrals />)
      const input = getInputByLabelText(/Your Email/)
      fireEvent.change(input, { target: { value: 'john@example.com' } })
      expect(input).toHaveValue('john@example.com')
    })

    it('should update Referral Name field', () => {
      render(<Referrals />)
      const input = getInputByLabelText(/Referral Name/)
      fireEvent.change(input, { target: { value: 'Jane Smith' } })
      expect(input).toHaveValue('Jane Smith')
    })

    it('should update Referral Contact field', () => {
      render(<Referrals />)
      const input = getInputByLabelText(/Referral Email or Phone/i)
      fireEvent.change(input, { target: { value: 'jane@example.com' } })
      expect(input).toHaveValue('jane@example.com')
    })

    it('should update Referral Company field', () => {
      render(<Referrals />)
      const input = getInputByLabelText(/Referral Company/i)
      fireEvent.change(input, { target: { value: 'Acme Corp' } })
      expect(input).toHaveValue('Acme Corp')
    })

    it('should update Help Needed field', () => {
      render(<Referrals />)
      const input = getInputByLabelText(/What do they need help with/i)
      fireEvent.change(input, { target: { value: 'Automating invoicing' } })
      expect(input).toHaveValue('Automating invoicing')
    })
  })

  describe('Form Submission', () => {
    const fillForm = () => {
      fireEvent.change(getInputByLabelText(/Your Name/i), { target: { value: 'John Doe' } })
      fireEvent.change(getInputByLabelText(/Your Email/i), { target: { value: 'john@example.com' } })
      fireEvent.change(getInputByLabelText(/Referral Name/i), { target: { value: 'Jane Smith' } })
      fireEvent.change(getInputByLabelText(/Referral Email or Phone/i), { target: { value: 'jane@example.com' } })
      fireEvent.change(getInputByLabelText(/What do they need help with/i), { target: { value: 'Help needed' } })
    }

    it('should call sendToN8N on successful submit', async () => {
      mockSendToN8N.mockResolvedValueOnce(true)
      render(<Referrals />)

      fillForm()
      fireEvent.click(screen.getByRole('button', { name: /Submit Referral/i }))

      await waitFor(() => {
        expect(mockSendToN8N).toHaveBeenCalled()
      })

      // Verify the call includes the form data
      expect(mockSendToN8N).toHaveBeenCalledWith(
        expect.anything(), // WEBHOOK_URL from env
        expect.objectContaining({
          yourName: 'John Doe',
          yourEmail: 'john@example.com',
          referralName: 'Jane Smith',
          referralContact: 'jane@example.com',
          helpNeeded: 'Help needed',
        })
      )
    })

    it('should show success message on successful submit', async () => {
      mockSendToN8N.mockResolvedValueOnce(true)
      render(<Referrals />)

      fillForm()
      fireEvent.click(screen.getByRole('button', { name: /Submit Referral/i }))

      await waitFor(() => {
        expect(screen.getByText('Thank You!')).toBeInTheDocument()
      })
    })

    it('should show submitting state during submission', async () => {
      mockSendToN8N.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(true), 100)))
      render(<Referrals />)

      fillForm()
      fireEvent.click(screen.getByRole('button', { name: /Submit Referral/i }))

      expect(screen.getByText('Submitting...')).toBeInTheDocument()
    })

    it('should disable button during submission', async () => {
      mockSendToN8N.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(true), 100)))
      render(<Referrals />)

      fillForm()
      const button = screen.getByRole('button', { name: /Submit Referral/i })
      fireEvent.click(button)

      expect(button).toBeDisabled()
    })

    it('should show error message on failed submit', async () => {
      mockSendToN8N.mockResolvedValueOnce(false)
      render(<Referrals />)

      fillForm()
      fireEvent.click(screen.getByRole('button', { name: /Submit Referral/i }))

      await waitFor(() => {
        expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument()
      })
    })

    it('should show error message on exception', async () => {
      mockSendToN8N.mockRejectedValueOnce(new Error('Network error'))
      render(<Referrals />)

      fillForm()
      fireEvent.click(screen.getByRole('button', { name: /Submit Referral/i }))

      await waitFor(() => {
        expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument()
      })
    })

    it('should clear form after successful submit', async () => {
      mockSendToN8N.mockResolvedValueOnce(true)
      render(<Referrals />)

      fillForm()
      fireEvent.click(screen.getByRole('button', { name: /Submit Referral/i }))

      await waitFor(() => {
        expect(screen.getByText('Thank You!')).toBeInTheDocument()
      })

      // Click to submit another
      fireEvent.click(screen.getByText('Submit Another Referral'))

      // Form should be cleared
      expect(getInputByLabelText(/Your Name/i)).toHaveValue('')
    })

    it('should store referral in localStorage on success', async () => {
      mockSendToN8N.mockResolvedValueOnce(true)
      render(<Referrals />)

      fillForm()
      fireEvent.click(screen.getByRole('button', { name: /Submit Referral/i }))

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'automagicly_submitted_referrals',
          expect.any(String)
        )
      })
    })
  })

  describe('Success State', () => {
    it('should show thank you message after success', async () => {
      mockSendToN8N.mockResolvedValueOnce(true)
      render(<Referrals />)

      fireEvent.change(getInputByLabelText(/Your Name/i), { target: { value: 'John' } })
      fireEvent.change(getInputByLabelText(/Your Email/i), { target: { value: 'john@test.com' } })
      fireEvent.change(getInputByLabelText(/Referral Name/i), { target: { value: 'Jane' } })
      fireEvent.change(getInputByLabelText(/Referral Email or Phone/i), { target: { value: 'jane@test.com' } })
      fireEvent.change(getInputByLabelText(/What do they need help with/i), { target: { value: 'Help' } })

      fireEvent.click(screen.getByRole('button', { name: /Submit Referral/i }))

      await waitFor(() => {
        expect(screen.getByText('Thank You!')).toBeInTheDocument()
        expect(screen.getByText(/reach out to your referral/i)).toBeInTheDocument()
      })
    })

    it('should allow submitting another referral', async () => {
      mockSendToN8N.mockResolvedValueOnce(true)
      render(<Referrals />)

      fireEvent.change(getInputByLabelText(/Your Name/i), { target: { value: 'John' } })
      fireEvent.change(getInputByLabelText(/Your Email/i), { target: { value: 'john@test.com' } })
      fireEvent.change(getInputByLabelText(/Referral Name/i), { target: { value: 'Jane' } })
      fireEvent.change(getInputByLabelText(/Referral Email or Phone/i), { target: { value: 'jane@test.com' } })
      fireEvent.change(getInputByLabelText(/What do they need help with/i), { target: { value: 'Help' } })

      fireEvent.click(screen.getByRole('button', { name: /Submit Referral/i }))

      await waitFor(() => {
        expect(screen.getByText('Submit Another Referral')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('Submit Another Referral'))

      expect(getInputByLabelText(/Your Name/i)).toBeInTheDocument()
    })

  })

  describe('Submitted Referrals Display', () => {
    it('should load stored referrals from localStorage', () => {
      const storedReferrals = [
        {
          id: 'ref-1',
          yourName: 'John',
          yourEmail: 'john@test.com',
          referralName: 'Jane',
          referralContact: 'jane@test.com',
          referralCompany: 'Acme',
          helpNeeded: 'Help',
          timestamp: Date.now(),
        },
      ]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(storedReferrals))

      render(<Referrals />)

      expect(screen.getByText('1 Referral Submitted')).toBeInTheDocument()
    })

    it('should show correct tier badge based on referral count', () => {
      const referrals = Array.from({ length: 5 }, (_, i) => ({
        id: `ref-${i}`,
        yourName: 'John',
        yourEmail: 'john@test.com',
        referralName: `Referral ${i}`,
        referralContact: 'contact@test.com',
        referralCompany: '',
        helpNeeded: 'Help',
        timestamp: Date.now(),
      }))
      localStorageMock.getItem.mockReturnValue(JSON.stringify(referrals))

      render(<Referrals />)

      expect(screen.getByText('5 Referrals Submitted')).toBeInTheDocument()
    })

    it('should handle corrupted localStorage data', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      localStorageMock.getItem.mockReturnValue('invalid json{')

      render(<Referrals />)

      // Should render without crashing
      expect(screen.getByText('Refer a Business')).toBeInTheDocument()
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('automagicly_submitted_referrals')

      consoleSpy.mockRestore()
    })

    it('should toggle referral list visibility', async () => {
      const storedReferrals = [
        {
          id: 'ref-1',
          yourName: 'John',
          yourEmail: 'john@test.com',
          referralName: 'Jane Smith',
          referralContact: 'jane@test.com',
          referralCompany: 'Acme Corp',
          helpNeeded: 'Help',
          timestamp: Date.now(),
        },
      ]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(storedReferrals))

      render(<Referrals />)

      // Initially collapsed - referral details not visible
      expect(screen.queryByText('Jane Smith - Acme Corp')).not.toBeInTheDocument()

      // Click to expand
      fireEvent.click(screen.getByText('1 Referral Submitted'))

      // Now details should be visible
      await waitFor(() => {
        expect(screen.getByText('Jane Smith - Acme Corp')).toBeInTheDocument()
      })
    })
  })
})
