import { createApp } from 'vue'
import initOverrides from './overrides/index'
import App from './App.vue'
import store from './store'
import router from './router'

initOverrides()

createApp(App).use(router).use(store).mount('#app')
