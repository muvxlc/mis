<script setup lang="ts">
const { loggedIn, user, clear } = useUserSession();

const logout = async () => {
  await $fetch('/api/auth/logout', { method: 'POST' });
  await clear();
  navigateTo('/login');
};
</script>

<template>
  <div class="min-h-screen bg-brand-bg flex flex-col font-sans">
    <header class="bg-brand-primary py-4 px-6 sticky top-0 z-50 shadow-md">
      <div class="flex justify-between items-center" :class="loggedIn ? 'w-full' : 'max-w-7xl mx-auto w-full'">
        <NuxtLink to="/" class="flex items-center gap-3">
          <div class="bg-brand-accent p-1.5 rounded-lg">
            <UIcon name="i-heroicons-qr-code" class="w-6 h-6 text-brand-primary" />
          </div>
          <h1 class="text-2xl font-serif font-bold text-white tracking-tight">MIS</h1>
        </NuxtLink>
        
        <nav v-if="!loggedIn" class="flex items-center gap-8">
          <NuxtLink to="/login" class="text-white/80 hover:text-brand-accent transition-colors font-medium">Login</NuxtLink>
          <UButton to="/register" class="bg-brand-accent text-brand-primary hover:bg-yellow-400 font-bold px-6">
            Get Started
          </UButton>
        </nav>
        <div v-else class="flex items-center gap-4">
          <div class="hidden sm:flex items-center gap-2 mr-4">
             <div class="w-8 h-8 rounded-full bg-brand-accent/20 flex items-center justify-center text-brand-accent font-bold text-xs uppercase">{{ user?.email?.[0] || 'U' }}</div>
             <span class="text-white/80 text-sm font-medium">{{ user?.email }}</span>
          </div>
          <UButton @click="logout" color="neutral" variant="ghost" icon="i-heroicons-arrow-left-on-rectangle" class="text-white hover:bg-white/10" label="Logout" />
        </div>
      </div>
    </header>

    <div v-if="loggedIn" class="flex flex-1 overflow-hidden">
      <!-- Sidebar for authenticated users -->
      <aside class="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm hidden md:flex h-[calc(100vh-72px)] sticky top-[72px] overflow-y-auto">
        <div class="p-6">
          <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Main Menu</p>
          <nav class="space-y-1.5">
            <NuxtLink to="/dashboard" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-primary transition-colors" active-class="bg-brand-primary/5 text-brand-primary font-bold">
              <UIcon name="i-heroicons-squares-2x2" class="w-5 h-5 flex-shrink-0" />
              Dashboard
            </NuxtLink>
            <NuxtLink to="/feature1" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-primary transition-colors" active-class="bg-brand-primary/5 text-brand-primary font-bold">
              <UIcon name="i-heroicons-chart-bar" class="w-5 h-5 flex-shrink-0" />
              Feature 1
            </NuxtLink>
            <NuxtLink to="/feature2" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-primary transition-colors" active-class="bg-brand-primary/5 text-brand-primary font-bold">
              <UIcon name="i-heroicons-document-text" class="w-5 h-5 flex-shrink-0" />
              Feature 2
            </NuxtLink>
          </nav>

          <template v-if="user?.role === 'admin' || user?.role === 'superadmin'">
            <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-8 mb-4">Settings</p>
            <nav class="space-y-1.5">
              <NuxtLink to="/admin/users" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-primary transition-colors" active-class="bg-brand-primary/5 text-brand-primary font-bold">
                <UIcon name="i-heroicons-users" class="w-5 h-5 flex-shrink-0" />
                User Management
              </NuxtLink>
              <NuxtLink to="/admin/roles" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-primary transition-colors" active-class="bg-brand-primary/5 text-brand-primary font-bold">
                <UIcon name="i-heroicons-shield-check" class="w-5 h-5 flex-shrink-0" />
                Role Management
              </NuxtLink>
            </nav>
          </template>
        </div>
      </aside>

      <!-- Main Content Area -->
      <main class="flex-1 w-full bg-brand-bg relative min-w-0">
        <slot />
      </main>
    </div>

    <!-- Layout for unauthenticated users -->
    <template v-else>
      <main class="flex-1">
        <slot />
      </main>

      <footer class="bg-brand-primary py-12 px-8 border-t border-white/5">
        <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-white/60">
          <div class="col-span-2 space-y-4">
            <div class="flex items-center gap-3">
               <div class="bg-brand-accent p-1 rounded-md">
                 <UIcon name="i-heroicons-qr-code" class="w-5 h-5 text-brand-primary" />
               </div>
               <span class="text-xl font-serif font-bold text-white">MIS</span>
            </div>
            <p class="max-w-xs leading-relaxed">
              The professional standard for management information system and real-time analytics.
            </p>
          </div>
          <div class="space-y-4">
             <h4 class="text-white font-bold">Product</h4>
             <ul class="space-y-2 text-sm">
               <li><NuxtLink to="/">Home</NuxtLink></li>
               <li><NuxtLink to="/login">Login</NuxtLink></li>
               <li>Pricing</li>
             </ul>
          </div>
          <div class="space-y-4 text-right">
             <p class="text-sm">
               &copy; {{ new Date().getFullYear() }} MIS Studio.<br />
               All rights reserved.
             </p>
             <hr class="w-full border-white/10 ml-auto" />
          </div>
        </div>
      </footer>
    </template>
  </div>
</template>
