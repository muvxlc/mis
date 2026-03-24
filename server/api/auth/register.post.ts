import { z } from 'zod';
import bcrypt from 'bcryptjs';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { email, password } = registerSchema.parse(body);

  const db = useDrizzle();
  
  // Check if user already exists
  const existingUser = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.email, email),
  });

  if (existingUser) {
    throw createError({
      statusCode: 400,
      message: 'User already exists',
    });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const [result] = await db.insert(tables.users).values({
    email,
    passwordHash,
  });

  const newUser = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, result.insertId),
  });

  if (!newUser) {
    throw createError({
      statusCode: 500,
      message: 'Failed to create user',
    });
  }

  // Set session
  await setUserSession(event, {
    user: {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
    },
  });

  return {
    user: {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
    },
  };
});
