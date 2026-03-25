<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
});

const { user } = useUserSession();
const { data: qrcodes } = await useFetch('/api/qrcodes');
const { data: dashboardStats, refresh: refreshStats } = await useFetch<any>('/api/dashboard/stats');
const { data: onlineUsers, refresh: refreshOnlineUsers } = await useFetch('/api/dashboard/online-users', { immediate: false });

const isOnlineUsersModalOpen = ref(false);

function closeOnlineUsersModal() {
  isOnlineUsersModalOpen.value = false;
}

async function openOnlineUsersModal() {
  await refreshOnlineUsers();
  isOnlineUsersModalOpen.value = true;
}

const stats = computed(() => [
  { label: 'Total Visit', value: dashboardStats.value?.totalVisit ?? '0', icon: 'i-heroicons-calendar-days' },
  { label: 'Active Users', value: dashboardStats.value?.activeUsers ?? '0', icon: 'i-heroicons-users', clickable: true },
  { label: 'System Uptime', value: dashboardStats.value?.systemUptime ?? '99.9%', icon: 'i-heroicons-check-circle' },
  { label: 'Security Score', value: dashboardStats.value?.securityScore ?? 'A+', icon: 'i-heroicons-shield-check' }
]);

const recentActivities = computed(() => {
  if (dashboardStats.value?.recentActivity && (dashboardStats.value.recentActivity as any[]).length > 0) {
    return dashboardStats.value.recentActivity;
  }
  return [
    { id: 1, user: 'System', action: 'Database Backup', time: '2 hours ago', status: 'Completed' },
    { id: 2, user: 'Admin', action: 'User Permissions Updated', time: '5 hours ago', status: 'Pending' },
    { id: 3, user: 'Bot', action: 'Security Audit', time: '1 day ago', status: 'Completed' }
  ];
});

const getColorForType = (type: string) => {
  const colors: Record<string, string> = {
    'UCS': 'bg-teal',
    'WEL': 'bg-gold',
    'SSS': 'bg-coral',
    'OFC': 'bg-cream',
    'LGO': 'bg-ink'
  };
  return colors[type] || 'bg-teal';
};

const getPath = (data: any[], height: number) => {
  if (!data?.length) return '';
  const max = Math.max(...data.map(d => d.total));
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 1000;
    const y = height - (d.total / max) * 250;
    return `${x},${y}`;
  });
  return `M ${points.join(' L ')}`;
};
</script>

