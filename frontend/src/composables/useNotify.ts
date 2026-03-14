import { ElNotification } from 'element-plus'

export function useNotify() {
  function success(message: string) {
    ElNotification({ type: 'success', message, duration: 3000 })
  }

  function error(message: string) {
    ElNotification({ type: 'error', message, duration: 4500, title: '發生錯誤' })
  }

  function warning(message: string) {
    ElNotification({ type: 'warning', message, duration: 3500 })
  }

  return { success, error, warning }
}
