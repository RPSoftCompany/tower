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
  <v-container
    class="fill-height"
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
        <v-card>
          <div class="pa-2">
            <img
              src="@/assets/tower.png"
              :width="354"
              class="towerImage"
            >
          </div>
          <v-divider />
          <v-card-text
            class="text-center error--text"
          >
            <b>You have not enough permission to access Tower</b>
            <v-btn
              class="mt-2"
              data-cy="goBackToLogin"
              color="primary"
              block
              @click="routeToLogin"
            >
              Go back to login page
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  export default {
    name: 'NoPermissions',
    mounted () {
      this.$store.commit('setUserRoles', null)
      this.$store.commit('setUserData', null)

      this.$cookie.delete('token')
    },
    methods: {
      routeToLogin () {
        this.$cookie.delete('token', { domain: window.location.hostname,
                                       samesite: 'Lax' })
        this.$store.commit('setUserData', null)
        this.$store.commit('setUserRoles', [])

        this.$router.push('/login')
      }
    }
  }
</script>
