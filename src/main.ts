import { createApp } from 'vue'
import App from './App.vue'
import store from './store'
import router from './router'
import initOverrides from './overrides/index'

initOverrides()

createApp(App).use(router).use(store).mount('#app')
