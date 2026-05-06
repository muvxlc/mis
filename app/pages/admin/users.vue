<script setup lang="ts">
definePageMeta({
  middleware: 'admin'
});

const theme = useCookie('app-theme');
const isModern = computed(() => theme.value === 'modern');

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
  <div :class="[isModern ? 'p-8 space-y-8' : 'py-10 px-6 space-y-10 font-sans text-ink', 'max-w-7xl mx-auto transition-all']">
    <!-- Header -->
    <div :class="[isModern ? 'border-slate-200 dark:border-slate-800' : 'border-ink', 'flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b-[3px]']">
      <div class="space-y-2">
        <h1 :class="[isModern ? 'text-slate-900 dark:text-white' : 'text-ink', 'text-4xl md:text-5xl font-display font-bold tracking-tight']">User Management</h1>
        <p :class="[isModern ? 'text-slate-500 dark:text-slate-400' : 'text-ink-soft bg-warm-white border-[2px] border-ink shadow-[2px_2px_0_var(--color-ink)] px-3 py-1 rounded-sm mt-2', 'font-bold tracking-wide text-sm inline-block']">MIS Administration Terminal</p>
      </div>
      <UButton 
        v-if="!isFormOpen"
        icon="i-heroicons-user-plus" 
        label="Add User" 
        @click="isFormOpen = true" 
        :class="[
          isModern ? 'bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/20' : 'bg-teal hover:bg-teal-dark text-ink border-[3px] border-ink rounded-sm shadow-[4px_4px_0_var(--color-ink)]',
          'font-bold px-6 py-3 transition-all uppercase tracking-wider text-xs'
        ]" 
      />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
      <!-- User List Table -->
      <div :class="[isFormOpen ? 'lg:col-span-3' : 'lg:col-span-4']" class="transition-all duration-500">
        <div :class="[
          isModern ? 'bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm' : 'bg-warm-white rounded-sm border-[3px] border-ink shadow-[8px_8px_0_var(--color-ink)]',
          'overflow-hidden flex flex-col'
        ]">
          <div :class="[isModern ? 'border-slate-100 dark:border-slate-800' : 'bg-cream border-b-[3px] border-ink', 'p-4 px-6 border-b flex justify-between items-center']">
            <h3 :class="[isModern ? 'text-slate-700 dark:text-slate-200' : 'text-ink', 'font-bold text-sm flex items-center gap-2 uppercase tracking-widest']">
              <UIcon name="i-heroicons-users" class="w-5 h-5" />
              Database Records
            </h3>
          </div>
          
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr :class="[isModern ? 'bg-slate-50 dark:bg-slate-800/50 text-slate-500' : 'bg-cream border-b-[3px] border-ink text-ink-soft', 'text-[10px] uppercase tracking-widest font-bold']">
                  <th class="px-6 py-4">ID</th>
                  <th class="px-6 py-4">Account Identity</th>
                  <th class="px-6 py-4">Role</th>
                  <th class="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody :class="[isModern ? 'divide-y dark:divide-slate-800' : 'divide-y-[3px] divide-ink bg-warm-white font-bold']">
                <tr v-if="pending">
                  <td colspan="4" class="px-6 py-24 text-center">
                    <UIcon name="i-heroicons-arrow-path" :class="[isModern ? 'text-blue-500' : 'text-ink', 'w-8 h-8 animate-spin mx-auto']" />
                    <p class="mt-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Fetching records...</p>
                  </td>
                </tr>

                <tr v-for="user in users" :key="user.id" :class="[isModern ? 'hover:bg-slate-50 dark:hover:bg-slate-800/30' : 'hover:bg-gold/10', 'group transition-colors']">
                  <td class="px-6 py-5 font-mono text-[11px] font-bold text-slate-400">#{{ user.id }}</td>
                  <td class="px-6 py-5">
                    <div class="flex items-center gap-3">
                      <div :class="[
                        isModern ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg' : 'bg-cream border-[2px] border-ink shadow-[2px_2px_0_var(--color-ink)] rounded-sm',
                        'w-10 h-10 flex items-center justify-center shrink-0 font-bold uppercase text-sm transition-all'
                      ]">
                         {{ user.name?.[0] || user.email?.[0] || 'U' }}
                      </div>
                      <div class="flex flex-col">
                         <span :class="[isModern ? 'text-slate-900 dark:text-white' : 'text-ink', 'font-bold text-sm']">{{ user.name || (user.email ? user.email.split('@')[0] : 'Member') }}</span>
                         <span class="text-slate-400 dark:text-slate-500 text-[11px] font-medium">{{ user.email || 'No email provided' }}</span>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-5">
                    <UBadge 
                      size="sm"
                      :variant="isModern ? 'soft' : 'solid'" 
                      :color="user.role === 'superadmin' ? 'rose' : (user.role === 'admin' ? 'blue' : 'neutral')" 
                      :class="[
                        isModern ? 'rounded-full font-semibold px-2.5 py-0.5' : 'uppercase text-[10px] font-bold px-2 py-0.5 rounded-sm border-[2px] border-ink shadow-[2px_2px_0_var(--color-ink)]',
                        !isModern && (user.role === 'superadmin' ? 'bg-coral' : (user.role === 'admin' ? 'bg-teal' : 'bg-cream text-ink'))
                      ]"
                    >
                      {{ user.role }}
                    </UBadge>
                  </td>
                  <td class="px-6 py-5 text-right">
                    <div class="flex justify-end gap-1">
                       <UButton v-if="canEdit(user)" icon="i-heroicons-pencil-square" variant="ghost" color="neutral" :class="[isModern ? 'hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-400 hover:text-blue-600' : 'text-ink-soft hover:text-teal hover:bg-transparent']" size="sm" @click="onEdit(user)" />
                      <UButton v-if="canDelete(user)" icon="i-heroicons-trash" variant="ghost" color="error" :class="[isModern ? 'hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-400 hover:text-rose-600' : 'text-ink-soft hover:text-coral hover:bg-transparent']" size="sm" @click="onDelete(user.id)" />
                    </div>
                  </td>
                </tr>

                <tr v-if="!pending && users.length === 0">
                  <td colspan="4" class="px-6 py-32 text-center text-slate-400">
                    <UIcon name="i-heroicons-circle-stack" class="w-12 h-12 opacity-20 mx-auto mb-4" />
                    <p class="font-bold text-sm tracking-wide">The personnel database is currently empty.</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Registration Form -->
      <div v-if="isFormOpen" class="lg:col-span-1">
        <div :class="[
          isModern ? 'bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl' : 'bg-warm-white rounded-sm border-[3px] border-ink shadow-[8px_8px_0_var(--color-ink)]',
          'overflow-hidden flex flex-col transition-all'
        ]">
          <div :class="[isModern ? 'bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800' : 'bg-gold/50 border-b-[3px] border-ink', 'p-4 px-6 flex justify-between items-center']">
            <span :class="[isModern ? 'text-slate-900 dark:text-white' : 'text-ink', 'text-sm font-bold uppercase tracking-widest flex items-center gap-2']">
              <UIcon :name="isEditing ? 'i-heroicons-pencil-square' : 'i-heroicons-user-plus'" class="w-5 h-5" />
              {{ isEditing ? 'Edit Profile' : 'Register Member' }}
            </span>
            <UButton icon="i-heroicons-x-mark" variant="ghost" color="neutral" size="sm" @click="resetForm()" :class="[isModern ? '' : 'text-ink hover:text-coral hover:bg-transparent p-0']" />
          </div>
          
          <div class="p-6">
            <UForm :state="form" class="space-y-6" @submit="onSubmit">
              <UFormField label="Email Identity">
                <UInput v-model="form.email" placeholder="name@company.com" size="lg" class="w-full" :ui="{ base: isModern ? 'rounded-lg' : 'shadow-[2px_2px_0_var(--color-ink)] border-[2px] border-ink rounded-sm bg-white font-bold text-ink' }" />
              </UFormField>
              
              <UFormField :label="isEditing ? 'Reset Access Key (Optional)' : 'Access Key (Password)'">
                <UInput v-model="form.password" type="password" placeholder="••••••••" size="lg" class="w-full" :ui="{ base: isModern ? 'rounded-lg' : 'shadow-[2px_2px_0_var(--color-ink)] border-[2px] border-ink rounded-sm bg-white font-bold text-ink' }" />
              </UFormField>
              
              <UFormField label="System Privilege">
                <select 
                  v-model="form.role" 
                  :class="[
                    isModern ? 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg' : 'bg-white shadow-[2px_2px_0_var(--color-ink)] border-[2px] border-ink rounded-sm font-bold',
                    'w-full text-ink dark:text-white px-4 py-3 text-sm focus:outline-none transition-all'
                  ]"
                >
                  <option v-for="r in availableRoles" :key="r.value" :value="r.value">
                    {{ r.label }}
                  </option>
                </select>
              </UFormField>

              <div :class="[isModern ? 'pt-4' : 'pt-6 border-t-[3px] border-ink']">
                <UButton type="submit" block size="lg" :loading="loading" :class="[
                  isModern ? 'bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/30' : 'bg-coral hover:bg-coral-dark text-ink font-bold shadow-[4px_4px_0_var(--color-ink)] border-[3px] border-ink rounded-sm',
                  'py-4 text-xs tracking-widest uppercase transition-all'
                ]">
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
