<script setup lang="ts">
import { ref } from 'vue';

definePageMeta({
  middleware: 'auth'
});

const title = 'ถอดเสียงประชุม (Typhoon ASR)';
const description = 'แปลงไฟล์เสียงบันทึกการประชุมเป็นข้อความภาษาไทยด้วย Typhoon ASR Real-Time';

useHead({
  title: `${title} - M I S`,
  meta: [
    { name: 'description', content: description }
  ]
});

const fileInput = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);
const isProcessing = ref(false);
const progressMessage = ref('');
const asrResult = ref<any>(null);
const errorMsg = ref('');

const onFileSelect = (e: Event) => {
  const files = (e.target as HTMLInputElement).files;
  if (files && files.length > 0) {
    selectedFile.value = files[0] || null;
    errorMsg.value = '';
    asrResult.value = null;
  }
};

const triggerFileInput = () => {
  fileInput.value?.click();
};

const processAsr = async () => {
  if (!selectedFile.value) return;
  
  isProcessing.value = true;
  progressMessage.value = 'กำลังอัปโหลดและประมวลผลไฟล์เสียง...';
  errorMsg.value = '';
  
  try {
    const formData = new FormData();
    formData.append('file', selectedFile.value);

    // Call our server API
    const response: any = await $fetch('/api/miscellaneous/asr', {
      method: 'POST',
      body: formData
    });
    
    if (response && response.text) {
       asrResult.value = response;
       progressMessage.value = 'เสร็จสมบูรณ์!';
    } else {
       throw new Error('ไม่ได้รับข้อมูลตอบกลับจาก AI');
    }
    
  } catch (err: any) {
    console.error(err);
    errorMsg.value = err.data?.statusMessage || err.message || 'เกิดข้อผิดพลาดในการประมวลผล';
  } finally {
    isProcessing.value = false;
  }
};

const copyResult = () => {
  if (asrResult.value?.text) {
    navigator.clipboard.writeText(asrResult.value.text);
    alert('คัดลอกลงในคลิปบอร์ดแล้ว');
  }
};

