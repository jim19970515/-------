<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import api from '@/composables/useApi'
import { useNotify } from '@/composables/useNotify'
import { useSocket } from '@/composables/useSocket'
import type { Order } from '@/types/order'

const notify = useNotify()
const orders = ref<Order[]>([])
const now = ref(Date.now())
const actionLoading = ref<Record<number, boolean>>({})
const undoLoading = ref(false)

// 記住最後一筆完成備餐的訂單，用來支援復原
const lastCompleted = ref<Order | null>(null)
const lastCompletedStartTime = ref<number | null>(null)

// 計時器起始時間，存 sessionStorage 確保頁面重整不歸零
const TIMES_KEY = 'kds_prepare_times'

function getStoredTimes(): Record<number, number> {
  return JSON.parse(sessionStorage.getItem(TIMES_KEY) || '{}')
}

function recordStartTimes(preparingOrders: Order[]) {
  const stored = getStoredTimes()
  let changed = false
  for (const o of preparingOrders) {
    if (!stored[o.id]) {
      stored[o.id] = Date.now()
      changed = true
    }
  }
  // 清掉已不在 PREPARING 的舊紀錄
  const activeIds = new Set(preparingOrders.map((o) => o.id))
  for (const id of Object.keys(stored)) {
    if (!activeIds.has(Number(id))) {
      delete stored[Number(id)]
      changed = true
    }
  }
  if (changed) sessionStorage.setItem(TIMES_KEY, JSON.stringify(stored))
}

function getElapsed(orderId: number): number {
  const stored = getStoredTimes()
  return stored[orderId] ? now.value - stored[orderId] : 0
}

