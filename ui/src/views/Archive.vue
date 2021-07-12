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
      v-model="warningDialog"
      max-width="500px"
    >
      <v-card>
        <v-card-title
          class="primary"
          primary-title
        >
          Warning
        </v-card-title>
        <v-card-text class="pt-4">
          {{ warningText }}
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            text
            @click="warningDialog = false"
          >
            OK
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <div class="d-flex">
      <v-autocomplete
        v-for="base of baseArray"
        :key="base.name"
        v-model="values[base.sequenceNumber]"
        :disabled="configuration.items.length > 3"
        :prepend-icon="base.icon"
        :label="base.name"
        :loading="base.loading"
        :items="arrayOfArrays[base.sequenceNumber]"
        class="pa-2"
        item-text="name"
        clearable
        autocomplete="off"
        return-object
        @change="fillNextArray(base.sequenceNumber)"
      />
      <v-autocomplete
        v-if="baseArray.length > 0"
        ref="versionCombo"
        v-model="configuration.version"
        :disabled="configuration.items.length > 3"
        :loading="configuration.loadingVersions"
        :items="configurationVersions"
        :prepend-icon="icons.mdiNumeric"
        class="pa-2"
        autocomplete="off"
        label="version"
        item-text="full"
        clearable
        return-object
        @change="getConfiguration"
      />
    </div>
    <div class="headline font-weight-light text-center configurationTitle">
      {{ configInfo }}
    </div>
    <v-progress-linear
      :active="configuration.loading"
      :height="3"
      indeterminate
    />
    <transition
      name="slowfade"
      mode="out-in"
    >
      <v-card
        v-if="configuration.items.length > 0"
        class="pb-2 pt-5"
      >
        <div class="d-flex">
          <v-text-field
            v-model="configuration.filter.filter"
            :label="
              configuration.filter.caseSensitive
                ? 'Search (case sensitive)'
                : 'Search (case insensitive)'
            "
            :append-icon="
              configuration.filter.caseSensitive
                ? icons.mdiFormatLetterCaseLower
                : icons.mdiFormatLetterCase
            "
            clearable
            outlined
            dense
            class="px-4"
            style="max-width: 33%"
            @click:append="
              configuration.filter.caseSensitive = !configuration.filter
                .caseSensitive
            "
          />
          <v-tooltip
            v-if="promote.show"
            bottom
          >
            <template v-slot:activator="{ on }">
              <v-icon
                :color="promote.promoted ? 'primary': 'default'"
                class="ml-auto mr-3 mb-5"
                v-on="on"
                @click="promoteConfiguration"
                v-html="promote.promoted ? icons.mdiStar : icons.mdiStarOutline"
              />
            </template>
            <span>Promote configuration</span>
          </v-tooltip>
        </div>
        <v-divider class="pb-5" />
        <comparisonTable
          :configurations="configuration.items"
          :bases="baseArray"
          :filter="configuration.filter"
          innerclass="configParent"
          @removeArchiveColumn="removeArchiveColumn"
        />
      </v-card>
    </transition>
  </div>
</template>

