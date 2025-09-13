import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '@/views/DashboardView.vue'
import MonitoringView from '@/views/MonitoringView.vue'

export const routes = [
  {
    path: '/',
    name: 'dashboard',
    title: 'Инциденты',
    component: DashboardView,
    icon: 'pi pi-list',
  },
  {
    path: '/monitoring',
    name: 'monitoring',
    title: 'Мониторинг',
    component: MonitoringView,
    icon: 'pi pi-chart-bar',
  },
]

const router = createRouter({
  // history: createWebHistory(import.meta.env.BASE_URL),
  history: createWebHistory(),
  routes,
})

export default router
