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
  <v-card>
    <v-tabs
      v-model="tab"
      icons-and-text
      grow
    >
      <v-tab
        href="#users"
        data-cy="users"
      >
        Users
        <v-icon>{{ icons.mdiAccount }}</v-icon>
      </v-tab>
      <v-tab
        href="#groups"
        data-cy="groups"
      >
        Groups
        <v-icon>{{ icons.mdiAccountGroup }}</v-icon>
      </v-tab>
      <v-tab
        href="#base"
        data-cy="baseModel"
      >
        Base Models
        <v-icon>{{ icons.mdiDatabaseEdit }}</v-icon>
      </v-tab>
      <v-tab
        href="#rest"
        data-cy="rest"
      >
        Rest Configuration
        <v-icon>{{ icons.mdiTransitConnection }}</v-icon>
      </v-tab>
      <v-tab
        href="#hooks"
        data-cy="hooks"
      >
        Hooks
        <v-icon>{{ icons.mdiHook }}</v-icon>
      </v-tab>
      <v-tab
        href="#permissions"
        data-cy="permissions"
      >
        Permissions
        <v-icon>{{ icons.mdiSecurity }}</v-icon>
      </v-tab>
      <v-tab
        href="#promotion"
        data-cy="promotion"
      >
        Promotions
        <v-icon>{{ icons.mdiPackageUp }}</v-icon>
      </v-tab>
      <v-tab
        href="#connections"
        data-cy="connections"
      >
        Connections
        <v-icon>{{ icons.mdiFolderKeyNetworkOutline }}</v-icon>
      </v-tab>
    </v-tabs>

    <v-divider />

    <v-tabs-items v-model="tab">
      <v-tab-item value="users">
        <user ref="users" />
      </v-tab-item>
      <v-tab-item value="groups">
        <groups-settings ref="groups" />
      </v-tab-item>
      <v-tab-item value="base">
        <base-model-settings ref="base" />
      </v-tab-item>
      <v-tab-item value="rest">
        <rest-model-settings ref="rest" />
      </v-tab-item>
      <v-tab-item value="hooks">
        <hooks-settings ref="hooks" />
      </v-tab-item>
      <v-tab-item value="permissions">
        <permissions-settings ref="permissions" />
      </v-tab-item>
      <v-tab-item value="promotion">
        <promotion-settings ref="promotion" />
      </v-tab-item>
      <v-tab-item value="connections">
        <connections-settings ref="connections" />
      </v-tab-item>
    </v-tabs-items>
  </v-card>
</template>

<script>
  import User from '../components/settings/User'
  import BaseModelSettings from '../components/settings/Base'
  import RestModelSettings from '../components/settings/Rest'
  import HooksSettings from '../components/settings/Hook'
  import PermissionsSettings from '../components/settings/Permissions'
  import PromotionSettings from '../components/settings/Promotion'
  import GroupsSettings from '../components/settings/Group'
  import ConnectionsSettings from '../components/settings/Connection'

  import {
    mdiAccount, mdiAccountGroup, mdiDatabaseEdit,
    mdiTransitConnection, mdiHook, mdiSecurity, mdiPackageUp, mdiFolderKeyNetworkOutline
  } from '@mdi/js'

  export default {
    name: 'Settings',
    components: {
      User,
      BaseModelSettings,
      RestModelSettings,
      HooksSettings,
      PermissionsSettings,
      PromotionSettings,
      GroupsSettings,
      ConnectionsSettings
    },
    data: () => ({
      tab: null,
      icons: {
        mdiAccount,
        mdiAccountGroup,
        mdiDatabaseEdit,
        mdiTransitConnection,
        mdiHook,
        mdiSecurity,
        mdiPackageUp,
        mdiFolderKeyNetworkOutline
      }
    }),
    watch: {
      tab (actual) {
        if (this.$refs[actual] !== undefined) {
          this.$refs[actual].resetData()
        }
      }
    },
    mounted () {
      let tab = this.$route.hash
      if (tab) {
        tab = tab.slice(1, tab.length)
        this.tab = tab
      }
    }
  }
</script>