<template>
  <div class="space-y-10 py-10 px-6 max-w-7xl mx-auto font-sans text-ink">
    <!-- Welcome Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b-[3px] border-ink">
      <div class="space-y-2">
        <h1 class="text-4xl md:text-5xl font-display font-bold text-ink tracking-tight drop-shadow-sm">Welcome back, {{ (user as any)?.name || (user as any)?.email?.split('@')[0] || 'User' }}</h1>
        <p class="text-ink-soft font-bold tracking-wide text-sm bg-warm-white border-[2px] border-ink shadow-[2px_2px_0_var(--color-ink)] inline-block px-3 py-1 rounded-sm mt-2">Overview of your management information system</p>
      </div>
      <div class="flex gap-3 mt-4 md:mt-0">
        <UButton to="/dashboard/create" icon="i-heroicons-plus" class="bg-teal border-[3px] border-ink text-ink hover:bg-teal-dark px-6 py-3 rounded-sm shadow-[4px_4px_0_var(--color-ink)] font-bold transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_var(--color-ink)] uppercase tracking-wider text-xs">
          New Asset
        </UButton>
      </div>
    </div>

    <!-- Metrics Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div v-for="stat in stats" :key="stat.label" 
          @click="stat.clickable ? openOnlineUsersModal() : null"
          class="bg-warm-white rounded-sm p-6 border-[3px] border-ink shadow-[6px_6px_0_var(--color-ink)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0_var(--color-ink)] transition-all duration-300 group"
          :class="stat.clickable ? 'cursor-pointer border-teal ring-2 ring-transparent hover:ring-teal active:scale-95' : 'cursor-default'">
        <div class="flex justify-between items-start mb-4">
           <div class="p-3 rounded-sm bg-cream border-[2px] border-ink text-ink group-hover:bg-gold transition-colors shadow-[2px_2px_0_var(--color-ink)]">
             <UIcon :name="stat.icon" class="w-6 h-6 stroke-[2px]" />
           </div>
           <div v-if="stat.clickable" class="text-[10px] bg-teal font-bold px-2 py-1 border-[2px] border-ink rounded-sm shadow-[2px_2px_0_var(--color-ink)] uppercase">Click to view</div>
        </div>
        <div>
          <span class="text-[10px] uppercase tracking-widest text-ink-soft font-bold mb-1 block">{{ stat.label }}</span>
          <div class="text-4xl font-display font-bold text-ink tracking-tight drop-shadow-[1px_1px_0_var(--color-teal)]">{{ stat.value }}</div>
        </div>
      </div>
    </div>

    <!-- Online Users Modal -->
    <UModal v-model:open="isOnlineUsersModalOpen" title="Active Online Users" description="Live logged-in users list" :ui="{ content: 'bg-transparent sm:max-w-4xl border-0 shadow-none ring-0' }">
      <template #content>
        <div class="p-1 border-[4px] border-ink shadow-[12px_12px_0_var(--color-ink)] bg-warm-white">
          <div class="bg-cream border-b-[4px] border-ink p-4 flex justify-between items-center">
             <div class="space-y-1">
               <h3 class="font-display font-bold text-xl uppercase tracking-tight">Active Online Users</h3>
               <p class="text-[10px] uppercase font-bold text-ink-soft">Live connection data</p>
             </div>
             <UButton color="neutral" variant="ghost" icon="i-heroicons-x-mark" @click="closeOnlineUsersModal" class="text-ink hover:bg-gold border-[2px] border-transparent hover:border-ink transition-all" />
          </div>
          <div class="p-6 max-h-[60vh] overflow-y-auto">
             <ul class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
               <li v-for="username in onlineUsers" :key="username" class="flex items-center gap-2 p-2 bg-white border-[2px] border-ink shadow-[3px_3px_0_var(--color-ink)] font-bold text-ink hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_var(--color-ink)] transition-all text-xs overflow-hidden text-ellipsis whitespace-nowrap">
                 <div class="w-2 h-2 rounded-full bg-teal animate-pulse border-[1px] border-ink shrink-0"></div>
                 {{ username }}
               </li>
             </ul>
             <div v-if="!onlineUsers?.length" class="text-center py-8 text-ink-soft font-bold uppercase tracking-widest text-sm italic">
               No active users found.
             </div>
          </div>
          <div class="bg-cream border-t-[4px] border-ink p-4 flex flex-col items-center gap-4">
             <p class="text-[10px] uppercase tracking-widest font-bold text-ink-soft">Displaying {{ onlineUsers?.length || 0 }} logged-in users</p>
             <UButton class="w-full bg-ink text-warm-white font-bold hover:bg-gold hover:text-ink border-[2px] border-ink transition-all uppercase tracking-widest text-xs py-3" @click="closeOnlineUsersModal">
               Close Details
             </UButton>
          </div>
        </div>
      </template>
    </UModal>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Main Content Area -->
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-warm-white rounded-sm shadow-[8px_8px_0_var(--color-ink)] border-[3px] border-ink overflow-hidden flex flex-col">
          <div class="bg-cream border-b-[3px] border-ink p-4 px-6 flex justify-between items-center">
            <h3 class="font-bold text-ink text-sm flex items-center gap-2 uppercase tracking-widest">
              <UIcon name="i-heroicons-presentation-chart-line" class="w-5 h-5 text-ink" />
              Visit Traffic Hourly (Today)
            </h3>
            <span class="text-[10px] font-bold uppercase tracking-widest text-ink-soft bg-white border-[2px] border-ink shadow-[2px_2px_0_var(--color-ink)] px-2 py-0.5">Live Traffic</span>
          </div>
          <div class="p-8 flex-1 bg-warm-white">
            <div v-if="dashboardStats?.hourlyVisits?.length" class="h-64 relative group">
              <!-- Simple SVG Line Graph -->
              <svg viewBox="0 0 1000 300" class="w-full h-full preserve-3d" preserveAspectRatio="none">
                <!-- Drop Shadow Path for Line -->
                <path 
                  :d="getPath(dashboardStats.hourlyVisits, 305)" 
                  fill="none" 
                  stroke="var(--color-ink)" 
                  stroke-width="8" 
                  stroke-linejoin="round"
                  class="opacity-10 translate-x-[4px] translate-y-[4px]"
                />
                <!-- Main Line Path -->
                <path 
                  :d="getPath(dashboardStats.hourlyVisits, 300)" 
                  fill="none" 
                  stroke="var(--color-teal)" 
                  stroke-width="4" 
                  stroke-linejoin="round"
                  class="transition-all duration-1000 ease-out"
                />
                <!-- Data Points -->
                <g v-for="(point, index) in dashboardStats.hourlyVisits" :key="index">
                   <circle 
                      :cx="(index / (dashboardStats.hourlyVisits.length - 1)) * 1000" 
                      :cy="300 - (point.total / Math.max(...(dashboardStats.hourlyVisits as any[]).map(d => d.total))) * 250" 
                      r="6" 
                      fill="var(--color-gold)"
                      stroke="var(--color-ink)"
                      stroke-width="2"
                      class="hover:scale-150 transition-transform cursor-pointer"
                   />
                </g>
              </svg>

              <!-- Labels Overlay -->
              <div class="absolute bottom-0 left-0 w-full flex justify-between px-1 translate-y-6">
                 <span v-for="point in dashboardStats.hourlyVisits" :key="point.hour" class="text-[8px] font-bold text-ink-soft uppercase">{{ point.hour }}:00</span>
              </div>
            </div>
            <div v-else class="p-16 flex flex-col items-center justify-center text-ink-soft space-y-4 bg-warm-white">
               <UIcon name="i-heroicons-presentation-chart-line" class="w-16 h-16 text-ink opacity-20" />
               <p class="font-bold text-sm tracking-wide">No hourly visit data found yet.</p>
            </div>
          </div>
        </div>

        <!-- Insurance Type Distribution (Secondary Chart) -->
        <div class="bg-warm-white rounded-sm shadow-[8px_8px_0_var(--color-ink)] border-[3px] border-ink overflow-hidden flex flex-col mt-6">
           <div class="bg-cream border-b-[3px] border-ink p-4 px-6 flex justify-between items-center">
            <h3 class="font-bold text-ink text-sm flex items-center gap-2 uppercase tracking-widest">
              <UIcon name="i-heroicons-squares-plus" class="w-5 h-5 text-ink" />
              Insurance Distribution
            </h3>
          </div>
          <div class="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
             <div v-for="item in dashboardStats?.visitDistribution" :key="item.pttype" 
                  class="p-4 border-[2px] border-ink bg-white shadow-[4px_4px_0_var(--color-ink)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_var(--color-ink)] transition-all">
                <div class="text-[9px] font-bold uppercase text-ink-soft mb-1">{{ item.pttype }}</div>
                <div class="text-xl font-display font-bold text-ink">{{ item.total_visits }}</div>
                <div class="w-full h-1 mt-2 bg-cream border-[1px] border-ink overflow-hidden">
                   <div :class="getColorForType(item.pttype)" :style="{ width: `${(item.total_visits / (dashboardStats.totalVisit as any)) * 100}%` }" class="h-full"></div>
                </div>
             </div>
          </div>
        </div>
      </div>

      <!-- Sidebar / Secondary Data -->
      <div class="space-y-6 flex flex-col">
        <div class="bg-warm-white rounded-sm shadow-[8px_8px_0_var(--color-ink)] border-[3px] border-ink overflow-hidden">
          <div class="bg-cream border-b-[3px] border-ink p-4 px-6">
            <h3 class="font-bold text-ink text-sm flex items-center gap-2 uppercase tracking-widest">
              <UIcon name="i-heroicons-bolt" class="w-5 h-5 text-ink" />
              Recent Activity
            </h3>
          </div>
          <div class="p-6 space-y-6">
            <div v-for="activity in recentActivities" :key="activity.id" class="flex gap-4 items-start">
              <div class="w-3 h-3 rounded-full mt-1 shrink-0 border-[2px] border-ink" :class="activity.status === 'Completed' ? 'bg-teal shadow-[2px_2px_0_var(--color-teal)]' : 'bg-gold shadow-[2px_2px_0_var(--color-gold)]'" />
              <div class="space-y-1 -mt-1">
                <p class="text-sm font-bold text-ink">{{ activity.action }}</p>
                <p class="text-[10px] uppercase tracking-widest font-bold text-ink-soft">{{ activity.user }} &middot; {{ activity.time }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-ink rounded-sm p-8 text-warm-white shadow-[8px_8px_0_var(--color-ink-soft)] relative overflow-hidden group border-[3px] border-ink mt-auto">
          <div class="absolute inset-0 bg-coral opacity-10"></div>
          <div class="relative z-10 space-y-4">
            <h3 class="text-2xl font-display font-bold tracking-tight drop-shadow-md">Need Help?</h3>
            <p class="text-cream text-sm font-bold leading-relaxed max-w-[90%]">Access the knowledge base or contact sysadmins for support.</p>
            <div class="pt-4">
              <UButton color="neutral" variant="link" class="p-0 text-teal hover:text-gold font-bold transition-colors uppercase tracking-widest text-xs" icon="i-heroicons-book-open">Read Docs</UButton>
            </div>
          </div>
          <UIcon name="i-heroicons-lifebuoy" class="absolute -right-6 -bottom-6 w-32 h-32 text-warm-white opacity-[0.05] group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500" />
        </div>
      </div>
    </div>
  </div>
</template>
