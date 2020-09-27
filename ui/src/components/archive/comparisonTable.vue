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
  <div v-if="configurationsLength > 0">
    <div class="d-flex flex-row justify-space-around pb-5">
      <div
        :style="maxWidth"
        class="subtitle-1 font-weight-bold text-center archiveTitle"
      >
        Variable Name
      </div>
      <div
        v-for="l in configurationsLength"
        :key="l"
        :style="maxWidth"
        class="caption font-weight-bold text-center"
      >
        <v-btn
          icon
          box
          small
          style="float: right; margin-top: -10px;"
          class="mr-2"
          @click="removeColumn(l)"
        >
          <v-icon small>
            {{ icons.mdiClose }}
          </v-icon>
        </v-btn>
        <div
          v-if="dateversion"
          class="text-center"
        >
          <div
            class="archiveTitle pl-7"
            v-text="getVersionText(l)"
          />
          <div
            class="dateLink"
            @click="onHeaderClicked(l)"
            v-text="getDateText(l)"
          />
        </div>
        <div
          v-else
          class="archiveTitle pl-9"
          v-text="getVersionText(l)"
        />
        <div
          class="font-italic font-weight-light"
          v-text="getVersionCreatorText(l)"
        />
      </div>
    </div>
    <v-divider />
    <transition-group
      :class="innerclass === null ? '' : innerclass"
      name="fade"
      tag="div"
    >
      <div
        v-for="variable of filteredItems"
        :key="variable"
      >
        <div class="d-flex flex-row justify-space-around">
          <div
            :style="maxWidth"
            :class="
              isDifferent(variable)
                ? 'different text-center px-3 py-4'
                : 'text-center px-3 py-4'
            "
          >
            {{ variable }}
          </div>
          <div
            v-for="l in configurationsLength"
            :key="l"
            :style="maxWidth"
            :class="
              isDifferent(variable)
                ? 'different font-weight-light text-center px-3 py-4'
                : 'font-weight-light text-center px-3 py-4'
            "
            v-html="findVariableValue(l, variable)"
          />
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script>
  import { mdiClose } from '@mdi/js'

  export default {
    name: 'ComparisonTable',
    props: {
      configurations: {
        type: Array,
        default: () => {
          return []
        },
      },
      bases: {
        type: Array,
        default: () => {
          return []
        },
      },
      filter: {
        type: Object,
        required: true,
      },
      dateversion: {
        type: Boolean,
        default: false,
      },
      innerclass: {
        type: String,
        required: false,
        default: null,
      },
    },
    data: () => ({
      icons: {
        mdiClose,
      },
      variables: new Set(),
      local_items: [],
    }),
    computed: {
      configurationsLength () {
        this.onConfigurationsChange()
        return this.configurations.length
      },
      maxWidth () {
        const max = 100 / (this.configurations.length + 1)
        return `max-width: ${max}%; width: ${max}%`
      },
      filteredItems () {
        const filter = this.filter.filter

        if (filter === undefined || filter === null || filter === '') {
          return this.local_items
        }

        let regEx = null
        if (this.filter.caseSensitive) {
          regEx = new RegExp(filter)
        } else {
          regEx = new RegExp(filter, 'i')
        }

        return this.local_items.filter(el => {
          if (regEx.test(el)) {
            return true
          } else {
            for (let i = 0; i < this.configurationsLength; i++) {
              const text = this.findVariableValue(i + 1, el)
              if (text !== null) {
                if (regEx.test(text)) {
                  return true
                }
              }
            }
          }

          return false
        })
      },
    },
    methods: {
      onHeaderClicked (configIndex) {
        configIndex--
        const config = this.configurations[configIndex]
        this.$emit('headerClicked', {
          index: configIndex,
          dateTime: config.effectiveDate,
        })
      },
      onConfigurationsChange () {
        this.variables.clear()
        this.configurations.forEach(config => {
          config.variables.forEach(variable => {
            this.variables.add(variable.name)
          })
        })

        this.local_items = Array.from(this.variables).sort()
      },
      findVariableValue (configIndex, name) {
        configIndex--
        const variable = this.configurations[configIndex].variables.find(el => {
          return el.name === name
        })

        if (variable === undefined) {
          return '<i style="color:gray">No variable</i>'
        } else {
          return variable.value
        }
      },
      getVersionCreatorText (configIndex) {
        configIndex--
        const config = this.configurations[configIndex]

        const text = `Created by: ${config.createdByUser}`

        return text
      },
      getDateText (configIndex) {
        configIndex--
        const config = this.configurations[configIndex]

        return new Date(config.effectiveDate).toLocaleString(undefined, { timeZoneName: 'short' })
      },
      getVersionText (configIndex) {
        configIndex--
        const config = this.configurations[configIndex]

        let text = ''
        this.bases.forEach(base => {
          const add = config[base.name]
          if (add !== undefined) {
            text += add
            text += ' > '
          }
        })

        if (!this.dateversion) {
          text += `#${config.version}`
        } else {
          text = text.substring(0, text.length - 3)
        }

        return text
      },
      forceUpdate () {
        this.$forceUpdate()
      },
      removeColumn (archiveColumn) {
        archiveColumn--
        this.$emit('removeArchiveColumn', archiveColumn)
      },
      isDifferent (name) {
        if (this.configurations.length < 2) {
          return false
        }

        const varList = []
        this.configurations.forEach(config => {
          const variable = config.variables.find(el => {
            return el.name === name
          })

          varList.push(variable)
        })

        const first = varList[0] === undefined ? undefined : varList[0].value
        let diff = false
        varList.forEach(el => {
          const value = el === undefined ? undefined : el.value
          if (first !== value) {
            diff = true
          }
        })

        return diff
      },
    },
  }
</script>

<style scoped>
.archiveTitle {
  margin-top: 10px;
}

.different {
  background: #f2a52a69;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.4s;
}
.list-enter, .list-leave-to /* .list-leave-active below version 2.1.8 */ {
  opacity: 0;
  transform: translateY(30px);
}
.dateLink {
  cursor: pointer;
  text-decoration: underline;
}
</style>
