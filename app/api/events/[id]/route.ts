/**
 * Momen Single Event API
 * Get, update, and delete individual events
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { EventService } from '@/lib/services/event.service';
import { updateEventSchema, eventIdSchema } from '@/lib/validation/event.schema';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// ============================================
// GET /api/events/[id] - Get event by ID
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

    // Validate event ID
    const params = await context.params;
    const { eventId } = eventIdSchema.parse({ eventId: params.id });

    // Get event
    const eventService = new EventService(session.tenantId);
    const event = await eventService.getById(eventId);

    if (!event) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Event not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { event },
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid event ID' } },
        { status: 400 }
      );
    }

    console.error('[EVENTS] Get by ID error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch event' } },
      { status: 500 }
    );
  }
}

// ============================================
// PATCH /api/events/[id] - Update event
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

    // Validate input
    const body = await request.json();
    const validatedData = updateEventSchema.parse(body);

    // Update event
    const eventService = new EventService(session.tenantId);
    const event = await eventService.update(eventId, validatedData);

    if (!event) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Event not found' } },
        { status: 404 }
      );
    }

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

    console.error('[EVENTS] Update error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to update event' } },
      { status: 500 }
    );
  }
}

// ============================================
// DELETE /api/events/[id] - Delete event
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

    // Validate event ID
    const params = await context.params;
    const { eventId } = eventIdSchema.parse({ eventId: params.id });

    // Delete event
    const eventService = new EventService(session.tenantId);
    const deleted = await eventService.delete(eventId);

    if (!deleted) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Event not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { message: 'Event deleted successfully' },
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid event ID' } },
        { status: 400 }
      );
    }

    console.error('[EVENTS] Delete error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to delete event' } },
      { status: 500 }
    );
  }
}
