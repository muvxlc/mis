import { eq, and, ne } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  
  if (user.role !== 'admin') {
    throw createError({ statusCode: 403, message: 'Forbidden' });
  }

  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, message: 'Missing ID' });

  const db = useDrizzle();

  // Prevent deleting self or other admins (safety measure)
  await db.delete(tables.users).where(
    and(
      eq(tables.users.id, parseInt(id)),
      ne(tables.users.role, 'admin')
    )
  );

  return { success: true };
});
