/**
 * Momen Event Status API
 * Update event status (draft -> active -> ended)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { EventService } from '@/lib/services/event.service';
import { z } from 'zod';
import { eventIdSchema } from '@/lib/validation/event.schema';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// Schema for status update
const statusSchema = z.object({
  status: z.enum(['draft', 'active', 'ended']),
});

// ============================================
// PATCH /api/events/[id]/status - Update event status
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

    // Validate event ID
    const params = await context.params;
    const { eventId } = eventIdSchema.parse({ eventId: params.id });

    // Validate status
    const body = await request.json();
    const { status } = statusSchema.parse(body);

    // Update status
    const eventService = new EventService(session.tenantId);
    const success = await eventService.updateStatus(eventId, status);

    if (!success) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Event not found' } },
        { status: 404 }
      );
    }

    // Get updated event
    const event = await eventService.getById(eventId);

    return NextResponse.json({
      success: true,
      data: { event },
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: (error as any).errors } },
        { status: 400 }
      );
    }

    console.error('[EVENTS] Status update error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to update event status' } },
      { status: 500 }
    );
  }
}