<script>
  import comparisonTable from '../components/archive/comparisonTable'
  import { mdiNumeric, mdiFormatLetterCase, mdiFormatLetterCaseLower, mdiStar, mdiStarOutline } from '@mdi/js'

  export default {
    name: 'Archive',
    components: {
      comparisonTable,
    },
    data: () => ({
      values: [],
      baseArray: [],
      arrayOfArrays: [],
      configurationVersions: [],

      warningDialog: false,
      warningText: null,

      icons: {
        mdiNumeric,
        mdiFormatLetterCase,
        mdiFormatLetterCaseLower,
        mdiStar,
        mdiStarOutline,
      },

      promote: {
        show: false,
        promoted: false,
        configuration: null,
      },

      configuration: {
        items: [],
        loading: false,
        loadingVersions: false,
        version: null,
        configInfo: 'Find your configuration',
        filter: {
          caseSensitive: false,
          filter: null,
        },
      },
    }),
    computed: {
      configInfo () {
        if (this.configuration.items.length > 3) {
          return 'You can compare up to 4 configurations'
        } else {
          return 'Find your configuration'
        }
      },
    },
    async created () {
      this.configuration.loading = true
      const response = await this.axios.get(
        `${this.$store.state.mainUrl}/baseConfigurations?filter={"order":"sequenceNumber ASC"}`,
      )

      this.configuration.loading = false

      this.baseArray = response.data
      this.baseArray.forEach(el => {
        this.arrayOfArrays[el.sequenceNumber] = []
      })

      if (this.baseArray.length > 0) {
        await this.getArrayFromBase(this.baseArray[0].name, 0)
        this.$forceUpdate()
      }
    },
    methods: {
      canPromote (configuration) {
        if (this.configuration.items.length !== 1) {
          this.promote.show = false
          this.promote.promoted = false
          this.promote.configuration = null
          return
        }

        if (!this.$store.state.userRoles.includes('configuration.modify')) {
          return
        }

        const conf =
          configuration.data[0] === undefined
            ? configuration.data
            : configuration.data[0]

        this.promote.promoted = conf.promoted
        this.promote.configuration = configuration
        this.promote.show = true
      },
      async getArrayFromBase (base, sequenceNumber) {
        this.baseArray[sequenceNumber].loading = true

        const array = await this.axios.get(
          `${this.$store.state.mainUrl}/configurationModels?filter={"where":{"base": "${base}"}}`,
        )

        array.data.sort((a, b) => {
          return a.name.toUpperCase().localeCompare(b.name.toUpperCase())
        })

        this.arrayOfArrays[sequenceNumber] = array.data

        this.baseArray[sequenceNumber].loading = false
      },
      async fillNextArray (sequenceNumber) {
        this.configuration.loadingVersions = true

        this.configurationVersions = []
        this.configuration.version = null
        this.configuration.configInfo = 'Find your configuration'

        if (this.baseArray.length > sequenceNumber + 1) {
          const base = this.baseArray[sequenceNumber + 1].name

          for (let i = sequenceNumber + 1; i < this.arrayOfArrays.length; i++) {
            this.arrayOfArrays[i] = []
            this.values[i] = null
          }

          await this.getArrayFromBase(base, sequenceNumber + 1)

          this.$forceUpdate()
        } else {
          let undef = false

          for (const el of this.values) {
            if (el === undefined) {
              undef = true
            }
          }

          if (!undef) {
            await this.getConfigurationVersions()
          }
        }

        this.configuration.loadingVersions = false
      },
      async getConfigurationVersions () {
        let filter = ''

        this.values.forEach(value => {
          filter += `"${value.base}":"${value.name}",`
        })

        filter = filter.substring(0, filter.length - 1)

        const configuration = await this.axios.get(
          `${this.$store.state.mainUrl}/configurations?filter={"where":{${filter}},"order":"version ASC"}`,
        )

        if (configuration.data.length > 0) {
          this.configurationVersions = []
          configuration.data.forEach(async config => {
            let date = Date.parse(config.effectiveDate)
            date = new Date(date)
            date = date.toLocaleString(undefined, { timeZoneName: 'short' })
            this.configurationVersions.push({
              version: config.version,
              effectiveDate: config.effectiveDate,
              full: `#${config.version} - ${date}`,
            })
          })
        }
      },
      async getConfiguration () {
        if (this.configuration.version === undefined) {
          return
        }

        let filter = ''

        this.values.forEach(value => {
          filter += `"${value.base}":"${value.name}",`
        })

        filter += `"version":${this.configuration.version.version}`

        const configuration = await this.axios.get(
          `${this.$store.state.mainUrl}/configurations?filter={"where":{${filter}},"order":"version ASC"}`,
        )

        this.configuration.version = null
        this.$refs.versionCombo.blur()

        if (configuration.data.length > 0) {
          const found = this.configuration.items.find(config => {
            if (config.version !== configuration.data[0].version) {
              return false
            }

            return config.id === configuration.data[0].id
          })

          if (found === undefined) {
            const details = await this.axios.get(
              `${this.$store.state.mainUrl}/members/getUserDetails?userId=${configuration.data[0].createdBy}`,
            )

            if (details.status === 200) {
              configuration.data[0].createdByUser = details.data.display === undefined
                ? details.data.username : details.data.display
            }

            this.configuration.items.push(configuration.data[0])
          } else {
            this.warningText = 'This configuration was already added'
            this.warningDialog = true
          }
        }

        this.canPromote(configuration)
      },
      removeArchiveColumn (column) {
        this.configuration.items.splice(column, 1)

        if (this.configuration.items.length === 1) {
          const configuration = this.configuration.items[0]

          this.promote.promoted = configuration.promoted
          this.promote.configuration = configuration
          this.promote.show = true
        }
      },
      async promoteConfiguration () {
        if (this.promote.promoted) {
          return
        }

        const id = this.promote.configuration.data === undefined
          ? this.promote.configuration.id : this.promote.configuration.data[0].id

        const configuration = await this.axios.post(
          `${this.$store.state.mainUrl}/configurations/${id}/promote`,
        )

        if (this.promote.configuration.data === undefined) {
          this.promote.configuration.promoted = true
        } else {
          this.promote.configuration.data[0].promoted = true
        }

        this.canPromote(configuration)
      },
    },
  }
</script>

<style scoped>
.configurationTitle {
  height: 50px;
  color: lightgray;
  margin-bottom: 20px;
  margin-top: 20px;
  cursor: default;
}
</style>

<style>
.configParent {
  max-height: calc(100vh - 480px);
  overflow-y: auto;
}
</style>
