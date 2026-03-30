import { rolePermissions } from '../../database/schema';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  const db = useDrizzle();

  if (session.user.role === 'superadmin') {
     // Superadmin gets everything
     return { permissions: '*' };
  }

  const roleData = await db.query.rolePermissions.findFirst({
    where: (rp, { eq }) => eq(rp.role, session.user.role)
  });

  return {
    permissions: roleData?.permissions || ['dashboard']
  };
});
