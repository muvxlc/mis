export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  category: 'Main' | 'Miscellaneous' | 'Settings' | string;
}

export const SYSTEM_MENUS: MenuItem[] = [
  // Main
  { id: 'dashboard', label: 'หน้าแรก / Dashboard', icon: 'i-heroicons-squares-2x2', path: '/dashboard', category: 'Main' },
  { id: 'analytics', label: 'การวิเคราะห์ / Analytics', icon: 'i-heroicons-chart-bar', path: '/feature1', category: 'Main' },
  { id: 'reports', label: 'รายงาน / Reports', icon: 'i-heroicons-document-text', path: '/feature2', category: 'Main' },
  
  // Miscellaneous
  { id: 'pdf-ocr', label: 'แปลงไฟล์ PDF (OCR)', icon: 'i-heroicons-document-arrow-down', path: '/miscellaneous/pdf-conversion', category: 'Miscellaneous' },
  { id: 'asr-meeting', label: 'ถอดเสียงประชุม (ASR)', icon: 'i-heroicons-microphone', path: '/miscellaneous/asr', category: 'Miscellaneous' },
  
  // Settings (Admins only by default but can be tuned)
  { id: 'admin-users', label: 'จัดการบุคลากร / Team Access', icon: 'i-heroicons-users', path: '/admin/users', category: 'Settings' },
  { id: 'admin-roles', label: 'สิทธิ์การใช้งาน / Security', icon: 'i-heroicons-shield-check', path: '/admin/roles', category: 'Settings' },
];
