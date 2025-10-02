import { createRouter, createWebHistory } from 'vue-router'

export const routes = [
  {
    path: '/',
    name: 'monitoring',
    component: () => import('@/views/MonitoringView.vue'),
  },
  {
    path: '/forecast',
    name: 'forecast',
    component: () => import('@/views/ForecastView.vue'),
  },
  {
    path: '/incidents',
    name: 'incidents',
    component: () => import('@/views/IncidentsView.vue'),
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
  },
  {
    path: '/:catchAll(.*)',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem('sessionToken')

  if (!token && to.name === 'login') {
    return next()
  }
  if (token && (to.name === 'login' || to.name === 'register')) {
    return next('./')
  }

  if (token) {
    next()
  } else {
    next('./login')
  }
})

export default router
