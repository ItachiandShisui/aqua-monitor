<template>
  <div class="w-64 bg-carbon-gray-90 border-r border-carbon-gray-80 flex flex-col">
    <div class="h-18 p-4 border-b border-carbon-gray-80">
      <div class="flex items-center space-x-3">
        <div class="flex items-center justify-center">
          <Button icon="pi pi-home" rounded severity="info" @click="visible = true" />
          <Dialog v-model:visible="visible" modal header="Создать инцидент">
            <span class="text-surface-500 dark:text-surface-400 block mb-8"
              >Все поля обязательны к заполнению</span
            >
            <div class="flex items-center gap-4 mb-4">
              <label class="font-semibold w-24">Статус</label>
              <Select
                v-model="payload.status"
                :options="Object.values(Statuses)"
                placeholder="Статус"
                class="flex-auto"
              />
            </div>
            <div class="flex items-center gap-4 mb-4">
              <label class="font-semibold w-24">Приоритет</label>
              <Select
                v-model="payload.priority"
                :options="Object.values(Priority)"
                placeholder="Приоритет"
                class="flex-auto"
              />
            </div>
            <div class="flex items-center gap-4 mb-4">
              <label class="font-semibold w-35">Тип</label>
              <Select
                v-model="payload.type"
                :options="Object.values(Types)"
                placeholder="Тип"
                class="w-full flex-auto"
              />
            </div>
            <div class="flex items-center gap-4 mb-4">
              <label for="adress" class="font-semibold w-24">Адресс</label>
              <InputText
                id="adress"
                v-model="payload.adress"
                class="flex-auto"
                autocomplete="off"
              />
            </div>
            <div class="flex items-center gap-4 mb-4">
              <label for="title" class="font-semibold w-24">Заголовок</label>
              <InputText id="title" v-model="payload.title" class="flex-auto" autocomplete="off" />
            </div>
            <div class="flex items-center gap-4 mb-4">
              <label for="message" class="font-semibold w-24">Сообщение</label>
              <InputText
                id="message"
                v-model="payload.message"
                class="flex-auto"
                autocomplete="off"
              />
            </div>
            <div class="flex items-center gap-4 mb-4">
              <label for="assigned_to" class="font-semibold w-24">Исполнитель</label>
              <InputText
                id="assigned_to"
                v-model="payload.assigned_to"
                class="flex-auto"
                autocomplete="off"
              />
            </div>
            <div class="flex justify-end gap-2">
              <Button
                type="button"
                label="Отменить"
                severity="secondary"
                @click="visible = false"
              ></Button>
              <Button type="button" label="Сохранить" @click="saveTask"></Button>
            </div>
          </Dialog>
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
          <p class="text-xs text-carbon-gray-40">Диспетчер</p>
        </div>
        <Button icon="pi pi-sign-out" rounded severity="secondary" variant="text" @click="logout" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { Button } from 'primevue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import { createTask } from '../api/index.ts'
import { Statuses, Priority, Types } from '@/types/accidents.ts'
import type { ITask } from '@/types/accidents.ts'
import { useRouter } from 'vue-router'
const router = useRouter()
import { useUserStore } from '@/stores/user'
const emit = defineEmits(['update'])

const route = useRoute()
const userStore = useUserStore()
const currentRouteName = computed(() => route.name)
const userName = computed(
  () =>
    `${userStore.user?.lastName} ${userStore.user?.firstName.charAt(0).toUpperCase()}. ${userStore.user?.middleName ? userStore.user?.middleName.charAt(0).toUpperCase() + '.' : ''}`,
)
const toast = useToast()
const visible = ref(false)
const payload = ref({} as ITask)
const navItems = [
  {
    path: '/',
    name: 'dashboard',
    title: 'Инциденты',
    icon: 'pi pi-list',
  },
  {
    path: '/monitoring',
    name: 'monitoring',
    title: 'Мониторинг',
    icon: 'pi pi-chart-bar',
  },
]

async function saveTask() {
  try {
    await createTask(payload.value)
    toast.add({ severity: 'success', summary: 'Готово', detail: 'Инцидент создан', life: 3000 })
    emit('update')
  } catch (error) {
    console.error(error)
  } finally {
    visible.value = false
  }
}

function logout() {
  localStorage.removeItem('sessionToken')
  localStorage.removeItem('sessionEmail')
  router.push('/login')
  toast.add({ severity: 'info', summary: 'Вы вышли из системы', life: 3000 })
  userStore.user = undefined
}
</script>
