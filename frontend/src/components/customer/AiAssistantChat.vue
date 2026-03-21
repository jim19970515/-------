<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import { useAiAssistant } from '@/composables/useAiAssistant'
import type { SuggestedItem } from '@/composables/useAiAssistant'

const emit = defineEmits<{
  addItems: [items: SuggestedItem[]]
  close: []
}>()

const { messages, loading, sendMessage } = useAiAssistant()
const inputText = ref('')
const messagesEl = ref<HTMLElement | null>(null)

async function handleSend() {
  const text = inputText.value.trim()
  if (!text) return
  inputText.value = ''
  await sendMessage(text)
}

function handleAddItems(items: SuggestedItem[]) {
  emit('addItems', items)
}

watch(
  messages,
  async () => {
    await nextTick()
    if (messagesEl.value) {
      messagesEl.value.scrollTop = messagesEl.value.scrollHeight
    }
  },
  { deep: true },
)
</script>

<template>
  <div class="fixed inset-0 z-40 flex flex-col" style="background: white">
    <!-- Header -->
    <div class="flex items-center justify-between px-5 py-4" style="border-bottom: 1px solid #F0EBE6">
      <div class="flex items-center gap-2">
        <span class="text-xl">🤖</span>
        <div>
          <h2 class="text-base font-bold leading-tight" style="color: #3E2723">點餐小幫手</h2>
          <p class="text-xs" style="color: #BCAAA4">告訴我你想吃什麼</p>
        </div>
      </div>
      <button
        class="w-8 h-8 rounded-full flex items-center justify-center text-lg"
        style="background: #F0EBE6; color: #8D6E63"
        @click="emit('close')"
      >×</button>
    </div>

    <!-- 訊息列表 -->
    <div ref="messagesEl" class="flex-1 overflow-y-auto px-4 py-4 space-y-4">
      <div
        v-for="(msg, i) in messages"
        :key="i"
        :class="msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'"
      >
        <div :class="msg.role === 'user' ? 'max-w-[75%]' : 'max-w-[85%] w-full'">
          <!-- 訊息氣泡 -->
          <div
            class="rounded-2xl px-4 py-3 text-sm"
            :style="msg.role === 'user'
              ? 'background: linear-gradient(135deg, #FF9800, #E65100); color: white; border-radius: 18px 18px 4px 18px'
              : 'background: #F7F3EF; color: #3E2723; border-radius: 18px 18px 18px 4px'"
          >
            {{ msg.text }}
          </div>

          <!-- 建議品項 -->
          <div v-if="msg.suggestedItems && msg.suggestedItems.length > 0" class="mt-2 space-y-2">
            <div
              v-for="item in msg.suggestedItems"
              :key="item.menuItemId"
              class="flex items-center justify-between rounded-xl px-3 py-2"
              style="background: #FFF8F0; border: 1px solid #FFE0B2"
            >
              <div>
                <p class="text-sm font-semibold" style="color: #3E2723">{{ item.name }}</p>
                <p class="text-xs" style="color: #E65100">NT$ {{ parseFloat(item.price) }}</p>
              </div>
              <button
                class="text-xs font-semibold px-3 py-1.5 rounded-full text-white"
                style="background: linear-gradient(135deg, #FF9800, #E65100)"
                @click="handleAddItems([item])"
              >
                加入
              </button>
            </div>

            <button
              v-if="msg.suggestedItems.length > 1"
              class="w-full text-sm font-semibold py-2.5 rounded-xl text-white"
              style="background: linear-gradient(135deg, #FF9800, #E65100)"
              @click="handleAddItems(msg.suggestedItems!)"
            >
              全部加入購物車
            </button>
          </div>
        </div>
      </div>

      <!-- 載入中 -->
      <div v-if="loading" class="flex justify-start">
        <div class="rounded-2xl px-4 py-3 text-sm" style="background: #F7F3EF; color: #BCAAA4; border-radius: 18px 18px 18px 4px">
          思考中...
        </div>
      </div>
    </div>

    <!-- 輸入區 -->
    <div class="px-4 pb-8 pt-3" style="border-top: 1px solid #F0EBE6">
      <!-- 快速提示 -->
      <div class="flex gap-2 mb-3 overflow-x-auto scrollbar-none">
        <button
          v-for="hint in ['推薦我', '來份套餐', '有什麼飲料', '幫我選']"
          :key="hint"
          class="shrink-0 text-xs px-3 py-1.5 rounded-full"
          style="background: #F0EBE6; color: #8D6E63"
          @click="inputText = hint; handleSend()"
        >
          {{ hint }}
        </button>
      </div>

      <div class="flex gap-2">
        <input
          v-model="inputText"
          type="text"
          placeholder="輸入你想吃的..."
          class="flex-1 rounded-2xl px-4 py-3 text-sm outline-none"
          style="background: #F7F3EF; color: #3E2723"
          @keydown.enter="handleSend"
        />
        <button
          class="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg disabled:opacity-40"
          style="background: linear-gradient(135deg, #FF9800, #E65100)"
          :disabled="!inputText.trim() || loading"
          @click="handleSend"
        >
          ↑
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-none { scrollbar-width: none; }
.scrollbar-none::-webkit-scrollbar { display: none; }
</style>
