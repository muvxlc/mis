<script setup lang="ts">
definePageMeta({
  middleware: 'admin'
});

const toast = useToast();
const users = ref<any[]>([]);
const pending = ref(true);
const loading = ref(false);
const isFormOpen = ref(false);
const isEditing = ref(false);

const form = reactive({
  id: 0,
  email: '',
  password: '',
  role: 'user' as 'superadmin' | 'admin' | 'user'
});

const { user: currentUserSession } = useUserSession() as any;

const availableRoles = computed(() => {
  const roles = [
    { label: 'Administrator', value: 'admin' },
    { label: 'Standard User', value: 'user' }
  ];
  if (currentUserSession.value?.role === 'superadmin') {
    roles.unshift({ label: 'Super Administrator', value: 'superadmin' });
  }
  return roles;
});

const canDelete = (targetUser: any) => {
  const current = currentUserSession.value;
  if (!current) return false;
  if (current.role === 'admin') return targetUser.role === 'user';
  if (current.role === 'superadmin') return targetUser.id !== current.id;
  return false;
};

const canEdit = (targetUser: any) => {
  const current = currentUserSession.value;
  if (!current) return false;
  if (current.role === 'superadmin') return true;
  if (current.role === 'admin') return targetUser.role !== 'superadmin';
  return false;
};

const loadData = async () => {
  pending.value = true;
  try {
    const data = await $fetch('/api/admin/users');
    users.value = Array.isArray(data) ? data : [];
  } catch (err: any) {
    console.error('Fetch error:', err);
    toast.add({ title: 'Error loading data', description: err.message, color: 'error' });
  } finally {
    pending.value = false;
  }
};

onMounted(() => {
  loadData();
});

const resetForm = () => {
  form.id = 0;
  form.email = '';
  form.password = '';
  form.role = 'user';
  isEditing.value = false;
  isFormOpen.value = false;
};

const onSubmit = async () => {
  loading.value = true;
  try {
    if (isEditing.value) {
      await $fetch(`/api/admin/users/${form.id}`, {
        method: 'PATCH',
        body: { 
          email: form.email, 
          role: form.role, 
          ...(form.password ? { password: form.password } : {}) 
        }
      });
      toast.add({ title: 'Success', description: 'Updated successfully' });
    } else {
      await $fetch('/api/admin/users', {
        method: 'POST',
        body: form
      });
      toast.add({ title: 'Success', description: 'User registered' });
    }
    await loadData();
    resetForm();
  } catch (err: any) {
    toast.add({ title: 'Error', description: err.data?.message, color: 'error' });
  } finally {
    loading.value = false;
  }
};

const onEdit = (user: any) => {
  isEditing.value = true;
  isFormOpen.value = true;
  form.id = user.id;
  form.email = user.email;
  form.role = user.role;
  form.password = '';
};

const onDelete = async (userId: number) => {
  if (confirm('Delete this user?')) {
    try {
      await $fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      toast.add({ title: 'Deleted', color: 'success' });
      await loadData();
    } catch (err) {
      toast.add({ title: 'Delete Failed', color: 'error' });
    }
  }
};
</script>

