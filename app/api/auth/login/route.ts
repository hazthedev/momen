/**
 * Momen Login API
 * Authenticate user and create session
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { comparePassword } from '@/lib/auth/password';
import { createSession } from '@/lib/auth/session';
import { generateAccessToken, generateRefreshToken, setAuthCookies } from '@/lib/auth/jwt';

// ============================================
// VALIDATION SCHEMA
// ============================================
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
});

// ============================================
// REGISTER SCHEMA
// ============================================
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

// ============================================
// POST /api/auth/login
// ============================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const { email, password, rememberMe } = loginSchema.parse(body);

    // Find user by email (search all tenants)
    const user = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    });

    if (!user) {
      return NextResponse.json(
        { error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.passwordHash);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } },
        { status: 401 }
      );
    }

    // Check if user's tenant is active
    // (This would require querying the tenants table - simplified for MVP)

    // Create session
    const sessionId = await createSession({
      userId: user.id,
      tenantId: user.tenantId,
      email: user.email,
      name: user.name,
      role: user.role,
      rememberMe,
    });

    // Generate tokens
    const accessToken = await generateAccessToken({
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const { token: refreshToken } = await generateRefreshToken(user.id);

    // Set cookies
    await setAuthCookies({
      accessToken,
      refreshToken,
    });

    // Set session cookie
    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          tenantId: user.tenantId,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        sessionId,
      },
    });

    response.cookies.set('session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7, // 30 days or 7 days
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } },
        { status: 400 }
      );
    }

    console.error('[AUTH] Login error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Login failed' } },
      { status: 500 }
    );
  }
}
