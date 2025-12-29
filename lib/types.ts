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
