import { drizzle, type MySql2Database } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../database/schema';

let _db: MySql2Database<typeof schema> | null = null;

// Singleton database client for Nitro (SSR)
export const useDrizzle = () => {
  if (!_db) {
    const config = useRuntimeConfig();
    const pool = mysql.createPool(config.databaseUrl);
    _db = drizzle(pool, { schema, mode: 'default' });
  }
  return _db;
};

export const tables = schema;
