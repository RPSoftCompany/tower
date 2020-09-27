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
  <v-card
    flat
    class="py-3 px-3"
  >
    <v-expansion-panels accordion>
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
                  autocomplete="new-password"
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
                  autocomplete="new-password"
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
                  autocomplete="new-password"
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
                  autocomplete="new-password"
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
                  autocomplete="new-password"
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
                  autocomplete="new-password"
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
            <v-row no-gutters>
              <v-col cols="12">
                Vault
              </v-col>
            </v-row>
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
  export default {
    name: 'ConnectionsSettings',
    data: () => ({
      showTestDialog: false,

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
          required: value => !!value || 'Required.',
        },
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
                      value: 'name',
                    },
                    {
                      text: 'Token',
                      align: 'left',
                      value: 'token',
                    }],
          items: {},
          filter: {},
        },

        urlHint: "eg. 'http://localhost:8200'",
      },
    }),
    async mounted () {
      this.resetData()
    },
    methods: {
      async resetData () {
        this.Vault.bases = []

        const response = await this.axios.get(
          `${this.$store.state.mainUrl}/connections`,
        )

        response.data.forEach(el => {
          const temp = el
          temp.enabled = temp.enabled === undefined ? false : temp.enabled

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
          }
        })

        const basesResponse = await this.axios.get(
          `${this.$store.state.mainUrl}/baseConfigurations?filter={"order":"sequenceNumber ASC"}`,
        )

        basesResponse.data.forEach(el => {
          this.Vault.bases.push(el)
          this.Vault.tokens[el.name] = {
            items: [],
          }
        })

        const modelsResponse = await this.axios.get(
          `${this.$store.state.mainUrl}/configurationModels?filter={"order":"name ASC"}`,
        )

        modelsResponse.data.forEach(el => {
          this.Vault.tokens[el.base].items.push({
            base: el.base,
            name: el.name,
            token: null,
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
              timeout: 10000,
            },
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
        if (this.$refs.ldapForm.validate() && this.checkIfLdapValuesFilled()) {
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
              displayAttribute: this.ldap.displayAttribute,
            },
          )
        }
      },
      async testVaultConnection () {
        if (this.checkIfVaultValuesFilled() && this.$refs.vaultForm.validate()) {
          const response = await this.axios.get(
            `${this.$store.state.mainUrl}/connections/testConnection?type=Vault`,
            {
              timeout: 10000,
            },
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
              tokens: this.Vault.tokens.items,
            },
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
    },
  }
</script>

<style lang="scss" scoped>
.conn_row {
  height: 70px;
}
.tokenEditLabel {
  color: lightgray;
}
</style>
