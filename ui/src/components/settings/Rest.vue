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
  <uiCard
    flat
    class="py-4"
  >
    <template v-slot:help>
      <div class="text-h4 font-weight-bold text-uppercase">
        REST Configuration
      </div>
      <v-divider class="mt-2 mb-7" />
      <div />
      <div class="text-h5 mb-3 font-weight-medium">
        Overview
      </div>
      <span class="font-weight-bold">REST Configuration</span> section allows you to create, modify and remove REST API
      configuration for Tower. Right here you can decide how Tower will respond to any configuration request.
      <br>There are two different modules, <span class="font-weight-medium">v1</span> and
      <span class="font-weight-medium">v2</span>.
      <br><span class="font-weight-medium">v1</span> will serve you all your configuration variables regardless the url.
      <br><span class="font-weight-medium">v2</span> response, on the other hand, can be reduced to only the variables
      you want.
      <br>You can read more about both of them in the Tower
      <a href="https://rpsoft.gitbook.io/tower/rest-templates/how-to">documentation</a>
      <v-divider class="my-2" />
      <div class="text-h5 font-weight-medium">
        New REST API url
      </div>
      All you need to do to create new REST API endpoint is to add the url string to one of the available inputs.
      <gif
        src="Rest_new_url.gif"
        alt="New URL"
      />
      <v-divider class="my-2" />
      <div class="text-h5 font-weight-medium">
        Modify REST API url
      </div>
      To modify the REST API url, you need to find the instance you want to change, click on it and just modify any item
      you need. You don't need to click on any button, all changes are saved automatically.
      <gif
        src="Rest_modify_url.gif"
        alt="Modify URL"
      />
      <v-divider class="my-2" />
      <div class="text-h5 font-weight-medium">
        Remove REST API url
      </div>
      To delete the REST API url, you need to find the instance you want to change, click on it, find the bin icon and
      press it. Afterwards, you will be asked to confirm your decision, where you will need to choose "Yes" option.
      <gif
        src="Rest_remove_url.gif"
        alt="Remove URL"
      />
      <v-divider class="my-2" />
      You can read more about REST URLs and templates in Tower
      <a href="https://rpsoft.gitbook.io/tower/rest-templates/templates">documentation</a>
    </template>
    <v-dialog
      v-model="deleteDialog.show"
      max-width="50%"
    >
      <v-card>
        <v-card-title class="red">
          Delete
        </v-card-title>
        <v-card-text class="mt-4 text-h6 font-weight-regular">
          Are you sure you want to delete this URL?
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
            text
            @click="deleteUrl(); deleteDialog.show = false;"
          >
            Yes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <div class="mt-3">
      <div class="pb-1 mx-5 d-flex justify-center">
        <v-divider
          class="mr-5 mt-4"
          style="max-width: 10%"
        />
        <div class="text-h6 font-weight-bold">
          v1
        </div>
        <v-divider
          class="ml-5 mt-4"
          style="max-width: 10%"
        />
      </div>
      <div class="mx-5 mb-3">
        <v-form
          ref="newRowForm"
          v-model="newRowValid"
        >
          <v-text-field
            id="restUrlInputId"
            v-model="newItem.url"
            :rules="[rules.validateUrl]"
            :append-icon="icons.mdiPlus"
            label="New URL"
            prefix="/v1/"
            :hint="v1Example"
            persistent-hint
            @click:append="addConfiguration"
          />
        </v-form>
      </div>
      <v-expansion-panels
        v-model="panel"
        accordion
      >
        <draggable
          :list="items"
          handle=".handler"
          style="width: 100%"
          class="mx-2"
          @end="dragEnded"
        >
          <v-expansion-panel
            v-for="(item, i) of items"
            :key="item.id"
            class="outline"
            :class="{dark: $vuetify.theme.dark === true}"
          >
            <v-expansion-panel-header>
              <template v-slot:default>
                <v-row no-gutters>
                  <v-col cols="12">
                    <v-icon class="handler mr-3">
                      {{ icons.mdiDotsVertical }}
                    </v-icon>
                    <span>/v1/ </span>
                    <span class="font-weight-bold">{{ item.url }}</span>
                  </v-col>
                </v-row>
              </template>
            </v-expansion-panel-header>
            <v-expansion-panel-content class="pb-5">
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
                      prefix="/v1/"
                      autocomplete="off"
                      :append-outer-icon="icons.mdiDelete"
                      @click:append-outer="showDeleteDialog(i, 'v1')"
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
                    />
                  </v-col>
                  <v-col
                    class="py-0"
                    cols="12"
                  >
                    <ace-editor
                      v-if="items[i].template !== undefined"
                      v-model="items[i].template"
                      style="border: solid 1px rgba(0, 0, 0, 0.12); min-height: 200px"
                      lang="liquid"
                      theme="sqlserver"
                      width="100%"
                      height="400px"
                      :options="{
                        enableBasicAutocompletion: true,
                        enableLiveAutocompletion: true,
                        fontSize: 14,
                        highlightActiveLine: true,
                        enableSnippets: true,
                        showLineNumbers: true,
                        tabSize: 2,
                        showPrintMargin: false,
                        showGutter: true,
                      }"
                      @init="editorInit"
                    />
                  </v-col>
                  <v-col>
                    <v-btn
                      color="primary"
                      @click="saveConfig(i, 'v1')"
                    >
                      Save
                    </v-btn>
                  </v-col>
                </v-row>
              </v-form>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </draggable>
      </v-expansion-panels>
    </div>
    <div
      class="mt-3"
    >
      <div class="pb-1 mx-5 d-flex justify-center">
        <v-divider
          class="mr-5 mt-4"
          style="max-width: 10%"
        />
        <div class="text-h6 font-weight-bold">
          v2
        </div>
        <v-divider
          class="ml-5 mt-4"
          style="max-width: 10%"
        />
      </div>
      <div class="mx-5">
        <v-text-field
          v-model="v2.newItem.url"
          :append-icon="icons.mdiPlus"
          label="New URL"
          :suffix="v2Suffix"
          prefix="/v2/"
          @keyup.enter="addV2Configuration"
          @click:append="addV2Configuration"
        />
      </div>
      <v-expansion-panels
        v-model="v2.panel"
        accordion
      >
        <draggable
          :list="items"
          handle=".handler"
          style="width: 100%"
          class="mx-2"
          @end="dragEnded"
        >
          <v-expansion-panel
            v-for="(item, i) of v2.items"
            :key="item.id"
            class="outline"
            :class="{dark: $vuetify.theme.dark === true}"
          >
            <v-expansion-panel-header>
              <template v-slot:default>
                <v-row no-gutters>
                  <v-col cols="12">
                    <v-icon class="handler mr-3">
                      {{ icons.mdiDotsVertical }}
                    </v-icon>
                    <span>/v2/ </span>
                    <span class="font-weight-bold">{{ item.url }}</span>
                  </v-col>
                </v-row>
              </template>
            </v-expansion-panel-header>
            <v-expansion-panel-content class="pb-5">
              <v-divider />
              <v-form
                ref="existingRowFormV2"
                v-model="v2.newRowValid"
              >
                <v-row align="center">
                  <v-col
                    class="d-flex pb-0"
                    cols="6"
                  >
                    <v-text-field
                      v-model="item.url"
                      :rules="[rules.required]"
                      label="URL"
                      prefix="/v2/"
                      autocomplete="off"
                      :append-outer-icon="icons.mdiDelete"
                      @click:append-outer="showDeleteDialog(i, 'v2')"
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
                    />
                  </v-col>
                  <v-col
                    class="py-0"
                    cols="12"
                  >
                    <ace-editor
                      v-if="items[i].template !== undefined"
                      v-model="items[i].template"
                      style="border: solid 1px rgba(0, 0, 0, 0.12); min-height: 200px"
                      lang="liquid"
                      theme="sqlserver"
                      width="100%"
                      height="400px"
                      :options="{
                        enableBasicAutocompletion: true,
                        enableLiveAutocompletion: true,
                        fontSize: 14,
                        highlightActiveLine: true,
                        enableSnippets: true,
                        showLineNumbers: true,
                        tabSize: 2,
                        showPrintMargin: false,
                        showGutter: true,
                      }"
                      @init="editorInit"
                    />
                  </v-col>
                  <v-col>
                    <v-btn
                      color="primary"
                      @click="saveConfig(i, 'v2')"
                    >
                      Save
                    </v-btn>
                  </v-col>
                </v-row>
              </v-form>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </draggable>
      </v-expansion-panels>
    </div>
  </uiCard>
