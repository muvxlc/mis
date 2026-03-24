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

// ฟังก์ชันดึงข้อมูลแบบเน้นความชัวร์
const loadData = async () => {
  pending.value = true;
  try {
    const data = await $fetch('/api/admin/users');
    users.value = Array.isArray(data) ? data : [];
    console.log('Client-side data received:', users.value);
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
  form.password = ''; // Clear for optional reset password
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
  <div class="py-12 px-6 max-w-7xl mx-auto space-y-10 font-sans text-brand-primary">
    <!-- Header -->
    <div class="flex justify-between items-end border-b border-slate-200 pb-6">
      <div class="space-y-1">
        <h1 class="text-4xl font-serif">User Management</h1>
        <p class="text-slate-500 uppercase tracking-widest text-[10px] font-bold">MIS Administration Terminal</p>
      </div>
      <UButton 
        v-if="!isFormOpen"
        icon="i-heroicons-user-plus" 
        label="Add User" 
        @click="isFormOpen = true" 
        class="bg-brand-primary text-white font-bold px-6 shadow-lg hover:bg-slate-800" 
      />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-10 items-start">
      <!-- User List Table (Manual Construction) -->
      <div :class="[isFormOpen ? 'lg:col-span-3' : 'lg:col-span-4']" class="transition-all duration-500">
        <div class="mac-window bg-white shadow-2xl border border-slate-200">
          <div class="mac-title-bar flex justify-between px-4">
            <div class="flex gap-1.5">
              <div class="mac-dot mac-dot-red" />
              <div class="mac-dot mac-dot-yellow" />
              <div class="mac-dot mac-dot-green" />
            </div>
            <span class="text-[10px] text-white/40 font-mono tracking-widest uppercase">Database_Records</span>
          </div>
          
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-50 border-b border-slate-100 text-[11px] uppercase tracking-wider font-bold text-slate-400">
                  <th class="px-6 py-4">ID</th>
                  <th class="px-6 py-4">Email Address</th>
                  <th class="px-6 py-4">Role</th>
                  <th class="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50">
                <!-- Loading State -->
                <tr v-if="pending">
                  <td colspan="4" class="px-6 py-20 text-center">
                    <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-brand-accent mx-auto" />
                    <p class="mt-2 text-sm text-slate-400">Fetching records...</p>
                  </td>
                </tr>

                <!-- Data Rows -->
                <tr v-for="user in users" :key="user.id" class="hover:bg-slate-50/50 transition-colors group">
                  <td class="px-6 py-4 font-mono text-xs text-slate-400">#{{ user.id }}</td>
                  <td class="px-6 py-4">
                    <span class="font-bold text-brand-primary">{{ user.email }}</span>
                  </td>
                  <td class="px-6 py-4">
                    <UBadge 
                      :color="user.role === 'superadmin' ? 'error' : (user.role === 'admin' ? 'primary' : 'neutral')" 
                      variant="soft" 
                      class="uppercase text-[9px] font-black px-2 py-0.5"
                    >
                      {{ user.role }}
                    </UBadge>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex gap-2">
                       <UButton v-if="canEdit(user)" icon="i-heroicons-pencil-square" variant="ghost" color="neutral" size="sm" @click="onEdit(user)" />
                      <UButton v-if="canDelete(user)" icon="i-heroicons-trash" variant="ghost" color="error" size="sm" @click="onDelete(user.id)" />
                    </div>
                  </td>
                </tr>

                <!-- Empty State -->
                <tr v-if="!pending && users.length === 0">
                  <td colspan="4" class="px-6 py-32 text-center">
                    <UIcon name="i-heroicons-circle-stack" class="w-12 h-12 text-slate-100 mx-auto" />
                    <p class="text-slate-300 font-serif italic">The personnel database is currently empty.</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Registration Form (Side Panel) -->
      <div v-if="isFormOpen" class="lg:col-span-1 animate-in slide-in-from-right duration-500">
        <div class="mac-window border-brand-accent shadow-2xl overflow-hidden bg-white">
          <div class="mac-title-bar bg-brand-accent px-4 py-2 flex justify-between items-center">
            <span class="text-[10px] text-brand-primary font-black uppercase tracking-widest">
              {{ isEditing ? 'Edit Profile' : 'Register Member' }}
            </span>
            <UButton icon="i-heroicons-x-mark" variant="ghost" color="neutral" size="xs" @click="resetForm()" />
          </div>
          <div class="p-8 space-y-6">
            <UForm :state="form" class="space-y-5" @submit="onSubmit">
              <UFormField label="Email Identity">
                <UInput v-model="form.email" placeholder="name@company.com" size="lg" class="w-full bg-slate-50" />
              </UFormField>
              
              <UFormField :label="isEditing ? 'Reset Access Key (Optional)' : 'Access Key (Password)'">
                <UInput v-model="form.password" type="password" placeholder="••••••••" size="lg" class="w-full bg-slate-50" />
              </UFormField>
              
              <UFormField label="System Privilege">
                <select 
                  v-model="form.role" 
                  class="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all shadow-sm"
                >
                  <option v-for="r in availableRoles" :key="r.value" :value="r.value">
                    {{ r.label }}
                  </option>
                </select>
              </UFormField>

              <div class="pt-6">
                <UButton type="submit" block size="xl" :loading="loading" class="bg-brand-primary text-white font-bold shadow-lg shadow-brand-primary/20 hover:bg-slate-800">
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
