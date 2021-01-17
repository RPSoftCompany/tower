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
//    along with Tower. If not, see http://www.gnu.org/licenses/.

<template>
  <v-navigation-drawer
    :mini-variant.sync="mini"
    absolute
    permanent
    clipped
    expand-on-hover
    class="elevation-5 transition"
    mini-variant-width="55"
    style="padding-top:48px; position: fixed"
  >
    <v-list
      v-if="mainLinksPerm.length > 0"
      dense
    >
      <v-list-item
        v-for="obj of mainLinksPerm"
        :key="obj.name"
        :to="obj.path"
        :class="{ maxWidth: mini, fullWidth: !mini }"
        :data-cy="`configuration-${obj.name}`"
        link
        color="primary"
      >
        <v-list-item-icon class="maxWidth">
          <v-icon
            class="text-left"
            style="min-width: 24px"
          >
            {{ obj.icon }}
          </v-icon>
          <span :class="{ 'v-list-item__title': true, 'hidden': mini, 'shown': !mini }">{{ obj.name }}</span>
        </v-list-item-icon>
      </v-list-item>
    </v-list>
    <v-divider v-if="mainLinksPerm.length > 0" />
    <v-list
      dense
    >
      <v-list-item
        v-for="obj of archiveLinks"
        :key="obj.name"
        :to="obj.path"
        :class="{ maxWidth: mini, fullWidth: !mini }"
        link
        color="primary"
      >
        <v-list-item-icon class="maxWidth">
          <v-icon
            class="text-left"
            style="min-width: 24px"
          >
            {{ obj.icon }}
          </v-icon>
          <span :class="{ 'v-list-item__title': true, 'hidden': mini, 'shown': !mini }">{{ obj.name }}</span>
        </v-list-item-icon>
      </v-list-item>
    </v-list>
    <v-divider />
    <v-list
      v-if="baseModelLinks.length > 0"
      dense
    >
      <v-list-item
        v-for="obj of baseModelLinks"
        :key="obj.name"
        :data-cy="`menuBase-${obj.name}`"
        :to="obj.path"
        :class="{ maxWidth: mini }"
        link
        color="primary"
      >
        <v-list-item-icon class="maxWidth">
          <v-icon
            class="text-left"
            style="min-width: 24px"
          >
            {{ obj.icon }}
          </v-icon>
          <span :class="{ 'v-list-item__title': true, 'hidden': mini, 'shown': !mini }">{{ obj.name }}</span>
        </v-list-item-icon>
      </v-list-item>
    </v-list>
    <v-divider v-if="baseModelLinks.length > 0" />
    <v-list
      v-if="isAdmin"
      dense
    >
      <v-list-item
        key="Settings"
        :class="{ maxWidth: mini }"
        link
        to="/settings"
        color="primary"
      >
        <v-list-item-icon class="maxWidth">
          <v-icon
            class="text-left"
            style="min-width: 24px"
          >
            {{ configurationIcon }}
          </v-icon>
          <span :class="{ 'v-list-item__title': true, 'hidden': mini, 'shown': !mini }">Settings</span>
        </v-list-item-icon>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
  import { mdiArchive, mdiSettings, mdiTune, mdiCalendarClock } from '@mdi/js'

  export default {
    name: 'Drawer',
    data: () => ({
      mini: true,
      mainLinks: [
        {
          name: 'Configuration',
          path: '/configuration',
          icon: mdiSettings,
        },
      ],
      archives: [{
        name: 'Version Archive',
        path: '/archive',
        icon: mdiArchive,
      }, {
        name: 'Time Archive',
        path: '/timearchive',
        icon: mdiCalendarClock,
      }],
      baseModelLinks: [],
      configurationIcon: mdiTune,
    }),
    computed: {
      isAdmin () {
        return (
          this.$store.state.user.username === 'admin' ||
          this.$store.state.userRoles.includes('admin')
        )
      },
      mainLinksPerm () {
        let roles = this.$store.state.userRoles

        if (this.isAdmin) {
          return this.mainLinks
        }

        if (roles === null) {
          roles = []
        }

        const links = []

        if (roles.includes('configuration.modify')) {
          links.push(this.mainLinks[0])
        }

        return links
      },
      archiveLinks () {
        let roles = this.$store.state.userRoles

        if (this.isAdmin) {
          return this.archives
        }

        if (roles === null) {
          roles = []
        }

        if (roles.includes('configuration.view')) {
          return this.archives
        }

        return []
      },
    },
    watch: {
      $route () {
        this.updateBaseLinks()
      },
    },
    created () {
      this.updateBaseLinks()
      this.$eventHub.$on('updateIcons', this.updateIcons)
    },
    beforeDestroy () {
      this.$eventHub.$off('updateIcons')
    },
    methods: {
      hasAdminPrivs () {
        if (this.$store.state.user.username === 'admin') {
          return true
        } else {
          if (this.$store.state.userRoles.includes('admin')) {
            return true
          }
        }

        return false
      },
      changePage (link) {
        this.$router.push(link)
      },
      async updateBaseLinks () {
        if (this.$store.state.user === null) {
          return
        }

        const links = []
        const base = await this.axios.get(
          `${this.$store.state.mainUrl}/baseConfigurations?filter={"order":"sequenceNumber ASC"}`,
        )

        base.data.forEach(el => {
          if (
            (this.$store.state.userRoles.includes('configurationModel.view')) ||
            this.hasAdminPrivs()
          ) {
            links.push({
              name: el.name,
              path: `/base/${el.name}`,
              icon: el.icon,
            })
          }
        })

        const diff = false
        links.forEach(link => {
          return this.baseModelLinks.some(baseLink => {
            return baseLink.name === link.name
          })
        })

        if (!diff) {
          this.baseModelLinks = links
        }
      },
      async updateIcons () {
        const base = await this.axios.get(
          `${this.$store.state.mainUrl}/baseConfigurations?filter={"order":"sequenceNumber ASC"}`,
        )

        this.baseModelLinks = []

        base.data.forEach(el => {
          this.baseModelLinks.push({
            name: el.name,
            path: `/base/${el.name}`,
            icon: el.icon,
          })
        })
      },
    },
  }
</script>

<style>
.icon:before {
  font-family: sans-serif;
}

.maxWidth {
  width: 100%;
  transition: all 0.3s ease-out;
}

.hidden {
  margin-left: 0px;
  opacity: 0;
  width: 0%;
  transition: all 0.3s ease-out;
}

.shown {
  margin-left: 32px;
  opacity: 1;
  transition: all 0.4s ease-out;
}

.transition {
  transition: width 0.4s ease-out !important;
}
</style>
