<template>
  <Toast />
  <OverlayView v-if="userStore.user" />
  <router-view v-else />
</template>

<script setup lang="ts">
import Toast from 'primevue/toast'
import { useUserStore } from './stores/user'
import OverlayView from './views/OverlayView.vue'
import { onBeforeMount } from 'vue'
import { getUser } from './api'

const userStore = useUserStore()

onBeforeMount(async () => {
  const email = localStorage.getItem('sessionEmail')
  const token = localStorage.getItem('sessionToken')
  if (token && email) {
    await getUser(email).then((data) => {
      if (data) {
        userStore.user = data
      }
    })
  }
})
</script>

<style>
.p-tablist-tab-list {
  justify-content: space-around;
}
.p-datatable-header {
  padding: 0 0 1rem 0 !important;
}
</style>
