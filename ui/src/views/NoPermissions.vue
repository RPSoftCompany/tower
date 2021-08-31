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
    class="d-flex justify-center"
    style="margin-left:-250px !important;"
  >
    <div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="768.000000pt"
        height="768.000000pt"
        viewBox="0 0 768.000000 768.000000"
        preserveAspectRatio="xMidYMid meet"
      >
        <g
          transform="translate(0.000000,768.000000) scale(0.200000,-0.200000)"
          class="path"
          stroke="#d8d8d8"
          fill="#d8d8d8"
          stroke-width="4"
        >
          <path
            d="M1635 3473 c-329 -29 -620 -122 -715 -230 l-42 -48 7 -135 c4 -88 11
                    -143 20 -157 20 -31 66 -419 70 -598 2 -83 8 -162 14 -177 5 -14 62 -77 126
                    -140 l116 -113 19 -295 c34 -510 93 -1236 104 -1280 15 -63 -24 1108 -50 1510
                    l-7 95 -124 126 -124 126 -3 144 c-4 176 -52 568 -76 624 -11 25 -19 78 -23
                    143 -5 103 -5 103 24 136 80 91 336 178 644 217 145 19 521 17 670 -4 212 -30
                    362 -79 460 -151 l50 -37 -44 41 c-142 131 -505 213 -926 208 -82 -1 -168 -3
                    -190 -5z"
          />
          <path
            d="M2675 3147 c-38 -5 -73 -12 -78 -16 -7 -7 -51 -491 -44 -497 2 -2 17
                    103 35 233 17 129 32 237 34 238 2 1 29 5 60 8 l57 5 70 -81 71 -82 0 -265 c0
                    -283 13 -778 30 -1130 11 -231 39 -643 45 -648 1 -2 6 133 10 300 7 301 -7
                    1121 -25 1480 -5 101 -10 204 -10 230 0 45 -4 53 -76 133 -42 47 -83 89 -92
                    93 -9 5 -48 4 -87 -1z"
          />
          <path
            d="M2542 2325 c-2 -38 -10 -48 -141 -175 -98 -96 -142 -145 -149 -170
                    -11 -35 -34 -278 -52 -555 -14 -209 -22 -848 -11 -810 28 91 78 694 89 1086 7
                    220 11 271 24 290 9 13 66 78 128 144 61 66 113 129 116 141 3 12 4 36 1 55
                    -4 33 -4 33 -5 -6z"
          />
          <path
            d="M2735 2610 c-7 -312 5 -961 25 -1294 11 -184 30 -420 35 -424 19 -20
                    16 1081 -5 1463 -16 310 -32 529 -40 550 -4 11 -11 -122 -15 -295z"
          />
          <path
            d="M1620 3249 c-218 -21 -403 -73 -532 -149 -37 -23 -68 -42 -68 -44 0
                    -2 41 14 91 35 171 74 380 113 689 128 163 8 434 -1 528 -19 69 -12 79 -7 16
                    9 -158 40 -522 60 -724 40z"
          />
          <path
            d="M1730 2538 c-80 -3 -197 -14 -260 -23 -107 -16 -306 -72 -340 -96
                    -12 -8 -11 -9 5 -5 181 47 248 58 455 77 144 13 480 16 655 5 66 -5 118 -6
                    115 -3 -10 10 -248 39 -365 46 -66 3 -185 3 -265 -1z"
          />
          <path
            d="M2258 3105 c-16 -42 -28 -207 -27 -365 0 -185 11 -188 29 -9 12 120 10 408 -2 374z"
          />
          <path
            d="M1687 3038 c-7 -115 7 -380 22 -420 5 -15 10 16 15 93 7 116 -8 401 -23 427 -4 8 -11 -34 -14 -100z"
          />
          <path
            d="M1204 2900 c5 -144 28 -345 41 -359 12 -11 3 269 -10 369 -26 180 -36 176 -31 -10z"
          />
        </g>
      </svg>
    </div>
    <div
      class="d-flex flex-column justify-space-around align-center"
    >
      <div
        class="text-h1 primary--text"
      >
        Tower
      </div>
      <div class="text-center text-h5 font-weight-bold">
        <div>You don't have permission to access Tower</div>
        <div>Please ask your administrator to grant you the right permissions</div>
      </div>
      <div>
        <v-btn
          class="mt-2"
          data-cy="goBackToLogin"
          color="primary"
          @click="routeToLogin"
        >
          Go back to login page
        </v-btn>
      </div>
    </div>
  </div>
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
