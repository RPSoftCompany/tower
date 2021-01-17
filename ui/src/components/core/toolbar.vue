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
  <v-app-bar
    app
    height="48"
  >
    <v-toolbar-title class="headline font-weight-regular">
      <span
        class="text-center toolbarTitle text-uppercase"
        style="position: absolute; width: 100%"
        v-text="route"
      />
      <v-avatar size="40">
        <v-img
          src="tower.png"
          class="towerImage"
        />
      </v-avatar>
      <div class="tower ml-1 font-weight-thin">
        Tower
      </div>
    </v-toolbar-title>
    <div class="login">
      <profileButton />
    </div>
  </v-app-bar>
</template>

<script>
  import profileButton from './profileButton'

  export default {
    name: 'Toolbar',
    components: {
      profileButton,
    },
    computed: {
      route () {
        if (this.$route.name === 'Base') {
          return this.$route.params.name
        }
        return this.$route.name
      },
    },
  }
</script>

<style scoped>
.toolbarTitle {
  font-weight: 300 !important;
  margin-top: 4px;
}
.login {
  float: right;
  position: absolute;
  right: 0px;
  top: 0px;
}
.tower {
  float: right;
  margin-top: 3px;
  color: gray;
}
</style>
