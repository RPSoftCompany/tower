<template>
  <div>
    <div class="d-flex justify-center">
      <v-card
        outlined
        class="mb-3 halfWidth"
      >
        <v-card-text class="pb-0 pt-6">
          <div class="d-flex">
            <v-select
              v-model="searchType"
              :items="['name', 'value']"
              :loading="loading"
              style="border-radius: 4px 0 0 4px; max-width: 150px"
              label="Target"
              :background-color="$vuetify.theme.dark === true ? 'var(--v-background-lighten2)'
                : 'var(--v-background-darken1)'"
              dense
              outlined
            />
            <v-text-field
              v-model="searchText"
              :label="regex === true ? 'Regular expression' : 'Text'"
              :loading="loading"
              required
              dense
              outlined
              style="border-radius: 0 4px 4px 0; margin-left: -1px"
              :placeholder="regex === true ? '^[A-Za-z]+$' : 'text'"
              :append-icon="regex === true ? icons.mdiFormatLetterCase : icons.mdiRegex"
              @click:append="regex = !regex;"
              @keydown="keydown"
            />
            <v-btn
              :disabled="!searchText"
              color="primary"
              class="ml-3"
              :loading="loading"
              style="height: 40px"
              @click="search"
            >
              Search
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </div>
    <v-card
      v-if="noDataFound"
      outlined
      class="py-5"
    >
      <v-card-text class="text-center text-h5">
        No data found for given criteria
      </v-card-text>
    </v-card>
    <v-card
      v-if="items.length > 0"
      class="mt-3"
      outlined
    >
      <v-card-text>
        <splitpanes>
          <pane :style="activeItems.length < 0 || currentValues.length < 0 ? 'width: 100%' : undefined">
            <v-card
              outlined
              style="overflow: auto; max-height: calc(100vh - 268px); width: 100%"
            >
              <v-treeview
                :active.sync="activeItems"
                hoverable
                active-class="v-treeview-node--active"
                activatable
                transition
                :items="items"
                @update:active="updateActive"
              >
                <template v-slot:prepend="{ item }">
                  <v-icon v-if="item.base">
                    {{ baseIcons[item.base] }}
                  </v-icon>
                </template>
                <template v-slot:label="{ item }">
                  <div style="cursor: default">
                    <template v-if="item.name === '__NONE__'">
                      <span style="color:gray">NONE</span>
                    </template>
                    <template v-else>
                      <span :class="{'font-weight-bold': !!variables[item.id], 'font-weight-thin': !variables[item.id]}">{{ item.name }}</span>
                    </template>
                  </div>
                </template>
              </v-treeview>
            </v-card>
          </pane>
          <pane v-if="activeItems.length > 0 && currentValues.length > 0">
            <v-card
              outlined
              class="flex-grow-1"
              style="max-height: calc(100vh - 268px); width: 100%; overflow: auto"
            >
              <div class="stickyHeader">
                <v-row
                  style="flex-wrap: nowrap; height: 48px"
                  class="ma-0"
                >
                  <v-col class="subtitle-2 font-weight-bold text-center">
                    Variable Name
                  </v-col>
                  <v-col class="subtitle-2 font-weight-bold text-center">
                    Value
                  </v-col>
                </v-row>
                <v-divider />
              </div>
              <div style="max-height: calc( 100% - 48px);">
                <v-row
                  v-for="(value, i) of currentValues"
                  :key="i"
                  class="ma-0 configRow"
                  style="cursor: pointer; height: 47px"
                >
                  <v-col class="text-center">
                    <v-icon
                      v-if="value.addIfAbsent !== undefined"
                      small
                    >
                      {{ icons.mdiAlphaCBox }}
                    </v-icon>
                    {{ value.name }}
                  </v-col>
                  <v-col class="text-center">
                    {{ value.value }}
                  </v-col>
                </v-row>
              </div>
            </v-card>
          </pane>
        </splitpanes>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
  import { mdiRegex, mdiFormatLetterCase, mdiChevronDown, mdiAlphaCBox } from '@mdi/js'
  import { Splitpanes, Pane } from 'splitpanes'
  import 'splitpanes/dist/splitpanes.css'

  export default {
    name: 'FindVariable',
    components: { splitpanes: Splitpanes, pane: Pane },
    data: () => ({
      bases: [],
      baseIcons: {},

      icons: {
        mdiRegex,
        mdiFormatLetterCase,
        mdiChevronDown,
        mdiAlphaCBox
      },

      loading: false,

      searchType: 'value',
      searchText: null,

      regex: false,

      items: [],
      activeItems: [],

      variables: [],
      currentValues: [],

      noDataFound: false,

      lastId: 0
    }),
    async mounted () {
      const response = await this.axios.get(
        `${this.$store.state.mainUrl}/baseConfigurations?filter={"order":"sequenceNumber ASC"}`
      )

      response.data.forEach(el => {
        this.bases.push(el.name)
        this.baseIcons[el.name] = el.icon
      })
    },
    methods: {
      keydown (key) {
        const keyCode = key.keyCode ? key.keyCode : key.which
        if (keyCode === 13) {
          this.search()
        }
      },
      async search () {
        const valueOrName = this.searchType === 'value'

        if (!this.search) {
          return
        }

        this.loading = true
        this.noDataFound = false

        this.items = []
        this.variables = []
        this.currentValues = []
        this.activeItems = []

        const response = await this.axios.get(
          `${this.$store.state.mainUrl}/configurations/findVariable?` +
            `searchText=${this.searchText}&valueOrName=${valueOrName}&isRegex=${this.regex}`
        )

        if (response.status === 200) {
          this.lastId = 0

          this.items = []

          if (response.data.variables.length === 0 && response.data.constantVariables.length === 0) {
            this.noDataFound = true
            this.loading = false
            return
          }

          for (let row of response.data.variables) {
            if (row.variables.length > 0) {
              let currentParent = null

              for (let base of this.bases) {
                currentParent = this.addToParent(currentParent, row[base], base)
              }

              this.variables[this.lastId - 1] = row.variables
            }
          }

          for (let row of response.data.constantVariables) {
            let currentParent = null

            for (let i = 0; i < this.bases.length; i++) {
              const base = this.bases[i]
              if (!row[base]) {
                row[base] = null
              }
              if (!this.checkIfChildBasesAreFilled(row, base)) {
                i = this.bases.length
              } else {
                currentParent = this.addToParent(currentParent, row[base], base)
              }
            }

            this.variables[currentParent.id] = row.variables
          }

          this.sortTree()
        }

        this.loading = false
      },
      checkIfChildBasesAreFilled (object, base) {
        let found = -1

        for (let i = 0; i < this.bases.length; i++) {
          if (this.bases[i] === base) {
            found = i
          }
        }

        if (found > 0) {
          for (found; found < this.bases.length; found++) {
            const currentBase = this.bases[found]
            if (object[currentBase]) {
              return true
            }
          }

          return false
        }

        return true
      },
      addToParent (parent, name, currentBase) {
        if (!name) {
          name = '__NONE__'
        }

        if (parent) {
          for (let child of parent.children) {
            if (child.name === name) {
              return child
            }
          }
        } else {
          parent = this.items.find(el => {
            return el.name === name
          })

          if (parent) {
            return parent
          }
        }

        if (parent) {
          parent.children.push({
            name: name,
            id: this.lastId++,
            base: currentBase,
            children: []
          })

          return parent.children[parent.children.length - 1]
        } else {
          this.items.push({
            name: name,
            id: this.lastId++,
            base: currentBase,
            children: []
          })

          return this.items[this.items.length - 1]
        }
      },
      sortTree (parent) {
        if (!parent) {
          parent = this.items
          parent.sort((a, b) => {
            if (a.name > b.name) {
              return 1
            } else {
              return -1
            }
          })

          for (let item of parent) {
            this.sortTree(item)
          }
        } else {
          parent.children.sort((a, b) => {
            if (a.name > b.name) {
              return 1
            } else {
              return -1
            }
          })

          if (parent.children) {
            for (let item of parent.children) {
              this.sortTree(item)
            }
          }
        }
      },
      updateActive (currentItem) {
        if (currentItem) {
          this.currentValues = this.variables[currentItem] ? this.variables[currentItem] : []
        } else {
          this.currentValues = []
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
.halfWidth {
  width: 50%;
}

.stickyHeader {
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 1;
}

.configRow {
  position: relative;

  &:before {
    content: "";
    background: var(--v-primary-base);
    position: absolute;
    left: 0;
    bottom: 0;
    right: 0;
    top: 0;
    opacity: 0;
    pointer-events: none;
  }

  &:hover {
    color: var(--v-primary-base);
  }

  &:hover:before {
    opacity: 0.12;
  }
}

.custom-resizer {
  width: 100%;
  height: 100%;
}
.custom-resizer > .pane {
  text-align: left;
  padding: 15px;
  overflow: hidden;
  background: #eee;
  border: 1px solid #ccc;
}
.custom-resizer > .pane ~ .pane {
}
.custom-resizer > .multipane-resizer {
  margin: 0; left: 0;
  position: relative;
  &:before {
    content: "";
    width: 4px;
    height: 40px;
    position: absolute;
    top: 50%;
    left: 50%;
    margin-top: -20px;
    margin-left: -1.5px;
    border-left: 1px solid #ccc;
    border-right: 1px solid #ccc;
  }
  &:hover {
    &:before {
      border-color: #999;
    }
  }
}
.splitpanes__pane {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>

<style lang="scss">
.splitpanes__splitter {
  position: relative;
  width: 10px;
}
.splitpanes__splitter::after {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translateX(-50%) translateY(-50%);
  height: 30px;
  width: 4px;
  border-left: solid 1px black;
  border-right: solid 1px black;
  opacity: 0.12;
}
</style>
