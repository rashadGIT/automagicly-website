import { z } from 'zod';

// Review validation schemas
export const reviewUpdateSchema = z.object({
  id: z.string().uuid('Invalid review ID format'),
  status: z.enum(['approved', 'rejected', 'pending']).optional(),
  featured: z.boolean().optional(),
}).refine(data => data.status !== undefined || data.featured !== undefined, {
  message: 'At least one of status or featured must be provided'
});

export const reviewDeleteSchema = z.object({
  id: z.string().uuid('Invalid review ID format'),
});

export const reviewQuerySchema = z.object({
  status: z.enum(['approved', 'rejected', 'pending', 'all']).optional(),
});

// Chat validation schema
export const chatMessageSchema = z.object({
  message: z.string()
    .min(1, 'Message cannot be empty')
    .max(1000, 'Message too long (max 1000 characters)'),
  sessionId: z.string()
    .min(1, 'Session ID required')
    .max(200, 'Invalid session ID'),
});

// Booking validation schema
export const bookingQuerySchema = z.object({
  start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional(),
  end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional(),
  timezone: z.string().max(100).optional(),
});

// Email validation
export const emailSchema = z.string().email('Invalid email address').max(255);

// Rating validation
export const ratingSchema = z.number().int().min(1).max(5);
