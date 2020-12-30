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
//    along with Tower.  If not, see http://www.gnu.org/licenses/.

<template>
  <div>
    <v-dialog
      v-model="importDialog.show"
      max-width="500px"
    >
      <v-card>
        <v-card-title class="primary">
          Import configuration from file
        </v-card-title>
        <v-card-text>
          <v-file-input
            v-model="importDialog.file"
            label="File input"
            show-size
            @change="onImportFileChange"
          />
          <v-radio-group
            v-model="importDialog.type"
            :disabled="importDialog.file === null"
          >
            <v-radio
              label="plain text"
              value="text/plain"
            />
            <v-radio
              label="JSON"
              value="application/json"
            />
            <v-radio
              label="CSV"
              value="text/csv"
            />
          </v-radio-group>
          <v-combobox
            v-if="importDialog.type==='text/csv'"
            v-model="importDialog.separator"
            return-object
            :items="importDialog.separators"
            label="Separator"
          />
        </v-card-text>
        <v-card-actions class="mx-3 mb-3">
          <v-btn
            text
            @click="closeImportDialog"
          >
            Cancel
          </v-btn>
          <v-spacer />
          <v-btn
            color="primary"
            text
            :disabled="importDialog.file === null"
            @click="onImportButtonClicked"
          >
            Import
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="promotionDialog.show"
      max-width="80%"
    >
      <v-card>
        <v-card-title class="primary">
          Select promoted configuration
        </v-card-title>
        <v-card-text>
          <v-data-table
            class="mt-5 promotionDialogTable"
            :headers="promotionDialog.headers"
            :items="promotionDialog.configuration"
            @click:row="loadPromoted"
          />
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            text
            @click="promotionDialog.show = false"
          >
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <div class="d-flex">
      <v-progress-linear
        v-if="bases.loading"
        :height="3"
        indeterminate
      />
      <v-autocomplete
        v-for="base of bases.items"
        :key="base.name"
        :ref="`baseConf_${base.name}`"
        v-model="bases.baseValues[base.sequenceNumber]"
        :prepend-icon="base.icon"
        :label="base.name"
        :items="bases.baseItems[base.sequenceNumber]"
        :loading="baseLoading(base.sequenceNumber)"
        :data-cy="`configuration_base_${base.name}`"
        class="pa-2"
        item-text="name"
        clearable
        autocomplete="off"
        return-object
        @change="fillNextArray(base.sequenceNumber + 1, bases.baseValues[base.sequenceNumber])"
      />
    </div>
    <div
      v-if="bases.items.length === 0 && bases.loading === false"
    >
      <div
        class="text-center text-h4 font-weight-light mt-5"
        style="width: 100%"
      >
        You need to configure your base items first
      </div>
      <div
        class="text-center text-subtitle-1 font-weight-thin"
        style="width: 100%"
      >
        Go to <router-link :to="{name: 'Settings', params:{tab:'base'}}">
          Settings > Base Models
        </router-link>
      </div>
    </div>
    <v-progress-linear
      v-if="configuration.loading"
      :height="3"
      indeterminate
    />
    <v-card
      v-if="filterPanel.show"
      class="pb-2 pt-5"
    >
      <div class="d-flex">
        <v-text-field
          v-model="configuration.filter.filter"
          :label="
            configuration.filter.caseSensitive
              ? 'Filter (case sensitive)'
              : 'Filter (case insensitive)'
          "
          :append-icon="
            configuration.filter.caseSensitive
              ? icons.mdiFormatLetterCaseLower
              : icons.mdiFormatLetterCase
          "
          clearable
          outlined
          dense
          class="px-4 pt-1"
          style="max-width: 33%"
          @click:append="
            configuration.filter.caseSensitive = !configuration.filter
              .caseSensitive
          "
        />
        <div
          class="text-center text-h5 font-weight-thin pt-2"
          style="width: 33%; margin-top: -1px"
          v-text="configuration.configInfo"
        />
        <v-spacer />
        <v-tooltip
          v-if="configuration.promoted.length > 0"
          bottom
          :open-delay="500"
        >
          <template v-slot:activator="{ on }">
            <v-icon
              style="max-height: 24px;"
              class="mr-3 mt-3"
              v-on="on"
              @click="showPromotionDialog"
              v-text="icons.mdiPackageUp"
            />
          </template>
          <span>Use promoted configuration</span>
        </v-tooltip>
        <v-tooltip
          v-if="configuration.items.length > 0 || configuration.editMode === true"
          bottom
          :open-delay="500"
        >
          <template v-slot:activator="{ on }">
            <v-icon
              style="max-height: 24px;"
              class="mr-3 mt-3"
              @click="importDialog.show = true"
              v-on="on"
              v-text="icons.mdiFileUpload"
            />
          </template>
          <span>Import configuration from file</span>
        </v-tooltip>
        <v-tooltip
          v-if="configuration.items.length > 0"
          :open-delay="500"
          bottom
        >
          <template v-slot:activator="{ on }">
            <v-icon
              style="max-height: 24px;"
              :disabled="configuration.editModeDisabled"
              class="mr-3 mt-3"
              data-cy="configurationEditMode"
              @click="changeEditMode"
              v-on="on"
              v-text="
                configuration.editMode ? icons.mdiSquareEditOutline : icons.mdiPencil
              "
            />
          </template>
          <span>Change mode</span>
        </v-tooltip>
      </div>
      <v-divider
        v-if="(configuration.items.length > 0 && configuration.editMode === false) || configuration.editMode"
        class="pb-5"
      />
      <div
        v-if="(configuration.items.length > 0 && configuration.editMode === false) || configuration.editMode"
        class="d-flex justify-space-around"
      >
        <div class="thirdWidth d-flex align-center justify-center">
          <div class="subtitle-1 text-center font-weight-bold">
            Name
          </div>
        </div>
        <div
          v-if="configuration.maxVersion >= 0 && configuration.editMode === false"
          class="d-flex justify-space-between thirdWidth"
        >
          <div class="d-flex align-center">
            <v-icon
              style="max-height: 24px"
              :disabled="configuration.shownVersion === 0"
              @click="previousVersion"
            >
              {{ icons.mdiChevronLeft }}
            </v-icon>
          </div>
          <div class="d-flex flex-row justify-space-around">
            <v-tooltip
              v-if="configuration.versions.length > 0"
              :open-delay="500"
              bottom
            >
              <template v-slot:activator="{ on }">
                <v-icon
                  class="mx-1"
                  :color="isCurrentConfigurationPromoted ? `primary` : undefined"
                  @click="promoteConfiguration"
                  v-on="on"
                  v-text="isCurrentConfigurationPromoted ? icons.mdiStar : icons.mdiStarOutline"
                />
              </template>
              <span>Promote Configuration</span>
            </v-tooltip>
            <div class="subtitle-1 font-weight-bold">
              {{ versionLabel }}
            </div>
            <v-tooltip
              v-if="configuration.versions.length > 0"
              :open-delay="500"
              bottom
            >
              <template v-slot:activator="{ on }">
                <v-icon
                  :disabled="!differentThanShownVersion"
                  class="mx-1"
                  color="primary"
                  @click="revertToCurrentVersion"
                  v-on="on"
                >
                  {{ icons.mdiReply }}
                </v-icon>
              </template>
              <span>Revert to this version</span>
            </v-tooltip>
          </div>
          <div class="d-flex align-center">
            <v-icon
              :disabled="configuration.shownVersion === configuration.maxVersion"
              @click="nextVersion"
            >
              {{ icons.mdiChevronRight }}
            </v-icon>
          </div>
        </div>
        <div class="thirdWidth d-flex align-center justify-center">
          <div class="subtitle-1 text-center font-weight-bold">
            Value
          </div>
        </div>
      </div>
      <v-divider
        v-if="(configuration.items.length > 0 && configuration.editMode === false) || configuration.editMode"
        class="mt-4"
      />
      <v-divider v-else />
      <div v-if="configuration.editMode === false">
        <v-responsive
          class="overflow-y-auto"
          style="max-height: calc(100vh - 436px)"
        >
          <v-form
            ref="configValidation"
            v-model="configuration.valid"
          >
            <v-lazy
              v-for="item of filteredItems"
              :key="item.name"
              v-model="configuration.lazyVisible[item.name]"
              min-height="71"
            >
              <configurationRow
                ref="configRows"
                v-model="item.value"
                :name="item.name"
                :type="item.type"
                :deleted="item.deleted"
                :rules="item.rules"
                :forced-value="item.forcedValue"
                :force-cause="item.forcedCause"
                :current-version-value="item.currentVersionValue"
                :current-version-type="item.currentVersionType"
                :draft="item.draft"
                :draft-versions="configuration.draftVersions"
                :is-new="item.isNew"
              />
            </v-lazy>
          </v-form>
        </v-responsive>
      </div>
      <div v-else>
        <v-responsive
          v-if="filteredItems.length > 0"
          class="overflow-y-auto pt-2"
          style="max-height: calc(100vh - 436px)"
        >
          <v-form
            ref="configValidation"
            v-model="configuration.valid"
            style="overflow: hidden"
          >
            <v-lazy
              v-for="item of filteredItems"
              :key="item.name"
              v-model="configuration.lazyVisible[item.name]"
              min-height="71"
            >
              <new-configuration-row
                :name="item.name"
                :value="item.value"
                :type="item.type"
                :disabled="item.forcedValue"
                :added="true"
                :rules="item.rules"
                :add-if-absent="item.addIfAbsent"
                @changed="variableTypeChange"
                @delete="removeConfigurationRow"
              />
            </v-lazy>
          </v-form>
        </v-responsive>
      </div>
      <div v-if="constantVariables.show">
        <v-responsive
          v-if="filteredConstantVariables.length > 0"
          class="overflow-y-auto pt-3"
          style="max-height: calc(100vh - 351px);"
        >
          <v-lazy
            v-for="variable of filteredConstantVariables"
            :key="`${variable.name}${variable.type}${variable.value}${constantVariables.editable}`"
            min-height="71"
          >
            <constantVariable
              :name="variable.name"
              :value="variable.value"
              :type="variable.type"
              :forced="variable.forced"
              :addifabsent="variable.addIfAbsent"
              :editable="constantVariables.editable"
              @change="changeConstantVariable"
              @deleteVariable="deleteConstantVariable"
            />
          </v-lazy>
        </v-responsive>
      </div>
      <v-divider />
      <div
        v-if="configuration.showSaveButton"
        class="d-flex flex-row justify-space-around mt-2"
      >
        <v-row
          justify="start"
          align="center"
          class="mx-5"
        >
          <v-col
            cols="4"
            class="pa-0"
          >
            <v-checkbox
              v-model="configuration.saveAsDraft"
              dense
              label="Save as draft"
            />
          </v-col>
          <v-col
            cols="4"
            class="pa-0"
            style="display: flex; justify-content: center"
          >
            <v-btn
              :disabled="!differentThanPrevVersion"
              color="primary"
              :loading="configuration.saving"
              data-cy="saveConfigurationButton"
              @click="saveConfiguration"
            >
              {{ saveButtonText }}
            </v-btn>
          </v-col>
        </v-row>
      </div>
      <div
        v-else-if="configuration.editMode === true"
      >
        <new-configuration-row
          ref="newConfigurationRow"
          @add-row="addConfigRow"
        />
      </div>
      <div v-else-if="constantVariables.show">
        <constantVariable
          v-if="constantVariables.editable"
          ref="newConstantVariable"
          class="mt-2"
          :is-new="true"
          @addVariable="addConstantVariable"
        />
      </div>
    </v-card>
  </div>
