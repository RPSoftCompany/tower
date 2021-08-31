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
  <div>
    <v-dialog
      v-model="restrictions.invalidRestrictionDialog"
      width="500"
    >
      <v-card>
        <v-card-title class="headline red">
          Invalid Restriction
        </v-card-title>

        <v-card-text
          class="mt-3"
        >
          Restriction must have at least one model chosen
        </v-card-text>

        <v-divider />

        <v-card-actions>
          <v-spacer />
          <v-btn
            color="red"
            text
            @click="restrictions.invalidRestrictionDialog = false"
          >
            Ok
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="deleteDialog.show"
      width="500"
      data-cy="deleteDialog"
    >
      <v-card>
        <v-card-title class="headline red">
          Delete
        </v-card-title>

        <v-card-text
          v-if="currentModel !== null"
          class="mt-3"
        >
          Are you sure you want to delete {{ currentModel.name }} {{ base.name }}?
        </v-card-text>

        <v-divider />

        <v-card-actions>
          <v-spacer />
          <v-btn
            text
            @click="deleteDialog.show = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="red"
            data-cy="deleteYes"
            text
            @loading="deleteDialog.loading"
            @click="deleteModel"
          >
            Yes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <div class="d-flex justify-center">
      <div
        class="halfWidth"
        :data-cy="`modelSelectParent_${$route.params.name}`"
      >
        <v-autocomplete
          id="modelSelect"
          ref="modelSelect"
          v-model="currentModel"
          :data-cy="`modelSelectInput_${$route.params.name}`"
          :search-input.sync="modelText"
          :label="modelLabel"
          :loading="loading"
          :prepend-icon="baseIcon"
          :items="models"
          :append-outer-icon="appendIcon"
          autocomplete="off"
          item-text="name"
          return-object
          clearable
          @change="modelChanged"
          @click:append-outer="addOrDeleteModel"
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
    <transition
      name="slowfade"
      mode="out-in"
    >
      <div
        v-if="currentModel !== null && currentModel !== undefined"
        class="mt-4"
        data-cy="modelPane"
      >
        <v-divider />
        <v-tabs
          v-model="currentTab"
          class="elevation-1"
        >
          <v-tab>Rules</v-tab>
          <v-tab v-if="base && base.sequenceNumber && base.sequenceNumber !== 0">
            Restrictions
          </v-tab>
        </v-tabs>
        <v-tabs-items
          v-model="currentTab"
          class="elevation-1 pt-5"
        >
          <v-tab-item>
            <v-card flat>
              <v-text-field
                v-model="rules.filter"
                :label="
                  rules.caseSensitive
                    ? 'Search (case sensitive)'
                    : 'Search (case insensitive)'
                "
                :append-icon="
                  rules.caseSensitive
                    ? icons.mdiFormatLetterCaseLower
                    : icons.mdiFormatLetterCase
                "
                outlined
                clearable
                dense
                class="px-4"
                @click:append="rules.caseSensitive = !rules.caseSensitive"
              />
              <v-divider />
              <transition-group
                name="fade-transition"
                duration="100"
                mode="out-in"
                tag="form"
              >
                <div
                  v-for="rule of rulesList"
                  :key="rule._id"
                >
                  <v-rule
                    :target-value="rule.targetValue"
                    :target-type="rule.targetType"
                    :target-reg-ex="rule.targetRegEx"
                    :new-rule="false"
                    :condition-value="rule.conditionValue"
                    :condition-type="rule.conditionType"
                    :condition-reg-ex="rule.conditionRegEx"
                    :error-message="rule.error"
                    :rule-id="rule._id"
                    :editable="isEditable"
                    @delete_rule="deleteRule"
                    @modify_rule="modifyRule"
                  />
                </div>
              </transition-group>
              <v-divider />
              <v-rule
                ref="newRule"
                :editable="isEditable"
                @add_rule="addRule"
              />
            </v-card>
          </v-tab-item>
          <v-tab-item>
            <v-card flat>
              <v-checkbox
                v-model="restrictions.hasRestrictions"
                :disabled="!isEditable"
                color="primary"
                label="Enable restrictions"
                class="px-4"
                @change="modifyOptions"
              />
              <v-card
                v-if="restrictions.hasRestrictions === true"
                class="pa-4"
              >
                <v-row
                  v-for="restriction of restrictions.items"
                  :key="restriction.__id"
                  class="d-flex"
                >
                  <v-col
                    v-for="base of restrictions.bases.items"
                    :key="base.name"
                    class="pa-0"
                  >
                    <v-autocomplete
                      v-model="restriction[base.name]"
                      :items="restrictions.bases.baseItemNames[base.name]"
                      :prepend-icon="base.icon"
                      :label="base.name"
                      class="pa-2"
                      autocomplete="off"
                      placeholder="ANY"
                      persistent-placeholder
                      clearable
                      @change="modifyRestrictions(restriction.__id)"
                    />
                  </v-col>
                  <v-col
                    cols="1"
                    md="auto"
                  >
                    <v-btn
                      icon
                      fab
                      small
                      @click="deleteRestriction(restriction.__id)"
                    >
                      <v-icon>
                        {{ icons.mdiMinus }}
                      </v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
                <v-divider
                  v-if="restrictions.items.length > 0"
                  class="pb-3"
                />
                <v-row class="mt-2">
                  <v-col
                    v-for="base of restrictions.bases.items"
                    :key="base.name"
                    class="pa-0"
                  >
                    <v-autocomplete

                      v-model="restrictions.bases.baseValues[base.name]"
                      :items="restrictions.bases.baseItems[base.sequenceNumber]"
                      :prepend-icon="base.icon"
                      :label="base.name"
                      class="pa-2"
                      item-text="name"
                      autocomplete="off"
                      return-object
                      placeholder="ANY"
                      persistent-placeholder
                      clearable
                      @change="checkIfEnableAddRestrictions"
                    />
                  </v-col>
                  <v-col
                    cols="1"
                    md="auto"
                  >
                    <v-btn
                      icon
                      fab
                      small
                      :disabled="!restrictions.canAddRestriction"
                      @click="addRestriction"
                    >
                      <v-icon>
                        {{ icons.mdiPlus }}
                      </v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-card>
              <v-divider />
            </v-card>
          </v-tab-item>
        </v-tabs-items>
      </div>
    </transition>
  </div>
