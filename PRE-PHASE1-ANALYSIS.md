# Momen - Pre-Phase 1 Analysis & Planning

## Critical Questions to Answer Before Starting

---

## 1. Database Schema Fixes

### Issues Identified from Galería

| Issue | Table | Problem | Fix Needed |
|-------|-------|---------|------------|
| Type mismatch | `photo_challenges` | `event_id` is TEXT, should be UUID | Alter column type |
| Missing trigger | All tables | `updated_at` not auto-updating | Add triggers |
| RLS inconsistency | Multiple tables | Using `current_setting()` instead of helper | Standardize |
| Missing foreign key | `prize_claims` | References non-existent column | Add constraint |

### Action Items

- [ ] Create fixed Drizzle schema file
- [ ] Write migration script for fixes
- [ ] Verify RLS policies work correctly
- [ ] Test multi-tenant isolation
- [ ] Create seed data for development

---

## 2. Environment Variables Complete List

### Required vs Optional

```bash
# ============================================
# CRITICAL - App won't start without these
# ============================================
DATABASE_URL=              # PostgreSQL connection string
SESSION_SECRET=            # Cookie encryption secret
JWT_ACCESS_SECRET=         # JWT access token secret
JWT_REFRESH_SECRET=        # JWT refresh token secret
APP_URL=                   # Base URL (https://momen.app)
NODE_ENV=                  # development | production

# ============================================
# REQUIRED - Core features won't work
# ============================================
REDIS_URL=                 # Redis connection (Upstash)
R2_ACCOUNT_ID=             # Cloudflare R2
R2_ACCESS_KEY_ID=          # Cloudflare R2
R2_SECRET_ACCESS_KEY=      # Cloudflare R2
R2_BUCKET_NAME=            # Bucket name
R2_PUBLIC_URL=             # Public URL (e.g., https://pub-xxx.r2.dev)

# ============================================
# OPTIONAL - Features will degrade gracefully
# ============================================
SENTRY_DSN=                # Error tracking (optional)
SENTRY_ENVIRONMENT=        # Sentry environment
VERCEL_ANALYTICS_ID=       # Vercel Analytics (auto-set)

# ============================================
# FEATURE FLAGS
# ============================================
FEATURE_PHOTO_UPLOAD=true
FEATURE_ATTENDANCE=true
FEATURE_LUCKY_DRAW=true
FEATURE_PHOTO_CHALLENGE=true

# ============================================
# DEVELOPMENT ONLY
# ============================================
DATABASE_POOL_MIN=0
DATABASE_POOL_MAX=2
```

### Action Items

- [ ] Create `.env.example` file
- [ ] Document each environment variable
- [ ] Create validation script for required vars
- [ ] Set up local development environment

---

## 3. Testing Strategy

### Test Coverage Targets

| Layer | Tool | Target | Priority |
|-------|------|--------|----------|
| Unit Tests | Vitest | 80% | P1 |
| Integration Tests | Vitest + MSW | 70% | P1 |
| E2E Tests | Playwright | Critical paths only | P2 |
| API Tests | Vitest | 100% of endpoints | P1 |

### What to Test

#### Critical Paths (Must Have)
1. **Authentication Flow**
   - Login with valid credentials
   - Login with invalid credentials
   - Session expiration
   - Logout
   - Token refresh

2. **Event CRUD**
   - Create event
   - Update event
   - Delete event
   - List events (pagination)
   - Tenant isolation

3. **Photo Upload**
   - Presigned URL generation
   - File upload to R2
   - Processing queue
   - Thumbnail generation
   - Error handling

4. **Multi-Tenancy**
   - Data isolation between tenants
   - Cross-tenant access prevention
   - Tenant context propagation

#### Important Paths (Should Have)
5. **Attendance System**
6. **Photo Gallery**
7. **Real-time Updates**
8. **Rate Limiting**

### Action Items

