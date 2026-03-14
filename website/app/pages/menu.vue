<script setup lang="ts">
useSeoMeta({
  title: '菜單 — 心心精緻早午餐',
  description: '查看心心精緻早午餐完整菜單，包含早午餐套餐、輕食、飲品等多樣選擇，每日新鮮供應。',
  ogTitle: '心心精緻早午餐菜單',
  ogDescription: '早午餐套餐、輕食、飲品，每日新鮮供應。',
})

useHead({
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Menu',
      name: '心心精緻早午餐菜單',
      url: 'https://xinxin-brunch.com/menu',
    }),
  }],
})

const config = useRuntimeConfig()

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

const { data: categories, status } = useFetch<Category[]>(`${config.public.apiBase}/api/menu`, {
  lazy: true,
  default: () => [] as Category[],
})

const availableCategories = computed(() =>
  (categories.value ?? []).filter((c) => c.items.some((i) => i.isAvailable))
)

const activeCategory = ref<number | null>(null)

watch(availableCategories, (cats) => {
  if (cats.length > 0 && activeCategory.value === null) {
    activeCategory.value = cats[0].id
  }
}, { immediate: true })

const activeItems = computed(() => {
  const cat = availableCategories.value.find((c) => c.id === activeCategory.value)
  return cat?.items.filter((i) => i.isAvailable) ?? []
})
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 py-12">
    <div class="text-center mb-10">
      <h1 class="text-3xl font-bold text-amber-800 mb-2">我們的菜單</h1>
      <p class="text-gray-500 text-sm">每日新鮮食材，手工料理</p>
    </div>

    <!-- Loading -->
    <div v-if="status === 'pending'" class="text-center py-20 text-gray-400">載入中...</div>

    <template v-else>
      <!-- 分類 tab -->
      <div class="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-none">
        <button
          v-for="cat in availableCategories"
          :key="cat.id"
          class="shrink-0 px-5 py-2 rounded-full text-sm font-semibold border-2 transition-all"
          :class="activeCategory === cat.id
            ? 'bg-amber-500 text-white border-amber-500'
            : 'bg-white text-gray-500 border-gray-200 hover:border-amber-300'"
          @click="activeCategory = cat.id"
        >
          {{ cat.name }}
        </button>
      </div>

      <!-- 品項 grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          v-for="item in activeItems"
          :key="item.id"
          class="bg-white rounded-2xl shadow-sm overflow-hidden flex gap-4 p-4"
        >
          <div class="w-20 h-20 shrink-0 rounded-xl bg-amber-50 overflow-hidden flex items-center justify-center">
            <img v-if="item.image" :src="item.image" :alt="item.name" class="w-full h-full object-cover" />
            <span v-else class="text-3xl">🍳</span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-gray-800">{{ item.name }}</p>
            <p v-if="item.description" class="text-sm text-gray-400 mt-0.5 line-clamp-2">{{ item.description }}</p>
            <p class="text-amber-600 font-bold mt-2">NT$ {{ parseFloat(item.price) }}</p>
          </div>
        </div>
      </div>

      <!-- 空狀態 -->
      <div v-if="activeItems.length === 0" class="text-center text-gray-400 py-20">
        此分類目前無供應品項
      </div>
    </template>

    <!-- 底部提示 -->
    <div class="mt-12 text-center text-sm text-gray-400 bg-amber-50 rounded-2xl py-4 px-6">
      菜單及價格如有調整，以現場為主。如有過敏原或飲食限制需求，請於點餐時告知服務人員。
    </div>
  </div>
</template>
