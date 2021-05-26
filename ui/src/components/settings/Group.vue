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
  <uiCard
    flat
    class="pt-4"
  >
    <template v-slot:help>
      <div class="mt-4">
        <div class="text-h4 font-weight-bold text-uppercase">
          Groups
        </div>
        <v-divider class="mt-2 mb-7" />
        <div />
        <div class="text-h5 mb-3 font-weight-medium">
          Overview
        </div>
        <span class="font-weight-bold">Groups</span> section allows you to create and modify groups in Tower. Right here
        you can assign different permissions to groups and
        <v-divider class="my-2" />
        <div class="text-h5 font-weight-medium">
          New group
        </div>
        To create a new group, you just need to fill in the <span class="font-weight-bold">Group</span> input and
        click on the <kbd>+</kbd> button.
        <gif
          src="Groups_create_group.gif"
          alt="Create new group"
        />
        <v-divider class="my-2" />
        <div class="text-h5 font-weight-medium">
          Add permissions to group
        </div>
        You can freely modify the permissions in any group by selecting it and choosing the role from the
        <span class="font-weight-bold">Group Roles</span> input.
        <gif
          src="Groups_modify_group.gif"
          alt="Create new group"
        />
      </div>
    </template>
    <div class="d-flex justify-center">
      <div class="halfWidth">
        <v-autocomplete
          ref="groupSelect"
          v-model="group.current"
          :search-input.sync="group.text"
          :items="group.items"
          :append-outer-icon="icons.mdiPlus"
          class="pa-2"
          label="Group"
          item-text="name"
          clearable
          autocomplete="off"
          return-object
          @click:append-outer="addGroup"
          @change="onGroupChange"
        >
          <template slot="no-data">
            <div
              class="pa-3"
              v-html="noDataText"
            />
          </template>
        </v-autocomplete>
      </div>
    </div>
    <div
      v-if="group.current !== null && group.current !== undefined"
      class="pa-2"
    >
      <v-autocomplete
        v-model="role.current"
        :items="role.items"
        chips
        return-object
        multiple
        item-text="name"
        label="Group Roles"
        class="mx-3"
        @change="onRoleChange"
      />
    </div>
  </uiCard>
</template>

<script>
  import { mdiPlus } from '@mdi/js'
  import uiCard from '../base/uiCard'
  import gif from '../base/gif'

  export default {
    name: 'GroupsSettings',
    components: {
      uiCard,
      gif,
    },
    data: () => ({
      icons: {
        mdiPlus,
      },
      group: {
        current: null,
        items: [],
        text: null,
      },
      role: {
        current: null,
        prev: [],
        items: [],
      },
    }),
    computed: {
      noDataText () {
        if (this.group.text !== null) {
          return `No results matching <strong>${this.group.text
          }</strong>. Press <kbd>+</kbd> button on the right to create group with this name`
        } else {
          return 'Type name and press <kbd>+</kbd> button to create new group'
        }
      },
    },
    async mounted () {
      await this.resetData()
    },
    methods: {
      async resetData () {
        this.role.prev = []
        this.group.current = null
        const response = await this.axios.get(
          `${this.$store.state.mainUrl}/Groups?filter={"order":"name ASC"}`,
        )

        this.group.items = response.data

        const roleResponse = await this.axios.get(
          `${this.$store.state.mainUrl}/Roles?filter={"order":"name ASC"}`,
        )

        this.role.items = roleResponse.data
      },
      async addGroup () {
        if (this.group.text === null || this.group.text === '') {
          return
        }
        const response = await this.axios.post(
          `${this.$store.state.mainUrl}/Groups`,
          {
            name: this.group.text,
            roles: [],
          },
        )

        this.$refs.groupSelect.isMenuActive = false
        this.group.items.push(response.data)
        this.group.current = response.data
      },
      onGroupChange () {
        this.role.current = []
        this.role.prev = []
        this.role.items.forEach(role => {
          if (this.group.current !== undefined) {
            if (this.group.current.roles.includes(role.name)) {
              this.role.current.push(role)
              this.role.prev.push(role)
            }
          }
        })
      },
      async onRoleChange (change) {
        this.group.current.roles = []
        this.role.current.forEach(role => {
          this.group.current.roles.push(role.name)
        })

        const biggerArray = change.length > this.role.prev.length ? change : this.role.prev
        const removeArray = change.length < this.role.prev.length ? change : this.role.prev

        const diff = biggerArray.filter(el => {
          return !removeArray.includes(el)
        })

        if (diff.length > 0) {
          if (change.length > this.role.prev.length) {
            await this.axios.post(`${this.$store.state.mainUrl}/groups/${
              this.group.current.id}/role?role=${diff[0].name}`)
          } else {
            await this.axios.delete(`${this.$store.state.mainUrl}/groups/${
              this.group.current.id}/role?role=${diff[0].name}`)
          }
        }

        this.role.prev = change
      },
    },
  }
</script>

<style lang="scss" scoped>
.halfWidth {
  width: 50%;
}
</style>
