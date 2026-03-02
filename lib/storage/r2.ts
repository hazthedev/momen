/**
 * Momen R2 Storage Service
 * Handle image storage and processing with Cloudflare R2
 */

import { PutObjectCommand, DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import sharp from 'sharp';

// R2 configuration
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;

// ============================================
// TYPES
// ============================================

export interface ProcessedImageUrls {
  originalUrl: string;
  thumbnailUrl: string;
  mediumUrl: string;
  largeUrl: string;
  width: number;
  height: number;
  format: string;
  blurhash?: string;
}

export interface UploadOptions {
  maxSize?: number; // in bytes
  allowedFormats?: string[];
}

// ============================================
// R2 STORAGE SERVICE
// ============================================

export class R2StorageService {
  private client: ReturnType<typeof import('@aws-sdk/client-s3').S3Client>;
  private bucketName: string;
  private publicUrl: string;

  constructor() {
    if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
      throw new Error('R2 credentials not configured');
    }

    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
    });

    this.bucketName = R2_BUCKET_NAME;
    this.publicUrl = R2_PUBLIC_URL || `https://${R2_BUCKET_NAME}.r2.dev`;
  }

  /**
   * Upload and process a photo
   * Generates thumbnail, medium, and large versions
   */
  async uploadPhoto(
    tenantId: string,
    eventId: string,
    photoId: string,
    file: File,
    options: UploadOptions = {}
  ): Promise<ProcessedImageUrls> {
    const {
      maxSize = 50 * 1024 * 1024, // 50MB default
      allowedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    } = options;

    // Validate file size
    if (file.size > maxSize) {
      throw new Error(`File size exceeds maximum of ${maxSize} bytes`);
    }

    // Validate file type
    if (!allowedFormats.includes(file.type)) {
      throw new Error(`File type ${file.type} is not allowed`);
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Get image metadata
    const metadata = await sharp(buffer).metadata();

    // Process and upload different sizes
    const [thumbnail, medium, large] = await Promise.all([
      this.processAndUpload(buffer, tenantId, eventId, photoId, 'thumbnail', 200, 200),
      this.processAndUpload(buffer, tenantId, eventId, photoId, 'medium', 800, 600),
      this.processAndUpload(buffer, tenantId, eventId, photoId, 'large', 1920, 1080),
    ]);

    // Upload original
    const originalKey = this.getKey(tenantId, eventId, photoId, 'original');
    await this.uploadBuffer(originalKey, buffer, file.type);

    return {
      originalUrl: this.getPublicUrl(originalKey),
      thumbnailUrl: thumbnail.url,
      mediumUrl: medium.url,
      largeUrl: large.url,
      width: metadata.width || 0,
      height: metadata.height || 0,
      format: metadata.format || 'jpg',
    };
  }

  /**
   * Process image to specific dimensions and upload
   */
  private async processAndUpload(
    buffer: Buffer,
    tenantId: string,
    eventId: string,
    photoId: string,
    size: 'thumbnail' | 'medium' | 'large',
    width: number,
    height: number
  ): Promise<{ url: string; width: number; height: number }> {
    // Process image with sharp
    const processedBuffer = await sharp(buffer)
      .resize(width, height, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ quality: size === 'thumbnail' ? 80 : 85 })
      .toBuffer();

    // Upload to R2
    const key = this.getKey(tenantId, eventId, photoId, size);
    await this.uploadBuffer(key, processedBuffer, 'image/jpeg');

    return {
      url: this.getPublicUrl(key),
      width,
      height,
    };
  }

  /**
   * Upload buffer to R2
   */
  private async uploadBuffer(key: string, buffer: Buffer, contentType: string): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });

    await this.client.send(command);
  }

  /**
   * Delete photo from R2
   */
  async deletePhoto(tenantId: string, eventId: string, photoId: string): Promise<void> {
    const sizes = ['original', 'thumbnail', 'medium', 'large'] as const;

    await Promise.all(
      sizes.map((size) => {
        const key = this.getKey(tenantId, eventId, photoId, size);
        const command = new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        });
        return this.client.send(command);
      })
    );
  }

  /**
   * Generate storage key for a photo
   */
  private getKey(tenantId: string, eventId: string, photoId: string, size: string): string {
    return `${tenantId}/${eventId}/${photoId}/${size}.jpg`;
  }

  /**
   * Get public URL for a key
   */
  private getPublicUrl(key: string): string {
    return `${this.publicUrl}/${key}`;
  }
}
