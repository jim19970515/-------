<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import api from '@/composables/useApi'
import { useNotify } from '@/composables/useNotify'
import { useSocket } from '@/composables/useSocket'
import type { Order, OrderStatus } from '@/types/order'

const notify = useNotify()
const orders = ref<Order[]>([])

const statusLabel: Record<OrderStatus, string> = {
  PENDING: '待處理',
  PREPARING: '準備中',
  READY: '可取餐',
  PAID: '已結帳',
}

const statusType: Record<OrderStatus, string> = {
  PENDING: 'warning',
  PREPARING: 'primary',
  READY: 'success',
  PAID: 'info',
}

const nextStatus: Record<OrderStatus, OrderStatus | null> = {
  PENDING: 'PREPARING',
  PREPARING: 'READY',
  READY: 'PAID',
  PAID: null,
}

async function fetchOrders() {
  const { data } = await api.get<Order[]>('/api/orders')
  orders.value = data
}

function getStatusLabel(status: string) {
  return statusLabel[status as OrderStatus] ?? status
}

function getStatusType(status: string) {
  return statusType[status as OrderStatus] ?? 'info'
}

function getNextStatus(status: string) {
  return nextStatus[status as OrderStatus] ?? null
}

async function advanceStatus(order: Order) {
  const next = nextStatus[order.status]
  if (!next) return
  try {
    await api.patch(`/api/orders/${order.id}/status`, { status: next })
    notify.success(`訂單已更新為「${statusLabel[next]}」`)
    fetchOrders()
  } catch {
    notify.error('更新失敗')
  }
}

const socket = useSocket()

// 即時推送：有新訂單或狀態更新時立刻 fetch
socket.on('order:new', fetchOrders)
socket.on('order:updated', fetchOrders)

// Polling fallback：60 秒一次，防 WebSocket 斷線漏掉
const pollTimer = setInterval(fetchOrders, 60000)

onMounted(fetchOrders)
onUnmounted(() => {
  socket.off('order:new', fetchOrders)
  socket.off('order:updated', fetchOrders)
  clearInterval(pollTimer)
})
</script>

<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-semibold">訂單管理</h1>
      <el-button @click="fetchOrders">重新整理</el-button>
    </div>

    <el-table :data="orders" border>
      <el-table-column label="訂單編號" width="120">
        <template #default="{ row }">#{{ row.orderNo }}</template>
      </el-table-column>
      <el-table-column prop="tableNo" label="桌號" width="80" />
      <el-table-column label="品項">
        <template #default="{ row }">
          <div v-for="item in row.items" :key="item.id" class="text-sm">
            {{ item.menuItem.name }} × {{ item.quantity }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="總金額" width="120">
        <template #default="{ row }">NT$ {{ parseFloat(row.totalPrice) }}</template>
      </el-table-column>
      <el-table-column label="狀態" width="110">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">
            {{ getStatusLabel(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="建立時間" width="180">
        <template #default="{ row }">
          {{ new Date(row.createdAt).toLocaleString('zh-TW') }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-button
            v-if="getNextStatus(row.status)"
            size="small"
            type="primary"
            @click="advanceStatus(row)"
          >
            {{ getStatusLabel(getNextStatus(row.status) || '') }}
          </el-button>
          <span v-else class="text-gray-400 text-sm">完成</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
