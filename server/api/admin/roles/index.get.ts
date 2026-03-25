import { rolePermissions } from '../../../database/schema';

export default defineEventHandler(async (event) => {
  const db = useDrizzle();
  const session = await requireUserSession(event);
  if (session.user.role !== 'admin' && session.user.role !== 'superadmin') {
    throw createError({ statusCode: 403, message: 'Forbidden' });
  }

  const permissions = await db.select().from(rolePermissions);
  return permissions;
});
