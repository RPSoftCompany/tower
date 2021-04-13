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
  <v-card>
    <v-dialog
      v-model="headersDialog"
      persistent
      width="80%"
    >
      <v-card>
        <v-card-title class="primary">
          Headers
        </v-card-title>

        <v-card-text>
          <div class="mt-2" />
          <v-row
            v-for="header of currentHook.headers"
            :key="header.name"
            align="center"
          >
            <v-col
              cols="6"
              class="py-0"
            >
              <v-text-field
                v-model="header.name"
                label="Header name"
              />
            </v-col>
            <v-col
              cols="6"
              class="py-0"
            >
              <v-text-field
                v-model="header.value"
                label="Header value"
                :append-outer-icon="icons.mdiDelete"
                @click:append-outer="removeHeader(header.name)"
              />
            </v-col>
          </v-row>
          <v-row align="center">
            <v-col
              cols="6"
              class="py-0"
            >
              <v-text-field
                v-model="newHeader.name"
                label="Header name"
              />
            </v-col>
            <v-col
              cols="6"
              class="py-0"
            >
              <v-text-field
                v-model="newHeader.value"
                label="Header value"
                :append-outer-icon="icons.mdiPlus"
                @click:append-outer="addHeader"
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider />

        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            text
            @click="updateHookHeaders"
          >
            Ok
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-expansion-panels
      class="pa-3"
    >
      <v-expansion-panel
        v-for="model of models"
        :key="model"
      >
        <v-expansion-panel-header>{{ model }}</v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-expansion-panels>
            <v-expansion-panel
              v-for="entry of hooksModel[model]"
              :key="entry.id"
            >
              <v-expansion-panel-header>{{ entry.method }}</v-expansion-panel-header>
              <v-expansion-panel-content>
                <v-divider />
                <template v-for="hook of hooks[model][entry.method]">
                  <v-row
                    :key="hook.id"
                    align="center"
                  >
                    <v-col
                      class="d-flex pr-0"
                      cols="3"
                    >
                      <v-select
                        v-model="hook.method"
                        :items="['GET', 'POST', 'DELETE', 'PUT', 'HEAD']"
                        label="HTTP method"
                        @change="modifyHook(entry, hook)"
                      />
                    </v-col>
                    <v-col
                      class="d-flex"
                      cols="9"
                    >
                      <v-text-field
                        v-model="hook.url"
                        label="URL"
                        :prepend-icon="icons.mdiFileDocument"
                        :append-outer-icon="icons.mdiDelete"
                        @blur="modifyHook(entry, hook)"
                        @click:append-outer="
                          removeHook(entry, hook)
                        "
                        @click:prepend="showHeaderDialog(entry, hook)"
                      />
                    </v-col>
                    <v-col
                      class="d-flex"
                      cols="12"
                    >
                      <prism-editor
                        v-model="hook.template"
                        class="prismeditor"
                        language="markup"
                        :highlight="highlighter"
                        line-numbers
                        @blur="modifyHook(entry, hook)"
                      />
                    </v-col>
                    <v-col
                      class="d-flex pb-0"
                      cols="12"
                    >
                      <v-divider />
                    </v-col>
                  </v-row>
                </template>
                <v-text-field
                  v-model="newHookUrl"
                  label="New URL"
                  :append-outer-icon="icons.mdiPlus"
                  @click:append-outer="addHook(entry)"
                />
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-card>
</template>

<script>
  import { mdiDelete, mdiPlus, mdiFileDocument } from '@mdi/js'

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
    name: 'HooksSettings',
    components: {
      'prism-editor': PrismEditor,
    },
    data: () => ({
      models: [],
      children: new Map(),

      icons: {
        mdiDelete,
        mdiPlus,
        mdiFileDocument,
      },

      headersDialog: false,
      currentHook: {},
      currentEntry: null,
      newHeader: {
        name: null,
        value: null,
      },

      hooksModel: {
        Configuration: [],
        ConfigurationModel: [],
        ConstantVariable: [],
      },

      hooks: {
        Configuration: {
          afterCreate: [],
          afterUpdate: [],
          beforeCreate: [],
        },
        ConfigurationModel: {
          afterAddRule: [],
          afterCreate: [],
          afterDelete: [],
          afterModifyRule: [],
          afterRemoveRule: [],
          afterUpsert: [],
          beforeAddRule: [],
          beforeCreate: [],
          beforeDelete: [],
          beforeModifyRule: [],
          beforeRemoveRule: [],
          beforeUpsert: [],
        },
        ConstantVariable: {
          variableChanged: [],
        },
      },

      newHookUrl: null,
    }),
    async mounted () {
      await this.resetData()
    },
    methods: {
      showHeaderDialog (entry, hook) {
        this.currentHook = hook
        this.currentEntry = entry
        this.newHeader.name = null
        this.newHeader.value = null
        this.headersDialog = true
      },
      async updateHookHeaders () {
        await this.modifyHook(this.currentEntry, this.currentHook)

        this.currentEntry = null
        this.currentHook = {}

        this.headersDialog = false
      },
      addHeader () {
        if (this.currentHook.headers === undefined) {
          this.currentHook.headers = []
        }

        const find = this.currentHook.headers.find(el => {
          return el.name === this.newHeader.name
        })

        if (find !== undefined) {
          find.value = this.newHeader.value
        } else {
          this.currentHook.headers.push({
            name: this.newHeader.name,
            value: this.newHeader.value,
          })
        }

        this.newHeader.name = null
        this.newHeader.value = null
      },
      removeHeader (name) {
        this.currentHook.headers = this.currentHook.headers.filter(el => {
          return el.name !== name
        })
      },
      highlighter (code) {
        return highlight(
          code,
          {
            ...languages.markup,
          },
          'markup',
        )
      },
      updateEditor (_id) {
        this.$forceUpdate()
      },
      async resetData () {
        const response = await this.axios.get(
          `${this.$store.state.mainUrl}/hooks?filter={"order":"model ASC"}`,
        )

        const modelSet = new Set()

        response.data.forEach(entry => {
          this.hooksModel[entry.model] = []
        })

        response.data.forEach(entry => {
          modelSet.add(entry.model)

          this.hooksModel[entry.model].push(entry)

          this.hooks[entry.model][entry.method] = entry.hooks
        })

        let array = Array.from(modelSet)
        array = array.sort()

        array.forEach(model => {
          this.hooksModel[model] = this.hooksModel[model].sort((a, b) => {
            return a.method.localeCompare(b.method)
          })
        })

        this.models = array
      },
      async addHook ({ id }) {
        if (this.newHookUrl === null || this.newHookUrl === '') {
          return
        }

        await this.axios.post(
          `${this.$store.state.mainUrl}/hooks/${id}/hookObject`,
          {
            url: this.newHookUrl,
            template: '{}',
            method: 'GET',
            description: '',
          },
        )

        await this.resetData()

        this.newHookUrl = null
      },
      async removeHook ({ id }, { _id }) {
        await this.axios.delete(
          `${this.$store.state.mainUrl}/hooks/${id}/hookObject/${_id}`,
        )

        await this.resetData()
      },
      async modifyHook ({ id }, hook) {
        await this.axios.put(
          `${this.$store.state.mainUrl}/hooks/${id}/hookObject`,
          hook,
        )

        await this.resetData()
      },
    },
  }
</script>
