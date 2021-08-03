import Vue from 'vue'
import Vuetify from 'vuetify/lib'

Vue.use(Vuetify)

export default new Vuetify({
  theme: {
    themes: {
      light: {
        primary: '#f2a52a',
        secondary: '#525252'
      }
    }
  },
  icons: {
    iconfont: 'mdiSvg'
  }
})
