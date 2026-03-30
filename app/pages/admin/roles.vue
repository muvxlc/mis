<script setup lang="ts">
definePageMeta({
  middleware: 'admin'
});

const toast = useToast();
const loading = ref(true);
const rolesState = ref<any[]>([]);

const availablePermissions = ref<any[]>([]);

const loadData = async () => {
    loading.value = true;
    try {
        const [roles, menus]: any = await Promise.all([
            $fetch('/api/admin/roles'),
            $fetch('/api/admin/menus')
        ]);
        
        availablePermissions.value = menus.map((m: any) => ({
            id: m.id,
            label: m.label,
            category: m.category
        }));
        
        rolesState.value = [
            { 
               id: 'superadmin', 
               name: 'Super Administrator', 
               description: 'Absolute control over the entire system, security, and infrastructure.', 
               color: 'error',
               access: roles?.find((r: any) => r.role === 'superadmin')?.permissions || availablePermissions.value.map((p: any) => p.id)
            },
            { 
               id: 'admin', 
               name: 'Administrator', 
               description: 'Full system management and configuration control.', 
               color: 'primary',
               access: roles?.find((r: any) => r.role === 'admin')?.permissions || availablePermissions.value.map((p: any) => p.id)
            },
            {
               id: 'user', 
               name: 'Standard User', 
               description: 'Standard access for asset creation and management.', 
               color: 'neutral',
               access: roles?.find((r: any) => r.role === 'user')?.permissions || ['dashboard']
            }
        ];
    } catch (err) {
        toast.add({ title: 'Error loading roles', color: 'error' });
    } finally {
        loading.value = false;
    }
};

onMounted(() => loadData());

const saveRole = async (role: any) => {
    try {
        await $fetch(`/api/admin/roles/${role.id}`, {
            method: 'PUT',
            body: { permissions: role.access, description: role.description }
        });
        toast.add({ title: 'Success', description: `${role.name} permissions updated.` });
    } catch(err) {
        toast.add({ title: 'Update Failed', color: 'error' });
    }
};

const togglePermission = (role: any, permId: string) => {
    const idx = role.access.indexOf(permId);
    if (idx > -1) {
        role.access.splice(idx, 1);
    } else {
        role.access.push(permId);
    }
};
</script>

<template>
  <div class="py-10 px-6 max-w-7xl mx-auto space-y-10 font-sans text-ink">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b-[3px] border-ink">
      <div class="space-y-2">
        <h1 class="text-4xl md:text-5xl font-display font-bold text-ink tracking-tight drop-shadow-sm">Role Management</h1>
        <p class="text-ink-soft font-bold tracking-wide text-sm bg-warm-white border-[2px] border-ink shadow-[2px_2px_0_var(--color-ink)] inline-block px-3 py-1 rounded-sm mt-2">Define access control and system permissions for different personnel levels.</p>
      </div>
    </div>

    <!-- Content -->
    <div v-if="loading" class="py-24 flex flex-col items-center justify-center space-y-4">
       <UIcon name="i-heroicons-arrow-path" class="w-10 h-10 animate-spin text-ink opacity-30" />
       <p class="text-ink-soft font-bold tracking-widest uppercase text-xs">Loading Roles...</p>
    </div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div v-for="role in rolesState" :key="role.id" class="bg-warm-white rounded-sm shadow-[8px_8px_0_var(--color-ink)] border-[3px] border-ink overflow-hidden transition-all duration-300">
        <div class="p-8 space-y-6">
          <div class="flex items-center justify-between pb-4 border-b-[3px] border-ink">
            <h3 class="text-3xl font-display font-bold text-ink drop-shadow-sm">{{ role.name }}</h3>
            <UBadge :color="role.color" variant="solid" class="font-bold px-2.5 py-1 text-[10px] rounded-sm uppercase tracking-widest border-[2px] border-ink shadow-[2px_2px_0_var(--color-ink)]" :class="{ 'bg-coral text-ink': role.color === 'error', 'bg-teal text-ink': role.color === 'primary', 'bg-cream text-ink': role.color === 'neutral' }">Active Role</UBadge>
          </div>
          
          <p class="text-ink-soft font-bold leading-relaxed pb-2">{{ role.description }}</p>
          
          <div class="space-y-4 pt-6 border-t-[3px] border-ink bg-slate-50/50 -mx-8 px-8 pb-4">
             <span class="text-[10px] uppercase tracking-widest text-ink font-bold block mb-4 bg-warm-white border-[2px] border-ink shadow-[2px_2px_0_var(--color-ink)] px-2 py-1 inline-block rounded-sm">Configure Access</span>
             <div class="flex flex-col gap-3 pt-1">
                <label v-for="priv in availablePermissions" :key="priv.id" class="flex items-center gap-4 bg-cream border-[3px] border-ink px-4 py-3 bottom-0 rounded-sm shadow-[4px_4px_0_var(--color-ink)] cursor-pointer hover:bg-gold hover:-translate-y-px transition-all" :class="{ 'bg-gold shadow-[2px_2px_0_var(--color-ink)] translate-y-px text-ink': role.access.includes(priv.id) }">
                   <div class="w-6 h-6 border-[3px] border-ink rounded-none bg-warm-white flex items-center justify-center shrink-0" :class="{ 'shadow-[2px_2px_0_var(--color-ink)]': !role.access.includes(priv.id) }">
                      <UIcon v-if="role.access.includes(priv.id)" name="i-heroicons-check" class="w-5 h-5 text-ink font-bold stroke-[3px]" />
                   </div>
                   <input type="checkbox" :value="priv.id" class="hidden" @change="togglePermission(role, priv.id)" :checked="role.access.includes(priv.id)" />
                   <span class="text-[12px] font-bold text-ink tracking-wider">{{ priv.label }}</span>
                </label>
             </div>
          </div>
          
          <div class="pt-6">
             <UButton @click="saveRole(role)" class="w-full justify-center bg-teal hover:bg-teal-dark text-ink font-bold shadow-[4px_4px_0_var(--color-ink)] border-[3px] border-ink rounded-sm py-4 text-xs tracking-widest uppercase transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_var(--color-ink)]">
                Save Permissions
             </UButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
