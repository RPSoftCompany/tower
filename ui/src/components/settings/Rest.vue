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
    <v-expansion-panels
      v-model="panel"
      accordion
    >
      <draggable
        :list="items"
        handle=".handler"
        style="width: 100%"
        @end="dragEnded"
      >
        <v-expansion-panel
          v-for="(item, i) of items"
          :key="item.id"
        >
          <v-expansion-panel-header>
            <template v-slot:default>
              <v-row no-gutters>
                <v-col cols="12">
                  <v-icon class="handler mr-3">
                    {{ icons.mdiDotsVertical }}
                  </v-icon>
                  {{ item.url }}
                </v-col>
              </v-row>
            </template>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-divider />
            <v-form
              ref="existingRowForm"
              v-model="newRowValid"
            >
              <v-row align="center">
                <v-col
                  class="d-flex pb-0"
                  cols="6"
                >
                  <v-text-field
                    v-model="item.url"
                    :rules="[rules.required, rules.validateUrl]"
                    label="URL"
                    autocomplete="off"
                    @blur="saveConfig(i)"
                  />
                </v-col>
                <v-col
                  class="d-flex pb-0"
                  cols="3"
                  offset="3"
                >
                  <v-select
                    v-model="item.returnType"
                    :items="types"
                    label="Type"
                    @blur="saveConfig(i)"
                  />
                </v-col>
                <v-col
                  class="py-0"
                  cols="12"
                >
                  <prism-editor
                    v-if="item.returnType === 'plain text'"
                    v-model="items[i].template"
                    class="prismeditor"
                    language="markup"
                    :highlight="highlighter"
                    line-numbers
                    @blur="saveConfig(i)"
                  />
                  <prism-editor
                    v-if="item.returnType === 'json'"
                    v-model="items[i].template"
                    class="prismeditor"
                    language="json"
                    :highlight="highlighterJson"
                    line-numbers
                    @blur="saveConfig(i)"
                  />
                  <prism-editor
                    v-if="item.returnType === 'xml'"
                    v-model="items[i].template"
                    class="prismeditor"
                    language="xml"
                    :highlight="highlighterXml"
                    line-numbers
                    @blur="saveConfig(i)"
                  />
                </v-col>
              </v-row>
            </v-form>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </draggable>
    </v-expansion-panels>
    <v-divider class="mt-5" />
    <div class="mx-5">
      <v-form
        ref="newRowForm"
        v-model="newRowValid"
      >
        <v-row align="center">
          <v-col
            class="d-flex"
            cols="12"
          >
            <v-text-field
              v-model="newItem.url"
              :rules="[rules.validateUrl]"
              :append-icon="icons.mdiPlus"
              label="New URL"
              @click:append="addConfiguration"
            />
          </v-col>
        </v-row>
      </v-form>
    </div>
  </v-card>
</template>

<script>
  import draggable from 'vuedraggable'
  import { mdiDotsVertical, mdiPlus } from '@mdi/js'

  import { PrismEditor } from 'vue-prism-editor'
  import 'vue-prism-editor/dist/prismeditor.min.css'
  import { highlight, languages } from 'prismjs/components/prism-core'
  import 'prismjs/components/prism-clike'
  import 'prismjs/components/prism-markup'
  import 'prismjs/components/prism-json'
  import 'prismjs/components/prism-xml-doc'
  import 'prismjs/components/prism-css'
  import 'prismjs/themes/prism-coy.css'

  export default {
    name: 'RestSettings',
    components: {
      draggable,
      'prism-editor': PrismEditor,
    },
    data: props => ({
      panel: null,
      items: [],
      types: ['json', 'xml', 'plain text'],

      bases: [],

      icons: {
        mdiDotsVertical,
        mdiPlus,
      },

      newItem: {
        url: null,
      },
      rules: {
        validateUrl: props.validateUrl,
        required: value => !!value || 'Required.',
      },

      newRowValid: true,
      registred: false,
    }),
    computed: {
      addDisabled () {
        if (this.newItem.url === null || this.newItem.url === '') {
          return true
        }

        if (this.newItem.template === '' || this.newItem.template === null) {
          return true
        }

        return false
      },
    },
    async mounted () {
      this.resetData()
    },
    methods: {
      highlighter (code) {
        return highlight(
          code,
          {
            ...languages.markup,
          },
          'markup',
        )
      },
      highlighterJson (code) {
        return highlight(
          code,
          {
            ...languages.markup,
            ...languages.json,
          },
          'markup',
        )
      },
      highlighterXml (code) {
        return highlight(
          code,
          {
            ...languages.markup,
            ...languages.xml,
          },
          'markup',
        )
      },
      async resetData () {
        const response = await this.axios.get(
          `${this.$store.state.mainUrl}/restConfigurations?filter={"order":"sequenceNumber ASC"}`,
        )

        this.items = response.data

        const responseBase = await this.axios.get(
          `${this.$store.state.mainUrl}/baseConfigurations?filter={"order":"sequenceNumber ASC"}`,
        )

        this.bases = responseBase.data
      },
      validateUrl (value) {
        if (value === '' || value === null) {
          return true
        }

        const exists = this.bases.some(base => {
          return value.includes(`{${base.name}}`)
        })

        const firstSplit = value.split('{')
        firstSplit.shift()
        const every = firstSplit.every(split => {
          const baseName = split.substring(0, split.indexOf('}'))
          return this.bases.some(base => {
            return base.name === baseName
          })
        })

        if (exists) {
          if (every) {
            return true
          } else {
            return 'Invalid base model'
          }
        } else {
          return 'You need to use at least one base model in URL'
        }
      },
      async addConfiguration () {
        if (!this.$refs.newRowForm.validate()) {
          return
        }

        const newConfig = {
          url: this.newItem.url,
          template: '{\n%%forEach var in variables%%\n\t"%%var.name%%":"%%var.value%%"\n%%forEach END%%\n}',
          returnType: 'json',
        }

        await this.axios.post(
          `${this.$store.state.mainUrl}/restConfigurations`,
          newConfig,
        )

        this.newItem.url = null
        this.newItem.template = null
        this.newItem.returnType = 'json'

        this.resetData()
      },
      async saveConfig (i) {
        const find = this.$refs.existingRowForm.find(el => {
          return el.$parent.isActive === true
        })

        if (!find.validate()) {
          return
        }

        await this.axios.put(
          `${this.$store.state.mainUrl}/restConfigurations`,
          this.items[i],
        )
      },
      async dragEnded (item) {
        const changedItem = this.items[item.newIndex]
        if (changedItem.sequenceNumber === item.newIndex) {
          return
        }

        changedItem.sequenceNumber = item.newIndex

        await this.axios.post(
          `${this.$store.state.mainUrl}/restConfigurations/changeSequence`,
          changedItem,
        )
      },
    },
  }
</script>

<style lang="scss" scoped>
.handler {
  cursor: grab;
}
</style>
