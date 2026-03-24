import { z } from 'zod';
import bcrypt from 'bcryptjs';

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['admin', 'user']),
});

export default defineEventHandler(async (event) => {
  const { user: adminUser } = await requireUserSession(event);
  if (adminUser.role !== 'admin') {
    throw createError({ statusCode: 403, message: 'Forbidden' });
  }

  const body = await readBody(event);
  const { email, password, role } = createUserSchema.parse(body);

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
