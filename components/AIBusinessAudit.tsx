'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, MessageSquare, RefreshCw, AlertCircle, Calendar, X, MessageCircle, User, Mail, Phone, ArrowRight, Lightbulb, Trophy, Eye, CheckCircle, Loader2 } from 'lucide-react';
import { useAudit } from '@/hooks/useAudit';
import AuditResults from './AuditResults';
import { AuditMessage, ContactInfo } from '@/lib/audit-types';

// Fallback suggested responses for discovery questions (Q1-3)
// These are used when n8n doesn't provide suggestions (initial questions or fallback mode)
const FALLBACK_DISCOVERY_SUGGESTIONS: Record<number, string[]> = {
  1: ['Healthcare', 'Real Estate', 'E-commerce', 'Professional Services', 'Construction', 'Retail'],
  2: ['Mostly desk work and emails', 'Client meetings and calls', 'Field work and site visits', 'Mix of office and remote work'],
  3: ['Too much manual data entry', 'Difficulty tracking leads', 'Scheduling conflicts', 'Slow response to customers'],
};

// Milestone messages for gamification (shown at key question numbers)
const MILESTONE_MESSAGES: Record<number, string> = {
  3: "Great start! Now let's dig deeper...",
  6: "You're doing great! Just a few more questions...",
  10: "Almost there! Your insights are valuable...",
  13: "Final stretch! Building your recommendations...",
};

