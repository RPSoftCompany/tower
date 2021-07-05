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
    class="pt-4"
  >
    <template v-slot:help>
      <div class="mt-4">
        <div class="text-h4 font-weight-bold text-uppercase">
          Base Models
        </div>
        <v-divider class="mt-2 mb-7" />
        <div />
        <div class="text-h5 mb-3 font-weight-medium">
          Overview
        </div>
        <span class="font-weight-bold">Base Models</span> section allows you to create and remove base models from
        Tower. This is the most important part of your configuration management, as right here you decide how your
        configuration hierarchy looks like.
        <div class="red--text font-weight-bold">
          But be aware, that any changes made in this section may destroy your existing configuration,
          so handle with care
        </div>
        <v-divider class="my-2" />
        <div class="text-h5 font-weight-medium">
          New Base Model
        </div>
        To create a new base model, you just need to fill in the <span class="font-weight-bold">New Base</span> input
        and click on the <kbd>+</kbd> button.
        <gif
          src="Bases_new_base.gif"
          alt="New base"
        />
        <v-divider class="my-2" />
        <div class="text-h5 font-weight-medium">
          Remove Base Model
        </div>
        If you want to remove the Base Model, just click on the bin icon on the right side of the model name.
        <gif
          src="Bases_remove_base.gif"
          alt="New base"
        />
        <v-divider class="my-2" />
        <div class="text-h5 font-weight-medium">
          Change Base Model Order
        </div>
        Sometimes you may need to switch the order of Base Models to make it more suitable for you. To do so, you need
        to click and hold the three dots icon on the left side of the model name and drag it to any position you want.
        <gif
          src="Bases_change_order.gif"
          alt="Create new group"
        />
      </div>
    </template>
    <v-dialog
      v-model="deleteDialog"
      persistent
      width="30%"
    >
      <v-card>
        <v-card-title class="error">
          Are you sure?
        </v-card-title>

        <v-card-text class="subtitle-1">
          <br>
          Are you sure you want to remove this Base Model?<br>
          Deleting this object may destroy saved configurations.
        </v-card-text>

        <v-divider />

        <v-card-actions>
          <v-spacer />
          <v-btn
            text
            @click="objectToDelete = null; deleteDialog = false"
          >
            No
          </v-btn>
          <v-btn
            color="error"
            text
            @click="deleteBase"
          >
            Yes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <div class="d-flex justify-center">
      <div class="halfWidth">
        <v-text-field
          v-model="appendText"
          data-cy="newBase"
          :loading="loading"
          :disabled="loading"
          :prepend-icon="allMdi.mdiDatabasePlus"
          :append-icon="allMdi.mdiPlus"
          label="New Base"
          class="mx-5"
          @click:append="addBase"
          @keyup.enter="addBase"
        >
          <template v-slot:append />
        </v-text-field>
      </div>
    </div>
    <draggable
      :list="items"
      handle=".handler"
      style="width: 100%"
      data-cy="handler"
      class="pb-3"
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
          @click="showDeleteDialog(item)"
        >
          <v-icon>
            {{ allMdi.mdiDelete }}
          </v-icon>
        </v-btn>
      </v-card>
    </draggable>
    <v-dialog
      v-model="iconPicker"
      max-width="890px"
      max-height="90%"
    >
      <v-card tile>
        <v-card-title
          class="headline primary d-flex justify-space-between"
        >
          <span>Choose icon</span>
          <v-btn
            icon
            @click="iconPicker = false"
          >
            <v-icon>{{ allMdi.mdiClose }}</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider />
        <div class="d-flex justify-center">
          <div class="halfWidth">
            <v-text-field
              v-model="iconsFilter"
              :prepend-icon="allMdi.mdiMagnify"
              label="Search"
              class="mt-2"
              style="margin-bottom: -10px"
            />
          </div>
        </div>
        <v-divider class="mb-2" />
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
              {{ uncamel(icon) }}
            </div>
          </div>
        </div>
        <v-divider class="my-2" />
        <div class="justify-center">
          <v-pagination
            v-model="iconsPage"
            :length="paginationLength"
            :total-visible="10"
            class="pb-3"
          />
        </div>
      </v-card>
    </v-dialog>
  </uiCard>
</template>

<script>
  import draggable from 'vuedraggable'
  import * as allMdi from '@mdi/js'
  import uiCard from '../base/uiCard'
  import gif from '../base/gif'

  export default {
    name: 'BaseModelSettings',
    components: {
      draggable,
      uiCard,
      gif,
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

      deleteDialog: false,
      objectToDelete: null,
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
            const text = this.uncamel(icon).toLowerCase()
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
      uncamel (text) {
        text = text.substring(3)
        const result = text.replace(/([A-Z])/g, ' $1')
        return result.charAt(0).toUpperCase() + result.slice(1)
      },
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
      showDeleteDialog (item) {
        this.deleteDialog = true
        this.objectToDelete = item
      },
      async deleteBase () {
        await this.axios.delete(
          `${this.$store.state.mainUrl}/baseConfigurations/${this.objectToDelete.id}`,
        )

        this.objectToDelete = null
        this.deleteDialog = false

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

.halfWidth {
  width: 50%;
}

.baseIcon {
  border: 1px solid;
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
