<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import api from '@/composables/useApi'
import { useCartStore } from '@/stores/cart'
import { useCustomerAuthStore } from '@/stores/customerAuth'
import type { Category } from '@/types/menu'
import type { Banner } from '@/types/banner'
import AiAssistantChat from '@/components/customer/AiAssistantChat.vue'
import type { SuggestedItem } from '@/composables/useAiAssistant'
import foodPlaceholder from '@/assets/food-placeholder.svg'

const route = useRoute()
const cart = useCartStore()
const customerAuth = useCustomerAuthStore()

// ── 登入 / 手機號碼 ──────────────────────────────
const loginLoading = ref(false)
const phoneInput = ref('')
const phoneLoading = ref(false)

async function handleGoogleLogin(response: { credential: string }) {
  loginLoading.value = true
  try {
    const { data } = await api.post('/api/customer/google', { credential: response.credential })
    customerAuth.setAuth(data.token, data.customer)
  } catch {
    alert('登入失敗，請再試一次')
  } finally {
    loginLoading.value = false
  }
}

async function savePhone() {
  if (!phoneInput.value.trim()) return
  phoneLoading.value = true
  try {
    const { data } = await api.put('/api/customer/profile', { phone: phoneInput.value.trim() }, {
      headers: { 'x-customer-token': customerAuth.token! },
    })
    customerAuth.updateCustomer(data)
  } catch {
    alert('儲存失敗，請再試一次')
  } finally {
    phoneLoading.value = false
  }
}

const tableNo = route.params['tableNo'] as string
const categories = ref<Category[]>([])
const showCart = ref(false)
const submitting = ref(false)
const submitted = ref(false)
const activeCategory = ref<number | null>(null)

const orderType = ref<'dine-in' | 'takeout'>(tableNo === '外帶' ? 'takeout' : 'dine-in')
const showAssistant = ref(false)

watch([showAssistant, showCart], ([assistant, cart]) => {
  document.body.style.overflow = assistant || cart ? 'hidden' : ''
})

function handleAiAddItems(items: SuggestedItem[]) {
  const allItems = categories.value.flatMap((c) => c.items)
  for (const suggested of items) {
    const menuItem = allItems.find((i) => i.id === suggested.menuItemId)
    if (menuItem) cart.addItem(menuItem)
  }
  showAssistant.value = false
}
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
  if (categories.value.length > 0) activeCategory.value = categories.value[0]?.id ?? null
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

function scrollToCategory(categoryId: number) {
  activeCategory.value = categoryId
  const el = document.getElementById(`cat-${categoryId}`)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
    }, {
      headers: customerAuth.token ? { 'x-customer-token': customerAuth.token } : {},
    })
    cart.clear()
    showCart.value = false
    submitted.value = true
  } finally {
    submitting.value = false
  }
}

function onImgError(e: Event) {
  (e.target as HTMLImageElement).src = foodPlaceholder
}

onMounted(() => {
  fetchMenu()
  fetchBanners()
})
</script>

