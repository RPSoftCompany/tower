import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './registerServiceWorker'
import vuetify from './plugins/vuetify'
import axios from 'axios'

Vue.config.productionTip = false

Vue.prototype.$http = axios
Vue.prototype.axios = axios

Vue.prototype.$eventHub = new Vue()

axios.interceptors.request.use(config => {
  if (store.state.user !== null) {
    config.headers.Authorization = store.state.user.id
  }

  return config
})

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App),
}).$mount('#app')
