import { z } from 'zod';
import bcrypt from 'bcryptjs';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { email, password } = loginSchema.parse(body);

  const db = useDrizzle();
  
  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.email, email),
  });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
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
      role: user.role,
    },
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  };
});
