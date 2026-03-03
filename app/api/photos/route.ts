/**
 * Momen Photos API
 * Upload and list photos
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { PhotoService } from '@/lib/services/photo.service';
import { photoQuerySchema } from '@/lib/validation/photo.schema';

// ============================================
// POST /api/photos - Upload photo
// ============================================
export async function POST(request: NextRequest) {
  try {
    // Get session
    const sessionId = request.cookies.get('session_id')?.value;

    // Allow guest uploads if event allows it
    let session = null;
    if (sessionId) {
      session = await getSession(sessionId);
    }

    // Parse multipart form data
    const formData = await request.formData();
    const eventId = formData.get('eventId') as string;
    const file = formData.get('file') as File;
    const caption = formData.get('caption') as string | null;
    const uploaderName = formData.get('uploaderName') as string | null;
    const uploaderEmail = formData.get('uploaderEmail') as string | null;

    // Validate event ID
    if (!eventId) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Event ID is required' } },
        { status: 400 }
      );
    }

    // Validate file
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'File is required' } },
        { status: 400 }
      );
    }

    // Check if user is authenticated or if event allows guest uploads
    if (!session) {
      if (uploaderName && uploaderEmail) {
        // Guest upload - validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(uploaderEmail)) {
          return NextResponse.json(
            { error: { code: 'VALIDATION_ERROR', message: 'Invalid email address' } },
            { status: 400 }
          );
        }
      } else {
        return NextResponse.json(
          { error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } },
          { status: 401 }
        );
      }
    }

    // Upload photo
    const photoService = new PhotoService(session?.tenantId || 'anonymous');
    const result = await photoService.upload(eventId, file, {
      caption: caption || undefined,
      uploadedById: session?.userId,
      uploaderName: uploaderName || undefined,
      uploaderEmail: uploaderEmail || undefined,
    });

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[PHOTOS] Upload error:', error);

    if (error instanceof Error) {
      if (error.message === 'Event not found') {
        return NextResponse.json(
          { error: { code: 'NOT_FOUND', message: error.message } },
          { status: 404 }
        );
      }
      if (error.message === 'Event is not active') {
        return NextResponse.json(
          { error: { code: 'EVENT_NOT_ACTIVE', message: error.message } },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to upload photo' } },
      { status: 500 }
    );
  }
}

// ============================================
// GET /api/photos - List photos
// ============================================
export async function GET(request: NextRequest) {
  try {
    // Get session (required for listing photos)
    const sessionId = request.cookies.get('session_id')?.value;
    if (!sessionId) {
      return NextResponse.json(
        { error: { code: 'AUTH_REQUIRED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    const session = await getSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: { code: 'SESSION_EXPIRED', message: 'Session expired' } },
        { status: 401 }
      );
    }

    // Parse query params
    const searchParams = request.nextUrl.searchParams;
    const filters = photoQuerySchema.parse({
      eventId: searchParams.get('eventId') || undefined,
      status: searchParams.get('status') || undefined,
      limit: searchParams.get('limit') || undefined,
      offset: searchParams.get('offset') || undefined,
      sortBy: searchParams.get('sortBy') || undefined,
      sortOrder: searchParams.get('sortOrder') || undefined,
    });

    // Get photos
    const photoService = new PhotoService(session.tenantId);

    if (!filters.eventId) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Event ID is required' } },
        { status: 400 }
      );
    }

    const photos = await photoService.list(filters.eventId, filters);

    return NextResponse.json({
      success: true,
      data: {
        photos,
        pagination: {
          limit: filters.limit,
          offset: filters.offset,
          total: photos.length,
        },
      },
    });
  } catch (error) {
    console.error('[PHOTOS] List error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch photos' } },
      { status: 500 }
    );
  }
}
