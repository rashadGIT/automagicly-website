// Utility functions for AutoMagicly landing page

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { NextRequest } from 'next/server';
import { sanitizeHtml as sanitize } from './sanitize';
import { Filter } from 'bad-words';
import { logger } from './logger';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Re-export sanitization function
export const sanitizeHtml = sanitize;

// Generate a stable session ID for chat
export function getSessionId(): string {
  if (typeof window === 'undefined') return '';

  let sessionId = localStorage.getItem('automagicly_session_id');
  if (!sessionId) {
    // Use crypto.randomUUID() for cryptographically secure random IDs
    sessionId = `session_${crypto.randomUUID()}`;
    localStorage.setItem('automagicly_session_id', sessionId);
  }
  return sessionId;
}

// Profanity filter using bad-words library
const profanityFilter = new Filter();

export function containsProfanity(text: string): boolean {
  return profanityFilter.isProfane(text);
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
    return false;
  }
}

// Fetch busy dates from calendar
export async function fetchBusyDates(): Promise<Date[]> {
  try {
    const startDate = new Date().toISOString().split('T')[0];
    const endDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 60 days ahead
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const apiUrl = `/api/calendar/availability?start=${startDate}&end=${endDate}&timezone=${timezone}`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      logger.error('Calendar API request failed', {
        status: response.status,
        statusText: response.statusText
      });
      logger.warn('Returning empty busy dates - all dates will appear available');
      return [];
    }

    const data = await response.json();

    // Check for API error response
    if (data.error) {
      logger.error('Calendar API returned error', { error: data.error });
      logger.warn('Returning empty busy dates - all dates will appear available');
      return [];
    }

    // Convert date strings to Date objects
    return (data.busyDates || []).map((dateStr: string) => new Date(dateStr + 'T00:00:00'));
  } catch (error) {
    logger.error('Failed to fetch calendar busy dates', {}, error as Error);
    logger.warn('Returning empty busy dates - all dates will appear available');
    return [];
  }
}

// Check if user is admin
export function isAdmin(session: any): boolean {
  return session?.user?.role === 'admin';
}

// CSRF Protection: Verify Origin/Referer headers
export function verifyCsrfToken(request: NextRequest): boolean {
  // Get the origin from headers
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const host = request.headers.get('host');

  // For same-origin requests, we expect origin or referer to match the host
  const allowedOrigins = [
    `http://${host}`,
    `https://${host}`,
    process.env.NEXTAUTH_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
  ].filter(Boolean);

  // Check origin header first (more reliable)
  // Must be exact match to prevent subdomain attacks (e.g., example.com.attacker.com)
  if (origin) {
    return allowedOrigins.some(allowed => origin === allowed);
  }

  // Fall back to referer if origin is not present
  // Referer can use startsWith since it includes the full URL path
  if (referer) {
    return allowedOrigins.some(allowed => referer.startsWith(allowed as string));
  }

  // If neither header is present, reject (likely CSRF attack)
  return false;
}
