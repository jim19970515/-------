import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/customer/:tableNo',
      component: () => import('@/views/customer/CustomerView.vue'),
    },
    {
      path: '/admin/login',
      component: () => import('@/views/admin/LoginView.vue'),
    },
    {
      path: '/admin',
      meta: { requiresAuth: true },
      component: () => import('@/views/admin/AdminLayout.vue'),
      children: [
        {
          path: 'menu',
          component: () => import('@/views/admin/MenuView.vue'),
        },
        {
          path: 'orders',
          component: () => import('@/views/admin/OrdersView.vue'),
        },
        {
          path: 'reports',
          component: () => import('@/views/admin/ReportsView.vue'),
        },
        {
          path: 'banners',
          component: () => import('@/views/admin/BannersView.vue'),
        },
      ],
    },
    {
      path: '/pos',
      component: () => import('@/views/pos/PosView.vue'),
    },
    {
      path: '/kds',
      component: () => import('@/views/kds/KdsView.vue'),
    },
  ],
})

// 路由守衛：沒登入不能進後台
router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.token) {
    return '/admin/login'
  }
})

export default router
