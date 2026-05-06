<script setup lang="ts">
const { loggedIn } = useUserSession()
const theme = useCookie('app-theme')
const isModern = computed(() => theme.value === 'modern')
</script>

<template>
  <div :class="[
    isModern ? 'bg-slate-50 dark:bg-slate-950 min-h-screen py-16 px-4' : 'bg-cream min-h-screen py-20 px-4'
  ]">
    <div :class="[
      isModern ? 'max-w-md mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8' : 'max-w-md mx-auto bg-warm-white border-[3px] border-ink shadow-sharp p-8'
    ]">
      <div class="text-center mb-8">
        <NuxtLink to="/" class="inline-flex items-center gap-2 mb-6">
           <div :class="[isModern ? 'bg-blue-600 p-2 rounded-lg' : 'bg-ink p-1.5 border-[2px] border-ink rounded-sm']">
            <UIcon name="i-heroicons-server-stack" class="w-6 h-6 text-white" />
          </div>
          <span :class="[isModern ? 'text-2xl font-bold text-slate-900 dark:text-white' : 'text-2xl font-display font-bold text-ink']">M I S</span>
        </NuxtLink>
        <h1 :class="[isModern ? 'text-2xl font-bold text-slate-900 dark:text-white' : 'text-2xl font-display font-bold text-ink']">Welcome Back</h1>
        <p :class="[isModern ? 'text-slate-500 dark:text-slate-400 mt-2' : 'text-ink-soft font-bold mt-2']">Log in to manage your services</p>
      </div>

      <form class="space-y-6">
        <div class="space-y-2">
          <label :class="[isModern ? 'text-sm font-medium text-slate-700 dark:text-slate-300' : 'text-xs uppercase font-bold text-ink']">Email Address</label>
          <input 
            type="email" 
            placeholder="name@company.com"
            :class="[
              isModern ? 'w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all' : 'w-full px-4 py-3 bg-warm-white border-[3px] border-ink focus:bg-cream outline-none font-bold'
            ]"
          />
        </div>

        <div class="space-y-2">
          <label :class="[isModern ? 'text-sm font-medium text-slate-700 dark:text-slate-300' : 'text-xs uppercase font-bold text-ink']">Password</label>
          <input 
            type="password" 
            placeholder="••••••••"
            :class="[
              isModern ? 'w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all' : 'w-full px-4 py-3 bg-warm-white border-[3px] border-ink focus:bg-cream outline-none font-bold'
            ]"
          />
        </div>

        <button 
          type="submit"
          :class="[
            isModern ? 'w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98]' : 'w-full py-4 bg-teal hover:bg-teal-dark border-[3px] border-ink shadow-[4px_4px_0_var(--color-ink)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all font-bold text-ink'
          ]"
        >
          Sign In
        </button>

        <div class="relative py-4">
          <div class="absolute inset-0 flex items-center"><div :class="isModern ? 'w-full border-t border-slate-200 dark:border-slate-800' : 'w-full border-t-[3px] border-ink/10'"></div></div>
          <div class="relative flex justify-center text-xs uppercase">
            <span :class="[isModern ? 'bg-white dark:bg-slate-900 px-2 text-slate-500' : 'bg-warm-white px-4 font-bold text-ink-soft']">Or continue with</span>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
           <UButton 
             block 
             label="ThaiID" 
             icon="i-heroicons-identification" 
             color="neutral" 
             :variant="isModern ? 'outline' : 'solid'"
             :class="isModern ? 'rounded-lg' : 'border-[3px] border-ink shadow-[4px_4px_0_var(--color-ink)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] font-bold h-12 rounded-sm'"
           />
           <UButton 
             block 
             label="Authentik" 
             icon="i-heroicons-shield-check" 
             color="neutral" 
             :variant="isModern ? 'outline' : 'solid'"
             :class="isModern ? 'rounded-lg' : 'border-[3px] border-ink shadow-[4px_4px_0_var(--color-ink)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] font-bold h-12 rounded-sm'"
           />
        </div>
      </form>

      <p :class="[isModern ? 'text-center mt-8 text-sm text-slate-500' : 'text-center mt-8 text-xs font-bold text-ink-soft']">
        Don't have an account? 
        <NuxtLink to="/register" :class="isModern ? 'text-blue-600 hover:underline' : 'text-coral underline ml-1'">Create one for free</NuxtLink>
      </p>
    </div>
  </div>
</template>