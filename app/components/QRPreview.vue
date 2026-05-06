<script setup lang="ts">
import QRCode from 'qrcode';

const props = defineProps<{
  value: string;
  size?: number;
}>();

const theme = useCookie('app-theme');
const isModern = computed(() => theme.value === 'modern');

const qrImage = ref('');

const generateQR = async () => {
  if (!props.value) {
    qrImage.value = '';
    return;
  }
  try {
    qrImage.value = await QRCode.toDataURL(props.value, {
      margin: 2,
      scale: 10,
    });
  } catch (err) {
    console.error(err);
  }
};

watch(() => props.value, generateQR, { immediate: true });
</script>

<template>
  <div :class="[
    isModern ? 'bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm' : 'bg-warm-white border-[3px] border-ink shadow-[4px_4px_0_var(--color-ink)] rounded-sm',
    'p-6 flex items-center justify-center transition-all'
  ]">
    <img v-if="qrImage" :src="qrImage" :alt="value" :class="[isModern ? 'rounded-lg' : 'border-[2px] border-ink', 'w-full h-full max-w-[200px] transition-all']" />
    <div v-else class="w-48 h-48 bg-gray-50 dark:bg-slate-900/50 flex items-center justify-center text-gray-400 font-bold uppercase tracking-widest text-xs">
      Preview
    </div>
  </div>
</template>
