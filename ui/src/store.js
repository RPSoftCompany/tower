import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

let main = 'http://localhost:3000'
if (process.env.NODE_ENV === 'production') {
  main = ''
}

export default new Vuex.Store({
  state: {
    user: null,
    userRoles: [],
    mainUrl: `${main}`,

    error: {
      text: '',
      show: false,
    },

    initialized: false,
  },
  mutations: {
    setUserData (state, user) {
      state.user = user
    },
    setUserRoles (state, roles) {
      state.userRoles = roles
    },
    setError (state, text) {
      state.error.text = text
      state.error.show = true
    },
    closeError (state) {
      state.error.show = false
    },
  },
})
