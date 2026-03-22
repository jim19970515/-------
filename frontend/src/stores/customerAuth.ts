import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Customer {
  id: number
  email: string
  name: string
  phone: string | null
  avatar: string | null
}

export const useCustomerAuthStore = defineStore('customerAuth', () => {
  const token = ref<string | null>(localStorage.getItem('customerToken'))
  const customer = ref<Customer | null>(
    JSON.parse(localStorage.getItem('customerInfo') || 'null')
  )

  const isLoggedIn = computed(() => !!token.value)
  const needsPhone = computed(() => isLoggedIn.value && !customer.value?.phone)

  function setAuth(newToken: string, newCustomer: Customer) {
    token.value = newToken
    customer.value = newCustomer
    localStorage.setItem('customerToken', newToken)
    localStorage.setItem('customerInfo', JSON.stringify(newCustomer))
  }

  function updateCustomer(updated: Customer) {
    customer.value = updated
    localStorage.setItem('customerInfo', JSON.stringify(updated))
  }

  function logout() {
    token.value = null
    customer.value = null
    localStorage.removeItem('customerToken')
    localStorage.removeItem('customerInfo')
  }

  return { token, customer, isLoggedIn, needsPhone, setAuth, updateCustomer, logout }
})