export default function AIBusinessAudit() {
  const {
    sessionId,
    state,
    questionNumber,
    totalQuestions,
    progress,
    messages,
    currentQuestion,
    suggestedResponses,
    painPoints,
    recommendations,
    nextSteps,
    escalationReason,
    contactInfo,
    isLoading,
    error,
    showContactForm,
    startAudit,
    submitAnswer,
    resetAudit
  } = useAudit();

  const [inputValue, setInputValue] = useState('');
  const [showConversation, setShowConversation] = useState(false);
  const [contactForm, setContactForm] = useState<ContactInfo>({ name: '', email: '', phone: '' });
  const [contactErrors, setContactErrors] = useState<Partial<ContactInfo>>({});
  const [milestoneMessage, setMilestoneMessage] = useState<string | null>(null);
  const [showSparkle, setShowSparkle] = useState(false);
  // Processing state - shows 5-second animation before completion options
  const [isProcessing, setIsProcessing] = useState(false);
  // Local UI state for completion options screen (before showing full results)
  const [showCompletionOptions, setShowCompletionOptions] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const prevQuestionRef = useRef<number>(questionNumber);
  const prevStateRef = useRef<string>(state);

  // Get suggestions for current question
  // Use AI-generated suggestions from n8n if available, otherwise fall back to hardcoded for Q1-3
  const suggestions = suggestedResponses.length > 0
    ? suggestedResponses
    : (FALLBACK_DISCOVERY_SUGGESTIONS[questionNumber] || []);

  // Show milestone messages at key points
  useEffect(() => {
    // Only show milestone when question number increases
    if (questionNumber > prevQuestionRef.current) {
      const message = MILESTONE_MESSAGES[questionNumber];
      if (message) {
        setMilestoneMessage(message);
        setTimeout(() => setMilestoneMessage(null), 3000);
      }
    }
    prevQuestionRef.current = questionNumber;
  }, [questionNumber]);

  // Trigger processing animation when audit completes
  useEffect(() => {
    // Only trigger when transitioning TO COMPLETE state
    if (state === 'COMPLETE' && prevStateRef.current !== 'COMPLETE') {
      setIsProcessing(true);
      setShowCompletionOptions(false);

      // Show processing for 5 seconds, then show completion options
      const timer = setTimeout(() => {
        setIsProcessing(false);
        setShowCompletionOptions(true);
      }, 5000);

      return () => clearTimeout(timer);
    }
    prevStateRef.current = state;
  }, [state]);

  // Handle suggestion click - submit immediately with sparkle effect
  const handleSuggestionClick = (suggestion: string) => {
    if (!isLoading) {
      setShowSparkle(true);
      submitAnswer(suggestion);
      setTimeout(() => setShowSparkle(false), 600);
    }
  };

  // Auto-scroll to bottom when new messages arrive (within container only)
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
      submitAnswer(inputValue.trim());
      setInputValue('');
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

  // Scroll to booking section
  const scrollToBooking = () => {
    const bookingSection = document.getElementById('booking');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle email results request
  const handleEmailResults = async () => {
    if (!sessionId) return;

    setEmailSending(true);
    setEmailError(null);

    try {
      const response = await fetch('/api/audit/email-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send email');
      }

      setEmailSent(true);
      // After showing success message, transition to full results
      setTimeout(() => setShowCompletionOptions(false), 2000);
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : 'Failed to send email');
    } finally {
      setEmailSending(false);
    }
  };

  // Handle schedule call from completion options
  const handleScheduleCall = () => {
    setShowCompletionOptions(false);
    scrollToBooking();
  };

  // Handle view results now
  const handleViewResults = () => {
    setShowCompletionOptions(false);
  };

  // Validate and submit contact form
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Partial<ContactInfo> = {};

    if (!contactForm.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!contactForm.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactForm.email)) {
      errors.email = 'Please enter a valid email';
    }

    if (Object.keys(errors).length > 0) {
      setContactErrors(errors);
      return;
    }

    setContactErrors({});
    startAudit(contactForm);
  };

  // Render message bubble
  const renderMessage = (message: AuditMessage, index: number) => {
    const isUser = message.role === 'user';

    return (
      <motion.div
        key={index}
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

  // Idle state - Start screen
  if (state === 'IDLE') {
    return (
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8 text-center"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            AI Business Audit
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Answer a few questions about your business, and our AI will identify
            automation opportunities tailored to your specific needs.
          </p>
          <ul className="text-left text-sm text-gray-600 mb-8 space-y-2 max-w-sm mx-auto">
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
              Answer 3 discovery questions
            </li>
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
              AI asks follow-up questions
            </li>
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center text-xs font-bold">3</span>
              Get personalized recommendations
            </li>
          </ul>
          <button
            onClick={showContactForm}
            disabled={isLoading}
            className="btn-primary flex items-center gap-2 mx-auto"
          >
            <MessageSquare className="w-5 h-5" />
            Start Your Free Audit
          </button>
        </motion.div>
      </div>
    );
  }

  // Collecting contact info state
  if (state === 'COLLECTING_INFO') {
    return (
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <User className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Before We Begin
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              We'll email your personalized audit results so you can review them anytime.
            </p>
          </div>

          <form onSubmit={handleContactSubmit} className="space-y-4 max-w-md mx-auto">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Your Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="name"
                  value={contactForm.name}
                  onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="John Smith"
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
                    contactErrors.name ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
              </div>
              {contactErrors.name && (
                <p className="text-red-500 text-sm mt-1">{contactErrors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="john@company.com"
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
                    contactErrors.email ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
              </div>
              {contactErrors.email && (
                <p className="text-red-500 text-sm mt-1">{contactErrors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-gray-400">(optional)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  id="phone"
                  value={contactForm.phone || ''}
                  onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(555) 123-4567"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary flex items-center justify-center gap-2 mt-6"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  Continue to Audit
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={resetAudit}
              className="w-full text-sm text-gray-500 hover:text-gray-700 mt-2"
            >
              Go Back
            </button>
          </form>

          {error && (
            <p className="text-red-500 text-sm mt-4 flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </p>
          )}
        </motion.div>
      </div>
    );
  }

  // Render message for modal
  const renderMessageForModal = (message: AuditMessage, index: number) => {
    const isUser = message.role === 'user';
    return (
      <div
        key={index}
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

  // Processing Animation Component - shown for 5 seconds before completion options
  const ProcessingAnimation = () => (
    <div className="max-w-lg mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-12 text-center"
      >
        {/* Spinning sparkles icon */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 mx-auto mb-6"
        >
          <Sparkles className="w-full h-full text-brand-500" />
        </motion.div>

        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Analyzing your responses...
        </h3>
        <p className="text-gray-600 mb-6">
          Building your custom automation recommendations
        </p>

        {/* Animated dots */}
        <div className="flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-brand-500 rounded-full"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );

  // Complete state - Show processing animation, then completion options, then results
  if (state === 'COMPLETE') {
    // Show processing animation first (5 seconds)
    if (isProcessing) {
      return <ProcessingAnimation />;
    }

    // Show completion options screen after processing
    if (showCompletionOptions) {
      return (
        <div className="max-w-lg mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-8 text-center"
          >
            {/* Trophy/celebration icon */}
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: [0, -10, 10, -10, 10, 0] }}
              transition={{
                scale: { delay: 0.2, type: 'spring' },
                rotate: { delay: 0.5, duration: 0.5 }
              }}
              className="w-20 h-20 bg-gradient-to-br from-brand-500 to-accent-500 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Trophy className="w-10 h-10 text-white" />
            </motion.div>

            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Audit Complete!
            </h3>
            <p className="text-gray-600 mb-6">
              We found <span className="font-semibold text-brand-600">
                {recommendations.length} opportunity{recommendations.length !== 1 ? 'ies' : 'y'}
              </span> to automate your business.
            </p>

            {emailSent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-green-50 rounded-xl mb-6"
              >
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-green-700 font-medium">
                  Results sent to {contactInfo?.email}!
                </p>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {/* Email option */}
                <button
                  onClick={handleEmailResults}
                  disabled={emailSending}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-brand-300 hover:bg-brand-50 transition-all text-left flex items-center gap-4 disabled:opacity-50"
                >
                  <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-brand-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Email me my results</p>
                    <p className="text-sm text-gray-500">Get a summary sent to {contactInfo?.email || 'your email'}</p>
                  </div>
                  {emailSending && <Loader2 className="w-5 h-5 animate-spin text-brand-500" />}
                </button>

                {/* Schedule call option */}
                <button
                  onClick={handleScheduleCall}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-accent-300 hover:bg-accent-50 transition-all text-left flex items-center gap-4"
                >
                  <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-accent-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Schedule a call</p>
                    <p className="text-sm text-gray-500">Discuss results with an automation expert</p>
                  </div>
                </button>

                {/* View now option */}
                <button
                  onClick={handleViewResults}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all text-left flex items-center gap-4"
                >
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Eye className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">View results now</p>
                    <p className="text-sm text-gray-500">See your full automation report here</p>
                  </div>
                </button>

                {/* Error message */}
                {emailError && (
                  <p className="text-red-500 text-sm mt-2 flex items-center justify-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {emailError}
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </div>
      );
    }

    // Show full results after user makes a choice
    return (
      <>
        <div className="max-w-3xl mx-auto">
          <AuditResults
            painPoints={painPoints}
            recommendations={recommendations}
            nextSteps={nextSteps}
            confidence={0}
            onBookConsultation={scrollToBooking}
            onRestartAudit={resetAudit}
            onViewConversation={() => setShowConversation(true)}
            onEmailResults={handleEmailResults}
            canEmail={!emailSent}
          />
        </div>

        {/* Conversation History Modal */}
        <AnimatePresence>
          {showConversation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowConversation(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-brand-500" />
                    Your Conversation
                  </h3>
                  <button
                    onClick={() => setShowConversation(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                <div className="p-6 overflow-y-auto max-h-[60vh] bg-gray-50">
                  {messages.map((msg, i) => renderMessageForModal(msg, i))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Escalated state - Show escalation message
  if (state === 'ESCALATED') {
    return (
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8 text-center"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Let's Talk in Person
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Based on the information provided, we want to make sure you receive the best possible guidance.
            Your needs are unique and would benefit from a personalized consultation.
          </p>
          {escalationReason && (
            <p className="text-sm text-gray-500 mb-6 italic">
              "{escalationReason}"
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={scrollToBooking}
              className="btn-primary flex items-center justify-center gap-2"
            >
              <Calendar className="w-5 h-5" />
              Book Free Consultation
            </button>
            <button
              onClick={resetAudit}
              className="btn-secondary"
            >
              Try Audit Again
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Active audit - Chat interface
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
            >
              {milestoneMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Simple header with title, insight counter, and restart */}
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
                >
                  <Lightbulb className="w-4 h-4" />
                  <span>{painPoints.length} insight{painPoints.length > 1 ? 's' : ''}</span>
                </motion.div>
              )}
            </div>
            <button
              onClick={resetAudit}
              className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Start Over
            </button>
          </div>
        </div>

        {/* Messages area */}
        <div className="h-[400px] overflow-y-auto p-6 bg-gray-50">
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
                <div className="flex items-center gap-2">
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
              <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg flex items-center gap-2 text-sm">
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
          {suggestions.length > 0 && !isLoading && (
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-2">Quick responses:</p>
              <motion.div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
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
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <span className="absolute bottom-2 right-3 text-xs text-gray-400">
                {inputValue.length}/2000
              </span>
            </div>
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="px-4 py-3 bg-brand-500 text-white rounded-xl hover:bg-brand-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Press Enter to send, Shift+Enter for new line
          </p>
        </form>
      </div>
    </div>
  );
}
