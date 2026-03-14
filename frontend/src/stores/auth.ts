import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const role = ref<string | null>(localStorage.getItem('role'))
  const sessionExpired = ref(false)

  function setAuth(newToken: string, newRole: string) {
    token.value = newToken
    role.value = newRole
    sessionExpired.value = false
    localStorage.setItem('token', newToken)
    localStorage.setItem('role', newRole)
  }

  function logout() {
    token.value = null
    role.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('role')
  }

  function markExpired() {
    token.value = null
    role.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    sessionExpired.value = true
  }

  return { token, role, sessionExpired, setAuth, logout, markExpired }
})