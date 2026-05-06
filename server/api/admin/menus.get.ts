import { SYSTEM_MENUS } from '../../utils/menus';

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  if ((session.user as any).role !== 'admin' && (session.user as any).role !== 'superadmin') {
    throw createError({ statusCode: 403, message: 'Forbidden' });
  }

  return SYSTEM_MENUS;
});
