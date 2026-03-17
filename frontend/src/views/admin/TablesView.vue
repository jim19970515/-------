<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/composables/useApi'
import { useNotify } from '@/composables/useNotify'
import type { Table } from '@/types/table'

const notify = useNotify()
const tables = ref<Table[]>([])
const newLabel = ref('')
const adding = ref(false)

async function fetchTables() {
  const { data } = await api.get<Table[]>('/api/tables/all')
  tables.value = data
}

async function addTable() {
  const label = newLabel.value.trim()
  if (!label) return
  adding.value = true
  try {
    await api.post('/api/tables', { label })
    newLabel.value = ''
    notify.success(`桌號 ${label} 已新增`)
    await fetchTables()
  } catch {
    notify.error('桌號已存在或新增失敗')
  } finally {
    adding.value = false
  }
}

async function toggleActive(table: Table) {
  await api.put(`/api/tables/${table.id}`, { isActive: !table.isActive })
  await fetchTables()
}

async function deleteTable(table: Table) {
  await api.delete(`/api/tables/${table.id}`)
  notify.success(`桌號 ${table.label} 已刪除`)
  await fetchTables()
}

onMounted(fetchTables)
</script>

<template>
  <div class="p-6">
    <h2 class="text-xl font-bold text-gray-700 mb-6">桌號管理</h2>

    <!-- 新增桌號 -->
    <el-card class="mb-6">
      <div class="flex gap-3 items-center">
        <el-input
          v-model="newLabel"
          placeholder="輸入桌號（例如 A1）"
          style="max-width: 200px"
          @keydown.enter="addTable"
        />
        <el-button type="primary" :loading="adding" @click="addTable">新增桌號</el-button>
      </div>
    </el-card>

    <!-- 桌號列表 -->
    <el-card>
      <el-table :data="tables" style="width: 100%">
        <el-table-column prop="label" label="桌號" width="120" />
        <el-table-column label="狀態" width="120">
          <template #default="{ row }">
            <el-tag :type="row.isActive ? 'success' : 'info'">
              {{ row.isActive ? '啟用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="{ row }">
            <el-button size="small" @click="toggleActive(row)">
              {{ row.isActive ? '停用' : '啟用' }}
            </el-button>
            <el-popconfirm
              title="確定刪除此桌號？"
              confirm-button-text="刪除"
              cancel-button-text="取消"
              @confirm="deleteTable(row)"
            >
              <template #reference>
                <el-button size="small" type="danger">刪除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>
