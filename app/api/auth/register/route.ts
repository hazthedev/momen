/**
 * Momen Register API
 * Create new user and tenant
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users, tenants } from '@/lib/db/schema';
import { hashPassword, validatePassword, isCommonPassword, hasWeakPatterns } from '@/lib/auth/password';
import { createSession } from '@/lib/auth/session';
import { generateAccessToken, generateRefreshToken, setAuthCookies } from '@/lib/auth/jwt';

// ============================================
// VALIDATION SCHEMA
// ============================================
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

// ============================================
// POST /api/auth/register
// ============================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const { email, password, name } = registerSchema.parse(body);

    // Validate password strength
    const passwordValidation = validatePassword(password);

    if (!passwordValidation.valid) {
      return NextResponse.json(
        {
          error: {
            code: 'WEAK_PASSWORD',
            message: 'Password does not meet requirements',
            details: passwordValidation.errors,
          },
        },
        { status: 400 }
      );
    }

    // Check for common passwords
    if (isCommonPassword(password)) {
      return NextResponse.json(
        { error: { code: 'COMMON_PASSWORD', message: 'This password is too common' } },
        { status: 400 }
      );
    }

    // Check for weak patterns
    if (hasWeakPatterns(password)) {
      return NextResponse.json(
        { error: { code: 'WEAK_PATTERN', message: 'Password contains predictable patterns' } },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    });

    if (existingUser) {
      return NextResponse.json(
        { error: { code: 'EMAIL_EXISTS', message: 'Email already registered' } },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Generate unique subdomain for tenant
    const subdomain = `${email.split('@')[0]}-${crypto.randomUUID().slice(0, 6)}`;

    // Create tenant
    const [tenant] = await db
      .insert(tenants)
      .values({
        subdomain,
        brandName: `${name}'s Events`,
        companyName: name,
        contactEmail: email,
        subscriptionTier: 'free',
        status: 'trial',
      })
      .returning();

    // Create user
    const [user] = await db
      .insert(users)
      .values({
        tenantId: tenant.id,
        email: email.toLowerCase(),
        passwordHash,
        name,
        role: 'organizer',
      })
      .returning();

    // Create session
    const sessionId = await createSession({
      userId: user.id,
      tenantId: user.tenantId,
      email: user.email,
      name: user.name ?? undefined,
      role: user.role,
    });

    // Generate tokens
    const accessToken = await generateAccessToken({
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      name: user.name ?? undefined,
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
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } },
        { status: 400 }
      );
    }

    console.error('[AUTH] Register error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Registration failed' } },
      { status: 500 }
    );
  }
}
