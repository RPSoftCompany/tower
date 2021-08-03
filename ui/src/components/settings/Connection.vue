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
  <v-card
    flat
    class="py-3 px-3"
  >
    <v-expansion-panels>
      <v-expansion-panel>
        <v-expansion-panel-header>
          <template v-slot:default>
            <v-row no-gutters>
              <v-col cols="12">
                LDAP
              </v-col>
            </v-row>
          </template>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-divider />
          <v-form ref="ldapForm">
            <v-row align="center">
              <v-col
                cols="12"
                class="conn_row"
              >
                <v-checkbox
                  v-model="ldap.enabled"
                  color="primary"
                  label="Enabled"
                  @change="updateLdap"
                />
              </v-col>
              <v-col
                class="d-flex conn_row"
                cols="12"
              >
                <v-text-field
                  v-model="ldap.url"
                  :disabled="!ldap.enabled"
                  :hint="ldap.urlHint"
                  :rules="[ldap.rules.validateUrl]"
                  autocomplete="off"
                  label="URL"
                  @blur="updateLdap"
                />
              </v-col>
              <v-col
                class="d-flex conn_row"
                cols="12"
              >
                <v-text-field
                  v-model="ldap.searchBase"
                  :hint="ldap.baseHint"
                  :rules="[ldap.rules.required]"
                  :disabled="!ldap.enabled"
                  label="Base DN"
                  autocomplete="off"
                  @blur="updateLdap"
                />
              </v-col>
              <v-col
                class="d-flex conn_row"
                cols="6"
              >
                <v-text-field
                  v-model="ldap.bindDN"
                  :hint="ldap.bindHint"
                  :rules="[ldap.rules.required]"
                  :disabled="!ldap.enabled"
                  label="User DN"
                  autocomplete="off"
                  @blur="updateLdap"
                />
              </v-col>
              <v-col
                class="d-flex conn_row"
                cols="6"
              >
                <v-text-field
                  v-model="ldap.bindCred"
                  :rules="[ldap.rules.required]"
                  :disabled="!ldap.enabled"
                  name="other"
                  autocomplete="off"
                  label="Password"
                  type="password"
                  @blur="updateLdap"
                />
              </v-col>
              <v-col
                class="d-flex conn_row"
                cols="6"
              >
                <v-text-field
                  v-model="ldap.usernameAttribute"
                  :rules="[ldap.rules.required]"
                  :disabled="!ldap.enabled"
                  :hint="ldap.userAttrHint"
                  label="Username attribute"
                  autocomplete="off"
                  @blur="updateLdap"
                />
              </v-col>
              <v-col
                class="d-flex conn_row"
                cols="6"
              >
                <v-text-field
                  v-model="ldap.displayAttribute"
                  :rules="[ldap.rules.required]"
                  :disabled="!ldap.enabled"
                  :hint="ldap.displayAttrHint"
                  label="Display attribute"
                  autocomplete="off"
                  @blur="updateLdap"
                />
              </v-col>
              <v-col
                class="d-flex mt-3"
                cols="2"
              >
                <v-btn
                  :disabled="!ldap.enabled"
                  color="primary"
                  @click="testLdapConnection"
                >
                  Test Connection
                </v-btn>
              </v-col>
            </v-row>
          </v-form>
        </v-expansion-panel-content>
      </v-expansion-panel>
      <v-expansion-panel>
        <v-expansion-panel-header>
          <template v-slot:default>
            Vault
          </template>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-divider />
          <v-form ref="vaultForm">
            <v-row
              align="center"
              class="pb-3 my-3"
            >
              <v-col
                cols="12"
                class="conn_row"
              >
                <v-checkbox
                  v-model="Vault.enabled"
                  color="primary"
                  label="Enabled"
                  @change="updateVault"
                />
              </v-col>
              <v-col
                class="d-flex conn_row"
                cols="12"
              >
                <v-text-field
                  v-model="Vault.url"
                  :hint="Vault.urlHint"
                  :disabled="!Vault.enabled"
                  label="URL"
                  autocomplete="off"
                  @blur="updateVault"
                />
              </v-col>
              <v-col
                class="d-flex conn_row"
                cols="12"
              >
                <v-switch
                  v-model="Vault.switch"
                  :disabled="!Vault.enabled"
                  color="primary"
                  label="Use global token"
                  @change="updateVault"
                />
              </v-col>
              <v-col
                v-if="Vault.switch"
                class="d-flex conn_row"
                cols="12"
                @change="updateVault"
              >
                <v-text-field
                  v-model="Vault.token"
                  :disabled="!Vault.enabled"
                  label="Global token"
                  autocomplete="off"
                  @blur="updateVault"
                />
              </v-col>
              <v-col
                v-else
                cols="12"
              >
                <v-expansion-panels v-if="Vault.enabled">
                  <v-expansion-panel
                    v-for="base of Vault.bases"
                    :key="base.id"
                  >
                    <v-expansion-panel-header class="d-flex flex-row">
                      <v-icon style="maxWidth: 40px">
                        {{ base.icon }}
                      </v-icon>
                      <span class="ml-3">{{ base.name }}</span>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content>
                      <v-data-table
                        :headers="Vault.tokens.headers"
                        :items="Vault.tokens[base.name].items"
                        class="elevation-1"
                      >
                        <template v-slot:item.token="props">
                          <v-text-field
                            v-model="props.item.token"
                            label="Token"
                            @blur="saveToken"
                          />
                        </template>
                      </v-data-table>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </v-expansion-panels>
              </v-col>
              <v-col
                class="d-flex mt-3"
                cols="2"
              >
                <v-btn
                  :disabled="!Vault.enabled"
                  color="primary"
                  @click="testVaultConnection"
                >
                  Test Connection
                </v-btn>
              </v-col>
            </v-row>
          </v-form>
        </v-expansion-panel-content>
      </v-expansion-panel>
      <v-expansion-panel>
        <v-expansion-panel>
          <v-expansion-panel-header>
            SCP
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-divider />
            <v-form>
              <v-row>
                <v-col
                  class="d-flex mt-3"
                  cols="12"
                >
                  <v-btn
                    color="primary"
                    @click="addScpConnection"
                  >
                    Add SCP Connection
                  </v-btn>
                </v-col>
                <v-col cols="12">
                  <v-expansion-panels v-model="scp.panel">
                    <v-expansion-panel
                      v-for="connection of scp.connections"
                      :key="connection.id"
                    >
                      <v-expansion-panel-header>
                        <template v-slot:default>
                          {{ connection.username }}@{{ connection.host }}
                        </template>
                      </v-expansion-panel-header>
                      <v-expansion-panel-content>
                        <v-divider class="mb-2" />
                        <v-form :ref="`SCPForm-${connection.id}`">
                          <v-row>
                            <v-col
                              cols="5"
                              class="pb-0"
                            >
                              <v-text-field
                                v-model="connection.host"
                                label="Host"
                                autocomplete="off"
                                :rules="[scp.rules.required]"
                                @blur="saveSCPConnection(connection)"
                              />
                            </v-col>
                            <v-col
                              cols="5"
                              offset="2"
                              class="pb-0"
                            >
                              <v-text-field
                                v-model="connection.username"
                                label="User name"
                                autocomplete="off"
                                :rules="[scp.rules.required]"
                                @blur="saveSCPConnection(connection)"
                              />
                            </v-col>
                          </v-row>
                          <v-row
                            class="scpAuth mt-6"
                          >
                            <div class="scpAuthLabel px-2">
                              Authentication
                            </div>
                            <v-col
                              cols="2"
                              class="py-0"
                            >
                              <v-radio-group
                                v-model="connection.authTypeRadio"
                                dense
                              >
                                <v-radio
                                  label="SSH Key"
                                  dense
                                />
                                <v-radio
                                  label="Password"
                                  dense
                                />
                              </v-radio-group>
                            </v-col>
                            <v-col
                              v-if="connection.authTypeRadio === 0"
                              cols="10"
                            >
                              <v-text-field
                                v-model="connection.key"
                                label="SSH key"
                                autocomplete="off"
                                type="password"
                                :rules="[scp.rules.required]"
                                @blur="saveSCPConnection(connection)"
                              />
                            </v-col>
                            <v-col
                              v-else
                              cols="10"
                            >
                              <v-text-field
                                v-model="connection.password"
                                label="Password"
                                type="password"
                                autocomplete="off"
                                :rules="[ldap.rules.required]"
                                @blur="saveSCPConnection(connection)"
                              />
                            </v-col>
                          </v-row>
                          <v-row>
                            <v-col cols="12">
                              <v-data-table
                                :headers="scp.headers"
                                :items="connection.items"
                              >
                                <template v-slot:header.name="{ header }">
                                  {{ header.text.toUpperCase() }}
                                </template>
                                <template v-slot:top>
                                  <v-toolbar
                                    flat
                                  >
                                    <v-toolbar-title>Connection models</v-toolbar-title>
                                    <v-spacer />
                                    <v-dialog
                                      v-model="scp.addItemDialog"
                                      max-width="80%"
                                    >
                                      <template v-slot:activator="{ on, attrs }">
                                        <v-btn
                                          color="primary"
                                          dark
                                          class="mb-2"
                                          v-bind="attrs"
                                          v-on="on"
                                          @click="resetSCPNewItem"
                                        >
                                          Add Connection model
                                        </v-btn>
                                      </template>
                                      <v-card>
                                        <v-card-title class="primary">
                                          <span
                                            class="headline"
                                          >Add Connection model</span>
                                        </v-card-title>
                                        <v-card-text>
                                          <v-row>
                                            <v-col
                                              v-for="(base, baseName) of scp.availableBases"
                                              :key="baseName"
                                              :cols="12 / scp.availableBases.length"
                                            >
                                              <v-autocomplete
                                                v-model="scp.newItem[baseName]"
                                                :label="baseName"
                                                :items="base"
                                                autocomplete="off"
                                                @change="SCPNewItemSaveDisabled"
                                              />
                                            </v-col>
                                          </v-row>
                                          <v-row>
                                            <v-col
                                              cols="12"
                                            >
                                              <v-text-field
                                                v-model="scp.newItem.path"
                                                label="Path"
                                                autocomplete="new-password"
                                                hint="eg. /apps/myApplication/configuration.json"
                                                @keyup="SCPNewItemSaveDisabled"
                                              />
                                            </v-col>
                                          </v-row>
                                          <v-row>
                                            <v-col
                                              cols="12"
                                            >
                                              <v-autocomplete
                                                v-model="scp.newItem.template"
                                                :items="scp.restTemplates"
                                                return-object
                                                item-text="url"
                                                autocomplete="off"
                                                label="Template"
                                                @change="SCPNewItemSaveDisabled"
                                              />
                                            </v-col>
                                          </v-row>
                                          <v-card-actions>
                                            <span
                                              v-if="scp.identical"
                                              class="error--text font-weight-bold text-h6"
                                            >
                                              Connection with identical properties exists already</span>
                                            <v-spacer />
                                            <v-btn
                                              text
                                              @click="scp.addItemDialog = false"
                                            >
                                              Cancel
                                            </v-btn>
                                            <v-btn
                                              color="primary"
                                              text
                                              :disabled="scp.newItemSaveDisabled"
                                              @click="saveNewSCPItem(connection)"
                                            >
                                              Save
                                            </v-btn>
                                          </v-card-actions>
                                        </v-card-text>
                                      </v-card>
                                    </v-dialog>
                                  </v-toolbar>
                                </template>
                                <template v-slot:item.actions="{ item }">
                                  <v-icon
                                    small
                                    class="mr-2"
                                    @click="openEditSCPDialog(item, connection)"
                                  >
                                    {{ icons.mdiPencil }}
                                  </v-icon>
                                  <v-icon
                                    small
                                    @click="deleteSCPItem(item, connection)"
                                  >
                                    {{ icons.mdiDelete }}
                                  </v-icon>
                                </template>
                                <template v-slot:no-data>
                                  Click 'New Connection Model' button to add the connection
                                </template>
                              </v-data-table>
                            </v-col>
                          </v-row>
                        </v-form>
                      </v-expansion-panel-content>
                    </v-expansion-panel>
                  </v-expansion-panels>
                </v-col>
              </v-row>
            </v-form>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panel>
    </v-expansion-panels>
    <v-dialog
      v-model="showTestDialog"
      width="500"
      persistent
    >
      <v-card>
        <v-card-title
          primary-title
          class="headline primary"
        >
          Success
        </v-card-title>
        <v-card-text class="mt-5">
          Connection established successfully
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            text
            @click="showTestDialog = false"
          >
            Ok
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
  import { mdiRegex, mdiPencil, mdiDelete } from '@mdi/js'

  export default {
    name: 'ConnectionsSettings',
    data: () => ({
      showTestDialog: false,

      icons: {
        mdiRegex,
        mdiPencil,
        mdiDelete
      },

      ldap: {
        id: null,
        url: null,
        enabled: false,
        bindDN: null,
        bindCred: null,
        searchBase: null,
        usernameAttribute: null,
        displayAttribute: null,

        filterHint: "eg. '(cn={{username}})'",
        baseHint: "eg. 'dc=example,dc=org'",
        bindHint: "eg. 'cn=admin,dc=example,dc=org'",
        urlHint: "eg. 'ldap://localhost:389'",
        userAttrHint: "eg. 'cn'",
        displayAttrHint: "eg. 'cn'",

        rules: {
          validateUrl: value =>
            /^ldap[s]*:\/\/.+/.test(value) ||
            value === '' ||
            "Invalid URL, eg. 'ldap://localhost:389'",
          required: value => !!value || 'Required.'
        }
      },
      Vault: {
        url: null,
        enabled: false,
        globalToken: null,

        switch: true,

        bases: [],
        tokens: {
          headers: [{
                      text: 'Model',
                      align: 'left',
                      value: 'name'
                    },
                    {
                      text: 'Token',
                      align: 'left',
                      value: 'token'
                    }],
          items: {},
          filter: {}
        },

        urlHint: "eg. 'http://localhost:8200'"
      },
      scp: {
        restTemplates: [],
        panel: undefined,
        headers: [],
        identical: false,
        addItemDialog: false,
        newItem: {},
        newItemSaveDisabled: true,
        editItemId: -1,
        connections: [],
        availableBases: {},
        rules: {
          required: value => !!value || 'Required.'
        }
      }
    }),
    async mounted () {
      await this.resetData()
    },
    methods: {
      async resetData () {
        this.Vault.bases = []

        const response = await this.axios.get(
          `${this.$store.state.mainUrl}/connections`
        )

        this.scp.connections = []

        const basesResponse = await this.axios.get(
          `${this.$store.state.mainUrl}/baseConfigurations?filter={"order":"sequenceNumber ASC"}`
        )

        const allBasesResponse = await this.axios.get(
          `${this.$store.state.mainUrl}/configurationModels?filter={"order":"name ASC"}`
        )

        const restConfigurationsResponse = await this.axios.get(
          `${this.$store.state.mainUrl}/restConfigurations?filter={"order":"url ASC"}`
        )

        this.scp.restTemplates = restConfigurationsResponse.data

        this.scp.availableBases = {}
        this.scp.headers = []

        for (const base of basesResponse.data) {
          this.scp.availableBases[base.name] = []
          this.scp.newItem[base.name] = null
          this.scp.headers.push({
            text: base.name,
            value: base.name
          })
        }

        this.scp.headers.push({
          text: 'Path',
          value: 'path'
        })
        this.scp.headers.push({
          text: 'Template',
          value: 'template.url'
        })
        this.scp.headers.push({
          text: 'Actions',
          value: 'actions',
          sortable: false,
          align: 'end'
        })

        allBasesResponse.data.forEach(el => {
          if (this.scp.availableBases[el.base]) {
            this.scp.availableBases[el.base].push(el.name)
          }
        })

        response.data.forEach(el => {
          const temp = el
          temp.enabled = temp.enabled ? temp.enabled : false

          if (temp.system === 'LDAP') {
            this.ldap.enabled = temp.enabled
            this.ldap.id = temp.id
            this.ldap.url = temp.url
            this.ldap.bindDN = temp.bindDN === undefined ? null : temp.bindDN
            this.ldap.bindCred =
              temp.bindCredentials === undefined ? null : temp.bindCredentials
            this.ldap.searchBase =
              temp.searchBase === undefined ? null : temp.searchBase
            this.ldap.usernameAttribute = temp.usernameAttribute === undefined ? null : temp.usernameAttribute
            this.ldap.displayAttribute = temp.displayAttribute === undefined ? null : temp.displayAttribute
          } else if (temp.system === 'Vault') {
            this.Vault.enabled = temp.enabled
            this.Vault.id = temp.id
            this.Vault.url = temp.url
            this.Vault.globalToken =
              temp.globalToken === undefined ? null : temp.globalToken
            this.Vault.tokens.items =
              temp.tokens === undefined ? [] : temp.tokens
            this.Vault.switch = temp.useGlobalToken === undefined ? false : temp.useGlobalToken
          } else if (temp.system === 'SCP') {
            const item = {
              id: temp.id,
              host: temp.host,
              username: temp.username,
              authTypeRadio: temp.authType === 'userpass' ? 1 : 0,
              password: temp.password,
              key: temp.key,
              items: temp.items
            }

            this.scp.connections.push(item)
          }
        })

        basesResponse.data.forEach(el => {
          this.Vault.bases.push(el)
          this.Vault.tokens[el.name] = {
            items: []
          }
        })

        const modelsResponse = await this.axios.get(
          `${this.$store.state.mainUrl}/configurationModels?filter={"order":"name ASC"}`
        )

        modelsResponse.data.forEach(el => {
          this.Vault.tokens[el.base].items.push({
            base: el.base,
            name: el.name,
            token: null
          })
        })

        this.Vault.tokens.items.forEach(el => {
          this.Vault.tokens[el.base].items.map(item => {
            if (item.name === el.name) {
              item.token = el.token
            }
          })
        })
      },
      async testLdapConnection () {
        if (this.checkIfLdapValuesFilled() && this.$refs.ldapForm.validate()) {
          const response = await this.axios.get(
            `${this.$store.state.mainUrl}/connections/testConnection?type=LDAP`,
            {
              timeout: 10000
            }
          )

          if (response) {
            if (response.status === 200) {
              this.showTestDialog = true
            }
          }
        }
      },
      checkIfLdapValuesFilled () {
        return (
          this.ldap.url !== '' &&
          this.ldap.url !== null &&
          this.ldap.bindDN !== '' &&
          this.ldap.bindDN !== null &&
          this.ldap.bindCred !== '' &&
          this.ldap.bindCred !== null &&
          this.ldap.searchBase !== '' &&
          this.ldap.searchBase !== null &&
          this.ldap.usernameAttribute !== '' &&
          this.ldap.usernameAttribute !== null
        )
      },
      async updateLdap () {
        if ((this.$refs.ldapForm.validate() && this.checkIfLdapValuesFilled()) || this.ldap.enabled === false) {
          await this.axios.patch(
            `${this.$store.state.mainUrl}/connections`,
            {
              id: this.ldap.id,
              url: this.ldap.url,
              bindDN: this.ldap.bindDN,
              bindCredentials: this.ldap.bindCred,
              searchBase: this.ldap.searchBase,
              enabled: this.ldap.enabled,
              usernameAttribute: this.ldap.usernameAttribute,
              displayAttribute: this.ldap.displayAttribute
            }
          )
        }
      },
      async testVaultConnection () {
        if (this.checkIfVaultValuesFilled() && this.$refs.vaultForm.validate()) {
          const response = await this.axios.get(
            `${this.$store.state.mainUrl}/connections/testConnection?type=Vault`,
            {
              timeout: 10000
            }
          )

          if (response) {
            if (response.status === 200) {
              this.showTestDialog = true
            }
          }
        }
      },
      checkIfVaultValuesFilled () {
        return (
          this.Vault.url !== '' &&
          this.Vault.url !== null
        )
      },
      async updateVault () {
        if (this.checkIfVaultValuesFilled() && this.$refs.vaultForm.validate()) {
          await this.axios.patch(
            `${this.$store.state.mainUrl}/connections`,
            {
              id: this.Vault.id,
              url: this.Vault.url,
              globalToken: this.Vault.token,
              enabled: this.Vault.enabled,
              useGlobalToken: this.Vault.switch,
              tokens: this.Vault.tokens.items
            }
          )
        }
      },
      async saveToken () {
        this.Vault.tokens.items = []

        this.Vault.bases.forEach(el => {
          this.Vault.tokens[el.name].items.forEach(token => {
            this.Vault.tokens.items.push(token)
          })
        })

        await this.updateVault()
      },
      addScpConnection () {
        const exists = this.scp.connections.find(el => {
          return el.id === -1
        })

        const allBases = {}

        for (const base in this.scp.availableBases) {
          allBases[base] = []
        }

        if (!exists) {
          this.scp.connections.push({
            name: 'New connection',
            id: -1,
            authTypeRadio: 0,
            items: []
          })
        }

        this.scp.panel = this.scp.connections.length - 1

        this.$nextTick(() => {
          let component = this.$refs['SCPForm--1']
          if (Array.isArray(component)) {
            component = component[0]
          }
          component.validate()

          this.$vuetify.goTo(component)
        })
      },
      async saveSCPConnection (connection) {
        let component = this.$refs[`SCPForm-${connection.id}`]
        if (!component) {
          return
        }

        if (Array.isArray(component)) {
          component = component[0]
        }

        if (!component.validate()) {
          return
        }

        const items = [...connection.items]
        items.map(el => {
          el.template = {
            id: el.template.id,
            url: el.template.url
          }
        })

        const patchConnection = {
          id: connection.id === -1 ? undefined : connection.id,
          system: 'SCP',
          authType: connection.authTypeRadio === 0 ? 'key' : 'userpass',
          key: connection.key,
          host: connection.host,
          password: connection.password,
          items: items,
          username: connection.username
        }

        const response = await this.axios.patch(
          `${this.$store.state.mainUrl}/connections`, patchConnection
        )

        if (response.status === 200) {
          for (let i = 0; i < this.scp.connections.length; i++) {
            const conn = this.scp.connections[i]
            if (conn.id === -1) {
              this.scp.connections[i].id = response.data.id
              this.$nextTick(() => {
                this.scp.panel = i
              })
              return
            }
          }
        }
      },
      resetSCPNewItem () {
        for (const item in this.scp.newItem) {
          this.scp.newItem[item] = null
        }
        this.scp.newItemSaveDisabled = true
      },
      SCPNewItemSaveDisabled () {
        for (const item in this.scp.newItem) {
          if (!this.scp.newItem[item]) {
            this.scp.newItemSaveDisabled = true
            return
          }
        }

        if (!this.scp.newItem.path) {
          this.scp.newItemSaveDisabled = true
          return
        }

        if (!this.scp.newItem.template) {
          this.scp.newItemSaveDisabled = true
          return
        }

        this.scp.newItemSaveDisabled = false
      },
      openEditSCPDialog (itemToEdit, connection) {
        let foundI = -1
        connection.items.find((el, i) => {
          for (const item in itemToEdit) {
            if (itemToEdit[item] !== el[item]) {
              return false
            }
          }

          foundI = i
          return true
        })

        this.scp.editItemId = foundI
        this.scp.newItem = {}

        for (const item in itemToEdit) {
          this.scp.newItem[item] = itemToEdit[item]
        }

        this.scp.addItemDialog = true
      },
      deleteSCPItem (itemToDelete, connection) {
        connection.items = connection.items.filter(el => {
          for (const item in itemToDelete) {
            if (itemToDelete[item] !== el[item]) {
              return true
            }
          }

          return false
        })

        this.saveSCPConnection(connection)
      },
      saveNewSCPItem (connection) {
        this.scp.identical = false

        const found = connection.items.find(el => {
          for (const item in this.scp.newItem) {
            if (this.scp.newItem[item] !== el[item]) {
              return false
            }
          }

          return true
        })

        if (found) {
          this.scp.identical = true
          return
        }

        if (this.scp.editItemId >= 0) {
          connection.items.splice(this.scp.editItemId, 1, this.scp.newItem)
        } else {
          connection.items.push(this.scp.newItem)
        }

        this.scp.addItemDialog = false
        this.saveSCPConnection(connection)
      }
    }
  }
</script>

<style lang="scss" scoped>
.conn_row {
  height: 70px;
}
.tokenEditLabel {
  color: lightgray;
}

.scpAuth {
  border-width: 1px;
  border-color: rgba(0,0,0,0.1);
  border-radius: 10px;
  border-style: solid;
}

.scpAuthLabel {
  position: absolute;
  margin-top: -12px;
  margin-left: 20px;
  background-color: white;
  color: rgba(0,0,0,0.5)
}
</style>
