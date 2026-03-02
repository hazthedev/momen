/**
 * Momen Validation Utilities
 * Common validation schemas and helpers
 */

import { z } from 'zod';

// ============================================
// COMMON SCHEMAS
// ============================================

/**
 * Email validation
 */
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email format')
  .transform((val) => val.toLowerCase());

/**
 * Password validation
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long');

/**
 * UUID validation
 */
export const uuidSchema = z.string().uuid('Invalid UUID format');

/**
 * Slug validation (for URLs)
 */
export const slugSchema = z
  .string()
  .min(3, 'Slug must be at least 3 characters')
  .max(50, 'Slug is too long')
  .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens');

/**
 * Pagination schemas
 */
export const paginationSchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(50),
  offset: z.coerce.number().int().nonnegative().default(0),
});

/**
 * Date validation
 */
export const dateSchema = z.coerce.date({
  errorMap: () => ({ message: 'Invalid date format' }),
});

/**
 * Future date validation
 */
export function futureDateSchema(message = 'Date must be in the future') {
  return z.coerce
    .date({ errorMap: () => ({ message }) })
    .refine((date) => date > new Date(), { message });
}

/**
 * Phone validation (basic)
 */
export const phoneSchema = z
  .string()
  .regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone format')
  .optional();

// ============================================
// API REQUEST SCHEMAS
// ============================================

/**
 * List query parameters
 */
export const listQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(20),
  offset: z.coerce.number().int().nonnegative().default(0),
  search: z.string().optional(),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional(),
});

/**
 * ID parameter schema
 */
export const idParamSchema = z.object({
  id: uuidSchema,
});
