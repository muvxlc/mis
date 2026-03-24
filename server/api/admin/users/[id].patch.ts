import { z } from 'zod';
import { eq, and, ne } from 'drizzle-orm';

const updateUserSchema = z.object({
  email: z.string().email().optional(),
  role: z.enum(['admin', 'user']).optional(),
});

export default defineEventHandler(async (event) => {
  const { user: adminUser } = await requireUserSession(event);
  if (adminUser.role !== 'admin') {
    throw createError({ statusCode: 403, message: 'Forbidden' });
  }

  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, message: 'Missing ID' });

  const body = await readBody(event);
  const { email, role } = updateUserSchema.parse(body);

  const db = useDrizzle();

  // Safety: Prevent updating the role of the very first admin (self-lockout protection)
  if (id === adminUser.id.toString() && role === 'user') {
    throw createError({ statusCode: 400, message: 'You cannot downgrade your own role' });
  }

  await db.update(tables.users)
    .set({ email, role })
    .where(eq(tables.users.id, parseInt(id)));

  return { success: true };
});
