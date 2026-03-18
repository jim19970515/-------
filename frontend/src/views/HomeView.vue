<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/composables/useApi'
import type { Table } from '@/types/table'

const router = useRouter()
const tables = ref<Table[]>([])
const showTypeModal = ref(true)
const selectedType = ref<'dine-in' | 'takeout' | null>(null)

function chooseType(type: 'dine-in' | 'takeout') {
  selectedType.value = type
  showTypeModal.value = false
  if (type === 'takeout') {
    router.push('/customer/外帶')
  }
}

onMounted(async () => {
  const { data } = await api.get<Table[]>('/api/tables')
  tables.value = data
})
</script>

<template>
  <div class="min-h-screen flex flex-col" style="background: #FFF8F0">

    <!-- 內用/外帶 選擇彈窗 -->
    <Transition name="slide-up">
      <div
        v-if="showTypeModal"
        class="fixed inset-0 z-50 flex items-end justify-center"
        style="background: rgba(30,20,10,0.5); backdrop-filter: blur(6px)"
      >
        <div class="w-full max-w-sm rounded-3xl px-6 pt-5 pb-16 mb-6" style="background: #FFFDF9">
          <!-- 拖曳條 -->
          <div class="w-8 h-1 rounded-full mx-auto mb-7" style="background: #DDD"></div>

          <!-- 標題 -->
          <div class="text-center mb-8">
            <p class="text-xs tracking-widest mb-1" style="color: #BCAAA4">WELCOME</p>
            <h2 class="text-xl font-bold" style="color: #3E2723">今天怎麼用餐？</h2>
          </div>

          <!-- 兩個選項 -->
          <div class="grid grid-cols-2 gap-3 mb-4">
            <!-- 內用 -->
            <button
              class="flex flex-col items-center justify-center rounded-3xl py-8 transition-all active:scale-95"
              style="background: linear-gradient(160deg, #FF9800, #E65100); box-shadow: 0 6px 20px rgba(230,81,0,0.3)"
              @click="chooseType('dine-in')"
            >
              <span class="text-white font-bold text-lg">內用</span>
              <span class="text-xs mt-1" style="color: rgba(255,255,255,0.7)">選擇桌號</span>
            </button>

            <!-- 外帶 -->
            <button
              class="flex flex-col items-center justify-center rounded-3xl py-8 transition-all active:scale-95"
              style="background: white; border: 1.5px solid #FFE0B2; box-shadow: 0 4px 16px rgba(0,0,0,0.06)"
              @click="chooseType('takeout')"
            >
              <span class="font-bold text-lg" style="color: #E65100">外帶</span>
              <span class="text-xs mt-1" style="color: #BCAAA4">帶走</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Hero 區 -->
    <div class="flex flex-col items-center pt-14 pb-10 px-6" style="background: linear-gradient(160deg, #FF8C00 0%, #E65100 100%)">
      <img
        src="@/assets/logo.png"
        alt="logo"
        class="h-28 w-28 rounded-full object-cover shadow-xl mb-5"
        style="border: 4px solid rgba(255,255,255,0.4)"
      />
      <h1 class="text-3xl font-bold text-white tracking-wide mb-1">心心精緻早午餐</h1>
      <p class="text-orange-100 text-sm">請選擇您的桌號開始點餐</p>
    </div>

    <!-- 波浪分隔 -->
    <svg viewBox="0 0 1440 60" class="w-full -mt-px" style="display:block" xmlns="http://www.w3.org/2000/svg">
      <path d="M0,30 C360,60 1080,0 1440,30 L1440,0 L0,0 Z" fill="#E65100" />
      <path d="M0,40 C360,70 1080,10 1440,40 L1440,0 L0,0 Z" fill="#FFF8F0" />
    </svg>

    <!-- 桌號區（內用才顯示） -->
    <div v-if="selectedType === 'dine-in'" class="flex-1 px-5 pb-10 pt-8">
      <div v-if="tables.length === 0" class="flex flex-col items-center justify-center py-20 text-gray-400">
        <span class="text-5xl mb-4">🍽</span>
        <p class="text-sm">尚未設定桌號，請聯繫店家</p>
      </div>
      <template v-else>
        <p class="text-center text-xs font-medium tracking-widest mb-5" style="color: #BDBDBD">TAP TO START</p>
        <div class="grid grid-cols-3 gap-3 max-w-sm mx-auto">
          <button
            v-for="table in tables"
            :key="table.id"
            class="relative flex flex-col items-center justify-center rounded-3xl py-6 transition-all active:scale-95 overflow-hidden"
            style="background: linear-gradient(145deg, #FF9800, #E65100); box-shadow: 0 4px 15px rgba(230,81,0,0.25)"
            @click="router.push(`/customer/${table.label}`)"
          >
            <span class="text-xs font-medium mb-1" style="color: rgba(255,255,255,0.7)">桌號</span>
            <span class="text-2xl font-black text-white tracking-wide">{{ table.label }}</span>
            <div class="absolute -bottom-4 -right-4 w-14 h-14 rounded-full" style="background: rgba(255,255,255,0.1)"></div>
          </button>
        </div>
      </template>
    </div>

  </div>
</template>

<style scoped>
.slide-up-enter-active { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.slide-up-leave-active { transition: all 0.2s ease; }
.slide-up-enter-from { opacity: 0; transform: translateY(60px); }
.slide-up-leave-to { opacity: 0; transform: translateY(60px); }
</style>
