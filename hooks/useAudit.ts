// hooks/useAudit.ts
import { useState, useCallback, useEffect } from 'react';
import {
  AuditState,
  AuditMessage,
  PainPoint,
  Recommendation,
  ContactInfo,
  CreateSessionResponse,
  AuditMessageResponse,
  AuditContinueResponse,
  AuditCompleteResponse,
  AuditEscalatedResponse,
  MAX_QUESTIONS
} from '@/lib/audit-types';

const STORAGE_KEY = 'automagicly_audit_session';

interface AuditHookState {
  sessionId: string | null;
  state: AuditState;
  questionNumber: number;
  totalQuestions: number;
  progress: number;
  messages: AuditMessage[];
  currentQuestion: string | null;
  isFixedQuestion: boolean;
  suggestedResponses: string[];  // AI-generated quick response options
  painPoints: PainPoint[];
  recommendations: Recommendation[];
  nextSteps: string | null;
  escalationReason: string | null;
  confidence: number;
  contactInfo: ContactInfo | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuditHookState = {
  sessionId: null,
  state: 'IDLE',
  questionNumber: 0,
  totalQuestions: MAX_QUESTIONS,
  progress: 0,
  messages: [],
  currentQuestion: null,
  isFixedQuestion: true,
  suggestedResponses: [],
  painPoints: [],
  recommendations: [],
  nextSteps: null,
  escalationReason: null,
  confidence: 0,
  contactInfo: null,
  isLoading: false,
  error: null
};

export function useAudit() {
  const [auditState, setAuditState] = useState<AuditHookState>(initialState);

  // Load session from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Only restore if session is still active
        if (parsed.sessionId && parsed.state !== 'COMPLETE' && parsed.state !== 'ESCALATED') {
          setAuditState(prev => ({
            ...prev,
            sessionId: parsed.sessionId,
            // We'll need to resume from API
          }));
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Persist session to localStorage
  const persistSession = useCallback((sessionId: string, state: AuditState) => {
    if (state === 'COMPLETE' || state === 'ESCALATED') {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ sessionId, state }));
    }
  }, []);

  // Show contact form before starting audit
  const showContactForm = useCallback(() => {
    setAuditState(prev => ({ ...prev, state: 'COLLECTING_INFO', error: null }));
  }, []);

  // Start a new audit session with contact info
  const startAudit = useCallback(async (contactInfo?: ContactInfo) => {
    setAuditState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/audit/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ contactInfo })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start audit');
      }

      const data: CreateSessionResponse = await response.json();

      const firstMessage: AuditMessage = {
        role: 'assistant',
        content: data.question,
        timestamp: Date.now(),
        questionNumber: data.questionNumber,
        isFixed: data.isFixedQuestion
      };

      setAuditState({
        sessionId: data.sessionId,
        state: data.state,
        questionNumber: data.questionNumber,
        totalQuestions: data.totalQuestions,
        progress: Math.round((data.questionNumber / data.totalQuestions) * 100),
        messages: [firstMessage],
        currentQuestion: data.question,
        isFixedQuestion: data.isFixedQuestion,
        suggestedResponses: [],  // First question uses hardcoded suggestions
        painPoints: [],
        recommendations: [],
        nextSteps: null,
        escalationReason: null,
        confidence: 0,
        contactInfo: contactInfo || null,
        isLoading: false,
        error: null
      });

      persistSession(data.sessionId, data.state);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start audit';
      setAuditState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
    }
  }, [persistSession]);

  // Resume an existing session
  const resumeAudit = useCallback(async (sessionId: string) => {
    setAuditState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/audit/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ resumeSessionId: sessionId })
      });

      if (!response.ok) {
        // Session not found or expired, start fresh
        localStorage.removeItem(STORAGE_KEY);
        return startAudit();
      }

      const data: CreateSessionResponse = await response.json();

      const resumeMessage: AuditMessage = {
        role: 'assistant',
        content: data.question,
        timestamp: Date.now(),
        questionNumber: data.questionNumber,
        isFixed: data.isFixedQuestion
      };

      setAuditState({
        sessionId: data.sessionId,
        state: data.state,
        questionNumber: data.questionNumber,
        totalQuestions: data.totalQuestions,
        progress: Math.round((data.questionNumber / data.totalQuestions) * 100),
        messages: [resumeMessage],
        currentQuestion: data.question,
        isFixedQuestion: data.isFixedQuestion,
        suggestedResponses: [],  // Resume uses hardcoded suggestions
        painPoints: [],
        recommendations: [],
        nextSteps: null,
        escalationReason: null,
        confidence: 0,
        contactInfo: null,
        isLoading: false,
        error: null
      });

    } catch (err) {
      localStorage.removeItem(STORAGE_KEY);
      return startAudit();
    }
  }, [startAudit]);

  // Submit an answer
  const submitAnswer = useCallback(async (answer: string) => {
    if (!auditState.sessionId || !answer.trim()) return;

    // Add user message immediately
    const userMessage: AuditMessage = {
      role: 'user',
      content: answer,
      timestamp: Date.now()
    };

    setAuditState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null
    }));

    try {
      const response = await fetch('/api/audit/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId: auditState.sessionId,
          message: answer
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process answer');
      }

      const data: AuditMessageResponse = await response.json();

      // Handle different response states
      if (data.state === 'COMPLETE') {
        const completeData = data as AuditCompleteResponse;
        setAuditState(prev => ({
          ...prev,
          state: 'COMPLETE',
          painPoints: completeData.painPoints,
          recommendations: completeData.recommendations,
          nextSteps: completeData.nextSteps,
          confidence: completeData.confidence,
          currentQuestion: null,
          isLoading: false
        }));
        persistSession(auditState.sessionId!, 'COMPLETE');

      } else if (data.state === 'ESCALATED') {
        const escalatedData = data as AuditEscalatedResponse;
        const escalationMessage: AuditMessage = {
          role: 'assistant',
          content: escalatedData.message,
          timestamp: Date.now()
        };
        setAuditState(prev => ({
          ...prev,
          state: 'ESCALATED',
          messages: [...prev.messages, escalationMessage],
          escalationReason: escalatedData.reason,
          currentQuestion: null,
          isLoading: false
        }));
        persistSession(auditState.sessionId!, 'ESCALATED');

      } else {
        // Continue with next question
        const continueData = data as AuditContinueResponse;
        const assistantMessage: AuditMessage = {
          role: 'assistant',
          content: continueData.question,
          timestamp: Date.now(),
          questionNumber: continueData.questionNumber,
          isFixed: continueData.isFixedQuestion
        };

        setAuditState(prev => ({
          ...prev,
          state: continueData.state,
          questionNumber: continueData.questionNumber,
          progress: continueData.progress,
          messages: [...prev.messages, assistantMessage],
          currentQuestion: continueData.question,
          isFixedQuestion: continueData.isFixedQuestion,
          suggestedResponses: continueData.suggestedResponses || [],
          isLoading: false
        }));
        persistSession(auditState.sessionId!, continueData.state);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process answer';
      setAuditState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
    }
  }, [auditState.sessionId, persistSession]);

  // Reset audit
  const resetAudit = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setAuditState(initialState);
  }, []);

  return {
    // State
    sessionId: auditState.sessionId,
    state: auditState.state,
    questionNumber: auditState.questionNumber,
    totalQuestions: auditState.totalQuestions,
    progress: auditState.progress,
    messages: auditState.messages,
    currentQuestion: auditState.currentQuestion,
    isFixedQuestion: auditState.isFixedQuestion,
    suggestedResponses: auditState.suggestedResponses,
    painPoints: auditState.painPoints,
    recommendations: auditState.recommendations,
    nextSteps: auditState.nextSteps,
    escalationReason: auditState.escalationReason,
    confidence: auditState.confidence,
    contactInfo: auditState.contactInfo,
    isLoading: auditState.isLoading,
    error: auditState.error,

    // Actions
    showContactForm,
    startAudit,
    resumeAudit,
    submitAnswer,
    resetAudit
  };
}
