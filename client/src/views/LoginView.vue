<template>
  <div
    class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden"
  >
    <div class="flex flex-col items-center justify-center">
      <div
        class="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%);"
      >
        <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20">
          <template v-if="hasAcc">
            <div class="text-center mb-8">Вход в систему</div>
            <form>
              <div class="flex flex-col gap-2">
                <label for="email">Почта пользователя</label>
                <InputText
                  id="email"
                  class="mb-4"
                  v-model="email"
                  autocomplete="email"
                  :invalid="(!email && checkErrors) || (checkErrors && errLoginField === 'email')"
                />
              </div>
              <div class="flex flex-col gap-2">
                <label for="password">Пароль</label>
                <Password
                  class="mb-4"
                  v-model="password"
                  :feedback="false"
                  toggleMask
                  fluid
                  :inputProps="{ autocomplete: 'current-password', id: 'password' }"
                  :invalid="
                    (!password && checkErrors) || (checkErrors && errLoginField === 'password')
                  "
                />
              </div>
              <div class="flex flex-col gap-2">
                <Button label="Вход" @click="checkFields() && login()" />
              </div>
            </form>
            <Message size="small" severity="secondary" variant="simple"
              >Не зарегистрированы в системе?
              <Button
                label="Создайте пользовательскую запись"
                variant="link"
                @click="hasAcc = false"
            /></Message>
          </template>
          <template v-else>
            <div class="text-center mb-8">Регистрация в системе</div>
            <form @submit="createUser">
              <div class="flex flex-col gap-2">
                <label for="email">Почта пользователя*</label>
                <InputText
                  id="email"
                  class="mb-4"
                  v-model="email"
                  autocomplete="email"
                  :invalid="!email && checkErrors"
                />
              </div>
              <div class="flex flex-col gap-2">
                <label for="password">Пароль*</label>
                <Password
                  v-model="password"
                  class="mb-4"
                  :feedback="false"
                  toggleMask
                  fluid
                  :inputProps="{ autocomplete: 'current-password', id: 'password' }"
                  :invalid="!password && checkErrors"
                />
              </div>
              <div class="flex flex-col gap-2">
                <label for="firstName">Имя пользователя*</label>
                <InputText
                  id="firstName"
                  class="mb-4"
                  v-model="firstName"
                  autocomplete="firstName"
                  :invalid="!firstName && checkErrors"
                />
              </div>
              <div class="flex flex-col gap-2">
                <label for="lastName">Фамилия пользователя*</label>
                <InputText
                  id="lastName"
                  class="mb-4"
                  v-model="lastName"
                  autocomplete="lastName"
                  :invalid="!lastName && checkErrors"
                />
              </div>
              <div class="flex flex-col gap-2">
                <label for="middleName">Отчество пользователя</label>
                <InputText
                  id="middleName"
                  class="mb-2"
                  v-model="middleName"
                  autocomplete="middleName"
                />
              </div>
              <Message class="mb-4" size="small" severity="secondary" variant="simple"
                >Звездочкой (*) помечены обязательные для заполнения поля</Message
              >
              <div class="flex flex-col gap-2">
                <Button label="Регистрация" @click="checkFields() && createUser()" />
              </div>
            </form>
            <Message size="small" severity="secondary" variant="simple"
              >Уже регистрировались в системе?
              <Button label="Войдите в систему" variant="link" @click="hasAcc = true"
            /></Message>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Message from 'primevue/message'
import { useToast } from 'primevue/usetoast'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import { logUser, registerUser } from '@/api'
import type { IUser } from '@/types/user'

const toast = useToast()
const hasAcc = ref(true)
const email = ref('')
const firstName = ref('')
const lastName = ref('')
const middleName = ref('')
const password = ref('')
const checkErrors = ref(false)
const errLoginField = ref('')

const userStore = useUserStore()

const router = useRouter()

function checkFields() {
  checkErrors.value = true
  if (hasAcc.value) {
    return Boolean(email.value && password.value)
  } else {
    return Boolean(email.value && password.value && firstName.value && lastName.value)
  }
}

async function login() {
  try {
    await logUser({
      email: email.value,
      password: password.value,
    }).then(async (data) => {
      errLoginField.value = ''

      if (data?.error) {
        errLoginField.value = data.error
        toast.add({
          severity: 'error',
          summary: data.title,
          life: 3000,
        })
      }
      if (data?.accessToken) {
        toast.add({
          severity: 'info',
          summary: data.title,
          life: 3000,
        })
        userStore.user = data.user
        localStorage.setItem('sessionToken', data.accessToken)
        localStorage.setItem('sessionEmail', email.value)
        router.push('/')
      }
    })
  } catch (error) {
    console.error(error)
  }
}

async function createUser() {
  try {
    await registerUser({
      email: email.value,
      firstName: firstName.value,
      lastName: lastName.value,
      middleName: middleName.value,
      password: password.value,
    } as IUser).then((data) => {
      checkErrors.value = false
      if (data) {
        toast.add({
          severity: 'success',
          summary: data.title,
          detail: data.message,
          life: 3000,
        })
        hasAcc.value = true
        email.value = ''
        firstName.value = ''
        lastName.value = ''
        middleName.value = ''
        password.value = ''
      }
    })
  } catch (error) {
    console.error(error)
  }
}
</script>
