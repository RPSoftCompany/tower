import Vue from 'vue'
import Vuetify from 'vuetify/lib'

Vue.use(Vuetify)

export default new Vuetify({
  theme: {
    options: { customProperties: true },
    themes: {
      light: {
        primary: '#f2a52a',
        secondary: '#525252',
        background: '#fcfcfc'
      },
      dark: {
        primary: '#f2a52a',
        secondary: '#525252',
        background: '#1E1E1E'
      }
    }
  },
  icons: {
    iconfont: 'mdiSvg'
  }
})
