// lib/chat-client.ts
interface ChatMessage {
  message: string;
  sessionId: string;
  userEmail?: string;
}

interface ChatResponse {
  reply: string;
  sessionId: string;
  timestamp: string;
  error?: boolean;
}

interface ChatError {
  error: string;
  timestamp: string;
  rateLimitRemaining?: number;
  retryAfter?: number;
}

export class ChatClient {
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    this.apiUrl = process.env.NEXT_PUBLIC_N8N_CHAT_WEBHOOK_URL!;
    this.apiKey = process.env.NEXT_PUBLIC_N8N_CHAT_API_KEY!;

    if (!this.apiUrl || !this.apiKey) {
      throw new Error('Chat API configuration missing');
    }
  }

  async sendMessage(
    message: string,
    sessionId: string,
    userEmail?: string
  ): Promise<ChatResponse> {
    // Validate input before sending
    if (!message || message.length === 0) {
      throw new Error('Message cannot be empty');
    }

    if (message.length > 5000) {
      throw new Error('Message too long (max 5000 characters)');
    }

    if (!sessionId) {
      throw new Error('Session ID is required');
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
        },
        body: JSON.stringify({
          message,
          sessionId,
          userEmail: userEmail || 'anonymous',
        }),
      });

      const data = await response.json();

      // Handle different error status codes
      if (!response.ok) {
        if (response.status === 429) {
          const errorData = data as ChatError;
          throw new Error(
            `Rate limit exceeded. Try again in ${errorData.retryAfter || 60} seconds.`
          );
        }

        if (response.status === 401) {
          throw new Error('Authentication failed');
        }

        if (response.status === 400) {
          throw new Error(data.error || 'Invalid request');
        }

        throw new Error(data.error || 'Chat service unavailable');
      }

      return data as ChatResponse;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to connect to chat service');
    }
  }
}

// Singleton instance
export const chatClient = new ChatClient();
