import { rolePermissions } from '../../../database/schema';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const db = useDrizzle();
  const session = await requireUserSession(event);
  if (session.user.role !== 'admin' && session.user.role !== 'superadmin') {
    throw createError({ statusCode: 403, message: 'Forbidden' });
  }

  const roleId = getRouterParam(event, 'id');
  if (!roleId) {
    throw createError({ statusCode: 400, message: 'Role missing' });
  }

  const body = await readBody(event);
  
  const existing = await db.select().from(rolePermissions).where(eq(rolePermissions.role, roleId));
  if (existing.length > 0) {
    await db.update(rolePermissions)
      .set({ permissions: body.permissions, description: body.description || existing[0].description })
      .where(eq(rolePermissions.role, roleId));
  } else {
    await db.insert(rolePermissions).values({
      role: roleId,
      permissions: body.permissions,
      description: body.description || ''
    });
  }

  return { success: true };
});