</template>

<script>
  import draggable from 'vuedraggable'
  import { mdiDotsVertical, mdiPlus, mdiDelete } from '@mdi/js'
  import uiCard from '../base/uiCard'
  import gif from '../base/gif'

  import AceEditor from 'vuejs-ace-editor'

  export default {
    name: 'RestSettings',
    components: {
      draggable,
      uiCard,
      gif,
      AceEditor
    },
    data: (props) => ({
      panel: null,
      items: [],
      types: ['json', 'xml', 'plain text'],

      deleteDialog: {
        show: false,
        id: null
      },

      bases: [],

      icons: {
        mdiDotsVertical,
        mdiPlus,
        mdiDelete
      },

      newItem: {
        url: null
      },
      rules: {
        validateUrl: props.validateUrl,
        required: (value) => !!value || 'Required.'
      },

      newRowValid: true,

      v2: {
        panel: null,
        items: [],
        newRowValid: true,

        newItem: {
          url: null
        }
      }
    }),
    computed: {
      addDisabled () {
        if (this.newItem.url === null || this.newItem.url === '') {
          return true
        }

        return this.newItem.template === '' || this.newItem.template === null
      },
      v1Example () {
        if (this.bases.length === 0) {
          return null
        }

        let text = 'e.q. '
        this.bases.forEach((base) => {
          text += `{${base.name}}/`
        })

        text = text.slice(0, -1)

        return text
      },
      v2Suffix () {
        if (this.bases.length === 0) {
          return null
        }

        let text = '/'
        this.bases.forEach((base) => {
          text += `{${base.name}}/`
        })

        text = text.slice(0, -1)

        return text
      }
    },
    mounted () {
      this.resetData()
    },
    methods: {
      editorInit: function () {
        require('brace/ext/language_tools')
        require('brace/mode/liquid')
        require('brace/theme/sqlserver')
        require('brace/snippets/javascript')
        require('brace/mode/liquid')
      },
      async resetData () {
        const response = await this.axios.get(
          `${this.$store.state.mainUrl}/restConfigurations?filter={"order":"sequenceNumber ASC"}`
        )

        if (response.status === 200 && response.data) {
          this.items = response.data.filter((el) => {
            return el.type === 'v1'
          })

          this.v2.items = response.data.filter((el) => {
            return el.type === 'v2'
          })
        }

        const responseBase = await this.axios.get(
          `${this.$store.state.mainUrl}/baseConfigurations?filter={"order":"sequenceNumber ASC"}`
        )

        this.bases = responseBase.data
      },
      validateUrl (value) {
        if (value === '' || value === null) {
          return true
        }

        const exists = this.bases.some((base) => {
          return value.includes(`{${base.name}}`)
        })

        const firstSplit = value.split('{')
        firstSplit.shift()
        const every = firstSplit.every((split) => {
          const baseName = split.substring(0, split.indexOf('}'))
          return this.bases.some((base) => {
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
          template: '{\n' +
            '  {%- for var in variables -%}\n' +
            '  {% case var.type -%}\n' +
            '  {% when "string", "password" %}\n' +
            '  "{{ var.name }}":"{{ var.value }}"{%- if forloop.last != true -%},{%- endif -%}\n' +
            '  {% when "number", "boolean" %}\n' +
            '  "{{ var.name }}":{{ var.value }}{%- if forloop.last != true -%},{%- endif -%}\n' +
            '  {% when "list" %}\n' +
            '  "{{ var.name }}":[{% for listVar in var -%}"{{ listVar }}"{%- if forloop.last != true -%},{%- endif -%}{%- endfor -%}{%- if forloop.last != true -%},{%- endif -%}\n' +
            '  {% endcase -%}\n' +
            '  {%- endfor %}\n' +
            '}',
          returnType: 'json'
        }

        await this.axios.post(
          `${this.$store.state.mainUrl}/restConfigurations`,
          newConfig
        )

        this.$eventHub.$emit('tutorialAddConfigurationURL', this.newItem.url)

        this.newItem.url = null
        this.newItem.template = null
        this.newItem.returnType = 'json'

        await this.resetData()
      },
      async addV2Configuration () {
        const newConfig = {
          url: this.v2.newItem.url,
          template: '{\n' +
            '  {%- for var in variables -%}\n' +
            '  {% case var.type -%}\n' +
            '  {% when "string", "password" %}\n' +
            '  "{{ var.name }}":"{{ var.value }}"{%- if forloop.last != true -%},{%- endif -%}\n' +
            '  {% when "number", "boolean" %}\n' +
            '  "{{ var.name }}":{{ var.value }}{%- if forloop.last != true -%},{%- endif -%}\n' +
            '  {% when "list" %}\n' +
            '  "{{ var.name }}":[{% for listVar in var -%}"{{ listVar }}"{%- if forloop.last != true -%},{%- endif -%}{%- endfor -%}{%- if forloop.last != true -%},{%- endif -%}\n' +
            '  {% endcase -%}\n' +
            '  {%- endfor %}\n' +
            '}',
          returnType: 'json',
          type: 'v2'
        }

        await this.axios.post(
          `${this.$store.state.mainUrl}/restConfigurations`,
          newConfig
        )

        this.v2.newItem.url = null

        await this.resetData()
      },
      async saveConfig (i, type) {
        let find = null
        if (type === 'v1') {
          find = this.$refs.existingRowForm.find((el) => {
            return el.$parent.isActive === true
          })
        } else {
          find = this.$refs.existingRowFormV2.find((el) => {
            return el.$parent.isActive === true
          })
        }

        if (!find.validate()) {
          return
        }

        if (type === 'v1') {
          await this.axios.put(
            `${this.$store.state.mainUrl}/restConfigurations`,
            this.items[i]
          )
        } else {
          await this.axios.put(
            `${this.$store.state.mainUrl}/restConfigurations`,
            this.v2.items[i]
          )
        }
      },
      async dragEnded (item) {
        const changedItem = this.items[item.newIndex]
        if (changedItem.sequenceNumber === item.newIndex) {
          return
        }

        changedItem.sequenceNumber = item.newIndex

        await this.axios.post(
          `${this.$store.state.mainUrl}/restConfigurations/changeSequence`,
          changedItem
        )
      },
      showDeleteDialog (i, type) {
        if (type === 'v1') {
          this.deleteDialog.id = this.items[i].id
        } else {
          this.deleteDialog.id = this.v2.items[i].id
        }

        this.deleteDialog.show = true
      },
      async deleteUrl () {
        await this.axios.delete(
          `${this.$store.state.mainUrl}/restConfigurations/${this.deleteDialog.id}`
        )

        await this.resetData()
      }
    }
  }
</script>

<style lang="scss" scoped>
.handler {
  cursor: move;
}
</style>
