<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/composables/useApi'
import { useAuthStore } from '@/stores/auth'
import { useNotify } from '@/composables/useNotify'
import type { LoginResponse } from '@/types/auth'

const router = useRouter()
const auth = useAuthStore()
const notify = useNotify()

const form = reactive({ email: '', password: '' })
const loading = ref(false)

async function handleLogin() {
  if (!form.email.trim() || !form.password.trim()) {
    notify.warning('請填寫帳號與密碼')
    return
  }
  loading.value = true
  try {
    const { data } = await api.post<LoginResponse>('/api/auth/login', form)
    auth.setAuth(data.token, data.role)
    router.push('/admin/orders')
  } catch {
    notify.error('帳號或密碼錯誤')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center"
    style="background: linear-gradient(135deg, #f5ede4 0%, #ecddd0 100%)"
  >
    <div class="w-full max-w-sm">
      <!-- 品牌 header -->
      <div class="text-center mb-8">
        <img src="@/assets/logo.png" alt="心心精緻早午餐" class="h-20 w-auto mx-auto mb-3" />
        <h1 class="text-2xl font-bold" style="color: #5D4037">心心精緻早午餐</h1>
        <p class="text-sm mt-1" style="color: #A1887F">後台管理系統</p>
      </div>

      <!-- 登入卡片 -->
      <div class="bg-white rounded-2xl shadow-sm p-8">
        <h2 class="text-base font-semibold mb-6" style="color: #5D4037">員工登入</h2>
        <el-form @submit.prevent="handleLogin" label-position="top">
          <el-form-item label="Email">
            <el-input
              v-model="form.email"
              type="email"
              placeholder="admin@brunch.com"
              size="large"
            />
          </el-form-item>
          <el-form-item label="密碼">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="••••••••"
              show-password
              size="large"
            />
          </el-form-item>
          <el-button
            native-type="submit"
            class="w-full mt-2"
            size="large"
            :loading="loading"
            type="primary"
          >
            登入
          </el-button>
        </el-form>
      </div>
    </div>
  </div>
</template>
