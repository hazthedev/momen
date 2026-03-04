/**
 * Momen Photo Validation Schemas
 * Zod schemas for photo validation
 */

import { z } from 'zod';

// ============================================
// PHOTO SCHEMAS
// ============================================

/**
 * Photo upload schema
 */
export const uploadPhotoSchema = z.object({
  eventId: z.string().uuid('Invalid event ID'),
  file: z.instanceof(File, { message: 'File is required' }),
  caption: z.string().max(500, 'Caption is too long').optional(),
  tags: z.array(z.string().max(50)).max(10, 'Too many tags').optional(),
  uploaderName: z.string().max(100).optional(),
  uploaderEmail: z.string().email('Invalid email').optional(),
});

/**
 * Photo update schema
 */
export const updatePhotoSchema = z.object({
  caption: z.string().max(500).optional(),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
});

/**
 * Photo query params schema
 */
export const photoQuerySchema = z.object({
  eventId: z.string().uuid().optional(),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  limit: z.coerce.number().int().positive().max(100).default(50),
  offset: z.coerce.number().int().nonnegative().default(0),
  sortBy: z.enum(['uploaded_at']).default('uploaded_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Photo ID params schema
 */
export const photoIdSchema = z.object({
  photoId: z.string().uuid('Invalid photo ID'),
});

// ============================================
// TYPES
// ============================================

export type UploadPhotoInput = z.infer<typeof uploadPhotoSchema>;
export type UpdatePhotoInput = z.infer<typeof updatePhotoSchema>;
export type PhotoQueryInput = z.infer<typeof photoQuerySchema>;
export type PhotoIdInput = z.infer<typeof photoIdSchema>;

// ============================================
// PHOTO TYPES (for database)
// ============================================

/**
 * Photo database type
 */
export interface IPhoto {
  id: string;
  tenantId: string;
  eventId: string;
  uploadedById: string | null;
  originalUrl: string;
  thumbnailUrl: string;
  mediumUrl: string;
  largeUrl: string;
  caption: string | null;
  status: 'pending' | 'approved' | 'rejected';
  metadata: PhotoMetadata;
  uploadedAt: Date;
  processedAt: Date | null;
}

/**
 * Photo creation input
 */
export interface IPhotoCreate {
  eventId: string;
  uploadedById?: string;
  originalUrl: string;
  thumbnailUrl: string;
  mediumUrl: string;
  largeUrl: string;
  caption?: string;
  status?: 'pending' | 'approved' | 'rejected';
  metadata: PhotoMetadata;
}

/**
 * Photo update input
 */
export interface IPhotoUpdate {
  caption?: string;
  status?: 'pending' | 'approved' | 'rejected';
}

/**
 * Photo metadata
 */
export interface PhotoMetadata {
  width: number;
  height: number;
  format: string;
  size: number;
}

/**
 * Upload result
 */
export interface UploadResult {
  photoId: string;
  originalUrl: string;
  thumbnailUrl: string;
  mediumUrl: string;
  largeUrl: string;
}
