import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE ?? 'http://localhost:3000',
})

// 每次請求自動帶上 JWT token
api.interceptors.request.use((config) => {
  const auth = useAuthStore()
  if (auth.token) {
    config.headers.Authorization = `Bearer ${auth.token}`
  }
  return config
})

// 攔截 401：token 過期 → 觸發重新登入彈窗
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const auth = useAuthStore()
      auth.markExpired()
    }
    return Promise.reject(error)
  }
)

export default api
