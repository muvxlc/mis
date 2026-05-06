<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
});

const theme = useCookie('app-theme');
const isModern = computed(() => theme.value === 'modern');

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
  <div :class="[isModern ? 'space-y-8 p-8' : 'space-y-10 py-10 px-6 font-sans text-ink', 'max-w-7xl mx-auto transition-all']">
    <!-- Welcome Header -->
    <div :class="[isModern ? 'border-slate-200 dark:border-slate-800' : 'border-ink', 'flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b-[3px]']">
      <div class="space-y-2">
        <h1 :class="[isModern ? 'text-slate-900 dark:text-white' : 'text-ink', 'text-4xl md:text-5xl font-display font-bold tracking-tight']">Welcome back, {{ (user as any)?.name || (user as any)?.email?.split('@')[0] || 'User' }}</h1>
        <p :class="[isModern ? 'text-slate-500 dark:text-slate-400' : 'text-ink-soft bg-warm-white border-[2px] border-ink shadow-[2px_2px_0_var(--color-ink)] px-3 py-1 rounded-sm mt-2', 'font-bold tracking-wide text-sm inline-block']">Overview of your management information system</p>
      </div>
      <div class="flex gap-3 mt-4 md:mt-0">
        <UButton to="/dashboard/create" icon="i-heroicons-plus" :class="[
          isModern ? 'bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg' : 'bg-teal border-[3px] border-ink text-ink hover:bg-teal-dark rounded-sm shadow-[4px_4px_0_var(--color-ink)]',
          'px-6 py-3 font-bold transition-all uppercase tracking-wider text-xs'
        ]">
          New Asset
        </UButton>
      </div>
    </div>

    <!-- Metrics Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div v-for="stat in stats" :key="stat.label" 
          @click="stat.clickable ? openOnlineUsersModal() : null"
          :class="[
            isModern ? 'bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6' : 'bg-warm-white rounded-sm p-6 border-[3px] border-ink shadow-[6px_6px_0_var(--color-ink)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0_var(--color-ink)]',
            'transition-all duration-300 group',
            stat.clickable ? (isModern ? 'cursor-pointer hover:border-blue-500 ring-4 ring-transparent hover:ring-blue-500/10' : 'cursor-pointer border-teal ring-2 ring-transparent hover:ring-teal active:scale-95') : 'cursor-default'
          ]">
        <div class="flex justify-between items-start mb-4">
           <div :class="[
             isModern ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-2 rounded-lg' : 'p-3 rounded-sm bg-cream border-[2px] border-ink text-ink group-hover:bg-gold shadow-[2px_2px_0_var(--color-ink)]',
             'transition-colors'
           ]">
             <UIcon :name="stat.icon" class="w-6 h-6 stroke-[2px]" />
           </div>
           <div v-if="stat.clickable" :class="[isModern ? 'text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase' : 'text-[10px] bg-teal font-bold px-2 py-1 border-[2px] border-ink rounded-sm shadow-[2px_2px_0_var(--color-ink)] uppercase']">Click to view</div>
        </div>
        <div>
          <span :class="[isModern ? 'text-slate-400 dark:text-slate-500' : 'text-ink-soft', 'text-[10px] uppercase tracking-widest font-bold mb-1 block']">{{ stat.label }}</span>
          <div :class="[isModern ? 'text-slate-900 dark:text-white' : 'text-ink drop-shadow-[1px_1px_0_var(--color-teal)]', 'text-4xl font-display font-bold tracking-tight']">{{ stat.value }}</div>
        </div>
      </div>
    </div>

    <!-- Content Sections -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 space-y-8">
        <!-- Chart Area -->
        <div :class="[
          isModern ? 'bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm' : 'bg-warm-white border-[3px] border-ink rounded-sm shadow-[8px_8px_0_var(--color-ink)]',
          'overflow-hidden flex flex-col transition-all'
        ]">
          <div :class="[isModern ? 'border-slate-100 dark:border-slate-800' : 'bg-cream border-b-[3px] border-ink', 'p-4 px-6 border-b flex justify-between items-center']">
            <h3 :class="[isModern ? 'text-slate-700 dark:text-slate-200' : 'text-ink', 'font-bold text-sm flex items-center gap-2 uppercase tracking-widest']">
              <UIcon name="i-heroicons-presentation-chart-line" class="w-5 h-5" />
              Visit Traffic Hourly (Today)
            </h3>
            <span :class="[isModern ? 'text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase' : 'text-[10px] font-bold uppercase tracking-widest text-ink-soft bg-white border-[2px] border-ink shadow-[2px_2px_0_var(--color-ink)] px-2 py-0.5']">Live Traffic</span>
          </div>
          <div class="p-8 flex-1">
            <div v-if="dashboardStats?.hourlyVisits?.length" class="h-64 relative group">
              <svg viewBox="0 0 1000 300" class="w-full h-full" preserveAspectRatio="none">
                <path v-if="!isModern"
                  :d="getPath(dashboardStats.hourlyVisits, 305)" 
                  fill="none" 
                  stroke="var(--color-ink)" 
                  stroke-width="8" 
                  stroke-linejoin="round"
                  class="opacity-10 translate-x-[4px] translate-y-[4px]"
                />
                <path 
                  :d="getPath(dashboardStats.hourlyVisits, 300)" 
                  fill="none" 
                  :stroke="isModern ? 'currentColor' : 'var(--color-teal)'" 
                  stroke-width="4" 
                  stroke-linejoin="round"
                  :class="[isModern ? 'text-blue-600 dark:text-blue-400' : 'transition-all duration-1000 ease-out']"
                />
                <g v-for="(point, index) in dashboardStats.hourlyVisits" :key="index">
                   <circle 
                      :cx="((index as any) / ((dashboardStats.hourlyVisits as any[]).length - 1)) * 1000" 
                      :cy="300 - (point.total / Math.max(...(dashboardStats.hourlyVisits as any[]).map(d => d.total))) * 250" 
                      :r="isModern ? 4 : 6" 
                      :fill="isModern ? 'currentColor' : 'var(--color-gold)'"
                      :stroke="isModern ? 'white' : 'var(--color-ink)'"
                      stroke-width="2"
                      :class="[isModern ? 'text-blue-600 dark:text-blue-400' : 'hover:scale-150 transition-transform cursor-pointer']"
                   />
                </g>
              </svg>
              <div class="absolute bottom-0 left-0 w-full flex justify-between px-1 translate-y-6">
                 <span v-for="point in dashboardStats.hourlyVisits" :key="point.hour" class="text-[8px] font-bold text-slate-400 uppercase">{{ point.hour }}:00</span>
              </div>
            </div>
            <div v-else class="p-16 flex flex-col items-center justify-center text-slate-400 space-y-4">
               <UIcon name="i-heroicons-presentation-chart-line" class="w-16 h-16 opacity-20" />
               <p class="font-bold text-sm tracking-wide">No hourly visit data found yet.</p>
            </div>
          </div>
        </div>

        <!-- Insurance Distribution -->
        <div :class="[
          isModern ? 'bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm' : 'bg-warm-white border-[3px] border-ink rounded-sm shadow-[8px_8px_0_var(--color-ink)]',
          'overflow-hidden flex flex-col transition-all'
        ]">
           <div :class="[isModern ? 'border-slate-100 dark:border-slate-800' : 'bg-cream border-b-[3px] border-ink', 'p-4 px-6 border-b flex justify-between items-center']">
            <h2 :class="[isModern ? 'text-slate-700 dark:text-slate-200' : 'text-ink', 'font-bold text-sm flex items-center gap-2 uppercase tracking-widest']">
              <UIcon name="i-heroicons-square-3-stack-3d" class="w-5 h-5" />
              Insurance Traffic Distribution (Today)
            </h2>
          </div>
          <div class="p-8 space-y-6">
             <div v-for="(item, idx) in dashboardStats?.visitDistribution" :key="item.pttype" class="relative group">
                <div class="flex justify-between items-center mb-2">
                   <div class="flex items-center gap-3">
                      <span v-if="!isModern" class="text-[10px] font-bold text-ink-soft bg-white border-[2px] border-ink w-6 h-6 flex items-center justify-center shadow-[1px_1px_0_var(--color-ink)]">{{ (idx as number) + 1 }}</span>
                      <span :class="[isModern ? 'text-slate-700 dark:text-slate-300' : 'text-ink', 'text-sm font-bold uppercase tracking-wide']">{{ item.pttype }}</span>
                   </div>
                   <div class="flex items-baseline gap-2">
                      <span :class="[isModern ? 'text-slate-900 dark:text-white' : 'text-ink', 'text-lg font-display font-bold']">{{ item.total_visits }}</span>
                      <span class="text-[10px] font-bold text-slate-400 uppercase">Visits</span>
                   </div>
                </div>
                <div :class="[isModern ? 'bg-slate-100 dark:bg-slate-800 rounded-full' : 'bg-cream border-[3px] border-ink shadow-[4px_4px_0_var(--color-ink)]', 'h-4 w-full overflow-hidden transition-all']">
                   <div 
                      :class="[isModern ? 'bg-blue-500 rounded-full' : getColorForType(item.pttype), 'h-full transition-all duration-1000 ease-out']"
                      :style="{ width: `${(item.total_visits / ((dashboardStats.visitDistribution as any[])[0]?.total_visits || 1)) * 100}%` }"
                   ></div>
                </div>
             </div>
          </div>
        </div>
      </div>

      <!-- Activities Sidebar -->
      <div class="space-y-6">
        <div :class="[
          isModern ? 'bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm' : 'bg-warm-white border-[3px] border-ink rounded-sm shadow-[8px_8px_0_var(--color-ink)]',
          'overflow-hidden transition-all'
        ]">
          <div :class="[isModern ? 'border-slate-100 dark:border-slate-800' : 'bg-cream border-b-[3px] border-ink', 'p-4 px-6 border-b']">
            <h3 :class="[isModern ? 'text-slate-700 dark:text-slate-200' : 'text-ink', 'font-bold text-sm flex items-center gap-2 uppercase tracking-widest']">
              <UIcon name="i-heroicons-bolt" class="w-5 h-5" />
              Recent Activity
            </h3>
          </div>
          <div class="p-6 space-y-6">
            <div v-for="activity in recentActivities" :key="activity.id" class="flex gap-4 items-start group">
              <div :class="[
                isModern ? 'bg-blue-500' : (activity.status === 'Completed' ? 'bg-teal' : 'bg-gold'),
                'w-2 h-2 rounded-full mt-1.5 shrink-0 transition-all group-hover:scale-125'
              ]" />
              <div class="space-y-1">
                <p :class="[isModern ? 'text-slate-700 dark:text-slate-300' : 'text-ink', 'text-sm font-bold']">{{ activity.action }}</p>
                <p class="text-[10px] uppercase tracking-widest font-bold text-slate-400">{{ activity.user }} &middot; {{ activity.time }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
