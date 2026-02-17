'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, RefreshCw, AlertCircle, Lightbulb } from 'lucide-react';
import { AuditMessage } from '@/lib/audit-types';

interface AuditChatInterfaceProps {
  messages: AuditMessage[];
  currentQuestion?: string;
  suggestedResponses: string[];
  painPoints: Array<{ category: string; description: string }>;
  questionNumber: number;
  isLoading: boolean;
  error?: string | null;
  milestoneMessage?: string | null;
  onSubmitAnswer: (answer: string) => void;
  onReset: () => void;
}

/**
 * Chat interface for active audit Q&A
 * Handles message display, suggested responses, and answer submission
 */
export default function AuditChatInterface({
  messages,
  currentQuestion,
  suggestedResponses,
  painPoints,
  questionNumber,
  isLoading,
  error,
  milestoneMessage,
  onSubmitAnswer,
  onReset
}: AuditChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSparkle, setShowSparkle] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [messages]);

  // Focus input when question changes
  useEffect(() => {
    if (currentQuestion && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentQuestion]);

  // Handle form submission with sparkle effect
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      setShowSparkle(true);
      onSubmitAnswer(inputValue.trim());
      setInputValue('');
      setTimeout(() => setShowSparkle(false), 600);
    }
  };

  // Handle suggestion click - submit immediately with sparkle effect
  const handleSuggestionClick = (suggestion: string) => {
    if (!isLoading) {
      setShowSparkle(true);
      onSubmitAnswer(suggestion);
      setTimeout(() => setShowSparkle(false), 600);
    }
  };

  // Handle Enter key (Shift+Enter for new line)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Render message bubble
  const renderMessage = (message: AuditMessage, index: number) => {
    const isUser = message.role === 'user';

    return (
      <motion.div
        key={message.timestamp}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div
          className={`max-w-[80%] p-4 rounded-2xl ${
            isUser
              ? 'bg-brand-500 text-white rounded-br-md'
              : 'bg-gray-100 text-gray-900 rounded-bl-md'
          }`}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card overflow-hidden relative">
        {/* Milestone message toast */}
        <AnimatePresence>
          {milestoneMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 bg-brand-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg z-10"
              role="status"
              aria-live="polite"
            >
              {milestoneMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header with title, insight counter, and restart */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-500" />
                <span className="font-medium text-gray-700">AI Business Audit</span>
              </div>
              {/* Insight counter */}
              {painPoints.length > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-1 text-sm text-brand-600 bg-brand-50 px-3 py-1 rounded-full"
                  role="status"
                  aria-label={`${painPoints.length} insights discovered`}
                >
                  <Lightbulb className="w-4 h-4" />
                  <span>{painPoints.length} insight{painPoints.length > 1 ? 's' : ''}</span>
                </motion.div>
              )}
            </div>
            <button
              onClick={onReset}
              className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
              aria-label="Start audit over"
            >
              <RefreshCw className="w-4 h-4" />
              Start Over
            </button>
          </div>
        </div>

        {/* Messages area */}
        <div className="h-[400px] overflow-y-auto p-6 bg-gray-50" role="log" aria-live="polite" aria-relevant="additions">
          <AnimatePresence>
            {messages.map((message, index) => renderMessage(message, index))}
          </AnimatePresence>

          {/* Loading indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start mb-4"
            >
              <div className="bg-gray-100 text-gray-500 p-4 rounded-2xl rounded-bl-md">
                <div className="flex items-center gap-2" role="status" aria-label="AI is typing">
                  <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </motion.div>
          )}

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center mb-4"
            >
              <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg flex items-center gap-2 text-sm" role="alert" aria-live="assertive">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100 bg-white relative">
          {/* Sparkle effect on submit */}
          <AnimatePresence>
            {showSparkle && (
              <motion.div
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 2, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 pointer-events-none flex items-center justify-center z-10"
              >
                <Sparkles className="w-8 h-8 text-brand-500" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Suggested responses with stagger animation */}
          {suggestedResponses.length > 0 && !isLoading && (
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-2">Quick responses:</p>
              <motion.div className="flex flex-wrap gap-2">
                {suggestedResponses.map((suggestion, index) => (
                  <motion.button
                    key={suggestion}
                    type="button"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-3 py-1.5 text-sm bg-brand-50 text-brand-700 rounded-full hover:bg-brand-100 transition-colors border border-brand-200"
                    aria-label={`Quick response: ${suggestion}`}
                  >
                    {suggestion}
                  </motion.button>
                ))}
              </motion.div>
            </div>
          )}

          <div className="flex gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your answer..."
                rows={2}
                disabled={isLoading}
                maxLength={2000}
                aria-label="Your answer to the audit question"
                aria-describedby="input-hint"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <span className="absolute bottom-2 right-3 text-xs text-gray-400" aria-live="polite">
                {inputValue.length}/2000
              </span>
            </div>
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="px-4 py-3 bg-brand-500 text-white rounded-xl hover:bg-brand-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              aria-label="Send answer"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p id="input-hint" className="text-xs text-gray-500 mt-2 text-center">
            Press Enter to send, Shift+Enter for new line
          </p>
        </form>
      </div>
    </div>
  );
}
