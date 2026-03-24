import { z } from 'zod';
import bcrypt from 'bcryptjs';

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['superadmin', 'admin', 'user']),
});

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  const adminUser = session.user as any;
  if (!['admin', 'superadmin'].includes(adminUser.role)) {
    throw createError({ statusCode: 403, message: 'Forbidden' });
  }

  const body = await readBody(event);
  const { email, password, role } = createUserSchema.parse(body);

  if (adminUser.role === 'admin' && role === 'superadmin') {
    throw createError({ statusCode: 403, message: 'Admin cannot create a superadmin' });
  }

  const db = useDrizzle();
  
  const existingUser = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.email, email),
  });

  if (existingUser) {
    throw createError({ statusCode: 400, message: 'Email already registered' });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await db.insert(tables.users).values({
    email,
    passwordHash,
    role,
  });

  return { success: true };
});
