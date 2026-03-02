# Momen Architecture - Visual Overview

## Component Interaction Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER INTERFACE                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Login   │  │ Organizer│  │  Event   │  │ Gallery  │  │  Admin   │   │
│  │   Page   │  │ Dashboard│  │  Page    │  │  Page    │  │ Dashboard│   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│       │              │              │              │              │         │
└───────┼──────────────┼──────────────┼──────────────┼──────────────┼─────────┘
        │              │              │              │              │
        ▼              ▼              ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MIDDLEWARE LAYER                                    │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────┐    │
│  │  Auth Middleware │  │  Tenant Context  │  │  Rate Limiting       │    │
│  │  • JWT Verify    │  │  • Isolation     │  │  • Redis-backed      │    │
│  │  • Session Check │  │  • Header Inject │  │  • Per-endpoint     │    │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────────┘    │
└───────────┼────────────────────┼──────────────────────┼─────────────────────┘
            │                    │                      │
            ▼                    ▼                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         API LAYER (Controllers)                             │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐          │
│  │ Auth API   │  │ Event API  │  │ Photo API  │  │ Admin API  │          │
│  │            │  │            │  │            │  │            │          │
│  │ • Login     │  │ • CRUD     │  │ • Upload   │  │ • Users     │          │
│  │ • Register  │  │ • List     │  │ • Approve  │  │ • Tenants   │          │
│  │ • Logout    │  │ • Stats    │  │ • Delete   │  │ • Settings  │          │
│  └──────┬─────┘  └──────┬─────┘  └──────┬─────┘  └──────┬─────┘          │
└─────────┼─────────────────┼─────────────────┼─────────────────┼───────────┘
          │                 │                 │                 │
          ▼                 ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER (Business Logic)                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐           │
│  │  Event Service  │  │  Photo Service  │  │  Upload Service │           │
│  │                 │  │                 │  │                 │           │
│  │ • Create/Update │  │ • Upload/Process│  │ • Presign URLs  │           │
│  │ • Query with    │  │ • Moderate      │  │ • Queue Jobs    │           │
│  │   Photo Counts  │  │ • Reactions     │  │ • Status Poll   │           │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘           │
│           │                    │                    │                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐           │
│  │Attendance Svc   │  │ Lucky Draw Svc  │  │  User Service   │           │
│  │                 │  │                 │  │                 │           │
│  │ • Check-in       │  │ • Config        │  │ • Profile       │           │
│  │ • QR Generate    │  │ • Draw Exec     │  │ • Settings      │           │
│  │ • Export         │  │ • Winners       │  │ • Usage Stats   │           │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘           │
└─────────┬─────────────────────┬─────────────────────┬─────────────────────────┘
          │                     │                     │
          ▼                     ▼                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       DATA ACCESS LAYER                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         Cache (Redis)                                │   │
│  │  • Session Storage   • Query Results   • Rate Limiting   • Pub/Sub│   │
│  └───────────────────────────────┬─────────────────────────────────────┘   │
│                                   │                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    Tenant Database (PostgreSQL)                     │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐     │   │
│  │  │ Tenants │ │  Users  │ │ Events  │ │ Photos  │ │ Others  │     │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘     │   │
│  │                                                                   │   │
│  │  • Row-Level Security (RLS)                                      │   │
│  │  • Tenant Isolation per Request                                  │   │
│  │  • Connection Pooling                                            │   │
│  └───────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Real-Time Data Flow

