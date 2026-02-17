'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useAudit } from '@/hooks/useAudit';
import AuditResults from './AuditResults';
import AuditStartScreen from './audit/AuditStartScreen';
import AuditContactForm from './audit/AuditContactForm';
import AuditChatInterface from './audit/AuditChatInterface';
import AuditProcessingScreen from './audit/AuditProcessingScreen';
import AuditCompletionOptions from './audit/AuditCompletionOptions';
import AuditEscalatedScreen from './audit/AuditEscalatedScreen';
import AuditConversationModal from './audit/AuditConversationModal';

// Fallback suggested responses for discovery questions (Q1-3)
const FALLBACK_DISCOVERY_SUGGESTIONS: Record<number, string[]> = {
  1: ['Healthcare', 'Real Estate', 'E-commerce', 'Professional Services', 'Construction', 'Retail'],
  2: ['Mostly desk work and emails', 'Client meetings and calls', 'Field work and site visits', 'Mix of office and remote work'],
  3: ['Too much manual data entry', 'Difficulty tracking leads', 'Scheduling conflicts', 'Slow response to customers'],
};

// Milestone messages for gamification
const MILESTONE_MESSAGES: Record<number, string> = {
  3: "Great start! Now let's dig deeper...",
  6: "You're doing great! Just a few more questions...",
  10: "Almost there! Your insights are valuable...",
  13: "Final stretch! Building your recommendations...",
};

interface AIBusinessAuditProps {
  onSwitchToBooking?: () => void;
}

/**
 * Main AI Business Audit component
 * Orchestrates the audit flow through different states:
 * IDLE → COLLECTING_INFO → ACTIVE → COMPLETE or ESCALATED
 */
export default function AIBusinessAudit({ onSwitchToBooking }: AIBusinessAuditProps = {}) {
  const {
    sessionId,
    state,
    questionNumber,
    messages,
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

  // UI state management
  const [showConversation, setShowConversation] = useState(false);
  const [milestoneMessage, setMilestoneMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCompletionOptions, setShowCompletionOptions] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const prevQuestionRef = useRef<number>(questionNumber);
  const prevStateRef = useRef<string>(state);

  // Get suggestions for current question
  const suggestions = suggestedResponses.length > 0
    ? suggestedResponses
    : (FALLBACK_DISCOVERY_SUGGESTIONS[questionNumber] || []);

  // Show milestone messages at key points
  useEffect(() => {
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
    if (state === 'COMPLETE' && prevStateRef.current !== 'COMPLETE') {
      setIsProcessing(true);
      setShowCompletionOptions(false);

      const timer = setTimeout(() => {
        setIsProcessing(false);
        setShowCompletionOptions(true);
      }, 5000);

      return () => clearTimeout(timer);
    }
    prevStateRef.current = state;
  }, [state]);

  // Handle email results request (memoized to prevent recreation)
  const handleEmailResults = useCallback(async () => {
    if (!sessionId) throw new Error('No session ID available');

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
  }, [sessionId]);

  // Switch to booking view or scroll to booking section (memoized)
  const scrollToBooking = useCallback(() => {
    if (onSwitchToBooking) {
      onSwitchToBooking();
    } else {
      const bookingSection = document.getElementById('booking') || document.getElementById('ai-audit');
      if (bookingSection) {
        bookingSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [onSwitchToBooking]);

  // Handle schedule call from completion options (memoized)
  const handleScheduleCall = useCallback(() => {
    setShowCompletionOptions(false);
    scrollToBooking();
  }, [scrollToBooking]);

  // Handle view results now (memoized)
  const handleViewResults = useCallback(() => {
    setShowCompletionOptions(false);
  }, []);

  // IDLE state - Start screen
  if (state === 'IDLE') {
    return <AuditStartScreen onStart={showContactForm} isLoading={isLoading} />;
  }

  // COLLECTING_INFO state - Contact form
  if (state === 'COLLECTING_INFO') {
    return (
      <AuditContactForm
        onSubmit={startAudit}
        onBack={resetAudit}
        isLoading={isLoading}
        error={error}
      />
    );
  }

  // COMPLETE state - Show processing, then completion options, then results
  if (state === 'COMPLETE') {
    if (isProcessing) {
      return <AuditProcessingScreen />;
    }

    if (showCompletionOptions) {
      return (
        <AuditCompletionOptions
          recommendationsCount={recommendations.length}
          contactInfo={contactInfo}
          onEmailResults={handleEmailResults}
          onScheduleCall={handleScheduleCall}
          onViewResults={handleViewResults}
        />
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

        <AuditConversationModal
          isOpen={showConversation}
          messages={messages}
          onClose={() => setShowConversation(false)}
        />
      </>
    );
  }

  // ESCALATED state - Show escalation message
  if (state === 'ESCALATED') {
    return (
      <AuditEscalatedScreen
        escalationReason={escalationReason}
        onScheduleCall={scrollToBooking}
        onReset={resetAudit}
      />
    );
  }

  // ACTIVE state - Chat interface
  return (
    <AuditChatInterface
      messages={messages}
      suggestedResponses={suggestions}
      painPoints={painPoints}
      questionNumber={questionNumber}
      isLoading={isLoading}
      error={error}
      milestoneMessage={milestoneMessage}
      onSubmitAnswer={submitAnswer}
      onReset={resetAudit}
    />
  );
}
