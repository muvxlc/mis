export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const db = useDrizzle();

  return await db.query.qrcodes.findMany({
    where: (qrcodes, { eq }) => eq(qrcodes.userId, user.id),
    orderBy: (qrcodes, { desc }) => desc(qrcodes.createdAt),
  });
});
