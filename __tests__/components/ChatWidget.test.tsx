/**
 * ChatWidget Component Tests
 * Tests for the main chat widget UI component
 */
import { render, screen, fireEvent, waitFor } from '../utils/test-utils'
import ChatWidget from '@/components/ChatWidget'

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn()

// Mock fetch for API calls
global.fetch = jest.fn()

// Mock utils
jest.mock('@/lib/utils', () => ({
  getSessionId: jest.fn(() => 'test-session-123'),
  scrollToElement: jest.fn(),
}))

describe('ChatWidget', () => {
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>

  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        reply: 'Hello! How can I help you?',
        sources: [],
      }),
    } as Response)
  })

  describe('Rendering', () => {
    it('should render the chat button when closed', () => {
      render(<ChatWidget />)
      const button = screen.getByRole('button', { name: /open chat/i })
      expect(button).toBeInTheDocument()
    })

    it('should not render chat window when closed', () => {
      render(<ChatWidget />)
      expect(screen.queryByText('AutoMagicly Assistant')).not.toBeInTheDocument()
    })

    it('should render chat window when opened', () => {
      render(<ChatWidget />)
      const openButton = screen.getByRole('button', { name: /open chat/i })
      fireEvent.click(openButton)

      expect(screen.getByText('AutoMagicly Assistant')).toBeInTheDocument()
      expect(screen.getByText(/general help only/i)).toBeInTheDocument()
    })

    it('should render quick questions when no messages', () => {
      render(<ChatWidget />)
      const openButton = screen.getByRole('button', { name: /open chat/i })
      fireEvent.click(openButton)

      expect(screen.getByText('What can you automate?')).toBeInTheDocument()
      expect(screen.getByText('How does the AI Audit work?')).toBeInTheDocument()
      expect(screen.getByText('Is my data safe?')).toBeInTheDocument()
    })

    it('should render welcome message', () => {
      render(<ChatWidget />)
      const openButton = screen.getByRole('button', { name: /open chat/i })
      fireEvent.click(openButton)

      expect(screen.getByText(/Hi! I can help answer questions/i)).toBeInTheDocument()
    })
  })

  describe('Open/Close Functionality', () => {
    it('should open chat window when button clicked', () => {
      render(<ChatWidget />)
      const openButton = screen.getByRole('button', { name: /open chat/i })
      fireEvent.click(openButton)

      expect(screen.getByText('AutoMagicly Assistant')).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /open chat/i })).not.toBeInTheDocument()
    })

    it('should close chat window when close button clicked', () => {
      render(<ChatWidget />)

      // Open chat
      const openButton = screen.getByRole('button', { name: /open chat/i })
      fireEvent.click(openButton)
      expect(screen.getByText('AutoMagicly Assistant')).toBeInTheDocument()

      // Close chat
      const closeButton = screen.getByRole('button', { name: /close chat/i })
      fireEvent.click(closeButton)

      expect(screen.queryByText('AutoMagicly Assistant')).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: /open chat/i })).toBeInTheDocument()
    })
  })

  describe('Message Input', () => {
    it('should render input field when open', () => {
      render(<ChatWidget />)
      const openButton = screen.getByRole('button', { name: /open chat/i })
      fireEvent.click(openButton)

      const input = screen.getByPlaceholderText('Ask a question...')
      expect(input).toBeInTheDocument()
    })

    it('should render send button', () => {
      render(<ChatWidget />)
      const openButton = screen.getByRole('button', { name: /open chat/i })
      fireEvent.click(openButton)

      const sendButton = screen.getByRole('button', { name: /send/i })
      expect(sendButton).toBeInTheDocument()
    })

    it('should update input value on change', () => {
      render(<ChatWidget />)
      const openButton = screen.getByRole('button', { name: /open chat/i })
      fireEvent.click(openButton)

      const input = screen.getByPlaceholderText('Ask a question...')
      fireEvent.change(input, { target: { value: 'Hello world' } })

      expect(input).toHaveValue('Hello world')
    })

    it('should have disabled send button when input is empty', () => {
      render(<ChatWidget />)
      const openButton = screen.getByRole('button', { name: /open chat/i })
      fireEvent.click(openButton)

      const sendButton = screen.getByRole('button', { name: /send/i })
      expect(sendButton).toBeDisabled()
    })

    it('should enable send button when input has text', () => {
      render(<ChatWidget />)
      const openButton = screen.getByRole('button', { name: /open chat/i })
      fireEvent.click(openButton)

      const input = screen.getByPlaceholderText('Ask a question...')
      fireEvent.change(input, { target: { value: 'Hello' } })

      const sendButton = screen.getByRole('button', { name: /send/i })
      expect(sendButton).not.toBeDisabled()
    })
  })

  describe('Sending Messages', () => {
    it('should send message and display response', async () => {
      render(<ChatWidget />)
      const openButton = screen.getByRole('button', { name: /open chat/i })
      fireEvent.click(openButton)

      const input = screen.getByPlaceholderText('Ask a question...')
      fireEvent.change(input, { target: { value: 'Hello' } })

      const sendButton = screen.getByRole('button', { name: /send/i })
      fireEvent.click(sendButton)

      // User message should appear
      await waitFor(() => {
        expect(screen.getByText('Hello')).toBeInTheDocument()
      })

      // API should be called
      expect(mockFetch).toHaveBeenCalledWith('/api/chat', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }))

      // Response should appear
      await waitFor(() => {
        expect(screen.getByText('Hello! How can I help you?')).toBeInTheDocument()
      })
    })

    it('should clear input after sending', async () => {
      render(<ChatWidget />)
      const openButton = screen.getByRole('button', { name: /open chat/i })
      fireEvent.click(openButton)

      const input = screen.getByPlaceholderText('Ask a question...')
      fireEvent.change(input, { target: { value: 'Hello' } })

      const sendButton = screen.getByRole('button', { name: /send/i })
      fireEvent.click(sendButton)

      await waitFor(() => {
        expect(input).toHaveValue('')
      })
    })

    it('should send message on form submit (Enter key)', async () => {
      render(<ChatWidget />)
      const openButton = screen.getByRole('button', { name: /open chat/i })
      fireEvent.click(openButton)

      const input = screen.getByPlaceholderText('Ask a question...')
      fireEvent.change(input, { target: { value: 'Hello' } })
      fireEvent.submit(input.closest('form')!)

      await waitFor(() => {
        expect(screen.getByText('Hello')).toBeInTheDocument()
      })
    })

    it('should not send empty messages', async () => {
      render(<ChatWidget />)
      const openButton = screen.getByRole('button', { name: /open chat/i })
      fireEvent.click(openButton)

      const input = screen.getByPlaceholderText('Ask a question...')
      fireEvent.submit(input.closest('form')!)

      expect(mockFetch).not.toHaveBeenCalled()
    })
  })

  describe('Quick Questions', () => {
    it('should send quick question when clicked', async () => {
      render(<ChatWidget />)
      const openButton = screen.getByRole('button', { name: /open chat/i })
      fireEvent.click(openButton)

      const quickQuestion = screen.getByText('What can you automate?')
      fireEvent.click(quickQuestion)

      await waitFor(() => {
        expect(screen.getByText('What can you automate?')).toBeInTheDocument()
      })

      expect(mockFetch).toHaveBeenCalled()
    })

    it('should hide quick questions after sending message', async () => {
      render(<ChatWidget />)
      const openButton = screen.getByRole('button', { name: /open chat/i })
      fireEvent.click(openButton)

      const quickQuestion = screen.getByText('What can you automate?')
      fireEvent.click(quickQuestion)

      await waitFor(() => {
        expect(screen.queryByText('Is my data safe?')).not.toBeInTheDocument()
      })
    })
  })

  describe('Loading State', () => {
    it('should show loading indicator while waiting for response', async () => {
      // Delay the response
      mockFetch.mockImplementation(() =>
        new Promise(resolve =>
          setTimeout(() => resolve({
            ok: true,
            json: async () => ({ reply: 'Response', sources: [] }),
          } as Response), 100)
        )
      )

      render(<ChatWidget />)
      const openButton = screen.getByRole('button', { name: /open chat/i })
      fireEvent.click(openButton)

      const input = screen.getByPlaceholderText('Ask a question...')
      fireEvent.change(input, { target: { value: 'Hello' } })

      const sendButton = screen.getByRole('button', { name: /send/i })
      fireEvent.click(sendButton)

      // Loading indicator should appear
      await waitFor(() => {
        const loadingDots = document.querySelectorAll('.animate-bounce')
        expect(loadingDots.length).toBeGreaterThan(0)
      })
    })

    it('should disable input while loading', async () => {
      mockFetch.mockImplementation(() =>
        new Promise(resolve =>
          setTimeout(() => resolve({
            ok: true,
            json: async () => ({ reply: 'Response', sources: [] }),
          } as Response), 100)
        )
      )

      render(<ChatWidget />)
      const openButton = screen.getByRole('button', { name: /open chat/i })
      fireEvent.click(openButton)

      const input = screen.getByPlaceholderText('Ask a question...')
      fireEvent.change(input, { target: { value: 'Hello' } })

      const sendButton = screen.getByRole('button', { name: /send/i })
      fireEvent.click(sendButton)

      await waitFor(() => {
        expect(input).toBeDisabled()
      })
    })
  })

  describe('Error Handling', () => {
    it('should display error message on API failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      render(<ChatWidget />)
      const openButton = screen.getByRole('button', { name: /open chat/i })
      fireEvent.click(openButton)

      const input = screen.getByPlaceholderText('Ask a question...')
      fireEvent.change(input, { target: { value: 'Hello' } })

      const sendButton = screen.getByRole('button', { name: /send/i })
      fireEvent.click(sendButton)

      await waitFor(() => {
        expect(screen.getByText(/trouble connecting/i)).toBeInTheDocument()
      })
    })

    it('should display error message from API response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Server error' }),
      } as Response)

      render(<ChatWidget />)
      const openButton = screen.getByRole('button', { name: /open chat/i })
      fireEvent.click(openButton)

      const input = screen.getByPlaceholderText('Ask a question...')
      fireEvent.change(input, { target: { value: 'Hello' } })

      const sendButton = screen.getByRole('button', { name: /send/i })
      fireEvent.click(sendButton)

      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument()
      })
    })
  })

  describe('Message Sources', () => {
    it('should display sources when provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          reply: 'Here is some info',
          sources: ['Services', 'FAQ'],
        }),
      } as Response)

      render(<ChatWidget />)
      const openButton = screen.getByRole('button', { name: /open chat/i })
      fireEvent.click(openButton)

      const input = screen.getByPlaceholderText('Ask a question...')
      fireEvent.change(input, { target: { value: 'Tell me about services' } })

      const sendButton = screen.getByRole('button', { name: /send/i })
      fireEvent.click(sendButton)

      await waitFor(() => {
        expect(screen.getByText('Services')).toBeInTheDocument()
        expect(screen.getByText('FAQ')).toBeInTheDocument()
      })
    })
  })
})