</template>

<script>
  import rule from '../components/base/advancedRule'
  import {
    mdiPlus,
    mdiMinus,
    mdiDelete,
    mdiFormatLetterCase,
    mdiFormatLetterCaseLower
  } from '@mdi/js'

  export default {
    name: 'Base',
    components: { 'v-rule': rule },
    data: () => ({
      base: {
        name: null,
        sequenceNumber: null,
        id: null,
        icon: null
      },
      models: [],

      deleteDialog: {
        show: false,
        loading: false
      },

      currentModel: null,
      modelText: null,

      currentTab: null,

      loading: false,

      icons: {
        mdiPlus,
        mdiMinus,
        mdiDelete,
        mdiFormatLetterCase,
        mdiFormatLetterCaseLower
      },
      rules: {
        items: [],
        filter: '',
        caseSensitive: false
      },
      variables: {
        items: [],
        filter: '',
        caseSensitive: false
      },
      constantVariables: {
        items: []
      },
      restrictions: {
        bases: {
          items: [],
          baseItems: [],
          baseItemNames: {},
          baseValues: {}
        },
        canAddRestriction: false,
        hasRestrictions: false,
        filter: '',
        caseSensitive: false,
        items: [],
        itemsBackup: [],
        invalidRestrictionDialog: false
      }
    }),
    computed: {
      appendIcon () {
        if (this.canAddBase) {
          if (this.currentModel === null && (this.modelText === null || this.modelText === '')) {
            return undefined
          }
          if (this.currentModel === null || this.modelText !== this.currentModel.name) {
            return this.icons.mdiPlus
          } else {
            return this.icons.mdiDelete
          }
        }

        return undefined
      },
      baseIcon () {
        if (!this.base) {
          return null
        } else {
          return this.base.icon
        }
      },
      noDataText () {
        if (this.base !== null && this.modelText !== null) {
          return `No results matching <strong>${this.modelText
          }</strong>. Press <kbd>+</kbd> button on the right to create a new ${this.base.name}`
        } else {
          return 'Type name and press <kbd>+</kbd> button to create new model'
        }
      },
      modelLabel () {
        if (!this.base) {
          return ''
        }
        return `Choose or create new ${this.base.name}`
      },
      isEditable () {
        let editable = false

        const prefix = `configurationModel.${this.base.name}.${this.currentModel.name}`

        if (this.$store.state.userRoles.includes('configurationModel.modify')) {
          if (this.$store.state.userRoles.includes(`${prefix}.modify`)) {
            editable = true
          } else if (!this.$store.state.userRoles.includes(`${prefix}.view`)) {
            editable = true
          }
        }

        return editable
      },
      canAddBase () {
        return this.$store.state.userRoles.includes('configurationModel.modify')
      },
      rulesList () {
        if (
          this.rules.filter === undefined ||
          this.rules.filter === null ||
          this.rules.filter === ''
        ) {
          return this.rules.items
        } else {
          const upperFilter = this.rules.filter.toUpperCase()

          return this.rules.items.filter(el => {
            if (this.rules.caseSensitive) {
              return el.targetValue.includes(this.rules.filter) ||
                el.conditionValue.includes(this.rules.filter) ||
                el.error.includes(this.rules.filter)
            } else {
              return el.targetValue.toUpperCase().includes(upperFilter) ||
                el.conditionValue.toUpperCase().includes(upperFilter) ||
                el.error.toUpperCase().includes(upperFilter)
            }
          })
        }
      }
    },
    async mounted () {
      this.loading = true
      if (this.$store.state.userRoles === undefined) {
        const roles = await this.axios.get(
          `${this.$store.state.mainUrl}/members/getUserRoles`
        )

        this.$store.commit('setUserRoles', roles.data)
      }
      await this.setData()
    },
    methods: {
      checkIfEnableAddRestrictions () {
        if (Object.keys(this.restrictions.bases.baseValues).length === 0) {
          this.restrictions.canAddRestriction = false
        } else {
          const array = Object.keys(this.restrictions.bases.baseValues).find(el => {
            return !!this.restrictions.bases.baseValues[el]
          })

          this.restrictions.canAddRestriction = !!array
        }
      },
      async setData () {
        this.loading = true
        const baseName = this.$route.params.name

        const modelData = await this.axios.get(
          `${this.$store.state.mainUrl}/configurationModels?filter={"where":{"base":"${baseName}"},"order":"name ASC"}`
        )

        this.models = modelData.data

        const base = await this.axios.get(
          `${this.$store.state.mainUrl}/baseConfigurations?filter={"where":{"name":"${baseName}"},"order":"name ASC"}`
        )
        this.base = base.data[0]

        this.loading = false

        this.$eventHub.$emit('tutorialConfigurationModelChanged', this.base.sequenceNumber)
      },
      async modelChanged (data) {
        if (data) {
          if (this.$refs.newVariable) {
            this.$refs.newVariable.reset()
          }

          if (this.$refs.newRule) {
            this.$refs.newRule.reset()
          }

          const modelData = await this.axios.get(
            `${this.$store.state.mainUrl}/configurationModels?filter={"where":{"id":"${data.id}"}}`
          )

          this.currentModel = modelData.data[0]

          this.rules.items = this.currentModel.rules
          this.rules.items = this.rules.items.sort((a, b) => {
            return a.targetValue.localeCompare(b.targetValue)
          })

          this.restrictions.hasRestrictions = this.currentModel.options.hasRestrictions
          this.restrictions.bases.baseValues = {}
          this.restrictions.bases.baseItemNames = {}

          if (this.base.sequenceNumber !== 0) {
            this.restrictions.items = this.currentModel.restrictions

            const allBases = await this.axios.get(
              `${
                this.$store.state.mainUrl
              }/baseConfigurations?filter={"order":"sequenceNumber asc"}`)

            if (allBases.status === 200) {
              this.restrictions.bases.items = allBases.data.filter(el => {
                return el.sequenceNumber < this.base.sequenceNumber
              })
            }

            for (let i = 0; i < this.restrictions.bases.items.length; i++) {
              const baseI = this.restrictions.bases.items[i]
              const response = await this.axios.get(`${this.$store.state.mainUrl}/configurationModels?filter=` +
                `{"where":{"base":"${baseI.name}"}}`)
              if (response.status === 200) {
                this.restrictions.bases.baseItems[i] = response.data
                this.restrictions.bases.baseValues[baseI.name] = null
                this.restrictions.bases.baseItemNames[baseI.name] = []
                response.data.forEach(el => {
                  this.restrictions.bases.baseItemNames[baseI.name].push(el.name)
                })
              }
            }

            this.restrictions.itemsBackup = []
            this.restrictions.items.forEach(el => {
              this.restrictions.itemsBackup.push(Object.assign({}, el))
            })

            this.$forceUpdate()
          }
        } else {
          this.currentModel = null
          this.rules.items = []
          this.rules.filter = null
          this.rules.caseSensitive = false

          this.variables.items = []
          this.variables.filter = null
          this.variables.caseSensitive = false

          this.restrictions.hasRestrictions = false

          this.restrictions.items = []
          this.restrictions.itemsBackup = []
          this.restrictions.bases.items = []
          this.restrictions.bases.baseItems = []
          this.restrictions.bases.baseValues = {}
          this.restrictions.bases.baseItemNames = {}
        }
      },
      async deleteModel () {
        this.deleteDialog.loading = true
        await this.axios.delete(`${this.$store.state.mainUrl}/configurationModels/${this.currentModel.id}`)

        this.models = this.models.filter(el => {
          return el.name !== this.currentModel.name
        })

        this.currentModel = null

        this.deleteDialog.loading = false
        this.deleteDialog.show = false
      },
      async addOrDeleteModel () {
        if (!this.modelText) {
          return
        }

        if (this.currentModel && this.modelText === this.currentModel.name) {
          this.deleteDialog.show = true
          return
        }

        if (this.models.includes(this.modelText)) {
          return
        }

        const newModel = await this.axios.post(
          `${this.$store.state.mainUrl}/configurationModels`,
          {
            name: this.modelText,
            rules: [],
            restrictions: [],
            defaultValues: [],
            base: this.base.name,
            options: {
              hasRestrictions: false
            }
          }
        )

        if (newModel.status !== 200) {
          return
        }

        this.models.push(newModel.data)
        this.currentModel = newModel.data

        this.modelChanged(this.currentModel)

        this.$refs.modelSelect.isMenuActive = false
        this.$refs.modelSelect.blur()

        this.$eventHub.$emit('tutorialConfigurationModelCreated', this.base.sequenceNumber)
      },
      async addRule (data) {
        const rule = await this.axios.post(
          `${this.$store.state.mainUrl}/configurationModels/${this.currentModel.id}/rule`,
          {
            targetValue: data.targetValue,
            targetType: data.targetType,
            targetRegEx: data.targetRegEx,
            conditionValue: data.conditionValue,
            conditionType: data.conditionType,
            conditionRegEx: data.conditionRegEx,
            error: data.errorMessage
          }
        )

        if (rule !== undefined) {
          this.rules.items.push(rule.data)
          this.rules.items = this.rules.items.sort((a, b) => {
            return a.targetValue.localeCompare(b.targetValue)
          })
        }
      },
      async deleteRule (data) {
        const id = data.id
        const rule = await this.axios.delete(
          `${this.$store.state.mainUrl}/configurationModels/${this.currentModel.id}/rule?ruleId=${id}`
        )

        if (rule !== undefined) {
          this.rules.items = this.rules.items.filter(el => {
            return el._id !== id
          })
        }
      },
      async modifyRule (data) {
        await this.axios.patch(
          `${this.$store.state.mainUrl}/configurationModels/${this.currentModel.id}/rule`,
          {
            _id: data.id,
            targetValue: data.targetValue,
            targetType: data.targetType,
            targetRegEx: data.targetRegEx,
            conditionValue: data.conditionValue,
            conditionType: data.conditionType,
            conditionRegEx: data.conditionRegEx,
            error: data.errorMessage
          }
        )
      },
      async addVariable (data) {
        const variable = await this.axios.post(
          `${this.$store.state.mainUrl}/configurationModels/${this.currentModel.id}/variable`,
          {
            name: data.name,
            value: data.value
          }
        )

        if (variable !== undefined) {
          this.variables.items.push(variable.data)
          this.variables.items = this.variables.items.sort((a, b) => {
            return a.name.localeCompare(b.name)
          })
          data._this.reset()
        }
      },
      async removeVariable (data) {
        const id = data.id
        const variable = await this.axios.delete(
          `${this.$store.state.mainUrl}/configurationModels/${this.currentModel.id}/variable?variableId=${id}`
        )

        if (variable !== undefined) {
          this.variables.items = this.variables.items.filter(el => {
            return el._id !== id
          })
        }
      },
      async modifyVariable (data) {
        await this.axios.patch(
          `${this.$store.state.mainUrl}/configurationModels/${this.currentModel.id}/variable`,
          {
            _id: data.id,
            name: data.name,
            value: data.value
          }
        )
      },
      async modifyOptions (restrictions) {
        await this.axios.patch(
          `${this.$store.state.mainUrl}/configurationModels/${this.currentModel.id}/options`,
          {
            hasRestrictions: restrictions
          }
        )
      },
      async addRestriction () {
        const item = {
          __id: Math.random().toString(36).replace(/[^a-z]+/g, '')
        }

        for (let key in this.restrictions.bases.baseValues) {
          item[key] = this.restrictions.bases.baseValues[key] ? this.restrictions.bases.baseValues[key].name : null
        }

        let ret = false

        this.restrictions.items.forEach(el => {
          let same = true
          Object.keys(el).forEach(key => {
            if (key !== '__id') {
              if (el[key] && el[key] !== item[key]) {
                same = false
              }
            }
          })

          if (same) {
            ret = true
          }
        })

        if (ret === true) {
          this.restrictions.bases.baseValues = {}
          this.restrictions.canAddRestriction = false
          return
        }

        this.restrictions.items.push(item)
        this.restrictions.itemsBackup.push(Object.assign({}, item))

        await this.axios.post(
          `${this.$store.state.mainUrl}/configurationModels/${this.currentModel.id
          }/restriction`, item
        )

        this.restrictions.bases.baseValues = {}
        this.restrictions.canAddRestriction = false
      },
      async deleteRestriction (id) {
        this.restrictions.items = this.restrictions.items.filter(el => {
          return el.__id !== id
        })

        this.restrictions.itemsBackup = this.restrictions.itemsBackup.filter(el => {
          return el.__id !== id
        })

        await this.axios.delete(
          `${this.$store.state.mainUrl}/configurationModels/${this.currentModel.id
          }/restriction?restrictionId=${id}`
        )
      },
      async modifyRestrictions (data) {
        const found = this.restrictions.items.find(el => {
          return el.__id === data
        })

        let allNull = true

        Object.keys(found).forEach(key => {
          if (key !== '__id') {
            if (found[key]) {
              allNull = false
            }
          }
        })

        if (allNull === true) {
          this.restrictions.invalidRestrictionDialog = true

          this.$nextTick(() => {
            this.restrictions.items = []
            this.restrictions.itemsBackup.forEach(el => {
              this.restrictions.items.push(Object.assign({}, el))
            })
            this.$forceUpdate()
          })
        } else {
          this.restrictions.itemsBackup.map(el => {
            if (el.__id === data) {
              el = Object.assign({}, found)
            }

            return el
          })

          await this.axios.patch(
            `${this.$store.state.mainUrl}/configurationModels/${this.currentModel.id
            }/restriction`, found
          )
        }
      }
    }
  }
</script>

<style scoped>
.halfWidth {
  width: 50%;
}

.test {
  color: gray
}
</style>
