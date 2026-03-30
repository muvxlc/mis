import { SYSTEM_MENUS } from '../utils/menus';

export async function getAllowedMenus(role: string, db: any) {
  if (role === 'superadmin') return SYSTEM_MENUS;

  // Fetch permissions for this role
  const perms = await db.query.rolePermissions.findFirst({
    where: (rp, { eq }) => eq(rp.role, role)
  });

  if (!perms) {
    // Default fallback for user if not in DB
    if (role === 'user') {
      return SYSTEM_MENUS.filter(m => ['dashboard', 'pdf-ocr', 'asr-meeting'].includes(m.id));
    }
    return [];
  }

  const allowedIds = perms.permissions as string[];
  return SYSTEM_MENUS.filter(m => allowedIds.includes(m.id));
}
