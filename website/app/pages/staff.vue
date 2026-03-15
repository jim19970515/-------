<script setup lang="ts">
useSeoMeta({
  title: '員工入口 — 心心精緻早午餐',
  robots: 'noindex, nofollow',  // 不讓 Google 爬這頁
})

const config = useRuntimeConfig()
const appBase = config.public.appBase as string

const systems = [
  {
    icon: '🖥',
    title: '後台管理',
    desc: '菜單、訂單、報表、Banner 管理',
    href: `${appBase}/admin/orders`,
    color: 'border-blue-200 hover:border-blue-400',
    badge: '管理員',
  },
  {
    icon: '💳',
    title: 'POS 結帳',
    href: `${appBase}/pos`,
    desc: '現場結帳、付款方式選擇',
    color: 'border-green-200 hover:border-green-400',
    badge: '店員',
  },
  {
    icon: '👨‍🍳',
    title: '廚房系統（KDS）',
    href: `${appBase}/kds`,
    desc: '即時訂單顯示、出餐確認',
    color: 'border-orange-200 hover:border-orange-400',
    badge: '廚房',
  },
  {
    icon: '🍽',
    title: '顧客點餐',
    href: `${appBase}/customer/1`,
    desc: '測試用，實際由桌上 QR Code 掃描進入',
    color: 'border-amber-200 hover:border-amber-400',
    badge: '測試',
  },
]
</script>

<template>
  <div class="max-w-lg mx-auto px-4 py-12">
    <div class="text-center mb-10">
      <div class="text-4xl mb-3">🔐</div>
      <h1 class="text-2xl font-bold text-gray-800 mb-1">員工入口</h1>
      <p class="text-gray-400 text-sm">請選擇要使用的系統</p>
    </div>

    <div class="space-y-3">
      <a
        v-for="sys in systems"
        :key="sys.href"
        :href="sys.href"
        class="flex items-center gap-4 bg-white rounded-2xl p-4 border-2 transition-all shadow-sm hover:shadow-md"
        :class="sys.color"
      >
        <span class="text-3xl shrink-0">{{ sys.icon }}</span>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <p class="font-semibold text-gray-800">{{ sys.title }}</p>
            <span class="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{{ sys.badge }}</span>
          </div>
          <p class="text-sm text-gray-400 mt-0.5">{{ sys.desc }}</p>
        </div>
        <svg class="w-5 h-5 text-gray-300 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </a>
    </div>

    <p class="text-center text-xs text-gray-300 mt-8">
      此頁面僅供店內人員使用
    </p>
  </div>
</template>
