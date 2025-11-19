/**
 * Database connection management
 */
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';

import * as schema from './schema.js';

const { Pool } = pg;

let db: ReturnType<typeof drizzle> | null = null;
let pool: pg.Pool | null = null;

interface DatabaseConfig {
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
  connectionString?: string;
}

/**
 * Initialize database connection
 */
export function initDatabase(config?: DatabaseConfig): ReturnType<typeof drizzle> {
  if (db) {
    return db;
  }

  // Use connection string if provided, otherwise use individual config
  const connectionString =
    config?.connectionString ||
    process.env.DATABASE_URL ||
    `postgresql://${config?.user || process.env.DB_USER || 'minion'}:${config?.password || process.env.DB_PASSWORD || 'minion'}@${config?.host || process.env.DB_HOST || 'localhost'}:${config?.port || process.env.DB_PORT || 5432}/${config?.database || process.env.DB_NAME || 'minion'}`;

  pool = new Pool({
    connectionString,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  db = drizzle(pool, { schema });

  return db;
}

/**
 * Get database instance
 */
export function getDatabase(): ReturnType<typeof drizzle> {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

/**
 * Close database connection
 */
export async function closeDatabase(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    db = null;
  }
}

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    if (!pool) {
      throw new Error('Database not initialized');
    }
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}
