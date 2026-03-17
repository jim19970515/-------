<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/composables/useApi'
import type { Table } from '@/types/table'

const router = useRouter()
const tables = ref<Table[]>([])

onMounted(async () => {
  const { data } = await api.get<Table[]>('/api/tables')
  tables.value = data
})
</script>

<template>
  <div class="min-h-screen bg-linear-to-b from-amber-50 to-orange-50 flex flex-col items-center justify-center px-6 py-12">

    <!-- Logo + 標題 -->
    <div class="text-center mb-10">
      <img src="@/assets/logo.png" alt="logo" class="h-20 w-20 rounded-full object-cover mx-auto shadow-md mb-4" />
      <h1 class="text-3xl font-bold text-amber-800">心心精緻早午餐</h1>
    </div>

    <!-- 桌號選擇 -->
    <div class="w-full max-w-sm bg-white rounded-3xl shadow-sm p-6">
      <div class="flex items-center gap-2 mb-4">
        <span class="text-2xl">🍽</span>
        <h2 class="font-bold text-gray-700 text-lg">請選擇桌號</h2>
      </div>

      <div v-if="tables.length === 0" class="text-center text-gray-400 py-6 text-sm">
        尚未設定桌號，請聯繫店家
      </div>

      <div v-else class="grid grid-cols-3 gap-3">
        <button
          v-for="table in tables"
          :key="table.id"
          class="aspect-square flex items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-800 font-bold text-lg hover:bg-amber-400 hover:text-white hover:border-amber-400 active:bg-amber-500 transition-all"
          @click="router.push(`/customer/${table.label}`)"
        >
          {{ table.label }}
        </button>
      </div>
    </div>

  </div>
</template>
