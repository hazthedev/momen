/**
 * Momen Public Photos API
 * Get approved photos for an event (no auth required)
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { photos } from '@/lib/db/schema';
import { eq, and, desc, asc } from 'drizzle-orm';

// ============================================
// GET /api/public/photos - List approved photos (public)
// ============================================
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const eventId = searchParams.get('eventId');
    const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 200);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';

    // eventId is required
    if (!eventId) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Event ID is required' } },
        { status: 400 }
      );
    }

    // Only return approved photos for the public gallery
    const conditions = [
      eq(photos.eventId, eventId),
      eq(photos.status, 'approved'),
    ];

    const result = await db
      .select({
        id: photos.id,
        eventId: photos.eventId,
        caption: photos.caption,
        status: photos.status,
        images: photos.images,
        contributorName: photos.contributorName,
        isAnonymous: photos.isAnonymous,
        reactions: photos.reactions,
        metadata: photos.metadata,
        createdAt: photos.createdAt,
        approvedAt: photos.approvedAt,
      })
      .from(photos)
      .where(and(...conditions))
      .orderBy(sortOrder === 'asc' ? asc(photos.createdAt) : desc(photos.createdAt))
      .limit(limit)
      .offset(offset);

    // Map DB columns to IPhoto interface shape expected by the frontend
    const mappedPhotos = result.map((photo) => {
      const images = photo.images as Record<string, string> | null;
      return {
        id: photo.id,
        eventId: photo.eventId,
        uploadedById: null,
        caption: photo.caption,
        status: photo.status,
        contributorName: photo.isAnonymous ? null : (photo.contributorName || null),
        isAnonymous: photo.isAnonymous,
        reactions: photo.reactions,
        metadata: photo.metadata,
        originalUrl: images?.original || images?.large || '',
        thumbnailUrl: images?.thumbnail || images?.original || '',
        mediumUrl: images?.medium || images?.original || '',
        largeUrl: images?.large || images?.original || '',
        uploadedAt: photo.createdAt,
        processedAt: photo.approvedAt,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        photos: mappedPhotos,
        pagination: {
          limit,
          offset,
          total: mappedPhotos.length,
        },
      },
    });
  } catch (error) {
    console.error('[PUBLIC PHOTOS] List error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch photos' } },
      { status: 500 }
    );
  }
}
