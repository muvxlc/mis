import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

let _externalDb: ReturnType<typeof drizzle> | null = null;

export function useExternalDb() {
  if (!_externalDb) {
    const config = useRuntimeConfig();
    const dbUrl = config.secondaryDatabaseUrl;
    
    if (!dbUrl) {
      console.warn('SECONDARY_DATABASE_URL is not configured. External queries might fail.');
      throw createError({ statusCode: 500, message: 'Secondary database URL is missing.' });
    }
    
    const pool = mysql.createPool(dbUrl);
    // Bind Drizzle ORM to the secondary raw MariaDB pool
    _externalDb = drizzle(pool);
  }
  
  return _externalDb;
}