- [ ] Set up Vitest configuration
- [ ] Create test utilities (factories, mocks)
- [ ] Set up MSW for API mocking
- [ ] Create E2E test structure
- [ ] Define test data factory

---

## 4. API Design Contract

### Standard Response Format

```typescript
// Success Response
{
  success: true,
  data: { ... },
  meta?: {
    pagination?: { ... },
    timestamp: string
  }
}

// Error Response
{
  success: false,
  error: {
    code: ErrorCode,
    message: string,
    details?: unknown,
    requestId: string
  }
}
```

### API Endpoints Inventory

| Module | Endpoints | Auth Required | Priority |
|--------|-----------|---------------|----------|
| Auth | 7 | No | P0 |
| Events | 8 | Yes | P0 |
| Photos | 6 | Yes | P0 |
| Attendance | 5 | Mixed | P1 |
| Lucky Draw | 6 | Yes | P2 |
| Photo Challenge | 5 | Yes | P2 |
| Admin | 8 | Admin | P1 |

### Action Items

- [ ] Document all API endpoints with OpenAPI/Swagger
- [ ] Create TypeScript types for all requests/responses
- [ ] Define error codes for all scenarios
- [ ] Set up API versioning strategy

---

## 5. Feature Scope Definition

### MVP vs Full Feature Set

| Feature | MVP | Full | Notes |
|---------|-----|------|-------|
| **Auth** | ✅ | ✅ | Complete in MVP |
| **Events (CRUD)** | ✅ | ✅ | Complete in MVP |
| **Photo Upload** | ✅ | ✅ | Complete in MVP |
| **Photo Gallery** | ✅ | ✅ | Complete in MVP |
| **Real-time** | ❌ | ✅ | Phase 2 |
| **Attendance** | ❌ | ✅ | Phase 2 |
| **Lucky Draw** | ❌ | ✅ | Phase 3 |
| **Photo Challenge** | ❌ | ✅ | Phase 3 |
| **Admin Dashboard** | ❌ | ✅ | Phase 2 |

### Question: What's the MVP Scope?

**Recommendation:** Start with Core Photo Event Platform (MVP)
- ✅ Auth (login/register)
- ✅ Event management (create, edit, delete)
- ✅ Photo upload (with processing)
- ✅ Photo gallery (public view)
- ❌ Attendance (Phase 2)
- ❌ Lucky Draw (Phase 3)
- ❌ Photo Challenge (Phase 3)

### Action Items

- [ ] Confirm MVP feature scope with stakeholders
- [ ] Define Phase 2/3 features
- [ ] Create feature roadmap document
- [ ] Set up feature flag system

---

## 6. Infrastructure Setup

### Required Services

| Service | Provider | Cost (Est.) | Setup Time |
|---------|----------|-------------|------------|
| **Hosting** | Vercel | Free - $20/mo | 5 min |
| **Database** | Neon | Free - $29/mo | 5 min |
| **Redis** | Upstash | Free - $10/mo | 5 min |
| **Storage** | Cloudflare R2 | Free ($5/mo) | 10 min |
| **Error Tracking** | Sentry | Free - $26/mo | 10 min |
| **CI/CD** | Vercel (built-in) | Free | 0 min |
| **Domain** | Custom | $10-15/yr | 5 min |

### Estimated Monthly Cost (Production)

```
Vercel Pro:        $20
Neon Pro:          $29
Upstash Redis:      $10
Cloudflare R2:      $5
Sentry:            $0 (free tier)
────────────────────────────
Total:            ~$64/month
```

### Action Items

- [ ] Create Vercel account
- [ ] Create Neon database
- [ ] Create Upstash Redis
- [ ] Create Cloudflare R2 bucket
- [ ] (Optional) Set up Sentry
- [ ] (Optional) Purchase domain

---

## 7. Development Workflow

### Git Workflow

```
main (production)
  ↓
develop (staging)
  ↓
feature/* (branches)
```

### Commit Convention

