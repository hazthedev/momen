/**
 * Momen Single Photo API
 * Get, update, and delete individual photos
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { PhotoService } from '@/lib/services/photo.service';
import { updatePhotoSchema, photoIdSchema } from '@/lib/validation/photo.schema';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// ============================================
// GET /api/photos/[id] - Get photo by ID
// ============================================
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    // Get session
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

    // Validate photo ID
    const params = await context.params;
    const { photoId } = photoIdSchema.parse({ photoId: params.id });

    // Get photo
    const photoService = new PhotoService(session.tenantId);
    const photo = await photoService.getById(photoId);

    if (!photo) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Photo not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { photo },
    });
  } catch (error) {
    console.error('[PHOTOS] Get by ID error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch photo' } },
      { status: 500 }
    );
  }
}

// ============================================
// PATCH /api/photos/[id] - Update photo
// ============================================
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    // Get session
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

    // Validate photo ID
    const params = await context.params;
    const { photoId } = photoIdSchema.parse({ photoId: params.id });

    // Validate input
    const body = await request.json();
    const validatedData = updatePhotoSchema.parse(body);

    // Update photo
    const photoService = new PhotoService(session.tenantId);
    const photo = await photoService.update(photoId, validatedData);

    if (!photo) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Photo not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { photo },
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: (error as any).errors } },
        { status: 400 }
      );
    }

    console.error('[PHOTOS] Update error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to update photo' } },
      { status: 500 }
    );
  }
}

// ============================================
// DELETE /api/photos/[id] - Delete photo
// ============================================
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    // Get session
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

    // Validate photo ID
    const params = await context.params;
    const { photoId } = photoIdSchema.parse({ photoId: params.id });

    // Delete photo
    const photoService = new PhotoService(session.tenantId);
    const deleted = await photoService.delete(photoId);

    if (!deleted) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Photo not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { message: 'Photo deleted successfully' },
    });
  } catch (error) {
    console.error('[PHOTOS] Delete error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to delete photo' } },
      { status: 500 }
    );
  }
}
