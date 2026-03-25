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
      <div class="bg-white rounded-[2rem] shadow-2xl shadow-blue-900/5 border border-slate-200/60 overflow-hidden relative">
        <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
        <div class="p-10 space-y-8 bg-white relative z-10">
          <div class="text-center space-y-3">
            <h2 class="text-3xl font-bold text-slate-900 tracking-tight">Welcome Back</h2>
            <p class="text-slate-500 text-sm font-medium">Enter your credentials to access your dashboard</p>
          </div>

          <UForm :state="state" class="space-y-6" @submit="onLogin">
            <UFormField label="Email Address or Citizen ID" name="identifier" class="font-sans">
              <UInput 
                v-model="state.identifier" 
                placeholder="name@company.com or 1100..." 
                icon="i-heroicons-user"
                size="lg"
                class="w-full"
                :ui="{ 
                  base: 'bg-white border-slate-200 shadow-sm focus:ring-blue-600 focus:border-blue-600'
                }"
              />
            </UFormField>
            
            <UFormField label="Password" name="password" class="font-sans">
              <UInput 
                v-model="state.password" 
                type="password" 
                placeholder="••••••••" 
                icon="i-heroicons-lock-closed"
                size="lg"
                class="w-full"
                :ui="{ 
                  base: 'bg-white border-slate-200 shadow-sm focus:ring-blue-600 focus:border-blue-600'
                }"
              />
            </UFormField>

            <div class="pt-4">
              <UButton 
                type="submit" 
                block 
                size="lg"
                :loading="loading"
                class="bg-blue-600 text-white hover:bg-blue-700 font-bold py-3.5 rounded-xl shadow-md transition-all active:scale-[0.98]"
              >
                Sign In to MIS
              </UButton>
            </div>

            <div class="relative flex items-center justify-center pt-2">
              <div class="w-full h-px bg-slate-200"></div>
              <span class="absolute bg-white px-4 text-[11px] text-slate-400 font-bold tracking-widest uppercase">OR CONTINUE WITH</span>
            </div>

            <div class="pt-2">
              <UButton 
                to="/api/auth/thaid"
                external
                block 
                size="lg"
                icon="i-heroicons-finger-print"
                class="bg-[#1c3c6d] text-white hover:bg-[#122b54] font-bold py-3.5 rounded-xl shadow-md transition-all active:scale-[0.98]"
              >
                Login with ThaiD
              </UButton>
            </div>

            <div class="text-center pt-6 border-t border-slate-100 mt-2">
              <p class="text-sm text-slate-500 font-medium">
                New to MIS? 
                <NuxtLink to="/register" class="text-blue-600 font-bold hover:text-blue-700 hover:underline ml-1">Create an account</NuxtLink>
              </p>
            </div>
          </UForm>
        </div>
      </div>
    </div>
  </div>
</template>
