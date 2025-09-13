<template>
  <Toast />
  <Tabs class="w-full p-6" value="0">
    <TabList>
      <Tab value="0" as="div" class="flex items-center gap-2">
        <i class="pi pi-exclamation-triangle" />
        <span class="font-bold whitespace-nowrap">Активные</span>
        <Badge :value="newTasks.length" />
      </Tab>
      <Tab value="1" as="div" class="flex items-center gap-2">
        <i class="pi pi-eye" />
        <span class="font-bold whitespace-nowrap">Принятые</span>
        <Badge :value="currentTasks.length" />
      </Tab>
      <Tab value="2" as="div" class="flex items-center gap-2">
        <i class="pi pi-check-circle" />
        <span class="font-bold whitespace-nowrap">Решенные</span>
      </Tab>
    </TabList>
    <TabPanels v-if="!isLoading">
      <TabPanel
        v-for="(tasks, idx) in [newTasks, currentTasks, resolvedTasks]"
        :key="idx"
        :value="String(idx)"
        as="div"
      >
        <Card v-for="task in tasks" :key="task._id" class="p-6 border mb-2">
          <template #header>
            <div class="px-5">
              <Tag
                class="mr-2"
                :value="task.priority"
                rounded
                :severity="tagColor(task.priority)"
              />
              <Tag class="mr-2" :value="task.type" rounded severity="contrast" />
              <span>{{ task.adress }}</span>
            </div>
          </template>
          <template #title>
            <p class="font-bold">
              {{ task.title }}
            </p>
          </template>
          <template #subtitle>
            <p class="text-sm">
              <span class="mr-2">{{ new Date(task.createdAt).toLocaleString() }}</span
              >{{ task.assigned_to }}
            </p>
          </template>
          <template #content>
            <p class="m-0">
              {{ task.message }}
            </p>
          </template>
          <template #footer>
            <Button
              v-if="idx === 0"
              class="w-full"
              variant="outlined"
              label="В работу"
              @click="changeStatus(task)"
            />
            <Button
              v-if="idx === 1"
              class="w-full"
              variant="outlined"
              label="Готово"
              @click="changeStatus(task)"
            />
          </template>
        </Card>
      </TabPanel>
    </TabPanels>

    <TabPanels class="card flex justify-center" v-else>
      <ProgressSpinner />
    </TabPanels>
  </Tabs>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import Badge from 'primevue/badge'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Tag from 'primevue/tag'
import Tabs from 'primevue/tabs'
import TabList from 'primevue/tablist'
import Tab from 'primevue/tab'
import TabPanels from 'primevue/tabpanels'
import TabPanel from 'primevue/tabpanel'
import ProgressSpinner from 'primevue/progressspinner'
import { getTasks, updateTask } from '@/api/index.ts'
import { Priority, Statuses } from '@/types/accidents.ts'
import type { ITask } from '@/types/accidents.ts'

const toast = useToast()
const isLoading = ref(false)

const tasks = ref([] as ITask[])
const newTasks = ref([] as ITask[])
const currentTasks = ref([] as ITask[])
const resolvedTasks = ref([] as ITask[])

onMounted(async () => {
  await recieveTasks()
})

function tagColor(priority: Priority) {
  const translator = new Map()
  translator.set(Priority.Critical, 'danger')
  translator.set(Priority.Major, 'warn')
  translator.set(Priority.Moderate, 'help')
  translator.set(Priority.Minor, 'info')
  return translator.get(priority)
}

async function recieveTasks() {
  isLoading.value = true
  tasks.value = []
  tasks.value = []
  newTasks.value = []
  currentTasks.value = []
  resolvedTasks.value = []
  await getTasks().then((data) => {
    tasks.value = data
    tasks.value.map((e) => {
      if (e.status === Statuses.New) newTasks.value.push(e)
      if (e.status === Statuses.InProgress) currentTasks.value.push(e)
      if (e.status === Statuses.Resolved) resolvedTasks.value.push(e)
    })
  })
  isLoading.value = false
}

async function changeStatus(task: ITask) {
  try {
    const payload = task
    if (payload.status === Statuses.InProgress) {
      payload.status = Statuses.Resolved
    }
    if (payload.status === Statuses.New) {
      payload.status = Statuses.InProgress
    }
    await updateTask(payload)
    toast.add({
      severity: 'success',
      summary: 'Готово',
      detail: 'Статус задачи обновлен',
      life: 3000,
    })
    await recieveTasks()
  } catch (error) {
    console.error(error)
  }
}
</script>

<style scoped>
:deep(.p-tablist-tab-list) {
  justify-content: space-around;
}
</style>
