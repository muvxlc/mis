<script setup lang="ts">
const { loggedIn } = useUserSession();
const theme = useCookie('app-theme');
const isModern = computed(() => theme.value === 'modern');

const highlights = [
  { prefix: 'Dynamic', title: 'QR CODES', desc: 'Update destinations without reprinting' },
  { prefix: 'Real-Time', title: 'SCAN ANALYTICS', desc: 'Device, location & browser insights' },
  { prefix: 'Unlimited', title: 'SCANS', desc: 'No caps, no throttling, ever' },
  { prefix: 'Free', title: 'TO START', desc: 'No credit card required' }
];
</script>

<template>
  <div class="min-h-screen transition-colors duration-500">
    <!-- Hero Section -->
    <section :class="[
      isModern ? 'bg-blue-600 dark:bg-blue-900 text-white' : 'bg-ink text-warm-white',
      'pt-24 pb-32 px-6 lg:px-8 relative overflow-hidden transition-all duration-500'
    ]">
      <div class="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 relative z-10">
        <!-- Hero Text -->
        <div class="lg:w-1/2 space-y-8">
          <div :class="[
            isModern ? 'bg-white/10 text-blue-100 border-white/20' : 'bg-warm-white/5 text-teal border-teal app-shadow',
            'inline-flex items-center px-4 py-1.5 border-[3px] text-xs font-bold uppercase tracking-widest rounded-sm mb-2 transition-all'
          ]">
            Free — No Credit Card Required
          </div>
          <h1 class="text-6xl md:text-7xl font-display font-bold leading-[1.05] tracking-tight">
            Create Your<br/>
            <span :class="[isModern ? 'text-blue-100' : 'text-teal drop-shadow-[4px_4px_0_var(--color-ink-soft)]']">Free QR Code.</span>
          </h1>
          <p class="text-lg opacity-90 max-w-lg leading-relaxed pt-2 font-medium">
            Start with free static QR codes. Upgrade to dynamic plans when you need editable links and scan analytics. Make them yours with <span :class="[isModern ? 'text-blue-200 border-blue-400' : 'text-teal font-bold border-teal', 'border-b-[3px] pb-0.5']">QR Style Studio</span>.
            <br/><br/>
            <span :class="[isModern ? 'bg-white/10 border-white/10' : 'bg-gold/10 border-gold shadow-sm', 'text-sm font-bold px-2 py-1 border-[2px] rounded-sm']">Dynamic plans include a 14-day free trial — no charge until it ends.</span>
          </p>
          
          <div class="flex flex-wrap items-center gap-6 text-xs font-bold uppercase tracking-wider py-4">
            <span class="flex items-center gap-2"><div :class="[isModern ? 'bg-blue-300' : 'bg-teal border-[2px] border-ink', 'w-3 h-3 rotate-45']"></div> Free Static QR Codes</span>
            <span class="flex items-center gap-2"><div :class="[isModern ? 'bg-yellow-400' : 'bg-gold border-[2px] border-ink', 'w-3 h-3 rotate-45']"></div> 14-Day Dynamic Trial</span>
            <span class="flex items-center gap-2"><div :class="[isModern ? 'bg-rose-400' : 'bg-coral border-[2px] border-ink', 'w-3 h-3 rotate-45']"></div> Scan Analytics</span>
          </div>

          <div class="flex flex-col sm:flex-row gap-5 pt-4">
            <UButton 
              to="/login"
              size="xl" 
              :class="[
                isModern ? 'bg-white text-blue-600 hover:bg-blue-50 rounded-xl shadow-lg border-transparent' : 'bg-teal border-ink hover:bg-teal-dark text-ink font-bold rounded-sm shadow-[6px_6px_0_var(--color-ink)] hover:translate-x-[2px] hover:translate-y-[2px] border-[3px]',
                'w-full sm:w-auto px-8 py-4 justify-center transition-all uppercase tracking-wide text-sm'
              ]"
            >
              START FREE + STYLE
            </UButton>
            <UButton 
              to="/register"
              variant="outline"
              size="xl" 
              :class="[
                isModern ? 'border-white/30 text-white hover:bg-white/10 rounded-xl' : 'border-gold bg-ink text-gold hover:bg-gold hover:text-ink font-bold rounded-sm shadow-[6px_6px_0_var(--color-gold)] hover:translate-x-[2px] hover:translate-y-[2px] border-[3px]',
                'w-full sm:w-auto px-8 py-4 justify-center transition-all uppercase tracking-wide text-sm'
              ]"
            >
              START 14-DAY FREE TRIAL
            </UButton>
          </div>
        </div>

        <!-- Hero Mockup Abstract -->
        <div class="lg:w-1/2 w-full flex justify-center lg:justify-end relative">
          <div :class="[
            isModern ? 'bg-slate-800/50 backdrop-blur-xl border-slate-700/50 rounded-2xl shadow-2xl' : 'bg-ink-soft border-ink rounded-sm shadow-[16px_16px_0_var(--color-ink)]',
            'border-[3px] p-8 relative overflow-hidden w-full max-w-md hidden md:block'
          ]">
            <div v-if="!isModern" class="absolute inset-x-0 top-0 h-2 bg-teal border-b-[3px] border-ink"></div>
            <div :class="[
              isModern ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-teal/10 text-teal border-teal shadow-[2px_2px_0_var(--color-teal)]',
              'inline-flex border-[3px] rounded-sm px-3 py-1 text-[10px] uppercase tracking-widest font-bold mb-8'
            ]">QR CODE SCANS</div>
            
            <div class="flex gap-12 font-display mb-12">
              <div>
                <div class="text-5xl font-bold">3,241</div>
                <div :class="[isModern ? 'text-slate-400' : 'text-cream/60 bg-ink px-2 py-0.5 rounded-sm border-[2px] border-ink', 'text-[10px] uppercase tracking-widest font-sans mt-2 font-bold inline-block']">TOTAL SCANS</div>
              </div>
              <div>
                <div :class="[isModern ? 'text-blue-400' : 'text-teal font-bold', 'text-5xl font-bold']">68%</div>
                <div :class="[isModern ? 'text-slate-400' : 'text-cream/60 bg-ink px-2 py-0.5 rounded-sm border-[2px] border-ink', 'text-[10px] uppercase tracking-widest font-sans mt-2 font-bold inline-block']">MOBILE</div>
              </div>
            </div>

            <div :class="[isModern ? 'border-slate-700' : 'border-ink', 'flex justify-between items-end h-32 border-b-[3px] pb-0 gap-2 opacity-100']">
              <div :class="[isModern ? 'bg-blue-500/40' : 'bg-teal border-[2px] border-b-0 border-ink rounded-t-sm']" style="height: 30%"></div>
              <div :class="[isModern ? 'bg-blue-500/60' : 'bg-teal border-[2px] border-b-0 border-ink rounded-t-sm']" style="height: 50%"></div>
              <div :class="[isModern ? 'bg-blue-500/40' : 'bg-teal border-[2px] border-b-0 border-ink rounded-t-sm']" style="height: 20%"></div>
              <div :class="[isModern ? 'bg-blue-500/80' : 'bg-teal border-[2px] border-b-0 border-ink rounded-t-sm']" style="height: 70%"></div>
              <div :class="[isModern ? 'bg-blue-400 shadow-lg shadow-blue-500/50' : 'bg-warm-white border-[3px] border-b-0 border-ink rounded-t-sm', 'w-full relative z-10']" style="height: 100%"></div>
              <div :class="[isModern ? 'bg-blue-500/60' : 'bg-teal border-[2px] border-b-0 border-ink rounded-t-sm']" style="height: 45%"></div>
            </div>

            <div class="pt-8 text-center mt-4">
              <NuxtLink to="/dashboard" :class="[
                isModern ? 'text-blue-400 hover:text-blue-300 text-xs font-semibold' : 'text-[10px] uppercase tracking-widest font-bold text-gold bg-ink px-4 py-2 border-[2px] border-ink rounded-sm shadow-[2px_2px_0_var(--color-gold)]',
                'inline-block transition-colors'
              ]">
                SEE FULL DASHBOARD PREVIEW &rarr;
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Content Section -->
    <section :class="[
      isModern ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100' : 'bg-cream text-ink border-t-[3px] border-ink',
      'py-24 px-6 lg:px-8 relative z-20 transition-all duration-500'
    ]">
      <div class="max-w-7xl mx-auto space-y-20">
        <div :class="[isModern ? 'border-slate-200 dark:border-slate-800' : 'border-ink', 'flex flex-col md:flex-row justify-between items-end gap-6 border-b-[3px] pb-10']">
          <div class="space-y-4">
            <p :class="[isModern ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-ink-soft bg-warm-white border-[2px] border-ink-soft shadow-[2px_2px_0_var(--color-ink-soft)] px-2 py-1 rounded-sm', 'text-[10px] tracking-widest uppercase inline-block font-bold']">SEE IT IN ACTION</p>
            <h2 class="text-5xl md:text-7xl font-display font-bold leading-tight tracking-tight">
              Experience the<br/>
              <span :class="[isModern ? 'text-blue-600' : 'text-teal drop-shadow-[2px_2px_0_var(--color-ink)]']">Full Platform</span>
            </h2>
          </div>
          <p :class="[isModern ? 'text-slate-500 dark:text-slate-400' : 'text-ink-soft bg-warm-white p-4 border-[3px] border-ink shadow-sharp rounded-sm', 'max-w-sm font-bold text-lg']">From creation to analytics — see how MIS works before you even sign up.</p>
        </div>

        <!-- Highlights Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
          <div v-for="(highlight, i) in highlights" :key="i" :class="[
            isModern ? 'bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800' : 'bg-warm-white border-[3px] border-ink p-12 text-center shadow-[16px_16px_0_var(--color-ink)] rounded-sm',
            'transition-all hover:-translate-y-1'
          ]">
            <div :class="[
              'text-5xl font-display font-bold mb-5 tracking-tight',
              isModern ? 'text-blue-600 dark:text-blue-400' : (i === 0 ? 'text-coral' : i === 1 ? 'text-gold' : i === 2 ? 'text-teal' : 'text-sage'),
              !isModern && 'drop-shadow-[2px_2px_0_var(--color-ink)]'
            ]">{{ highlight.prefix }}</div>
            <div :class="[isModern ? 'text-slate-900 dark:text-white' : 'text-ink bg-cream border-[3px] border-ink shadow-[2px_2px_0_var(--color-ink)] px-3 py-1 rounded-sm', 'font-black tracking-widest uppercase text-sm mb-5 inline-block mx-auto']">{{ highlight.title }}</div>
            <p :class="[isModern ? 'text-slate-500 dark:text-slate-400' : 'text-ink-soft', 'text-sm font-bold max-w-[180px] mx-auto leading-relaxed']">{{ highlight.desc }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
