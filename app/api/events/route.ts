/**
 * Momen Events API
 * List and create events
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { EventService } from '@/lib/services/event.service';
import { createEventSchema, eventQuerySchema } from '@/lib/validation/event.schema';

// ============================================
// GET /api/events - List events
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

    // Parse query params
    const searchParams = request.nextUrl.searchParams;
    const filters = eventQuerySchema.parse({
      search: searchParams.get('search') || undefined,
      status: searchParams.get('status') || undefined,
      limit: searchParams.get('limit') || undefined,
      offset: searchParams.get('offset') || undefined,
      sortBy: searchParams.get('sortBy') || undefined,
      sortOrder: searchParams.get('sortOrder') || undefined,
    });

    // Get events
    const eventService = new EventService(session.tenantId);
    const events = await eventService.list(filters);

    return NextResponse.json({
      success: true,
      data: {
        events,
        pagination: {
          limit: filters.limit,
          offset: filters.offset,
          total: events.length,
        },
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid query parameters' } },
        { status: 400 }
      );
    }

    console.error('[EVENTS] List error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch events' } },
      { status: 500 }
    );
  }
}

// ============================================
// POST /api/events - Create event
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
    const validatedData = createEventSchema.parse(body);

    // Create event
    const eventService = new EventService(session.tenantId);
    const event = await eventService.create({
      ...validatedData,
      organizerId: session.userId,
    });

    return NextResponse.json(
      {
        success: true,
        data: { event },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: (error as any).errors } },
        { status: 400 }
      );
    }

    console.error('[EVENTS] Create error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to create event' } },
      { status: 500 }
    );
  }
}
