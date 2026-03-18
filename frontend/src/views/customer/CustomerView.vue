<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import api from '@/composables/useApi'
import { useCartStore } from '@/stores/cart'
import type { Category } from '@/types/menu'
import type { Banner } from '@/types/banner'

const route = useRoute()
const cart = useCartStore()

const tableNo = route.params['tableNo'] as string
const categories = ref<Category[]>([])
const showCart = ref(false)
const submitting = ref(false)
const submitted = ref(false)

const orderType = ref<'dine-in' | 'takeout'>(tableNo === '外帶' ? 'takeout' : 'dine-in')
const needUtensils = ref(false)

const submitTableNo = computed(() => {
  if (orderType.value === 'dine-in') return tableNo
  return needUtensils.value ? '外帶（需免洗餐具）' : '外帶'
})

const headerLabel = computed(() =>
  orderType.value === 'dine-in' ? `桌號 ${tableNo}` : '外帶訂單'
)

const banners = ref<Banner[]>([])
const swiperModules = [Autoplay, Pagination]

async function fetchMenu() {
  const { data } = await api.get<Category[]>('/api/menu')
  categories.value = data.filter((c) => c.items.some((i) => i.isAvailable))
}

async function fetchBanners() {
  try {
    const { data } = await api.get<Banner[]>('/api/banners')
    banners.value = data
  } catch {
    // banner 載不到不影響點餐
  }
}

function getQuantityInCart(menuItemId: number) {
  return cart.items.find((i) => i.menuItem.id === menuItemId)?.quantity ?? 0
}

function availableItems(category: Category) {
  return category.items.filter((i) => i.isAvailable)
}

async function submitOrder() {
  if (cart.items.length === 0) return
  submitting.value = true
  try {
    await api.post('/api/orders', {
      tableNo: submitTableNo.value,
      items: cart.items.map((i) => ({
        menuItemId: i.menuItem.id,
        quantity: i.quantity,
        unitPrice: parseFloat(i.menuItem.price),
      })),
    })
    cart.clear()
    showCart.value = false
    submitted.value = true
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchMenu()
  fetchBanners()
})
</script>

