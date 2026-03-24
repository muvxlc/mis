// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxt/ui',
    'nuxt-auth-utils'
  ],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL,
    thaidClientId: process.env.THAID_CLIENT_ID,
    thaidClientSecret: process.env.THAID_CLIENT_SECRET,
    thaidCallbackUrl: process.env.THAID_CALLBACK_URL || 'http://localhost:3000/api/auth/thaid/callback'
  },
  future: {
    compatibilityVersion: 4
  }
})
