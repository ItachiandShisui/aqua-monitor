<template>
  <div class="flex h-screen bg-carbon-gray-100 text-carbon-gray-10 font-inter overflow-hidden">
    <NavbarMenu @update="forceUpdate += 1" />

    <div class="flex-1 flex flex-col overflow-hidden">
      <header
        class="flex items-center justify-between bg-carbon-gray-90 border-b border-carbon-gray-80 p-4 h-18"
      >
        <h2 class="text-xl font-semibold text-carbon-gray-10">Система мониторинга</h2>
        <div class="flex items-center space-x-4">
          <!-- <div class="flex items-center space-x-2">
            <div
              class="w-3 h-3 rounded-full animate-pulse"
              :class="[isConnected ? 'bg-carbon-green' : 'bg-carbon-red']"
            />
            <span class="text-sm text-carbon-gray-30"> "Система активна" or "Подключение..." </span>
          </div> -->
          <div class="text-sm text-carbon-gray-30" data-testid="current-time">
            {{ currentTime.toLocaleTimeString() }}
          </div>
        </div>
      </header>

      <main class="flex-1 overflow-auto p-6">
        <RouterView :key="forceUpdate" />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import NavbarMenu from '@/components/NavbarMenu.vue'

// const isConnected = true
const currentTime = new Date()
const forceUpdate = ref(0)
</script>
