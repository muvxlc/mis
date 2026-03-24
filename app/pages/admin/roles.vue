<script setup lang="ts">
definePageMeta({
  middleware: 'admin'
});

const roles = [
  { 
    name: 'Admin', 
    description: 'Full system access, user management, and configuration control.', 
    access: ['Dashboard', 'User Management', 'Role Management', 'System Config', 'Delete Any Asset'],
    color: 'primary'
  },
  { 
    name: 'User', 
    description: 'Standard access for asset creation and management.', 
    access: ['Dashboard', 'Create Assets', 'Edit Own Assets', 'Delete Own Assets'],
    color: 'gray'
  }
];
</script>

<template>
  <div class="py-12 px-6 max-w-7xl mx-auto space-y-12">
    <div class="space-y-1">
      <h1 class="text-4xl font-serif text-brand-primary">Role Management</h1>
      <p class="text-slate-500">Define access control and system permissions for different personnel levels.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
      <div v-for="role in roles" :key="role.name" class="mac-window bg-white border border-slate-200">
        <div class="mac-title-bar">
          <div class="mac-dot mac-dot-red" />
          <div class="mac-dot mac-dot-yellow" />
          <div class="mac-dot mac-dot-green" />
        </div>
        
        <div class="p-8 space-y-6">
          <div class="flex items-center justify-between">
            <h3 class="text-2xl font-serif text-brand-primary">{{ role.name }}</h3>
            <UBadge :color="role.color" variant="soft" class="uppercase font-bold tracking-widest text-[10px]">Active Role</UBadge>
          </div>
          
          <p class="text-slate-600 font-sans leading-relaxed">{{ role.description }}</p>
          
          <div class="space-y-4">
             <span class="text-xs uppercase tracking-widest text-slate-400 font-bold block border-b border-slate-100 pb-2">Access Privileges</span>
             <div class="flex flex-wrap gap-2">
                <div v-for="privilege in role.access" :key="privilege" class="flex items-center gap-2 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg">
                   <UIcon name="i-heroicons-check-circle" class="w-4 h-4 text-green-500" />
                   <span class="text-xs font-bold text-slate-700">{{ privilege }}</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>

    <div class="p-8 bg-brand-primary/5 border border-brand-primary/10 rounded-2xl flex flex-col md:flex-row items-center gap-8">
       <div class="p-4 bg-brand-primary rounded-xl text-brand-accent">
          <UIcon name="i-heroicons-shield-check" class="w-10 h-10" />
       </div>
       <div class="space-y-2 flex-1 text-center md:text-left">
          <h4 class="text-xl font-serif text-brand-primary">Need custom roles?</h4>
          <p class="text-slate-500 text-sm max-w-md">The current version of MIS supports binary roles (Admin/User). Contact the development team to enable dynamic role-based access control (RBAC).</p>
       </div>
       <UButton color="black" variant="soft" class="px-6 py-2.5 font-bold">Request Feature</UButton>
    </div>
  </div>
</template>
