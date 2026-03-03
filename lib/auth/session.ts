/**
 * Momen Session Management
 * Complete Redis implementation (not TODO!)
 */

import Redis from 'ioredis';
import { randomBytes } from 'crypto';

// ============================================
// REDIS CLIENT
// ============================================
let redis: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redis) {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      throw new Error('REDIS_URL environment variable is not set');
    }

    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    redis.on('error', (err) => {
      console.error('[Redis] Error:', err);
    });

    redis.on('connect', () => {
      console.log('[Redis] Connected');
    });
  }

  return redis;
}

// ============================================
// SESSION DATA TYPES
// ============================================
export interface SessionData {
  userId: string;
  tenantId: string;
  email: string;
  name?: string;
  role: string;
  createdAt: number;
  lastActivity: number;
  expiresAt: number;
}

export interface CreateSessionOptions {
  userId: string;
  tenantId: string;
  email: string;
  name?: string;
  role: string;
  rememberMe?: boolean;
}

// ============================================
// SESSION MANAGEMENT
// ============================================
const SESSION_PREFIX = 'session:';
const SESSION_TTL = 7 * 24 * 60 * 60; // 7 days
const EXTENDED_SESSION_TTL = 30 * 24 * 60 * 60; // 30 days

/**
 * Generate a secure session ID
 */
function generateSessionId(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Create a new session
 */
export async function createSession(options: CreateSessionOptions): Promise<string> {
  const redis = getRedisClient();
  const sessionId = generateSessionId();
  const now = Date.now();
  const ttl = options.rememberMe ? EXTENDED_SESSION_TTL : SESSION_TTL;

  const sessionData: SessionData = {
    userId: options.userId,
    tenantId: options.tenantId,
    email: options.email,
    name: options.name,
    role: options.role,
    createdAt: now,
    lastActivity: now,
    expiresAt: now + ttl * 1000,
  };

  // Store session in Redis
  await redis.setex(
    `${SESSION_PREFIX}${sessionId}`,
    ttl,
    JSON.stringify(sessionData)
  );

  // Add session ID to user's session set (for logout all)
  await redis.sadd(`user_sessions:${options.userId}`, sessionId);
  await redis.expire(`user_sessions:${options.userId}`, ttl);

  return sessionId;
}

/**
 * Get session data
 */
export async function getSession(sessionId: string): Promise<SessionData | null> {
  const redis = getRedisClient();
  const data = await redis.get(`${SESSION_PREFIX}${sessionId}`);

  if (!data) {
    return null;
  }

  try {
    const session = JSON.parse(data) as SessionData;

    // Check if expired
    if (Date.now() > session.expiresAt) {
      await deleteSession(sessionId);
      return null;
    }

    // Update last activity
    session.lastActivity = Date.now();
    await redis.setex(
      `${SESSION_PREFIX}${sessionId}`,
      Math.ceil((session.expiresAt - Date.now()) / 1000),
      JSON.stringify(session)
    );

    return session;
  } catch {
    return null;
  }
}

/**
 * Delete a specific session
 */
export async function deleteSession(sessionId: string): Promise<void> {
  const redis = getRedisClient();

  // Get session data to remove from user's session set
  const data = await redis.get(`${SESSION_PREFIX}${sessionId}`);
  if (data) {
    try {
      const session = JSON.parse(data) as SessionData;
      await redis.srem(`user_sessions:${session.userId}`, sessionId);
    } catch {
      // Ignore parsing errors
    }
  }

  await redis.del(`${SESSION_PREFIX}${sessionId}`);
}

/**
 * Delete all sessions for a user
 */
export async function deleteUserSessions(userId: string): Promise<void> {
  const redis = getRedisClient();

  // Get all session IDs for this user
  const sessionIds = await redis.smembers(`user_sessions:${userId}`);

  if (sessionIds && sessionIds.length > 0) {
    // Delete all sessions
    const pipeline = redis.pipeline();
    for (const sessionId of sessionIds) {
      pipeline.del(`${SESSION_PREFIX}${sessionId}`);
    }
    pipeline.del(`user_sessions:${userId}`);
    await pipeline.exec();
  }
}

/**
 * Refresh session expiration
 */
export async function refreshSession(sessionId: string, rememberMe = false): Promise<boolean> {
  const redis = getRedisClient();
  const data = await redis.get(`${SESSION_PREFIX}${sessionId}`);

  if (!data) {
    return false;
  }

  try {
    const session = JSON.parse(data) as SessionData;
    const ttl = rememberMe ? EXTENDED_SESSION_TTL : SESSION_TTL;
    const newExpiresAt = Date.now() + ttl * 1000;

    session.expiresAt = newExpiresAt;
    session.lastActivity = Date.now();

    await redis.setex(
      `${SESSION_PREFIX}${sessionId}`,
      ttl,
      JSON.stringify(session)
    );

    return true;
  } catch {
    return false;
  }
}

/**
 * Validate session from request
 */
export async function validateSession(sessionId: string): Promise<SessionData | null> {
  return await getSession(sessionId);
}

/**
 * Check if session exists and is valid
 */
export async function isSessionValid(sessionId: string): Promise<boolean> {
  const session = await getSession(sessionId);
  return session !== null;
}

// ============================================
// REDIS CLOSE
// ============================================
export async function closeRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
    console.log('[Redis] Connection closed');
  }
}

if (typeof process !== 'undefined' && process.on) {
  process.on('SIGINT', async () => {
    await closeRedis();
  });

  process.on('SIGTERM', async () => {
    await closeRedis();
  });
}
