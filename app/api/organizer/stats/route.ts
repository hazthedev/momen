/**
 * Momen Organizer Stats API
 * Get dashboard statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { EventService } from '@/lib/services/event.service';
import { PhotoService } from '@/lib/services/photo.service';

// ============================================
// GET /api/organizer/stats - Get dashboard stats
// ============================================
export async function GET(request: NextRequest) {
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

    const tenantId = session.tenantId;

    // Get event stats
    const eventService = new EventService(tenantId);
    const allEvents = await eventService.list({ limit: 1000 });

    const totalEvents = allEvents.length;
    const activeEvents = allEvents.filter((e) => e.status === 'active').length;

    // Get photo stats
    const photoService = new PhotoService(tenantId);
    const storageUsage = await photoService.getStorageUsage();


    return NextResponse.json({
      success: true,
      data: {
        totalEvents,
        activeEvents,
        totalPhotos: storageUsage.count,
        recentUploads: 0, // TODO: Implement recent uploads tracking
      },
    });
  } catch (error) {
    console.error('[ORGANIZER] Stats error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch stats' } },
      { status: 500 }
    );
  }
}
