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
          <v-tab>Restrictions</v-tab>
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
                    ? 'Filter (case sensitive)'
                    : 'Filter (case insensitive)'
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
              <v-card class="restrictionList ma-4">
                <v-text-field
                  v-if="restrictions.hasRestrictions"
                  v-model="restrictions.filter"
                  :label="
                    restrictions.caseSensitive
                      ? 'Filter (case sensitive)'
                      : 'Filter (case insensitive)'
                  "
                  :append-icon="
                    restrictions.caseSensitive
                      ? icons.mdiFormatLetterCaseLower
                      : icons.mdiFormatLetterCase
                  "
                  outlined
                  clearable
                  dense
                  class="px-4 pt-4"
                  @click:append="
                    restrictions.caseSensitive = !restrictions.caseSensitive
                  "
                />
                <v-data-table
                  v-if="restrictions.hasRestrictions"
                  v-model="restrictions.table.selected"
                  :headers="restrictions.table.headers"
                  :items="restrictions.table.items"
                  :disabled="!isEditable"
                  :hide-default-footer="true"
                  :single-select="false"
                  :search="restrictions.filter"
                  :custom-filter="restrictionList"
                  show-select
                  class="elevation-1"
                  @item-selected="modifyRestriction"
                  @toggle-select-all="modifyAllRestrictions"
                />
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
    mdiDelete,
    mdiFormatLetterCase,
    mdiFormatLetterCaseLower,
  } from '@mdi/js'

  export default {
    name: 'Base',
    components: { 'v-rule': rule },
    data: () => ({
      base: null,
      models: [],

      deleteDialog: {
        show: false,
        loading: false,
      },

      currentModel: null,
      modelText: null,

      currentTab: null,

      loading: false,

      icons: {
        mdiPlus,
        mdiDelete,
        mdiFormatLetterCase,
        mdiFormatLetterCaseLower,
      },
      rules: {
        items: [],
        filter: '',
        caseSensitive: false,
      },
      variables: {
        items: [],
        filter: '',
        caseSensitive: false,
      },
      constantVariables: {
        items: [],
      },
      restrictions: {
        hasRestrictions: false,
        filter: '',
        caseSensitive: false,
        table: {
          headers: [
            {
              text: 'Restriction',
              align: 'left',
              value: 'name',
            },
          ],
          items: [],
          selected: [],
        },
      },
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
        if (this.base === null) {
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
        if (this.base === null) {
          return ''
        }
        return `Choose ${this.base.name}`
      },
      variablesList () {
        if (
          this.variables.filter === undefined ||
          this.variables.filter === null ||
          this.variables.filter === ''
        ) {
          return this.variables.items
        }
        return this.variables.items.filter(el => {
          if (this.variables.caseSensitive) {
            return el.name.includes(this.variables.filter)
          } else {
            return el.name
              .toUpperCase()
              .includes(this.variables.filter.toUpperCase())
          }
        })
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
                el.targetType.includes(this.rules.filter) ||
                el.conditionType.includes(this.rules.filter) ||
                el.conditionValue.includes(this.rules.filter) ||
                el.error.includes(this.rules.filter)
            } else {
              return el.targetValue.toUpperCase().includes(upperFilter) ||
                el.targetType.toUpperCase().includes(upperFilter) ||
                el.conditionType.toUpperCase().includes(upperFilter) ||
                el.conditionValue.toUpperCase().includes(upperFilter) ||
                el.error.toUpperCase().includes(upperFilter)
            }
          })
        }
      },
    },
    async mounted () {
      this.loading = true
      if (this.$store.state.userRoles === undefined) {
        const roles = await this.axios.get(
          `${this.$store.state.mainUrl}/members/getUserRoles`,
        )

        this.$store.commit('setUserRoles', roles.data)
      }
      await this.setData()
    },
    methods: {
      restrictionList (value, search) {
        if (value === undefined) {
          return false
        } else {
          if (!this.restrictions.caseSensitive) {
            return value
              .toString()
              .toUpperCase()
              .includes(search.toUpperCase())
          } else {
            return value.toString().includes(search)
          }
        }
      },
      async setData () {
        this.loading = true
        const baseName = this.$route.params.name

        const modelData = await this.axios.get(
          `${this.$store.state.mainUrl}/configurationModels?filter={"where":{"base":"${baseName}"},"order":"name ASC"}`,
        )

        this.models = modelData.data

        const base = await this.axios.get(
          `${this.$store.state.mainUrl}/baseConfigurations?filter={"where":{"name":"${baseName}"},"order":"name ASC"}`,
        )
        this.base = base.data[0]

        this.loading = false
      },
      async modelChanged (data) {
        if (data !== undefined) {
          if (this.$refs.newVariable !== undefined) {
            this.$refs.newVariable.reset()
          }

          if (this.$refs.newRule !== undefined) {
            this.$refs.newRule.reset()
          }

          const modelData = await this.axios.get(
            `${this.$store.state.mainUrl}/configurationModels?filter={"where":{"id":"${data.id}"}}`,
          )

          this.currentModel = modelData.data[0]

          this.rules.items = this.currentModel.rules
          this.rules.items = this.rules.items.sort((a, b) => {
            return a.targetValue.localeCompare(b.targetValue)
          })

          this.restrictions.hasRestrictions = this.currentModel.options.hasRestrictions

          const childBase = await this.axios.get(
            `${
              this.$store.state.mainUrl
            }/baseConfigurations?filter={"where":{"sequenceNumber":"${this.base
              .sequenceNumber + 1}"}}`,
          )

          if (childBase.data.length > 0) {
            const childBaseName = childBase.data[0].name

            const children = await this.axios.get(
              `${this.$store.state.mainUrl}/configurationModels?filter={"where":{"base":"${childBaseName}"}}`,
            )

            if (children !== undefined) {
              this.restrictions.table.items = children.data
              this.restrictions.table.selected = []
              this.restrictions.table.items.forEach(el => {
                if (this.currentModel.restrictions !== undefined) {
                  if (this.currentModel.restrictions.includes(el.name)) {
                    this.restrictions.table.selected.push(el)
                  }
                }
              })
            }
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
          this.restrictions.table.selected = []
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
        if (this.modelText === '' || this.modelText === null) {
          return
        }

        if (this.currentModel !== null && this.modelText === this.currentModel.name) {
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
              hasRestrictions: false,
            },
          },
        )

        this.models.push(newModel.data)
        this.currentModel = newModel.data

        this.modelChanged(this.currentModel)

        this.$refs.modelSelect.isMenuActive = false
        this.$refs.modelSelect.blur()
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
            error: data.errorMessage,
          },
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
          `${this.$store.state.mainUrl}/configurationModels/${this.currentModel.id}/rule?ruleId=${id}`,
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
            error: data.errorMessage,
          },
        )
      },
      async addVariable (data) {
        const variable = await this.axios.post(
          `${this.$store.state.mainUrl}/configurationModels/${this.currentModel.id}/variable`,
          {
            name: data.name,
            value: data.value,
          },
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
          `${this.$store.state.mainUrl}/configurationModels/${this.currentModel.id}/variable?variableId=${id}`,
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
            value: data.value,
          },
        )
      },
      async modifyOptions (restrictions) {
        await this.axios.patch(
          `${this.$store.state.mainUrl}/configurationModels/${this.currentModel.id}/options`,
          {
            hasRestrictions: restrictions,
          },
        )
      },
      async modifyRestriction (data) {
        if (data.value === true) {
          await this.axios.post(
            `${this.$store.state.mainUrl}/configurationModels/${this.currentModel.id
            }/restriction?restriction=${data.item.name}`,
          )
        } else {
          await this.axios.delete(
            `${this.$store.state.mainUrl}/configurationModels/${this.currentModel.id
            }/restriction?restriction=${data.item.name}`,
          )
        }
      },
      async modifyAllRestrictions (data) {
        for (const rest of this.restrictions.table.items) {
          const newData = {
            value: data.value,
            item: rest,
          }
          await this.modifyRestriction(newData)
        }
      },
    },
  }
</script>

<style scoped>
.halfWidth {
  width: 50%;
}
</style>
