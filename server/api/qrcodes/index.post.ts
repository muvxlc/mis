import { z } from 'zod';
import { nanoid } from 'nanoid';

const createSchema = z.object({
  type: z.enum(['static', 'dynamic']),
  originalUrl: z.string().url(),
  styleOptions: z.record(z.string(), z.any()).optional(),
});

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const body = await readBody(event);
  const { type, originalUrl, styleOptions } = createSchema.parse(body);

  const db = useDrizzle();

  let shortCode = null;
  if (type === 'dynamic') {
    shortCode = nanoid(6);
  }

  const [result] = await db.insert(tables.qrcodes).values({
    userId: (user as any).id,
    type,
    originalUrl,
    shortCode,
    styleOptions: styleOptions || {},
  });

  return {
    id: result.insertId,
    type,
    originalUrl,
    shortCode,
  };
});
