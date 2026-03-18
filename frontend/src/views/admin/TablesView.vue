<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessageBox } from 'element-plus'
import api from '@/composables/useApi'
import { useNotify } from '@/composables/useNotify'
import type { Table } from '@/types/table'

const notify = useNotify()
const tables = ref<Table[]>([])
const adding = ref(false)
const deleting = ref(false)

async function fetchTables() {
  const { data } = await api.get<Table[]>('/api/tables/all')
  tables.value = data
}

// 計算下一個桌號：取最後一筆的前綴 + 數字 +1，無資料則從 A1 開始
const nextLabel = computed(() => {
  if (tables.value.length === 0) return 'A1'
  const last = tables.value[tables.value.length - 1]!.label
  const match = last.match(/^([A-Za-z]*)(\d+)$/)
  if (!match) return `${last}1`
  return `${match[1]}${Number(match[2]) + 1}`
})

const lastTable = computed(() => tables.value[tables.value.length - 1] ?? null)

async function confirmAdd() {
  try {
    await ElMessageBox.confirm(
      `確定新增桌號 ${nextLabel.value}？`,
      '新增桌號',
      { confirmButtonText: '新增', cancelButtonText: '取消', type: 'info' }
    )
  } catch {
    return
  }
  adding.value = true
  try {
    await api.post('/api/tables', { label: nextLabel.value })
    notify.success(`桌號 ${nextLabel.value} 已新增`)
    await fetchTables()
  } catch {
    notify.error('新增失敗')
  } finally {
    adding.value = false
  }
}

async function confirmDeleteLast() {
  if (!lastTable.value) return
  try {
    await ElMessageBox.confirm(
      `確定刪除最後一筆桌號 ${lastTable.value.label}？`,
      '刪除桌號',
      { confirmButtonText: '刪除', cancelButtonText: '取消', type: 'warning' }
    )
  } catch {
    return
  }
  deleting.value = true
  try {
    await api.delete(`/api/tables/${lastTable.value.id}`)
    notify.success(`桌號 ${lastTable.value.label} 已刪除`)
    await fetchTables()
  } catch {
    notify.error('刪除失敗')
  } finally {
    deleting.value = false
  }
}

async function toggleActive(table: Table) {
  await api.put(`/api/tables/${table.id}`, { isActive: !table.isActive })
  await fetchTables()
}

onMounted(fetchTables)
</script>

<template>
  <div class="p-6">
    <h2 class="text-xl font-bold text-gray-700 mb-6">桌號管理</h2>

    <!-- 操作列 -->
    <el-card class="mb-6">
      <div class="flex gap-3 items-center">
        <el-button type="primary" :loading="adding" @click="confirmAdd">
          新增桌號（{{ nextLabel }}）
        </el-button>
        <el-button
          type="danger"
          :loading="deleting"
          :disabled="!lastTable"
          @click="confirmDeleteLast"
        >
          刪除最後一筆（{{ lastTable?.label ?? '—' }}）
        </el-button>
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
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>
