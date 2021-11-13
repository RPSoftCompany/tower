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
    <v-expansion-panels
      v-model="tab"
      class="pa-3"
    >
      <v-expansion-panel
        v-for="base of bases"
        :key="base.id"
        class="outline"
        :class="{dark: $vuetify.theme.dark === true}"
      >
        <v-expansion-panel-header class="d-flex flex-row">
          <v-icon style="maxWidth: 40px">
            {{ base.icon }}
          </v-icon>
          <span class="ml-3">{{ base.name }}</span>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <div class="d-flex justify-center">
            <div class="halfWidth">
              <v-autocomplete
                v-model="values.current"
                :label="`From ${base.name}`"
                :items="models[base.name]"
                return-object
                item-text="name"
                @input="onModelChange"
              />
            </div>
          </div>
          <div v-if="values.current !== null">
            <v-data-table
              :headers="[{ text: `To ${base.name}`, value: 'name' }]"
              :items="table.items"
              :value="table.selected"
              show-select
              class="elevation-1"
              @input="itemSelected"
            />
          </div>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-card>
</template>

<script>
  export default {
    name: 'PromotionSettings',
    data: () => ({
      tab: null,
      bases: [],
      models: {},
      values: {
        current: null
      },
      table: {
        items: [],
        selected: []
      }
    }),
    watch: {
      tab () {
        this.table.items = []
        this.values.current = null
      }
    },
    mounted () {
      this.resetData()
    },
    methods: {
      async resetData () {
        const response = await this.axios.get(
          `${this.$store.state.mainUrl}/baseConfigurations?filter={"order":"sequenceNumber ASC"}`
        )

        this.bases = response.data

        response.data.forEach(async base => {
          const modelResponse = await this.axios.get(
            `${this.$store.state.mainUrl}/configurationModels?filter={"order":"name ASC","where":{"base":"${base.name
            }"}}`
          )

          this.models[base.name] = modelResponse.data
        })
      },
      async onModelChange (item) {
        const base = this.bases[this.tab]
        this.table.items = []
        this.table.selected = []

        const selectedReponse = await this.axios.get(
          `${this.$store.state.mainUrl}/promotions?filter={"where":{"base":"${base.name}","fromModel":"${item.name
          }"}}`
        )

        const itemsResponse = await this.axios.get(
          `${this.$store.state.mainUrl}/configurationModels?filter={"order":"name ASC","where":{"name":{"neq":"${
            item.name}"},"base":"${base.name}"}}`
        )

        this.table.items = itemsResponse.data
        if (selectedReponse.data.length > 0) {
          this.table.items.forEach(item => {
            if (selectedReponse.data[0].toModels.includes(item.name)) {
              this.table.selected.push(item)
            }
          })
        }
      },
      async itemSelected (selected) {
        const base = this.bases[this.tab]
        const toModels = []
        selected.forEach(item => {
          toModels.push(item.name)
        })

        await this.axios.patch(`${this.$store.state.mainUrl}/promotions`, {
          base: base.name,
          fromModel: this.values.current.name,
          toModels: toModels
        })
      }
    }
  }
</script>

<style scoped>
.halfWidth {
  width: 50% !important;
}
</style>
