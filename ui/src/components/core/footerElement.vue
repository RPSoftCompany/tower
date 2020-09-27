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
  <v-footer
    inset
    app
    height="30"
    class="footer"
  >
    <v-spacer />
    <span class="font-weight-light caption">
      &copy;
      {{ new Date().getFullYear() }}
      RPSoft, Tower v.{{ version }}
    </span>
  </v-footer>
</template>

<script>
  export default {
    name: 'FooterElement',
    computed: {
      version () {
        return process.env.VUE_APP_VERSION
      },
    },
  }
</script>

<style scoped>
.footer {
  border-top: 1px solid;
  border-color: #e6e6e6 !important;
}
</style>
