/**
 * N8nChatWidget Component Tests
 * Tests for the N8n-powered chat widget component
 */
import { render, screen, fireEvent, waitFor } from '../utils/test-utils'
import { N8nChatWidget } from '@/components/N8nChatWidget'

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn()

// Mock the useChat hook
jest.mock('@/hooks/useChat', () => ({
  useChat: jest.fn(),
}))

import { useChat } from '@/hooks/useChat'

const mockUseChat = useChat as jest.MockedFunction<typeof useChat>

describe('N8nChatWidget', () => {
  const mockSendMessage = jest.fn()
  const mockClearMessages = jest.fn()

  const defaultMockReturn = {
    messages: [],
    isLoading: false,
    error: null,
    sendMessage: mockSendMessage,
    clearMessages: mockClearMessages,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseChat.mockReturnValue(defaultMockReturn)
  })

  describe('Rendering', () => {
    it('should render the chat widget', () => {
      render(<N8nChatWidget sessionId="test-session" />)
      expect(screen.getByText('AutoMagicly Chat')).toBeInTheDocument()
      expect(screen.getByText('Ask me anything!')).toBeInTheDocument()
    })

    it('should render input field and send button', () => {
      render(<N8nChatWidget sessionId="test-session" />)
      expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument()
    })

    it('should render character count', () => {
      render(<N8nChatWidget sessionId="test-session" />)
      expect(screen.getByText('0/5000 characters')).toBeInTheDocument()
    })

    it('should render welcome message when no messages', () => {
      render(<N8nChatWidget sessionId="test-session" />)
      expect(screen.getByText(/How can I help you today/i)).toBeInTheDocument()
    })

    it('should pass sessionId to useChat hook', () => {
      render(<N8nChatWidget sessionId="my-session-123" />)
      expect(mockUseChat).toHaveBeenCalledWith({
        sessionId: 'my-session-123',
        userEmail: undefined,
      })
    })

    it('should pass userEmail to useChat hook when provided', () => {
      render(<N8nChatWidget sessionId="my-session" userEmail="test@example.com" />)
      expect(mockUseChat).toHaveBeenCalledWith({
        sessionId: 'my-session',
        userEmail: 'test@example.com',
      })
    })
  })

  describe('Message Display', () => {
    it('should render user messages on the right', () => {
      mockUseChat.mockReturnValue({
        ...defaultMockReturn,
        messages: [
          {
            id: 'user-1',
            role: 'user',
            content: 'Hello!',
            timestamp: new Date(),
          },
        ],
      })

      render(<N8nChatWidget sessionId="test-session" />)
      const messageContainer = screen.getByText('Hello!').closest('div[class*="flex"]')
      expect(messageContainer).toHaveClass('justify-end')
    })

    it('should render assistant messages on the left', () => {
      mockUseChat.mockReturnValue({
        ...defaultMockReturn,
        messages: [
          {
            id: 'assistant-1',
            role: 'assistant',
            content: 'Hi there!',
            timestamp: new Date(),
          },
        ],
      })

      render(<N8nChatWidget sessionId="test-session" />)
      const messageContainer = screen.getByText('Hi there!').closest('div[class*="flex"]')
      expect(messageContainer).toHaveClass('justify-start')
    })

    it('should render multiple messages', () => {
      mockUseChat.mockReturnValue({
        ...defaultMockReturn,
        messages: [
          { id: 'user-1', role: 'user', content: 'Hello', timestamp: new Date() },
          { id: 'assistant-1', role: 'assistant', content: 'Hi!', timestamp: new Date() },
          { id: 'user-2', role: 'user', content: 'How are you?', timestamp: new Date() },
        ],
      })

      render(<N8nChatWidget sessionId="test-session" />)
      expect(screen.getByText('Hello')).toBeInTheDocument()
      expect(screen.getByText('Hi!')).toBeInTheDocument()
      expect(screen.getByText('How are you?')).toBeInTheDocument()
    })

    it('should display message timestamps', () => {
      const timestamp = new Date('2026-01-15T10:30:00')
      mockUseChat.mockReturnValue({
        ...defaultMockReturn,
        messages: [
          { id: 'user-1', role: 'user', content: 'Hello', timestamp },
        ],
      })

      render(<N8nChatWidget sessionId="test-session" />)
      expect(screen.getByText(timestamp.toLocaleTimeString())).toBeInTheDocument()
    })

    it('should hide welcome message when messages exist', () => {
      mockUseChat.mockReturnValue({
        ...defaultMockReturn,
        messages: [
          { id: 'user-1', role: 'user', content: 'Hello', timestamp: new Date() },
        ],
      })

      render(<N8nChatWidget sessionId="test-session" />)
      expect(screen.queryByText(/How can I help you today/i)).not.toBeInTheDocument()
    })
  })

  describe('Sending Messages', () => {
    it('should call sendMessage when form is submitted', async () => {
      render(<N8nChatWidget sessionId="test-session" />)

      const input = screen.getByPlaceholderText('Type your message...')
      fireEvent.change(input, { target: { value: 'Hello world' } })

      const form = input.closest('form')
      fireEvent.submit(form!)

      await waitFor(() => {
        expect(mockSendMessage).toHaveBeenCalledWith('Hello world')
      })
    })

    it('should clear input after sending', async () => {
      render(<N8nChatWidget sessionId="test-session" />)

      const input = screen.getByPlaceholderText('Type your message...')
      fireEvent.change(input, { target: { value: 'Hello' } })
      fireEvent.submit(input.closest('form')!)

      await waitFor(() => {
        expect(input).toHaveValue('')
      })
    })

    it('should not send empty messages', () => {
      render(<N8nChatWidget sessionId="test-session" />)

      const input = screen.getByPlaceholderText('Type your message...')
      fireEvent.submit(input.closest('form')!)

      expect(mockSendMessage).not.toHaveBeenCalled()
    })

    it('should not send whitespace-only messages', () => {
      render(<N8nChatWidget sessionId="test-session" />)

      const input = screen.getByPlaceholderText('Type your message...')
      fireEvent.change(input, { target: { value: '   ' } })
      fireEvent.submit(input.closest('form')!)

      expect(mockSendMessage).not.toHaveBeenCalled()
    })

    it('should not send message while loading', () => {
      mockUseChat.mockReturnValue({
        ...defaultMockReturn,
        isLoading: true,
      })

      render(<N8nChatWidget sessionId="test-session" />)

      const input = screen.getByPlaceholderText('Type your message...')
      fireEvent.change(input, { target: { value: 'Hello' } })
      fireEvent.submit(input.closest('form')!)

      expect(mockSendMessage).not.toHaveBeenCalled()
    })

    it('should update character count on input', () => {
      render(<N8nChatWidget sessionId="test-session" />)

      const input = screen.getByPlaceholderText('Type your message...')
      fireEvent.change(input, { target: { value: 'Hello' } })

      expect(screen.getByText('5/5000 characters')).toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('should show loading indicator when loading', () => {
      mockUseChat.mockReturnValue({
        ...defaultMockReturn,
        isLoading: true,
      })

      render(<N8nChatWidget sessionId="test-session" />)
      const loadingDots = document.querySelectorAll('.animate-bounce')
      expect(loadingDots.length).toBeGreaterThan(0)
    })

    it('should disable input when loading', () => {
      mockUseChat.mockReturnValue({
        ...defaultMockReturn,
        isLoading: true,
      })

      render(<N8nChatWidget sessionId="test-session" />)
      const input = screen.getByPlaceholderText('Type your message...')
      expect(input).toBeDisabled()
    })

    it('should disable send button when loading', () => {
      mockUseChat.mockReturnValue({
        ...defaultMockReturn,
        isLoading: true,
      })

      render(<N8nChatWidget sessionId="test-session" />)
      const sendButton = screen.getByRole('button', { name: /send/i })
      expect(sendButton).toBeDisabled()
    })
  })

  describe('Error State', () => {
    it('should display error message when error exists', () => {
      mockUseChat.mockReturnValue({
        ...defaultMockReturn,
        error: 'Failed to connect to server',
      })

      render(<N8nChatWidget sessionId="test-session" />)
      expect(screen.getByText('Failed to connect to server')).toBeInTheDocument()
    })

    it('should style error message appropriately', () => {
      mockUseChat.mockReturnValue({
        ...defaultMockReturn,
        error: 'Network error',
      })

      render(<N8nChatWidget sessionId="test-session" />)
      const errorElement = screen.getByText('Network error')
      expect(errorElement.closest('div')).toHaveClass('bg-red-50')
    })

    it('should not show error section when no error', () => {
      render(<N8nChatWidget sessionId="test-session" />)
      const errorSection = document.querySelector('.bg-red-50')
      expect(errorSection).not.toBeInTheDocument()
    })
  })

  describe('Send Button State', () => {
    it('should disable send button when input is empty', () => {
      render(<N8nChatWidget sessionId="test-session" />)
      const sendButton = screen.getByRole('button', { name: /send/i })
      expect(sendButton).toBeDisabled()
    })

    it('should enable send button when input has text', () => {
      render(<N8nChatWidget sessionId="test-session" />)

      const input = screen.getByPlaceholderText('Type your message...')
      fireEvent.change(input, { target: { value: 'Hello' } })

      const sendButton = screen.getByRole('button', { name: /send/i })
      expect(sendButton).not.toBeDisabled()
    })

    it('should disable send button when only whitespace', () => {
      render(<N8nChatWidget sessionId="test-session" />)

      const input = screen.getByPlaceholderText('Type your message...')
      fireEvent.change(input, { target: { value: '   ' } })

      const sendButton = screen.getByRole('button', { name: /send/i })
      expect(sendButton).toBeDisabled()
    })
  })

  describe('Input Constraints', () => {
    it('should have maxLength of 5000 on input', () => {
      render(<N8nChatWidget sessionId="test-session" />)
      const input = screen.getByPlaceholderText('Type your message...')
      expect(input).toHaveAttribute('maxLength', '5000')
    })
  })
})
