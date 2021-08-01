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
  <div
    class="mr-5"
  >
    <v-menu
      transition="scale-transition"
      origin="top right"
    >
      <template v-slot:activator="{ on }">
        <v-btn
          tile
          text
          style="margin-top: 6px !important"
          data-cy="profileButton"
          v-on="on"
        >
          <v-icon>{{ icons.mdiAccount }}</v-icon>
        </v-btn>
      </template>
      <v-list width="220">
        <v-list-item>
          <v-list-item-title
            class="text-center subtitle-1 font-weight-bold"
            v-text="userProfile"
          />
        </v-list-item>
        <v-divider class="mb-2" />
        <v-list-item
          v-if="!isLdapUser"
          @click="changePass"
        >
          <v-list-item-title class="text-center">
            Change Password
          </v-list-item-title>
        </v-list-item>
        <v-list-item
          data-cy="logoutButton"
          @click="logout"
        >
          <v-list-item-title
            style="color:red"
            class="text-center"
          >
            Logout
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script>
  import { mdiAccount } from '@mdi/js'

  export default {
    name: 'ProfileButton',
    data: () => ({
      icons: {
        mdiAccount
      }
    }),
    computed: {
      isLdapUser () {
        return this.$store.state.user.user.type === 'ldap'
      },
      userProfile () {
        if (this.$store.state.user?.user?.display !== undefined) {
          return this.$store.state.user.user.display
        }
        return this.$store.state.user.username
      }
    },
    methods: {
      logout () {
        this.$cookie.delete('token', { domain: window.location.hostname,
                                       samesite: 'Lax' })
        this.$store.commit('setUserData', null)
        this.$store.commit('setUserRoles', [])

        this.$router.push('/login')
      },
      changePass () {
        this.$router.push('/changePassword')
      }
    }
  }
</script>

<style lang="scss" scoped>
.profButtonContainer {
  width: 44px;
  height: 34px;
  margin-top: 4px;
  margin-right: 4px;
  padding: 0;
  background-color: rgba(255, 255, 255, 0);

  clip-path: circle(20px at 12px 24px);
  transition: all 0.3s linear;

  .inner {
    float: right;
    cursor: default;
    transition: all 0.3s linear;
    padding-top: 10px;
  }

  .innerOpacity {
    opacity: 0;
    transition: all 0.1s linear;
  }

  &:hover {
    background-color: white;
    clip-path: circle(200% at 288px 24px);
    width: 300px;
    height: 145px;

    .inner {
      color: rgba(255, 255, 255, 0);
    }

    .innerOpacity {
      opacity: 1;
    }
  }
}
</style>
