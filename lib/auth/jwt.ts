/**
 * Momen JWT Authentication
 * JWT token generation and verification
 */

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

// ============================================
// CONFIGURATION
// ============================================
const JWT_ACCESS_SECRET = new TextEncoder().encode(
  process.env.JWT_ACCESS_SECRET || 'fallback-access-secret-change-in-production'
);

const JWT_REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-change-in-production'
);

// ============================================
// TOKEN PAYLOADS
// ============================================
export interface AccessTokenPayload {
  sub: string; // user ID
  tenant_id: string;
  role: string;
  email: string;
  name?: string;
  iss: string;
  aud: string;
  iat: number;
  exp: number;
}

export interface RefreshTokenPayload {
  sub: string; // user ID
  token_id: string; // unique token ID for revocation
  iss: string;
  aud: string;
  iat: number;
  exp: number;
}

// ============================================
// GENERATE TOKENS
// ============================================
export async function generateAccessToken(user: {
  id: string;
  tenantId: string;
  role: string;
  email: string;
  name?: string;
}): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  return await new SignJWT({
    sub: user.id,
    tenant_id: user.tenantId,
    role: user.role,
    email: user.email,
    name: user.name,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(now + 60 * 15) // 15 minutes
    .setIssuer(process.env.APP_URL || 'http://localhost:3000')
    .setAudience('momen-api')
    .sign(JWT_ACCESS_SECRET);
}

export async function generateRefreshToken(userId: string): Promise<{ token: string; tokenId: string }> {
  const now = Math.floor(Date.now() / 1000);
  const tokenId = crypto.randomUUID();

  const token = await new SignJWT({
    sub: userId,
    token_id: tokenId,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(now + 60 * 60 * 24 * 7) // 7 days
    .setIssuer(process.env.APP_URL || 'http://localhost:3000')
    .setAudience('momen-refresh')
    .sign(JWT_REFRESH_SECRET);

  return { token, tokenId };
}

// ============================================
// VERIFY TOKENS
// ============================================
export async function verifyAccessToken(token: string): Promise<AccessTokenPayload> {
  try {
    const { payload } = await jwtVerify(token, JWT_ACCESS_SECRET, {
      issuer: process.env.APP_URL || 'http://localhost:3000',
      audience: 'momen-api',
    });

    return payload as unknown as AccessTokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
}

export async function verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
  try {
    const { payload } = await jwtVerify(token, JWT_REFRESH_SECRET, {
      issuer: process.env.APP_URL || 'http://localhost:3000',
      audience: 'momen-refresh',
    });

    return payload as unknown as RefreshTokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
}

// ============================================
// COOKIE HELPERS
// ============================================
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

export async function setAuthCookies(tokens: {
  accessToken: string;
  refreshToken: string;
}) {
  const cookieStore = await cookies();

  cookieStore.set('access_token', tokens.accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: 60 * 15, // 15 minutes
  });

  cookieStore.set('refresh_token', tokens.refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();

  cookieStore.delete('access_token');
  cookieStore.delete('refresh_token');
}

export async function getAccessTokenFromCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get('access_token')?.value;
}
