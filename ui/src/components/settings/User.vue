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
          Users
        </div>
        <v-divider class="mt-2 mb-7" />
        <div />
        <div class="text-h5 mb-3 font-weight-medium">
          Overview
        </div>
        <span class="font-weight-bold">Users</span> section allows you to create and modify users in Tower, assign them
        to groups and create technical users.
        <v-divider class="my-2" />
      </div>
      <div class="mt-4">
        <div class="text-h5 font-weight-medium">
          New user
        </div>
        To create a new user account, you just need to fill in the <span class="font-weight-bold">User</span> input and
        click on the <kbd>+</kbd> button.
        <gif
          src="Users_create_user.gif"
          alt="New user"
        />
      </div>
      <v-divider class="my-2" />
      <div class="text-h5 font-weight-medium">
        User Groups
      </div>
      <div class="mt-4">
        User can be assigned to any number of <router-link :to="{name: 'Settings', hash: '#base'}">
          groups
        </router-link>. Each group (defined by the administrator) gives different permissions to user.
        <div>
          To assign group to the user, you will need to click on the 'User groups' input and
          choose which group you want your user to be assigned to.
        </div>
      </div>
      <gif
        src="Users_add_to_group.gif"
        alt="Add user to group"
      />
      <v-divider class="my-2" />
      <div class="text-h5 font-weight-medium">
        Technical User
      </div>
      <div class="mt-4">
        Sometimes you may want your user to act as a 'technical' one to use it in your API, CI/CD or other scripts.
        In that case you wound need that user to have API token which will not expire.
        There is a special switch for such cases called 'Technical user'.
      </div>
      <gif
        src="Users_technical_user.gif"
        alt="Set user as technical"
      />
    </template>
    <div class="d-flex justify-center">
      <div class="halfWidth">
        <v-autocomplete
          ref="userSelect"
          v-model="user.current"
          :search-input.sync="user.text"
          :items="user.items"
          :append-outer-icon="icons.mdiPlus"
          class="pa-2"
          label="User"
          item-text="display"
          clearable
          autocomplete="off"
          return-object
          @click:append-outer="addUser"
          @change="onUserChange"
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
      v-if="user.current !== null && user.current !== undefined"
      class="pa-2"
    >
      <v-autocomplete
        v-model="groups.current"
        :items="groups.items"
        chips
        item-text="name"
        label="User groups"
        class="mx-3"
        return-object
        multiple
        @change="onGroupChange"
      />
      <v-switch
        v-model="user.current.technicalUser"
        label="Technical user"
        color="primary"
        class="px-2"
        @change="onTechnicalChange"
      />
      <v-text-field
        v-if="user.current.technicalUser"
        v-model="user.token"
        :readonly="true"
        class="px-2"
        label="Techincal user access token"
      />
    </div>
    <v-dialog
      v-model="dialog.show"
      width="500"
      persistent
    >
      <v-card>
        <v-card-title
          primary-title
          class="headline primary"
          v-text="dialog.title"
        />
        <v-card-text
          class="mt-5"
          v-html="dialog.text"
        />
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            text
            @click="dialog.show = false"
          >
            Ok
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </uiCard>
</template>

<script>
  import { mdiPlus } from '@mdi/js'
  import uiCard from '../base/uiCard'
  import gif from '../base/gif'

  export default {
    name: 'User',
    components: {
      uiCard,
      gif,
    },
    data: () => ({
      user: {
        items: [],
        current: null,
        text: null,
        token: null,
      },

      icons: {
        mdiPlus,
      },

      groups: {
        items: [],
        current: null,
      },

      dialog: {
        show: false,
        text: null,
        title: null,
      },

      newPassword: 'changeme',
    }),
    computed: {
      noDataText () {
        if (this.user.text !== null) {
          return `No results matching <strong>${this.user.text}</strong>. 
          Press <kbd>+</kbd> button on the right to create user with this name`
        } else {
          return 'Type name and press <kbd>+</kbd> button to create new user'
        }
      },
    },
    mounted () {
      this.resetData()
    },
    methods: {
      async resetData () {
        this.user.current = null
        this.groups.current = null

        const response = await this.axios.get(
          `${this.$store.state.mainUrl}/members?filter={"where":{"username":{"neq":"admin"}}}`,
        )

        const groupsRes = await this.axios.get(
          `${this.$store.state.mainUrl}/groups`,
        )

        this.groups.items = groupsRes.data
        this.user.items = response.data

        this.user.items.map(user => {
          user.display = user.display === undefined ? user.username : user.display
        })
      },
      async addUser () {
        const response = await this.axios.post(
          `${this.$store.state.mainUrl}/members`,
          {
            username: this.user.text,
            newUser: true,
            technicalUser: false,
            password: this.newPassword,
            groups: [],
          },
        )

        response.data.display = this.user.text

        this.user.items.push(response.data)
        this.user.current = response.data

        this.onUserChange()

        this.$refs.userSelect.isMenuActive = false

        this.dialog.text = `User <b>${this.user.text}</b> has been created with password "<b>${this.newPassword}</b>"`
        this.dialog.text += '<br/>New user will be prompted to change this password during first login'
        this.dialog.title = 'New user'
        this.dialog.show = true
      },
      async onUserChange () {
        this.groups.current = []
        this.groups.items.forEach(group => {
          if (this.user.current.groups.includes(group.name)) {
            this.groups.current.push(group)
          }
        })

        await this.setToken()
      },
      async setToken () {
        this.user.token = null
        if (this.user.current.technicalUser) {
          const response = await this.axios.get(
            `${this.$store.state.mainUrl}/members/getTechnicalUserToken?userId=${this.user.current.id}`,
          )

          this.user.token = response.data
        }
      },
      async onGroupChange () {
        this.user.current.groups = []
        this.groups.current.forEach(group => {
          this.user.current.groups.push(group.name)
        })

        await this.axios.patch(
          `${this.$store.state.mainUrl}/members`,
          this.user.current,
        )
      },
      async onTechnicalChange () {
        await this.axios.post(
          `${this.$store.state.mainUrl}/members/setAsTechnicalUser?isTechUser=${
            this.user.current.technicalUser}&userId=${this.user.current.id}`,
        )

        await this.setToken()
      },
    },
  }
</script>

<style scoped>
.halfWidth {
  width: 50%;
}

.borderedbox {
  border: solid;
  border-width: 1px;
  border-color: lightgray;
}
</style>
