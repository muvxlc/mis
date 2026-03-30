<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
});
</script>

<template>
  <div class="py-8 px-6 max-w-7xl mx-auto space-y-8 font-sans">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-slate-200">
      <div class="space-y-2">
        <h1 class="text-3xl font-bold text-slate-900 tracking-tight">Feature 2</h1>
        <p class="text-slate-500 font-medium tracking-wide text-sm">Strategic Workspace Module</p>
      </div>
    </div>

    <!-- Content -->
    <div class="bg-white rounded-[2rem] shadow-sm border border-slate-200/60 p-16 text-center space-y-8 max-w-3xl mx-auto mt-12">
      <div class="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-3xl mx-auto flex items-center justify-center shadow-sm">
        <UIcon name="i-heroicons-sparkles" class="w-12 h-12" />
      </div>
      <div class="space-y-3">
        <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Module Under Construction</h2>
        <p class="text-slate-500 max-w-md mx-auto leading-relaxed font-medium">This section is currently being developed. Stay tuned for updates and new tools.</p>
      </div>
      <div class="pt-4">
        <UButton to="/dashboard" color="neutral" variant="ghost" class="font-bold text-blue-600 hover:bg-blue-50 rounded-xl px-6 py-2.5">
          Return to Dashboard
        </UButton>
      </div>
    </div>
  </div>
</template>