<template>
  <div class="py-10 px-6 max-w-7xl mx-auto space-y-10 font-sans text-ink">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b-[3px] border-ink">
      <div class="space-y-2">
        <h1 class="text-4xl md:text-5xl font-display font-bold text-ink tracking-tight drop-shadow-sm">User Management</h1>
        <p class="text-ink-soft font-bold tracking-wide text-sm bg-warm-white border-[2px] border-ink shadow-[2px_2px_0_var(--color-ink)] inline-block px-3 py-1 rounded-sm mt-2">MIS Administration Terminal</p>
      </div>
      <UButton 
        v-if="!isFormOpen"
        icon="i-heroicons-user-plus" 
        label="Add User" 
        @click="isFormOpen = true" 
        class="bg-teal hover:bg-teal-dark text-ink border-[3px] border-ink font-bold px-6 py-3 rounded-sm shadow-[4px_4px_0_var(--color-ink)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_var(--color-ink)] uppercase tracking-wider text-xs" 
      />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
      <!-- User List Table -->
      <div :class="[isFormOpen ? 'lg:col-span-3' : 'lg:col-span-4']" class="transition-all duration-500">
        <div class="bg-warm-white rounded-sm shadow-[8px_8px_0_var(--color-ink)] border-[3px] border-ink overflow-hidden flex flex-col">
          <div class="bg-cream border-b-[3px] border-ink p-4 px-6 flex justify-between items-center">
            <h3 class="font-bold text-ink text-sm flex items-center gap-2 uppercase tracking-widest">
              <UIcon name="i-heroicons-users" class="w-5 h-5 text-ink" />
              Database Records
            </h3>
          </div>
          
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-cream border-b-[3px] border-ink text-[10px] uppercase tracking-widest font-bold text-ink-soft">
                  <th class="px-6 py-4">ID</th>
                  <th class="px-6 py-4">Account Identity</th>
                  <th class="px-6 py-4">Role</th>
                  <th class="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y-[3px] divide-ink bg-warm-white font-bold">
                <!-- Loading State -->
                <tr v-if="pending">
                  <td colspan="4" class="px-6 py-24 text-center">
                    <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-ink mx-auto" />
                    <p class="mt-3 text-xs font-bold text-ink-soft uppercase tracking-widest">Fetching records...</p>
                  </td>
                </tr>

                <!-- Data Rows -->
                <tr v-for="user in users" :key="user.id" class="hover:bg-gold/10 group transition-colors">
                  <td class="px-6 py-5 font-mono text-[11px] font-bold text-ink-soft">#{{ user.id }}</td>
                  <td class="px-6 py-5">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-sm bg-cream border-[2px] border-ink shadow-[2px_2px_0_var(--color-ink)] flex items-center justify-center text-ink shrink-0 font-bold uppercase text-sm">
                         {{ user.name?.[0] || user.email?.[0] || 'U' }}
                      </div>
                      <div class="flex flex-col">
                         <span class="font-bold text-ink text-sm">{{ user.name || (user.email ? user.email.split('@')[0] : 'Member') }}</span>
                         <span class="font-bold text-ink-soft text-[11px]">{{ user.email || 'No email provided' }}</span>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-5">
                    <UBadge 
                      :color="user.role === 'superadmin' ? 'error' : (user.role === 'admin' ? 'primary' : 'neutral')" 
                      variant="solid" 
                      class="uppercase text-[10px] font-bold px-2 py-0.5 rounded-sm border-[2px] border-ink shadow-[2px_2px_0_var(--color-ink)]"
                      :class="{ 'bg-coral': user.role === 'superadmin', 'bg-teal': user.role === 'admin', 'bg-cream text-ink': user.role === 'user' }"
                    >
                      {{ user.role }}
                    </UBadge>
                  </td>
                  <td class="px-6 py-5">
                    <div class="flex gap-2">
                       <UButton v-if="canEdit(user)" icon="i-heroicons-pencil-square" variant="ghost" color="neutral" class="text-ink-soft hover:text-teal hover:bg-transparent" size="md" @click="onEdit(user)" />
                      <UButton v-if="canDelete(user)" icon="i-heroicons-trash" variant="ghost" color="error" class="text-ink-soft hover:text-coral hover:bg-transparent" size="md" @click="onDelete(user.id)" />
                    </div>
                  </td>
                </tr>

                <!-- Empty State -->
                <tr v-if="!pending && users.length === 0">
                  <td colspan="4" class="px-6 py-32 text-center">
                    <div class="w-20 h-20 bg-warm-white border-[3px] border-ink shadow-[4px_4px_0_var(--color-ink)] rounded-sm flex items-center justify-center mx-auto mb-4">
                      <UIcon name="i-heroicons-circle-stack" class="w-10 h-10 text-ink opacity-40" />
                    </div>
                    <p class="text-ink-soft font-bold text-sm tracking-wide">The personnel database is currently empty.</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Registration Form (Side Panel) -->
      <div v-if="isFormOpen" class="lg:col-span-1 animate-in slide-in-from-right duration-500">
        <div class="bg-warm-white rounded-sm shadow-[8px_8px_0_var(--color-ink)] border-[3px] border-ink overflow-hidden flex flex-col relative top-0 sticky">
          <div class="bg-gold/50 border-b-[3px] border-ink p-4 px-6 flex justify-between items-center">
            <span class="text-sm font-bold text-ink uppercase tracking-widest flex items-center gap-2">
              <UIcon :name="isEditing ? 'i-heroicons-pencil-square' : 'i-heroicons-user-plus'" class="w-5 h-5 text-ink" />
              {{ isEditing ? 'Edit Profile' : 'Register Member' }}
            </span>
            <UButton icon="i-heroicons-x-mark" variant="ghost" color="neutral" size="sm" @click="resetForm()" class="text-ink hover:text-coral hover:bg-transparent p-0" />
          </div>
          
          <div class="p-6 space-y-6">
            <UForm :state="form" class="space-y-6 font-bold text-ink [&_label]:text-ink [&_label]:font-bold [&_label]:text-sm [&_label]:tracking-wide [&_label]:mb-1.5" @submit="onSubmit">
              <UFormField label="Email Identity">
                <UInput v-model="form.email" placeholder="name@company.com" size="lg" class="w-full" :ui="{ base: 'shadow-[2px_2px_0_var(--color-ink)] border-[2px] border-ink rounded-sm bg-white font-bold text-ink placeholder:text-ink-soft' }" />
              </UFormField>
              
              <UFormField :label="isEditing ? 'Reset Access Key (Optional)' : 'Access Key (Password)'">
                <UInput v-model="form.password" type="password" placeholder="••••••••" size="lg" class="w-full" :ui="{ base: 'shadow-[2px_2px_0_var(--color-ink)] border-[2px] border-ink rounded-sm bg-white font-bold text-ink placeholder:text-ink-soft' }" />
              </UFormField>
              
              <UFormField label="System Privilege">
                <select 
                  v-model="form.role" 
                  class="w-full bg-white shadow-[2px_2px_0_var(--color-ink)] border-[2px] border-ink text-ink rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-0 transition-all font-bold"
                >
                  <option v-for="r in availableRoles" :key="r.value" :value="r.value" class="font-bold">
                    {{ r.label }}
                  </option>
                </select>
              </UFormField>

              <div class="pt-6 border-t-[3px] border-ink">
                <UButton type="submit" block size="lg" :loading="loading" class="bg-coral hover:bg-coral-dark text-ink font-bold shadow-[4px_4px_0_var(--color-ink)] border-[3px] border-ink rounded-sm py-4 text-xs tracking-widest uppercase transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_var(--color-ink)]">
                  {{ isEditing ? 'Update Records' : 'Confirm Registration' }}
                </UButton>
              </div>
            </UForm>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
