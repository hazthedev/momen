/**
 * Momen Event Validation Schemas
 * Zod schemas for event validation
 */

import { z } from 'zod';

// ============================================
// EVENT SCHEMAS
// ============================================

/**
 * Event creation schema
 */
export const createEventSchema = z.object({
  name: z
    .string()
    .min(3, 'Event name must be at least 3 characters')
    .max(100, 'Event name is too long'),
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(50, 'Slug is too long')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .optional(),
  description: z.string().max(500, 'Description is too long').optional(),
  location: z.string().max(200, 'Location is too long').optional(),
  startDate: z.coerce.date({
    errorMap: () => ({ message: 'Invalid start date' }),
  }),
  endDate: z.coerce.date({
    errorMap: () => ({ message: 'Invalid end date' }),
  }).optional(),
  settings: z
    .object({
      photoApproval: z.boolean().optional(),
      maxPhotos: z.number().int().positive().max(10000).default(1000),
      autoApprove: z.boolean().optional(),
      allowGuestUpload: z.boolean().optional(),
    })
    .optional(),
});

/**
 * Event update schema
 */
export const updateEventSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  slug: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().max(500).optional(),
  location: z.string().max(200).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  status: z.enum(['draft', 'active', 'ended']).optional(),
  settings: z
    .object({
      photoApproval: z.boolean().optional(),
      maxPhotos: z.number().int().positive().max(10000).optional(),
      autoApprove: z.boolean().optional(),
      allowGuestUpload: z.boolean().optional(),
    })
    .optional(),
});

/**
 * Event query params schema
 */
export const eventQuerySchema = z.object({
  search: z.string().optional(),
  status: z.enum(['draft', 'active', 'ended']).optional(),
  limit: z.coerce.number().int().positive().max(100).default(20),
  offset: z.coerce.number().int().nonnegative().default(0),
  sortBy: z.enum(['created_at', 'start_date', 'name']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Event ID params schema
 */
export const eventIdSchema = z.object({
  eventId: z.string().uuid('Invalid event ID'),
});

// ============================================
// TYPES
// ============================================

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type EventQueryInput = z.infer<typeof eventQuerySchema>;
export type EventIdInput = z.infer<typeof eventIdSchema>;

// ============================================
// EVENT TYPES (for database)
// ============================================

/**
 * Event database type
 */
export interface IEvent {
  id: string;
  tenantId: string;
  organizerId: string;
  name: string;
  slug: string;
  shortCode: string;
  description: string | null;
  startDate: Date;
  endDate: Date | null;
  location: string | null;
  status: 'draft' | 'active' | 'ended';
  settings: EventSettings;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Event creation input
 */
export interface IEventCreate {
  name: string;
  slug?: string;
  description?: string;
  location?: string;
  startDate: Date;
  endDate?: Date;
  settings?: EventSettings;
}

/**
 * Event update input
 */
export interface IEventUpdate {
  name?: string;
  slug?: string;
  description?: string;
  location?: string;
  startDate?: Date;
  endDate?: Date;
  status?: 'draft' | 'active' | 'ended';
  settings?: EventSettings;
}

/**
 * Event settings
 */
export interface EventSettings {
  photoApproval?: boolean;
  maxPhotos?: number;
  autoApprove?: boolean;
  allowGuestUpload?: boolean;
}