</template>

<script>
  import {
    mdiFormatLetterCaseLower, mdiFormatLetterCase, mdiPackageUp,
    mdiSquareEditOutline, mdiPencil, mdiChevronLeft, mdiChevronRight,
    mdiFileUpload, mdiReply, mdiStarOutline, mdiStar,
  } from '@mdi/js'
  import configurationRow from '../components/configuration/configurationRow'
  import { filterData, SearchType } from 'filter-data'
  import sort from 'fast-sort'
  import NewConfigurationRow from '@/components/configuration/newConfigurationRow'
  import constantVariable from '@/components/base/constantVariable'

  export default {
    name: 'Configuration',
    components: {
      NewConfigurationRow,
      configurationRow,
      constantVariable,
    },
    data: () => ({
      bases: {
        items: [],
        loading: true,
        baseValues: {},
        baseItems: {},
      },
      filterPanel: {
        show: false,
      },
      constantVariables: {
        show: false,
        editable: true,
        items: [],
      },
      promotionDialog: {
        show: false,
        configuration: [],
        headers: [
          {
            text: 'Configuration',
            value: 'text',
          },
          {
            text: 'Version',
            value: 'version',
          },
          {
            text: 'Effective date',
            value: 'effectiveDate',
          },
        ],
      },
      importDialog: {
        show: false,
        file: null,
        type: 'text/plain',
        separator: { text: 'Semicolon (;)', value: ';' },
        separators: [{ text: 'Semicolon (;)', value: ';' },
                     { text: 'Comma (,)', value: ',' },
                     { text: 'Tab (    )', value: '\t' },
                     { text: 'Space ( )', value: ' ' }],
      },
      configuration: {
        promoted: [],
        showSaveButton: false,
        configInfo: null,
        loading: false,
        valid: true,
        items: [],
        shownVersion: 0,
        maxVersion: 0,
        draftVersions: [],
        lazyVisible: {},
        versions: [],
        editMode: false,
        saveAsDraft: false,
        saving: false,
        currentGlobals: [],
        currentRules: [],
        filter: {
          filter: '',
          caseSensitive: false,
        },
      },
      icons: {
        mdiFormatLetterCaseLower,
        mdiFormatLetterCase,
        mdiPackageUp,
        mdiSquareEditOutline,
        mdiPencil,
        mdiChevronLeft,
        mdiChevronRight,
        mdiFileUpload,
        mdiReply,
        mdiStarOutline,
        mdiStar,
      },
    }),
    computed: {
      saveButtonText () {
        return this.configuration.saveAsDraft === true ? 'Save configuration as draft' : 'Save configuration'
      },
      currentVersion () {
        return this.configuration.shownVersion
      },
      isCurrentConfigurationPromoted () {
        if (this.configuration.versions.length === 0) {
          return false
        }

        if (this.configuration.versions[this.configuration.shownVersion]) {
          return this.configuration.versions[this.configuration.shownVersion].promoted
        } else {
          return false
        }
      },
      differentThanShownVersion () {
        if (this.configuration.versions.length === 0) {
          return false
        }

        let different = false

        if (this.configuration.versions[this.configuration.shownVersion]) {
          const items = this.configuration.versions[this.configuration.shownVersion].variables
          if (items.length !== this.configuration.items.length) {
            return true
          }

          items.forEach(el => {
            const found = this.configuration.items.find(curr => {
              return curr.name === el.name && curr.value === el.value
            })

            if (!found) {
              different = true
            }
          })
        }

        return different
      },
      differentThanPrevVersion () {
        if (this.configuration.versions.length === 0 && this.configuration.items.length === 0) {
          return false
        } else if (this.configuration.versions.length === 0 && this.configuration.items.length > 0) {
          return true
        }

        if (this.configuration.maxVersion >= 0) {
          if (this.configuration.versions[this.configuration.maxVersion].variables.length !==
            this.configuration.items.length) {
            return true
          }
        }

        let different = false
        this.configuration.items.forEach(el => {
          if (this.configuration.maxVersion >= 0) {
            const prev = this.configuration.versions[this.configuration.maxVersion].variables.find(history => {
              return history.name === el.name
            })

            if (!prev || el.value !== prev.value) {
              different = true
            } else if (prev && prev.type !== el.type) {
              different = true
            }
          }
        })

        return different
      },
      filteredItems () {
        const filter = this.configuration.filter.filter

        let allItems = [...this.configuration.items]

        if (this.configuration.versions.length > 0 && allItems.length > 0 && this.configuration.editMode === false) {
          const currentVersion = this.configuration.versions[this.configuration.shownVersion]
          if (currentVersion) {
            const variables = currentVersion.variables

            variables.forEach(variable => {
              const found = allItems.find(el => {
                return el.name === variable.name
              })

              if (!found) {
                const newObject = {}
                Object.assign(newObject, variable)
                newObject.deleted = true
                allItems.push(newObject)
              }
            })
          }
        }

        if (filter) {
          const searchConditions = [
            {
              key: ['name', 'value', 'currentVersionValue'],
              value: filter,
              type: SearchType.LK,
            },
          ]

          allItems = filterData(allItems, searchConditions,
                                { caseSensitive: this.configuration.filter.caseSensitive })
        }

        sort(allItems).asc(u => u.name)

        return allItems
      },
      filteredConstantVariables () {
        let allItems = [...this.constantVariables.items]
        const filter = this.configuration.filter.filter

        if (filter) {
          const searchConditions = [
            {
              key: ['name', 'value'],
              value: filter,
              type: SearchType.LK,
            },
          ]

          allItems = filterData(allItems, searchConditions,
                                { caseSensitive: this.configuration.filter.caseSensitive })
        }

        sort(allItems).asc(u => u.name)

        return allItems
      },
      versionLabel () {
        if (this.configuration.versions.length === 0) {
          return null
        } else {
          let date = Date.parse(this.configuration.versions[this.configuration.shownVersion].effectiveDate)
          date = new Date(date)
          date = date.toLocaleString(undefined, { timeZoneName: 'short' })

          const versionLabel =
            this.configuration.shownVersion !== this.configuration.maxVersion
              ? date
              : `latest (${date})`
          const draft = this.configuration.versions[this.configuration.shownVersion].draft === true ? '[ DRAFT ]' : ''
          return `Version #${this.configuration.shownVersion + 1} - ${versionLabel} ${draft}`
        }
      },
    },
    watch: {
      currentVersion (actual) {
        this.assignCurrentVersionValues(actual)
      },
    },
    async mounted () {
      await this.setBaseItems()
    },
    methods: {
      //* *******************
      // HELPERS
      //* *******************
      baseLoading (sequenceNumber) {
        return !this.bases.baseValues[sequenceNumber]
          ? false : this.bases.baseValues[sequenceNumber].loading
      },
      nextVersion () {
        if (this.configuration.shownVersion + 1 <= this.configuration.maxVersion) {
          this.configuration.shownVersion++
        }
      },
      previousVersion () {
        if (this.configuration.shownVersion - 1 >= 0) {
          this.configuration.shownVersion--
        }
      },
      //* *******************
      // Base Model Functions
      //* *******************
      async setBaseItems () {
        this.bases.loading = true
        const response = await this.axios.get(
          `${this.$store.state.mainUrl}/baseConfigurations?filter={"order":"sequenceNumber ASC"}`,
        )

        if (response.status === 200) {
          this.bases.items = response.data
        }

        if (this.bases.items.length > 0) {
          await this.fillNextArray(0)
        }

        this.bases.loading = false
      },
      async fillNextArray (sequenceNumber, value) {
        this.configuration.showSaveButton = false
        this.configuration.editMode = undefined
        this.configuration.items = []
        this.configuration.configInfo = 'Constant Variables'

        this.filterPanel.show = sequenceNumber > 0 && this.bases.baseValues[0]?.id !== undefined
        this.constantVariables.show = sequenceNumber > 0 && this.bases.baseValues[0]?.id !== undefined

        this.constantVariables.editable = this.isConstEditable(sequenceNumber)

        this.configuration.maxVersion = -1
        this.configuration.items = []

        if (!value && this.bases.baseItems[sequenceNumber]) {
          for (let i = sequenceNumber; i < this.bases.items.length; i++) {
            this.bases.baseItems[i] = undefined
          }

          this.$forceUpdate()
          return
        }

        if (sequenceNumber >= this.bases.items.length && value) {
          this.constantVariables.show = false
          this.$forceUpdate()
          await this.getConfiguration()
          return
        }

        if (this.bases.items[sequenceNumber] === undefined) {
          return
        }

        this.bases.baseValues[sequenceNumber] = {
          loading: true,
        }

        const baseName = this.bases.items[sequenceNumber].name

        const response = await this.axios.get(
          `${this.$store.state.mainUrl}/configurationModels?filter={"where":{"base": "${baseName}"}}`,
        )

        if (response.status === 200) {
          this.bases.baseItems[sequenceNumber] = response.data
        }

        this.bases.baseValues[sequenceNumber] = {
          loading: false,
        }

        await this.getConstantVariables(sequenceNumber)

        this.$forceUpdate()
      },
      //* *******************
      // Base Model Functions
      //* *******************
      async getConfiguration () {
        this.configuration.loading = true
        this.configuration.showSaveButton = false
        this.configuration.editMode = false
        this.configuration.items = []
        this.configuration.promoted = []

        this.configuration.lazyVisible = {}

        this.configuration.configInfo = 'Configuration'

        const filter = {
          where: {},
          order: 'version DESC',
        }

        const constWhere = {}
        let rules = []

        for (let i = 0; i < this.bases.items.length; i++) {
          const el = this.bases.baseValues[i]
          filter.where[el.base] = el.name
          constWhere[el.base] = el.name
          rules = rules.concat(el.rules)
        }

        await this.getPromoted()

        const configuration = await this.axios.get(
          `${this.$store.state.mainUrl}/configurations?filter=${JSON.stringify(filter)}`,
        )

        const constVariablesRes = await this.axios.get(`${this.$store.state.mainUrl
        }/constantVariables/findLatest?filter=${JSON.stringify(constWhere)}`)

        let history = configuration.data.slice()
        history = history.reverse()

        this.configuration.currentGlobals = [...constVariablesRes.data]
        this.configuration.currentRules = [...rules]
        this.configuration.versions = history === undefined ? [] : [...history]

        if (configuration.data.length > 0) {
          this.setItems([...configuration.data[0].variables], this.configuration.currentGlobals,
                        this.configuration.versions)
        } else {
          this.configuration.lazyVisible = {}
          this.configuration.items = []
          this.configuration.maxVersion = -1
          this.configuration.shownVersion = -1

          this.configuration.editMode = true
          this.configuration.loading = false

          this.configuration.configInfo = 'Configuration - Design mode'

          this.setItems([], this.configuration.currentGlobals, this.configuration.versions)
          return
        }

        this.configuration.configInfo = 'Configuration - Edit mode'

        this.configuration.showSaveButton = true

        this.configuration.loading = false
      },
      setItems (items, globalVariables, history) {
        this.configuration.lazyVisible = {}
        this.configuration.items = []
        this.configuration.maxVersion = history.length - 1
        this.configuration.shownVersion = history.length - 1

        globalVariables.forEach(global => {
          if (global.addIfAbsent === true) {
            const found = items.find(item => {
              return item.name === global.name
            })

            if (!found) {
              items.push({
                name: global.name,
                value: global.value,
                type: global.type,
                isNew: true,
              })
            }
          }
        })

        items.forEach(el => {
          this.addConfigurationRow(el)
        })
      },
      showPromotionDialog () {
        this.promotionDialog.configuration = []
        this.promotionDialog.show = true

        this.configuration.promoted.forEach(promoted => {
          let text = ''
          this.bases.items.forEach(value => {
            text += `${promoted[value.name]} > `
          })

          text = text.slice(0, -3)

          this.promotionDialog.configuration.push({
            text: text,
            configuration: promoted,
            version: promoted.version,
            effectiveDate: promoted.effectiveDate,
          })
        })
      },
      loadPromoted (promoted) {
        this.configuration.items = []
        this.promotionDialog.show = false
        this.$nextTick(() => {
          this.setItems(promoted.configuration.variables,
                        this.configuration.currentGlobals, this.configuration.versions)
        })
      },
      async getPromoted () {
        const objectFilter = {}
        for (let i = 0; i < this.bases.items.length; i++) {
          if (!this.bases.baseValues[i] || !this.bases.baseValues[i].base) {
            return
          }
          objectFilter[this.bases.baseValues[i].base] = this.bases.baseValues[i].name
        }

        const candidates = await this.axios.post(
          `${this.$store.state.mainUrl}/configurations/promotionCandidates`,
          objectFilter,
        )

        if (candidates.status === 200 && candidates.data) {
          this.configuration.promoted = candidates.data
        }
      },
      async saveConfiguration () {
        this.configuration.saving = true
        this.configuration.loading = true

        this.configuration.items.forEach(el => {
          this.configuration.lazyVisible[el.name] = true
        })

        this.$nextTick(async () => {
          if (this.$refs.configValidation.validate()) {
            this.configuration.items.map(el => {
              if (el.type === 'list' && el.value === '') {
                el.value = []
              }
            })

            const items = []
            this.configuration.items.forEach(item => {
              if (!item.value) {
                if (item.type === 'list') {
                  item.value = []
                } else if (item.type === 'number') {
                  item.value = 0
                } else if (item.type === 'boolean') {
                  item.value = false
                } else {
                  item.value = ''
                }
              }

              items.push({
                name: item.name,
                value: item.value,
                type: item.type,
              })
            })

            const conf = {
              variables: items,
              promoted: false,
              description: '',
              draft: this.configuration.saveAsDraft,
            }

            for (let i = 0; i < this.bases.items.length; i++) {
              const base = this.bases.baseValues[i]
              conf[base.base] = base.name
            }

            await this.axios.post(
              `${this.$store.state.mainUrl}/configurations`,
              conf,
            )

            this.configuration.items = []

            await this.getConfiguration()

            this.configuration.saving = false
            this.configuration.loading = false
          } else {
            this.configuration.loading = false
            this.$store.commit(
              'setError',
              'Your configuration is invalid. Please review and correct it.',
            )

            this.configuration.saving = false
            this.configuration.loading = false
          }
        })
      },
      addConfigRow (el) {
        const found = this.configuration.items.find(item => {
          return item.name === el.name
        })

        if (found) {
          this.$refs.newConfigurationRow.errorMessage = 'Variable with this name exists already'
        } else {
          this.addConfigurationRow(el)
          this.assignCurrentVersionValues(this.currentVersion)

          this.$refs.newConfigurationRow.reset()
          this.$refs.newConfigurationRow.focus()
        }
      },
      addConfigurationRow (el) {
        let isNew = false
        const rules = this.configuration.currentRules
        const globalVariables = this.configuration.currentGlobals
        const history = this.configuration.versions.length > 0
          ? this.configuration.versions[this.configuration.versions.length - 1].variables : []

        const foundGlobal = globalVariables.find(global => {
          return global.name === el.name
        })

        let value = el.value
        let type = el.type
        let forcedValue = false
        let forcedCause
        if (foundGlobal !== undefined) {
          value = foundGlobal.forced === true ? foundGlobal.value : value
          type = foundGlobal.forced === true ? foundGlobal.type : type
          el.addIfAbsent = foundGlobal.addIfAbsent
          forcedValue = foundGlobal.forced
          if (forcedValue) {
            forcedCause = `Value forced by ${foundGlobal.source}`
          }
        }

        const itemRules = rules.filter(rule => {
          if (rule.targetRegEx) {
            const regEx = new RegExp(rule.targetValue)
            return regEx.test(el.name)
          } else {
            return rule.targetValue === el.name
          }
        })

        let currentVersionValue = history.find(hist => {
          return el.name === hist.name
        })

        if (currentVersionValue) {
          isNew = false
        } else {
          isNew = true
        }

        const historyValue = history.length > 0 ? '' : undefined

        currentVersionValue = currentVersionValue || { value: historyValue }

        const item = {
          name: el.name,
          value: value,
          type: type,
          currentVersionValue: currentVersionValue.value,
          currentVersionType: type,
          deleted: false,
          rules: itemRules,
          forcedValue: forcedValue,
          forcedCause: forcedCause,
          addIfAbsent: el.addIfAbsent,
          draft: false,
          isNew: isNew,
        }

        this.configuration.items.push(item)
      },
      async promoteConfiguration () {
        if (this.configuration.versions.length === 0) {
          return false
        }

        if (this.configuration.versions[this.configuration.shownVersion] &&
          !this.configuration.versions[this.configuration.shownVersion].promoted) {
          const id = this.configuration.versions[this.configuration.shownVersion].id

          const configuration = await this.axios.post(
            `${this.$store.state.mainUrl}/configurations/${id}/promote`)

          if (configuration.status === 200) {
            this.configuration.versions[this.configuration.shownVersion].promoted = true
          }
        }
      },
      revertToCurrentVersion () {
        if (this.configuration.versions[this.configuration.shownVersion]) {
          this.configuration.loading = true
          const shownVersion = this.configuration.shownVersion

          this.configuration.items = []
          this.$nextTick(() => {
            const items = [...this.configuration.versions[this.configuration.shownVersion].variables]

            this.setItems(items, this.configuration.currentGlobals, this.configuration.versions)
            this.configuration.loading = false
            this.$nextTick(() => {
              this.configuration.shownVersion = shownVersion
            })
          })
        }
      },
      changeEditMode () {
        const items = [...this.configuration.items]
        this.configuration.items = []

        this.configuration.editMode = this.configuration.editMode ? false : !this.configuration.editMode
        this.configuration.showSaveButton = !this.configuration.showSaveButton

        if (this.configuration.editMode === true) {
          this.configuration.configInfo = 'Configuration - Design mode'
        } else if (this.configuration.editMode === false) {
          this.configuration.configInfo = 'Configuration - Edit mode'
        } else {
          this.configuration.configInfo = 'Constant Variables'
        }

        this.configuration.lazyVisible = {}

        this.$nextTick(() => {
          this.configuration.items = items
        })
      },
      assignCurrentVersionValues (actual) {
        if (this.configuration.items.length > 0 && this.configuration.maxVersion >= 0) {
          this.configuration.items.map(current => {
            const found = this.configuration.versions[actual].variables.find(history => {
              return history.name === current.name
            })

            if (found) {
              current.currentVersionValue = found.value
              current.currentVersionType = found.type
            } else {
              current.currentVersionValue = ''
              current.currentVersionType = undefined
            }
          })
        }
      },
      removeConfigurationRow (data) {
        this.configuration.items = this.configuration.items.filter(el => {
          return el.name !== data.name
        })
      },
      variableTypeChange (data) {
        this.configuration.items.map(el => {
          if (el.name === data.name) {
            el.type = data.type

            if (data.type === 'list') {
              el.value = [el.value]
            } else if (data.type === 'number') {
              el.value = Number(el.value)
            } else if (data.type === 'boolean') {
              el.value = !!el.value
            } else {
              el.value = `${el.value}`
            }
          }
        })
      },
      //* *******************
      // Constant Variables
      //* *******************
      async getConstantVariables (sequenceNumber) {
        if (sequenceNumber === 0 || this.bases.baseValues[sequenceNumber - 1] === undefined) {
          return
        }

        this.configuration.configInfo = 'Constant Variables'

        const objectFilter = {}
        for (let i = 0; i < sequenceNumber; i++) {
          objectFilter[this.bases.baseValues[i].base] = this.bases.baseValues[i].name
        }

        const filter = {
          where: objectFilter,
          order: 'effectiveDate DESC',
        }

        const response = await this.axios.get(
          `${this.$store.state.mainUrl}/constantVariables?filter=${JSON.stringify(filter)}`)

        if (response.status === 200 && response.data.length > 0) {
          this.constantVariables.items = response.data[0].variables
        }
      },
      isConstEditable (sequenceNumber) {
        let editable = false
        let seq = sequenceNumber - 1

        if (!this.bases.baseValues[seq]?.id) {
          seq--
          if (!this.bases.baseValues[seq]?.id) {
            return false
          }
        }

        const prefix = `configurationModel.${this.bases.baseValues[seq].base}.${
          this.bases.baseValues[seq].name}`

        if (this.$store.state.userRoles.includes('configurationModel.modify')) {
          if (this.$store.state.userRoles.includes(`${prefix}.modify`)) {
            editable = true
          } else if (!this.$store.state.userRoles.includes(`${prefix}.view`)) {
            editable = true
          }
        }

        return editable
      },
      async addConstantVariable (data) {
        const exists = this.constantVariables.items.find(el => {
          return el.name === data.name
        })

        if (exists) {
          this.$refs.newConstantVariable.errorMessage = 'Constant variable with this name exists already'
        } else {
          this.$refs.newConstantVariable.reset()
        }

        this.constantVariables.items.push(data)

        const post = {
          variables: [...this.constantVariables.items],
        }

        for (let i = 0; i < this.bases.items.length; i++) {
          const base = this.bases.baseValues[i]
          if (base && base.base) {
            post[base.base] = base.name
          }
        }

        await this.axios.post(`${this.$store.state.mainUrl}/constantVariables`, post)
      },
      async deleteConstantVariable (name) {
        this.constantVariables.items = this.constantVariables.items.filter(el => {
          return el.name !== name
        })

        const post = {
          variables: [],
        }

        this.constantVariables.items.forEach(el => {
          post.variables.push({
            name: el.name,
            value: el.value,
            type: el.type,
            forced: el.forced,
            addIfAbsent: el.addIfAbsent,
          })
        })

        for (let i = 0; i < this.bases.items.length; i++) {
          const base = this.bases.baseValues[i]
          if (base && base.base) {
            post[base.base] = base.name
          }
        }

        await this.axios.post(`${this.$store.state.mainUrl}/constantVariables`, post)
      },
      async changeConstantVariable (all) {
        this.constantVariables.items.map(el => {
          if (el.name === all.name) {
            el.type = all.type
            el.value = all.value
            el.forced = all.forced
            el.addIfAbsent = all.addIfAbsent
          }
        })

        const post = {
          variables: [],
        }

        this.constantVariables.items.forEach(el => {
          post.variables.push({
            name: el.name,
            value: el.value,
            type: el.type,
            forced: el.forced,
            addIfAbsent: el.addIfAbsent,
          })
        })

        for (let i = 0; i < this.bases.items.length; i++) {
          const base = this.bases.baseValues[i]
          if (base && base.base) {
            post[base.base] = base.name
          }
        }

        await this.axios.post(`${this.$store.state.mainUrl}/constantVariables`, post)
      },
      //* *******************
      // Import from file
      //* *******************
      async onImportFileChange (file) {
        if (file !== null && file !== undefined) {
          if (file.type === 'text/plain' || file.type === 'application/json' || file.type === 'text/csv') {
            this.importDialog.type = file.type
          }
        }
      },
      closeImportDialog () {
        this.importDialog.show = false
        this.importDialog.file = null
        this.importDialog.type = 'text/plain'
      },
      async onImportButtonClicked () {
        if (this.importDialog.file !== null && this.importDialog.file !== undefined) {
          const text = await this.importDialog.file.text()
          if (this.importDialog.type === 'text/plain') {
            this.importCSV(text, '=')
          } else if (this.importDialog.type === 'text/csv') {
            this.importCSV(text, this.importDialog.separator.value)
          } else if (this.importDialog.type === 'application/json') {
            this.importJSON(text)
          }
        }
      },
      importJSON (text) {
        try {
          const obj = JSON.parse(text)
          const items = []

          Object.getOwnPropertyNames(obj).forEach(name => {
            let type = typeof obj[name]
            if (type === 'object' && Array.isArray(obj[name])) {
              type = 'list'
            }

            items.push({
              name: name,
              value: obj[name],
              type: type,
            })
          })

          this.configuration.items = []
          this.$nextTick(() => {
            this.setItems(items, this.configuration.currentGlobals, this.configuration.versions)
            this.closeImportDialog()
          })
        } catch (error) {
          console.error(error)
          this.closeImportDialog()
          this.$store.commit('setError', 'Invalid JSON file: ' + error.message)
        }
      },
      importCSV (text, separator) {
        const regex = /\r\n/g
        text = text.replaceAll(regex, '\n')
        const split = text.split('\n')
        const importedMap = new Map()

        split.forEach(line => {
          if (line.includes(separator)) {
            const split = line.split(separator)
            const name = split[0]
            const value = split[1]

            if (name && value) {
              importedMap.set(name, value)
            }
          }
        })

        if (importedMap.size > 0) {
          const items = []
          this.configuration.items = []

          importedMap.forEach((v, k) => {
            items.push({
              name: k,
              value: v,
              type: 'string',
            })
          })

          this.$nextTick(() => {
            this.setItems(items, this.configuration.currentGlobals, this.configuration.versions)
            this.closeImportDialog()
          })
        }
      },
    },
  }
</script>

<style scoped>
.configurationTitle {
  height: 40px;
  color: lightgray;
  margin-bottom: 10px;
  margin-top: 0px;
  cursor: default;
}
.thirdWidth {
  max-width: 32%;
  width: 32%;
}
</style>

<style>
.promotionDialogTable > div > table > tbody > tr:hover {
  cursor: pointer;
}
</style>
