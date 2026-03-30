<script setup lang="ts">
import { ref } from 'vue';

definePageMeta({
  middleware: 'auth'
});

const title = 'แปลงไฟล์ PDF (Typhoon OCR)';
const description = 'จัดการแปลงไฟล์เอกสารเป็นรูปแบบ PDF ให้เป็นข้อมูลข้อความด้วย OpenTyphoon';

useHead({
  title: `${title} - M I S`,
  meta: [
    { name: 'description', content: description }
  ],
  script: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js', defer: true }
  ]
});

const fileInput = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);
const isProcessing = ref(false);
const progressMessage = ref('');
const ocrResult = ref('');
const errorMsg = ref('');

const onFileSelect = (e: Event) => {
  const files = (e.target as HTMLInputElement).files;
  if (files && files.length > 0) {
    selectedFile.value = files[0] || null;
    errorMsg.value = '';
    ocrResult.value = '';
  }
};

const triggerFileInput = () => {
  fileInput.value?.click();
};

const processOcr = async () => {
  if (!selectedFile.value) return;
  
  isProcessing.value = true;
  progressMessage.value = 'กำลังอ่านไฟล์ PDF...';
  errorMsg.value = '';
  
  try {
    // Check if pdfjs is loaded
    if (!(window as any).pdfjsLib) {
      throw new Error('PDF library (pdf.js) is still loading, please wait a moment.');
    }
    
    const pdfjsLib = (window as any).pdfjsLib;
    pdfjsLib.GlobalOptions = { ...pdfjsLib.GlobalOptions, verbosity: 0 };
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    
    // Read file as ArrayBuffer
    const arrayBuffer = await selectedFile.value.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    const imageUrls: string[] = [];
    const numPages = pdf.numPages;
    
    // Convert each page to image
    for (let i = 1; i <= numPages; i++) {
       progressMessage.value = `กำลังแปลงหน้า ${i} จาก ${numPages}...`;
       const page = await pdf.getPage(i);
       const viewport = page.getViewport({ scale: 3.0 }); // Even higher scale for complex forms
       
       const canvas = document.createElement('canvas');
       const context = canvas.getContext('2d');
       canvas.height = viewport.height;
       canvas.width = viewport.width;
       
       await page.render({ canvasContext: context!, viewport }).promise;
       imageUrls.push(canvas.toDataURL('image/png'));
    }
    
    const results: string[] = [];
    for (let i = 0; i < imageUrls.length; i++) {
       progressMessage.value = `กำลังส่งหน้า ${i + 1} จาก ${imageUrls.length} ให้ AI ประมวลผล...`;
       
       const response: any = await $fetch('/api/miscellaneous/ocr', {
         method: 'POST',
         body: { imageUrls: [imageUrls[i]] } // Send only one page at a time
       });
       
       if (response && response.choices && response.choices[0]) {
          const pageContent = response.choices[0].message.content;
          results.push(`<page_number>${i + 1}</page_number>\n\n${pageContent}`);
       } else {
          throw new Error(`ไม่ได้รับข้อมูลจาก AI สำหรับหน้า ${i + 1}`);
       }
    }
    
    ocrResult.value = results.join('\n\n---\n\n'); 
    progressMessage.value = 'เสร็จสมบูรณ์!';
    
  } catch (err: any) {
    console.error(err);
    errorMsg.value = err.message || 'เกิดข้อผิดพลาดในการประมวลผล';
  } finally {
    isProcessing.value = false;
  }
};

const downloadWord = async () => {
  if (!ocrResult.value) return;
  
  try {
    const response = await $fetch('/api/miscellaneous/export-word', {
      method: 'POST',
      body: { 
        markdown: ocrResult.value,
        filename: `${selectedFile.value?.name.replace('.pdf', '') || 'OCR_Result'}.docx`
      },
      responseType: 'blob'
    });
    
    // Create a download link for the blob
    const url = window.URL.createObjectURL(response as any);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${selectedFile.value?.name.replace('.pdf', '') || 'OCR_Result'}.docx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
  } catch (err: any) {
    console.error(err);
    alert('เกิดข้อผิดพลาดในการดาวน์โหลดไฟล์ Word');
  }
};

const copyResult = () => {
  if (ocrResult.value) {
    navigator.clipboard.writeText(ocrResult.value);
    alert('คัดลอกลงในคลิปบอร์ดแล้ว');
  }
};
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <header class="bg-cream border-[3px] border-ink p-8 shadow-sharp relative overflow-hidden">
      <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div class="space-y-2">
          <div class="flex items-center gap-3">
             <div class="bg-coral p-2 border-[3px] border-ink shadow-sharp rotate-[-2deg]">
                <UIcon name="i-heroicons-document-arrow-down" class="w-6 h-6 text-ink" />
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
            <div class="bg-teal p-1.5 border-[2px] border-ink shadow-[2px_2px_0_var(--color-ink)]">
               <UIcon name="i-heroicons-cloud-arrow-up" class="w-5 h-5 text-ink" />
            </div>
            <h2 class="text-xl font-display font-black text-ink uppercase italic">เลือกไฟล์ PDF</h2>
          </div>
          
          <input type="file" ref="fileInput" @change="onFileSelect" accept="application/pdf" class="hidden" />
          
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
              <p class="text-[10px] text-ink-soft uppercase tracking-widest mt-2">รองรับเฉพาะไฟล์ .pdf (ไม่เกิน 20 หน้าเพื่อประสิทธิภาพสูงสุด)</p>
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
              @click="processOcr"
            >
              เริ่มขั้นตอน OCR (Typhoon)
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
               <span class="font-display font-black uppercase text-sm italic tracking-widest">OCR Result (Markdown)</span>
            </div>
            <div class="flex gap-2">
               <UButton 
                 v-if="ocrResult" 
                 icon="i-heroicons-document-arrow-down" 
                 variant="ghost" 
                 size="xs" 
                 class="text-warm-white hover:text-gold font-bold"
                 @click="downloadWord"
               >
                 DOWNLOAD (.DOCX)
               </UButton>
               <UButton 
                 v-if="ocrResult" 
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
             <div v-if="!ocrResult && !isProcessing" class="flex flex-col items-center justify-center h-full opacity-30 text-ink">
                <UIcon name="i-heroicons-document-magnifying-glass" class="w-20 h-20 mb-4" />
                <p class="font-bold uppercase tracking-widest italic">ยังไม่มีข้อมูลที่จะแสดง</p>
             </div>
             
             <div v-if="isProcessing" class="flex flex-col items-center justify-center h-full text-ink">
                <div class="w-12 h-12 border-4 border-gold border-t-ink rounded-full animate-spin mb-4"></div>
                <p class="font-bold">{{ progressMessage }}</p>
             </div>

             <div v-if="ocrResult" class="prose prose-sm max-w-none prose-table:border prose-table:border-ink/20">
                <pre class="whitespace-pre-wrap font-mono text-sm leading-relaxed text-ink bg-transparent p-0">{{ ocrResult }}</pre>
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

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