```
┌─────────────┐                    ┌─────────────┐
│   User A    │                    │   User B    │
│  (Browser)  │                    │  (Browser)  │
└──────┬──────┘                    └──────┬──────┘
       │                                  │
       │ 1. Upload Photo                   │
       ▼                                  │
┌────────────────────────────────────┐    │
│          API Route                  │    │
│  • Validate & Save to DB            │    │
│  • Return uploadId                 │    │
└──────┬─────────────────────────────┘    │
       │                                  │
       │ 2. Queue Processing              │
       ▼                                  │
┌────────────────────────────────────┐    │
│    Image Queue (BullMQ)            │    │
│  • Process thumbnails              │    │
│  • Upload to R2                    │    │
│  • Update DB status                │    │
└──────┬─────────────────────────────┘    │
       │                                  │
       │ 3. Publish Event                 │
       ▼                                  │
┌────────────────────────────────────┐    │
│     Redis Pub/Sub                   │    │
│  channel: event:{eventId}           │    │
└──────┬─────────────────────────────┘    │
       │                                  │
       │ 4. Broadcast                     │
       ├──────────────────────────────────┤
       │                                  │
       ▼                                  ▼
┌─────────────────────────────────────────────────┐
│         Supabase Realtime Channel               │
│  • Delivers to all subscribers                  │
│  • Includes new photo data                       │
└───────────────────┬─────────────────────────────┘
                    │
                    │ 5. Real-time Update
                    ▼
           ┌─────────────────┐
           │   User B View   │
           │  Gallery Live   │
           └─────────────────┘
```

## Authentication Flow

```
┌──────────┐
│   User   │
└────┬─────┘
     │
     │ 1. Submit Login (email + password)
     ▼
┌────────────────────────────────────┐
│         API: /api/auth/login       │
│  • Validate input (Zod)           │
│  • Rate limit check (Redis)       │
└────┬───────────────────────────────┘
     │
     │ 2. Verify Credentials
     ▼
┌────────────────────────────────────┐
│      Service: AuthService          │
│  • Find user by email             │
│  • Compare password (bcrypt)       │
│  • Check tenant status            │
└────┬───────────────────────────────┘
     │
     │ 3. Create Session
     ▼
┌────────────────────────────────────┐
│          Redis Storage             │
│  • Generate session ID            │
│  • Store session data              │
│  • Set TTL (7 days)                │
└────┬───────────────────────────────┘
     │
     │ 4. Set Cookie + Return User Data
     ▼
┌────────────────────────────────────┐
│           Response                 │
│  • Set-Cookie: session_id          │
│  • Return user object              │
└────┬───────────────────────────────┘
     │
     │ 5. Store JWT in Memory
     ▼
┌────────────────────────────────────┐
│         Client Storage             │
│  • JWT token for API calls         │
│  • User profile in state           │
└────────────────────────────────────┘
```

## Multi-Tenant Data Isolation

