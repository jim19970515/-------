export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },

  modules: ['@unocss/nuxt'],

  runtimeConfig: {
    public: {
      gtmId: process.env.GTM_ID ?? 'GTM-XXXXXXX',
      apiBase: process.env.API_BASE ?? 'http://localhost:3000',
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'zh-TW' },
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      title: '心心精緻早午餐',
      meta: [
        { name: 'description', content: '心心精緻早午餐，提供新鮮食材、精緻早午餐，歡迎內用與外帶。線上菜單、營業資訊與線上預訂一次搞定。' },
        { property: 'og:type', content: 'restaurant' },
        { property: 'og:locale', content: 'zh_TW' },
        { property: 'og:site_name', content: '心心精緻早午餐' },
      ],
    },
  },
})
