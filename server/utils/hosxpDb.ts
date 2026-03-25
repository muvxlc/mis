import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

let _hosxpDb: ReturnType<typeof drizzle> | null = null;

export function useHosxpDb() {
  if (!_hosxpDb) {
    const config = useRuntimeConfig();
    const dbUrl = config.hosxpDatabaseUrl;
    
    if (!dbUrl) {
      console.warn('HOSXP_DATABASE_URL is not configured. External queries might fail.');
      throw createError({ statusCode: 500, message: 'HOSXP database URL is missing.' });
    }
    
    const pool = mysql.createPool(dbUrl);
    // Bind Drizzle ORM to the HOSxP raw MariaDB pool
    _hosxpDb = drizzle(pool as any);
  }
  
  return _hosxpDb;
}
