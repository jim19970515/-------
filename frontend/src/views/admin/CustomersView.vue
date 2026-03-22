<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/composables/useApi'

interface Customer {
  id: number
  name: string
  email: string
  phone: string | null
  avatar: string | null
  createdAt: string
  _count: { orders: number }
}

const customers = ref<Customer[]>([])
const loading = ref(false)

async function fetchCustomers() {
  loading.value = true
  try {
    const { data } = await api.get<Customer[]>('/api/customers')
    customers.value = data
  } finally {
    loading.value = false
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

onMounted(fetchCustomers)
</script>

<template>
  <div class="p-6">
    <h2 class="text-xl font-bold text-gray-700 mb-6">會員管理</h2>

    <el-card>
      <el-table :data="customers" v-loading="loading" style="width: 100%">
        <el-table-column label="頭像" width="70">
          <template #default="{ row }">
            <el-avatar :size="36" :src="row.avatar ?? undefined">
              {{ row.name?.charAt(0) }}
            </el-avatar>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="姓名" min-width="120" />
        <el-table-column prop="email" label="Email" min-width="200" />
        <el-table-column label="手機號碼" width="140">
          <template #default="{ row }">
            <span v-if="row.phone">{{ row.phone }}</span>
            <el-tag v-else type="warning" size="small">未填寫</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="訂單數" width="100" align="center">
          <template #default="{ row }">
            <el-tag type="info">{{ row._count.orders }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="註冊日期" width="130">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
      </el-table>

      <div v-if="!loading && customers.length === 0" class="text-center text-gray-400 py-12">
        尚無會員資料
      </div>
    </el-card>
  </div>
</template>
