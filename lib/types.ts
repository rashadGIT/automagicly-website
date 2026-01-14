// TypeScript types for AutoMagicly landing page

export interface AuditFormData {
  name: string;
  email: string;
  company: string;
  biggestTimeWaster: string;
  tools: string[];
  preferredContact: string;
}

export interface ReviewFormData {
  name?: string;
  email?: string;
  company?: string;
  rating: number;
  reviewText: string;
  serviceType: string;
  featured?: boolean;
  status?: 'pending' | 'approved' | 'rejected';
  approvalToken?: string;
  submittedAt?: string;
  approvedAt?: string;
  // DynamoDB snake_case fields (for compatibility)
  review_text?: string;
  service_type?: string;
}

export interface ReferralFormData {
  yourName: string;
  yourEmail: string;
  referralName: string;
  referralContact: string;
  referralCompany?: string;
  helpNeeded: string;
}

export interface WaitlistFormData {
  email: string;
  interest: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  sources?: string[];
}

export interface ChatAPIRequest {
  source: string;
  submittedAt: string;
  sessionId: string;
  message: string;
}

export interface ChatAPIResponse {
  reply: string;
  blocked?: boolean;
  reason?: string;
  sources?: string[];
  conversationId?: string;
  timestamp?: string;
}

export interface ROICalculation {
  taskName: string;
  timePerTask: number;
  timesPerWeek: number;
  numberOfPeople: number;
  hourlyCost: number;
  efficiencyGain: number;
  buildCost: number;
  hoursSavedPerMonth: number;
  monthlySavings: number;
  paybackMonths: number;
  netSavings12Months: number;
}
