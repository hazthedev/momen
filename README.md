# Momen

> A robust, production-ready event photo sharing platform

## Overview

Momen is a complete rewrite of the Galería platform, designed from the ground up to address architectural issues, security concerns, and performance bottlenecks. It enables event organizers to create photo galleries where guests can upload, view, and interact with photos in real-time.

## Why Momen?

After analyzing the Galería codebase with multiple AI agents, we identified critical issues that warranted a complete rewrite:

- **30+ incomplete features** (TODOs, FIXMEs)
- **Incomplete Redis implementation** for sessions
- **Inconsistent error handling** across 50+ API endpoints
- **Type safety gaps** in critical paths
- **Performance issues** in database and image processing
- **Security vulnerabilities** in rate limiting

## Features

- **Multi-tenant SaaS** with database-level isolation (RLS)
- **Photo Upload & Gallery** with optimized processing
- **Event Management** with QR code generation
- **Attendance System** with check-in tracking
- **Lucky Draw** with configurable prize tiers
- **Photo Challenge** with goal-based incentives
- **Real-time Updates** for live events
- **Admin Dashboard** with analytics

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: Custom JWT + Session (Redis)
- **Storage**: Cloudflare R2 / AWS S3
- **Validation**: Zod
- **Styling**: Tailwind CSS + shadcn/ui

## Project Status

**Phase**: MVP Complete ✅

Core features implemented:
- ✅ Authentication (login/register)
- ✅ Event Management (CRUD)
- ✅ Photo Upload & Gallery
- ✅ Organizer Dashboard
- ✅ Public Gallery (guest upload)
- ✅ Multi-tenant with RLS

**Coming Soon** (Phase 2):
- Photo Likes & Reactions
- Attendance System
- Lucky Draw
- Photo Challenge

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- Cloudflare R2 account (or S3-compatible storage)

### Installation

```bash
# Clone repository
git clone https://github.com/hazthedev/momen.git
cd momen

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your values:
# - DATABASE_URL (PostgreSQL connection)
# - REDIS_URL (Redis connection)
# - JWT_SECRET (generate with: openssl rand -base64 32)
# - R2_* (Cloudflare R2 credentials)

# Generate database client
npm run db:generate

# Run migrations
npm run db:migrate

# Start development server
npm run dev
```

Visit http://localhost:3000 to see the app.

## Documentation

- [PLAN.md](./PLAN.md) - Complete implementation plan
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture decisions (TBD)
- [API.md](./API.md) - API documentation (TBD)
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide (TBD)

## License

MIT

---

**Built with ❤️ by the Momen team**
