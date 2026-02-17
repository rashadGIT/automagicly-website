'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import { AuditMessage } from '@/lib/audit-types';

interface AuditConversationModalProps {
  isOpen: boolean;
  messages: AuditMessage[];
  onClose: () => void;
}

/**
 * Modal displaying the full audit conversation history
 * Shows all questions and answers from the audit session
 */
export default function AuditConversationModal({
  isOpen,
  messages,
  onClose
}: AuditConversationModalProps) {
  const renderMessage = (message: AuditMessage) => {
    const isUser = message.role === 'user';
    return (
      <div
        key={message.timestamp}
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
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="conversation-modal-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 id="conversation-modal-title" className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-brand-500" />
                Your Conversation
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close conversation modal"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh] bg-gray-50">
              {messages.map((msg) => renderMessage(msg))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
