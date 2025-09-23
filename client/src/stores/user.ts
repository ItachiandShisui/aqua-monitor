import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { IUser } from '@/types/user'

export const useUserStore = defineStore('user', () => {
  const user = ref<IUser>()

  function updateUser(payload: IUser) {
    user.value = payload
  }

  return { user, updateUser }
})
