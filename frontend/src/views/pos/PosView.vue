<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import api from '@/composables/useApi'
import { useNotify } from '@/composables/useNotify'
import { useSocket } from '@/composables/useSocket'
import type { Order } from '@/types/order'
import type { Category, MenuItem } from '@/types/menu'

const notify = useNotify()
const CORRECT_PIN = '1234'
const PIN_SESSION_KEY = 'pos_unlocked'

// PIN 鎖
const unlocked = ref(sessionStorage.getItem(PIN_SESSION_KEY) === 'true')
const pinInput = ref('')
const pinError = ref(false)

const pinDots = computed(() => Array.from({ length: 4 }, (_, i) => i < pinInput.value.length))

function pressKey(key: string) {
  if (pinInput.value.length >= 4) return
  pinInput.value += key
  pinError.value = false
  if (pinInput.value.length === 4) {
    if (pinInput.value === CORRECT_PIN) {
      sessionStorage.setItem(PIN_SESSION_KEY, 'true')
      unlocked.value = true
      fetchOrders()
      fetchMenu()
      startRealtimeSync()
    } else {
      pinError.value = true
      setTimeout(() => {
        pinInput.value = ''
        pinError.value = false
      }, 600)
    }
  }
}

function pressDelete() {
  pinInput.value = pinInput.value.slice(0, -1)
  pinError.value = false
}

// POS 主邏輯
const orders = ref<Order[]>([])
const selectedOrder = ref<Order | null>(null)
const actionLoading = ref(false)
const activeTab = ref<'ORDER' | 'PENDING' | 'PREPARING' | 'READY'>('ORDER')

// 菜單 & 購物車
interface CartItem {
  menuItem: MenuItem
  quantity: number
}
const categories = ref<Category[]>([])
const cartItems = ref<CartItem[]>([])
const tableNo = ref('')
const orderType = ref<'dine-in' | 'takeout'>('dine-in')
const needUtensils = ref(false)
const submitLoading = ref(false)
const selectedCategoryId = ref<number | null>(null)

const displayedMenuItems = computed(() => {
  if (selectedCategoryId.value === null) {
    return categories.value.flatMap((c) => c.items.filter((i) => i.isAvailable))
  }
  const cat = categories.value.find((c) => c.id === selectedCategoryId.value)
  return cat ? cat.items.filter((i) => i.isAvailable) : []
})

const cartTotal = computed(() =>
  cartItems.value.reduce((sum, ci) => sum + parseFloat(ci.menuItem.price) * ci.quantity, 0)
)

async function fetchMenu() {
  const { data } = await api.get<Category[]>('/api/menu')
  categories.value = data
  if (data.length && selectedCategoryId.value === null) {
    // 不預選，保持「全部」
  }
}

function addToCart(item: MenuItem) {
  const existing = cartItems.value.find((ci) => ci.menuItem.id === item.id)
  if (existing) {
    existing.quantity++
  } else {
    cartItems.value.push({ menuItem: item, quantity: 1 })
  }
}

function removeFromCart(item: MenuItem) {
  const idx = cartItems.value.findIndex((ci) => ci.menuItem.id === item.id)
  if (idx === -1) return
  const ci = cartItems.value[idx]!
  if (ci.quantity > 1) {
    ci.quantity--
  } else {
    cartItems.value.splice(idx, 1)
  }
}

function cartQuantity(item: MenuItem): number {
  return cartItems.value.find((ci) => ci.menuItem.id === item.id)?.quantity ?? 0
}

const submitTableNo = computed(() => {
  if (orderType.value === 'dine-in') return tableNo.value.trim()
  return needUtensils.value ? '外帶（需免洗餐具）' : '外帶'
})

// 結帳流程：'cart' → (付款方式 dialog) → 'confirm'
const checkoutStep = ref<'cart' | 'confirm'>('cart')
const showPaymentDialog = ref(false)

