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
  <v-container
    class="fill-height makeItEven"
    fluid
  >
    <v-row
      align="center"
      justify="center"
    >
      <v-col
        cols="12"
        sm="4"
        style="max-width:389px;"
      >
        <v-card :class="cardClass">
          <v-img
            :width="384"
            src="/ui/tower.png"
            class="towerImage"
          />
          <v-card-text>
            <v-form
              ref="form"
              v-model="form.valid"
            >
              <v-text-field
                v-model="login"
                data-cy="login"
                :prepend-icon="icons.mdiAccount"
                :rules="rules.login"
                :disabled="loginInputsDisabled"
                autofocus
                label="User"
                name="login"
                type="text"
                required
                @keyup.enter="submit"
              />
              <v-text-field
                v-model="pass"
                data-cy="password"
                :prepend-icon="icons.mdiLock"
                :rules="rules.pass"
                :disabled="loginInputsDisabled"
                label="Password"
                name="password"
                type="password"
                required
                @keyup.enter="submit"
              />
            </v-form>
          </v-card-text>
          <div
            v-if="invalidLogin"
            class="loginError"
            v-text="errorText"
          />
          <v-card-actions>
            <v-btn
              :loading="loading"
              data-cy="loginButton"
              :disabled="!form.valid"
              :elevation="!form.valid ? 1 : undefined"
              color="primary"
              block
              @click="submit"
            >
              Login
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import { mdiAccount, mdiLock } from '@mdi/js'

  export default {
    name: 'Login',
    data: () => ({
      icons: {
        mdiAccount,
        mdiLock,
      },

      login: '',
      pass: '',
      loginInputsDisabled: false,
      loading: false,

      errorText: null,

      form: {
        valid: false,
      },

      rules: {
        login: [v => !!v || 'User is required'],
        pass: [v => !!v || 'Password is required'],
      },

      invalidLogin: false,
    }),
    computed: {
      cardClass () {
        const styleClass = 'pa-2 elevation-5'

        if (this.invalidLogin) {
          return `${styleClass} shake`
        }

        return styleClass
      },
    },
    async beforeCreate () {
      let token = this.$cookie.get('token')
      if (token) {
        token = JSON.parse(token)
        this.$store.commit('setUserData', token)

        const roles = await this.axios.get(
          `${this.$store.state.mainUrl}/members/getUserRoles`,
        )

        this.$store.commit('setUserRoles', roles.data)

        if (token.user.newUser) {
          this.$router.push('/changePassword')
        } else {
          let path = this.getUserStartPath(roles.data)

          if (path === null) {
            path = 'noPermissions'
          }

          this.$router.push(`/${path}`)
        }
      }
    },
    methods: {
      getUserStartPath (roles) {
        let path = null

        if (this.$store.state.user.username === 'admin' || roles.includes('admin')) {
          return 'settings'
        }

        if (
          roles.includes('configuration.view') ||
          this.$store.state.userRoles.includes('admin')
        ) {
          path = 'archive'
          if (
            roles.includes('configuration.modify') ||
            this.$store.state.userRoles.includes('admin')
          ) {
            path = 'configuration'
          }
        }

        if (path === null) {
          for (const perm of roles) {
            if (perm.startsWith('baseConfigurations')) {
              const split = perm.split('.')
              if (split.length === 3) {
                path = `base/${split[1]}`
              }
            }
          }
        }

        return path
      },
      async submit () {
        if (this.$refs.form.validate()) {
          this.loading = true
          this.loginInputsDisabled = true
          this.invalidLogin = false
          let validUser = true
          const user = await this.axios.post(
            `${this.$store.state.mainUrl}/members/login?include=user`,
            {
              username: this.login,
              password: this.pass,
            },
            {
              timeout: 10000,
            },
          )

          if (user !== undefined) {
            user.data.username = this.login

            this.$store.commit('setUserData', user.data)

            this.$cookie.set('token', JSON.stringify(user.data), { expires: `${user.data.ttl}s` })

            const roles = await this.axios.get(
              `${this.$store.state.mainUrl}/members/getUserRoles`,
            )

            this.$store.commit('setUserRoles', roles.data)

            if (user.data.user.newUser) {
              this.$router.push('/changePassword')
            } else {
              let path = this.getUserStartPath(roles.data)

              if (path === null) {
                path = 'noPermissions'
              }

              this.$router.push(`/${path}`)
            }
          } else {
            validUser = false
          }

          this.loading = false
          this.loginInputsDisabled = false

          if (!validUser) {
            this.invalidLogin = true
            this.errorText = 'Invalid user or password'
          }
        }
      },
    },
  }
</script>

<style lang="scss" scoped>
.towerImage {
  margin-left: 4px;
}

.makeItEven {
  margin-top: 0px !important;
  margin-bottom: 30px !important;
}

.loginError {
  color: red;
  text-align: center;
  margin-top: -20px;
}

.shake {
  animation: shake 0.4s;
}

@keyframes shake {
  0% {
    transform: translate(1px, -1px) rotate(-1deg);
  }
  20% {
    transform: translate(-1px, 1px) rotate(1deg);
  }
  40% {
    transform: translate(1px, -1px) rotate(-1deg);
  }
  60% {
    transform: translate(-1px, 1px) rotate(1deg);
  }
  80% {
    transform: translate(1px, -1px) rotate(-1deg);
  }
  100% {
    transform: translate(-1px, 1px) rotate(1deg);
  }
}
</style>