```
┌─────────────────────────────────────────────────────────────────┐
│                      REQUEST FLOW                               │
│                                                                  │
│  Request: GET /api/events/123                                   │
│  Headers: { x-session-id: "abc123" }                           │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MIDDLEWARE CHAIN                             │
│                                                                  │
│  ┌─────────────────┐    ┌─────────────────┐                    │
│  │  Auth Middleware │ -> │ Tenant Middleware│                   │
│  │                 │    │                 │                    │
│  │ 1. Get session   │    │ 1. Get tenant_id │                    │
│  │    from Redis    │    │    from session   │                   │
│  │                 │    │                 │                    │
│  │ 2. Verify user   │    │ 2. Inject header: │                   │
│  │    exists        │    │    x-tenant-id    │                   │
│  │                 │    │                 │                    │
│  │ 3. Attach user   │    │ 3. Set PG config  │                   │
│  │    to headers    │    │    session var    │                   │
│  └─────────────────┘    └─────────────────┘                    │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                     DATABASE QUERY                               │
│                                                                  │
│  SELECT set_tenant_id('tenant-abc');  -- Set context            │
│                                                                  │
│  SELECT * FROM events WHERE id = '123';                          │
│                                                                  │
│  -- RLS Policy automatically filters:                            │
│  -- SELECT * FROM events                                         │
│  -- WHERE tenant_id = current_tenant_id()  -- Added by RLS      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Error Handling Flow

```
┌─────────────────┐
│   Client Request│
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│   API Route Handler             │
│   withApiErrorHandler(() => {  │
│     // Business logic           │
└────────┬────────────────────────┘
         │
         │ Error Thrown?
         ├── Yes ────────────────┐
         │                       ▼
         │              ┌─────────────────────┐
         │              │  Error Classification│
         │              │                     │
         │              │ • AppError?         │
         │              │   → Use code/status │
         │              │ • ZodError?         │
         │              │   → 400 + details   │
         │              │ • Unknown?          │
         │              │   → 500 + log       │
         │              └─────────┬───────────┘
         │                        │
         │                        ▼
         │              ┌─────────────────────┐
         │              │  Standard Response   │
         │              │                     │
         │              │ {                   │
         │              │   error: {           │
         │              │     code: "X",       │
         │              │     message: "..."   │
         │              │   }                 │
         │              │ }                   │
         │              └─────────┬───────────┘
         │                        │
         └────────────────────────┘
                                  │
                                  ▼
                        ┌─────────────────┐
                        │   Client Receives│
                        │   + Display Toast│
                        └─────────────────┘
```

## Deployment Architecture

```
                                    ┌─────────────────┐
                                    │     Users       │
                                    │  (Browsers)      │
                                    └────────┬─────────┘
                                             │
                                             │ HTTPS
                                             ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           VERCEL EDGE NETWORK                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   US East    │  │   US West    │  │   Europe     │  │   Asia       │   │
│  │              │  │              │  │              │  │              │   │
│  │ • Next.js App │  │ • Next.js App │  │ • Next.js App │  │ • Next.js App │   │
│  │ • Edge Runtime│  │ • Edge Runtime│  │ • Edge Runtime│  │ • Edge Runtime│   │
│  │ • Static Assets│  │ • Static Assets│  │ • Static Assets│  │ • Static Assets│  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │
└─────────┼─────────────────┼─────────────────┼─────────────────┼─────────────┘
          │                 │                 │                 │
          └─────────────────┴─────────────────┴─────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
        ┌───────────────────────┐   ┌───────────────────────┐
        │   Serverless Functions │   │   Cloudflare R2       │
        │   (Node.js Runtime)    │   │   (Image Storage)     │
        │                        │   │                       │
        │ • API Routes           │   │ • Original Photos     │
        │ • Image Processing     │   │ • Thumbnails         │
        │ • Queue Workers        │   │ • Presigned URLs     │
        └───────┬────────────────┘   └───────────────────────┘
                │
                │ PostgreSQL Wire Protocol
                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        NEON POSTGRES CLUSTER                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
        │   Primary     │  │   Replica     │  │   Replica     │  │   Replica     │   │
        │   (Read/Write)│  │   (Read Only) │  │   (Read Only) │  │   (Read Only) │   │
        │              │  │              │  │              │  │              │   │
        └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │
               │ pgbouncer    │ pgbouncer    │ pgbouncer    │ pgbouncer         │
               └──────────────┴──────────────┴──────────────┴──────────────┘   │
                                                                              │
        • Row-Level Security (RLS) per tenant                                 │
        • Connection Pooling (32 connections per instance)                     │
        • Autoscaling (0-10 instances)                                         │
└─────────────────────────────────────────────────────────────────────────────┘
                │
                │ Redis Protocol
                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        UPSTASH REDIS                                        │
│  • Session Storage (TTL: 7 days)                                            │
│  • Query Result Cache (TTL: 5 min)                                          │
│  • Rate Limiting (Sliding window)                                           │
│  • Queue Backend (BullMQ)                                                   │
│  • Pub/Sub for real-time                                                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Performance Optimization Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                        LAYER 1: CLIENT                         │
│  • React Server Components (reduce JS bundle)                  │
│  • Code splitting (route-based)                                │
│  • Image optimization (next/image)                              │
│  • Component memoization                                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        LAYER 2: EDGE (Vercel)                   │
│  • Static file caching (CDN)                                    │
│  • Route caching (ISR)                                          │
│  • Response compression (gzip/brotli)                           │
│  • HTTP/2 + HTTP/3                                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        LAYER 3: APPLICATION                      │
│  • Redis query caching                                           │
│  • Batch database queries                                        │
│  • Connection pooling                                            │
│  • Parallel data fetching                                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        LAYER 4: DATABASE                         │
│  • Proper indexes on foreign keys + filters                     │
│  • Partial indexes for common queries                           │
│  • Connection pooling (pgbouncer)                               │
│  • Read replicas for scaling                                    │
└─────────────────────────────────────────────────────────────────┘
```

---

*Architecture Visuals v1.0 - Part of Momen Design System*
