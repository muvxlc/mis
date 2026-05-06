export const useMenus = () => {
  const { loggedIn, user } = useUserSession();
  const menus = ref<any[]>([]);
  const loading = ref(false);

  const fetchMenus = async () => {
    if (!loggedIn.value) return;
    
    loading.value = true;
    try {
      const [allMenus, myPerms]: any = await Promise.all([
        $fetch('/api/admin/menus'),
        $fetch('/api/auth/permissions')
      ]);

      if (myPerms.permissions === '*') {
        menus.value = allMenus;
      } else {
        const allowedIds = myPerms.permissions as string[];
        menus.value = allMenus.filter((m: any) => allowedIds.includes(m.id));
      }
    } catch (err) {
      console.error('Error fetching dynamic menus:', err);
      // Fallback for emergency or errors
      menus.value = [];
    } finally {
      loading.value = false;
    }
  };

  // Grouped menus for display in sidebar
  const groupedMenus = computed(() => {
    const groups: Record<string, any[]> = {};
    menus.value.forEach(m => {
      const cat = m.category || 'General';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(m);
    });
    return groups;
  });

  return {
    menus,
    groupedMenus,
    loading,
    fetchMenus
  };
}
