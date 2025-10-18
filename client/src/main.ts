import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import Aura from '@primeuix/themes/aura'
import './index.css'

import App from './App.vue'
import router from './router'
import Tooltip from 'primevue/tooltip'

const app = createApp(App)

app
  .use(createPinia())
  .use(router)
  .use(PrimeVue, {
    theme: {
      preset: Aura,
      options: {
        darkModeSelector: '.darkTheme',
      },
    },
  })
  .use(ToastService)

app.directive('tooltip', Tooltip)

app.mount('#app')
