/**
 * Momen Photo Service
 * Business logic for photo management
 */

import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { photos, events } from '@/lib/db/schema';
import { getTenantDb } from '@/lib/db';
import type { IPhoto, IPhotoCreate, IPhotoUpdate, PhotoMetadata, UploadResult } from '@/lib/validation/photo.schema';
import { R2StorageService } from '@/lib/storage/r2';

// ============================================
// TYPES
// ============================================

export interface PhotoFilters {
  status?: 'pending' | 'approved' | 'rejected';
  limit?: number;
  offset?: number;
  sortBy?: 'uploaded_at' | 'likes' | 'downloads';
  sortOrder?: 'asc' | 'desc';
}

export interface PhotoWithEvent extends IPhoto {
  event?: {
    id: string;
    name: string;
    shortCode: string;
  };
}

// ============================================
// PHOTO SERVICE
// ============================================

export class PhotoService {
  private tenantId: string;
  private storage: R2StorageService;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
    this.storage = new R2StorageService();
  }

  /**
   * Upload a photo to an event
   */
  async upload(
    eventId: string,
    file: File,
    options: {
      caption?: string;
      uploadedById?: string;
      uploaderName?: string;
      uploaderEmail?: string;
    } = {}
  ): Promise<UploadResult> {
    const tenantDb = getTenantDb(this.tenantId);

    // Verify event exists and is active
    const event = await tenantDb.findOne(events, { id: eventId });
    if (!event) {
      throw new Error('Event not found');
    }

    if (event.status !== 'active') {
      throw new Error('Event is not active');
    }

    // Check if photo approval is required
    const requiresApproval = event.settings?.photoApproval && !event.settings?.autoApprove;

    // Generate unique photo ID
    const photoId = crypto.randomUUID();

    // Upload to R2 and get processed images
    const processedImages = await this.storage.uploadPhoto(
      this.tenantId,
      eventId,
      photoId,
      file
    );

    // Extract metadata from the processed images
    const metadata: PhotoMetadata = {
      width: processedImages.width,
      height: processedImages.height,
      format: processedImages.format,
      size: file.size,
    };

    // Create photo record
    const [photo] = await tenantDb.insert(photos).values({
      id: photoId,
      tenantId: this.tenantId,
      eventId,
      uploadedById: options.uploadedById || null,
      originalUrl: processedImages.originalUrl,
      thumbnailUrl: processedImages.thumbnailUrl,
      mediumUrl: processedImages.mediumUrl,
      largeUrl: processedImages.largeUrl,
      caption: options.caption || null,
      status: requiresApproval ? 'pending' : 'approved',
      metadata,
    }).returning();

    return {
      photoId: photo.id,
      originalUrl: photo.originalUrl,
      thumbnailUrl: photo.thumbnailUrl,
      mediumUrl: photo.mediumUrl,
      largeUrl: photo.largeUrl,
    };
  }

  /**
   * Get photo by ID
   */
  async getById(photoId: string): Promise<IPhoto | null> {
    const tenantDb = getTenantDb(this.tenantId);
    return await tenantDb.findOne(photos, { id: photoId });
  }

  /**
   * List photos for an event
   */
  async list(eventId: string, filters: PhotoFilters = {}): Promise<IPhoto[]> {
    const tenantDb = getTenantDb(this.tenantId);
    const { status, limit = 50, offset = 0, sortBy = 'uploaded_at', sortOrder = 'desc' } = filters;

    const conditions = [eq(photos.tenantId, this.tenantId), eq(photos.eventId, eventId)];

    if (status) {
      conditions.push(eq(photos.status, status));
    }

    const result = await tenantDb.query.photos.findMany({
      where: and(...conditions),
      orderBy: sortOrder === 'asc' ? sql`${photos[sortBy]} ASC` : sql`${photos[sortBy]} DESC`,
      limit,
      offset,
    });

    return result;
  }

  /**
   * Update photo
   */
  async update(photoId: string, data: IPhotoUpdate): Promise<IPhoto | null> {
    const tenantDb = getTenantDb(this.tenantId);

    // Check if photo exists
    const existing = await this.getById(photoId);
    if (!existing) {
      return null;
    }

    // Update photo
    await tenantDb.update(photos, data, { id: photoId });

    return this.getById(photoId);
  }

  /**
   * Delete photo
   */
  async delete(photoId: string): Promise<boolean> {
    const tenantDb = getTenantDb(this.tenantId);

    const existing = await this.getById(photoId);
    if (!existing) {
      return false;
    }

    // Delete from R2
    await this.storage.deletePhoto(this.tenantId, existing.eventId, photoId);

    // Delete from database
    await tenantDb.delete(photos, { id: photoId });

    return true;
  }

  /**
   * Approve photo
   */
  async approve(photoId: string): Promise<IPhoto | null> {
    return this.update(photoId, { status: 'approved' });
  }

  /**
   * Reject photo
   */
  async reject(photoId: string): Promise<IPhoto | null> {
    return this.update(photoId, { status: 'rejected' });
  }

  /**
   * Get pending photos for an event
   */
  async getPending(eventId: string): Promise<IPhoto[]> {
    return this.list(eventId, { status: 'pending' });
  }

  /**
   * Get approved photos for an event (for gallery)
   */
  async getApproved(eventId: string, limit = 100): Promise<IPhoto[]> {
    return this.list(eventId, { status: 'approved', limit });
  }

  /**
   * Bulk approve photos
   */
  async bulkApprove(photoIds: string[]): Promise<number> {
    const tenantDb = getTenantDb(this.tenantId);
    let count = 0;

    for (const photoId of photoIds) {
      const result = await this.approve(photoId);
      if (result) count++;
    }

    return count;
  }

  /**
   * Bulk reject photos
   */
  async bulkReject(photoIds: string[]): Promise<number> {
    const tenantDb = getTenantDb(this.tenantId);
    let count = 0;

    for (const photoId of photoIds) {
      const result = await this.reject(photoId);
      if (result) count++;
    }

    return count;
  }

  /**
   * Get photo count for an event
   */
  async getEventPhotoCount(eventId: string): Promise<number> {
    const tenantDb = getTenantDb(this.tenantId);

    const result = await tenantDb.query.photos.findMany({
      where: and(
        eq(photos.tenantId, this.tenantId),
        eq(photos.eventId, eventId),
        eq(photos.status, 'approved')
      ),
    });

    return result.length;
  }

  /**
   * Get storage usage for tenant
   */
  async getStorageUsage(): Promise<{ count: number; bytes: number }> {
    const tenantDb = getTenantDb(this.tenantId);

    const photos = await tenantDb.query.photos.findMany({
      where: eq(photos.tenantId, this.tenantId),
      columns: {
        metadata: true,
      },
    });

    const count = photos.length;
    const bytes = photos.reduce((sum, photo) => sum + (photo.metadata?.size || 0), 0);

    return { count, bytes };
  }
}
