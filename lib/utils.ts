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
