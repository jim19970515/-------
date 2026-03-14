<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/composables/useApi'
import { useNotify } from '@/composables/useNotify'

const router = useRouter()
const auth = useAuthStore()

const notify = useNotify()
const reLoginForm = ref({ email: '', password: '' })
const reLoginLoading = ref(false)

function logout() {
  auth.logout()
  router.push('/admin/login')
}

async function handleReLogin() {
  if (!reLoginForm.value.email.trim() || !reLoginForm.value.password.trim()) {
    notify.warning('請填寫帳號與密碼')
    return
  }
  reLoginLoading.value = true
  try {
    const { data } = await api.post('/api/auth/login', reLoginForm.value)
    auth.setAuth(data.token, data.role)
    reLoginForm.value = { email: '', password: '' }
    notify.success('重新登入成功')
  } catch {
    notify.error('帳號或密碼錯誤')
  } finally {
    reLoginLoading.value = false
  }
}
</script>

<template>
  <el-container style="height: 100vh">
    <el-aside width="220px" style="background: #4E342E">
      <!-- 品牌區 -->
      <div class="px-5 py-5" style="border-bottom: 1px solid rgba(255,255,255,0.1)">
        <div class="flex items-center gap-3">
          <img src="@/assets/logo.png" alt="logo" class="h-10 w-10 rounded-full object-cover" />
          <div>
            <div class="font-bold text-sm leading-tight" style="color: #FFCCBC">心心精緻早午餐</div>
            <div class="text-xs mt-0.5" style="color: #A1887F">後台管理系統</div>
          </div>
        </div>
      </div>

      <el-menu
        router
        background-color="#4E342E"
        text-color="#D7CCC8"
        active-text-color="#F57C00"
        :default-active="$route.path"
      >
        <el-menu-item index="/admin/orders">
          <el-icon><List /></el-icon>
          <span>訂單管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/menu">
          <el-icon><Menu /></el-icon>
          <span>菜單管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/reports">
          <el-icon><DataAnalysis /></el-icon>
          <span>今日報表</span>
        </el-menu-item>
        <el-menu-item index="/admin/banners">
          <el-icon><Picture /></el-icon>
          <span>輪播 Banner</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header style="background: #fff; border-bottom: 1px solid #ede0d4; display: flex; align-items: center; justify-content: flex-end">
        <el-button text @click="logout" style="color: #8D6E63">登出</el-button>
      </el-header>
      <el-main style="background: #fdf6f0; padding: 0">
        <RouterView />
      </el-main>
    </el-container>
  </el-container>

  <!-- 登入過期彈窗 -->
  <el-dialog
    :model-value="auth.sessionExpired"
    title="登入已過期"
    width="380px"
    :close-on-click-modal="false"
    :show-close="false"
    :modal-class="'backdrop-blur'"
  >
    <p class="text-gray-500 mb-4 text-sm">請重新輸入帳號密碼以繼續操作</p>
    <el-form label-position="top">
      <el-form-item label="Email">
        <el-input v-model="reLoginForm.email" type="email" />
      </el-form-item>
      <el-form-item label="密碼">
        <el-input v-model="reLoginForm.password" type="password" show-password />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="router.push('/admin/login')">返回登入頁</el-button>
      <el-button type="primary" :loading="reLoginLoading" @click="handleReLogin">
        重新登入
      </el-button>
    </template>
  </el-dialog>
</template>

<style>
.backdrop-blur {
  backdrop-filter: blur(4px);
}
</style>
