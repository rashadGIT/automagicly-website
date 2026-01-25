import { z } from 'zod';

// Review validation schemas
// Accept both UUID format (Supabase) and custom format (DynamoDB: review-timestamp-random)
const reviewIdSchema = z.string().min(1).max(100).refine(
  (id) => {
    // Check if it's a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    // Check if it's a valid DynamoDB format (review-timestamp-random)
    const dynamoRegex = /^review-\d+-\d+$/;
    return uuidRegex.test(id) || dynamoRegex.test(id);
  },
  'Invalid review ID format'
);

export const reviewUpdateSchema = z.object({
  id: reviewIdSchema,
  status: z.enum(['approved', 'rejected', 'pending']).optional(),
  featured: z.boolean().optional(),
}).refine(data => data.status !== undefined || data.featured !== undefined, {
  message: 'At least one of status or featured must be provided'
});

export const reviewDeleteSchema = z.object({
  id: reviewIdSchema,
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

// Review submission validation
export const reviewSubmissionSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long (max 100 characters)').optional(),
  email: emailSchema.optional(),
  company: z.string().max(100, 'Company name too long (max 100 characters)').optional(),
  rating: ratingSchema,
  reviewText: z.string()
    .min(10, 'Review must be at least 10 characters')
    .max(2000, 'Review too long (max 2000 characters)'),
  serviceType: z.string().min(1, 'Service type is required').max(100),
});

// AI Business Audit validation schemas

// UUID format for audit session IDs
const uuidSchema = z.string().uuid('Invalid session ID format');

// Phone number validation (optional, flexible format)
const phoneSchema = z.string()
  .regex(/^[\d\s\-\+\(\)]{7,20}$/, 'Invalid phone number format')
  .optional()
  .or(z.literal(''));

// Contact info for lead capture
export const contactInfoSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name too long (max 100 characters)'),
  email: z.string()
    .email('Invalid email address')
    .max(255, 'Email too long'),
  phone: phoneSchema,
});

// Create new audit session (with contact info)
export const auditSessionCreateSchema = z.object({
  resumeSessionId: uuidSchema.optional(),
  contactInfo: contactInfoSchema.optional(),
}).optional();

// Continue audit with message
export const auditMessageSchema = z.object({
  sessionId: uuidSchema,
  message: z.string()
    .min(1, 'Answer cannot be empty')
    .max(2000, 'Answer too long (max 2000 characters)'),
});
