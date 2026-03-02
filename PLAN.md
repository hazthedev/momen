# Momen - Event Photo Sharing Platform
## A Robust Rewrite of Galería

---

## Executive Summary

**Momen** is a complete rewrite of the Galería event photo sharing platform, designed to address all identified bugs, architectural issues, and security concerns while maintaining the core feature set. The new implementation prioritizes reliability, type safety, and production readiness.

### Why Rewrite?

The Galería codebase analysis revealed:
- **30+ TODO/FIXME comments** indicating incomplete features
- **Inconsistent error handling** across API endpoints
- **Incomplete Redis implementation** for sessions
- **Type safety gaps** and loose typing in critical paths
- **Performance bottlenecks** in database queries and image processing
- **Security vulnerabilities** in rate limiting and validation

---

## Core Features (Inherited from Galería)

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Photo Upload & Gallery | ✅ Keep | P0 | Core feature, needs optimization |
| Event Management | ✅ Keep | P0 | Core feature, needs UX improvements |
| Attendance/Check-in | ✅ Keep | P1 | Solid implementation, minor tweaks |
| Lucky Draw | ✅ Keep | P1 | Good feature, needs UI polish |
| Photo Challenge | ✅ Keep | P2 | Complete but complex, simplify if needed |
| Multi-tenancy | ✅ Keep | P0 | Excellent architecture, preserve |
| Real-time Updates | ✅ Keep | P1 | Good foundation, needs stability |
| Admin Dashboard | ✅ Keep | P1 | Solid, needs monitoring |

---

## Architecture Improvements

### 1. Tech Stack Updates

| Component | Galería | Momen | Rationale |
|-----------|---------|-------|-----------|
| Next.js | 16.1.6 | 15.x (stable) | Avoid bleeding edge issues |
| React | 19.2.3 | 18.x (stable) | Proven stability |
| Database | PostgreSQL + Drizzle | PostgreSQL + Drizzle | Keep, fix schema issues |
| Auth | Custom JWT + Sessions | Custom + improvements | Fix Redis TODOs |
| Storage | R2/S3 | R2/S3 | Keep, improve validation |
| Validation | Mixed | Zod everywhere | Standardize |

### 2. Project Structure

```
momen/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Auth route group
│   ├── (dashboard)/         # Protected route group
│   ├── (public)/            # Public pages
│   ├── api/                 # API routes
│   └── layout.tsx
├── components/              # UI components
│   ├── ui/                  # Base components (shadcn/ui)
│   ├── features/            # Feature-specific components
│   └── providers/           # Context providers
├── lib/                     # Core logic
│   ├── db/                  # Database layer
│   ├── auth/                # Authentication
│   ├── storage/             # File storage
│   ├── validation/          # Zod schemas
│   └── utils/               # Utilities
├── config/                  # Configuration
├── types/                   # TypeScript types
└── tests/                   # Tests (new!)
```

### 3. Database Schema Fixes

**Critical Fixes from Galería:**

1. **Fix inconsistent column types**
   - `photo_challenge.event_id`: TEXT → UUID
   - All `event_id` references consistent

2. **Add missing triggers**
   - All `updated_at` columns have auto-update triggers

3. **Fix RLS policies**
   - Standardize on `current_tenant_id()` helper
   - Remove `current_setting()` inconsistencies

4. **Add missing foreign keys**
   - `prize_claims.challenge_id` proper constraint

---

## Security Hardening

### Issues Found in Galería → Momen Solutions

| Issue | Severity | Momen Solution |
|-------|----------|----------------|
| Incomplete Redis session storage | 🔴 Critical | Complete implementation |
| Inconsistent rate limiting | 🟠 High | Unified rate limiter middleware |
| Fail-open on Redis down | 🟠 High | Fail-closed for critical endpoints |
| Weak password defaults | 🟡 Medium | Enforce strong policies |
| Missing input sanitization | 🟡 Medium | Zod validation everywhere |
| Generic error messages | 🟢 Low | Specific error codes |

### New Security Features

```typescript
// Unified security middleware
- Rate limiting by user tier
- Request fingerprinting
- CSRF protection
- XSS prevention
- SQL injection protection (parameterized queries)
- File upload validation (magic bytes, size, type)
```

---

## Performance Optimizations

### Database Layer

**Galería Issues:**
- Sequential photo count queries
- No query result limits on large datasets
- Missing pagination on some endpoints

**Momen Solutions:**
```typescript
// Batch queries with single roundtrip
async function getEventWithPhotoCounts(eventIds: string[]) {
  return db.query(`
    SELECT e.*, COUNT(p.id) as photo_count
    FROM events e
    LEFT JOIN photos p ON p.event_id = e.id
    WHERE e.id = ANY($1)
    GROUP BY e.id
  `, [eventIds]);
}

// Enforce pagination limits
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;
```

### Image Processing

**Galería Issues:**
- Synchronous processing blocks requests
- No processing timeouts
- Memory leaks with large files

**Momen Solutions:**
```typescript
// Queue-based processing
import { Queue } from 'bullmq';

const imageQueue = new Queue('image-processing', { connection: redis });

// Async processing with timeout
async function processImage(buffer: Buffer, timeout = 30000) {
  return Promise.race([
    sharp(buffer).resize(...).toBuffer(),
    timeoutAfter(timeout),
  ]);
}
```

