<template>
  <div class="w-64 bg-carbon-gray-90 border-r border-carbon-gray-80 flex flex-col">
    <div class="h-18 p-4 border-b border-carbon-gray-80">
      <div class="flex items-center space-x-3">
        <div class="flex items-center justify-center">
          <Button icon="pi pi-home" rounded />
        </div>
        <div>
          <h1 class="text-lg font-semibold text-carbon-gray-10">ЦДУ</h1>
          <p class="text-xs text-carbon-gray-40">Мосводоканал</p>
        </div>
      </div>
    </div>

    <nav class="flex-1 p-4">
      <ul class="space-y-2">
        <li v-for="item in navItems" :key="item.name">
          <RouterLink tabindex="-1" :to="item.path">
            <Button
              class="w-full justify-start!"
              :variant="currentRouteName === item.name ? '' : 'text'"
              :severity="currentRouteName === item.name ? '' : 'secondary'"
              :label="item.title"
              :icon="item.icon"
            />
          </RouterLink>
        </li>
      </ul>
    </nav>

    <div class="p-4 border-t border-carbon-gray-80">
      <div class="flex items-center space-x-3">
        <div class="flex items-center justify-center">
          <Button icon="pi pi-user" rounded severity="secondary" variant="text" />
        </div>
        <div class="flex-1">
          <p class="text-sm font-medium text-carbon-gray-10" data-testid="user-name">
            {{ userName }}
          </p>
        </div>
        <Button icon="pi pi-sign-out" rounded severity="secondary" variant="text" @click="logout" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { Button } from 'primevue'
import { useRouter } from 'vue-router'
const router = useRouter()
import { useUserStore } from '@/stores/user'

const route = useRoute()
const userStore = useUserStore()
const currentRouteName = computed(() => route.name)
const userName = computed(
  () =>
    `${userStore.user?.lastName} ${userStore.user?.firstName.charAt(0).toUpperCase()}. ${userStore.user?.middleName ? userStore.user?.middleName.charAt(0).toUpperCase() + '.' : ''}`,
)
const toast = useToast()
const navItems = [
  {
    path: '/',
    name: 'monitoring',
    title: 'Мониторинг',
    icon: 'pi pi-chart-bar',
  },
  {
    path: '/forecast',
    name: 'forecast',
    title: 'Прогнозирование',
    icon: 'pi pi-chart-scatter',
  },
  {
    path: '/incidents',
    name: 'incidents',
    title: 'Инциденты',
    icon: 'pi pi-list',
  },
]

function logout() {
  localStorage.removeItem('sessionToken')
  localStorage.removeItem('sessionEmail')
  router.push('/login')
  toast.add({ severity: 'info', summary: 'Вы вышли из системы', life: 3000 })
  userStore.user = undefined
}
</script>
