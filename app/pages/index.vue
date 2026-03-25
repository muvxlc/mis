<script setup lang="ts">
const { loggedIn } = useUserSession();

const highlights = [
  { prefix: 'Dynamic', title: 'QR CODES', desc: 'Update destinations without reprinting' },
  { prefix: 'Real-Time', title: 'SCAN ANALYTICS', desc: 'Device, location & browser insights' },
  { prefix: 'Unlimited', title: 'SCANS', desc: 'No caps, no throttling, ever' },
  { prefix: 'Free', title: 'TO START', desc: 'No credit card required' }
];
</script>

<template>
  <div class="min-h-screen bg-cream font-sans text-ink">
    <!-- Hero Section -->
    <section class="bg-ink text-warm-white pt-24 pb-32 px-6 lg:px-8 relative overflow-hidden">
      <div class="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 relative z-10">
        <!-- Hero Text -->
        <div class="lg:w-1/2 space-y-8">
          <div class="inline-flex items-center px-4 py-1.5 bg-warm-white/5 text-teal border-[3px] border-teal text-xs font-bold uppercase tracking-widest rounded-sm mb-2 shadow-[4px_4px_0_var(--color-teal)]">
            Free — No Credit Card Required
          </div>
          <h1 class="text-6xl md:text-7xl font-display font-bold leading-[1.05] tracking-tight">
            Create Your<br/>
            <span class="text-teal drop-shadow-[4px_4px_0_var(--color-ink-soft)]">Free QR Code.</span>
          </h1>
          <p class="text-lg text-cream/90 max-w-lg leading-relaxed pt-2 font-medium">
            Start with free static QR codes. Upgrade to dynamic plans when you need editable links and scan analytics. Make them yours with <span class="text-teal font-bold border-b-[3px] border-teal pb-0.5">QR Style Studio</span>.
            <br/><br/>
            <span class="text-gold font-bold text-sm bg-gold/10 px-2 py-1 border-[2px] border-gold rounded-sm">Dynamic plans include a 14-day free trial — no charge until it ends.</span>
          </p>
          
          <div class="flex flex-wrap items-center gap-6 text-xs font-bold text-warm-white uppercase tracking-wider py-4">
            <span class="flex items-center gap-2"><div class="w-3 h-3 border-[2px] border-ink bg-teal rotate-45 shadow-[2px_2px_0_var(--color-teal)]"></div> Free Static QR Codes</span>
            <span class="flex items-center gap-2"><div class="w-3 h-3 border-[2px] border-ink bg-gold rotate-45 shadow-[2px_2px_0_var(--color-gold)]"></div> 14-Day Dynamic Trial</span>
            <span class="flex items-center gap-2"><div class="w-3 h-3 border-[2px] border-ink bg-coral rotate-45 shadow-[2px_2px_0_var(--color-coral)]"></div> Scan Analytics</span>
          </div>

          <div class="flex flex-col sm:flex-row gap-5 pt-4">
            <UButton 
              to="/login"
              size="xl" 
              class="w-full sm:w-auto bg-teal border-[3px] border-ink hover:bg-teal-dark text-ink font-bold rounded-sm px-8 py-4 justify-center shadow-[6px_6px_0_var(--color-ink)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0_var(--color-ink)] transition-all uppercase tracking-wide text-sm"
            >
              START FREE + STYLE
            </UButton>
            <UButton 
              to="/register"
              variant="outline"
              size="xl" 
              color="neutral"
              class="w-full sm:w-auto border-[3px] border-gold bg-ink text-gold hover:bg-gold hover:text-ink font-bold rounded-sm px-8 py-4 justify-center shadow-[6px_6px_0_var(--color-gold)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0_var(--color-gold)] transition-all uppercase tracking-wide text-sm"
            >
              START 14-DAY FREE TRIAL
            </UButton>
          </div>
        </div>

        <!-- Hero Mockup Abstract -->
        <div class="lg:w-1/2 w-full flex justify-center lg:justify-end relative">
          <!-- Main abstract window -->
          <div class="bg-ink-soft border-[3px] border-ink rounded-sm shadow-[16px_16px_0_var(--color-ink)] p-8 relative overflow-hidden w-full max-w-md hidden md:block">
            <div class="absolute inset-x-0 top-0 h-2 bg-teal border-b-[3px] border-ink"></div>
            <div class="inline-flex border-[3px] border-teal bg-teal/10 text-teal rounded-sm px-3 py-1 text-[10px] uppercase tracking-widest font-bold mb-8 shadow-[2px_2px_0_var(--color-teal)]">QR CODE SCANS</div>
            
            <div class="flex gap-12 font-display mb-12">
              <div>
                <div class="text-5xl text-warm-white font-bold drop-shadow-[2px_2px_0_var(--color-ink)]">3,241</div>
                <div class="text-[10px] uppercase tracking-widest text-cream/60 font-sans mt-2 font-bold bg-ink px-2 py-0.5 rounded-sm border-[2px] border-ink inline-block">TOTAL SCANS</div>
              </div>
              <div>
                <div class="text-5xl text-teal font-bold drop-shadow-[2px_2px_0_var(--color-teal)]">68%</div>
                <div class="text-[10px] uppercase tracking-widest text-cream/60 font-sans mt-2 font-bold bg-ink px-2 py-0.5 rounded-sm border-[2px] border-ink inline-block">MOBILE</div>
              </div>
            </div>

            <!-- Stylized chart -->
            <div class="flex justify-between items-end h-32 border-b-[3px] border-ink pb-0 gap-2 opacity-100">
              <div class="w-full bg-teal border-[2px] border-b-0 border-ink rounded-t-sm shadow-[inset_2px_2px_0_rgba(255,255,255,0.2)]" style="height: 30%"></div>
              <div class="w-full bg-teal border-[2px] border-b-0 border-ink hover:bg-warm-white hover:h-[55%] rounded-t-sm cursor-pointer transition-all shadow-[inset_2px_2px_0_rgba(255,255,255,0.2)]" style="height: 50%"></div>
              <div class="w-full bg-teal border-[2px] border-b-0 border-ink hover:bg-warm-white hover:h-[25%] rounded-t-sm cursor-pointer transition-all shadow-[inset_2px_2px_0_rgba(255,255,255,0.2)]" style="height: 20%"></div>
              <div class="w-full bg-teal border-[2px] border-b-0 border-ink hover:bg-warm-white hover:h-[75%] rounded-t-sm cursor-pointer transition-all shadow-[inset_2px_2px_0_rgba(255,255,255,0.2)]" style="height: 70%"></div>
              <div class="w-full bg-warm-white border-[3px] border-b-0 border-ink rounded-t-sm relative shadow-glow z-10" style="height: 100%"></div>
              <div class="w-full bg-teal border-[2px] border-b-0 border-ink hover:bg-warm-white hover:h-[45%] rounded-t-sm cursor-pointer transition-all shadow-[inset_2px_2px_0_rgba(255,255,255,0.2)]" style="height: 40%"></div>
              <div class="w-full bg-teal border-[2px] border-b-0 border-ink hover:bg-warm-white hover:h-[65%] rounded-t-sm cursor-pointer transition-all shadow-[inset_2px_2px_0_rgba(255,255,255,0.2)]" style="height: 60%"></div>
              <div class="w-full bg-teal border-[2px] border-b-0 border-ink hover:bg-warm-white hover:h-[55%] rounded-t-sm cursor-pointer transition-all shadow-[inset_2px_2px_0_rgba(255,255,255,0.2)]" style="height: 50%"></div>
              <div class="w-full bg-teal border-[2px] border-b-0 border-ink hover:bg-warm-white hover:h-[85%] rounded-t-sm cursor-pointer transition-all shadow-[inset_2px_2px_0_rgba(255,255,255,0.2)]" style="height: 80%"></div>
              <div class="w-full bg-teal border-[2px] border-b-0 border-ink hover:bg-warm-white hover:h-[50%] rounded-t-sm cursor-pointer transition-all shadow-[inset_2px_2px_0_rgba(255,255,255,0.2)]" style="height: 45%"></div>
            </div>

            <div class="pt-8 text-center border-t-[3px] border-ink mt-4 bg-ink-soft">
              <NuxtLink to="/dashboard" class="text-[10px] uppercase tracking-widest font-bold text-gold bg-ink px-4 py-2 border-[2px] border-ink rounded-sm hover:bg-gold hover:text-ink transition-colors shadow-[2px_2px_0_var(--color-gold)] inline-block">
                SEE FULL DASHBOARD PREVIEW &rarr;
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Experience / Info Section -->
    <section class="py-24 px-6 lg:px-8 bg-cream border-t-[3px] border-ink relative z-20">
      <div class="max-w-7xl mx-auto space-y-20">
        <!-- Section Header -->
        <div class="flex flex-col md:flex-row justify-between items-end gap-6 border-b-[3px] border-ink pb-10">
          <div class="space-y-4">
            <p class="text-[10px] font-bold text-ink-soft tracking-widest uppercase border-[2px] border-ink-soft inline-block px-2 py-1 rounded-sm shadow-[2px_2px_0_var(--color-ink-soft)] bg-warm-white">SEE IT IN ACTION</p>
            <h2 class="text-5xl md:text-7xl font-display text-ink leading-tight tracking-tight font-bold">
              Experience the<br/>
              <span class="text-teal drop-shadow-[2px_2px_0_var(--color-ink)]">Full Platform</span>
            </h2>
          </div>
          <p class="text-ink-soft max-w-sm font-bold text-lg bg-warm-white p-4 border-[3px] border-ink rounded-sm shadow-sharp">From creation to analytics — see how MIS works before you even sign up.</p>
        </div>

        <div class="flex flex-col lg:flex-row items-center gap-16 lg:gap-24 relative">
          <!-- Visual Left -->
          <div class="lg:w-1/2 relative min-h-[550px] w-full flex justify-center lg:justify-start">
            <!-- Background Shape -->
            <div class="absolute -left-10 top-20 w-80 h-80 bg-gold border-[3px] border-ink shadow-[12px_12px_0_var(--color-ink)] rotate-12 pointer-events-none z-0 rounded-sm"></div>

            <!-- Dashboard Window -->
            <div class="absolute top-0 left-0 lg:left-10 w-80 border-[3px] border-ink bg-warm-white shadow-[12px_12px_0_var(--color-ink)] z-10 w-full sm:w-80 rounded-sm">
              <div class="bg-ink text-warm-white px-4 py-3 flex items-center justify-between border-b-[3px] border-ink">
                 <span class="text-[10px] font-bold uppercase tracking-widest text-gold drop-shadow-[1px_1px_0_var(--color-ink-soft)]">QR GENERATOR</span>
                 <div class="flex gap-2">
                   <div class="w-3 h-3 border-[2px] border-ink rounded-full bg-coral"></div>
                   <div class="w-3 h-3 border-[2px] border-ink rounded-full bg-gold"></div>
                   <div class="w-3 h-3 border-[2px] border-ink rounded-full bg-teal"></div>
                 </div>
              </div>
              <div class="p-8 text-center space-y-6">
                <h3 class="font-display text-3xl font-bold text-ink">Create QR Code</h3>
                <p class="text-xs text-ink-soft font-bold">professional QR codes for your website or social media profile in seconds</p>
                <div class="h-[3px] w-full bg-ink my-4"></div>
                <div class="grid grid-cols-2 gap-4 pb-8">
                  <div class="border-[3px] border-coral rounded-sm px-4 py-8 flex flex-col items-center gap-3 bg-coral hover:bg-coral-light hover:-translate-y-1 transition-transform shadow-[4px_4px_0_var(--color-ink)] cursor-pointer">
                     <UIcon name="i-heroicons-globe-alt" class="w-10 h-10 text-ink drop-shadow-md" />
                     <span class="text-xs font-bold text-ink">Website</span>
                  </div>
                  <div class="border-[3px] border-ink rounded-sm px-4 py-8 flex flex-col items-center gap-3 bg-cream hover:-translate-y-1 transition-transform shadow-[4px_4px_0_var(--color-ink)] cursor-pointer">
                     <UIcon name="i-heroicons-document-text" class="w-10 h-10 text-ink-soft drop-shadow-md" />
                     <span class="text-xs font-bold text-ink-soft">Document</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Style Studio Window -->
            <div class="absolute top-32 left-10 sm:left-40 lg:left-64 border-[3px] border-ink bg-warm-white shadow-[16px_16px_0_var(--color-ink)] z-20 w-80 rounded-sm">
               <div class="bg-ink px-4 py-3 flex items-center gap-3 border-b-[3px] border-ink">
                  <div class="flex gap-2 border-r-[3px] border-ink-soft pr-4">
                     <div class="w-3 h-3 border-[2px] border-ink rounded-full bg-coral"></div>
                     <div class="w-3 h-3 border-[2px] border-ink rounded-full bg-gold"></div>
                     <div class="w-3 h-3 border-[2px] border-ink rounded-full bg-teal"></div>
                  </div>
                  <div class="text-[10px] text-warm-white font-bold tracking-widest uppercase drop-shadow-[1px_1px_0_var(--color-ink-soft)]">QR Style Studio</div>
               </div>
               <div class="p-8 space-y-6">
                  <!-- Abstract generator viz -->
                  <div class="w-full aspect-square border-[3px] border-ink bg-cream flex items-center justify-center p-6 relative shadow-[inset_4px_4px_0_rgba(0,0,0,0.05)] rounded-sm">
                    <div class="absolute top-2 right-2 text-[10px] font-bold text-ink uppercase tracking-wider bg-gold px-2 py-0.5 border-[2px] border-ink rounded-sm shadow-[2px_2px_0_var(--color-ink)]">Generate</div>
                    <UIcon name="i-heroicons-qr-code" class="w-full h-full text-ink drop-shadow-md" />
                  </div>
                  
                  <div class="space-y-4 pt-4">
                    <div class="text-xs font-bold text-ink uppercase tracking-widest border-b-[3px] border-ink pb-2">Style Controls</div>
                    
                    <div class="space-y-2">
                      <div class="text-[10px] font-bold text-ink flex items-center gap-2 uppercase tracking-wide"><div class="w-2.5 h-2.5 bg-ink rounded-full border-[2px] border-ink"></div> Dot shape</div>
                      <div class="border-[3px] border-ink bg-warm-white rounded-sm py-2 px-3 text-sm text-center font-bold shadow-[2px_2px_0_var(--color-ink)] text-ink">Rounded</div>
                    </div>
                    
                    <div class="space-y-2">
                      <div class="text-[10px] font-bold text-ink flex items-center gap-2 uppercase tracking-wide"><div class="w-2.5 h-2.5 bg-coral border-[2px] border-ink"></div> Corner shape</div>
                      <div class="border-[3px] border-ink bg-warm-white rounded-sm py-2 px-3 text-sm text-center font-bold shadow-[2px_2px_0_var(--color-ink)] text-ink">Square</div>
                    </div>
                  </div>
                  
                  <div class="flex gap-3 pt-4">
                    <UButton class="flex-1 justify-center bg-cream border-[3px] border-ink text-ink hover:bg-gold hover:text-ink rounded-sm font-bold shadow-[4px_4px_0_var(--color-ink)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_var(--color-ink)] transition-all uppercase" size="md">RESET</UButton>
                    <UButton class="w-16 justify-center bg-teal hover:bg-teal-dark border-[3px] border-ink text-ink rounded-sm font-bold shadow-[4px_4px_0_var(--color-ink)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_var(--color-ink)] transition-all" size="md"><UIcon name="i-heroicons-check" class="w-6 h-6 stroke-[3px]"/></UButton>
                  </div>
               </div>
            </div>
          </div>

          <!-- Text Right -->
          <div class="lg:w-1/2 space-y-8 pl-0 lg:pl-16">
            <span class="text-sm text-ink font-bold border-[3px] border-ink rounded-sm px-3 py-1 bg-cream shadow-sharp inline-block">02</span>
            <h3 class="text-5xl font-display text-ink font-bold drop-shadow-[2px_2px_0_var(--color-teal)]">Style Studio</h3>
            <p class="text-ink-soft text-xl font-bold leading-relaxed">Customise colours, patterns, corners, and add your logo. Make every QR code on-brand.</p>
            <div class="pt-6">
              <UButton class="bg-coral border-[3px] border-ink hover:bg-coral-dark text-ink rounded-sm font-bold px-8 py-3 shadow-[6px_6px_0_var(--color-ink)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0_var(--color-ink)] transition-all text-sm uppercase tracking-widest" trailing-icon="i-heroicons-arrow-right">See Styles</UButton>
            </div>
            
            <!-- Abstract pagination controls -->
            <div class="flex items-center gap-4 pt-16">
               <div class="w-4 h-4 bg-ink border-[3px] border-ink shadow-[2px_2px_0_var(--color-gold)] hover:bg-gold transition-colors cursor-pointer rounded-sm"></div>
               <div class="w-4 h-4 bg-cream border-[3px] border-ink hover:bg-gold transition-colors cursor-pointer shadow-[2px_2px_0_var(--color-ink)] rounded-sm"></div>
               <div class="w-4 h-4 bg-cream border-[3px] border-ink hover:bg-gold transition-colors cursor-pointer shadow-[2px_2px_0_var(--color-ink)] rounded-sm"></div>
               <div class="w-4 h-4 bg-cream border-[3px] border-ink hover:bg-gold transition-colors cursor-pointer shadow-[2px_2px_0_var(--color-ink)] rounded-sm"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Stat Features Strip -->
    <section class="pb-24 px-6 relative max-w-[1400px] mx-auto z-30 -mt-16 lg:pl-[5vw]">
      <div class="border-[3px] border-ink bg-warm-white p-12 lg:p-14 relative shadow-[16px_16px_0_var(--color-ink)] rounded-sm">
        <div class="absolute -top-[3px] right-20 left-20 h-[6px] bg-gradient-to-r from-coral via-gold to-teal"></div>
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 md:gap-12 divide-y-[3px] md:divide-y-0 md:divide-x-[3px] divide-ink">
          <div v-for="(highlight, i) in highlights" :key="i" class="text-center px-6 pt-8 md:pt-0 pb-8 md:pb-0 border-ink">
            <div :class="[
              'text-5xl font-display font-bold mb-5 tracking-tight drop-shadow-[2px_2px_0_var(--color-ink)]',
              i === 0 ? 'text-coral' : i === 1 ? 'text-gold' : i === 2 ? 'text-teal' : 'text-sage'
            ]">{{ highlight.prefix }}</div>
            <div class="text-ink font-black tracking-widest uppercase text-sm mb-5 bg-cream border-[3px] border-ink shadow-[2px_2px_0_var(--color-ink)] inline-block px-3 py-1 rounded-sm mx-auto">{{ highlight.title }}</div>
            <p class="text-ink-soft text-sm font-bold max-w-[180px] mx-auto leading-relaxed">{{ highlight.desc }}</p>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>
