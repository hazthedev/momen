/**
 * Momen Photo Approval API
 * Approve or reject photos
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { PhotoService } from '@/lib/services/photo.service';
import { photoIdSchema } from '@/lib/validation/photo.schema';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// ============================================
// POST /api/photos/[id]/approve - Approve photo
// ============================================
export async function POST(request: NextRequest, context: RouteContext) {
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

    // Approve photo
    const photoService = new PhotoService(session.tenantId);
    const photo = await photoService.approve(photoId);

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
    console.error('[PHOTOS] Approve error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to approve photo' } },
      { status: 500 }
    );
  }
}
