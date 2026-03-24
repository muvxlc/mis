<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
});
</script>

<template>
  <div class="py-12 px-6 max-w-7xl mx-auto space-y-10 font-sans text-brand-primary">
    <!-- Header -->
    <div class="flex justify-between items-end border-b border-slate-200 pb-6">
      <div class="space-y-1">
        <h1 class="text-4xl font-serif">Feature 2</h1>
        <p class="text-slate-500 uppercase tracking-widest text-[10px] font-bold">Workspace Module</p>
      </div>
    </div>

    <!-- Content -->
    <div class="mac-window bg-white shadow-2xl border border-slate-200 p-12 text-center space-y-6">
      <div class="mac-title-bar">
        <div class="mac-dot mac-dot-red" />
        <div class="mac-dot mac-dot-yellow" />
        <div class="mac-dot mac-dot-green" />
      </div>
      
      <UIcon name="i-heroicons-sparkles" class="w-20 h-20 text-brand-accent/20 mx-auto" />
      <h2 class="text-2xl font-serif">Module Under Construction</h2>
      <p class="text-slate-500 max-w-md mx-auto">This section is currently being developed. Stay tuned for updates.</p>
    </div>
  </div>
</template>
