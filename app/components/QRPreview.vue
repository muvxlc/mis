<script setup lang="ts">
import QRCode from 'qrcode';

const props = defineProps<{
  value: string;
  size?: number;
}>();

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
  <div class="bg-white p-4 rounded shadow-sm border border-gray-100 flex items-center justify-center">
    <img v-if="qrImage" :src="qrImage" :alt="value" class="w-full h-full max-w-[200px]" />
    <div v-else class="w-48 h-48 bg-gray-50 flex items-center justify-center text-gray-400">
      Preview
    </div>
  </div>
</template>
