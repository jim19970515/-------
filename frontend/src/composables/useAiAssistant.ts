import { ref } from 'vue'
import api from '@/composables/useApi'

export interface SuggestedItem {
  menuItemId: number
  quantity: number
  name: string
  price: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  text: string
  suggestedItems?: SuggestedItem[]
}

export function useAiAssistant() {
  const messages = ref<ChatMessage[]>([
    {
      role: 'assistant',
      text: '嗨！我是你的點餐小幫手 🍳 告訴我你想吃什麼，我來幫你找！',
    },
  ])
  const loading = ref(false)

  async function sendMessage(text: string) {
    if (!text.trim() || loading.value) return

    messages.value.push({ role: 'user', text })
    loading.value = true

    try {
      const { data } = await api.post<{ reply: string; suggestedItems: SuggestedItem[] }>(
        '/api/assistant/chat',
        { message: text },
      )
      messages.value.push({
        role: 'assistant',
        text: data.reply,
        suggestedItems: data.suggestedItems,
      })
    } catch {
      messages.value.push({
        role: 'assistant',
        text: '系統暫時無法回應，請直接從菜單選取！',
      })
    } finally {
      loading.value = false
    }
  }

  return { messages, loading, sendMessage }
}
