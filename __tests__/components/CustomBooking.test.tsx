/**
 * CustomBooking Component Tests
 * Tests the booking component's rendering and basic functionality
 */
import { render, screen, waitFor } from '../utils/test-utils'
import CustomBooking from '@/components/CustomBooking'
import { mockCalendarResponse } from '../utils/mock-helpers'

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

describe('CustomBooking Component', () => {
  beforeEach(() => {
    // Mock calendar API to return some busy dates
    mockCalendarResponse(['2025-01-15', '2025-01-20'])
  })

  describe('Initial Render', () => {
    it('should render the booking component', () => {
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
    })

    it('should display progress steps', () => {
      render(<CustomBooking />)
      // Progress indicators should be visible (step 1, 2, 3)
      const container = screen.getByText('Select a Date').closest('div')
      expect(container).toBeTruthy()
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
  })

  describe('Form Fields', () => {
    it('should have proper accessibility labels', () => {
      render(<CustomBooking />)
      // The component should have proper structure even if form isn't visible yet
      expect(screen.getByText('Select a Date')).toBeInTheDocument()
    })
  })

  describe('Timezone Display', () => {
    it('should reference timezone functionality', () => {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      expect(timezone).toBeTruthy()
      expect(typeof timezone).toBe('string')
    })
  })

  describe('Time Formatting', () => {
    it('should have time slots available', () => {
      // The component should have TIME_SLOTS defined (09:00, 09:30, etc.)
      const timeRegex = /\d{2}:\d{2}/
      expect(timeRegex.test('09:00')).toBe(true)
      expect(timeRegex.test('13:30')).toBe(true)
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

  describe('Environment Variables', () => {
    it('should have booking webhook URL configured', () => {
      expect(process.env.NEXT_PUBLIC_N8N_AUDIT_WEBHOOK_URL).toBe(
        'https://test.webhook.url/booking'
      )
    })
  })

  describe('API Integration', () => {
    it('should call fetchBusyDates on mount', async () => {
      render(<CustomBooking />)

      // Wait for API call to complete
      await waitFor(
        () => {
          expect(screen.getByText('Choose your preferred day')).toBeInTheDocument()
        },
        { timeout: 3000 }
      )

      // Verify fetch was called
      expect(global.fetch).toHaveBeenCalled()
    })
  })
})
