/**
 * Momen Authentication Middleware
 * Validates sessions and injects user context
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '../auth/session';

// ============================================
// PUBLIC PATHS (no auth required)
// ============================================
const PUBLIC_PATHS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/health',
  '/api/auth/health',
  '/_next',
  '/static',
];

// ============================================
// PROTECTED PREFIXES
// ============================================
const PROTECTED_PREFIXES = [
  '/api',
  '/organizer',
  '/admin',
];

// ============================================
// MIDDLEWARE
// ============================================
export async function authMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if path is public
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check if path requires authentication
  const isProtected = PROTECTED_PREFIXES.some(prefix =>
    pathname.startsWith(prefix)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  // Get session ID from cookie
  const sessionId = request.cookies.get('session_id')?.value;

  if (!sessionId) {
    // No session cookie found
    return unauthorized(request);
  }

  // Validate session
  const session = await validateSession(sessionId);

  if (!session) {
    // Invalid or expired session
    return unauthorized(request);
  }

  // Inject user context into headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', session.userId);
  requestHeaders.set('x-tenant-id', session.tenantId);
  requestHeaders.set('x-user-email', session.email);
  requestHeaders.set('x-user-role', session.role);
  requestHeaders.set('x-session-id', sessionId);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// ============================================
// UNAUTHORIZED RESPONSE
// ============================================
function unauthorized(request: NextRequest): NextResponse {
  const url = request.nextUrl;

  // API requests get 401 JSON response
  if (url.pathname.startsWith('/api/')) {
    return NextResponse.json(
      { error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } },
      { status: 401 }
    );
  }

  // Page requests redirect to login
  const loginUrl = new URL('/login', url);
  loginUrl.searchParams.set('redirect', url.pathname);
  return NextResponse.redirect(loginUrl);
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Extract user context from request headers
 */
export function getUserFromHeaders(headers: Headers): {
  userId: string;
  tenantId: string;
  email: string;
  role: string;
  sessionId: string;
} | null {
  const userId = headers.get('x-user-id');
  const tenantId = headers.get('x-tenant-id');
  const email = headers.get('x-user-email');
  const role = headers.get('x-user-role');
  const sessionId = headers.get('x-session-id');

  if (!userId || !tenantId || !email || !role || !sessionId) {
    return null;
  }

  return { userId, tenantId, email, role, sessionId };
}

/**
 * Get current user from request
 */
export function getCurrentUser(request: NextRequest) {
  return getUserFromHeaders(request.headers);
}

/**
 * Check if user has required role
 */
export function hasRole(
  request: NextRequest,
  allowedRoles: string[]
): boolean {
  const user = getCurrentUser(request);

  if (!user) {
    return false;
  }

  return allowedRoles.includes(user.role);
}

/**
 * Require specific role (throws if not authorized)
 */
export function requireRole(
  request: NextRequest,
  role: string | string[]
): boolean {
  const roles = Array.isArray(role) ? role : [role];
  const hasAccess = hasRole(request, roles);

  if (!hasAccess) {
    throw new Error(`Forbidden: Requires ${roles.join(' or ')} role`);
  }

  return true;
}
