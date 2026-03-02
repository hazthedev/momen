/**
 * Momen Logout API
 * Invalidate session and clear cookies
 */

import { NextRequest, NextResponse } from 'next/server';
import { deleteSession } from '@/lib/auth/session';
import { clearAuthCookies } from '@/lib/auth/jwt';

// ============================================
// POST /api/auth/logout
// ============================================
export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('session_id')?.value;

    if (sessionId) {
      // Delete session from Redis
      await deleteSession(sessionId);
    }

    // Clear auth cookies
    await clearAuthCookies();

    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });

    // Clear session cookie
    response.cookies.delete('session_id');

    return response;
  } catch (error) {
    console.error('[AUTH] Logout error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Logout failed' } },
      { status: 500 }
    );
  }
}
