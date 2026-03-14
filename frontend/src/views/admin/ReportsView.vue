<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/composables/useApi'
import { useNotify } from '@/composables/useNotify'

interface PopularItem {
  name: string
  quantity: number
}

interface TodayReport {
  totalRevenue: number
  orderCount: number
  popularItems: PopularItem[]
}

const notify = useNotify()
const report = ref<TodayReport | null>(null)
const loading = ref(false)

async function fetchReport() {
  loading.value = true
  try {
    const { data } = await api.get<TodayReport>('/api/reports/today')
    report.value = data
  } catch {
    notify.error('報表載入失敗')
  } finally {
    loading.value = false
  }
}

onMounted(fetchReport)
</script>

<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-semibold">今日報表</h1>
      <el-button @click="fetchReport" :loading="loading">重新整理</el-button>
    </div>

    <div v-if="report" class="space-y-6">
      <!-- 統計卡片 -->
      <div class="grid grid-cols-2 gap-4" style="max-width: 600px">
        <el-card shadow="never">
          <div class="text-sm text-gray-500 mb-1">今日營收</div>
          <div class="text-3xl font-bold text-primary">
            NT$ {{ report.totalRevenue.toLocaleString() }}
          </div>
        </el-card>
        <el-card shadow="never">
          <div class="text-sm text-gray-500 mb-1">已結帳訂單</div>
          <div class="text-3xl font-bold text-primary">
            {{ report.orderCount }} 筆
          </div>
        </el-card>
      </div>

      <!-- 熱門品項 -->
      <el-card shadow="never" style="max-width: 600px">
        <template #header>
          <span class="font-medium">熱門品項 Top 5</span>
        </template>
        <div v-if="report.popularItems.length === 0" class="text-gray-400 text-sm">
          今日尚無銷售紀錄
        </div>
        <div
          v-for="(item, index) in report.popularItems"
          :key="item.name"
          class="flex justify-between items-center py-2 border-b last:border-0"
        >
          <div class="flex items-center gap-3">
            <span
              class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
              :style="{ background: index === 0 ? '#f59e0b' : index === 1 ? '#9ca3af' : index === 2 ? '#b45309' : '#d1d5db' }"
            >
              {{ index + 1 }}
            </span>
            <span>{{ item.name }}</span>
          </div>
          <span class="text-gray-600">{{ item.quantity }} 份</span>
        </div>
      </el-card>
    </div>

    <div v-else-if="loading" class="text-gray-400">載入中...</div>
  </div>
</template>
