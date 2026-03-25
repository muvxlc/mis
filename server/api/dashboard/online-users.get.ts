import { sql } from 'drizzle-orm';
import { useHosxpDb } from '../../utils/hosxpDb';

export default defineEventHandler(async (event) => {
  // Check auth session
  await requireUserSession(event);
  
  try {
    const hosxpDb = useHosxpDb();
    
    // Fetch unique login names from onlineuser
    const [rows]: any = await hosxpDb.execute(sql`SELECT DISTINCT kskloginname FROM onlineuser ORDER BY kskloginname`);
    
    return rows.map((row: any) => row.kskloginname);
  } catch (err: any) {
    console.error('Failed fetching online users:', err);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch online users'
    });
  }
});
