<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
});

const toast = useToast();
const loading = ref(false);

const state = reactive({
  type: 'static' as 'static' | 'dynamic',
  originalUrl: '',
});

const onSubmit = async () => {
  if (!state.originalUrl) {
    toast.add({ title: 'Error', description: 'Please enter a URL', color: 'error' });
    return;
  }

  loading.value = true;
  try {
    await $fetch('/api/qrcodes', {
      method: 'POST',
      body: state
    });
    toast.add({ title: 'Success', description: 'QR Code created successfully', color: 'success' });
    navigateTo('/dashboard');
  } catch (err: any) {
    toast.add({ title: 'Error', description: err.data?.message || 'Failed to create QR Code', color: 'error' });
  } finally {
    loading.value = false;
  }
};

const previewUrl = computed(() => {
  if (state.type === 'static') {
    return state.originalUrl;
  }
  // For dynamic, we show a placeholder for the short link
  return 'https://quikqr.app/q/placeholder';
});
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <div class="flex items-center gap-4 mb-8">
      <UButton icon="i-heroicons-arrow-left" variant="ghost" to="/dashboard" />
      <h1 class="text-2xl font-bold">Create New QR Code</h1>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <UCard>
        <UForm :state="state" @submit="onSubmit" class="space-y-6">
          <UFormField label="QR Code Type" help="Dynamic QR codes can be edited later and track scans.">
            <URadioGroup 
              v-model="state.type" 
              :options="[{ label: 'Static', value: 'static' }, { label: 'Dynamic', value: 'dynamic' }]" 
            />
          </UFormField>

          <UFormField label="Destination URL" help="Where should the QR code lead?">
            <UInput v-model="state.originalUrl" placeholder="https://example.com" icon="i-heroicons-link" />
          </UFormField>

          <div class="pt-4">
            <UButton type="submit" block :loading="loading" size="lg">
              Create QR Code
            </UButton>
          </div>
        </UForm>
      </UCard>

      <div class="space-y-4">
        <h3 class="text-lg font-semibold px-2">Live Preview</h3>
        <QRPreview :value="previewUrl" />
        <div class="p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800 rounded-lg text-sm text-primary-700 dark:text-primary-300">
           <p v-if="state.type === 'static'">
             <strong>Static:</strong> Direct link to your URL. This cannot be changed once created.
           </p>
           <p v-else>
             <strong>Dynamic:</strong> Short link that redirects to your URL. You can change the destination anytime and track how many people scan it.
           </p>
        </div>
      </div>
    </div>
  </div>
</template>
