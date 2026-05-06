<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';

definePageMeta({
  middleware: 'auth'
});

const theme = useCookie('app-theme');
const isModern = computed(() => theme.value === 'modern');

const today = new Date().toISOString().split('T')[0];
const startDate = ref(today);
const endDate = ref(today);
const loading = ref(true);
const stats = ref<any>(null);
const hourlyScreen = ref<any[]>([]);
const hourlyDoctor = ref<any[]>([]);
const traffic = ref<any[]>([]);
const error = ref('');

const title = 'ระยะเวลารอคอย (Waiting Time)';
const description = 'สรุปสถิติเฉลี่ยรายขั้นตอนของบริการ';

useHead({
  title: `${title} - M I S`,
  meta: [{ name: 'description', content: description }]
});

const fetchStats = async () => {
  loading.value = true;
  error.value = '';
  try {
    const response: any = await $fetch('/api/hosxp/waiting-time', {
      params: { 
        startDate: startDate.value, 
        endDate: endDate.value 
      }
    });
    stats.value = response.stats;
    hourlyScreen.value = response.hourly_screen || [];
    hourlyDoctor.value = response.hourly_doctor || [];
    traffic.value = response.traffic || [];
  } catch (err: any) {
    console.error('Failed to fetch waiting time stats:', err);
    error.value = err.data?.message || 'ไม่สามารถดึงข้อมูลระยะเวลารอคอยได้';
    stats.value = null;
    hourlyScreen.value = [];
    hourlyDoctor.value = [];
    traffic.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchStats();
});

const formatMinutes = (val: any) => {
  if (val === null || val === undefined) return '0.0';
  return parseFloat(val).toFixed(1);
};

