<script setup lang="ts">
useSeoMeta({
  title: '心心精緻早午餐 — 台北最溫暖的早午餐',
  description: '心心精緻早午餐，新鮮食材、手工料理，提供內用與外帶服務。線上預訂、查看菜單，為你的一天美好開始。',
  ogTitle: '心心精緻早午餐',
  ogDescription: '新鮮食材、手工料理，為你的一天美好開始。',
  ogImage: '/og-home.jpg',
})

const config = useRuntimeConfig()
const appBase = config.public.appBase as string

interface MenuItem {
  id: number
  name: string
  price: string
  description: string | null
  image: string | null
  isAvailable: boolean
}

interface Category {
  id: number
  name: string
  items: MenuItem[]
}

const { data: categories } = useFetch<Category[]>(`${config.public.apiBase}/api/menu`, {
  lazy: true,
  default: () => [] as Category[],
})

const featuredItems = computed(() =>
  (categories.value ?? [])
    .flatMap((c) => c.items.filter((i) => i.isAvailable))
    .slice(0, 4)
)

const { trackClick } = useGtm()
</script>

<template>
  <!-- Hero -->
  <section
    class="relative min-h-[92vh] flex items-center justify-center text-center bg-amber-900 overflow-hidden"
  >
    <!-- 背景紋理 -->
    <div class="absolute inset-0 bg-gradient-to-br from-amber-950 via-amber-900 to-orange-800 opacity-90" />
    <div class="absolute inset-0 opacity-10"
      style="background-image: url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"
    />

    <div class="relative z-10 px-6 max-w-2xl mx-auto">
      <img :src="'/logo.png'" alt="logo" class="h-20 w-20 rounded-full object-cover mx-auto shadow-xl mb-6 border-4 border-amber-300/30" />
      <h1 class="text-4xl sm:text-5xl font-bold text-white leading-tight mb-4">
        心心精緻早午餐
      </h1>
      <p class="text-amber-200 text-lg mb-2">用心料理，從早午餐開始</p>
      <p class="text-amber-300/80 text-sm mb-10">新鮮食材 · 手工料理 · 溫暖空間</p>
      <div class="flex gap-3 justify-center flex-wrap">
        <NuxtLink
          to="/menu"
          class="bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold px-7 py-3 rounded-full transition-colors shadow-lg"
          @click="trackClick('hero_view_menu', '查看菜單')"
        >
          查看菜單
        </NuxtLink>
        <a
          :href="appBase"
          class="bg-white/10 hover:bg-white/20 text-white font-semibold px-7 py-3 rounded-full border border-white/30 transition-colors"
          @click="trackClick('hero_order', '立即點餐')"
        >
          立即點餐
        </a>
      </div>
    </div>

    <!-- 向下箭頭 -->
    <div class="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-amber-400/60">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </section>

  <!-- 品牌特色 -->
  <section class="py-16 px-4 bg-white">
    <div class="max-w-5xl mx-auto text-center mb-12">
      <h2 class="text-2xl font-bold text-amber-800 mb-3">為什麼選擇我們</h2>
      <p class="text-gray-500 text-sm">每一道料理，都是對食材的尊重</p>
    </div>
    <div class="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
      <div class="text-center p-6 rounded-2xl bg-amber-50">
        <div class="text-4xl mb-3">🌾</div>
        <h3 class="font-bold text-amber-800 mb-1">新鮮食材</h3>
        <p class="text-sm text-gray-500">每日精選當季食材，拒絕冷凍加工</p>
      </div>
      <div class="text-center p-6 rounded-2xl bg-amber-50">
        <div class="text-4xl mb-3">👨‍🍳</div>
        <h3 class="font-bold text-amber-800 mb-1">手工料理</h3>
        <p class="text-sm text-gray-500">從麵包到醬料，堅持手工製作</p>
      </div>
      <div class="text-center p-6 rounded-2xl bg-amber-50">
        <div class="text-4xl mb-3">☕</div>
        <h3 class="font-bold text-amber-800 mb-1">精品咖啡</h3>
        <p class="text-sm text-gray-500">嚴選莊園豆，專業義式沖煮</p>
      </div>
    </div>
  </section>

  <!-- 精選菜單預覽 -->
  <section class="py-16 px-4 bg-stone-50">
    <div class="max-w-5xl mx-auto">
      <div class="text-center mb-10">
        <h2 class="text-2xl font-bold text-amber-800 mb-3">人氣推薦</h2>
        <p class="text-gray-500 text-sm">最受客人喜愛的招牌品項</p>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          v-for="item in featuredItems"
          :key="item.id"
          class="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
        >
          <div class="aspect-square bg-amber-100 flex items-center justify-center">
            <img v-if="item.image" :src="item.image" :alt="item.name" class="w-full h-full object-cover" />
            <span v-else class="text-4xl">🍳</span>
          </div>
          <div class="p-3">
            <p class="font-semibold text-gray-800 text-sm leading-tight">{{ item.name }}</p>
            <p class="text-amber-600 font-bold text-sm mt-1">NT$ {{ parseFloat(item.price) }}</p>
          </div>
        </div>
      </div>
      <div class="text-center mt-8">
        <NuxtLink
          to="/menu"
          class="inline-block bg-amber-500 hover:bg-amber-600 text-white font-semibold px-8 py-3 rounded-full transition-colors"
          @click="trackClick('featured_view_all', '查看完整菜單')"
        >
          查看完整菜單
        </NuxtLink>
      </div>
    </div>
  </section>

  <!-- 預訂 CTA -->
  <section class="py-16 px-4 bg-amber-800 text-center">
    <h2 class="text-2xl font-bold text-white mb-3">準備好開始美好的一天了嗎？</h2>
    <p class="text-amber-200 text-sm mb-8">線上預訂，免去等候時間</p>
    <a
      :href="appBase"
      class="inline-block bg-white text-amber-800 font-bold px-10 py-3 rounded-full hover:bg-amber-50 transition-colors shadow-lg"
      @click="trackClick('cta_order', '立即線上點餐')"
    >
      立即線上點餐
    </a>
  </section>
</template>
