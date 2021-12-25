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

<template>
  <v-app :style="cssVariables">
    <tutorial
      v-if="startTutorial === true"
      v-model="startTutorial"
    />
    <v-dialog
      v-model="showTutorialDialog"
      width="500px"
    >
      <v-card>
        <v-card-title
          class="primary"
          primary-title
        >
          Tower Configuration Server setup process
        </v-card-title>
        <v-divider />
        <v-card-text class="pt-4">
          Welcome to Tower Configuration Server.<br>
          It looks like your Tower is not configured yet.<br>
          Do you want me to guide you through the setup process?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            text
            @click="neverCheckTutorial = true; showTutorialDialog = false"
          >
            No
          </v-btn>
          <v-btn
            color="primary"
            text
            @click="neverCheckTutorial = true; showTutorialDialog = false; startTutorial = true"
          >
            Yes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="errorDialog"
      max-width="500px"
    >
      <v-card>
        <v-card-title
          class="error"
          primary-title
        >
          Error
        </v-card-title>
        <v-divider />
        <v-card-text class="pt-4">
          {{ errorText }}
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            text
            @click="$store.commit('closeError')"
          >
            OK
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <drawer v-if="loggedIn" />
    <toolbar v-if="loggedIn" />
    <v-main>
      <v-container
        fluid
        style="padding-left: 70px; height: 100%"
      >
        <transition
          name="fade"
          mode="out-in"
        >
          <router-view
            :key="$route.fullPath"
            class="mx-3 mt-4"
          />
        </transition>
      </v-container>
    </v-main>
    <footerElement />
  </v-app>
</template>

<script>
  import drawer from '@/components/core/drawer'
  import toolbar from '@/components/core/toolbar'
  import footerElement from '@/components/core/footerElement'
  import tutorial from '@/components/core/tutorial'

  export default {
    name: 'App',
    components: {
      drawer,
      toolbar,
      footerElement,
      tutorial
    },
    data: () => ({
      startTutorial: false,
      showTutorialDialog: false,
      neverCheckTutorial: false
    }),
    computed: {
      cssVariables () {
        let scrollbarTrackBackground = 'var(--v-background-lighten1)'
        if (this.$vuetify.theme.dark === false) {
          scrollbarTrackBackground = 'var(--v-background-darken1)'
        }

        return {
          '--v-isDark': this.$vuetify.theme.dark,
          '--v-scrollbarTrack-background': scrollbarTrackBackground
        }
      },
      loggedIn () {
        return (
          this.$store.state.user !== null &&
          this.$route.name !== 'noPermissions' &&
          this.$route.name !== 'changePassword' &&
          this.$route.name !== 'Login'
        )
      },
      errorDialog () {
        return this.$store.state.error.show
      },
      errorText () {
        return this.$store.state.error.text
      }
    },
    watch: {
      async $route () {
        if (
          this.$store.state.user?.username === 'admin' &&
          this.$route.name !== 'noPermissions' &&
          this.$route.name !== 'changePassword' &&
          this.$route.name !== 'Login' &&
            this.neverCheckTutorial === false
        ) {
          const bases = await this.axios.get(`${this.$store.state.mainUrl}/baseConfigurations`)
          if (bases.data.length === 0) {
            this.showTutorialDialog = true
          } else {
            this.neverCheckTutorial = true
          }
        }
      }
    },
    async beforeCreate () {
      const response = await this.axios.get(
        `${this.$store.state.mainUrl}/configurations/initialized`
      )

      if (response.status === 200) {
        this.$store.state.initialized = response.data
        if (this.$store.state.initialized === false) {
          this.$router.push('/initialize')
        }
      }
    },
    async mounted () {
      let theme = this.$cookie.get('tower.theme', {
        domain: window.location.hostname,
        samesite: 'Lax'
      })

      if (!theme) {
        this.$cookie.set('tower.theme', 'light', {
          expires: `10Y`,
          domain: window.location.hostname,
          samesite: 'Lax'
        })
        this.$vuetify.theme.dark = false
      } else {
        this.$vuetify.theme.dark = theme === 'dark'
      }

      this.axios.interceptors.response.use(
        response => response,
        e => {
          if (
            this.$route.name !== 'Login' &&
            e.response !== undefined &&
            e.response.data !== undefined &&
            e.response.data.error !== undefined &&
            e.response.data.error.message !== undefined
          ) {
            if (e.response.status === 401) {
              this.$cookie.delete('token', { domain: window.location.hostname,
                                             samesite: 'Lax' })

              this.$store.commit('setUserData', null)
              this.$store.commit('setUserRoles', [])

              this.$router.push('/login')
            }
            this.$store.commit('setError', e.response.data.error.message)
          }
        }
      )
    }
  }
</script>

<style>
html {
  overflow: auto;
}

.theme--light.v-application {
  background-color: var(--v-background-base) !important;
}

.fade-enter-active,
.fade-leave-active {
  transition-duration: 0.3s;
  transition-property: opacity;
  transition-timing-function: ease;
}

.fade-enter,
.fade-leave-active {
  opacity: 0;
}

.slowfade-enter-active,
.slowfade-leave-active {
  transition-duration: 0.4s;
  transition-property: opacity;
  transition-timing-function: ease;
}

.slowfade-enter,
.slowfade-leave-active {
  opacity: 0;
}

/* Tower SVG classes */
.cls-1 {
  fill: var(--v-primary-base);
}
.cls-2 {
  fill:#fff;
}
.cls-3 {
  fill:#231f20;
}
.cls-4 {
  fill:#d8d8d8;
}

.v-time-picker-title__time .v-picker__title__btn, .v-time-picker-title__time span {
  font-size: 70px !important;
}

.v-picker__title {
  height: 90px !important;
}

.outline {
  border: thin solid rgba(0, 0, 0, 0.12);
  border-bottom: 0;
}

.outline.dark {
  border: thin solid rgba(255, 255, 255, 0.12);
}

/* width */
::-webkit-scrollbar {
  width: 10px;
}

/* Track */
::-webkit-scrollbar-track {
  background: var(--v-scrollbarTrack-background);
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 10px;
  border: 2px solid transparent;
  background-clip: content-box;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #555;
  border-radius: 10px;
  border: 2px solid transparent;
  background-clip: content-box;
}
</style>

<style lang="scss">
.prism-editor__textarea:focus {
  outline: none;
}
.prismeditor {
  font-family: Fira code, Fira Mono, Consolas, Menlo, Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
  border: 1px solid rgba(211, 211, 211, 0.5);
  background: repeating-linear-gradient(rgba(69, 142, 209, 0.04), rgba(69, 142, 209, 0.04) 21px,
    rgba(0, 0, 0, 0) 21px, rgba(0, 0, 0, 0) 42px);
}
</style>