const formatMmSs = (hms: string | null) => {
  if (!hms) return '00:00';
  const parts = hms.split(':');
  if (parts.length < 3) return hms;
  const h = parseInt(parts[0] || '0');
  const m = parseInt(parts[1] || '0');
  const s = parseInt(parts[2] || '0');
  const totalM = (h * 60) + m;
  return `${totalM.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const getProgressBarWidth = (sec: number | string | null, max: number = 30) => {
  const val = typeof sec === 'string' ? parseFloat(sec) : sec || 0;
  return Math.min(100, (val / max) * 100) + '%';
};

const getMaxWait = (data: any[]) => {
  if (!data.length) return 60;
  const highest = Math.max(...data.map(h => parseFloat(h.max_wait_minutes)));
  return Math.max(60, Math.ceil(highest / 30) * 30);
};

const getMaxPatients = (data: any[]) => {
  if (!data.length) return 25;
  const highest = Math.max(...data.map(h => Number(h.patient_count)));
  return Math.max(25, Math.ceil(highest / 25) * 25);
};

const maxWaitScreen = computed(() => getMaxWait(hourlyScreen.value));
const maxPatientsScreen = computed(() => getMaxPatients(hourlyScreen.value));

const maxWaitDoctor = computed(() => getMaxWait(hourlyDoctor.value));
const maxPatientsDoctor = computed(() => getMaxPatients(hourlyDoctor.value));

const timeSlots = [8, 9, 10, 11, 12, 13, 14, 15, 16];

const mapToSlots = (data: any[], keyName: string = 'visit_hour') => {
  return timeSlots.map(hour => {
    const existing = data.find(h => parseInt(h[keyName]) === hour);
    return existing || { [keyName]: hour, patient_count: 0, avg_wait_minutes: 0, max_wait_minutes: 0, total: 0 };
  });
};

const displayHourlyScreen = computed(() => mapToSlots(hourlyScreen.value));
const displayHourlyDoctor = computed(() => mapToSlots(hourlyDoctor.value));
const displayTraffic = computed(() => mapToSlots(traffic.value, 'hour'));

const maxTrafficTotal = computed(() => {
  if (!traffic.value.length) return 30;
  const highest = Math.max(...traffic.value.map(t => t.total));
  return Math.max(30, Math.ceil(highest / 10) * 10);
});
</script>

<template>
  <div :class="[isModern ? 'p-8 space-y-8' : 'p-4 space-y-8 font-sans', 'transition-all']">
    <!-- Header -->
    <header :class="[
      isModern ? 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-8' : 'bg-cream border-[3px] border-ink p-8 shadow-[8px_8px_0_var(--color-ink)]',
      'relative overflow-hidden transition-all'
    ]">
      <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div class="space-y-2">
          <div class="flex items-center gap-3">
             <div :class="[isModern ? 'bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20' : 'bg-teal p-2 border-[3px] border-ink shadow-[4px_4px_0_var(--color-ink)] rotate-[-2deg]']">
                <UIcon name="i-heroicons-clock" :class="[isModern ? 'text-white' : 'text-warm-white', 'w-6 h-6']" />
             </div>
             <h1 :class="[isModern ? 'text-slate-900 dark:text-white text-3xl font-bold' : 'text-3xl font-display font-black tracking-tight text-ink uppercase italic']">{{ title }}</h1>
          </div>
          <p :class="[isModern ? 'text-slate-500 dark:text-slate-400' : 'text-ink-soft bg-warm-white border-[2px] border-ink shadow-[2px_2px_0_var(--color-ink)] px-3 py-1 inline-block rounded-sm mt-2', 'font-bold text-sm']">{{ description }}</p>
        </div>
        
        <div :class="[
          isModern ? 'bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800' : 'bg-warm-white border-[3px] border-ink p-4 shadow-[4px_4px_0_var(--color-ink)]',
          'flex flex-col md:flex-row gap-4 items-end transition-all'
        ]">
           <div class="flex flex-col gap-1 w-full md:w-44">
              <label class="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">วันที่เริ่มต้น</label>
              <UInput v-model="startDate" type="date" size="lg" :ui="{ base: isModern ? 'rounded-lg' : 'font-bold border-[2px] border-ink rounded-none' }" />
           </div>
           <div class="flex flex-col gap-1 w-full md:w-44">
              <label class="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">วันที่สิ้นสุด</label>
              <UInput v-model="endDate" type="date" size="lg" :ui="{ base: isModern ? 'rounded-lg' : 'font-bold border-[2px] border-ink rounded-none' }" />
           </div>
           <UButton 
             icon="i-heroicons-arrow-path" 
             @click="fetchStats" 
             :loading="loading"
             :class="[
               isModern ? 'bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 h-[44px]' : 'bg-gold border-[3px] border-ink text-ink font-bold shadow-[4px_4px_0_var(--color-ink)] rounded-sm h-[48px] px-6',
               'transition-all'
             ]"
           >
             REFRESH
           </UButton>
        </div>
      </div>
    </header>

    <!-- Metrics Grid -->
    <div v-if="stats" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- เวลารวม -->
      <div :class="[
        isModern ? 'bg-slate-900 text-white rounded-2xl p-8 shadow-xl lg:col-span-2' : 'bg-ink border-[3px] border-ink p-6 shadow-[8px_8px_0_var(--color-gold)] lg:col-span-2',
        'flex flex-col gap-4 order-first transition-all'
      ]">
        <div>
           <span :class="[isModern ? 'bg-blue-500 text-white rounded-full' : 'bg-gold text-ink rounded-sm shadow-[2px_2px_0_var(--color-ink)]', 'text-xs uppercase font-black px-3 py-1 tracking-widest italic']">เวลารวมทั้งหมด (Total Time)</span>
        </div>
        <div class="flex items-baseline justify-between py-2">
           <div class="flex items-baseline gap-3">
              <span :class="[isModern ? 'text-white' : 'text-warm-white italic', 'text-7xl font-display font-black leading-none']">{{ formatMmSs(stats.total_all) }}</span>
              <span class="text-xl font-black text-blue-400 italic uppercase">นาที</span>
           </div>
           <span class="text-xl font-display font-black text-blue-400/30 italic leading-none">MM:SS</span>
        </div>
        <div :class="[isModern ? 'bg-white/10 rounded-full' : 'bg-warm-white/10 border-[2px] border-gold rounded-none', 'h-3 overflow-hidden mt-2']">
          <div class="h-full bg-blue-500 transition-all duration-1000" :style="{ width: getProgressBarWidth(stats.m_total_all, 120) }"></div>
        </div>
      </div>

      <!-- Step Metrics -->
      <div v-for="(step, i) in [
        { label: '1. รอซักประวัติ', val: stats.รอซักประวัติ, m_val: stats.m_wait_screen, color: 'text-teal-500', bg: 'bg-teal-500', max: 30 },
        { label: '2. ซักประวัติ', val: stats.ซักประวัติ, m_val: stats.m_screen, color: 'text-indigo-500', bg: 'bg-indigo-500', max: 15 },
        { label: '3. รอตรวจ', val: stats.รอตรวจ1, m_val: stats.m_wait_doc1, color: 'text-amber-500', bg: 'bg-amber-500', max: 60 },
        { label: '4. แพทย์ตรวจ', val: stats.แพทย์ตรวจ, m_val: stats.m_doc_time, color: 'text-emerald-500', bg: 'bg-emerald-500', max: 20 },
        { label: '5. รอรับยา', val: stats.รอรับยา, m_val: stats.m_wait_rx, color: 'text-orange-500', bg: 'bg-orange-500', max: 30 }
      ]" :key="i" :class="[
        isModern ? 'bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm' : 'bg-warm-white border-[3px] border-ink p-6 shadow-[8px_8px_0_var(--color-ink)]',
        'flex flex-col gap-4 transition-all'
      ]">
        <div>
           <span :class="[isModern ? 'text-slate-400 dark:text-slate-500' : 'bg-ink text-white shadow-[2px_2px_0_var(--color-teal)]', 'text-xs uppercase font-black px-2 py-0.5 tracking-widest italic rounded-sm']">{{ step.label }}</span>
        </div>
        <div class="flex items-baseline gap-2">
           <span :class="[isModern ? 'text-slate-900 dark:text-white' : 'text-ink italic', 'text-4xl font-display font-black leading-tight']">{{ formatMmSs(step.val) }}</span>
           <span class="text-sm font-black text-slate-400 uppercase italic">นาที</span>
        </div>
        <div :class="[isModern ? 'bg-slate-100 dark:bg-slate-800 rounded-full' : 'bg-cream border-[2px] border-ink rounded-none', 'h-2 overflow-hidden']">
          <div :class="[step.bg, 'h-full transition-all duration-1000']" :style="{ width: getProgressBarWidth(step.m_val, step.max) }"></div>
        </div>
      </div>
    </div>

    <!-- Analytics Section -->
    <div v-if="stats" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
       <!-- Breakdown -->
       <div :class="[
         isModern ? 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm lg:col-span-2' : 'bg-warm-white border-[3px] border-ink shadow-[10px_10px_0_var(--color-ink)] lg:col-span-2',
         'p-8 space-y-8 transition-all'
       ]">
          <div :class="[isModern ? 'border-slate-100 dark:border-slate-800' : 'border-ink', 'flex justify-between items-center border-b-[2px] pb-4']">
             <h3 :class="[isModern ? 'text-slate-900 dark:text-white' : 'text-ink font-black italic tracking-tighter', 'font-display text-xl uppercase']">Waiting Time Breakdown</h3>
             <div :class="[isModern ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full' : 'bg-teal text-warm-white px-3 py-1 shadow-[2px_2px_0_var(--color-ink)]', 'text-[10px] font-black uppercase']">Visual Analytics</div>
          </div>
          
          <div class="space-y-6">
             <div class="space-y-3">
                <div class="flex h-12 :class=\"[isModern ? 'rounded-xl' : 'border-[3px] border-ink rounded-none shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1)]', 'overflow-hidden transition-all']\">
                   <div v-for="(step, i) in [
                      { val: stats.m_wait_screen, color: '#2dd4bf', label: 'รอซัก' },
                      { val: stats.m_screen, color: '#6366f1', label: 'ซักประวัติ' },
                      { val: stats.m_wait_doc1, color: '#fbbf24', label: 'รอตรวจ1' },
                      { val: stats.m_doc_time, color: '#10b981', label: 'ตรวจ' },
                      { val: stats.m_wait_rx, color: '#f59e0b', label: 'ยา/บริการ' }
                   ]" :key="i" :style="{ width: (step.val / stats.m_total_all * 100) + '%', backgroundColor: step.color }" class="h-full border-r border-white/10 last:border-r-0 hover:brightness-110 transition-all relative group cursor-help">
                      <div class="absolute inset-0 flex items-center justify-center bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                         <span class="text-[10px] font-black text-white px-1">{{ Math.round(step.val / stats.m_total_all * 100) }}%</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>
       </div>

       <!-- Bottleneck -->
       <div :class="[
         isModern ? 'bg-rose-600 text-white rounded-2xl p-8 shadow-xl' : 'bg-coral text-warm-white border-[3px] border-ink p-6 shadow-[10px_10px_0_var(--color-ink)]',
         'flex flex-col justify-between overflow-hidden relative group transition-all duration-500'
       ]">
          <UIcon name="i-heroicons-bolt" class="absolute -right-10 -bottom-10 w-32 h-32 text-white/10 rotate-12 transition-transform group-hover:scale-125" />
          <div class="relative z-10">
             <h3 class="font-display font-black text-xl uppercase italic tracking-tighter">Critical Points</h3>
             <div class="h-px bg-white/20 my-4" />
             
             <div class="space-y-4">
                <div v-if="stats.m_total_all > 60" class="flex items-center gap-3 bg-white/10 p-3 rounded-xl border border-white/20">
                   <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-rose-200" />
                   <span class="text-xs font-bold">เวลารวมเกิน 60 นาที</span>
                </div>
                <div v-else class="flex items-center gap-3 bg-white/10 p-4 rounded-xl border border-white/20">
                   <UIcon name="i-heroicons-check-circle" class="w-6 h-6 text-emerald-200" />
                   <span class="text-sm font-bold">Optimal Service Level</span>
                </div>
             </div>
          </div>
       </div>
    </div>
  </div>
</template>
