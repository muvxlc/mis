import { eq, and } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({ statusCode: 400, message: 'Missing ID' });
  }

  const db = useDrizzle();

  // Ensure user owns the qrcode
  const [result] = await db.delete(tables.qrcodes).where(
    and(
      eq(tables.qrcodes.id, parseInt(id)),
      eq(tables.qrcodes.userId, (user as any).id)
    )
  );

  return { success: true };
});