### Frontend Performance

**Galería Issues:**
- All client components (poor SEO)
- No server-side data preloading
- Memory leaks from object URLs

**Momen Solutions:**
```typescript
// Hybrid RSC + Client Components
export default async function EventPage({ params }) {
  // Server component for data fetching
  const event = await fetchEvent(params.eventId);
  const photos = await fetchPhotos(params.eventId, { limit: 20 });

  return <EventGallery event={event} initialPhotos={photos} />;
}

'use client'; // Only for interactive parts
function EventGallery({ event, initialPhotos }) {
  // Interactive component
}
```

---

## Error Handling Strategy

### Standardized Error Response

```typescript
// lib/errors.ts
export class AppError extends Error {
  constructor(
    public code: string,
    public statusCode: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
  }
}

// Standard error response format
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
    requestId: string;
  };
}

// Error codes
export const ErrorCodes = {
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  FEATURE_DISABLED: 'FEATURE_DISABLED',
  RATE_LIMITED: 'RATE_LIMITED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  FORBIDDEN: 'FORBIDDEN',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;
```

### Error Boundary Implementation

```typescript
// components/ErrorBoundary.tsx
'use client';

export function ErrorBoundary({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback: (error: Error) => React.ReactNode;
}) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ErrorBoundaryInner fallback={fallback}>
        {children}
      </ErrorBoundaryInner>
    </Suspense>
  );
}
```

---

## Testing Strategy

### Test Coverage Goals

| Layer | Tool | Coverage Goal |
|-------|------|---------------|
| Unit Tests | Vitest | 80%+ |
| Integration Tests | Vitest + MSW | 70%+ |
| E2E Tests | Playwright | Critical paths |
| API Tests | Vitest + Supertest | All endpoints |

### Test Structure

```
tests/
├── unit/
│   ├── lib/
│   │   ├── auth.test.ts
│   │   ├── db.test.ts
│   │   └── validation.test.ts
│   └── components/
│       └── Button.test.tsx
├── integration/
│   ├── api/
│   │   ├── auth.test.ts
│   │   └── photos.test.ts
│   └── db/
│       └── migrations.test.ts
└── e2e/
    ├── auth.spec.ts
    ├── upload.spec.ts
    └── admin.spec.ts
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Project setup with Next.js 15
- [ ] Database schema with fixes applied
- [ ] Authentication system (complete Redis implementation)
- [ ] Base UI components (shadcn/ui)
- [ ] Error handling infrastructure
- [ ] Testing setup

### Phase 2: Core Features (Week 3-4)
- [ ] Event management (CRUD)
- [ ] Photo upload (presigned URLs)
- [ ] Photo gallery with pagination
- [ ] Multi-tenant isolation verification
- [ ] Rate limiting middleware

### Phase 3: Engagement Features (Week 5-6)
- [ ] Attendance system
- [ ] Photo reactions
- [ ] Lucky draw
- [ ] Real-time updates (Supabase)
- [ ] QR code generation

### Phase 4: Polish & Launch (Week 7-8)
- [ ] Admin dashboard
- [ ] Analytics and monitoring
- [ ] Performance optimization
- [ ] Security audit
- [ ] Documentation
- [ ] Deployment

---

## Configuration Checklist

### Environment Variables

```bash
# Database
DATABASE_URL=
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=20

# Authentication
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
SESSION_SECRET=

# Redis
REDIS_URL=

# Storage
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=

# App
APP_URL=
NODE_ENV=

# Monitoring
SENTRY_DSN=
VERCEL_ANALYTICS_ID=
```

---

## Success Metrics

| Metric | Galería Baseline | Momen Target |
|--------|------------------|--------------|
| Build Time | ~30s | <20s |
| API Response Time (p95) | ~500ms | <200ms |
| Image Processing Time | ~2s | <1s (queued) |
| Error Rate | ~5% | <1% |
| Test Coverage | 0% | >70% |
| TypeScript Errors | ~10 | 0 |

---

## Lessons from Galería

### What Works (Keep)
- Multi-tenant RLS architecture
- Photo upload presigned URL pattern
- Feature flagging system
- Attendance QR check-in flow
- Lucky draw prize tier system

### What Needs Fixing (Change)
- Incomplete Redis implementation → Complete it
- Inconsistent error handling → Standardize
- Client-only rendering → Hybrid RSC
- Sequential DB queries → Batch queries
- Sync image processing → Queue-based
- Mixed validation → Zod everywhere

### What to Remove (Simplify)
- Unused moderation system remnants
- Complex feature toggles (simplify)
- Legacy TODO comments (implement or remove)
- Over-engineered type definitions

---

## Open Questions

1. **Queue System**: Use BullMQ or switch to serverless queues?
2. **Image CDN**: Keep existing setup or add CDN layer?
3. **Database**: Stay with PostgreSQL or consider Turso (SQLite)?
4. **Authentication**: Keep custom or integrate Clerk/Auth0?
5. **Real-time**: Continue Supabase or switch to Pusher?

---

## Next Steps

1. ✅ Initialize repository
2. ⏳ Create detailed task list (TaskCreate)
3. ⏳ Set up development environment
4. ⏳ Begin Phase 1 implementation

---

*Document Version: 1.0*
*Last Updated: 2025-03-02*
*Status: Planning Phase*
