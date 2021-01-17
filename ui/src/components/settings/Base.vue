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
    class="py-3"
  >
    <draggable
      :list="items"
      handle=".handler"
      style="width: 100%"
      data-cy="handler"
      @end="dragEnded"
    >
      <v-card
        v-for="item of items"
        :key="item.name"
        class="mx-3 px-3 d-flex flex-row my-1 elevation-1 py-5"
      >
        <v-icon
          :class="{handler: !changeInProgress, loading: changeInProgress}"
          class="mr-3 mt-2"
          :data-cy="`moveBase-${item.name}`"
        >
          {{ !changeInProgress ? allMdi.mdiDotsVertical : allMdi.mdiTimerSandFull }}
        </v-icon>
        <v-btn
          icon
          outlined
          @click="
            currentIconItem = item;
            iconPicker = true;
          "
        >
          <v-icon v-text="item.icon" />
        </v-btn>
        <span
          class="mt-2 ml-5"
          style="width: 100%"
          v-text="item.name"
        />
        <v-btn
          icon
          :data-cy="`removeBase-${item.name}`"
          @click="deleteBase(item)"
        >
          <v-icon>
            {{ allMdi.mdiDelete }}
          </v-icon>
        </v-btn>
      </v-card>
    </draggable>
    <v-text-field
      v-model="appendText"
      data-cy="newBase"
      :loading="loading"
      :disabled="loading"
      :prepend-icon="allMdi.mdiDatabasePlus"
      :append-icon="allMdi.mdiPlus"
      label="New Base"
      class="mx-5 mt-5"
      @click:append="addBase"
      @keyup.enter="addBase"
    >
      <template v-slot:append />
    </v-text-field>
    <v-dialog
      v-model="iconPicker"
      max-width="890px"
      max-height="90%"
    >
      <v-card tile>
        <v-card-title primary-title>
          Choose icon
        </v-card-title>
        <v-divider />
        <v-text-field
          v-model="iconsFilter"
          :prepend-icon="allMdi.mdiMagnify"
          label="Search"
          class="mx-3"
        />
        <div class="d-flex flex-row flex-wrap">
          <div
            v-for="icon of paginatedIcons"
            :key="icon"
            class="mx-3 pt-1 mt-2 mb-3 text-center iconHover"
            style="width: 100px; border-radius: 5px; cursor: pointer"
            @click="changeIcon(icon)"
          >
            <v-icon
              x-large
              style="width: 100%"
            >
              {{ allMdi[icon] }}
            </v-icon>
            <div class="caption">
              {{ icon }}
            </div>
          </div>
          <v-pagination
            v-model="iconsPage"
            :length="paginationLength"
            :total-visible="10"
            class="pb-3"
          />
        </div>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
  import draggable from 'vuedraggable'
  import * as allMdi from '@mdi/js'

  export default {
    name: 'BaseModelSettings',
    components: {
      draggable,
    },
    data: () => ({
      items: [],
      iconPicker: false,
      iconsFilter: null,
      iconsPage: 1,
      iconsPerPage: 35,
      currentIconItem: null,

      loading: false,

      changeInProgress: false,

      allMdi: allMdi,

      appendText: null,
    }),
    computed: {
      paginationLength () {
        return Math.ceil(this.filteredIcons.length / this.iconsPerPage)
      },
      filteredIcons () {
        const keys = Object.keys(this.allMdi)
        if (this.iconsFilter === null || this.iconsFilter === '') {
          return keys
        } else {
          const filter = this.iconsFilter.toLowerCase()
          return keys.filter(icon => {
            const text = icon.toLowerCase()
            return text.includes(filter)
          })
        }
      },
      paginatedIcons () {
        return this.filteredIcons.slice((this.iconsPage - 1) * this.iconsPerPage, this.iconsPage * this.iconsPerPage)
      },
    },
    mounted () {
      this.resetData()
    },
    methods: {
      async resetData () {
        this.loading = true
        const response = await this.axios.get(
          `${this.$store.state.mainUrl}/baseConfigurations?filter={"order":"sequenceNumber ASC"}`,
        )

        this.items = response.data
        this.loading = false
      },
      async dragEnded (item) {
        const changedItem = this.items[item.newIndex]

        changedItem.sequenceNumber = item.newIndex

        this.changeInProgress = true

        await this.axios.post(
          `${this.$store.state.mainUrl}/baseConfigurations/changeSequence`,
          changedItem,
        )

        this.$eventHub.$emit('updateIcons')

        this.changeInProgress = false
      },
      async changeIcon (icon) {
        const currentItem = this.currentIconItem
        currentItem.icon = `${this.allMdi[icon]}`

        this.iconPicker = false
        this.iconsFilter = null

        await this.axios.put(
          `${this.$store.state.mainUrl}/baseConfigurations`,
          currentItem,
        )

        this.currentIconItem.icon = `${this.allMdi[icon]}`
        this.$eventHub.$emit('updateIcons')

        this.currentIconItem = null
      },
      async addBase () {
        if (this.appendText === null || this.appendText === '') {
          return
        }

        const keys = Object.keys(this.allMdi)
        const rand = Math.floor(Math.random() * keys.length + 1)
        const newBase = {
          name: this.appendText,
          icon: `${this.allMdi[keys[rand]]}`,
        }

        this.appendText = ''

        await this.axios.post(
          `${this.$store.state.mainUrl}/baseConfigurations`,
          newBase,
        )

        this.$eventHub.$emit('updateIcons')
        await this.resetData()
      },
      async deleteBase (item) {
        await this.axios.delete(
          `${this.$store.state.mainUrl}/baseConfigurations/${item.id}`,
        )

        this.$eventHub.$emit('updateIcons')
        await this.resetData()
      },
    },
  }
</script>

<style lang="scss" scoped>
.handler {
  cursor: move;
}

.baseIcon {
  border: solid;
  border-width: 1px;
}

.iconHover:hover {
  background: lightgray;
  transition: background 0.4s;
}

.loading {
  animation: rotation 2s infinite linear;
  -webkit-animation: rotation 2s infinite linear;
}

@-webkit-keyframes rotation {
    from {
        -webkit-transform: rotate(0deg);
    }
    to {
        -webkit-transform: rotate(359deg);
    }
}
</style>
