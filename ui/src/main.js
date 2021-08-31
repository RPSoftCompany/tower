//    Copyright RPSoft 2019,2020. All Rights Reserved.
//    This file is part of RPSoft Tower.
//
//    Tower is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation; either version 3 of the License, or
//    (at your option) any later version.
//
//    Tower is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.
//
//    You should have received a copy of the GNU General Public License
//    along with Tower.  If not, see http://www.gnu.org/licenses/gpl-3.0.html.
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import axios from 'axios'
import VueAnime from 'vue-animejs'

// Fonts
import '@fontsource/roboto'

import VueCookie from 'vue-cookie'

Vue.use(VueCookie)
Vue.use(VueAnime)

Vue.config.productionTip = false

Vue.prototype.$http = axios
Vue.prototype.axios = axios

Vue.prototype.$eventHub = new Vue()

axios.interceptors.request.use(config => {
  if (store.state.user) {
    config.headers.Authorization = store.state.user.id
  }

  return config
})

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
