/**
 * Momen Bulk Photo Actions API
 * Bulk approve, reject, or delete photos
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { PhotoService } from '@/lib/services/photo.service';
import { z } from 'zod';

// ============================================
// VALIDATION SCHEMAS
// ============================================

const bulkActionSchema = z.object({
  action: z.enum(['approve', 'reject', 'delete']),
  photoIds: z.array(z.string().uuid()).min(1, 'At least one photo ID is required').max(100, 'Too many photos'),
});

// ============================================
// POST /api/photos/bulk - Bulk actions
// ============================================
export async function POST(request: NextRequest) {
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

    // Validate input
    const body = await request.json();
    const { action, photoIds } = bulkActionSchema.parse(body);

    // Perform bulk action
    const photoService = new PhotoService(session.tenantId);
    let count = 0;

    switch (action) {
      case 'approve':
        count = await photoService.bulkApprove(photoIds);
        break;
      case 'reject':
        count = await photoService.bulkReject(photoIds);
        break;
      case 'delete':
        for (const photoId of photoIds) {
          const deleted = await photoService.delete(photoId);
          if (deleted) count++;
        }
        break;
    }

    return NextResponse.json({
      success: true,
      data: {
        action,
        count,
        message: `Successfully ${action}d ${count} photo${count === 1 ? '' : 's'}`,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: (error as any).errors } },
        { status: 400 }
      );
    }

    console.error('[PHOTOS] Bulk action error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to perform bulk action' } },
      { status: 500 }
    );
  }
}
