/**
 * Momen Event by Short Code API
 * Get event by short code (public access for guest upload)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

type RouteContext = {
  params: Promise<{ code: string }>;
};

// Schema for short code validation
const shortCodeSchema = z.object({
  code: z.string().min(3).max(10).regex(/^[a-zA-Z0-9]+$/),
});

// ============================================
// GET /api/events/code/[code] - Get event by short code
// ============================================
export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    // Validate short code
    const params = await context.params;
    const { code } = shortCodeSchema.parse({ code: params.code });

    // For short code lookup, we need to find the tenant first
    // This requires cross-tenant lookup, which is allowed for public events
    // For MVP, we'll query the main database to find the tenant

    // Since we don't have tenantId, we need to query across tenants
    // This is a simplified approach - in production you might want a different strategy
    const { db } = await import('@/lib/db');
    const { events } = await import('@/lib/db/schema');
    const { eq } = await import('drizzle-orm');

    // Find event by short code (cross-tenant lookup)
    const result = await db.select()
      .from(events)
      .where(eq(events.shortCode, code.toLowerCase()))
      .limit(1);

    const event = result[0] || null;

    if (!event) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Event not found' } },
        { status: 404 }
      );
    }

    // Only show active events via short code
    if (event.status !== 'active') {
      return NextResponse.json(
        { error: { code: 'EVENT_NOT_ACTIVE', message: 'Event is not currently active' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        event: {
          id: event.id,
          name: event.name,
          slug: event.slug,
          shortCode: event.shortCode,
          description: event.description,
          startDate: event.startDate,
          endDate: event.endDate,
          location: event.location,
          settings: event.settings,
        },
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid short code' } },
        { status: 400 }
      );
    }

    console.error('[EVENTS] Get by short code error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch event' } },
      { status: 500 }
    );
  }
}
