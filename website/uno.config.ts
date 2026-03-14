import { defineConfig, presetAttributify, presetIcons, presetUno } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),        // Tailwind-compatible utilities
    presetAttributify(), // 屬性模式（可選）
    presetIcons({        // icon 支援
      scale: 1.2,
    }),
  ],
  shortcuts: {
    'btn-primary': 'bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-full transition-colors',
    'card': 'bg-white rounded-2xl shadow-sm',
  },
})
