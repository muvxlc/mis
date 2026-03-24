import { z } from 'zod';
import bcrypt from 'bcryptjs';

const loginSchema = z.object({
  identifier: z.string(),
  password: z.string(),
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { identifier, password } = loginSchema.parse(body);

  const db = useDrizzle();
  
  const user = await db.query.users.findFirst({
    where: (users, { eq, or }) => or(eq(users.email, identifier), eq(users.cid, identifier)),
  });

  if (!user || !user.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
    throw createError({
      statusCode: 401,
      message: 'Invalid credentials',
    });
  }

  // Set session
  await setUserSession(event, {
    user: {
      id: user.id,
      email: user.email,
      name: user.nameEn || user.name || user.email,
      role: user.role,
    },
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.nameEn || user.name || user.email,
      role: user.role,
    },
  };
});
