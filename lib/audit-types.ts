// TypeScript interfaces for AI Business Audit feature

// Confidence scoring signals (0-1 scale)
export interface ConfidenceScores {
  I: number;  // Industry Clarity
  R: number;  // Role/Process Understanding
  P: number;  // Pain Point Clarity
  M: number;  // Mappability to Automation/AI
  K: number;  // Contradictions/Noise Penalty
  overall: number;  // Computed: 0.25*I + 0.25*R + 0.30*P + 0.20*M - K
}

// Message in conversation history
export interface AuditMessage {
  role: 'assistant' | 'user';
  content: string;
  timestamp: number;
  questionNumber?: number;  // For assistant questions
  isFixed?: boolean;  // True for discovery questions 1-3
}

// Pain point identified during audit
export interface PainPoint {
  category: string;  // e.g., 'data-entry', 'communication', 'scheduling'
  description: string;
  severity: 'low' | 'medium' | 'high';
  automationPotential?: number;  // 0-1 scale
}

// Recommendation generated after audit
export interface Recommendation {
  title: string;
  description: string;
  mappedPainPoint?: string;
  suggestedTooling?: ('AWS' | 'n8n')[];
  estimatedROI?: string;
  complexity: 'low' | 'medium' | 'high';
  priority: number;  // 1 = highest priority
}

// Contact info collected before starting audit
export interface ContactInfo {
  name: string;
  email: string;
  phone?: string;
}

// Audit session states
export type AuditState = 'IDLE' | 'COLLECTING_INFO' | 'DISCOVERY' | 'ADAPTIVE' | 'EVALUATING' | 'COMPLETE' | 'ESCALATED';

// Full audit session stored in DynamoDB
export interface AuditSession {
  sessionId: string;  // Partition key (UUID)
  createdAt: number;  // Timestamp (milliseconds)
  updatedAt: number;
  expiresAt: number;  // TTL for auto-cleanup (72 hours)

  // State machine
  state: AuditState;
  questionCount: number;  // Current question number (1-15)

  // Contact info (collected before starting audit)
  contactInfo?: ContactInfo;

  // Conversation history
  messages: AuditMessage[];

  // Confidence scores (updated by n8n Claude)
  confidence: ConfidenceScores;

  // Derived insights
  painPoints: PainPoint[];

  // Results (populated when state === 'COMPLETE' or 'ESCALATED')
  recommendations?: Recommendation[];
  escalationReason?: string;
  nextSteps?: string;

  // For GSI queries
  status: 'active' | 'complete' | 'escalated' | 'abandoned';
}

// API Request/Response types

// POST /api/audit/session - Start new session
export interface CreateSessionResponse {
  sessionId: string;
  question: string;
  questionNumber: number;
  totalQuestions: number;
  isFixedQuestion: boolean;
  state: AuditState;
}

// POST /api/audit/message - Continue audit
export interface AuditMessageRequest {
  sessionId: string;
  message: string;
}

// Response when continuing (more questions)
export interface AuditContinueResponse {
  sessionId: string;
  question: string;
  questionNumber: number;
  totalQuestions: number;
  isFixedQuestion: boolean;
  state: 'DISCOVERY' | 'ADAPTIVE';
  progress: number;  // 0-100 percentage
  suggestedResponses?: string[];  // AI-generated quick response options
}

// Response when complete (recommendations ready)
export interface AuditCompleteResponse {
  sessionId: string;
  state: 'COMPLETE';
  painPoints: PainPoint[];
  recommendations: Recommendation[];
  nextSteps: string;
  confidence: number;
}

// Response when escalated (needs human)
export interface AuditEscalatedResponse {
  sessionId: string;
  state: 'ESCALATED';
  reason: string;
  message: string;
  bookingUrl: string;
}

// Union type for all possible audit responses
export type AuditMessageResponse = AuditContinueResponse | AuditCompleteResponse | AuditEscalatedResponse;

// n8n Webhook Request/Response types

// Request sent to n8n webhook
export interface N8nAuditRequest {
  sessionId: string;
  message: string;
  questionNumber: number;
  state: 'DISCOVERY' | 'ADAPTIVE';
  conversationHistory: Array<{ role: 'assistant' | 'user'; content: string }>;
  currentConfidence: ConfidenceScores;
  source: string;
  submittedAt: string;
}

// Response from n8n webhook
export interface N8nAuditResponse {
  nextQuestion?: string;
  suggestedResponses?: string[];  // AI-generated quick response options
  updatedConfidence: ConfidenceScores;
  derivedPainPoints?: PainPoint[];
  shouldStop: boolean;
  recommendations?: Recommendation[];
  shouldEscalate?: boolean;
  escalationReason?: string;
  nextSteps?: string;
}

// Fixed discovery questions (always asked first)
export const DISCOVERY_QUESTIONS = [
  'What industry do you work in?',
  'What does a typical workday look like for you right now?',
  'What is the biggest challenge or frustration you face in your business or role today?'
] as const;

// Default confidence scores for new sessions
export const DEFAULT_CONFIDENCE: ConfidenceScores = {
  I: 0,
  R: 0,
  P: 0,
  M: 0,
  K: 0,
  overall: 0
};

// Confidence calculation helper
export function calculateOverallConfidence(scores: Omit<ConfidenceScores, 'overall'>): number {
  const raw = 0.25 * scores.I + 0.25 * scores.R + 0.30 * scores.P + 0.20 * scores.M - scores.K;
  return Math.max(0, Math.min(1, raw));  // Clamp to [0, 1]
}

// Check if confidence threshold is met for stopping
export function shouldStopAudit(confidence: ConfidenceScores): boolean {
  return confidence.overall >= 0.75 && confidence.P >= 0.7 && confidence.M >= 0.5;
}

// Maximum number of questions
export const MAX_QUESTIONS = 10;

// Session TTL (72 hours in milliseconds)
export const SESSION_TTL_MS = 72 * 60 * 60 * 1000;
