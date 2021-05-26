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
      v-model="noConfigDialog"
      max-width="500"
      persistent
    >
      <v-card>
        <v-card-title
          class="headline primary"
          primary-title
        >
          Warning
        </v-card-title>
        <br>

        <v-card-text class="title">
          No configuration for given date
        </v-card-text>
        <v-divider />

        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            text
            @click="noConfigDialog = false"
          >
            OK
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="dialog"
      width="720"
      persistent
    >
      <v-card>
        <v-card-title
          class="headline primary"
          primary-title
        >
          Change date
        </v-card-title>
        <br>
        <div class="text-center">
          <v-date-picker
            v-model="date"
            color="primary"
            style="height:392px"
            class="mx-5"
            elevation="1"
          />
          <v-time-picker
            v-model="time"
            :format="timeFormat"
            color="primary"
            use-seconds
            style="height:392px"
            scrollable
            elevation="1"
            class="mx-5 mb-2"
          />
        </div>
        <v-divider />

        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            text
            @click="changeTimeForConfig"
          >
            OK
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <div class="d-flex">
      <v-autocomplete
        v-for="base of baseArray"
        ref="base"
        :key="base.name"
        v-model="values[base.sequenceNumber]"
        :loading="loading"
        :disabled="configuration.items.length > 3"
        :prepend-icon="base.icon"
        :label="base.name"
        :items="arrayOfArrays[base.sequenceNumber]"
        class="pa-2"
        item-text="name"
        clearable
        autocomplete="off"
        return-object
        @change="fillNextArray(base.sequenceNumber)"
      />
    </div>
    <div class="headline font-weight-light text-center configurationTitle">
      {{ configInfo }}
    </div>
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
            class="px-4"
            style="max-width: 33%"
            @click:append="
              configuration.filter.caseSensitive = !configuration.filter
                .caseSensitive
            "
          />
        </div>
        <v-progress-linear
          :active="loading"
          :height="3"
          indeterminate
        />
        <v-divider class="pb-5" />
        <comparisonTable
          ref="comparisonTable"
          :configurations="configuration.items"
          :bases="baseArray"
          :dateversion="true"
          :filter="configuration.filter"
          innerclass="configParent"
          @removeArchiveColumn="removeArchiveColumn"
          @headerClicked="dateHeaderClicked"
        />
      </v-card>
    </transition>
  </div>
</template>

<script>
  import { mdiNumeric, mdiFormatLetterCase, mdiFormatLetterCaseLower, mdiCalendar, mdiClockOutline } from '@mdi/js'
  import comparisonTable from '../components/archive/comparisonTable'

  export default {
    name: 'TimeArchive',
    components: {
      comparisonTable,
    },
    data: () => ({
      values: [],
      date: new Date().toISOString().substr(0, 10),
      dateMenu: false,
      time: '23:59:00',
      timeMenu: false,
      baseArray: [],
      arrayOfArrays: [],

      dialog: false,
      configToTimeChange: -1,

      noConfigDialog: false,

      loading: false,

      icons: {
        mdiNumeric,
        mdiFormatLetterCase,
        mdiFormatLetterCaseLower,
        mdiCalendar,
        mdiClockOutline,
      },

      configuration: {
        items: [],
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
      timeFormat () {
        const date = new Date().toLocaleString()

        if (date.includes('AM') || date.includes('PM')) {
          return 'ampm'
        } else {
          return '24hr'
        }
      },
    },
    async created () {
      const response = await this.axios.get(
        `${this.$store.state.mainUrl}/baseConfigurations?filter={"order":"sequenceNumber ASC"}`,
      )

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
      async getArrayFromBase (base, sequenceNumber) {
        const array = await this.axios.get(
          `${this.$store.state.mainUrl}/configurationModels?filter={"where":{"base": "${base}"}}`,
        )

        array.data.sort((a, b) => {
          return a.name.toUpperCase().localeCompare(b.name.toUpperCase())
        })

        this.arrayOfArrays[sequenceNumber] = array.data
      },
      async fillNextArray (sequenceNumber) {
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
            const ok = await this.getConfiguration()
            if (ok === true) {
              this.$refs.base.forEach(ref => {
                ref.blur()
              })

              this.values[this.values.length - 1] = null
              this.$forceUpdate()
            }
          }
        }
      },
      async getConfiguration (date, time, index, replaceFilter) {
        let filter = ''

        if (date === undefined) {
          date = new Date().toISOString().substr(0, 10)
        }
        if (time === undefined) {
          time = '23:59:00'
        }

        this.loading = true

        if (replaceFilter !== undefined) {
          filter = replaceFilter
        } else {
          this.values.forEach(value => {
            filter += `"${value.base}":"${value.name}",`
          })

          filter = filter.substring(0, filter.length - 1)
        }

        const d = new Date(`${date}T${time}`)

        const configuration = await this.axios.get(
          `${this.$store.state.mainUrl}/configurations/findByDate?filter={${filter}}&date=${d.toUTCString()}`,
        )

        if (configuration.data.effectiveDate === undefined) {
          this.noConfigDialog = true
          this.loading = false
          return true
        } else {
          const details = await this.axios.get(
            `${this.$store.state.mainUrl}/members/getUserDetails?userId=${configuration.data.createdBy}`,
          )

          if (details.data[0] !== null) {
            configuration.data.createdByUser = details.data.username
          }

          configuration.data.effectiveDate = `${d.toUTCString()}`
          configuration.data.__filter = filter

          if (index !== undefined) {
            this.configuration.items[index] = configuration.data
            this.$refs.comparisonTable.onConfigurationsChange()
            this.$refs.comparisonTable.forceUpdate()
          } else {
            this.configuration.items.push(configuration.data)
          }
        }

        this.loading = false

        return true
      },
      async dateHeaderClicked ({ index, dateTime }) {
        const date = new Date(dateTime)
        this.date = date.toISOString().substr(0, 10)
        const hours = `${date.getHours()}`.length === 1 ? `0${date.getHours()}` : `${date.getHours()}`
        const minutes = `${date.getMinutes()}`.length === 1 ? `0${date.getMinutes()}` : `${date.getMinutes()}`
        const seconds = `${date.getSeconds()}`.length === 1 ? `0${date.getSeconds()}` : `${date.getSeconds()}`
        this.time = `${hours}:${minutes}:${seconds}`

        this.configToTimeChange = index

        this.dialog = true
      },
      removeArchiveColumn (column) {
        this.configuration.items.splice(column, 1)
      },
      async changeTimeForConfig () {
        const filter = this.configuration.items[this.configToTimeChange].__filter

        await this.getConfiguration(this.date, this.time, this.configToTimeChange, filter)

        this.dialog = false
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

<style lang="scss">
.v-time-picker-clock__item {
  cursor: pointer;
}

.configParent {
  max-height: calc(100vh - 500px);
  overflow-y: auto;
}
</style>