<template>
  <!-- 送出成功畫面 -->
  <div v-if="submitted" class="min-h-screen flex flex-col items-center justify-center gap-5 p-8" style="background: #FFF8F0">
    <div class="text-7xl mb-2">🎉</div>
    <h2 class="text-2xl font-bold" style="color: #3E2723">訂單已送出！</h2>
    <p class="text-sm text-center" style="color: #A1887F">{{ submitTableNo }}，請稍候<br>我們正在為您精心準備</p>
    <button
      class="mt-6 px-10 py-3 rounded-full font-semibold text-white"
      style="background: linear-gradient(135deg, #FF9800, #E65100)"
      @click="submitted = false; fetchMenu()"
    >
      繼續點餐
    </button>
  </div>

  <!-- 登入畫面 -->
  <div
    v-else-if="!customerAuth.isLoggedIn"
    class="min-h-screen flex flex-col items-center justify-center px-8 gap-6"
    style="background: #FFF8F0"
  >
    <img src="@/assets/logo.png" alt="logo" class="w-20 h-20 rounded-full object-cover shadow" />
    <div class="text-center">
      <h1 class="text-xl font-bold" style="color: #3E2723">心心精緻早午餐</h1>
      <p class="text-sm mt-1" style="color: #BCAAA4">請先登入以繼續點餐</p>
    </div>
    <GoogleLogin
      :callback="handleGoogleLogin"
      :button-config="{ theme: 'outline', size: 'large', text: 'signin_with', shape: 'pill', width: 280 }"
    />
    <p class="text-xs text-center" style="color: #BCAAA4">登入即代表您同意本店蒐集基本個人資料用於訂餐服務</p>
  </div>

  <!-- 填寫手機號碼 -->
  <div
    v-else-if="customerAuth.needsPhone"
    class="min-h-screen flex flex-col items-center justify-center px-8 gap-5"
    style="background: #FFF8F0"
  >
    <div class="text-center">
      <p class="text-4xl mb-3">📱</p>
      <h2 class="text-lg font-bold" style="color: #3E2723">最後一步！填入手機號碼</h2>
      <p class="text-sm mt-1" style="color: #BCAAA4">方便店家在訂單有異動時與您聯繫</p>
    </div>
    <div class="w-full max-w-xs flex flex-col gap-3">
      <input
        v-model="phoneInput"
        type="tel"
        placeholder="0912-345-678"
        class="w-full rounded-xl px-4 py-3 text-sm border outline-none"
        style="border-color: #E8DDD6; color: #3E2723"
        @keyup.enter="savePhone"
      />
      <button
        class="w-full rounded-xl py-3 font-semibold text-white disabled:opacity-40"
        style="background: linear-gradient(135deg, #FF9800, #E65100)"
        :disabled="!phoneInput.trim() || phoneLoading"
        @click="savePhone"
      >
        {{ phoneLoading ? '儲存中...' : '完成註冊，開始點餐 →' }}
      </button>
      <button class="text-xs text-center" style="color: #BCAAA4" @click="customerAuth.logout()">
        切換帳號
      </button>
    </div>
  </div>

  <!-- 點餐主頁 -->
  <div v-else class="min-h-screen" style="background: #F7F3EF">

    <!-- 固定頂部：Header + Banner -->
    <div class="sticky top-0 z-20" style="background: white">

      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-3">
        <div class="flex items-center gap-3">
          <img src="@/assets/logo.png" alt="logo" class="h-9 w-9 rounded-full object-cover" />
          <div>
            <h1 class="text-base font-bold leading-tight" style="color: #3E2723">心心精緻早午餐</h1>
            <p class="text-xs" style="color: #BCAAA4">{{ headerLabel }}</p>
          </div>
        </div>
        <button
          class="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white"
          style="background: linear-gradient(135deg, #FF9800, #E65100)"
          @click="showCart = true"
        >
          <span>購物車</span>
          <span
            v-if="cart.totalCount > 0"
            class="bg-white rounded-full w-5 h-5 text-xs font-bold flex items-center justify-center"
            style="color: #E65100"
          >{{ cart.totalCount }}</span>
        </button>
      </div>

      <!-- Banner -->
      <div v-if="banners.length > 0" class="w-full" style="height: 160px">
        <Swiper
          :modules="swiperModules"
          :autoplay="{ delay: 4000, disableOnInteraction: false }"
          :pagination="{ clickable: true }"
          :loop="banners.length > 1"
          class="w-full h-full"
        >
          <SwiperSlide v-for="banner in banners" :key="banner.id">
            <div class="relative w-full h-full">
              <img :src="banner.imageUrl" :alt="banner.title ?? ''" class="w-full h-full object-cover" />
              <div
                v-if="banner.title || banner.subtitle"
                class="absolute inset-0 flex flex-col justify-end px-5 py-3"
                style="background: linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%)"
              >
                <p v-if="banner.title" class="text-white font-bold text-base drop-shadow">{{ banner.title }}</p>
                <p v-if="banner.subtitle" class="text-xs mt-0.5 drop-shadow" style="color: rgba(255,255,255,0.8)">{{ banner.subtitle }}</p>
              </div>
            </div>
          </SwiperSlide>
        </Swiper>
      </div>

      <!-- 分類 Tab -->
      <div class="flex overflow-x-auto gap-1 px-4 py-3 scrollbar-none" style="border-top: 1px solid #F0EBE6">
        <button
          v-for="cat in categories"
          :key="cat.id"
          class="shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all"
          :style="activeCategory === cat.id
            ? 'background: #E65100; color: white'
            : 'background: #F0EBE6; color: #8D6E63'"
          @click="scrollToCategory(cat.id)"
        >
          {{ cat.name }}
        </button>
      </div>

    </div>

    <!-- 菜單 -->
    <main class="px-4 pt-5 pb-36 space-y-6">
      <section v-for="category in categories" :key="category.id" :id="`cat-${category.id}`">

        <!-- 分類標題 -->
        <div class="flex items-center gap-3 mb-3">
          <span class="text-base font-bold" style="color: #3E2723">{{ category.name }}</span>
          <div class="flex-1 h-px" style="background: #E8DDD6"></div>
        </div>

        <!-- 品項列表 -->
        <div class="space-y-3">
          <div
            v-for="item in availableItems(category)"
            :key="item.id"
            class="flex gap-3 rounded-2xl overflow-hidden"
            style="background: white; box-shadow: 0 1px 6px rgba(0,0,0,0.05)"
          >
            <!-- 縮圖 / 佔位 -->
            <div
              class="shrink-0 w-24 h-24 flex items-center justify-center overflow-hidden"
              style="background: #F5EDE6"
            >
              <img
                :src="item.image || foodPlaceholder"
                :alt="item.name"
                class="w-full h-full object-cover"
                @error="onImgError"
              />
            </div>

            <!-- 品項資訊 + 加減 -->
            <div class="flex flex-1 items-center gap-3 px-4 py-3 min-w-0">
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-sm" style="color: #3E2723">{{ item.name }}</p>
                <p v-if="item.description" class="text-xs mt-0.5 truncate" style="color: #BCAAA4">{{ item.description }}</p>
                <p class="text-sm font-bold mt-1" style="color: #E65100">NT$ {{ parseFloat(item.price) }}</p>
              </div>

              <!-- 加減 -->
              <div class="flex items-center gap-2 shrink-0">
                <Transition name="pop">
                  <button
                    v-if="getQuantityInCart(item.id) > 0"
                    class="w-7 h-7 rounded-full flex items-center justify-center text-base font-bold"
                    style="background: #F0EBE6; color: #E65100"
                    @click="cart.removeItem(item.id)"
                  >−</button>
                </Transition>
                <span v-if="getQuantityInCart(item.id) > 0" class="w-5 text-center text-sm font-bold" style="color: #3E2723">
                  {{ getQuantityInCart(item.id) }}
                </span>
                <button
                  class="w-7 h-7 rounded-full flex items-center justify-center text-base font-bold text-white"
                  style="background: linear-gradient(135deg, #FF9800, #E65100)"
                  @click="cart.addItem(item)"
                >+</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- 購物車浮動列 -->
    <Transition name="slide-up-bar">
      <div
        v-if="cart.totalCount > 0 && !showCart"
        class="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-2"
        style="background: linear-gradient(to top, #F7F3EF 60%, transparent)"
      >
        <button
          class="w-full rounded-2xl py-4 flex items-center justify-between px-5 text-white font-semibold"
          style="background: linear-gradient(135deg, #FF9800, #E65100); box-shadow: 0 6px 20px rgba(230,81,0,0.35)"
          @click="showCart = true"
        >
          <span class="bg-white rounded-full w-6 h-6 text-xs font-bold flex items-center justify-center" style="color: #E65100">
            {{ cart.totalCount }}
          </span>
          <span>查看購物車</span>
          <span>NT$ {{ cart.totalPrice }}</span>
        </button>
      </div>
    </Transition>

    <!-- AI 助理浮動按鈕 -->
    <button
      v-if="!showCart && !showAssistant"
      class="fixed bottom-24 right-4 z-25 w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-lg"
      style="background: linear-gradient(135deg, #FF9800, #E65100); box-shadow: 0 4px 16px rgba(230,81,0,0.4)"
      @click="showAssistant = true"
    >
      🤖
    </button>

    <!-- AI 助理聊天介面 -->
    <Transition name="slide-up">
      <AiAssistantChat
        v-if="showAssistant"
        @add-items="handleAiAddItems"
        @close="showAssistant = false"
      />
    </Transition>

    <!-- 購物車全屏 -->
    <Transition name="slide-up">
      <div v-if="showCart" class="fixed inset-0 z-30 flex flex-col" style="background: white">
        <!-- 購物車 Header -->
        <div class="flex items-center justify-between px-5 py-4" style="border-bottom: 1px solid #F0EBE6">
          <h2 class="text-lg font-bold" style="color: #3E2723">我的訂單</h2>
          <button
            class="w-8 h-8 rounded-full flex items-center justify-center text-lg"
            style="background: #F0EBE6; color: #8D6E63"
            @click="showCart = false"
          >×</button>
        </div>

        <!-- 品項列表 -->
        <div class="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          <div v-if="cart.items.length === 0" class="text-center py-16" style="color: #BCAAA4">
            <p class="text-3xl mb-3">🛒</p>
            <p class="text-sm">尚未選擇任何品項</p>
          </div>
          <div
            v-for="item in cart.items"
            :key="item.menuItem.id"
            class="flex items-center gap-3 rounded-2xl p-3"
            style="background: #F7F3EF"
          >
            <div class="flex-1">
              <p class="font-semibold text-sm" style="color: #3E2723">{{ item.menuItem.name }}</p>
              <p class="text-xs mt-0.5" style="color: #BCAAA4">NT$ {{ parseFloat(item.menuItem.price) }} 元</p>
            </div>
            <div class="flex items-center gap-2">
              <button
                class="w-7 h-7 rounded-full flex items-center justify-center font-bold"
                style="background: white; color: #E65100"
                @click="cart.removeItem(item.menuItem.id)"
              >−</button>
              <span class="w-5 text-center text-sm font-bold" style="color: #3E2723">{{ item.quantity }}</span>
              <button
                class="w-7 h-7 rounded-full flex items-center justify-center font-bold text-white"
                style="background: linear-gradient(135deg, #FF9800, #E65100)"
                @click="cart.addItem(item.menuItem)"
              >+</button>
            </div>
            <div class="w-16 text-right text-sm font-bold" style="color: #E65100">
              NT$ {{ parseFloat(item.menuItem.price) * item.quantity }}
            </div>
          </div>
        </div>

        <!-- 底部結帳區 -->
        <div class="px-5 pt-4 pb-8 space-y-4" style="border-top: 1px solid #F0EBE6">
          <!-- 免洗餐具 -->
          <label
            v-if="orderType === 'takeout'"
            class="flex items-center gap-3 rounded-xl px-4 py-3 cursor-pointer"
            style="background: #FFF3E0"
          >
            <input type="checkbox" v-model="needUtensils" class="w-4 h-4 accent-orange-500 cursor-pointer" />
            <span class="text-sm" style="color: #5D4037">需要免洗餐具</span>
          </label>

          <!-- 合計 -->
          <div class="flex justify-between items-center">
            <span class="text-sm" style="color: #8D6E63">合計</span>
            <span class="text-xl font-bold" style="color: #E65100">NT$ {{ cart.totalPrice }}</span>
          </div>

          <!-- 送出 -->
          <button
            class="w-full rounded-2xl py-4 font-bold text-white disabled:opacity-40"
            style="background: linear-gradient(135deg, #FF9800, #E65100)"
            :disabled="cart.items.length === 0 || submitting"
            @click="submitOrder"
          >
            {{ submitting ? '送出中...' : '確認送出' }}
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.scrollbar-none { scrollbar-width: none; }
.scrollbar-none::-webkit-scrollbar { display: none; }

.pop-enter-active { transition: all 0.15s ease; }
.pop-enter-from { transform: scale(0); opacity: 0; }

.slide-up-enter-active { transition: all 0.3s cubic-bezier(0.34, 1.2, 0.64, 1); }
.slide-up-leave-active { transition: all 0.2s ease; }
.slide-up-enter-from, .slide-up-leave-to { transform: translateY(100%); }

.slide-up-bar-enter-active { transition: all 0.25s ease; }
.slide-up-bar-leave-active { transition: all 0.15s ease; }
.slide-up-bar-enter-from, .slide-up-bar-leave-to { transform: translateY(80px); opacity: 0; }
</style>
