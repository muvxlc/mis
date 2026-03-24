<script setup lang="ts">
const { loggedIn } = useUserSession();
</script>

<template>
  <div class="space-y-32 py-12">
    <!-- Section 01: Hero -->
    <section class="max-w-7xl mx-auto px-6 flex flex-col items-center text-center space-y-8 py-16">
      <h1 class="text-6xl md:text-8xl font-serif text-brand-primary leading-tight">
        Professional QR codes <br />
        <span class="text-brand-accent">made simple.</span>
      </h1>
      <p class="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
        Elevate your brand with sophisticated QR management. Secure, tracked, and infinitely styleable.
      </p>
      <div class="flex items-center justify-center gap-6 pt-6">
        <UButton v-if="loggedIn" to="/dashboard" size="xl" class="px-8 bg-brand-primary text-white hover:bg-slate-800">
           Go to Dashboard
        </UButton>
        <template v-else>
          <UButton to="/register" size="xl" class="px-8 bg-brand-primary text-white hover:bg-slate-800">
             Get Started
          </UButton>
          <UButton to="/login" size="xl" variant="ghost" class="text-brand-primary font-semibold">
             Sign In
          </UButton>
        </template>
      </div>
    </section>

    <!-- Section 02: Style It Your Way -->
    <section class="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
      <div class="space-y-6 order-2 lg:order-1">
        <span class="text-8xl font-serif text-brand-accent/20 block">02</span>
        <h2 class="text-5xl font-serif text-brand-primary">Style It Your Way</h2>
        <p class="text-lg text-slate-600 leading-relaxed">
          Customize every detail of your QR presence. From dots and corner patterns to integrated brand logos and custom colors, ensure your QR matches your brand identity perfectly.
        </p>
        <hr class="w-16 border-t-2 border-brand-accent" />
      </div>
      
      <div class="order-1 lg:order-2">
        <div class="mac-window">
          <div class="mac-title-bar">
            <div class="mac-dot mac-dot-red" />
            <div class="mac-dot mac-dot-yellow" />
            <div class="mac-dot mac-dot-green" />
            <span class="ml-4 text-xs text-white/50 font-sans tracking-widest uppercase">MIS Studio</span>
          </div>
          <div class="p-8 grid grid-cols-2 gap-8">
            <div class="space-y-4">
               <div class="p-3 border border-slate-100 rounded-lg shadow-sm">
                 <span class="text-[10px] uppercase tracking-wider text-slate-400 block mb-2">Dot Pattern</span>
                 <div class="grid grid-cols-4 gap-2">
                   <div class="w-full aspect-square bg-slate-100 rounded-full border-2 border-brand-accent" />
                   <div class="w-full aspect-square bg-slate-50 rounded-sm" />
                   <div class="w-full aspect-square bg-slate-50 rounded" />
                   <div class="w-full aspect-square bg-slate-100 rounded-full" />
                 </div>
               </div>
               <div class="p-3 border border-slate-100 rounded-lg shadow-sm">
                 <span class="text-[10px] uppercase tracking-wider text-slate-400 block mb-2">Primary Color</span>
                 <div class="flex gap-2">
                    <div class="w-6 h-6 rounded-full bg-brand-primary border-2 border-brand-accent" />
                    <div class="w-6 h-6 rounded-full bg-blue-600" />
                    <div class="w-6 h-6 rounded-full bg-rose-500" />
                    <div class="w-6 h-6 rounded-full bg-brand-accent" />
                 </div>
               </div>
            </div>
            <div class="flex items-center justify-center">
               <QRPreview value="https://mis.app" class="scale-125" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 03: Track Every Scan -->
    <section class="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
      <div>
        <div class="mac-window">
          <div class="mac-title-bar">
            <div class="mac-dot mac-dot-red" />
            <div class="mac-dot mac-dot-yellow" />
            <div class="mac-dot mac-dot-green" />
            <span class="ml-4 text-xs text-white/50 font-sans tracking-widest uppercase">Scan Analytics</span>
          </div>
          <div class="p-8 space-y-6">
            <div class="grid grid-cols-2 gap-4">
              <div class="p-4 bg-slate-50 rounded-lg border border-slate-100">
                <span class="text-xs uppercase text-slate-500 block">Total Scans</span>
                <span class="text-4xl font-serif text-brand-accent">2.4k</span>
              </div>
              <div class="p-4 bg-slate-50 rounded-lg border border-slate-100">
                <span class="text-xs uppercase text-slate-500 block">Unique Visitors</span>
                <span class="text-4xl font-serif text-brand-accent">834</span>
              </div>
            </div>
            <div class="h-32 w-full flex items-end justify-between gap-1">
               <div class="bg-brand-primary w-full" style="height: 30%"></div>
               <div class="bg-brand-primary w-full" style="height: 50%"></div>
               <div class="bg-brand-accent w-full" style="height: 80%"></div>
               <div class="bg-brand-primary w-full" style="height: 40%"></div>
               <div class="bg-brand-primary w-full" style="height: 90%"></div>
               <div class="bg-brand-primary w-full" style="height: 60%"></div>
               <div class="bg-brand-primary w-full" style="height: 45%"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <span class="text-8xl font-serif text-brand-accent/20 block">03</span>
        <h2 class="text-5xl font-serif text-brand-primary">Track Every Scan</h2>
        <p class="text-lg text-slate-600 leading-relaxed">
          Unlock real-time data from the physical world. Monitor scans, identify unique visitors, and filter performance by location, device type, and time.
        </p>
        <hr class="w-16 border-t-2 border-brand-accent" />
      </div>
    </section>
  </div>
</template>
