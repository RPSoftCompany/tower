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
  <v-card flat>
    <v-expansion-panels
      v-model="current"
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
          <v-data-table
            v-model="permissions.models[base.name].selected"
            :headers="permissions.headers"
            :items="permissions.models[base.name].items"
            :hide-default-footer="true"
            :single-select="false"
            show-select
            class="elevation-1"
            @item-selected="modifyPermission"
            @toggle-select-all="modifyAllPermissions"
          />
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-card>
</template>

<script>
  export default {
    name: 'PermissionsSettings',
    data: () => ({
      bases: null,
      current: null,
      permissions: {
        models: {},
        headers: [
          {
            text: 'Enable Permissions',
            align: 'left',
            value: 'name'
          }
        ]
      }
    }),
    async mounted () {
      await this.resetData()
    },
    methods: {
      async resetData () {
        this.bases = []

        const basesResponse = await this.axios.get(
          `${this.$store.state.mainUrl}/baseConfigurations?filter={"order":"sequenceNumber ASC"}`
        )

        const modelsResponse = await this.axios.get(
          `${this.$store.state.mainUrl}/configurationModels?filter={"order":"name ASC"}`
        )

        const rolesResponse = await this.axios.get(
          `${this.$store.state.mainUrl
          }/Roles?filter={"order":"name ASC","where":{"name":{"like":"configurationModel."}}}`
        )

        basesResponse.data.forEach(base => {
          this.permissions.models[base.name] = {
            items: [],
            selected: []
          }
        })

        modelsResponse.data.forEach(model => {
          if (this.permissions.models[model.base] !== undefined) {
            this.permissions.models[model.base].items.push(model)
          }
        })

        rolesResponse.data.forEach(role => {
          if (role.name.split('.').length === 4) {
            const base = role.name.split('.')[1]
            const model = role.name.split('.')[2]
            const item = modelsResponse.data.find(el => {
              return el.name === model
            })

            this.permissions.models[base].selected.push(item)
          }
        })

        this.bases = basesResponse.data
      },
      async modifyPermission (data) {
        const roleName = `configurationModel.${data.item.base}.${data.item.name}`
        const constName = `constantVariable.${data.item.base}.${data.item.name}`
        if (data.value === true) {
          await this.axios.post(`${this.$store.state.mainUrl}/Roles`, {
            name: `${roleName}.view`
          })

          await this.axios.post(`${this.$store.state.mainUrl}/Roles`, {
            name: `${roleName}.modify`
          })

          await this.axios.post(`${this.$store.state.mainUrl}/Roles`, {
            name: `${constName}.modify`
          })
        } else {
          const rolesResponse = await this.axios.get(
            `${this.$store.state.mainUrl}/Roles?filter={"order":"name ASC","where":{"name":{"regexp":` +
              `"^(configurationModel|constantVariable).${data.item.base}.${data.item.name}.(view|modify)$"}}}`
          )

          for (const role of rolesResponse.data) {
            this.axios.delete(
              `${this.$store.state.mainUrl}/Roles/${role.id}`
            )
          }
        }
      },
      modifyAllPermissions (data) {
        const base = this.bases[this.current].name
        this.permissions.models[base].items.forEach(async model => {
          const value = `configurationModel.${base}.${model.name}`
          if (data.value) {
            this.axios.patch(`${this.$store.state.mainUrl}/Roles`, {
              name: `${value}.view`
            })
            this.axios.patch(`${this.$store.state.mainUrl}/Roles`, {
              name: `${value}.modify`
            })
          } else {
            const rolesResponse = await this.axios.get(
              `${this.$store.state.mainUrl}/Roles?filter={"order":"name ASC","where":{"name":{"like":"${value}."}}}`
            )

            rolesResponse.data.forEach(async role => {
              this.axios.delete(`${this.$store.state.mainUrl}/Roles/${role.id}`)
            })
          }
        })
      }
    }
  }
</script>
