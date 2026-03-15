<script setup lang="ts">
const mobileOpen = ref(false)
const route = useRoute()
const config = useRuntimeConfig()
const appBase = config.public.appBase as string

const navLinks: { label: string; to?: string; href?: string }[] = [
  { label: '首頁', to: '/' },
  { label: '菜單', to: '/menu' },
  { label: '營業資訊', to: '/info' },
  { label: '立即訂位', to: '/reservation' },
]

watch(() => route.path, () => { mobileOpen.value = false })
</script>

<template>
  <div class="min-h-screen flex flex-col bg-stone-50">
    <!-- Navbar -->
    <header class="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-stone-100 shadow-sm">
      <div class="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2.5">
          <img :src="'/logo.png'" alt="心心精緻早午餐" class="h-9 w-9 rounded-full object-cover" />
          <span class="font-bold text-amber-800 text-lg leading-tight hidden sm:block">心心精緻早午餐</span>
        </NuxtLink>

        <!-- Desktop nav -->
        <nav class="hidden md:flex items-center gap-6">
          <template v-for="link in navLinks" :key="link.to ?? link.href">
            <a
              v-if="link.href"
              :href="link.href"
              class="text-sm font-medium text-gray-600 hover:text-amber-700 transition-colors"
            >{{ link.label }}</a>
            <NuxtLink
              v-else
              :to="link.to ?? ''"
              class="text-sm font-medium text-gray-600 hover:text-amber-700 transition-colors"
              active-class="text-amber-700 font-semibold"
              exact-active-class="text-amber-700 font-semibold"
            >{{ link.label }}</NuxtLink>
          </template>
          <a
            :href="`${appBase}/`"
            class="bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors"
          >
            即刻點餐
          </a>
        </nav>

        <!-- Mobile hamburger -->
        <button
          class="md:hidden p-2 text-gray-600"
          @click="mobileOpen = !mobileOpen"
          aria-label="開啟選單"
        >
          <svg v-if="!mobileOpen" class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Mobile menu -->
      <div v-if="mobileOpen" class="md:hidden border-t border-stone-100 bg-white px-4 py-3 flex flex-col gap-3">
        <template v-for="link in navLinks" :key="link.to ?? link.href">
          <a
            v-if="link.href"
            :href="link.href"
            class="py-2 text-sm font-medium text-gray-700 border-b border-stone-50"
          >{{ link.label }}</a>
          <NuxtLink
            v-else
            :to="link.to ?? ''"
            class="py-2 text-sm font-medium text-gray-700 border-b border-stone-50"
            active-class="text-amber-700"
          >{{ link.label }}</NuxtLink>
        </template>
      </div>
    </header>

    <!-- Page content -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-amber-900 text-amber-100 py-10 px-4 mt-16">
      <div class="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div>
          <p class="font-bold text-white text-lg mb-2">心心精緻早午餐</p>
          <p class="text-sm text-amber-300">用心料理，從早午餐開始</p>
        </div>
        <div>
          <p class="font-semibold text-white mb-2 text-sm">快速連結</p>
          <ul class="space-y-1">
            <li v-for="link in navLinks" :key="link.to ?? link.href">
              <a v-if="link.href" :href="link.href" class="text-sm text-amber-300 hover:text-white transition-colors">{{ link.label }}</a>
              <NuxtLink v-else :to="link.to ?? ''" class="text-sm text-amber-300 hover:text-white transition-colors">{{ link.label }}</NuxtLink>
            </li>
          </ul>
        </div>
        <div>
          <p class="font-semibold text-white mb-2 text-sm">聯絡我們</p>
          <p class="text-sm text-amber-300">📍 台北市信義區範例路 123 號</p>
          <p class="text-sm text-amber-300 mt-1">📞 02-1234-5678</p>
          <p class="text-sm text-amber-300 mt-1">⏰ 週一至週五 07:00–14:30</p>
        </div>
      </div>
      <p class="text-center text-xs text-amber-600 mt-8">© 2026 心心精緻早午餐. All rights reserved.</p>
      <div class="text-center mt-3">
        <NuxtLink to="/staff" class="text-xs text-amber-800/50 hover:text-amber-600 transition-colors">員工入口</NuxtLink>
      </div>
    </footer>
  </div>
</template>
