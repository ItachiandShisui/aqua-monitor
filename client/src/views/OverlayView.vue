<template>
  <div class="flex h-screen bg-carbon-gray-100 text-carbon-gray-10 font-inter overflow-hidden">
    <NavbarMenu @update="forceUpdate += 1" />

    <div class="flex-1 flex flex-col overflow-hidden">
      <header
        class="flex items-center justify-between bg-carbon-gray-90 border-b border-carbon-gray-80 p-4 h-18"
      >
        <h2 class="text-xl font-semibold text-carbon-gray-10">
          Система мониторинга и прогнозирования
        </h2>
        <div class="flex items-center space-x-4">
          <div class="text-sm text-carbon-gray-30" data-testid="current-time">
            {{ currentTime }}
          </div>
        </div>
      </header>

      <main class="flex-1 overflow-auto max-h-[calc(100vh-72px)] p-4">
        <RouterView :key="forceUpdate" />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import NavbarMenu from '@/components/NavbarMenu.vue'

let liveUpdate = null as unknown as NodeJS.Timeout
const currentTime = ref(new Date().toLocaleTimeString('ru-RU'))
const forceUpdate = ref(0)

onMounted(() => {
  liveUpdate = setInterval(() => {
    currentTime.value = new Date().toLocaleTimeString('ru-RU')
  }, 1000)
})

onUnmounted(() => {
  clearInterval(liveUpdate as NodeJS.Timeout)
})
</script>
