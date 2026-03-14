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
  <div class="min-h-screen bg-amber-50 flex flex-col items-center justify-center px-6 gap-10">
    <!-- 標題 -->
    <div class="text-center">
      <div class="text-6xl mb-4">🍳</div>
      <h1 class="text-3xl font-bold text-amber-700">早午餐</h1>
      <p class="text-amber-500 mt-1">請選擇身份</p>
    </div>

    <!-- 顧客區塊 -->
    <div class="w-full max-w-sm bg-white rounded-3xl shadow-sm p-6 flex flex-col gap-4">
      <h2 class="font-semibold text-gray-700">顧客點餐</h2>
      <input
        v-model="tableNo"
        placeholder="輸入桌號（例如 A1）"
        class="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-700 outline-none focus:border-amber-400"
        @keydown.enter="goOrder"
      />
      <p v-if="error" class="text-red-400 text-sm -mt-2">{{ error }}</p>
      <button
        class="w-full bg-amber-500 text-white rounded-xl py-3 font-semibold"
        @click="goOrder"
      >
        開始點餐
      </button>
    </div>

    <!-- 分隔 -->
    <div class="text-gray-300 text-sm">— 或 —</div>

    <!-- 店員區塊 -->
    <div class="w-full max-w-sm flex flex-col gap-3">
      <button
        class="w-full border border-gray-200 bg-white rounded-xl py-3 text-gray-600 font-medium"
        @click="router.push('/admin/orders')"
      >
        後台管理
      </button>
      <button
        class="w-full border border-gray-200 bg-white rounded-xl py-3 text-gray-600 font-medium"
        @click="router.push('/pos')"
      >
        POS 結帳
      </button>
    </div>
  </div>
</template>