```bash
feat: add event creation form
fix: resolve race condition in photo upload
docs: update API documentation
refactor: simplify service layer
test: add authentication tests
chore: update dependencies
```

### Branch Protection

- [ ] Require PR for `main` and `develop`
- [ ] Require 1 approval for `main`
- [ ] Require status checks to pass
- [ ] Block force pushes

### Action Items

- [ ] Set up GitHub repository
- [ ] Configure branch protection rules
- [ ] Set up GitHub Actions for CI
- [ ] Create PR template

---

## 8. Security Checklist

### Before Production Launch

| Item | Status | Notes |
|------|--------|-------|
| Environment variables secured | ⏳ | No secrets in code |
| CORS configured | ⏳ | Limit to app domain |
| Rate limiting enabled | ⏳ | All endpoints |
| SQL injection protection | ⏳ | Parameterized queries |
| XSS protection | ⏳ | Input sanitization |
| CSRF protection | ⏳ | Token validation |
| File upload validation | ⏳ | Magic bytes, size |
| Session security | ⏳ | HttpOnly, Secure, SameSite |
| Password hashing | ⏳ | bcrypt with salt rounds |
| HTTPS only | ⏳ | Force redirect |

### Action Items

- [ ] Complete security audit checklist
- [ ] Set up automated security scanning
- [ ] Configure security headers
- [ ] Set up WAF rules (Vercel)

---

## 9. Performance Benchmarks

### Target Metrics

| Metric | Galería Baseline | Momen Target | Measurement |
|--------|-----------------|--------------|-------------|
| First Contentful Paint | ~2.5s | <1.5s | Lighthouse |
| Time to Interactive | ~4s | <2s | Lighthouse |
| API Response (p95) | ~500ms | <200ms | Vercel Analytics |
| Image Upload (start) | ~3s | <500ms | Custom timing |
| Database Query | ~200ms | <50ms | Query logging |
| Build Time | ~30s | <20s | Next.js build |

### Action Items

- [ ] Set up performance monitoring
- [ ] Configure Lighthouse CI
- [ ] Set up query performance logging
- [ ] Create performance budget

---

## 10. Dependencies & Third-Party Services

### Critical Dependencies

```json
{
  "dependencies": {
    "next": "^15.1.6",           // Framework
    "react": "^18.3.1",           // UI
    "drizzle-orm": "^0.36.4",     // Database
    "ioredis": "^5.4.1",          // Redis
    "sharp": "^0.33.5",           // Image processing
    "bullmq": "^5.29.2",          // Queue
    "zod": "^3.24.1",             // Validation
    "@aws-sdk/client-s3": "^3.709" // S3/R2
  }
}
```

### Service Availability SLA

| Service | SLA | Backup Plan |
|---------|-----|-------------|
| Vercel | 99.95% | Deploy to alternative |
| Neon | 99.95% | Read replica + standby |
| Upstash | 99.9% | Fallback to in-memory |
| Cloudflare | 99.99% | N/A (storage only) |

### Action Items

- [ ] Document all external dependencies
- [ ] Create fallback strategies
- [ ] Set up health check endpoints
- [ ] Document service restoration procedures

---

## 11. Migration Strategy (from Galería)

### Data Migration Considerations

**Question:** Are we migrating existing Galería data?

**Options:**

1. **Fresh Start** (Recommended for MVP)
   - No data migration
   - Clean slate
   - Faster development

2. **Full Migration**
   - Migrate all tenants, events, photos
   - Requires migration scripts
   - Downtime needed

3. **Parallel Run**
   - Both systems live
   - Gradual migration
   - Most complex

### Action Items

- [ ] Decide on migration strategy
- [ ] If migrating: create migration scripts
- [ ] Plan downtime window
- [ ] Prepare rollback plan

---

## 12. Localization & Internationalization

### Requirements

**Question:** Do we need i18n support from day 1?

**Considerations:**
- Adds complexity to all text strings
- Requires date/time formatting per locale
- Affects URL structure for events

