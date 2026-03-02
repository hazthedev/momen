/**
 * Momen Database Connection
 * Multi-tenant PostgreSQL with connection pooling
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import pg from 'pg';
import * as schema from './schema';

// ============================================
// CONNECTION POOL CONFIGURATION
// ============================================
const isVercel = process.env.VERCEL || process.env.VERCEL_ENV;

const poolConfig = {
  connectionString: process.env.DATABASE_URL!,
  // Serverless (Vercel): Use fewer connections per function
  // Local development: Use higher pool for performance
  min: parseInt(process.env.DATABASE_POOL_MIN || (isVercel ? '0' : '2'), 10),
  max: parseInt(process.env.DATABASE_POOL_MAX || (isVercel ? '2' : '20'), 10),
  idleTimeoutMillis: isVercel ? 10000 : 30000,
  connectionTimeoutMillis: 30000,
  statement_timeout: 60000,
};

// Create connection pool
let pool: pg.Pool | null = null;

export function getPool(): pg.Pool {
  if (!pool) {
    pool = new pg.Pool(poolConfig);

    // Pool event logging (development only)
    if (process.env.NODE_ENV === 'development') {
      pool.on('connect', (client) => {
        console.log('[DB] New client connected');
      });

      pool.on('remove', (client) => {
        console.log('[DB] Client removed');
      });

      pool.on('error', (err) => {
        console.error('[DB] Unexpected error on idle client', err);
      });
    }
  }

  return pool;
}

// ============================================
// DRIZZLE DATABASE INSTANCE
// ============================================
export const db = drizzle(getPool(), { schema });

// ============================================
// TENANT-AWARE DATABASE CLASS
// ============================================
export class TenantDatabase {
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  /**
   * Execute a query with tenant context
   * Automatically sets tenant_id for RLS
   */
  async query<T = unknown>(text: string, params?: unknown[]) {
    const client = await getPool().connect();

    try {
      // Set tenant context for THIS connection
      await client.query('SELECT set_tenant_id($1)', [this.tenantId]);

      // Execute the query on the SAME connection
      const result = await client.query(text, params);
      return result;
    } finally {
      // Always release the connection
      client.release();
    }
  }

  /**
   * Get a connection for multiple operations
   * WARNING: You must call client.release() when done!
   */
  async getClient() {
    const client = await getPool().connect();
    await client.query('SELECT set_tenant_id($1)', [this.tenantId]);
    return client;
  }

  /**
   * Execute operations in a transaction
   */
  async transaction<T>(callback: (client: pg.PoolClient) => Promise<T>): Promise<T> {
    const client = await getPool().connect();

    try {
      await client.query('SELECT set_tenant_id($1)', [this.tenantId]);
      await client.query('BEGIN');

      const result = await callback(client);

      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

/**
 * Get a tenant-aware database instance
 */
export function getTenantDb(tenantId: string): TenantDatabase {
  return new TenantDatabase(tenantId);
}

// ============================================
// SQL IDENTIFIER ESCAPING
// ============================================
/**
 * Escape SQL identifiers to prevent SQL injection
 */
export function escapeIdentifier(identifier: string): string {
  // Validate identifier contains only safe characters
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*(\.[a-zA-Z_][a-zA-Z0-9_]*)*$/.test(identifier)) {
    throw new Error(`Invalid SQL identifier: ${identifier}`);
  }

  // Escape by wrapping in double quotes and doubling internal quotes
  return `"${identifier.replace(/"/g, '""')}"`;
}

// ============================================
// GRACEFUL SHUTDOWN
// ============================================
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('[DB] Connection pool closed');
  }
}

if (typeof process !== 'undefined' && process.on) {
  process.on('SIGINT', async () => {
    console.log('[DB] Received SIGINT, closing connections...');
    await closePool();
  });

  process.on('SIGTERM', async () => {
    console.log('[DB] Received SIGTERM, closing connections...');
    await closePool();
  });
}
