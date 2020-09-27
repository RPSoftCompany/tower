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
//    along with Tower.  If not, see <http://www.gnu.org/licenses/>.
<template>
  <v-app>
    <v-dialog
      v-model="errorDialog"
      persistent
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
  import drawer from './components/core/drawer'
  import toolbar from './components/core/toolbar'
  import footerElement from './components/core/footerElement'

  export default {
    name: 'App',
    components: {
      drawer,
      toolbar,
      footerElement,
    },
    data: () => ({}),
    computed: {
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
      },
    },
    async created () {
      const response = await this.axios.get(
        `${this.$store.state.mainUrl}/configurations/initialized`,
      )

      if (response.status === 200) {
        this.$store.state.initialized = response.data
        if (!this.$store.state.initialized) {
          this.$router.push('/initialize')
        }
      }
    },
    async mounted () {
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
              this.$store.commit('setUserData', null)
              this.$store.commit('setUserRoles', [])

              this.$router.push('/login')
            }
            this.$store.commit('setError', e.response.data.error.message)
          }
        },
      )
    },
  }
</script>

<style>
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

.v-time-picker-title__time .v-picker__title__btn, .v-time-picker-title__time span {
  font-size: 70px !important;
}

.v-picker__title {
  height: 90px !important;
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
  border: solid;
  border-color: rgba(211, 211, 211, 0.5);
  border-width: 1px;
  background: repeating-linear-gradient(rgba(69, 142, 209, 0.04), rgba(69, 142, 209, 0.04) 21px,
    rgba(0, 0, 0, 0) 21px, rgba(0, 0, 0, 0) 42px);
}
</style>
