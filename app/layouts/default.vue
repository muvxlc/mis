<script setup lang=ts>
const colorMode = useColorMode();
const theme = useCookie('app-theme', { default: () => 'neo' });

const isModern = computed(() => theme.value === 'modern');

const toggleTheme = () => {
  theme.value = theme.value === 'neo' ? 'modern' : 'neo';
};

const toggleColorMode = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark';
};

const { loggedIn, user, clear } = useUserSession();
const { groupedMenus, fetchMenus, loading: menusLoading } = useMenus();

const logout = async () => {
  await ('/api/auth/logout', { method: 'POST' });
  await clear();
  navigateTo('/login');
};

onMounted(() => {
  if (loggedIn.value) fetchMenus();
});

watch(loggedIn, (val) => {
  if (val) fetchMenus();
});
</script>

<template>
  <div :class="[isModern ? 'theme-modern' : 'theme-neo', 'min-h-screen flex flex-col font-sans transition-colors duration-300']">
    <!-- Header -->
    <header :class="[
      isModern ? 'bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm' : 'bg-cream border-b-[3px] border-ink',
      'py-4 px-6 relative z-50 transition-all'
    ]">
      <div class="flex justify-between items-center" :class="loggedIn ? 'w-full' : 'max-w-7xl mx-auto w-full'">
        <NuxtLink to="/" class="flex items-center gap-3 group">
          <div :class="[
            isModern ? 'bg-blue-600 dark:bg-blue-500 p-2 rounded-lg shadow-blue-500/20 shadow-lg group-hover:scale-110 transition-transform' : 'bg-ink p-1.5 shadow-sharp border-[2px] border-ink rounded-sm',
          ]">
            <UIcon name="i-heroicons-server-stack" :class="[isModern ? 'w-5 h-5 text-white' : 'w-5 h-5 text-warm-white']" />
          </div>
          <h1 :class="[
            isModern ? 'text-xl font-bold tracking-tight text-slate-900 dark:text-white' : 'text-xl font-display font-bold tracking-tight text-ink'
          ]">M I S</h1>
        </NuxtLink>
        
        <nav v-if="!loggedIn" class="hidden md:flex items-center gap-8 justify-center flex-1 ml-12">
           <NuxtLink to="/" :class="[isModern ? 'text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400' : 'text-sm font-bold text-ink-soft hover:text-teal', 'transition-colors']">Home</NuxtLink>
           <NuxtLink to="#" :class="[isModern ? 'text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400' : 'text-sm font-bold text-ink-soft hover:text-teal', 'transition-colors']">Pricing</NuxtLink>
           <NuxtLink to="#" :class="[isModern ? 'text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400' : 'text-sm font-bold text-ink-soft hover:text-teal', 'transition-colors']">About</NuxtLink>
        </nav>

        <div class="flex items-center gap-4" :class="[isModern ? '' : 'border-l-[3px] border-ink pl-6']">
          <!-- Theme & Color Mode Toggles -->
          <div class="flex items-center gap-2 mr-2">
            <UButton
              :icon="isModern ? 'i-heroicons-sparkles' : 'i-heroicons-cube-transparent'"
              color="neutral"
              variant="ghost"
              @click="toggleTheme"
              :title="isModern ? 'Switch to Neo-Brutalism' : 'Switch to Modern'"
            />
            <UButton
              v-if="isModern"
              :icon="colorMode.value === 'dark' ? 'i-heroicons-moon' : 'i-heroicons-sun'"
              color="neutral"
              variant="ghost"
              @click="toggleColorMode"
            />
          </div>

          <template v-if="!loggedIn">
            <NuxtLink to="/login" :class="[isModern ? 'text-sm font-medium text-slate-600 dark:text-slate-400' : 'font-bold text-ink', 'hover:text-blue-600 transition-colors']">
              Log in
            </NuxtLink>
            <NuxtLink to="/register" :class="[
              isModern ? 'bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full text-sm font-semibold shadow-md' : 'font-bold border-[3px] border-ink bg-coral hover:bg-coral-dark text-ink shadow-[4px_4px_0_var(--color-ink)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] px-6 py-2 rounded-sm',
              'transition-all'
            ]">
              Sign up
            </NuxtLink>
          </template>
          <div v-else class="flex items-center gap-4">
            <div class="hidden sm:flex items-center gap-2 mr-2">
               <div :class="[
                 isModern ? 'w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs uppercase border border-blue-200 dark:border-blue-800' : 'w-8 h-8 rounded-sm bg-teal/10 border-[3px] border-ink flex items-center justify-center text-ink font-bold text-xs uppercase shadow-[2px_2px_0_var(--color-ink)]'
               ]">
                 {{ user?.name?.[0] || user?.email?.[0] || 'U' }}
               </div>
               <span :class="[isModern ? 'text-sm font-medium text-slate-700 dark:text-slate-200' : 'text-sm font-bold text-ink']">{{ user?.name || user?.email }}</span>
            </div>
            <UButton @click="logout" color="neutral" variant="ghost" icon="i-heroicons-arrow-left-on-rectangle" :class="[isModern ? 'text-slate-500 hover:text-red-500' : 'text-ink-soft hover:text-coral font-bold rounded-sm']" label="LOGOUT" />
          </div>
        </div>
      </div>
    </header>

    <div v-if="loggedIn" class="flex flex-1 overflow-hidden h-[calc(100vh-80px)]">
      <!-- Sidebar -->
      <aside :class="[
        isModern ? 'w-64 bg-slate-50 dark:bg-slate-900/50 border-r border-slate-200 dark:border-slate-800' : 'w-72 bg-cream border-r-[3px] border-ink',
        'hidden md:flex flex-col h-full overflow-y-auto transition-all'
      ]">
        <div class="p-6">
          <div v-if="menusLoading" class="space-y-4 animate-pulse pt-4">
             <div class="h-4 bg-slate-200 dark:bg-slate-800 w-1/2 rounded"></div>
             <div class="h-10 bg-slate-100 dark:bg-slate-800/50 w-full rounded-lg"></div>
          </div>

          <div v-else v-for="(group, category) in groupedMenus" :key="category" class="mb-8 last:mb-0">
            <p :class="[
              isModern ? 'text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 px-2' : 'text-[10px] font-bold text-ink-soft uppercase tracking-widest mb-4 border-b-[3px] border-ink pb-2'
            ]">{{ category }}</p>
            <nav class="space-y-1">
              <NuxtLink 
                v-for="item in group" 
                :key="item.id" 
                :to="item.path" 
                :class="[
                  isModern 
                    ? 'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group' 
                    : 'flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-bold text-ink hover:bg-gold/20 transition-all border-[3px] border-transparent hover:border-ink hover:shadow-[2px_2px_0_var(--color-ink)] hover:-translate-y-px',
                ]"
                :active-class="isModern ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'bg-gold border-ink shadow-[2px_2px_0_var(--color-ink)] text-ink'"
                :inactive-class="isModern ? 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white' : ''"
              >
                <UIcon :name="item.icon" class="w-5 h-5 flex-shrink-0" />
                {{ item.label }}
              </NuxtLink>
            </nav>
          </div>
        </div>
      </aside>

      <!-- Main Content Area -->
      <main :class="[
        isModern ? 'bg-white dark:bg-slate-950 p-8' : 'bg-warm-white p-6',
        'flex-1 w-full relative min-w-0 overflow-y-auto transition-all'
      ]">
        <slot />
      </main>
    </div>

    <!-- Layout for unauthenticated users -->
    <template v-else>
      <main class="flex-1">
        <slot />
      </main>

      <footer :class="[
        isModern ? 'bg-slate-900 text-white' : 'bg-ink text-warm-white',
        'py-20 px-8 mt-auto hidden lg:block transition-all'
      ]">
        <div class="max-w-7xl mx-auto flex flex-col items-center text-center space-y-12">
          <div class="space-y-4">
             <div :class="[isModern ? 'text-blue-400 font-semibold' : 'text-gold font-bold', 'text-sm uppercase tracking-widest']">Why QuikQR?</div>
             <h2 class="text-6xl font-display font-bold">Start Free.<br/><span :class="isModern ? 'text-blue-500' : 'text-coral'">Try Dynamic Plans Free for 14 Days.</span></h2>
             <p class="text-base text-slate-400 max-w-lg mx-auto leading-relaxed pt-2">Create static QR codes for free or choose an affordable dynamic plan.<br/>No lock-in — start free and upgrade only when you need more.</p>
          </div>
        </div>
      </footer>
    </template>
  </div>
</template>

<style scoped>
.theme-modern {
  --color-bg: theme('colors.slate.50');
  --color-text: theme('colors.slate.900');
}

.theme-neo {
  --color-bg: #faf8f5;
  --color-text: #1a1a2e;
}

.dark .theme-modern {
  --color-bg: theme('colors.slate.950');
  --color-text: theme('colors.slate.50');
}
</style>