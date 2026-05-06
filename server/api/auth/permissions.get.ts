import { rolePermissions } from '../../database/schema';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  const db = useDrizzle();

  if ((session.user as any).role === 'superadmin') {
     // Superadmin gets everything
     return { permissions: '*' };
  }

  const roleData = await db.query.rolePermissions.findFirst({
    where: (rp, { eq }) => eq(rp.role, (session.user as any).role)
  });

  return {
    permissions: roleData?.permissions || ['dashboard']
  };
});
