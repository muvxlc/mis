export default defineEventHandler(async (event) => {
  const shortCode = getRouterParam(event, 'code');

  if (!shortCode) {
    throw createError({ statusCode: 404, message: 'Not Found' });
  }

  const db = useDrizzle();

  const qrcode = await db.query.qrcodes.findFirst({
    where: (qrcodes, { eq }) => eq(qrcodes.shortCode, shortCode),
  });

  if (!qrcode) {
    throw createError({ statusCode: 404, message: 'QR Code not found' });
  }

  // Log scan (asynchronously, don't block redirect)
  event.waitUntil(
    db.insert(tables.scans).values({
      qrcodeId: qrcode.id,
      userAgent: getHeader(event, 'user-agent'),
      ipAddress: getRequestIP(event, { xForwardedFor: true }),
    })
  );

  return sendRedirect(event, qrcode.originalUrl, 302);
});
