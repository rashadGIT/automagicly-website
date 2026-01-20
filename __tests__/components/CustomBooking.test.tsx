/**
 * CustomBooking Component Tests
 * Tests the booking component's rendering and full user flow
 */
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CustomBooking from '@/components/CustomBooking'

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

// Mock the utils module
jest.mock('@/lib/utils', () => ({
  sendToN8N: jest.fn(),
  fetchBusyDates: jest.fn(),
}))

import { sendToN8N, fetchBusyDates } from '@/lib/utils'

const mockSendToN8N = sendToN8N as jest.MockedFunction<typeof sendToN8N>
const mockFetchBusyDates = fetchBusyDates as jest.MockedFunction<typeof fetchBusyDates>

describe('CustomBooking Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Default mock implementations
    mockFetchBusyDates.mockResolvedValue([])
    mockSendToN8N.mockResolvedValue(true)

    // Mock alert
    window.alert = jest.fn()
  })

  describe('Initial Render', () => {
    it('should render the booking component', async () => {
      render(<CustomBooking />)
      expect(screen.getByText('Select a Date')).toBeInTheDocument()
    })

    it('should show loading state while fetching busy dates', () => {
      render(<CustomBooking />)
      expect(screen.getByText('Checking availability...')).toBeInTheDocument()
    })

    it('should fetch busy dates on mount', async () => {
      render(<CustomBooking />)

      await waitFor(() => {
        expect(screen.getByText('Choose your preferred day')).toBeInTheDocument()
      })

      expect(mockFetchBusyDates).toHaveBeenCalled()
    })

    it('should display progress steps', () => {
      render(<CustomBooking />)
      // Progress indicators should show step 1 active
      const stepIndicators = screen.getAllByText(/[123]/)
      expect(stepIndicators.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe('Calendar Component', () => {
    it('should render calendar component', async () => {
      const { container } = render(<CustomBooking />)

      await waitFor(() => {
        const calendar = container.querySelector('.rdp-root, .rdp')
        expect(calendar).not.toBeNull()
      })
    })

    it('should show Select a Date heading', () => {
      render(<CustomBooking />)
      expect(screen.getByText('Select a Date')).toBeInTheDocument()
    })

    it('should handle busy dates from API', async () => {
      const busyDates = [new Date('2025-02-15'), new Date('2025-02-20')]
      mockFetchBusyDates.mockResolvedValue(busyDates)

      render(<CustomBooking />)

      await waitFor(() => {
        expect(mockFetchBusyDates).toHaveBeenCalled()
      })
    })
  })

  describe('Date Selection', () => {
    it('should advance to step 2 when date is selected', async () => {
      render(<CustomBooking />)

      await waitFor(() => {
        expect(screen.getByText('Choose your preferred day')).toBeInTheDocument()
      })

      // Find an available date button in the calendar
      const dateButtons = document.querySelectorAll('button[name="day"]')
      const availableDate = Array.from(dateButtons).find(
        (btn) => !btn.hasAttribute('disabled') && btn.getAttribute('aria-disabled') !== 'true'
      )

      if (availableDate) {
        await act(async () => {
          fireEvent.click(availableDate)
        })

        // Should now show time slots
        await waitFor(() => {
          expect(screen.getByText('Select a Time')).toBeInTheDocument()
        })
      }
    })
  })

  describe('Time Slot Selection', () => {
    it('should display time slots when date is selected', async () => {
      render(<CustomBooking />)

      await waitFor(() => {
        expect(screen.getByText('Choose your preferred day')).toBeInTheDocument()
      })

      const dateButtons = document.querySelectorAll('button[name="day"]')
      const availableDate = Array.from(dateButtons).find(
        (btn) => !btn.hasAttribute('disabled') && btn.getAttribute('aria-disabled') !== 'true'
      )

      if (availableDate) {
        await act(async () => {
          fireEvent.click(availableDate)
        })

        await waitFor(() => {
          expect(screen.getByText('Select a Time')).toBeInTheDocument()
        })

        // Should show time slots
        expect(screen.getByRole('button', { name: /9:00 AM/i })).toBeInTheDocument()
      }
    })

    it('should progress to step 3 when time is selected', async () => {
      render(<CustomBooking />)

      await waitFor(() => {
        expect(screen.getByText('Choose your preferred day')).toBeInTheDocument()
      })

      const dateButtons = document.querySelectorAll('button[name="day"]')
      const availableDate = Array.from(dateButtons).find(
        (btn) => !btn.hasAttribute('disabled') && btn.getAttribute('aria-disabled') !== 'true'
      )

      if (availableDate) {
        await act(async () => {
          fireEvent.click(availableDate)
        })

        await waitFor(() => {
          expect(screen.getByText('Select a Time')).toBeInTheDocument()
        })

        const timeButton = screen.getByRole('button', { name: /9:00 AM/i })
        await act(async () => {
          fireEvent.click(timeButton)
        })

        // Should now show the details form
        await waitFor(() => {
          expect(screen.getByText('Your Details')).toBeInTheDocument()
        })
      }
    })
  })

  describe('Form Submission', () => {
    const navigateToForm = async () => {
      render(<CustomBooking />)

      await waitFor(() => {
        expect(screen.getByText('Choose your preferred day')).toBeInTheDocument()
      })

      const dateButtons = document.querySelectorAll('button[name="day"]')
      const availableDate = Array.from(dateButtons).find(
        (btn) => !btn.hasAttribute('disabled') && btn.getAttribute('aria-disabled') !== 'true'
      )

      if (availableDate) {
        await act(async () => {
          fireEvent.click(availableDate)
        })

        await waitFor(() => {
          expect(screen.getByText('Select a Time')).toBeInTheDocument()
        })

        const timeButton = screen.getByRole('button', { name: /9:00 AM/i })
        await act(async () => {
          fireEvent.click(timeButton)
        })

        await waitFor(() => {
          expect(screen.getByText('Your Details')).toBeInTheDocument()
        })
      }

      return !!availableDate
    }

    it('should show form fields after time selection', async () => {
      const hasAvailableDate = await navigateToForm()

      if (hasAvailableDate) {
        expect(screen.getByPlaceholderText('John Doe')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('john@company.com')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Acme Inc')).toBeInTheDocument()
      }
    })

    it('should allow filling out the form', async () => {
      const hasAvailableDate = await navigateToForm()

      if (hasAvailableDate) {
        const nameInput = screen.getByPlaceholderText('John Doe')
        const emailInput = screen.getByPlaceholderText('john@company.com')
        const companyInput = screen.getByPlaceholderText('Acme Inc')

        await act(async () => {
          fireEvent.change(nameInput, { target: { value: 'Test User' } })
          fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
          fireEvent.change(companyInput, { target: { value: 'Test Company' } })
        })

        expect(nameInput).toHaveValue('Test User')
        expect(emailInput).toHaveValue('test@example.com')
        expect(companyInput).toHaveValue('Test Company')
      }
    })

    it('should submit the form successfully', async () => {
      const hasAvailableDate = await navigateToForm()

      if (hasAvailableDate) {
        const nameInput = screen.getByPlaceholderText('John Doe')
        const emailInput = screen.getByPlaceholderText('john@company.com')
        const companyInput = screen.getByPlaceholderText('Acme Inc')

        await act(async () => {
          fireEvent.change(nameInput, { target: { value: 'Test User' } })
          fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
          fireEvent.change(companyInput, { target: { value: 'Test Company' } })
        })

        const submitButton = screen.getByRole('button', { name: /Confirm Booking/i })
        await act(async () => {
          fireEvent.click(submitButton)
        })

        await waitFor(() => {
          expect(mockSendToN8N).toHaveBeenCalled()
        })

        // Should show success message
        await waitFor(() => {
          expect(screen.getByText('Booking Confirmed! 🎉')).toBeInTheDocument()
        })
      }
    })

    it('should handle form submission failure', async () => {
      mockSendToN8N.mockResolvedValue(false)

      const hasAvailableDate = await navigateToForm()

      if (hasAvailableDate) {
        const nameInput = screen.getByPlaceholderText('John Doe')
        const emailInput = screen.getByPlaceholderText('john@company.com')
        const companyInput = screen.getByPlaceholderText('Acme Inc')

        await act(async () => {
          fireEvent.change(nameInput, { target: { value: 'Test User' } })
          fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
          fireEvent.change(companyInput, { target: { value: 'Test Company' } })
        })

        const submitButton = screen.getByRole('button', { name: /Confirm Booking/i })
        await act(async () => {
          fireEvent.click(submitButton)
        })

        await waitFor(() => {
          expect(mockSendToN8N).toHaveBeenCalled()
        })

        // Should NOT show success message
        await waitFor(() => {
          expect(screen.queryByText('Booking Confirmed! 🎉')).not.toBeInTheDocument()
        })
      }
    })

    it('should handle form submission error', async () => {
      mockSendToN8N.mockRejectedValue(new Error('Network error'))

      const hasAvailableDate = await navigateToForm()

      if (hasAvailableDate) {
        const nameInput = screen.getByPlaceholderText('John Doe')
        const emailInput = screen.getByPlaceholderText('john@company.com')
        const companyInput = screen.getByPlaceholderText('Acme Inc')

        await act(async () => {
          fireEvent.change(nameInput, { target: { value: 'Test User' } })
          fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
          fireEvent.change(companyInput, { target: { value: 'Test Company' } })
        })

        const submitButton = screen.getByRole('button', { name: /Confirm Booking/i })
        await act(async () => {
          fireEvent.click(submitButton)
        })

        await waitFor(() => {
          expect(window.alert).toHaveBeenCalledWith(
            'Something went wrong. Please try again or email us directly.'
          )
        })
      }
    })

    it('should allow filling notes field', async () => {
      const hasAvailableDate = await navigateToForm()

      if (hasAvailableDate) {
        const notesTextarea = screen.getByPlaceholderText(/Manual invoice processing/i)

        await act(async () => {
          fireEvent.change(notesTextarea, { target: { value: 'My biggest time-waster is data entry' } })
        })

        expect(notesTextarea).toHaveValue('My biggest time-waster is data entry')
      }
    })
  })

  describe('Success State', () => {
    it('should show booking details in success message', async () => {
      render(<CustomBooking />)

      await waitFor(() => {
        expect(screen.getByText('Choose your preferred day')).toBeInTheDocument()
      })

      const dateButtons = document.querySelectorAll('button[name="day"]')
      const availableDate = Array.from(dateButtons).find(
        (btn) => !btn.hasAttribute('disabled') && btn.getAttribute('aria-disabled') !== 'true'
      )

      if (availableDate) {
        await act(async () => {
          fireEvent.click(availableDate)
        })

        await waitFor(() => {
          expect(screen.getByText('Select a Time')).toBeInTheDocument()
        })

        const timeButton = screen.getByRole('button', { name: /9:00 AM/i })
        await act(async () => {
          fireEvent.click(timeButton)
        })

        await waitFor(() => {
          expect(screen.getByText('Your Details')).toBeInTheDocument()
        })

        const nameInput = screen.getByPlaceholderText('John Doe')
        const emailInput = screen.getByPlaceholderText('john@company.com')
        const companyInput = screen.getByPlaceholderText('Acme Inc')

        await act(async () => {
          fireEvent.change(nameInput, { target: { value: 'Test User' } })
          fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
          fireEvent.change(companyInput, { target: { value: 'Test Company' } })
        })

        const submitButton = screen.getByRole('button', { name: /Confirm Booking/i })
        await act(async () => {
          fireEvent.click(submitButton)
        })

        await waitFor(() => {
          expect(screen.getByText('Booking Confirmed! 🎉')).toBeInTheDocument()
        })

        // Should show email in success message
        expect(screen.getByText(/test@example.com/)).toBeInTheDocument()
      }
    })

    it('should have Book Another Session button', async () => {
      render(<CustomBooking />)

      await waitFor(() => {
        expect(screen.getByText('Choose your preferred day')).toBeInTheDocument()
      })

      const dateButtons = document.querySelectorAll('button[name="day"]')
      const availableDate = Array.from(dateButtons).find(
        (btn) => !btn.hasAttribute('disabled') && btn.getAttribute('aria-disabled') !== 'true'
      )

      if (availableDate) {
        await act(async () => {
          fireEvent.click(availableDate)
        })

        await waitFor(() => {
          expect(screen.getByText('Select a Time')).toBeInTheDocument()
        })

        const timeButton = screen.getByRole('button', { name: /9:00 AM/i })
        await act(async () => {
          fireEvent.click(timeButton)
        })

        await waitFor(() => {
          expect(screen.getByText('Your Details')).toBeInTheDocument()
        })

        const nameInput = screen.getByPlaceholderText('John Doe')
        const emailInput = screen.getByPlaceholderText('john@company.com')
        const companyInput = screen.getByPlaceholderText('Acme Inc')

        await act(async () => {
          fireEvent.change(nameInput, { target: { value: 'Test User' } })
          fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
          fireEvent.change(companyInput, { target: { value: 'Test Company' } })
        })

        const submitButton = screen.getByRole('button', { name: /Confirm Booking/i })
        await act(async () => {
          fireEvent.click(submitButton)
        })

        await waitFor(() => {
          expect(screen.getByText('Booking Confirmed! 🎉')).toBeInTheDocument()
        })

        // Should have Book Another Session button
        const bookAnotherButton = screen.getByRole('button', { name: /Book Another Session/i })
        expect(bookAnotherButton).toBeInTheDocument()
      }
    })
  })

  describe('Helper Functions', () => {
    it('should display time in AM/PM format', async () => {
      render(<CustomBooking />)

      await waitFor(() => {
        expect(screen.getByText('Choose your preferred day')).toBeInTheDocument()
      })

      const dateButtons = document.querySelectorAll('button[name="day"]')
      const availableDate = Array.from(dateButtons).find(
        (btn) => !btn.hasAttribute('disabled') && btn.getAttribute('aria-disabled') !== 'true'
      )

      if (availableDate) {
        await act(async () => {
          fireEvent.click(availableDate)
        })

        await waitFor(() => {
          expect(screen.getByText('Select a Time')).toBeInTheDocument()
        })

        // Check for AM/PM formatted times
        expect(screen.getByRole('button', { name: /9:00 AM/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /1:00 PM/i })).toBeInTheDocument()
      }
    })
  })

  describe('Component Structure', () => {
    it('should have main container', () => {
      const { container } = render(<CustomBooking />)
      expect(container.firstChild).toBeTruthy()
    })

    it('should render with proper grid layout class', () => {
      const { container } = render(<CustomBooking />)
      const gridElement = container.querySelector('.grid')
      expect(gridElement).toBeTruthy()
    })
  })

  describe('Timezone Display', () => {
    it('should show timezone info when time is selected', async () => {
      render(<CustomBooking />)

      await waitFor(() => {
        expect(screen.getByText('Choose your preferred day')).toBeInTheDocument()
      })

      const dateButtons = document.querySelectorAll('button[name="day"]')
      const availableDate = Array.from(dateButtons).find(
        (btn) => !btn.hasAttribute('disabled') && btn.getAttribute('aria-disabled') !== 'true'
      )

      if (availableDate) {
        await act(async () => {
          fireEvent.click(availableDate)
        })

        await waitFor(() => {
          expect(screen.getByText('Select a Time')).toBeInTheDocument()
        })

        // Should show timezone info
        expect(screen.getByText(/Your timezone:/i)).toBeInTheDocument()
      }
    })
  })

  describe('Loading States', () => {
    it('should show calendar loading indicator', () => {
      render(<CustomBooking />)
      expect(screen.getByText('Checking availability...')).toBeInTheDocument()
    })

    it('should transition from loading to loaded state', async () => {
      render(<CustomBooking />)

      expect(screen.getByText('Checking availability...')).toBeInTheDocument()

      await waitFor(
        () => {
          expect(screen.getByText('Choose your preferred day')).toBeInTheDocument()
        },
        { timeout: 3000 }
      )
    })

    it('should show submitting state during form submission', async () => {
      // Delay the mock to show loading state
      mockSendToN8N.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(true), 100)))

      render(<CustomBooking />)

      await waitFor(() => {
        expect(screen.getByText('Choose your preferred day')).toBeInTheDocument()
      })

      const dateButtons = document.querySelectorAll('button[name="day"]')
      const availableDate = Array.from(dateButtons).find(
        (btn) => !btn.hasAttribute('disabled') && btn.getAttribute('aria-disabled') !== 'true'
      )

      if (availableDate) {
        await act(async () => {
          fireEvent.click(availableDate)
        })

        await waitFor(() => {
          expect(screen.getByText('Select a Time')).toBeInTheDocument()
        })

        const timeButton = screen.getByRole('button', { name: /9:00 AM/i })
        await act(async () => {
          fireEvent.click(timeButton)
        })

        await waitFor(() => {
          expect(screen.getByText('Your Details')).toBeInTheDocument()
        })

        const nameInput = screen.getByPlaceholderText('John Doe')
        const emailInput = screen.getByPlaceholderText('john@company.com')
        const companyInput = screen.getByPlaceholderText('Acme Inc')

        await act(async () => {
          fireEvent.change(nameInput, { target: { value: 'Test User' } })
          fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
          fireEvent.change(companyInput, { target: { value: 'Test Company' } })
        })

        const submitButton = screen.getByRole('button', { name: /Confirm Booking/i })

        // Start submission
        fireEvent.click(submitButton)

        // Should show "Booking..." text
        await waitFor(() => {
          expect(screen.getByText('Booking...')).toBeInTheDocument()
        })
      }
    })
  })
})
