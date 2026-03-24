<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
});

const { user } = useUserSession();
const { data: qrcodes } = await useFetch('/api/qrcodes');

// Mock statistics for the MIS dashboard
const stats = computed(() => [
  { label: 'Total Assets', value: qrcodes.value?.length || 0, icon: 'i-heroicons-cube', color: 'text-brand-accent' },
  { label: 'Active Users', value: '1,284', icon: 'i-heroicons-users', color: 'text-blue-500' },
  { label: 'System Uptime', value: '99.9%', icon: 'i-heroicons-check-circle', color: 'text-green-500' },
  { label: 'Security Score', value: 'A+', icon: 'i-heroicons-shield-check', color: 'text-brand-accent' }
]);

const recentActivities = [
  { id: 1, user: 'System', action: 'Database Backup', time: '2 hours ago', status: 'Completed' },
  { id: 2, user: 'Admin', action: 'User Permissions Updated', time: '5 hours ago', status: 'Pending' },
  { id: 3, user: 'Bot', action: 'Security Audit', time: '1 day ago', status: 'Completed' }
];
</script>

<template>
  <div class="space-y-10 py-8 px-6 max-w-7xl mx-auto">
    <!-- Welcome Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div class="space-y-1">
        <h1 class="text-4xl font-serif text-brand-primary">Welcome, {{ user?.email.split('@')[0] }}</h1>
        <p class="text-slate-500 font-sans">MIS Dashboard & Strategic Overview</p>
      </div>
      <div class="flex gap-3">
        <UButton to="/dashboard/create" icon="i-heroicons-plus" class="bg-brand-primary text-white hover:bg-slate-800 px-6 py-2.5 rounded-lg shadow-lg">
          New Asset
        </UButton>
      </div>
    </div>

    <!-- Metrics Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div v-for="stat in stats" :key="stat.label" class="mac-window bg-white group hover:border-brand-accent transition-all duration-300">
        <div class="p-6 space-y-4">
          <div class="flex justify-between items-start">
             <div :class="['p-3 rounded-xl bg-slate-50 group-hover:bg-brand-accent/10 transition-colors', stat.color]">
               <UIcon :name="stat.icon" class="w-6 h-6" />
             </div>
          </div>
          <div>
            <span class="text-xs uppercase tracking-widest text-slate-400 font-bold">{{ stat.label }}</span>
            <div class="text-3xl font-serif text-brand-primary mt-1">{{ stat.value }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
      <!-- Main Content Area -->
      <div class="lg:col-span-2 space-y-6">
        <div class="mac-window overflow-hidden">
          <div class="mac-title-bar">
            <div class="mac-dot mac-dot-red" />
            <div class="mac-dot mac-dot-yellow" />
            <div class="mac-dot mac-dot-green" />
            <span class="ml-4 text-xs text-white/50 font-sans tracking-widest uppercase">Asset Management</span>
          </div>
          <div class="p-0">
            <UTable :rows="qrcodes || []" :columns="[{ id: 'id', accessorKey: 'id', header: 'ID' }, { id: 'type', accessorKey: 'type', header: 'Type' }, { id: 'originalUrl', accessorKey: 'originalUrl', header: 'Destination' }, { id: 'createdAt', accessorKey: 'createdAt', header: 'Date' }]" class="w-full">
              <template #type-cell="{ row }">
                <UBadge :color="row.original.type === 'dynamic' ? 'primary' : 'gray'" variant="soft" class="uppercase text-[10px] font-bold">
                  {{ row.original.type }}
                </UBadge>
              </template>
              <template #createdAt-cell="{ row }">
                <span class="text-slate-400 text-xs">{{ new Date(row.original.createdAt).toLocaleDateString() }}</span>
              </template>
            </UTable>
            <div v-if="!qrcodes?.length" class="p-12 text-center text-slate-400 font-sans italic">
              No assets found in the system database.
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar / Secondary Data -->
      <div class="space-y-6">
        <div class="mac-window">
          <div class="mac-title-bar">
            <span class="text-xs text-white/70 font-sans tracking-widest uppercase px-4">System Activity</span>
          </div>
          <div class="p-6 space-y-6">
            <div v-for="activity in recentActivities" :key="activity.id" class="flex gap-4">
              <div class="w-2 h-2 rounded-full mt-1.5" :class="activity.status === 'Completed' ? 'bg-green-500' : 'bg-brand-accent'" />
              <div class="space-y-1">
                <p class="text-sm font-bold text-brand-primary">{{ activity.action }}</p>
                <p class="text-xs text-slate-400">{{ activity.user }} • {{ activity.time }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-brand-primary rounded-2xl p-8 text-white space-y-4 shadow-xl relative overflow-hidden group">
          <div class="relative z-10">
            <h3 class="text-xl font-serif">Need Help?</h3>
            <p class="text-white/60 text-sm">Access the MIS knowledge base or contact system administrators.</p>
            <UButton color="white" variant="link" class="p-0 mt-4 text-brand-accent font-bold" icon="i-heroicons-arrow-right">Read Documentation</UButton>
          </div>
          <UIcon name="i-heroicons-academic-cap" class="absolute -right-4 -bottom-4 w-32 h-32 text-white/5 rotate-12 group-hover:scale-110 transition-transform duration-500" />
        </div>
      </div>
    </div>
  </div>
</template>
