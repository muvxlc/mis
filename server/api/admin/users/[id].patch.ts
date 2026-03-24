import { z } from 'zod';
import { eq, and, ne } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

const updateUserSchema = z.object({
  email: z.string().email().optional(),
  role: z.enum(['superadmin', 'admin', 'user']).optional(),
  password: z.string().min(6).optional().or(z.literal('')),
});

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  const adminUser = session.user as any;
  if (!['admin', 'superadmin'].includes(adminUser.role)) {
    throw createError({ statusCode: 403, message: 'Forbidden' });
  }

  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, message: 'Missing ID' });

  const body = await readBody(event);
  const { email, role, password } = updateUserSchema.parse(body);

  const db = useDrizzle();

  const targetUser = await db.query.users.findFirst({
    where: eq(tables.users.id, parseInt(id)),
  });

  if (!targetUser) {
    throw createError({ statusCode: 404, message: 'User not found' });
  }

  // Role modification checks
  if (role) {
    if (adminUser.role === 'admin') {
      if (targetUser.role === 'superadmin') {
        throw createError({ statusCode: 403, message: 'Cannot modify a superadmin' });
      }
      if (targetUser.role === 'admin' && id !== adminUser.id.toString() && role !== 'admin') {
        throw createError({ statusCode: 403, message: 'Only a superadmin can revoke admin privileges from another admin' });
      }
      if (role === 'superadmin') {
        throw createError({ statusCode: 403, message: 'Admin cannot grant superadmin role' });
      }
    } else if (adminUser.role === 'superadmin') {
      if (id === adminUser.id.toString() && role !== 'superadmin') {
        throw createError({ statusCode: 400, message: 'Superadmin cannot demote themselves' });
      }
    }
  }

  // Safety: Prevent updating the role of the very first admin (self-lockout protection)
  if (adminUser.role === 'admin' && id === adminUser.id.toString() && role === 'user') {
    throw createError({ statusCode: 400, message: 'You cannot downgrade your own role' });
  }

  const updates: any = {};
  if (email) updates.email = email;
  if (role) updates.role = role;
  if (password && password.trim() !== '') {
    updates.passwordHash = await bcrypt.hash(password, 10);
  }

  if (Object.keys(updates).length > 0) {
    await db.update(tables.users)
      .set(updates)
      .where(eq(tables.users.id, parseInt(id)));
  }

  return { success: true };
});