type PaymentMethod = 'cash' | 'card' | 'linepay'
const paymentMethod = ref<PaymentMethod | null>(null)

const paymentOptions: { value: PaymentMethod; label: string; icon: string }[] = [
  { value: 'cash',    label: '現金',   icon: '💵' },
  { value: 'card',    label: '信用卡', icon: '💳' },
  { value: 'linepay', label: 'Line Pay', icon: '📱' },
]

const paymentLabel = computed(() =>
  paymentOptions.find((p) => p.value === paymentMethod.value)?.label ?? ''
)

function goToCheckout() {
  if (orderType.value === 'dine-in' && !tableNo.value.trim()) {
    notify.error('請輸入桌號')
    return
  }
  if (cartItems.value.length === 0) {
    notify.error('購物車是空的')
    return
  }
  showPaymentDialog.value = true
}

function selectPayment(method: PaymentMethod) {
  paymentMethod.value = method
  showPaymentDialog.value = false
  checkoutStep.value = 'confirm'
}

function cancelCheckout() {
  checkoutStep.value = 'cart'
  paymentMethod.value = null
}

async function confirmPayment() {
  submitLoading.value = true
  try {
    const { data: order } = await api.post<{ id: number }>('/api/orders', {
      tableNo: submitTableNo.value,
      items: cartItems.value.map((ci) => ({
        menuItemId: ci.menuItem.id,
        quantity: ci.quantity,
        unitPrice: parseFloat(ci.menuItem.price),
      })),
    })
    await api.patch(`/api/orders/${order.id}/status`, { status: 'PREPARING' })
    notify.success(`${submitTableNo.value}・${paymentLabel.value} 收款完成，已送出至廚房`)
    cartItems.value = []
    tableNo.value = ''
    needUtensils.value = false
    paymentMethod.value = null
    checkoutStep.value = 'cart'
    await fetchOrders()
  } catch {
    notify.error('送出失敗')
  } finally {
    submitLoading.value = false
  }
}

const pendingOrders = computed(() => orders.value.filter((o) => o.status === 'PENDING'))
const preparingOrders = computed(() => orders.value.filter((o) => o.status === 'PREPARING'))
const readyOrders = computed(() => orders.value.filter((o) => o.status === 'READY'))

const displayedOrders = computed(() => {
  if (activeTab.value === 'PENDING') return pendingOrders.value
  if (activeTab.value === 'PREPARING') return preparingOrders.value
  if (activeTab.value === 'READY') return readyOrders.value
  return []
})

async function fetchOrders() {
  const { data } = await api.get<Order[]>('/api/orders')
  orders.value = data.filter((o) => o.status !== 'PAID')
  if (selectedOrder.value) {
    const updated = orders.value.find((o) => o.id === selectedOrder.value!.id)
    selectedOrder.value = updated ?? null
  }
}

function selectOrder(order: Order) {
  selectedOrder.value = order
}

async function handleCheckout() {
  if (!selectedOrder.value) return
  actionLoading.value = true
  try {
    await api.patch(`/api/orders/${selectedOrder.value.id}/status`, { status: 'PREPARING' })
    notify.success(`桌號 ${selectedOrder.value.tableNo} 已送出，開始準備`)
    selectedOrder.value = null
    await fetchOrders()
  } catch {
    notify.error('操作失敗')
  } finally {
    actionLoading.value = false
  }
}

const socket = useSocket()
let pollTimer: ReturnType<typeof setInterval> | null = null

function startRealtimeSync() {
  socket.on('order:new', fetchOrders)
  socket.on('order:updated', fetchOrders)
  pollTimer = setInterval(fetchOrders, 60000)
}

onMounted(() => {
  if (unlocked.value) {
    fetchOrders()
    fetchMenu()
    startRealtimeSync()
  }
})

onUnmounted(() => {
  socket.off('order:new', fetchOrders)
  socket.off('order:updated', fetchOrders)
  if (pollTimer) clearInterval(pollTimer)
})
</script>