const downloadTxt = () => {
  if (!asrResult.value?.text) return;
  const element = document.createElement("a");
  const file = new Blob([asrResult.value.text], {type: 'text/plain'});
  element.href = URL.createObjectURL(file);
  element.download = `${selectedFile.value?.name.split('.')[0] || 'transcription'}.txt`;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <header class="bg-cream border-[3px] border-ink p-8 shadow-sharp relative overflow-hidden">
      <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div class="space-y-2">
          <div class="flex items-center gap-3">
             <div class="bg-teal p-2 border-[3px] border-ink shadow-sharp rotate-[2deg]">
                <UIcon name="i-heroicons-microphone" class="w-6 h-6 text-ink" />
             </div>
             <h1 class="text-3xl font-display font-black tracking-tight text-ink uppercase italic">{{ title }}</h1>
          </div>
          <p class="text-ink-soft font-bold text-sm tracking-wide">{{ description }}</p>
        </div>
      </div>
      
      <!-- Decorative background elements -->
      <div class="absolute -right-8 -bottom-8 w-32 h-32 bg-gold/10 rounded-full border-[3px] border-ink/20 border-dashed animate-spin-slow"></div>
    </header>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <!-- Upload Section (4 columns) -->
      <div class="lg:col-span-4 space-y-6">
        <div class="bg-warm-white border-[3px] border-ink p-8 relative overflow-hidden group hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[12px_12px_0_var(--color-ink)] transition-all h-full">
          <div class="flex items-center gap-3 mb-6">
            <div class="bg-gold p-1.5 border-[2px] border-ink shadow-[2px_2px_0_var(--color-ink)]">
               <UIcon name="i-heroicons-musical-note" class="w-5 h-5 text-ink" />
            </div>
            <h2 class="text-xl font-display font-black text-ink uppercase italic">เลือกไฟล์เสียง</h2>
          </div>
          
          <input type="file" ref="fileInput" @change="onFileSelect" accept=".wav,.mp3,.flac,.ogg,.opus" class="hidden" />
          
          <div 
            @click="triggerFileInput"
            class="border-[3px] border-dashed border-ink/30 bg-cream/30 rounded-sm p-8 flex flex-col items-center justify-center gap-4 hover:border-teal hover:bg-teal/5 transition-colors cursor-pointer"
            :class="selectedFile ? 'border-teal bg-teal/5' : ''"
          >
            <div class="w-16 h-16 rounded-full bg-ink/5 flex items-center justify-center text-ink/40">
              <UIcon :name="selectedFile ? 'i-heroicons-check-circle' : 'i-heroicons-document-plus'" class="w-10 h-10" :class="selectedFile ? 'text-teal' : ''" />
            </div>
            <div class="text-center">
              <p class="font-bold text-ink" v-if="selectedFile">{{ selectedFile.name }}</p>
              <p class="font-bold text-ink" v-else>ลากและวางไฟล์ หรือ <span class="text-teal underline cursor-pointer">เลือกจากคอมพิวเตอร์</span></p>
              <p class="text-[10px] text-ink-soft uppercase tracking-widest mt-2">รองรับ .wav, .mp3, .flac, .ogg, .opus</p>
            </div>
          </div>
          
          <div class="mt-8 flex flex-col gap-4">
            <UButton 
              size="xl" 
              color="neutral" 
              icon="i-heroicons-bolt-solid" 
              class="bg-gold border-[3px] border-ink text-ink font-black shadow-sharp hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all rounded-sm uppercase italic px-10 py-3 block text-center w-full disabled:opacity-50 disabled:cursor-not-allowed"
              :loading="isProcessing"
              :disabled="!selectedFile || isProcessing"
              @click="processAsr"
            >
              เริ่มถอดเสียง (Typhoon ASR)
            </UButton>
            
            <p v-if="isProcessing" class="text-center font-bold text-teal animate-pulse text-sm">
               {{ progressMessage }}
            </p>
            
            <p v-if="errorMsg" class="text-center font-bold text-coral text-sm bg-coral/10 p-2 border-[2px] border-ink mt-2">
               {{ errorMsg }}
            </p>
          </div>
        </div>
      </div>

      <!-- Result Section (8 columns) -->
      <div class="lg:col-span-8 space-y-6">
        <div class="bg-warm-white border-[3px] border-ink flex flex-col h-[600px] shadow-sharp">
          <div class="bg-ink p-4 flex justify-between items-center text-warm-white">
            <div class="flex items-center gap-2">
               <UIcon name="i-heroicons-document-text" class="w-5 h-5 text-gold" />
               <span class="font-display font-black uppercase text-sm italic tracking-widest">Transcription Result</span>
            </div>
            <div class="flex gap-2">
               <UButton 
                 v-if="asrResult" 
                 icon="i-heroicons-arrow-down-tray" 
                 variant="ghost" 
                 size="xs" 
                 class="text-warm-white hover:text-gold font-bold"
                 @click="downloadTxt"
               >
                 DOWNLOAD (.TXT)
               </UButton>
               <UButton 
                 v-if="asrResult" 
                 icon="i-heroicons-clipboard" 
                 variant="ghost" 
                 size="xs" 
                 class="text-warm-white hover:text-gold font-bold"
                 @click="copyResult"
               >
                 COPY
               </UButton>
            </div>
          </div>
          
          <div class="flex-1 overflow-auto bg-warm-white/50 p-6 relative">
             <div v-if="!asrResult && !isProcessing" class="flex flex-col items-center justify-center h-full opacity-30 text-ink">
                <UIcon name="i-heroicons-microphone" class="w-20 h-20 mb-4" />
                <p class="font-bold uppercase tracking-widest italic">ยังไม่มีข้อมูลที่จะแสดง</p>
             </div>
             
             <div v-if="isProcessing" class="flex flex-col items-center justify-center h-full text-ink">
                <div class="w-12 h-12 border-4 border-gold border-t-ink rounded-full animate-spin mb-4"></div>
                <p class="font-bold">{{ progressMessage }}</p>
             </div>

             <div v-if="asrResult" class="space-y-4">
                <div class="text-ink font-bold text-sm bg-gold/10 p-3 border-[2px] border-ink border-dashed">
                   Transcription info: {{ (asrResult.usage && typeof asrResult.usage.seconds === 'number') ? `${Math.round(asrResult.usage.seconds)} seconds processed` : (asrResult.duration ? `${Math.round(asrResult.duration)} seconds processed` : 'ถอดเสียงเสร็จสมบูรณ์') }}
                </div>
                <div class="bg-transparent p-0">
                   <p class="whitespace-pre-wrap font-sans text-base leading-relaxed text-ink">{{ asrResult.text }}</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.shadow-sharp {
  box-shadow: 8px 8px 0 var(--color-ink);
}

.animate-spin-slow {
  animation: spin 8s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
