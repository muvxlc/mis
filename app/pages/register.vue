<script setup lang="ts">
definePageMeta({
  middleware: 'guest'
});

const { fetch: fetchSession } = useUserSession();
const toast = useToast();

const state = reactive({
  email: '',
  password: '',
  confirmPassword: ''
});

const loading = ref(false);

const onRegister = async () => {
  if (state.password !== state.confirmPassword) {
    toast.add({ title: 'Validation Error', description: 'Passwords do not match', color: 'error' });
    return;
  }

  loading.value = true;
  try {
    await $fetch('/api/auth/register', {
      method: 'POST',
      body: {
        email: state.email,
        password: state.password
      }
    });
    await fetchSession();
    toast.add({ title: 'Welcome to MIS', description: 'Your account has been created successfully', color: 'success' });
    navigateTo('/dashboard');
  } catch (err: any) {
    toast.add({ title: 'Registration Failed', description: err.data?.message || 'Something went wrong', color: 'error' });
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-[80vh] flex items-center justify-center px-6 py-12">
    <div class="w-full max-w-md">
      <div class="bg-white rounded-[2rem] shadow-2xl shadow-blue-900/5 border border-slate-200/60 overflow-hidden relative">
        <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
        <div class="p-10 space-y-8 bg-white relative z-10">
          <div class="text-center space-y-3">
            <h2 class="text-3xl font-bold text-slate-900 tracking-tight">Create Your Account</h2>
            <p class="text-slate-500 text-sm font-medium">Start managing professional QR codes today</p>
          </div>

          <UForm :state="state" class="space-y-6" @submit="onRegister">
            <UFormField label="Email Address" name="email" class="font-sans">
              <UInput 
                v-model="state.email" 
                placeholder="name@company.com" 
                icon="i-heroicons-envelope"
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

            <UFormField label="Confirm Password" name="confirmPassword" class="font-sans">
              <UInput 
                v-model="state.confirmPassword" 
                type="password" 
                placeholder="••••••••" 
                icon="i-heroicons-shield-check"
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
                Create Account
              </UButton>
            </div>

            <div class="text-center pt-6 border-t border-slate-100 mt-2">
              <p class="text-sm text-slate-500 font-medium">
                Already have an account? 
                <NuxtLink to="/login" class="text-blue-600 font-bold hover:text-blue-700 hover:underline ml-1">Sign in</NuxtLink>
              </p>
            </div>
          </UForm>
        </div>
      </div>
    </div>
  </div>
</template>
