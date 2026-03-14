<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const tableNo = ref('')
const error = ref('')

function goOrder() {
  const val = tableNo.value.trim()
  if (!val) {
    error.value = '請輸入桌號'
    return
  }
  router.push(`/customer/${val}`)
}
</script>

<template>
  <div class="min-h-screen bg-linear-to-b from-amber-50 to-orange-50 flex flex-col items-center justify-center px-6 py-12">

    <!-- Logo + 標題 -->
    <div class="text-center mb-10">
      <img src="@/assets/logo.png" alt="logo" class="h-20 w-20 rounded-full object-cover mx-auto shadow-md mb-4" />
      <h1 class="text-3xl font-bold text-amber-800">心心精緻早午餐</h1>
      <p class="text-amber-500 mt-1 text-sm">請選擇使用身份</p>
    </div>

    <!-- 顧客點餐 -->
    <div class="w-full max-w-sm bg-white rounded-3xl shadow-sm p-6 mb-6">
      <div class="flex items-center gap-2 mb-4">
        <span class="text-2xl">🍽</span>
        <h2 class="font-bold text-gray-700 text-lg">顧客點餐</h2>
      </div>
      <input
        v-model="tableNo"
        placeholder="輸入桌號（例如 A1）"
        class="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-700 outline-none focus:border-amber-400 mb-2"
        @keydown.enter="goOrder"
      />
      <p v-if="error" class="text-red-400 text-sm mb-2">{{ error }}</p>
      <button
        class="w-full bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white rounded-xl py-3 font-semibold transition-colors"
        @click="goOrder"
      >
        開始點餐
      </button>
    </div>

    <!-- 店員區塊 -->
    <div class="w-full max-w-sm">
      <p class="text-xs text-gray-400 text-center mb-3">店員 / 廚房專區</p>
      <div class="grid grid-cols-2 gap-3">
        <button
          class="flex flex-col items-center gap-2 bg-white border border-gray-100 rounded-2xl py-5 shadow-sm hover:shadow-md hover:border-amber-200 transition-all"
          @click="router.push('/admin/orders')"
        >
          <span class="text-2xl">🖥</span>
          <span class="text-sm font-medium text-gray-600">後台管理</span>
        </button>
        <button
          class="flex flex-col items-center gap-2 bg-white border border-gray-100 rounded-2xl py-5 shadow-sm hover:shadow-md hover:border-amber-200 transition-all"
          @click="router.push('/pos')"
        >
          <span class="text-2xl">💳</span>
          <span class="text-sm font-medium text-gray-600">POS 結帳</span>
        </button>
        <button
          class="col-span-2 flex items-center justify-center gap-2 bg-white border border-gray-100 rounded-2xl py-4 shadow-sm hover:shadow-md hover:border-amber-200 transition-all"
          @click="router.push('/kds')"
        >
          <span class="text-2xl">👨‍🍳</span>
          <span class="text-sm font-medium text-gray-600">廚房出餐系統（KDS）</span>
        </button>
      </div>
    </div>

  </div>
</template>