**Recommendation:** Start with English, plan for i18n hooks

### Action Items

- [ ] Define target languages
- [ ] Choose i18n library (next-intl vs react-i18next)
- [ ] Create translation file structure
- [ ] Plan for RTL language support

---

## 13. Accessibility (a11y)

### WCAG 2.1 AA Checklist

- [ ] All images have alt text
- [ ] Color contrast ratio ≥ 4.5:1
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] ARIA labels on interactive elements
- [ ] Forms have proper labels
- [ ] Error messages are accessible
- [ ] Skip navigation for main content

### Action Items

- [ ] Run axe-core on all pages
- [ ] Test with screen reader
- [ ] Test keyboard-only navigation
- [ ] Add accessibility statement

---

## 14. Analytics & Monitoring

### What to Track

**User Analytics:**
- Page views
- Feature usage
- Upload success rate
- Time to first photo
- Return rate

**Performance Monitoring:**
- API response times
- Database query times
- Image processing duration
- Error rates by endpoint

**Business Metrics:**
- Tenant creation
- Event creation
- Photo uploads
- Active users

### Action Items

- [ ] Set up Vercel Analytics
- [ ] Configure custom events
- [ ] Create monitoring dashboard
- [ ] Set up alerting for errors

---

## 15. Documentation Requirements

### Documentation Types

| Type | Audience | Tool |
|------|----------|------|
| API Docs | Developers | OpenAPI/Swagger |
| Component Storybook | Developers/Designers | Storybook |
| User Guide | End users | GitBook/Docusaurus |
| Runbook | DevOps | Markdown |
| Architecture | Developers | Markdown + Diagrams |

### Action Items

- [ ] Set up Storybook for components
- [ ] Create API documentation
- [ ] Write deployment runbook
- [ ] Document common tasks

---

## Pre-Phase 1 Checklist

### Must Complete Before Starting

- [ ] **Environment Setup**
  - [ ] Create all required accounts (Vercel, Neon, Upstash, Cloudflare)
  - [ ] Create `.env.example` with all variables
  - [ ] Set up local development environment

- [ ] **Database**
  - [ ] Create fixed Drizzle schema
  - [ ] Write migration for schema fixes
  - [ ] Create seed data
  - [ ] Test RLS policies

- [ ] **Repository**
  - [ ] Set up GitHub repo
  - [ ] Configure branch protection
  - [ ] Add PR template
  - [ ] Set up GitHub Actions

- [ ] **Testing**
  - [ ] Configure Vitest
  - [ ] Create test utilities
  - [ ] Set up MSW
  - [ ] Define test data factory

- [ ] **Documentation**
  - [ ] API endpoint documentation
  - [ ] Component documentation (Storybook)
  - [ ] Deployment runbook

### Should Complete Before Starting

- [ ] Sentry integration
- [ ] Performance monitoring setup
- [ ] Security audit checklist
- [ ] Accessibility audit plan

---

## Risk Assessment

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Redis outage | High | Low | Fallback to in-memory cache |
| R2 upload failures | High | Low | Retry with exponential backoff |
| DB connection exhaustion | High | Medium | Connection pooling + limits |
| Type errors in production | High | Medium | Strict TypeScript + CI checks |
| Breaking changes in dependencies | Medium | Low | Dependabot + lock file |
| Multi-tenant data leakage | Critical | Low | Comprehensive testing + RLS validation |

---

## Next Steps

Once all critical items are checked off:

1. **Start Phase 1 - Week 1**
   - Project initialization
   - Database setup
   - Base middleware

2. **Start Phase 1 - Week 2**
   - Service layer
   - Authentication
   - Error handling

3. **Phase 1 Exit Criteria**
   - [ ] All tests passing
   - [ ] Can create user via API
   - [ ] Can login and get session
   - [ ] RLS policies verified
   - [ ] CI/CD pipeline working

---

*Pre-Phase 1 Analysis v1.0 - Part of Momen Planning*
