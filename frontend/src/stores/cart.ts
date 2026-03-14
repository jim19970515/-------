import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { MenuItem } from '@/types/menu'

export interface CartItem {
  menuItem: MenuItem
  quantity: number
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])

  const totalPrice = computed(() =>
    items.value.reduce((sum, item) => sum + parseFloat(item.menuItem.price) * item.quantity, 0)
  )

  const totalCount = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0)
  )

  function addItem(menuItem: MenuItem) {
    const existing = items.value.find((i) => i.menuItem.id === menuItem.id)
    if (existing) {
      existing.quantity++
    } else {
      items.value.push({ menuItem, quantity: 1 })
    }
  }

  function removeItem(menuItemId: number) {
    const index = items.value.findIndex((i) => i.menuItem.id === menuItemId)
    if (index === -1) return
    const item = items.value[index]
    if (item && item.quantity > 1) {
      item.quantity--
    } else {
      items.value.splice(index, 1)
    }
  }

  function clear() {
    items.value = []
  }

  return { items, totalPrice, totalCount, addItem, removeItem, clear }
})
