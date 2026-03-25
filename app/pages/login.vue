<script setup lang="ts">
definePageMeta({
  middleware: 'guest'
});

const { fetch: fetchSession } = useUserSession();
const toast = useToast();

const state = reactive({
  identifier: '',
  password: ''
});

const loading = ref(false);

const onLogin = async () => {
  loading.value = true;
  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: state
    });
    await fetchSession();
    toast.add({ title: 'Welcome Back', description: 'Logged in successfully', color: 'success' });
    navigateTo('/dashboard');
  } catch (err: any) {
    toast.add({ title: 'Authentication Failed', description: err.data?.message || 'Invalid credentials', color: 'error' });
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-[80vh] flex items-center justify-center px-6">
    <div class="w-full max-w-md">
      <div class="bg-warm-white rounded-sm shadow-[8px_8px_0_var(--color-ink)] border-[3px] border-ink overflow-hidden border-t-[8px] border-t-teal">
        <div class="p-10 space-y-8 relative z-10">
          <div class="text-center space-y-4">
            <h2 class="text-4xl font-display font-bold text-ink tracking-tight drop-shadow-sm">Welcome Back</h2>
            <p class="text-ink text-sm font-bold bg-cream inline-block px-3 py-1 border-[2px] border-ink shadow-[2px_2px_0_var(--color-ink)] rounded-sm">Enter your credentials to access your dashboard</p>
          </div>

          <UForm :state="state" class="space-y-6 font-bold text-ink [&_label]:text-ink [&_label]:font-bold [&_label]:text-sm [&_label]:tracking-wide [&_label]:mb-1.5" @submit="onLogin">
            <UFormField label="Email Address or Citizen ID" name="identifier">
              <UInput 
                v-model="state.identifier" 
                placeholder="name@company.com or 1100..." 
                icon="i-heroicons-user"
                size="lg"
                class="w-full"
                :ui="{ 
                  base: 'shadow-[2px_2px_0_var(--color-ink)] border-[2px] border-ink rounded-sm bg-white font-bold text-ink placeholder:text-ink-soft'
                }"
              />
            </UFormField>
            
            <UFormField label="Access Key (Password)" name="password">
              <UInput 
                v-model="state.password" 
                type="password" 
                placeholder="••••••••" 
                icon="i-heroicons-lock-closed"
                size="lg"
                class="w-full"
                :ui="{ 
                  base: 'shadow-[2px_2px_0_var(--color-ink)] border-[2px] border-ink rounded-sm bg-white font-bold text-ink placeholder:text-ink-soft'
                }"
              />
            </UFormField>

            <div class="pt-4">
              <UButton 
                type="submit" 
                block 
                size="lg"
                :loading="loading"
                class="bg-teal hover:bg-teal-dark text-ink font-bold shadow-[4px_4px_0_var(--color-ink)] border-[3px] border-ink rounded-sm py-4 text-xs tracking-widest uppercase transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_var(--color-ink)]"
              >
                Sign In to MIS
              </UButton>
            </div>

            <div class="relative flex items-center justify-center pt-2">
              <div class="w-full h-[3px] bg-ink"></div>
              <span class="absolute bg-warm-white px-4 text-[11px] text-ink font-black tracking-widest uppercase border-[3px] border-ink shadow-[2px_2px_0_var(--color-ink)] py-1 rounded-sm">OR CONTINUE WITH</span>
            </div>

            <div class="pt-2">
              <UButton 
                to="/api/auth/thaid"
                external
                block 
                size="lg"
                icon="i-heroicons-finger-print"
                class="bg-coral hover:bg-coral-dark text-ink font-bold shadow-[4px_4px_0_var(--color-ink)] border-[3px] border-ink rounded-sm py-4 text-xs tracking-widest uppercase transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_var(--color-ink)]"
              >
                Login with ThaiD
              </UButton>
            </div>

            <div class="text-center pt-6 border-t-[3px] border-ink mt-2">
              <p class="text-sm text-ink-soft font-bold">
                New to MIS? 
                <NuxtLink to="/register" class="text-ink bg-cream px-2 py-0.5 border-[2px] border-ink shadow-[2px_2px_0_var(--color-ink)] inline-block mt-2 hover:bg-gold transition-colors hover:-translate-y-px">Create an account</NuxtLink>
              </p>
            </div>
          </UForm>
        </div>
      </div>
    </div>
  </div>
</template>
