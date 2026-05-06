<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';

definePageMeta({
  middleware: 'auth'
});

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

// Create a stable 08:00 - 16:00 range
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
  <div class="space-y-8 font-sans p-4">
    <!-- Header -->
    <header class="bg-cream border-[3px] border-ink p-8 shadow-[8px_8px_0_var(--color-ink)] relative overflow-hidden">
      <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div class="space-y-2">
          <div class="flex items-center gap-3">
             <div class="bg-teal p-2 border-[3px] border-ink shadow-[4px_4px_0_var(--color-ink)] rotate-[-2deg]">
                <UIcon name="i-heroicons-clock" class="w-6 h-6 text-warm-white" />
             </div>
             <h1 class="text-3xl font-display font-black tracking-tight text-ink uppercase italic">{{ title }}</h1>
          </div>
          <p class="text-ink-soft font-bold text-sm bg-warm-white border-[2px] border-ink shadow-[2px_2px_0_var(--color-ink)] px-3 py-1 inline-block rounded-sm mt-2">{{ description }}</p>
        </div>
        
        <div class="flex flex-col md:flex-row gap-4 items-end bg-warm-white border-[3px] border-ink p-4 shadow-[4px_4px_0_var(--color-ink)]">
           <div class="flex flex-col gap-1 w-full md:w-40">
              <label class="text-[10px] font-black uppercase tracking-widest text-ink-soft pl-1">วันที่เริ่มต้น</label>
              <UInput v-model="startDate" type="date" size="lg" :ui="{ base: 'font-bold border-[2px] border-ink rounded-none' }" />
           </div>
           <div class="flex flex-col gap-1 w-full md:w-40">
              <label class="text-[10px] font-black uppercase tracking-widest text-ink-soft pl-1">วันที่สิ้นสุด</label>
              <UInput v-model="endDate" type="date" size="lg" :ui="{ base: 'font-bold border-[2px] border-ink rounded-none' }" />
           </div>
           <UButton 
             icon="i-heroicons-arrow-path" 
             @click="fetchStats" 
             :loading="loading"
             class="bg-gold border-[3px] border-ink text-ink font-bold shadow-[4px_4px_0_var(--color-ink)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_var(--color-ink)] rounded-sm h-[48px] px-6"
           >
             REFRESH
           </UButton>
        </div>
      </div>
    </header>

    <div v-if="error" class="bg-coral/10 border-[3px] border-ink p-6 flex items-center gap-4 shadow-sharp">
       <UIcon name="i-heroicons-exclamation-triangle" class="w-8 h-8 text-coral shrink-0" />
       <p class="font-bold text-ink">{{ error }}</p>
    </div>

    <!-- Summary Metrics Grid -->
    <div v-if="stats" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      
      <!-- เวลารวมทั้งหมด -->
      <div class="bg-ink border-[3px] border-ink p-6 shadow-[8px_8px_0_var(--color-gold)] flex flex-col gap-4 lg:col-span-2 order-first">
        <div>
           <span class="text-sm uppercase font-black bg-gold text-ink px-2 py-0.5 tracking-widest italic rounded-sm shadow-[2px_2px_0_var(--color-ink)]">เวลารวมทั้งหมด (Total Time)</span>
        </div>
        <div class="flex items-baseline justify-between py-2">
           <div class="flex items-baseline gap-3">
              <span class="text-6xl font-display font-black text-warm-white italic leading-none">{{ formatMmSs(stats.total_all) }}</span>
              <span class="text-xl font-black text-gold italic uppercase">นาที</span>
           </div>
           <span class="text-xl font-display font-black text-gold italic leading-none">MM:SS</span>
        </div>
        <div class="h-3 bg-warm-white/10 border-[2px] border-gold rounded-none overflow-hidden mt-2">
          <div class="h-full bg-gold transition-all duration-1000 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]" :style="{ width: getProgressBarWidth(stats.m_total_all, 120) }"></div>
        </div>
      </div>

      <!-- 1. รอซักประวัติ -->
      <div class="bg-warm-white border-[3px] border-ink p-6 shadow-[8px_8px_0_var(--color-ink)] flex flex-col gap-4">
        <div>
           <span class="text-sm uppercase font-black bg-ink text-warm-white px-2 py-0.5 tracking-widest italic rounded-sm shadow-[2px_2px_0_var(--color-teal)]">1. รอซักประวัติ</span>
        </div>
        <div class="flex items-baseline gap-2">
           <span class="text-4xl font-display font-black text-ink italic leading-tight">{{ formatMmSs(stats.รอซักประวัติ) }}</span>
           <span class="text-sm font-black text-ink-soft uppercase italic">นาที</span>
        </div>
        <div class="h-2 bg-cream border-[2px] border-ink rounded-none overflow-hidden">
          <div class="h-full bg-teal transition-all duration-1000" :style="{ width: getProgressBarWidth(stats.m_wait_screen, 30) }"></div>
        </div>
      </div>

      <!-- 2. ซักประวัติ -->
      <div class="bg-warm-white border-[3px] border-ink p-6 shadow-[8px_8px_0_var(--color-ink)] flex flex-col gap-4">
        <div>
           <span class="text-sm uppercase font-black bg-ink text-warm-white px-2 py-0.5 tracking-widest italic rounded-sm" style="box-shadow: 2px 2px 0 #6366f1">2. ซักประวัติ</span>
        </div>
        <div class="flex items-baseline gap-2">
           <span class="text-4xl font-display font-black text-ink italic leading-tight">{{ formatMmSs(stats.ซักประวัติ) }}</span>
           <span class="text-sm font-black text-ink-soft uppercase italic">นาที</span>
        </div>
        <div class="h-2 bg-cream border-[2px] border-ink rounded-none overflow-hidden">
          <div class="h-full transition-all duration-1000" style="background-color: #6366f1" :style="{ width: getProgressBarWidth(stats.m_screen, 15) }"></div>
        </div>
      </div>

      <!-- 3. รอตรวจ -->
      <div class="bg-warm-white border-[3px] border-ink p-6 shadow-[8px_8px_0_var(--color-ink)] flex flex-col gap-4">
        <div>
           <span class="text-sm uppercase font-black bg-ink text-warm-white px-2 py-0.5 tracking-widest italic rounded-sm shadow-[2px_2px_0_var(--color-gold)]">3. รอตรวจ</span>
        </div>
        <div class="flex items-baseline gap-2">
           <span class="text-4xl font-display font-black text-ink italic leading-tight">{{ formatMmSs(stats.รอตรวจ1) }}</span>
           <span class="text-sm font-black text-ink-soft uppercase italic">นาที</span>
        </div>
        <div class="h-2 bg-cream border-[2px] border-ink rounded-none overflow-hidden">
          <div class="h-full bg-gold transition-all duration-1000" :style="{ width: getProgressBarWidth(stats.m_wait_doc1, 60) }"></div>
        </div>
      </div>

      <!-- 4. แพทย์ตรวจ -->
      <div class="bg-warm-white border-[3px] border-ink p-6 shadow-[8px_8px_0_var(--color-ink)] flex flex-col gap-4">
        <div>
           <span class="text-sm uppercase font-black bg-ink text-warm-white px-2 py-0.5 tracking-widest italic rounded-sm" style="box-shadow: 2px 2px 0 #10b981">4. แพทย์ตรวจ</span>
        </div>
        <div class="flex items-baseline gap-2">
           <span class="text-4xl font-display font-black text-ink italic leading-tight">{{ formatMmSs(stats.แพทย์ตรวจ) }}</span>
           <span class="text-sm font-black text-ink-soft uppercase italic">นาที</span>
        </div>
        <div class="h-2 bg-cream border-[2px] border-ink rounded-none overflow-hidden">
          <div class="h-full transition-all duration-1000" style="background-color: #10b981" :style="{ width: getProgressBarWidth(stats.m_doc_time, 20) }"></div>
        </div>
      </div>

      <!-- 5. รอรับยา -->
      <div class="bg-warm-white border-[3px] border-ink p-6 shadow-[8px_8px_0_var(--color-ink)] flex flex-col gap-4">
        <div>
           <span class="text-sm uppercase font-black bg-ink text-warm-white px-2 py-0.5 tracking-widest italic rounded-sm" style="box-shadow: 2px 2px 0 #f59e0b">5. รอรับยา</span>
        </div>
        <div class="flex items-baseline gap-2">
           <span class="text-4xl font-display font-black text-ink italic leading-tight">{{ formatMmSs(stats.รอรับยา) }}</span>
           <span class="text-sm font-black text-ink-soft uppercase italic">นาที</span>
        </div>
        <div class="h-2 bg-cream border-[2px] border-ink rounded-none overflow-hidden">
          <div class="h-full transition-all duration-1000" style="background-color: #f59e0b" :style="{ width: getProgressBarWidth(stats.m_wait_rx, 30) }"></div>
        </div>
      </div>

    </div>

    <!-- Analytics Section -->
    <div v-if="stats" class="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
       <!-- 1. Stage Distribution -->
       <div class="lg:col-span-2 bg-warm-white border-[3px] border-ink p-6 shadow-[10px_10px_0_var(--color-ink)] space-y-8">
          <div class="flex justify-between items-center border-b-[2px] border-ink pb-3">
             <h3 class="font-display font-black text-xl uppercase italic tracking-tighter">Waiting Time Breakdown</h3>
             <div class="bg-teal text-warm-white px-3 py-1 text-[10px] font-black uppercase shadow-[2px_2px_0_var(--color-ink)]">Visual Analytics</div>
          </div>
          
          <div class="space-y-6">
             <div class="space-y-2">
                <div class="flex justify-between items-end px-1">
                   <span class="text-[10px] font-black text-ink uppercase tracking-widest italic">Operational Flow Distribution</span>
                   <span class="text-[9px] font-bold text-ink-soft uppercase opacity-60">Total Flow: {{ formatMmSs(stats.total_all) }}</span>
                </div>
                <div class="flex h-10 border-[3px] border-ink bg-cream rounded-none overflow-hidden shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1)]">
                   <div v-for="(step, i) in [
                      { val: stats.m_wait_screen, color: '#2dd4bf', label: 'รอซัก' },
                      { val: stats.m_screen, color: '#6366f1', label: 'ซักประวัติ' },
                      { val: stats.m_wait_doc1, color: '#fbbf24', label: 'รอตรวจ1' },
                      { val: stats.m_doc_time, color: '#10b981', label: 'ตรวจ' },
                      { val: stats.m_wait_rx, color: '#f59e0b', label: 'ยา/บริการ' }
                   ]" :key="i" :style="{ width: (step.val / stats.m_total_all * 100) + '%', backgroundColor: step.color }" :title="step.label" class="h-full border-r-[2px] border-ink last:border-r-0 hover:brightness-110 transition-all cursor-help relative group">
                      <div class="absolute inset-0 flex items-center justify-center bg-white/10 pointer-events-none">
                         <span class="text-[10px] font-black text-ink px-1 shadow-sm">{{ Math.round(step.val / stats.m_total_all * 100) }}%</span>
                      </div>
                   </div>
                </div>
             </div>
             
             <div class="flex flex-wrap gap-4 text-[8px] font-black uppercase tracking-widest text-ink/60 italic pt-2 border-t-[2px] border-ink/5">
                <div class="flex items-center gap-1.5 text-xs"><div class="w-2.5 h-2.5 border-[1px] border-ink" style="background-color: #2dd4bf"></div> รอซักประวัติ</div>
                <div class="flex items-center gap-1.5 text-xs"><div class="w-2.5 h-2.5 border-[1px] border-ink" style="background-color: #6366f1"></div> ซักประวัติ</div>
                <div class="flex items-center gap-1.5 text-xs"><div class="w-2.5 h-2.5 border-[1px] border-ink" style="background-color: #fbbf24"></div> รอตรวจ</div>
                <div class="flex items-center gap-1.5 text-xs"><div class="w-2.5 h-2.5 border-[1px] border-ink" style="background-color: #10b981"></div> แพทย์ตรวจ</div>
                <div class="flex items-center gap-1.5 text-xs"><div class="w-2.5 h-2.5 border-[1px] border-ink" style="background-color: #f59e0b"></div> รอรับยา</div>
             </div>
          </div>
       </div>

       <!-- 2. Bottleneck Detection -->
       <div class="bg-coral text-warm-white border-[3px] border-ink p-6 shadow-[10px_10px_0_var(--color-ink)] flex flex-col justify-between overflow-hidden relative group transition-all duration-500" :class="{'brightness-90': stats.m_total_all > 60}">
          <div class="absolute -right-10 -bottom-10 opacity-10 rotate-12 transition-transform group-hover:scale-125">
             <UIcon name="i-heroicons-bolt" class="w-32 h-32 text-ink" />
          </div>
          <div>
             <h3 class="font-display font-black text-xl uppercase italic tracking-tighter drop-shadow-md">Critical Points</h3>
             <p class="text-[9px] font-black uppercase tracking-widest opacity-80 border-b-[2px] border-ink/30 pb-2 mb-4 italic text-ink">Decision Support System</p>
             
             <div class="space-y-4">
                <div v-if="stats.m_total_all > 60 || stats.m_wait_screen > 20 || stats.m_screen > 5 || stats.m_wait_doc1 > 15 || stats.m_doc_time > 5 || stats.m_wait_rx > 15" class="space-y-2">
                   <div class="flex items-center gap-2 text-ink font-black uppercase text-[10px] bg-warm-white/30 p-1 border-[1px] border-ink">
                      <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 animate-pulse" />
                      <span>Action Required</span>
                   </div>
                   <div class="text-[11px] font-bold leading-tight space-y-1">
                      <p v-if="stats.m_total_all > 60" class="text-ink shadow-sm bg-warm-white/20 px-1 border-l-2 border-ink">⚠️ เวลารวมเกิน 60 นาที</p>
                      <p v-if="stats.m_wait_screen > 20" class="text-ink shadow-sm bg-warm-white/20 px-1 border-l-2 border-ink">⚠️ รอซักประวัตินานเกิน 20 นาที</p>
                      <p v-if="stats.m_screen > 5" class="text-ink shadow-sm bg-warm-white/20 px-1 border-l-2 border-ink">⚠️ ซักประวัติใช้เวลาเกิน 5 นาที</p>
                      <p v-if="stats.m_wait_doc1 > 15" class="text-ink shadow-sm bg-warm-white/20 px-1 border-l-2 border-ink">⚠️ รอตรวจนานเกิน 15 นาที</p>
                      <p v-if="stats.m_doc_time > 5" class="text-ink shadow-sm bg-warm-white/20 px-1 border-l-2 border-ink">⚠️ แพทย์ตรวจใช้เวลาเกิน 5 นาที</p>
                      <p v-if="stats.m_wait_rx > 15" class="text-ink shadow-sm bg-warm-white/20 px-1 border-l-2 border-ink">⚠️ รอรับยา/บริการนานเกิน 15 นาที</p>
                   </div>
                </div>
                <div v-else class="space-y-1">
                   <div class="flex items-center gap-2 bg-ink/20 px-3 py-2 border-[2px] border-ink rounded-sm">
                      <UIcon name="i-heroicons-check-circle" class="w-5 h-5" />
                      <span class="text-xs font-black uppercase italic">Service Status: Optimal</span>
                   </div>
                </div>
             </div>
          </div>
          
          <div class="pt-4 mt-auto">
             <div class="text-[9px] font-black uppercase tracking-[3px] opacity-60 text-ink italic leading-none">TARGET: {{ stats.m_total_all > 60 ? 'FAILED' : 'SUCCESS' }}</div>
          </div>
       </div>

       <!-- 3. Hourly Analysis: Heatmap 1 (รอซักประวัติ) -->
       <div v-if="stats" class="lg:col-span-3 bg-ink border-[3px] border-ink p-8 shadow-[12px_12px_0_var(--color-gold)] mt-4 overflow-hidden">
          <div class="flex justify-between items-center border-b-[2px] border-gold/30 pb-4 mb-8">
             <div class="space-y-1">
                <h3 class="font-display font-black text-2xl uppercase italic tracking-tighter text-gold">Service Heatmap: รอซักประวัติ</h3>
                <p class="text-[10px] font-black text-warm-white/60 uppercase italic tracking-widest text-gold text-sm">Identifying Peak Load & Service Intensity (08:00 - 16:00)</p>
             </div>
             <div class="bg-teal text-ink px-4 py-1.5 text-[10px] font-black uppercase border-[2px] border-ink shadow-[4px_4px_0_var(--color-gold)]">Wait Stage 1</div>
          </div>

          <div class="space-y-1 relative">
             <div class="flex">
                <div class="w-32 shrink-0"></div>
                <div class="flex-1 flex justify-between px-2 pb-2">
                   <div v-for="h in displayHourlyScreen" :key="h.visit_hour" class="flex-1 text-center text-[12px] font-black text-gold uppercase tracking-[1px] italic">{{ String(h.visit_hour).padStart(2, '0') }}:00</div>
                </div>
             </div>

             <!-- Row 1: Patient Load -->
             <div class="flex items-center group/row">
                <div class="w-32 shrink-0 text-[10px] font-black text-warm-white uppercase italic tracking-tighter border-r-[2px] border-gold/20 pr-4 text-right leading-none">Patient Load</div>
                <div class="flex-1 flex gap-1 h-14 p-1">
                   <div v-for="(h, idx) in displayHourlyScreen" :key="idx" class="flex-1 min-w-[30px] border-[1px] border-ink/40 transition-all duration-300 flex items-center justify-center p-1" :style="{ backgroundColor: Number(h.patient_count) === 0 ? 'rgba(255,255,255,0.05)' : Number(h.patient_count) > (maxPatientsScreen * 0.8) ? '#f87171' : Number(h.patient_count) > (maxPatientsScreen * 0.4) ? '#fbbf24' : '#0d9488' }">
                      <span class="text-[10px] font-black" :class="Number(h.patient_count) === 0 ? 'text-warm-white/40' : 'text-ink-soft'">{{ h.patient_count }}</span>
                   </div>
                </div>
             </div>

             <!-- Row 2: Avg Wait -->
             <div class="flex items-center group/row">
                <div class="w-32 shrink-0 text-[10px] font-black text-warm-white uppercase italic tracking-tighter border-r-[2px] border-gold/20 pr-4 text-right leading-none">Avg Wait</div>
                <div class="flex-1 flex gap-1 h-14 p-1">
                   <div v-for="(h, idx) in displayHourlyScreen" :key="idx" class="flex-1 min-w-[30px] border-[1px] border-ink/40 transition-all duration-300 flex items-center justify-center p-1" :style="{ backgroundColor: Number(h.patient_count) === 0 ? 'rgba(255,255,255,0.02)' : Number(h.avg_wait_minutes) > 30 ? '#ef4444' : Number(h.avg_wait_minutes) > 15 ? '#f59e0b' : '#14b8a6' }">
                      <span v-if="Number(h.avg_wait_minutes) > 0" class="text-[9px] font-black text-ink">{{ formatMinutes(h.avg_wait_minutes) }}m</span>
                   </div>
                </div>
             </div>

             <!-- Row 3: Peak Delay -->
             <div class="flex items-center group/row">
                <div class="w-32 shrink-0 text-[10px] font-black text-warm-white uppercase italic tracking-tighter border-r-[2px] border-gold/20 pr-4 text-right leading-none">Peak Delay</div>
                <div class="flex-1 flex gap-1 h-14 p-1">
                   <div v-for="(h, idx) in displayHourlyScreen" :key="idx" class="flex-1 min-w-[30px] border-[1px] border-ink/40 transition-all duration-300 flex items-center justify-center p-1" :style="{ backgroundColor: Number(h.patient_count) === 0 ? 'rgba(255,255,255,0.02)' : Number(h.max_wait_minutes) > 60 ? '#b91c1c' : Number(h.max_wait_minutes) > 30 ? '#f97316' : '#2dd4bf' }">
                      <span v-if="Number(h.max_wait_minutes) > 0" class="text-[9px] font-black text-ink">{{ formatMinutes(h.max_wait_minutes) }}m</span>
                   </div>
                </div>
             </div>
          </div>
       </div>

       <!-- 4. Hourly Analysis: Heatmap 2 (รอตรวจ) -->
       <div v-if="stats" class="lg:col-span-3 bg-ink border-[3px] border-ink p-8 shadow-[12px_12px_0_var(--color-teal)] mt-4 overflow-hidden">
          <div class="flex justify-between items-center border-b-[2px] border-teal/30 pb-4 mb-8">
             <div class="space-y-1">
                <h3 class="font-display font-black text-2xl uppercase italic tracking-tighter text-teal">Service Heatmap: รอตรวจ</h3>
                <p class="text-[10px] font-black text-warm-white/60 uppercase italic tracking-widest text-teal text-sm">Identifying Physician Availability & Patient Queues (08:00 - 16:00)</p>
             </div>
             <div class="bg-gold text-ink px-4 py-1.5 text-[10px] font-black uppercase border-[2px] border-ink shadow-[4px_4px_0_var(--color-teal)]">Wait Stage 2</div>
          </div>

          <div class="space-y-1 relative">
             <div class="flex">
                <div class="w-32 shrink-0"></div>
                <div class="flex-1 flex justify-between px-2 pb-2">
                   <div v-for="h in displayHourlyDoctor" :key="h.visit_hour" class="flex-1 text-center text-[12px] font-black text-teal uppercase tracking-[1px] italic">{{ String(h.visit_hour).padStart(2, '0') }}:00</div>
                </div>
             </div>

             <!-- Row 1: Patient Load -->
             <div class="flex items-center group/row">
                <div class="w-32 shrink-0 text-[10px] font-black text-warm-white uppercase italic tracking-tighter border-r-[2px] border-teal/20 pr-4 text-right leading-none">Patient Load</div>
                <div class="flex-1 flex gap-1 h-14 p-1">
                   <div v-for="(h, idx) in displayHourlyDoctor" :key="idx" class="flex-1 min-w-[30px] border-[1px] border-ink/40 transition-all duration-300 flex items-center justify-center p-1" :style="{ backgroundColor: Number(h.patient_count) === 0 ? 'rgba(255,255,255,0.05)' : Number(h.patient_count) > (maxPatientsDoctor * 0.8) ? '#f87171' : Number(h.patient_count) > (maxPatientsDoctor * 0.4) ? '#fbbf24' : '#2dd4bf' }">
                      <span class="text-[10px] font-black" :class="Number(h.patient_count) === 0 ? 'text-warm-white/40' : 'text-ink-soft'">{{ h.patient_count }}</span>
                   </div>
                </div>
             </div>

             <!-- Row 2: Avg Wait -->
             <div class="flex items-center group/row">
                <div class="w-32 shrink-0 text-[10px] font-black text-warm-white uppercase italic tracking-tighter border-r-[2px] border-teal/20 pr-4 text-right leading-none">Avg Wait</div>
                <div class="flex-1 flex gap-1 h-14 p-1">
                   <div v-for="(h, idx) in displayHourlyDoctor" :key="idx" class="flex-1 min-w-[30px] border-[1px] border-ink/40 transition-all duration-300 flex items-center justify-center p-1" :style="{ backgroundColor: Number(h.patient_count) === 0 ? 'rgba(255,255,255,0.02)' : Number(h.avg_wait_minutes) > 40 ? '#ef4444' : Number(h.avg_wait_minutes) > 20 ? '#f59e0b' : '#2dd4bf' }">
                      <span v-if="Number(h.avg_wait_minutes) > 0" class="text-[9px] font-black text-ink">{{ formatMinutes(h.avg_wait_minutes) }}m</span>
                   </div>
                </div>
             </div>

             <!-- Row 3: Peak Delay -->
             <div class="flex items-center group/row">
                <div class="w-32 shrink-0 text-[10px] font-black text-warm-white uppercase italic tracking-tighter border-r-[2px] border-teal/20 pr-4 text-right leading-none">Peak Delay</div>
                <div class="flex-1 flex gap-1 h-14 p-1">
                   <div v-for="(h, idx) in displayHourlyDoctor" :key="idx" class="flex-1 min-w-[30px] border-[1px] border-ink/40 transition-all duration-300 flex items-center justify-center p-1" :style="{ backgroundColor: Number(h.patient_count) === 0 ? 'rgba(255,255,255,0.02)' : Number(h.max_wait_minutes) > 80 ? '#b91c1c' : Number(h.max_wait_minutes) > 40 ? '#f97316' : '#2dd4bf' }">
                      <span v-if="Number(h.max_wait_minutes) > 0" class="text-[9px] font-black text-ink">{{ formatMinutes(h.max_wait_minutes) }}m</span>
                   </div>
                </div>
             </div>
          </div>
       </div>

       <!-- 5. Visit Traffic (OPD 7) -->
       <div v-if="stats" class="lg:col-span-3 bg-warm-white border-[3px] border-ink p-8 shadow-[12px_12px_0_var(--color-ink)] mt-4">
          <div class="flex justify-between items-center border-b-[2px] border-ink pb-4 mb-8">
             <div class="space-y-1">
                <h3 class="font-display font-black text-2xl uppercase italic tracking-tighter">Visit Traffic Trending (OPD)</h3>
                <p class="text-[10px] font-black text-ink-soft uppercase italic tracking-widest">Hourly Patient Volume Distribution</p>
             </div>
             <div class="text-[10px] font-black uppercase bg-ink text-warm-white px-3 py-1">Direct from HOSxP</div>
          </div>

          <div class="h-64 relative px-4 border-b-[3px] border-ink/20">
             <!-- Y-Axis Mini Guide -->
             <div class="absolute left-0 top-0 h-full flex flex-col justify-between text-[8px] font-black text-ink/30 pr-2 pointer-events-none z-10">
                <span>{{ maxTrafficTotal }}</span>
                <span>{{ Math.round(maxTrafficTotal / 2) }}</span>
                <span>0</span>
             </div>

             <!-- Grid Lines -->
             <div class="absolute inset-0 flex flex-col justify-between py-2 px-10 pointer-events-none">
                <div class="w-full h-[1px] bg-ink/5"></div>
                <div class="w-full h-[1px] bg-ink/5"></div>
                <div class="w-full h-[1px] bg-ink/5"></div>
             </div>

             <!-- Line Graph Body (SVG) -->
             <div class="absolute inset-0 pl-14 pr-6 py-4">
                <svg viewBox="0 0 1000 200" preserveAspectRatio="none" class="w-full h-full overflow-visible">
                   <!-- Gradient Fill Area -->
                   <path 
                      :d="`M 0 200 ${displayTraffic.map((t, i) => `L ${i * (1000 / (displayTraffic.length - 1))} ${200 - (t.total / maxTrafficTotal * 200)}`).join(' ')} L 1000 200 Z`" 
                      fill="url(#traffic-gradient)" 
                      class="opacity-20"
                   />
                   
                   <!-- Main Trend Line -->
                   <path 
                      :d="`M 0 ${200 - (displayTraffic[0].total / maxTrafficTotal * 200)} ${displayTraffic.map((t, i) => `L ${i * (1000 / (displayTraffic.length - 1))} ${200 - (t.total / maxTrafficTotal * 200)}`).join(' ')}`" 
                      fill="none" 
                      stroke="#22c55e" 
                      stroke-width="5" 
                      stroke-linejoin="round"
                      stroke-linecap="round"
                      class="drop-shadow-[0_4px_8px_rgba(34,197,94,0.3)]"
                   />

                   <!-- Points (Interactive) -->
                   <g v-for="(t, idx) in displayTraffic" :key="'p'+idx">
                      <circle 
                         :cx="idx * (1000 / (displayTraffic.length - 1))" 
                         :cy="200 - (t.total / maxTrafficTotal * 200)" 
                         r="7" 
                         fill="#1a1a2e" 
                         stroke="#22c55e" 
                         stroke-width="3"
                         class="cursor-help hover:r-10 transition-all duration-300"
                      />
                   </g>

                   <defs>
                      <linearGradient id="traffic-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                         <stop offset="0%" style="stop-color:#22c55e;stop-opacity:0.8" />
                         <stop offset="100%" style="stop-color:#22c55e;stop-opacity:0" />
                      </linearGradient>
                   </defs>
                </svg>
             </div>

             <!-- Interaction Layer (Invisible columns for tooltips) -->
             <div class="absolute inset-0 pl-14 pr-6 py-4 flex gap-0">
                <div v-for="(t, idx) in displayTraffic" :key="'i'+idx" class="flex-1 group relative cursor-help">
                   <!-- Tooltip on hover -->
                   <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 bg-ink text-gold p-2 text-[10px] font-black opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-[4px_4px_0_var(--color-gold)] pointer-events-none whitespace-nowrap border border-gold">
                      {{ String(t.hour).padStart(2, '0') }}:00 | {{ t.total }} Patients
                   </div>
                   <!-- Vertical Marker line -->
                   <div class="absolute inset-y-0 left-1/2 w-[1px] bg-teal opacity-0 group-hover:opacity-20 pointer-events-none translate-x-[-0.5px]"></div>
                </div>
             </div>
          </div>

          <!-- X-Axis Labels -->
          <div class="flex pl-14 pr-6 pt-4">
             <div v-for="(t, idx) in displayTraffic" :key="'x'+idx" class="flex-1 text-center text-[11px] font-black text-ink-soft italic">
                {{ String(t.hour).padStart(2, '0') }}:00
             </div>
          </div>

          <div class="mt-8 flex justify-between items-center bg-cream/50 p-4 border-[2px] border-ink/10 italic">
             <div class="flex gap-6">
                <div class="flex items-center gap-3">
                   <div class="w-4 h-1 bg-[#22c55e] shadow-sm"></div>
                   <span class="text-[10px] font-black uppercase text-ink/70 tracking-widest leading-none">Traffic Trend</span>
                </div>
                <div class="flex items-center gap-3">
                   <div class="w-3 h-3 rounded-full border-[2px] border-[#22c55e] bg-ink"></div>
                   <span class="text-[10px] font-black uppercase text-ink/70 tracking-widest leading-none">Hourly Checkpoint</span>
                </div>
             </div>
             <div class="text-[9px] font-black text-ink-soft uppercase opacity-40">Dynamic Data visualization &copy; MIS HOSxP</div>
          </div>
       </div>
    </div>

    <!-- Empty State -->
    <div v-else class="py-32 flex flex-col items-center justify-center bg-warm-white border-[3px] border-ink shadow-[8px_8px_0_var(--color-ink)]">
       <UIcon name="i-heroicons-calendar" class="w-16 h-16 text-ink-soft opacity-20 mb-4" />
       <p class="text-ink font-black uppercase italic tracking-widest">ไม่พบสถิติในช่วงเวลาที่คุณเลือก</p>
    </div>
  </div>
</template>

<style scoped>
.shadow-sharp {
  box-shadow: 8px 8px 0 var(--color-ink);
}
</style>
