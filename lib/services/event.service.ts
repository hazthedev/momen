/**
 * Momen Event Service
 * Business logic for event management
 */

import { eq, and, desc, asc, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { events, tenants } from '@/lib/db/schema';
import { getTenantDb } from '@/lib/db';
import type { IEvent, IEventCreate, IEventUpdate } from '@/lib/db/schema'; // We'll create types

// ============================================
// TYPES
// ============================================
export interface EventFilters {
  search?: string;
  status?: 'draft' | 'active' | 'ended';
  limit?: number;
  offset?: number;
  sortBy?: 'created_at' | 'start_date' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface EventWithPhotoCount extends IEvent {
  photo_count?: number;
}

// ============================================
// EVENT SERVICE
// ============================================
export class EventService {
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  /**
   * Create a new event
   */
  async create(data: IEventCreate): Promise<IEvent> {
    const tenantDb = getTenantDb(this.tenantId);

    // Generate unique short code
    const shortCode = await this.generateShortCode();

    // Create event
    const [event] = await tenantDb.insert(events).values({
      ...data,
      tenantId: this.tenantId,
      shortCode,
      status: 'draft',
    }).returning();

    return event;
  }

  /**
   * Get event by ID
   */
  async getById(eventId: string): Promise<IEvent | null> {
    const tenantDb = getTenantDb(this.tenantId);
    return await tenantDb.findOne(events, { id: eventId });
  }

  /**
   * Get event by short code
   */
  async getByShortCode(shortCode: string): Promise<IEvent | null> {
    const tenantDb = getTenantDb(this.tenantId);
    return await tenantDb.findOne(events, { shortCode });
  }

  /**
   * List events with optional filters
   */
  async list(filters: EventFilters = {}): Promise<IEvent[]> {
    const tenantDb = getTenantDb(this.tenantId);
    const { search, status, limit = 50, offset = 0, sortBy = 'created_at', sortOrder = 'desc' } = filters;

    let query = tenantDb.query.events.findMany({
      where: (events, { eq }) => {
        const conditions = [eq(events.tenantId, this.tenantId)];

        if (status) {
          conditions.push(eq(events.status, status));
        }

        if (search) {
          conditions.push(sql`(${events.name} ILIKE ${`%${search}%`} OR ${events.description} ILIKE ${`%${search}%`})`);
        }

        return and(...conditions);
      },
      orderBy: sortOrder === 'asc' ? asc(sortBy) : desc(sortBy),
      limit,
      offset,
    });

    return query;
  }

  /**
   * Update an event
   */
  async update(eventId: string, data: IEventUpdate): Promise<IEvent | null> {
    const tenantDb = getTenantDb(this.tenantId);

    // Check if event exists and belongs to tenant
    const existing = await this.getById(eventId);
    if (!existing) {
      return null;
    }

    // Update event
    await tenantDb.update(events, data, { id: eventId });

    return this.getById(eventId);
  }

  /**
   * Delete an event
   */
  async delete(eventId: string): Promise<boolean> {
    const tenantDb = getTenantDb(this.tenantId);

    // Check if event exists and belongs to tenant
    const existing = await this.getById(eventId);
    if (!existing) {
      return false;
    }

    await tenantDb.delete(events, { id: eventId });
    return true;
  }

  /**
   * Get event with photo count
   */
  async getWithPhotoCount(eventId: string): Promise<EventWithPhotoCount | null> {
    const tenantDb = getTenantDb(this.tenantId);

    // This would require joining with photos table - for now, get event and count separately
    const event = await this.getById(eventId);
    if (!event) return null;

    // TODO: Add photo count query
    return { ...event, photo_count: 0 };
  }

  /**
   * List events with photo counts (for dashboard)
   */
  async listWithPhotoCounts(filters: EventFilters = {}): Promise<EventWithPhotoCount[]> {
    const events = await this.list(filters);
    // TODO: Batch query for photo counts
    return events.map((e) => ({ ...e, photo_count: 0 }));
  }

  /**
   * Generate unique short code for event
   */
  private async generateShortCode(): Promise<string> {
    const tenantDb = getTenantDb(this.tenantId);

    // Generate random 6-character code
    let code = '';
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      code = crypto.randomBytes(3).toString('base64')
        .replace(/[^a-zA-Z0-9]/g, '')
        .substring(0, 6)
        .toLowerCase();

      const existing = await tenantDb.findOne(events, { shortCode: code });
      isUnique = !existing;
      attempts++;
    }

    if (!isUnique) {
      throw new Error('Failed to generate unique short code');
    }

    return code;
  }

  /**
   * Update event status
   */
  async updateStatus(eventId: string, status: 'draft' | 'active' | 'ended'): Promise<boolean> {
    const tenantDb = getTenantDb(this.tenantId);

    const existing = await this.getById(eventId);
    if (!existing) {
      return false;
    }

    await tenantDb.update(events, { status }, { id: eventId });
    return true;
  }
}
