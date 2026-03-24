import { asc } from 'drizzle-orm';
import { users } from '../../database/schema';

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  
  const adminUser = user as any;
  if (!['admin', 'superadmin'].includes(adminUser.role)) {
    throw createError({
      statusCode: 403,
      message: 'Forbidden: Admin access required',
    });
  }

  const db = useDrizzle();
  
  // ใช้ Standard Select และเรียงตาม ID
  const result = await db.select()
    .from(users)
    .orderBy(asc(users.id));

  console.log('Admin Users API returned:', result.length, 'users');
  return result.map(u => ({
    id: u.id,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt
  }));
});
