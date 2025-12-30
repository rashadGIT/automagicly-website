// Utility functions for AutoMagicly landing page

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generate a stable session ID for chat
export function getSessionId(): string {
  if (typeof window === 'undefined') return '';

  let sessionId = localStorage.getItem('automagicly_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('automagicly_session_id', sessionId);
  }
  return sessionId;
}

// Basic profanity filter (simple implementation)
const profanityList = ['spam', 'fuck', 'shit', 'damn', 'bitch', 'ass'];
export function containsProfanity(text: string): boolean {
  const lowerText = text.toLowerCase();
  return profanityList.some(word => lowerText.includes(word));
}

// Check if message is asking for pricing/proposals
export function isPricingRequest(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  const pricingKeywords = [
    'how much',
    'price',
    'pricing',
    'cost',
    'quote',
    'estimate',
    'proposal',
    'how much does',
    'what does it cost',
    'give me a quote',
  ];
  return pricingKeywords.some(keyword => lowerMessage.includes(keyword));
}

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format number with commas
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(num));
}

// Smooth scroll to element
export function scrollToElement(elementId: string) {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// Send data to n8n webhook
export async function sendToN8N(webhookUrl: string | undefined, data: any): Promise<boolean> {
  if (!webhookUrl) {
    console.log('No webhook URL configured, skipping:', data);
    return true; // Success in demo mode
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        source: 'automagicly-website',
        submittedAt: new Date().toISOString(),
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Error sending to n8n:', error);
    return false;
  }
}

// Fetch busy dates from calendar
export async function fetchBusyDates(): Promise<Date[]> {
  console.log("🔍 CLIENT: Fetching busy dates from calendar");
  try {
    const startDate = new Date().toISOString().split('T')[0];
    const endDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 60 days ahead
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    console.log("🔍 CLIENT: Request params -", { startDate, endDate, timezone });

    const apiUrl = `/api/calendar/availability?start=${startDate}&end=${endDate}&timezone=${timezone}`;
    console.log("🔍 CLIENT: Calling API:", apiUrl);

    const response = await fetch(apiUrl);

    console.log("🔍 CLIENT: API response status:", response.status, response.statusText);
    
    console.log("dfuidewfiewdfe",response)
    
    if (!response.ok) {
      console.error('❌ CLIENT: Failed response when fetching busy dates:', response.status, response.statusText);
      return [];
    }

    const data = await response.json();
    console.log("🔍 CLIENT: API response data:", data);

    if (data.error) {
      console.error('❌ CLIENT: API returned error:', data.error);
    }

    if (data.busyDates && data.busyDates.length > 0) {
      console.log(`✅ CLIENT: Found ${data.busyDates.length} busy dates:`, data.busyDates);
    } else {
      console.log("⚠️ CLIENT: No busy dates returned from API");
    }

    // Convert date strings to Date objects
    return (data.busyDates || []).map((dateStr: string) => new Date(dateStr + 'T00:00:00'));
  } catch (error) {
    console.error('❌ CLIENT: Error fetching busy dates:', error);
    return [];
  }
}
