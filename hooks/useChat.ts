// hooks/useChat.ts
import { useState, useCallback } from 'react';
import { chatClient } from '@/lib/chat-client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface UseChatOptions {
  sessionId: string;
  userEmail?: string;
}

export function useChat({ sessionId, userEmail }: UseChatOptions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      // Add user message immediately
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);

      try {
        const response = await chatClient.sendMessage(
          content,
          sessionId,
          userEmail
        );

        // Add assistant response
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: response.reply,
          timestamp: new Date(response.timestamp),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to send message';
        setError(errorMessage);

        // Optionally add error message to chat
        const errorMsg: Message = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: `Sorry, I encountered an error: ${errorMessage}`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId, userEmail]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  };
}
