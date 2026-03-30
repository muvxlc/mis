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
const error = ref('');

const title = 'ระยะเวลารอคอย (Waiting Time)';
const description = 'สรุปสถิติเฉลี่ยรายขั้นตอนของบริการ OPD 7 (010)';

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
  } catch (err: any) {
    console.error('Failed to fetch waiting time stats:', err);
    error.value = err.data?.message || 'ไม่สามารถดึงข้อมูลระยะเวลารอคอยได้';
    stats.value = null;
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
</script>

<template>
  <div class="space-y-8 font-sans">
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

    <!-- Summary Metrics Grid - Version 1 Style -->
    <div v-if="stats" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      
      <!-- เวลารวมทั้งหมด (Now First) -->
      <div class="bg-ink border-[3px] border-ink p-6 shadow-[8px_8px_0_var(--color-gold)] flex flex-col gap-4 lg:col-span-2 order-first">
        <div>
           <span class="text-sm uppercase font-black bg-gold text-ink px-2 py-0.5 tracking-widest italic rounded-sm shadow-[2px_2px_0_var(--color-ink)]">เวลารวมทั้งหมด (Total Journey Time)</span>
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

      <!-- 3. รอตรวจ 1 -->
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

      <!-- 4. รอตรวจ 2 (Hidden for focused analysis) -->
      <!-- <div class="bg-warm-white border-[3px] border-ink p-6 shadow-[8px_8px_0_var(--color-ink)] flex flex-col gap-4">
        <div>
           <span class="text-sm uppercase font-black bg-ink text-warm-white px-2 py-0.5 tracking-widest italic rounded-sm shadow-[2px_2px_0_var(--color-coral)]">4. รอตรวจ 2</span>
        </div>
        <div class="flex items-baseline gap-2">
           <span class="text-4xl font-display font-black text-ink italic leading-tight">{{ formatMmSs(stats.รอตรวจ2) }}</span>
           <span class="text-sm font-black text-ink-soft uppercase italic">นาที</span>
        </div>
        <div class="h-2 bg-cream border-[2px] border-ink rounded-none overflow-hidden">
          <div class="h-full bg-coral transition-all duration-1000" :style="{ width: getProgressBarWidth(stats.m_wait_doc2, 60) }"></div>
        </div>
      </div> -->

      <!-- 5. แพทย์ตรวจ -->
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

      <!-- 6. รอรับยา -->
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

    <!-- Infographic Section: Service Performance Insights -->
    <div v-if="stats" class="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
       <!-- 1. Stage Distribution Infographic -->
       <div class="lg:col-span-2 bg-warm-white border-[3px] border-ink p-6 shadow-[10px_10px_0_var(--color-ink)] space-y-8">
          <div class="flex justify-between items-center border-b-[2px] border-ink pb-3">
             <h3 class="font-display font-black text-xl uppercase italic tracking-tighter">Journey Efficiency Breakdown</h3>
             <div class="bg-teal text-warm-white px-3 py-1 text-[10px] font-black uppercase shadow-[2px_2px_0_var(--color-ink)]">Visual Analytics</div>
          </div>
          
          <div class="space-y-6">
             <!-- Bar 1: Operational Flow (Step by Step) -->
             <div class="space-y-2">
                <div class="flex justify-between items-end px-1">
                   <span class="text-[10px] font-black text-ink uppercase tracking-widest italic">1. Operational Step-by-Step Flow</span>
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
                         <span class="text-[10px] font-black text-ink bg-warm-white/90 px-1 shadow-sm">{{ Math.round(step.val / stats.m_total_all * 100) }}%</span>
                      </div>
                   </div>
                </div>
             </div>
             
             <!-- Bar 2: Cumulative Wait Comparison (Hidden) -->
             <!-- <div class="space-y-2">
                <div class="flex justify-between items-end px-1">
                   <span class="text-[10px] font-black text-ink uppercase tracking-widest italic text-coral">2. Passenger Perspective (Wait for Doctor 2)</span>
                   <span class="text-[9px] font-black text-coral uppercase">{{ formatMmSs(stats.รอตรวจ2) }}</span>
                </div>
                <div class="flex h-10 border-[3px] border-ink bg-cream rounded-none overflow-hidden shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1)]">
                   <div class="h-full border-r-[2px] border-ink bg-coral flex items-center justify-center group relative cursor-help" :style="{ width: (stats.m_wait_doc2 / stats.m_total_all * 100) + '%' }">
                      <span class="text-[10px] font-black italic text-warm-white shadow-sm opacity-60 group-hover:opacity-100">WAIT DOC 2 ({{ Math.round(stats.m_wait_doc2 / stats.m_total_all * 100) }}%)</span>
                   </div>
                   <div class="h-full bg-ink opacity-10 flex items-center justify-center" :style="{ width: ((stats.m_total_all - stats.m_wait_doc2) / stats.m_total_all * 100) + '%' }">
                      <span class="text-[9px] font-bold text-ink-soft italic">POST-WAIT JOURNEY</span>
                   </div>
                </div>
             </div> -->
             
             <!-- Legend -->
             <div class="flex flex-wrap gap-4 text-[8px] font-black uppercase tracking-widest text-ink/60 italic pt-2 border-t-[2px] border-ink/5">
                <div class="flex items-center gap-1.5 text-xs"><div class="w-2.5 h-2.5 border-[1px] border-ink" style="background-color: #2dd4bf"></div> รอซักประวัติ</div>
                <div class="flex items-center gap-1.5 text-xs"><div class="w-2.5 h-2.5 border-[1px] border-ink" style="background-color: #6366f1"></div> ซักประวัติ</div>
                <div class="flex items-center gap-1.5 text-xs"><div class="w-2.5 h-2.5 border-[1px] border-ink" style="background-color: #fbbf24"></div> รอตรวจ</div>
                <!-- <div class="flex items-center gap-1.5"><div class="w-2.5 h-2.5 border-[1px] border-ink bg-coral"></div> รอตรวจ 2 (ภาพรวม)</div> -->
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
                <div v-if="stats.m_wait_doc1 > 35 || stats.m_wait_rx > 20 || stats.m_total_all > 60" class="space-y-2">
                   <div class="flex items-center gap-2 text-ink font-black uppercase text-[10px] bg-warm-white/30 p-1 border-[1px] border-ink">
                      <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 animate-pulse" />
                      <span>Action Required</span>
                   </div>
                   <p class="text-xs font-bold leading-tight drop-shadow-sm">
                     {{ stats.m_wait_doc1 > 35 ? '⚠️ จุดรอตรวจที่ห้องตรวจล่าช้า (Wait 1)' : stats.m_wait_rx > 20 ? '⚠️ บริการจ่ายยาใช้เวลาเกินเป้าหมาย' : '⚠️ เวลา Journey ภาพรวมสูงกว่าค่าปกติ' }}
                   </p>
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
             <div class="text-[9px] font-black uppercase tracking-[3px] opacity-60 text-ink italic leading-none">ANALYSIS: {{ stats.m_total_all > 60 ? 'SLOW' : 'NORMAL' }}</div>
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
