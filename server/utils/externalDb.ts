import mysql from 'mysql2/promise';

let pool: mysql.Pool;

export function useExternalDb() {
  if (!pool) {
    const config = useRuntimeConfig();
    const dbUrl = config.secondaryDatabaseUrl;
    
    if (!dbUrl) {
      console.warn('SECONDARY_DATABASE_URL is not configured. External queries might fail.');
      // return a placeholder or throw immediately if required
      throw createError({ statusCode: 500, message: 'Secondary database URL is missing.' });
    }
    
    pool = mysql.createPool(dbUrl);
  }
  return pool;
}
