<script setup lang="ts">
const { loggedIn, user, clear } = useUserSession();

const logout = async () => {
  await $fetch('/api/auth/logout', { method: 'POST' });
  await clear();
  navigateTo('/login');
};
</script>

<template>
  <div class="min-h-screen bg-cream flex flex-col font-sans text-ink selection:bg-teal selection:text-warm-white">
    <!-- Header -->
    <header class="bg-cream border-b-[3px] border-ink py-4 px-6 relative z-50">
      <div class="flex justify-between items-center" :class="loggedIn ? 'w-full' : 'max-w-7xl mx-auto w-full'">
        <NuxtLink to="/" class="flex items-center gap-3">
          <div class="bg-ink p-1.5 shadow-sharp border-[2px] border-ink rounded-sm">
            <UIcon name="i-heroicons-server-stack" class="w-5 h-5 text-warm-white" />
          </div>
          <h1 class="text-xl font-display font-bold tracking-tight text-ink">M I S</h1>
        </NuxtLink>
        
        <nav v-if="!loggedIn" class="hidden md:flex items-center gap-8 justify-center flex-1 ml-12">
           <NuxtLink to="/" class="text-sm font-bold text-ink-soft hover:text-teal transition-colors">Home</NuxtLink>
           <NuxtLink to="#" class="text-sm font-bold text-ink-soft hover:text-teal transition-colors">Pricing</NuxtLink>
           <NuxtLink to="#" class="text-sm font-bold text-ink-soft hover:text-teal transition-colors">About</NuxtLink>
        </nav>

        <div v-if="!loggedIn" class="flex items-center gap-4 border-l-[3px] border-ink pl-6">
          <NuxtLink to="/login" class="font-bold text-ink hover:text-coral transition-colors">
            Log in
          </NuxtLink>
          <NuxtLink to="/register" class="font-bold border-[3px] border-ink bg-coral hover:bg-coral-dark text-ink shadow-[4px_4px_0_var(--color-ink)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all rounded-sm px-6 py-2">
            Sign up
          </NuxtLink>
        </div>
        <div v-else class="flex items-center gap-4 border-l-[3px] border-ink pl-6">
          <div class="hidden sm:flex items-center gap-2 mr-2">
             <div class="w-8 h-8 rounded-sm bg-teal/10 border-[3px] border-ink flex items-center justify-center text-ink font-bold text-xs uppercase shadow-[2px_2px_0_var(--color-ink)]">
               {{ user?.name?.[0] || user?.email?.[0] || 'U' }}
             </div>
             <span class="text-sm font-bold text-ink">{{ user?.name || user?.email }}</span>
          </div>
          <UButton @click="logout" color="neutral" variant="ghost" icon="i-heroicons-arrow-left-on-rectangle" class="text-ink-soft hover:text-coral rounded-sm font-bold" label="LOGOUT" />
        </div>
      </div>
    </header>

    <div v-if="loggedIn" class="flex flex-1 overflow-hidden h-[calc(100vh-80px)]">
      <!-- Sidebar for authenticated users -->
      <aside class="w-64 bg-cream border-r-[3px] border-ink hidden md:flex flex-col h-full overflow-y-auto">
        <div class="p-6">
          <p class="text-[10px] font-bold text-ink-soft uppercase tracking-widest mb-4 border-b-[3px] border-ink pb-2">Main Menu</p>
          <nav class="space-y-2">
            <NuxtLink to="/dashboard" class="flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-bold text-ink hover:bg-gold/20 transition-all border-[3px] border-transparent hover:border-ink hover:shadow-[2px_2px_0_var(--color-ink)] hover:-translate-y-px" active-class="bg-gold border-ink shadow-[2px_2px_0_var(--color-ink)] text-ink hover:shadow-[2px_2px_0_var(--color-ink)]">
              <UIcon name="i-heroicons-squares-2x2" class="w-5 h-5 flex-shrink-0" />
              Overview
            </NuxtLink>
            <NuxtLink to="/feature1" class="flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-bold text-ink hover:bg-gold/20 transition-all border-[3px] border-transparent hover:border-ink hover:shadow-[2px_2px_0_var(--color-ink)] hover:-translate-y-px" active-class="bg-gold border-ink shadow-[2px_2px_0_var(--color-ink)] text-ink hover:shadow-[2px_2px_0_var(--color-ink)]">
              <UIcon name="i-heroicons-chart-bar" class="w-5 h-5 flex-shrink-0" />
              Analytics
            </NuxtLink>
            <NuxtLink to="/feature2" class="flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-bold text-ink hover:bg-gold/20 transition-all border-[3px] border-transparent hover:border-ink hover:shadow-[2px_2px_0_var(--color-ink)] hover:-translate-y-px" active-class="bg-gold border-ink shadow-[2px_2px_0_var(--color-ink)] text-ink hover:shadow-[2px_2px_0_var(--color-ink)]">
              <UIcon name="i-heroicons-document-text" class="w-5 h-5 flex-shrink-0" />
              Reports
            </NuxtLink>
          </nav>

          <template v-if="user?.role === 'admin' || user?.role === 'superadmin'">
            <p class="text-[10px] font-bold text-ink-soft uppercase tracking-widest mt-8 mb-4 border-b-[3px] border-ink pb-2">Settings</p>
            <nav class="space-y-2">
              <NuxtLink to="/admin/users" class="flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-bold text-ink hover:bg-teal/20 transition-all border-[3px] border-transparent hover:border-ink hover:shadow-[2px_2px_0_var(--color-ink)] hover:-translate-y-px" active-class="bg-teal border-ink shadow-[2px_2px_0_var(--color-ink)] text-ink hover:shadow-[2px_2px_0_var(--color-ink)]">
                <UIcon name="i-heroicons-users" class="w-5 h-5 flex-shrink-0" />
                Team Access
              </NuxtLink>
              <NuxtLink to="/admin/roles" class="flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-bold text-ink hover:bg-teal/20 transition-all border-[3px] border-transparent hover:border-ink hover:shadow-[2px_2px_0_var(--color-ink)] hover:-translate-y-px" active-class="bg-teal border-ink shadow-[2px_2px_0_var(--color-ink)] text-ink hover:shadow-[2px_2px_0_var(--color-ink)]">
                <UIcon name="i-heroicons-shield-check" class="w-5 h-5 flex-shrink-0" />
                Security
              </NuxtLink>
            </nav>
          </template>
        </div>
      </aside>

      <!-- Main Content Area -->
      <main class="flex-1 w-full relative min-w-0 overflow-y-auto bg-warm-white p-6">
        <slot />
      </main>
    </div>

    <!-- Layout for unauthenticated users -->
    <template v-else>
      <main class="flex-1">
        <slot />
      </main>

      <footer class="bg-ink text-warm-white py-20 border-t-[3px] border-ink px-8 mt-auto hidden lg:block">
        <div class="max-w-7xl mx-auto flex flex-col items-center text-center space-y-12">
          
          <div class="space-y-4">
             <div class="text-sm uppercase tracking-widest text-gold font-bold">Why QuikQR?</div>
             <h2 class="text-6xl font-display font-bold">Start Free.<br/><span class="text-coral">Try Dynamic Plans Free for 14 Days.</span></h2>
             <p class="text-base text-cream/70 max-w-lg mx-auto leading-relaxed pt-2">Create static QR codes for free or choose an affordable dynamic plan.<br/>No lock-in — start free and upgrade only when you need more.</p>
          </div>

          <!-- Mini Pricing table -->
          <div class="w-full max-w-4xl border-[3px] border-ink-soft rounded-sm overflow-hidden flex flex-col md:flex-row shadow-[12px_12px_0_var(--color-ink-soft)]">
             <div class="md:w-1/3 bg-ink p-8 border-b-[3px] md:border-b-0 md:border-r-[3px] border-ink-soft space-y-6">
                 <div class="text-xs uppercase font-bold text-cream/50 tracking-widest text-left">Feature</div>
                 <ul class="text-sm space-y-5 text-left font-bold text-warm-white">
                    <li>Free Static QR Codes</li>
                    <li>Affordable Dynamic Plans</li>
                    <li>Editable Destinations</li>
                    <li>Scan Analytics</li>
                 </ul>
             </div>
             <div class="md:w-1/3 bg-teal p-8 border-b-[3px] md:border-b-0 md:border-r-[3px] border-ink-soft flex flex-col items-center">
                 <div class="text-xs uppercase font-bold text-ink tracking-widest mb-6">QUIKQR <UIcon name="i-heroicons-star-solid"/></div>
                 <ul class="text-base space-y-4 text-center text-ink">
                    <li><UIcon name="i-heroicons-check-circle-solid" class="w-6 h-6"/></li>
                    <li><UIcon name="i-heroicons-check-circle-solid" class="w-6 h-6"/></li>
                    <li><UIcon name="i-heroicons-check-circle-solid" class="w-6 h-6"/></li>
                    <li><UIcon name="i-heroicons-check-circle-solid" class="w-6 h-6"/></li>
                 </ul>
             </div>
             <div class="md:w-1/3 bg-ink-soft p-8 flex flex-col items-center">
                 <div class="text-xs uppercase font-bold text-cream/50 tracking-widest mb-6">Typical QR Tools</div>
                 <ul class="text-base space-y-4 text-center text-coral">
                    <li><UIcon name="i-heroicons-x-circle-solid" class="w-6 h-6"/></li>
                    <li><UIcon name="i-heroicons-check-circle-solid" class="w-6 h-6"/></li>
                    <li><UIcon name="i-heroicons-check-circle-solid" class="w-6 h-6"/></li>
                    <li><UIcon name="i-heroicons-x-circle-solid" class="w-6 h-6"/></li>
                 </ul>
             </div>
          </div>
        </div>
      </footer>
    </template>
  </div>
</template>
