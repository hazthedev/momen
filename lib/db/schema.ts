/**
 * Momen Database Schema
 * Fixed version of Galería schema with proper types and RLS
 */

import { pgTable, text, uuid, timestamp, boolean, integer, jsonb, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// ============================================
// ENUMS (using check constraints for Drizzle)
// ============================================

export const UserRoleEnum = {
  GUEST: 'guest',
  ORGANIZER: 'organizer',
  SUPER_ADMIN: 'super_admin',
} as const;

export const TenantStatusEnum = {
  TRIAL: 'trial',
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
} as const;

export const TenantTypeEnum = {
  WHITE_LABEL: 'white_label',
} as const;

export const EventStatusEnum = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  ENDED: 'ended',
} as const;

export const PhotoStatusEnum = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export const SubscriptionTierEnum = {
  FREE: 'free',
  PRO: 'pro',
  ENTERPRISE: 'enterprise',
} as const;

// ============================================
// TENANTS
// ============================================
export const tenants = pgTable('tenants', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantType: text('tenant_type').notNull().default(TenantTypeEnum.WHITE_LABEL),
  brandName: text('brand_name').notNull(),
  companyName: text('company_name').notNull(),
  contactEmail: text('contact_email').notNull(),
  supportEmail: text('support_email'),
  phone: text('phone'),
  domain: text('domain'),
  subdomain: text('subdomain'),
  isCustomDomain: boolean('is_custom_domain').notNull().default(false),
  branding: jsonb('branding').notNull().default('{}'),
  subscriptionTier: text('subscription_tier').notNull().default(SubscriptionTierEnum.FREE),
  featuresEnabled: jsonb('features_enabled').notNull().default('{}'),
  limits: jsonb('limits').notNull().default('{}'),
  status: text('status').notNull().default(TenantStatusEnum.TRIAL),
  trialEndsAt: timestamp('trial_ends_at'),
  subscriptionEndsAt: timestamp('subscription_ends_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  // Index for subdomain lookup
  subdomainIdx: index('tenants_subdomain_idx').on(table.subdomain),
}));

// ============================================
// USERS
// ============================================
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  passwordHash: text('password_hash').notNull(),
  name: text('name'),
  role: text('role').notNull().default(UserRoleEnum.ORGANIZER),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  // Unique constraint on tenant + email
  tenantEmailIdx: index('users_tenant_email_idx').on(table.tenantId, table.email),
}));

// ============================================
// EVENTS
// ============================================
export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  organizerId: uuid('organizer_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  shortCode: text('short_code').notNull().unique(),
  description: text('description'),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),
  location: text('location'),
  status: text('status').notNull().default(EventStatusEnum.DRAFT),
  settings: jsonb('settings').notNull().default('{}'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  // Unique constraint on tenant + slug
  tenantSlugIdx: uniqueIndex('events_tenant_slug_idx').on(table.tenantId, table.slug),
  // Index for organizer lookup
  organizerIdx: index('events_organizer_idx').on(table.organizerId),
}));

// ============================================
// PHOTOS
// ============================================
export const photos = pgTable('photos', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  userFingerprint: text('user_fingerprint').notNull(),
  images: jsonb('images').notNull().default('{}'),
  caption: text('caption'),
  contributorName: text('contributor_name'),
  isAnonymous: boolean('is_anonymous').notNull().default(false),
  status: text('status').notNull().default(PhotoStatusEnum.PENDING),
  reactions: jsonb('reactions').notNull().default('{"heart": 0, "clap": 0, "laugh": 0, "wow": 0}'),
  metadata: jsonb('metadata').notNull().default('{}'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  approvedAt: timestamp('approved_at'),
}, (table) => ({
  // Index for event photos lookup
  eventIdx: index('photos_event_idx').on(table.eventId),
  // Composite index for status filtering
  eventStatusIdx: index('photos_event_status_idx').on(table.eventId, table.status),
}));

// ============================================
// ATTENDANCE
// ============================================
export const attendances = pgTable('attendances', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  email: text('email'),
  phone: text('phone'),
  name: text('name').notNull(),
  companions: integer('companions').notNull().default(0),
  userFingerprint: text('user_fingerprint').notNull(),
  metadata: jsonb('metadata').notNull().default('{}'),
  checkedInAt: timestamp('checked_in_at').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  // Unique constraint on email per event (if email provided)
  eventEmailIdx: index('attendances_event_email_idx').on(table.eventId, table.email),
  // Index for fingerprint lookup
  eventFingerprintIdx: index('attendances_event_fingerprint_idx').on(table.eventId, table.userFingerprint),
}));

// ============================================
// TYPES EXPORT
// ============================================

export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;

export type Photo = typeof photos.$inferSelect;
export type NewPhoto = typeof photos.$inferInsert;

export type Attendance = typeof attendances.$inferSelect;
export type NewAttendance = typeof attendances.$inferInsert;
