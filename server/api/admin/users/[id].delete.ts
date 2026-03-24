import { eq, and, ne } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  const user = session.user as any;
  
  if (!['admin', 'superadmin'].includes(user.role)) {
    throw createError({ statusCode: 403, message: 'Forbidden' });
  }

  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, message: 'Missing ID' });

  if (id === user.id.toString()) {
    throw createError({ statusCode: 400, message: 'Cannot delete yourself' });
  }

  const db = useDrizzle();

  if (user.role === 'admin') {
    await db.delete(tables.users).where(
      and(
        eq(tables.users.id, parseInt(id)),
        eq(tables.users.role, 'user')
      )
    );
  } else if (user.role === 'superadmin') {
    await db.delete(tables.users).where(
      and(
        eq(tables.users.id, parseInt(id)),
        ne(tables.users.role, 'superadmin')
      )
    );
  }

  return { success: true };
});