<template>
  <!-- 送出成功畫面 -->
  <div v-if="submitted" class="min-h-screen bg-amber-50 flex flex-col items-center justify-center gap-6 p-8">
    <div class="text-6xl">🎉</div>
    <h2 class="text-2xl font-bold text-amber-800">已送出訂單！</h2>
    <p class="text-amber-600">{{ submitTableNo }}，請稍候，我們正在為您準備</p>
    <button
      class="mt-4 px-8 py-3 bg-amber-500 text-white rounded-full font-medium"
      @click="submitted = false; fetchMenu()"
    >
      繼續點餐
    </button>
  </div>

  <!-- 點餐主頁 -->
  <div v-else class="min-h-screen bg-amber-50">
    <!-- Header -->
    <header class="sticky top-0 z-10 bg-white shadow-sm px-4 py-3 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <img src="@/assets/logo.png" alt="logo" class="h-10 w-10 rounded-full object-cover" />
        <div>
          <h1 class="text-xl font-bold text-amber-700">心心精緻早午餐</h1>
          <p class="text-sm text-gray-400">{{ headerLabel }}</p>
        </div>
      </div>
      <button
        class="relative flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-full font-medium"
        @click="showCart = true"
      >
        <span>購物車</span>
        <span
          v-if="cart.totalCount > 0"
          class="bg-white text-amber-600 rounded-full w-5 h-5 text-xs font-bold flex items-center justify-center"
        >
          {{ cart.totalCount }}
        </span>
      </button>
    </header>

    <!-- Banner 輪播 -->
    <div v-if="banners.length > 0" class="w-full" style="aspect-ratio: 16/7">
      <Swiper
        :modules="swiperModules"
        :autoplay="{ delay: 4000, disableOnInteraction: false }"
        :pagination="{ clickable: true }"
        :loop="banners.length > 1"
        class="w-full h-full"
      >
        <SwiperSlide v-for="banner in banners" :key="banner.id">
          <div class="relative w-full h-full">
            <img
              :src="banner.imageUrl"
              :alt="banner.title ?? ''"
              class="w-full h-full object-cover"
            />
            <!-- 文字遮罩（有標題才顯示） -->
            <div
              v-if="banner.title || banner.subtitle"
              class="absolute inset-0 flex flex-col justify-end px-5 py-4"
              style="background: linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%)"
            >
              <p v-if="banner.title" class="text-white font-bold text-lg leading-tight drop-shadow">
                {{ banner.title }}
              </p>
              <p v-if="banner.subtitle" class="text-white/80 text-sm mt-0.5 drop-shadow">
                {{ banner.subtitle }}
              </p>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
    </div>

    <!-- 菜單 -->
    <main class="px-4 py-6 space-y-8 pb-24">
      <section v-for="category in categories" :key="category.id">
        <h2 class="text-lg font-bold text-amber-800 mb-3 border-b-2 border-amber-200 pb-1">
          {{ category.name }}
        </h2>
        <div class="space-y-3">
          <div
            v-for="item in availableItems(category)"
            :key="item.id"
            class="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3"
          >
            <div class="flex-1 min-w-0">
              <div class="font-medium text-gray-800">{{ item.name }}</div>
              <div v-if="item.description" class="text-sm text-gray-400 truncate">{{ item.description }}</div>
              <div class="text-amber-600 font-semibold mt-1">NT$ {{ parseFloat(item.price) }}</div>
            </div>
            <!-- 加減按鈕 -->
            <div class="flex items-center gap-2 shrink-0">
              <button
                v-if="getQuantityInCart(item.id) > 0"
                class="w-8 h-8 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center"
                @click="cart.removeItem(item.id)"
              >
                −
              </button>
              <span v-if="getQuantityInCart(item.id) > 0" class="w-5 text-center font-medium">
                {{ getQuantityInCart(item.id) }}
              </span>
              <button
                class="w-8 h-8 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center"
                @click="cart.addItem(item)"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- 購物車底部固定列（有東西才顯示）-->
    <div
      v-if="cart.totalCount > 0 && !showCart"
      class="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-amber-100"
    >
      <button
        class="w-full bg-amber-500 text-white rounded-full py-3 font-semibold flex justify-between px-6"
        @click="showCart = true"
      >
        <span>查看購物車 ({{ cart.totalCount }})</span>
        <span>NT$ {{ cart.totalPrice }}</span>
      </button>
    </div>

    <!-- 購物車全屏 -->
    <div
      v-if="showCart"
      class="fixed inset-0 z-20 flex flex-col bg-white"
    >
      <div class="flex items-center justify-between px-4 py-4 border-b">
        <h2 class="text-lg font-bold">我的訂單</h2>
        <button class="text-gray-400 text-2xl leading-none" @click="showCart = false">×</button>
      </div>

      <div class="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        <div
          v-if="cart.items.length === 0"
          class="text-center text-gray-400 mt-12"
        >
          尚未選擇任何品項
        </div>
        <div
          v-for="item in cart.items"
          :key="item.menuItem.id"
          class="flex items-center justify-between gap-3"
        >
          <div class="flex-1">
            <div class="font-medium">{{ item.menuItem.name }}</div>
            <div class="text-sm text-gray-400">NT$ {{ parseFloat(item.menuItem.price) }} 元</div>
          </div>
          <div class="flex items-center gap-2">
            <button
              class="w-8 h-8 rounded-full bg-gray-100 text-gray-700 font-bold flex items-center justify-center"
              @click="cart.removeItem(item.menuItem.id)"
            >
              −
            </button>
            <span class="w-5 text-center font-medium">{{ item.quantity }}</span>
            <button
              class="w-8 h-8 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center"
              @click="cart.addItem(item.menuItem)"
            >
              +
            </button>
          </div>
          <div class="w-20 text-right font-medium">
            NT$ {{ parseFloat(item.menuItem.price) * item.quantity }}
          </div>
        </div>
      </div>

      <div class="border-t px-4 pt-4 pb-6 space-y-4">
        <!-- 用餐方式 -->
        <div>
          <p class="text-sm font-medium text-gray-500 mb-2">用餐方式</p>
          <div class="flex gap-2">
            <button
              class="flex-1 py-2 rounded-full text-sm font-semibold border-2 transition-all"
              :class="orderType === 'dine-in'
                ? 'bg-amber-500 text-white border-amber-500'
                : 'bg-white text-gray-500 border-gray-200'"
              @click="orderType = 'dine-in'"
            >
              🍽 內用（桌號 {{ tableNo }}）
            </button>
            <button
              class="flex-1 py-2 rounded-full text-sm font-semibold border-2 transition-all"
              :class="orderType === 'takeout'
                ? 'bg-amber-500 text-white border-amber-500'
                : 'bg-white text-gray-500 border-gray-200'"
              @click="orderType = 'takeout'"
            >
              🛍 外帶
            </button>
          </div>
        </div>

        <!-- 免洗餐具（外帶才顯示） -->
        <label
          v-if="orderType === 'takeout'"
          class="flex items-center gap-3 bg-amber-50 rounded-xl px-4 py-3 cursor-pointer"
        >
          <input
            type="checkbox"
            v-model="needUtensils"
            class="w-5 h-5 accent-amber-500 cursor-pointer"
          />
          <span class="text-sm text-gray-700">需要免洗餐具</span>
        </label>

        <!-- 合計 + 送出 -->
        <div class="flex justify-between text-lg font-bold">
          <span>合計</span>
          <span class="text-amber-600">NT$ {{ cart.totalPrice }}</span>
        </div>
        <button
          class="w-full bg-amber-500 text-white rounded-full py-3 font-semibold disabled:opacity-50"
          :disabled="cart.items.length === 0 || submitting"
          @click="submitOrder"
        >
          {{ submitting ? '送出中...' : '確認送出' }}
        </button>
      </div>
    </div>
  </div>
</template>
