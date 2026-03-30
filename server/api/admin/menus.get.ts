import { SYSTEM_MENUS } from '../../utils/menus';

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  if (session.user.role !== 'admin' && session.user.role !== 'superadmin') {
    throw createError({ statusCode: 403, message: 'Forbidden' });
  }

  return SYSTEM_MENUS;
});