function formatElapsed(ms: number): string {
  const total = Math.floor(ms / 1000)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// 超過 10 分鐘變紅
function isOverdue(orderId: number): boolean {
  return getElapsed(orderId) > 10 * 60 * 1000
}

async function fetchOrders() {
  const { data } = await api.get<Order[]>('/api/orders')
  orders.value = data.filter((o) => o.status === 'PREPARING')
  recordStartTimes(orders.value)
}

async function markReady(order: Order) {
  actionLoading.value[order.id] = true
  try {
    await api.patch(`/api/orders/${order.id}/status`, { status: 'READY' })
    // 在 fetchOrders 清掉計時器前，先把這筆的起始時間存起來
    const stored = getStoredTimes()
    lastCompleted.value = order
    lastCompletedStartTime.value = stored[order.id] ?? null
    notify.success(`桌號 ${order.tableNo} 備餐完成`)
    await fetchOrders()
  } catch {
    notify.error('操作失敗')
  } finally {
    actionLoading.value[order.id] = false
  }
}

async function undoLastCompleted() {
  if (!lastCompleted.value) return
  undoLoading.value = true
  try {
    await api.patch(`/api/orders/${lastCompleted.value.id}/status`, { status: 'PREPARING' })
    // 恢復原本的計時器起始時間，讓計時繼續從原點算
    if (lastCompletedStartTime.value !== null) {
      const stored = getStoredTimes()
      stored[lastCompleted.value.id] = lastCompletedStartTime.value
      sessionStorage.setItem(TIMES_KEY, JSON.stringify(stored))
    }
    notify.success(`桌號 ${lastCompleted.value.tableNo} 已復原為準備中`)
    lastCompleted.value = null
    lastCompletedStartTime.value = null
    await fetchOrders()
  } catch {
    notify.error('復原失敗')
  } finally {
    undoLoading.value = false
  }
}

// 每秒更新 now
let clockTimer: ReturnType<typeof setInterval>
const socket = useSocket()
let pollTimer: ReturnType<typeof setInterval>

onMounted(() => {
  fetchOrders()
  clockTimer = setInterval(() => { now.value = Date.now() }, 1000)
  socket.on('order:new', fetchOrders)
  socket.on('order:updated', fetchOrders)
  pollTimer = setInterval(fetchOrders, 60000)
})

onUnmounted(() => {
  clearInterval(clockTimer)
  clearInterval(pollTimer)
  socket.off('order:new', fetchOrders)
  socket.off('order:updated', fetchOrders)
})
</script>

<template>
  <div class="h-screen flex flex-col" style="background: #121212">

    <!-- Header -->
    <div class="shrink-0 flex items-center justify-between px-6 py-4" style="background: #1E1E1E; border-bottom: 1px solid #333">
      <div class="flex items-center gap-3">
        <span class="text-2xl">🍳</span>
        <div>
          <div class="font-bold text-base text-white">廚房顯示系統</div>
          <div class="text-xs" style="color: #888">Kitchen Display System</div>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <div class="text-sm" style="color: #888">
          準備中：<span class="font-bold text-white text-lg">{{ orders.length }}</span> 筆
        </div>
        <button
          class="px-3 py-1.5 rounded-lg text-sm transition-all"
          style="background: #2a2a2a; color: #888; border: 1px solid #333"
          @click="fetchOrders"
        >
          🔄 更新
        </button>
      </div>
    </div>

    <!-- 可 scroll 的內容區 -->
    <div class="flex-1 overflow-y-auto">

    <!-- 空狀態 -->
    <div v-if="orders.length === 0" class="h-full flex flex-col items-center justify-center gap-4">
      <div class="text-6xl">✅</div>
      <div class="text-xl font-semibold text-white">目前沒有待製作的訂單</div>
      <div class="text-sm" style="color: #666">有新訂單時會自動顯示</div>
    </div>

    <!-- 訂單卡片 -->
    <div v-else class="p-5 grid gap-4" style="grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); align-content: start">
      <div
        v-for="order in orders"
        :key="order.id"
        class="rounded-2xl overflow-hidden flex flex-col"
        :style="isOverdue(order.id)
          ? 'background: #2D1515; border: 2px solid #C62828'
          : 'background: #1E1E1E; border: 2px solid #333'"
      >
        <!-- 卡片 Header -->
        <div
          class="flex items-center justify-between px-4 py-3"
          :style="isOverdue(order.id) ? 'background: #3D1A1A' : 'background: #2A2A2A'"
        >
          <div class="flex items-center gap-3">
            <span class="text-2xl font-black text-white">桌 {{ order.tableNo }}</span>
            <span class="text-sm px-2 py-0.5 rounded-full" style="background: #333; color: #888">#{{ order.orderNo }}</span>
          </div>

          <!-- 計時器 -->
          <div
            class="font-mono text-xl font-bold tabular-nums"
            :style="isOverdue(order.id) ? 'color: #EF5350' : 'color: #F57C00'"
          >
            ⏱ {{ formatElapsed(getElapsed(order.id)) }}
          </div>
        </div>

        <!-- 品項列表 -->
        <div class="flex-1 px-4 py-4 space-y-2">
          <div
            v-for="item in order.items"
            :key="item.id"
            class="flex justify-between items-center"
          >
            <span class="text-white text-base font-medium">{{ item.menuItem.name }}</span>
            <span
              class="text-lg font-black px-3 py-0.5 rounded-lg"
              style="background: #333; color: #F57C00"
            >× {{ item.quantity }}</span>
          </div>
        </div>

        <!-- 卡片 Footer -->
        <div class="flex items-center justify-between px-4 pb-4 pt-2" style="border-top: 1px solid #2a2a2a">
          <div class="text-xs" style="color: #666">
            進單：{{ new Date(order.createdAt).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) }}
          </div>
          <button
            class="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all active:scale-95 disabled:opacity-50"
            style="background: #2E7D32"
            :disabled="actionLoading[order.id]"
            @click="markReady(order)"
          >
            {{ actionLoading[order.id] ? '處理中...' : '完成備餐 ✓' }}
          </button>
        </div>
      </div>
    </div>

    </div><!-- end 可 scroll 的內容區 -->

    <!-- 底部工具列 -->
    <div
      class="sticky bottom-0 flex items-center justify-between px-6 py-3"
      style="background: #1E1E1E; border-top: 1px solid #333"
    >
      <div class="text-xs" style="color: #555">
        {{ lastCompleted ? `上一筆：桌號 ${lastCompleted.tableNo} #${lastCompleted.orderNo}` : '尚無已完成的備餐' }}
      </div>
      <button
        class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95 disabled:opacity-30"
        style="background: #2A2A2A; color: #BCAAA4; border: 1px solid #444"
        :disabled="!lastCompleted || undoLoading"
        @click="undoLastCompleted"
      >
        <span>↩</span>
        <span>{{ undoLoading ? '復原中...' : '復原上一筆' }}</span>
      </button>
    </div>

  </div>
</template>