<template>
  <!-- PIN 鎖畫面 -->
  <div
    v-if="!unlocked"
    class="fixed inset-0 flex flex-col items-center justify-center"
    style="background: #3E2723"
  >
    <img src="@/assets/logo.png" alt="logo" class="h-16 w-16 rounded-full object-cover mb-2" />
    <h1 class="text-white font-bold text-xl mb-1">心心精緻早午餐</h1>
    <p class="text-sm mb-10" style="color: #A1887F">POS 結帳系統</p>

    <div class="flex gap-4 mb-8" :class="{ shake: pinError }">
      <div
        v-for="(filled, i) in pinDots"
        :key="i"
        class="w-4 h-4 rounded-full border-2 transition-all"
        :class="pinError ? 'border-red-400 bg-red-400' : filled ? 'border-white bg-white' : 'border-white/40'"
      />
    </div>

    <div class="grid grid-cols-3 gap-3 w-64">
      <button
        v-for="n in [1,2,3,4,5,6,7,8,9]"
        :key="n"
        class="h-16 rounded-2xl text-white text-2xl font-light transition-all active:scale-95"
        style="background: rgba(255,255,255,0.1)"
        @click="pressKey(String(n))"
      >
        {{ n }}
      </button>
      <div />
      <button
        class="h-16 rounded-2xl text-white text-2xl font-light transition-all active:scale-95"
        style="background: rgba(255,255,255,0.1)"
        @click="pressKey('0')"
      >
        0
      </button>
      <button
        class="h-16 rounded-2xl text-white text-xl transition-all active:scale-95"
        style="background: rgba(255,255,255,0.05)"
        @click="pressDelete"
      >
        ⌫
      </button>
    </div>
  </div>

  <!-- POS 主畫面 -->
  <div v-else class="flex h-screen" style="background: #fdf6f0">

    <!-- 左側邊欄 -->
    <div class="flex flex-col py-6 px-3 gap-2 w-24" style="background: #3E2723">
      <div class="text-center mb-4">
        <img src="@/assets/logo.png" alt="logo" class="h-10 w-10 rounded-full object-cover mx-auto" />
      </div>

      <!-- 點餐 -->
      <button
        class="relative flex flex-col items-center gap-1.5 py-4 rounded-xl text-xs font-medium transition-all"
        :style="activeTab === 'ORDER'
          ? 'background: rgba(255,255,255,0.15); color: #fff'
          : 'color: #A1887F'"
        @click="activeTab = 'ORDER'"
      >
        <span class="text-xl">🛒</span>
        <span>點餐</span>
      </button>

      <!-- 待處理 -->
      <button
        class="relative flex flex-col items-center gap-1.5 py-4 rounded-xl text-xs font-medium transition-all"
        :style="activeTab === 'PENDING'
          ? 'background: rgba(255,255,255,0.15); color: #fff'
          : 'color: #A1887F'"
        @click="activeTab = 'PENDING'"
      >
        <span class="text-xl">📋</span>
        <span>待處理</span>
        <span
          v-if="pendingOrders.length"
          class="absolute top-2 right-2 inline-flex items-center justify-center w-4 h-4 rounded-full text-white"
          style="font-size: 10px; background: #E65100"
        >{{ pendingOrders.length }}</span>
      </button>

      <!-- 準備中 -->
      <button
        class="relative flex flex-col items-center gap-1.5 py-4 rounded-xl text-xs font-medium transition-all"
        :style="activeTab === 'PREPARING'
          ? 'background: rgba(255,255,255,0.15); color: #fff'
          : 'color: #A1887F'"
        @click="activeTab = 'PREPARING'"
      >
        <span class="text-xl">🍳</span>
        <span>準備中</span>
        <span
          v-if="preparingOrders.length"
          class="absolute top-2 right-2 inline-flex items-center justify-center w-4 h-4 rounded-full text-white"
          style="font-size: 10px; background: #1565C0"
        >{{ preparingOrders.length }}</span>
      </button>

      <!-- 可取餐 -->
      <button
        class="relative flex flex-col items-center gap-1.5 py-4 rounded-xl text-xs font-medium transition-all"
        :style="activeTab === 'READY'
          ? 'background: rgba(255,255,255,0.15); color: #fff'
          : 'color: #A1887F'"
        @click="activeTab = 'READY'"
      >
        <span class="text-xl">✅</span>
        <span>可取餐</span>
        <span
          v-if="readyOrders.length"
          class="absolute top-2 right-2 inline-flex items-center justify-center w-4 h-4 rounded-full text-white"
          style="font-size: 10px; background: #2E7D32"
        >{{ readyOrders.length }}</span>
      </button>

      <!-- 重新整理 -->
      <div class="flex-1" />
      <button
        class="flex flex-col items-center gap-1 py-3 rounded-xl text-xs transition-all"
        style="color: #6D4C41"
        @click="fetchOrders"
      >
        <span class="text-lg">🔄</span>
        <span>更新</span>
      </button>
    </div>

    <!-- 主內容區 -->
    <div class="flex-1 flex overflow-hidden p-5 gap-4">

      <!-- ===== 點餐介面 ===== -->
      <template v-if="activeTab === 'ORDER'">

        <!-- 菜單區 -->
        <div class="flex-1 flex flex-col overflow-hidden">
          <!-- 分類篩選 -->
          <div class="flex gap-2 mb-4 flex-wrap shrink-0">
            <button
              class="px-3 py-1.5 rounded-full text-sm font-medium transition-all"
              :style="selectedCategoryId === null
                ? 'background: #5D4037; color: #fff'
                : 'background: #fff; color: #8D6E63; border: 1px solid #ede0d4'"
              @click="selectedCategoryId = null"
            >
              全部
            </button>
            <button
              v-for="cat in categories"
              :key="cat.id"
              class="px-3 py-1.5 rounded-full text-sm font-medium transition-all"
              :style="selectedCategoryId === cat.id
                ? 'background: #5D4037; color: #fff'
                : 'background: #fff; color: #8D6E63; border: 1px solid #ede0d4'"
              @click="selectedCategoryId = cat.id"
            >
              {{ cat.name }}
            </button>
          </div>

          <!-- 品項卡片 -->
          <div class="flex-1 overflow-y-auto">
            <div class="grid gap-3" style="grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); align-content: start">
              <div
                v-for="item in displayedMenuItems"
                :key="item.id"
                class="bg-white rounded-xl p-3 shadow-sm flex flex-col gap-2"
                style="border: 1px solid #ede0d4"
              >
                <div class="text-sm font-semibold" style="color: #5D4037">{{ item.name }}</div>
                <div class="text-base font-bold" style="color: #F57C00">NT$ {{ parseFloat(item.price) }}</div>
                <!-- 數量控制 -->
                <div class="flex items-center gap-2 mt-auto">
                  <button
                    class="w-7 h-7 rounded-full flex items-center justify-center text-lg font-bold transition-all active:scale-95"
                    style="background: #ede0d4; color: #5D4037"
                    :disabled="cartQuantity(item) === 0"
                    @click="removeFromCart(item)"
                  >−</button>
                  <span class="flex-1 text-center text-sm font-bold" style="color: #5D4037">
                    {{ cartQuantity(item) || '' }}
                  </span>
                  <button
                    class="w-7 h-7 rounded-full flex items-center justify-center text-lg font-bold transition-all active:scale-95"
                    style="background: #F57C00; color: #fff"
                    @click="addToCart(item)"
                  >+</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 購物車面板 -->
        <div
          class="w-72 flex flex-col rounded-2xl bg-white shadow-sm overflow-hidden"
          style="border: 1px solid #ede0d4"
        >
          <!-- ── 步驟一：購物車 ── -->
          <template v-if="checkoutStep === 'cart'">
            <div class="px-5 py-4 shrink-0" style="border-bottom: 1px solid #ede0d4">
              <div class="font-bold text-base" style="color: #5D4037">購物車</div>
            </div>

            <!-- 空購物車 -->
            <div v-if="cartItems.length === 0" class="flex-1 flex flex-col items-center justify-center gap-3" style="color: #BCAAA4">
              <div class="text-4xl">🛒</div>
              <div class="text-sm">點選品項加入購物車</div>
            </div>

            <!-- 有品項 -->
            <template v-else>
              <div class="flex-1 overflow-y-auto px-5 py-4">
                <div class="space-y-3">
                  <div
                    v-for="ci in cartItems"
                    :key="ci.menuItem.id"
                    class="flex justify-between items-center"
                  >
                    <div class="flex-1">
                      <div class="text-sm font-medium" style="color: #5D4037">{{ ci.menuItem.name }}</div>
                      <div class="text-xs" style="color: #BCAAA4">× {{ ci.quantity }}</div>
                    </div>
                    <div class="text-sm" style="color: #8D6E63">
                      NT$ {{ parseFloat(ci.menuItem.price) * ci.quantity }}
                    </div>
                  </div>
                </div>
                <div style="border-top: 1px solid #ede0d4" class="mt-4 pt-4">
                  <div class="flex justify-between items-center">
                    <span class="font-semibold" style="color: #5D4037">合計</span>
                    <span class="text-2xl font-bold" style="color: #F57C00">NT$ {{ cartTotal }}</span>
                  </div>
                </div>
              </div>

              <div class="px-5 pb-5 shrink-0 space-y-3">
                <!-- 內用 / 外帶切換 -->
                <div class="flex rounded-lg overflow-hidden border" style="border-color: #ede0d4">
                  <button
                    class="flex-1 py-2 text-sm font-medium transition-colors"
                    :style="orderType === 'dine-in'
                      ? 'background: #5D4037; color: #fff'
                      : 'background: #fff; color: #8D6E63'"
                    @click="orderType = 'dine-in'"
                  >
                    🍽 內用
                  </button>
                  <button
                    class="flex-1 py-2 text-sm font-medium transition-colors"
                    :style="orderType === 'takeout'
                      ? 'background: #5D4037; color: #fff'
                      : 'background: #fff; color: #8D6E63'"
                    @click="orderType = 'takeout'"
                  >
                    🛍 外帶
                  </button>
                </div>

                <!-- 桌號（內用） -->
                <el-input
                  v-if="orderType === 'dine-in'"
                  v-model="tableNo"
                  placeholder="輸入桌號"
                  size="large"
                />

                <!-- 免洗餐具（外帶） -->
                <label
                  v-else
                  class="flex items-center gap-3 rounded-lg px-3 py-2.5 cursor-pointer"
                  style="border: 1px solid #ede0d4"
                >
                  <el-checkbox v-model="needUtensils" />
                  <span class="text-sm" style="color: #5D4037">需要免洗餐具</span>
                </label>

                <el-button
                  type="warning"
                  class="w-full"
                  size="large"
                  @click="goToCheckout"
                >
                  結帳
                </el-button>
              </div>
            </template>
          </template>

          <!-- ── 步驟二：結帳確認 ── -->
          <template v-else>
            <div class="px-5 py-4 shrink-0 flex items-center gap-2" style="border-bottom: 1px solid #ede0d4">
              <button class="text-gray-400 hover:text-gray-600 text-lg leading-none" @click="cancelCheckout">←</button>
              <div class="font-bold text-base" style="color: #5D4037">結帳確認</div>
            </div>

            <div class="flex-1 overflow-y-auto px-5 py-4">
              <!-- 訂單資訊標籤列 -->
              <div class="flex flex-wrap gap-2 mb-4">
                <div
                  class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium"
                  :style="orderType === 'dine-in'
                    ? 'background: #FFF3E0; color: #E65100'
                    : 'background: #E8F5E9; color: #2E7D32'"
                >
                  {{ orderType === 'dine-in' ? `🍽 內用・桌號 ${tableNo}` : `🛍 外帶${needUtensils ? '・需免洗餐具' : ''}` }}
                </div>
                <div
                  class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium"
                  style="background: #EDE7F6; color: #4527A0"
                >
                  {{ paymentOptions.find(p => p.value === paymentMethod)?.icon }}
                  {{ paymentLabel }}
                </div>
              </div>

              <div class="space-y-3">
                <div
                  v-for="ci in cartItems"
                  :key="ci.menuItem.id"
                  class="flex justify-between items-center"
                >
                  <div class="flex-1">
                    <div class="text-sm font-medium" style="color: #5D4037">{{ ci.menuItem.name }}</div>
                    <div class="text-xs" style="color: #BCAAA4">× {{ ci.quantity }}</div>
                  </div>
                  <div class="text-sm" style="color: #8D6E63">
                    NT$ {{ parseFloat(ci.menuItem.price) * ci.quantity }}
                  </div>
                </div>
              </div>

              <div style="border-top: 1px solid #ede0d4" class="mt-4 pt-4">
                <div class="flex justify-between items-center">
                  <span class="font-semibold" style="color: #5D4037">應收金額</span>
                  <span class="text-3xl font-bold" style="color: #F57C00">NT$ {{ cartTotal }}</span>
                </div>
              </div>
            </div>

            <div class="px-5 pb-5 shrink-0">
              <el-button
                type="primary"
                class="w-full"
                size="large"
                :loading="submitLoading"
                @click="confirmPayment"
              >
                確認收款・送出至廚房
              </el-button>
            </div>
          </template>
        </div>
      </template>

      <!-- ===== 訂單管理介面 ===== -->
      <template v-else>

        <!-- 訂單卡片列表 -->
        <div class="flex-1 flex flex-col overflow-hidden">
          <div class="flex items-center gap-3 mb-4">
            <span class="text-lg font-semibold" style="color: #5D4037">
              {{ activeTab === 'PENDING' ? '待處理' : activeTab === 'PREPARING' ? '準備中' : '可取餐' }}
            </span>
            <span class="text-sm" style="color: #BCAAA4">{{ displayedOrders.length }} 筆訂單</span>
          </div>

          <div class="flex-1 overflow-y-auto">
            <div v-if="displayedOrders.length === 0" class="flex flex-col items-center justify-center h-full gap-3" style="color: #BCAAA4">
              <div class="text-4xl">📭</div>
              <div class="text-sm">目前沒有訂單</div>
            </div>

            <div class="grid grid-cols-2 gap-3 content-start" style="max-width: 700px">
              <div
                v-for="order in displayedOrders"
                :key="order.id"
                class="bg-white rounded-xl p-4 shadow-sm border transition-all"
                :class="activeTab === 'PENDING' ? 'cursor-pointer' : ''"
                :style="activeTab === 'PENDING' && selectedOrder?.id === order.id
                  ? 'border-color: #F57C00; box-shadow: 0 0 0 2px #FFE0B2'
                  : 'border-color: #ede0d4'"
                @click="activeTab === 'PENDING' ? selectOrder(order) : undefined"
              >
                <div class="flex justify-between items-start mb-2">
                  <span class="font-bold text-base" style="color: #5D4037">桌號 {{ order.tableNo }}</span>
                  <span class="text-xs" style="color: #BCAAA4">#{{ order.orderNo }}</span>
                </div>
                <div class="space-y-0.5 mb-3">
                  <div v-for="item in order.items" :key="item.id" class="text-sm" style="color: #8D6E63">
                    {{ item.menuItem.name }} × {{ item.quantity }}
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <div class="font-bold" style="color: #F57C00">NT$ {{ parseFloat(order.totalPrice) }}</div>
                  <div class="text-xs" style="color: #BCAAA4">
                    {{ new Date(order.createdAt).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右側結帳面板（只在待處理頁顯示） -->
        <div
          v-if="activeTab === 'PENDING'"
          class="w-72 flex flex-col rounded-2xl bg-white shadow-sm overflow-hidden"
          style="border: 1px solid #ede0d4"
        >
          <!-- 未選中 -->
          <div v-if="!selectedOrder" class="flex-1 flex flex-col items-center justify-center gap-3" style="color: #BCAAA4">
            <div class="text-4xl">👆</div>
            <div class="text-sm text-center">點選訂單<br>進行結帳</div>
          </div>

          <!-- 已選中 -->
          <template v-else>
            <div class="px-5 py-4 border-b" style="border-color: #ede0d4">
              <div class="flex justify-between items-start">
                <div>
                  <div class="text-xl font-bold" style="color: #5D4037">桌號 {{ selectedOrder.tableNo }}</div>
                  <div class="text-xs mt-0.5" style="color: #BCAAA4">
                    #{{ selectedOrder.orderNo }} · {{ new Date(selectedOrder.createdAt).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }) }}
                  </div>
                </div>
                <button class="text-gray-300 hover:text-gray-400 text-lg leading-none" @click="selectedOrder = null">✕</button>
              </div>
            </div>

            <div class="flex-1 overflow-y-auto px-5 py-4">
              <div class="space-y-3">
                <div
                  v-for="item in selectedOrder.items"
                  :key="item.id"
                  class="flex justify-between items-center"
                >
                  <div>
                    <div class="text-sm font-medium" style="color: #5D4037">{{ item.menuItem.name }}</div>
                    <div class="text-xs" style="color: #BCAAA4">× {{ item.quantity }}</div>
                  </div>
                  <div class="text-sm" style="color: #8D6E63">
                    NT$ {{ parseFloat(item.unitPrice) * item.quantity }}
                  </div>
                </div>
              </div>

              <div class="border-t mt-4 pt-4" style="border-color: #ede0d4">
                <div class="flex justify-between items-center">
                  <span class="font-semibold" style="color: #5D4037">合計</span>
                  <span class="text-2xl font-bold" style="color: #F57C00">
                    NT$ {{ parseFloat(selectedOrder.totalPrice) }}
                  </span>
                </div>
              </div>
            </div>

            <div class="px-5 pb-5">
              <el-button
                type="primary"
                class="w-full"
                size="large"
                :loading="actionLoading"
                @click="handleCheckout"
              >
                確認結帳
              </el-button>
            </div>
          </template>
        </div>
      </template>

    </div>
  </div>

  <!-- 付款方式 Dialog -->
  <el-dialog
    v-model="showPaymentDialog"
    title="選擇付款方式"
    width="320px"
    align-center
    :close-on-click-modal="false"
  >
    <div class="grid grid-cols-3 gap-3 py-2">
      <button
        v-for="opt in paymentOptions"
        :key="opt.value"
        class="flex flex-col items-center justify-center gap-2 py-5 rounded-xl border-2 transition-all active:scale-95"
        style="border-color: #ede0d4"
        @click="selectPayment(opt.value)"
      >
        <span class="text-3xl">{{ opt.icon }}</span>
        <span class="text-sm font-medium" style="color: #5D4037">{{ opt.label }}</span>
      </button>
    </div>
  </el-dialog>
</template>

<style scoped>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%       { transform: translateX(-8px); }
  40%       { transform: translateX(8px); }
  60%       { transform: translateX(-5px); }
  80%       { transform: translateX(5px); }
}
.shake {
  animation: shake 0.5s ease;
}
</style>
