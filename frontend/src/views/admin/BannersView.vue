<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Picture, Plus, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import api from '@/composables/useApi'
import { useNotify } from '@/composables/useNotify'
import type { Banner, BannerPayload } from '@/types/banner'

const notify = useNotify()
const banners = ref<Banner[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const saving = ref(false)
const editingId = ref<number | null>(null)
const uploading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

async function handleFileUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  uploading.value = true
  try {
    const fd = new FormData()
    fd.append('file', file)
    const { data } = await api.post<{ url: string }>('/api/upload', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    form.value.imageUrl = data.url
  } catch {
    notify.error('上傳失敗')
  } finally {
    uploading.value = false
  }
}

const form = ref<BannerPayload>({
  imageUrl: '',
  title: '',
  subtitle: '',
  sortOrder: 0,
  isActive: true,
})

async function fetchBanners() {
  loading.value = true
  try {
    const { data } = await api.get<Banner[]>('/api/banners/all')
    banners.value = data
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingId.value = null
  form.value = {
    imageUrl: '',
    title: '',
    subtitle: '',
    sortOrder: banners.value.length,
    isActive: true,
  }
  dialogVisible.value = true
}

function openEdit(banner: Banner) {
  editingId.value = banner.id
  form.value = {
    imageUrl: banner.imageUrl,
    title: banner.title ?? '',
    subtitle: banner.subtitle ?? '',
    sortOrder: banner.sortOrder,
    isActive: banner.isActive,
  }
  dialogVisible.value = true
}

async function save() {
  if (!form.value.imageUrl.trim()) {
    notify.error('請填寫圖片網址')
    return
  }
  saving.value = true
  try {
    const payload: BannerPayload = {
      imageUrl: form.value.imageUrl.trim(),
      title: form.value.title?.trim() || undefined,
      subtitle: form.value.subtitle?.trim() || undefined,
      sortOrder: form.value.sortOrder,
      isActive: form.value.isActive,
    }
    if (editingId.value !== null) {
      await api.put(`/api/banners/${editingId.value}`, payload)
      notify.success('已更新')
    } else {
      await api.post('/api/banners', payload)
      notify.success('已新增')
    }
    dialogVisible.value = false
    await fetchBanners()
  } catch (e: any) {
    notify.error(e?.response?.data?.message || '操作失敗')
  } finally {
    saving.value = false
  }
}

async function deleteBanner(banner: Banner) {
  await ElMessageBox.confirm(`確定刪除「${banner.title || 'Banner'}」？`, '刪除確認', {
    confirmButtonText: '刪除',
    cancelButtonText: '取消',
    type: 'warning',
  })
  try {
    await api.delete(`/api/banners/${banner.id}`)
    notify.success('已刪除')
    await fetchBanners()
  } catch {
    notify.error('刪除失敗')
  }
}

async function toggleActive(banner: Banner) {
  try {
    await api.put(`/api/banners/${banner.id}`, { isActive: !banner.isActive })
    banner.isActive = !banner.isActive
  } catch {
    notify.error('更新失敗')
  }
}

onMounted(fetchBanners)
</script>

<template>
  <div class="p-6">
    <!-- 頁首 -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-bold" style="color: #5D4037">輪播 Banner 管理</h1>
        <p class="text-sm mt-0.5" style="color: #BCAAA4">最多 4 個，依排序顯示於顧客點餐頁</p>
      </div>
      <el-button
        type="primary"
        :icon="Plus"
        :disabled="banners.length >= 4"
        @click="openCreate"
      >
        新增 Banner
      </el-button>
    </div>

    <!-- Banner 卡片列表 -->
    <div v-loading="loading">
      <div v-if="banners.length === 0" class="flex flex-col items-center justify-center py-20 gap-4" style="color: #BCAAA4">
        <el-icon :size="48"><Picture /></el-icon>
        <p class="text-sm">尚無 Banner，點擊「新增 Banner」開始建立</p>
      </div>

      <div v-else class="grid gap-4" style="grid-template-columns: repeat(auto-fill, minmax(340px, 1fr))">
        <div
          v-for="(banner, i) in banners"
          :key="banner.id"
          class="bg-white rounded-2xl overflow-hidden shadow-sm"
          style="border: 1px solid #ede0d4"
        >
          <!-- 預覽圖 -->
          <div class="relative" style="aspect-ratio: 16/7; background: #f5f5f5">
            <img
              :src="banner.imageUrl"
              :alt="banner.title ?? ''"
              class="w-full h-full object-cover"
              @error="($event.target as HTMLImageElement).style.display = 'none'"
            />
            <!-- 排序標籤 -->
            <div
              class="absolute top-2 left-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style="background: rgba(0,0,0,0.55)"
            >
              {{ i + 1 }}
            </div>
            <!-- 停用遮罩 -->
            <div
              v-if="!banner.isActive"
              class="absolute inset-0 flex items-center justify-center"
              style="background: rgba(0,0,0,0.5)"
            >
              <span class="text-white text-sm font-medium">已停用</span>
            </div>
          </div>

          <!-- 資訊 -->
          <div class="px-4 py-3">
            <div class="flex items-start justify-between gap-2">
              <div class="flex-1 min-w-0">
                <p class="font-semibold truncate" style="color: #5D4037">
                  {{ banner.title || '（無標題）' }}
                </p>
                <p class="text-xs truncate mt-0.5" style="color: #BCAAA4">
                  {{ banner.subtitle || '（無副標題）' }}
                </p>
              </div>
              <el-switch
                :model-value="banner.isActive"
                @change="toggleActive(banner)"
                size="small"
              />
            </div>

            <div class="flex gap-2 mt-3">
              <el-button size="small" :icon="Edit" @click="openEdit(banner)">編輯</el-button>
              <el-button size="small" :icon="Delete" type="danger" plain @click="deleteBanner(banner)">刪除</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增 / 編輯 Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="editingId !== null ? '編輯 Banner' : '新增 Banner'"
      width="500px"
    >
      <el-form label-position="top" @submit.prevent="save">
        <el-form-item label="圖片" required>
          <div class="flex gap-2 w-full">
            <el-input v-model="form.imageUrl" placeholder="貼上圖片網址，或從本機上傳" class="flex-1" />
            <el-button :loading="uploading" @click="fileInput?.click()">上傳圖片</el-button>
            <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFileUpload" />
          </div>
          <!-- 預覽 -->
          <div
            v-if="form.imageUrl"
            class="mt-2 rounded-xl overflow-hidden w-full"
            style="aspect-ratio: 16/7; background: #f5f5f5"
          >
            <img :src="form.imageUrl" class="w-full h-full object-cover" />
          </div>
        </el-form-item>

        <el-form-item label="標題（選填）">
          <el-input v-model="form.title" placeholder="例：週末特惠套餐" />
        </el-form-item>

        <el-form-item label="副標題（選填）">
          <el-input v-model="form.subtitle" placeholder="例：每週六日限定，享 8 折優惠" />
        </el-form-item>

        <div class="flex gap-6">
          <el-form-item label="排序">
            <el-input-number v-model="form.sortOrder" :min="0" :max="99" />
          </el-form-item>
          <el-form-item label="狀態">
            <el-switch v-model="form.isActive" active-text="啟用" inactive-text="停用" />
          </el-form-item>
        </div>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="save">
          {{ editingId !== null ? '儲存' : '新增' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>
