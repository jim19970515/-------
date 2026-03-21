<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessageBox } from 'element-plus'
import api from '@/composables/useApi'
import { useNotify } from '@/composables/useNotify'
import type { Category, MenuItem, MenuItemPayload } from '@/types/menu'

const notify = useNotify()
const categories = ref<Category[]>([])
const dialogVisible = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)

const form = ref<MenuItemPayload>({
  name: '',
  price: 0,
  description: '',
  categoryId: 0,
  isAvailable: true,
})

async function fetchMenu() {
  const { data } = await api.get<Category[]>('/api/menu/all')
  categories.value = data
}

function openCreate() {
  isEditing.value = false
  editingId.value = null
  form.value = { name: '', price: 0, description: '', categoryId: categories.value[0]?.id ?? 0, isAvailable: true }
  dialogVisible.value = true
}

function openEdit(item: MenuItem) {
  isEditing.value = true
  editingId.value = item.id
  form.value = {
    name: item.name,
    price: parseFloat(item.price),
    description: item.description ?? '',
    categoryId: item.categoryId,
    isAvailable: item.isAvailable,
  }
  dialogVisible.value = true
}

async function handleSubmit() {
  try {
    if (isEditing.value && editingId.value) {
      await api.put(`/api/menu/items/${editingId.value}`, form.value)
      notify.success('修改成功')
    } else {
      await api.post('/api/menu/items', form.value)
      notify.success('新增成功')
    }
    dialogVisible.value = false
    fetchMenu()
  } catch {
    notify.error('操作失敗')
  }
}

async function handleAddCategory() {
  try {
    const { value: name } = await ElMessageBox.prompt('輸入分類名稱', '新增分類', {
      confirmButtonText: '新增',
      cancelButtonText: '取消',
      inputValidator: (v) => !!v.trim() || '名稱不能為空',
    })
    await api.post('/api/menu/categories', { name: name.trim() })
    notify.success(`分類「${name.trim()}」已新增`)
    fetchMenu()
  } catch {
    // 取消不處理
  }
}

async function handleToggleAvailable(item: MenuItem) {
  try {
    await api.put(`/api/menu/items/${item.id}`, { ...item, price: parseFloat(item.price), isAvailable: !item.isAvailable })
    fetchMenu()
  } catch {
    notify.error('操作失敗')
  }
}

async function handleDelete(id: number) {
  await ElMessageBox.confirm('確定要刪除這個品項嗎？', '確認刪除', { type: 'warning' })
  try {
    await api.delete(`/api/menu/items/${id}`)
    notify.success('刪除成功')
    fetchMenu()
  } catch {
    notify.error('刪除失敗')
  }
}

onMounted(fetchMenu)
</script>

<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-semibold">菜單管理</h1>
      <div class="flex gap-2">
        <el-button @click="handleAddCategory">+ 新增分類</el-button>
        <el-button type="primary" @click="openCreate">+ 新增品項</el-button>
      </div>
    </div>

    <div v-for="category in categories" :key="category.id" class="mb-8">
      <h2 class="text-lg font-medium mb-3 text-gray-600">{{ category.name }}</h2>
      <el-table :data="category.items" border>
        <el-table-column prop="name" label="品項名稱" />
        <el-table-column label="價格">
          <template #default="{ row }">NT$ {{ parseFloat(row.price) }}</template>
        </el-table-column>
        <el-table-column prop="description" label="描述" />
        <el-table-column label="供應中">
          <template #default="{ row }">
            <el-tag :type="row.isAvailable ? 'success' : 'info'">
              {{ row.isAvailable ? '供應中' : '已下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220">
          <template #default="{ row }">
            <el-button size="small" @click="openEdit(row)">編輯</el-button>
            <el-button size="small" :type="row.isAvailable ? 'warning' : 'success'" @click="handleToggleAvailable(row)">
              {{ row.isAvailable ? '下架' : '上架' }}
            </el-button>
            <el-button size="small" type="danger" @click="handleDelete(row.id)">刪除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="dialogVisible" :title="isEditing ? '編輯品項' : '新增品項'" width="500px">
      <el-form :model="form" label-position="top">
        <el-form-item label="品項名稱">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="價格">
          <el-input-number v-model="form.price" :min="0" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="分類">
          <el-select v-model="form.categoryId">
            <el-option
              v-for="cat in categories"
              :key="cat.id"
              :label="cat.name"
              :value="cat.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="狀態">
          <el-switch v-model="form.isAvailable" active-text="供應中" inactive-text="下架" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">確認</el-button>
      </template>
    </el-dialog>
  </div>
</template>
