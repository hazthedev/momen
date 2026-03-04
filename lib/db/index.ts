/**
 * Momen Database Connection
 * Multi-tenant PostgreSQL with connection pooling
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema';

// ============================================
// CONNECTION POOL CONFIGURATION
// ============================================
const isVercel = process.env.VERCEL || process.env.VERCEL_ENV;

// Validate DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL environment variable is not set. ' +
    'Please ensure DATABASE_URL is configured in your environment.'
  );
}

const poolConfig = {
  connectionString: process.env.DATABASE_URL,
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
    // Double-check DATABASE_URL is still available
    if (!process.env.DATABASE_URL) {
      throw new Error(
        'DATABASE_URL environment variable is not set. ' +
        'Cannot initialize database connection pool.'
      );
    }

    try {
      pool = new pg.Pool(poolConfig);

      // Pool event logging (development only)
      if (process.env.NODE_ENV === 'development') {
        pool.on('connect', (_client) => {
          console.log('[DB] New client connected');
        });

        pool.on('remove', (_client) => {
          console.log('[DB] Client removed');
        });

        pool.on('error', (err) => {
          console.error('[DB] Unexpected error on idle client', err);
        });
      }
    } catch (error) {
      console.error('[DB] Failed to create connection pool:', error);
      throw new Error(
        `Failed to initialize database connection pool: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  return pool;
}

// ============================================
// DRIZZLE DATABASE INSTANCE
// ============================================
export const db = drizzle(getPool(), { schema });

// ============================================
// DRIZZLE WRAPPER TYPES
// ============================================

type WhereCondition = Record<string, unknown>;

// Type for the return value of insert().values()
interface InsertValuesChain {
  returning: () => Promise<any[]>;
}

// Drizzle insert chain wrapper that proxies to a tenant-aware Drizzle instance
class InsertBuilder {
  private table: any;
  private tenantDb: TenantDatabase;

  constructor(table: any, tenantDb: TenantDatabase) {
    this.table = table;
    this.tenantDb = tenantDb;
  }

  /**
   * Store values and return chainable object with returning()
   */
  values(values: any): InsertValuesChain {
    return {
      returning: async (): Promise<any[]> => {
        const client = await this.tenantDb.getClient();
        try {
          const drizzleInstance = drizzle(client, { schema });
          const result = await drizzleInstance.insert(this.table).values(values).returning();
          return result as any[];
        } finally {
          client.release();
        }
      },
    };
  }

  /**
   * Support returning() before values() for flexibility
   */
  returning(): { values: (values: any) => Promise<any[]> } {
    return {
      values: async (values: any): Promise<any[]> => {
        const client = await this.tenantDb.getClient();
        try {
          const drizzleInstance = drizzle(client, { schema });
          const result = await drizzleInstance.insert(this.table).values(values).returning();
          return result as any[];
        } finally {
          client.release();
        }
      },
    };
  }
}

// ============================================
// TENANT-AWARE DATABASE CLASS
// ============================================
export class TenantDatabase {
  private tenantId: string;
  private _query: typeof db.query;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
    // Expose the global db's query API for type-safe queries
    this._query = db.query;
  }

  /**
   * Drizzle insert wrapper
   * Returns a chainable builder: insert(table).values(data).returning()
   */
  insert(table: any): InsertBuilder {
    return new InsertBuilder(table, this);
  }

  /**
   * Find a single record by conditions
   */
  async findOne(
    table: any,
    where: WhereCondition
  ): Promise<any | null> {
    const client = await this.getClient();
    try {
      const drizzleInstance = drizzle(client, { schema });
      const { eq, and } = await import('drizzle-orm');

      // Build where conditions from the object
      const conditions = Object.entries(where).map(([key, value]) =>
        eq((table as any)[key], value)
      );

      const result = await drizzleInstance
        .select()
        .from(table)
        .where(and(...conditions))
        .limit(1);

      return (result[0] as any) || null;
    } finally {
      client.release();
    }
  }

  /**
   * Update records matching conditions
   */
  async update(
    table: any,
    data: Partial<any>,
    where: WhereCondition
  ): Promise<void> {
    const client = await this.getClient();
    try {
      const drizzleInstance = drizzle(client, { schema });
      const { eq, and } = await import('drizzle-orm');

      // Build where conditions from the object
      const conditions = Object.entries(where).map(([key, value]) =>
        eq((table as any)[key], value)
      );

      await drizzleInstance
        .update(table)
        .set(data)
        .where(and(...conditions));
    } finally {
      client.release();
    }
  }

  /**
   * Delete records matching conditions
   */
  async delete(
    table: any,
    where: WhereCondition
  ): Promise<void> {
    const client = await this.getClient();
    try {
      const drizzleInstance = drizzle(client, { schema });
      const { eq, and } = await import('drizzle-orm');

      // Build where conditions from the object
      const conditions = Object.entries(where).map(([key, value]) =>
        eq((table as any)[key], value)
      );

      await drizzleInstance
        .delete(table)
        .where(and(...conditions));
    } finally {
      client.release();
    }
  }

  /**
   * Expose Drizzle's query API for type-safe relational queries
   * Note: These queries rely on RLS policies for tenant isolation
   */
  get query() {
    return this._query;
  }

  /**
   * Execute a query with tenant context
   * Automatically sets tenant_id for RLS
   */
  async querySql(text: string, params?: unknown[]): Promise<any> {
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
