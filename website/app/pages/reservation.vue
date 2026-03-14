<script setup lang="ts">
useSeoMeta({
  title: '線上預訂 — 心心精緻早午餐',
  description: '線上預訂心心精緻早午餐座位，假日或特殊時段提前預約，省去等候時間。',
  ogTitle: '線上預訂 — 心心精緻早午餐',
})

const { trackClick } = useGtm()

interface Form {
  name: string
  phone: string
  date: string
  time: string
  party: number
  notes: string
}

const form = reactive<Form>({
  name: '',
  phone: '',
  date: '',
  time: '',
  party: 2,
  notes: '',
})

const errors = reactive<Partial<Record<keyof Form, string>>>({})
const submitted = ref(false)
const submitting = ref(false)

const timeSlots = [
  '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30',
]

const minDate = computed(() => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
})

function validate() {
  Object.keys(errors).forEach((k) => delete errors[k as keyof Form])
  if (!form.name.trim()) errors.name = '請填寫姓名'
  if (!form.phone.match(/^09\d{8}$/)) errors.phone = '請填寫正確手機號碼（09 開頭 10 碼）'
  if (!form.date) errors.date = '請選擇日期'
  if (!form.time) errors.time = '請選擇時段'
  if (form.party < 1 || form.party > 20) errors.party = '人數範圍 1–20 人'
  return Object.keys(errors).length === 0
}

async function submit() {
  if (!validate()) return
  submitting.value = true
  trackClick('reservation_submit', '送出預訂')
  try {
    // TODO: 串接後端 POST /api/reservations
    await new Promise((r) => setTimeout(r, 800))
    submitted.value = true
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="max-w-lg mx-auto px-4 py-12">
    <div class="text-center mb-10">
      <h1 class="text-3xl font-bold text-amber-800 mb-2">線上預訂</h1>
      <p class="text-gray-500 text-sm">提前預訂，享有優先入座服務</p>
    </div>

    <!-- 送出成功 -->
    <div v-if="submitted" class="text-center bg-white rounded-3xl shadow-sm p-10">
      <div class="text-5xl mb-4">🎉</div>
      <h2 class="text-xl font-bold text-amber-800 mb-2">預訂成功！</h2>
      <p class="text-gray-500 text-sm mb-6">
        我們已收到您的預訂，將於 24 小時內以簡訊確認。<br>如有變動請致電 02-1234-5678。
      </p>
      <button
        class="bg-amber-500 text-white px-8 py-3 rounded-full font-semibold"
        @click="submitted = false; Object.assign(form, { name: '', phone: '', date: '', time: '', party: 2, notes: '' })"
      >
        再次預訂
      </button>
    </div>

    <!-- 表單 -->
    <form v-else class="bg-white rounded-3xl shadow-sm p-6 space-y-5" @submit.prevent="submit">
      <!-- 姓名 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">姓名 *</label>
        <input
          v-model="form.name"
          type="text"
          placeholder="您的稱呼"
          class="w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors"
          :class="errors.name ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-amber-400'"
        />
        <p v-if="errors.name" class="text-red-400 text-xs mt-1">{{ errors.name }}</p>
      </div>

      <!-- 電話 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">手機號碼 *</label>
        <input
          v-model="form.phone"
          type="tel"
          placeholder="0912345678"
          class="w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors"
          :class="errors.phone ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-amber-400'"
        />
        <p v-if="errors.phone" class="text-red-400 text-xs mt-1">{{ errors.phone }}</p>
      </div>

      <!-- 日期 + 時段 -->
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">日期 *</label>
          <input
            v-model="form.date"
            type="date"
            :min="minDate"
            class="w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors"
            :class="errors.date ? 'border-red-300' : 'border-gray-200 focus:border-amber-400'"
          />
          <p v-if="errors.date" class="text-red-400 text-xs mt-1">{{ errors.date }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">時段 *</label>
          <select
            v-model="form.time"
            class="w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors bg-white"
            :class="errors.time ? 'border-red-300' : 'border-gray-200 focus:border-amber-400'"
          >
            <option value="" disabled>選擇時段</option>
            <option v-for="t in timeSlots" :key="t" :value="t">{{ t }}</option>
          </select>
          <p v-if="errors.time" class="text-red-400 text-xs mt-1">{{ errors.time }}</p>
        </div>
      </div>

      <!-- 人數 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">用餐人數 *</label>
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="w-10 h-10 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center"
            @click="form.party > 1 && form.party--"
          >−</button>
          <span class="text-lg font-semibold w-8 text-center">{{ form.party }}</span>
          <button
            type="button"
            class="w-10 h-10 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center"
            @click="form.party < 20 && form.party++"
          >+</button>
          <span class="text-sm text-gray-400">人</span>
        </div>
        <p v-if="errors.party" class="text-red-400 text-xs mt-1">{{ errors.party }}</p>
      </div>

      <!-- 備註 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">特殊需求（選填）</label>
        <textarea
          v-model="form.notes"
          rows="3"
          placeholder="過敏原、慶生需求、嬰兒椅等..."
          class="w-full border border-gray-200 focus:border-amber-400 rounded-xl px-4 py-3 text-sm outline-none transition-colors resize-none"
        />
      </div>

      <button
        type="submit"
        :disabled="submitting"
        class="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold py-3 rounded-full transition-colors"
      >
        {{ submitting ? '送出中...' : '確認預訂' }}
      </button>

      <p class="text-xs text-gray-400 text-center">
        預訂後我們將於 24 小時內簡訊確認，如需取消請提前 2 小時告知。
      </p>
    </form>
  </div>
</template>
