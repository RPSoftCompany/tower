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
  <v-form
    ref="variableValidationForm"
    class="d-flex"
  >
    <v-row class="mr-3">
      <v-col
        cols="4"
        class="pa-1"
      >
        <v-text-field
          v-model="variableName"
          :disabled="!isNew || !editable"
          :rules="currentRules"
          label="Name"
          :error-messages="errorMessage"
          class="pl-5 pr-1"
          @input="errorMessage = undefined"
          @change="onChange"
        />
      </v-col>
      <v-col
        cols="4"
        class="pa-1"
      >
        <v-select
          v-model="variableType"
          :items="types"
          :disabled="!editable"
          label="Type"
          @change="onChange"
        />
      </v-col>
      <v-col
        cols="4"
        class="pa-1"
      >
        <template v-if="variableType === 'string' || variableType === 'Vault'">
          <v-text-field
            v-model="variableValue"
            :disabled="!editable"
            label="Value"
            @change="onChange"
          />
        </template>
        <template v-if="variableType === 'boolean'">
          <v-checkbox
            v-model="variableValue"
            :disabled="!editable"
            @change="onChange"
          />
        </template>
        <template v-if="variableType === 'number'">
          <v-text-field
            v-model="variableValue"
            :disabled="!editable"
            type="number"
            label="Value"
            @change="onChange"
          />
        </template>
        <template v-if="variableType === 'text'">
          <v-textarea
            v-model="variableValue"
            :disabled="!editable"
            rows="1"
            label="value"
            @input="onChange"
          />
        </template>
        <template v-if="variableType === 'list'">
          <v-combobox
            v-model="variableValue"
            dense
            class="mt-2"
            label="List"
            multiple
            chips
            deletable-chips
            append-icon
            persistent-hint
            @change="onChange"
          />
        </template>
        <template v-else-if="variableType === 'password'">
          <v-text-field
            v-model="variableValue"
            :disabled="!editable"
            :type="pass_locked ? 'password' : 'text'"
            :append-icon="pass_locked ? icons.mdiLock : icons.mdiLockOpen"
            label="Value"
            @change="onChange"
            @click:append="pass_locked = !pass_locked"
          />
        </template>
      </v-col>
    </v-row>
    <v-tooltip bottom>
      <template v-slot:activator="{ on }">
        <v-btn
          v-model="variableForced"
          :disabled="!editable"
          :color="variableForced ? 'primary' : ''"
          :class="{'elevation-0': !variableForced}"
          fab
          small
          class="mt-1 mx-1 variableButton"
          v-on="on"
          @click="variableForced = !variableForced; onChange()"
        >
          <v-icon>{{ icons.mdiShieldLockOutline }}</v-icon>
        </v-btn>
      </template>
      <span
        v-text="variableForced ? 'Variable can\'t be overwritten in configuration' :
          'Variable can be overwritten in configuration'"
      />
    </v-tooltip>
    <v-tooltip bottom>
      <template v-slot:activator="{ on }">
        <v-btn
          v-model="variableAddIfAbsent"
          :color="variableAddIfAbsent ? 'primary' : ''"
          :disabled="!editable"
          :class="{'elevation-0': !variableAddIfAbsent, 'mr-4': !editable}"
          fab
          small
          class="mt-1 mx-1 variableButton"
          v-on="on"
          @click="variableAddIfAbsent = !variableAddIfAbsent; onChange()"
        >
          <v-icon>{{ icons.mdiClipboardPlus }}</v-icon>
        </v-btn>
      </template>
      <span
        v-text="variableAddIfAbsent ? 'Variable will be added to configuration if absent' :
          'Variable will not be added to configuration if absent'"
      />
    </v-tooltip>
    <v-tooltip
      bottom
    >
      <template v-slot:activator="{ on }">
        <v-btn
          v-if="editable"
          fab
          class="mr-4 mt-1 ml-2 elevation-4"
          small
          v-on="on"
          @click="addValue"
        >
          <v-icon
            v-html="isNew ? icons.mdiPlus : icons.mdiMinus"
          />
        </v-btn>
      </template>
      <span v-text="isNew ? 'Add variable' : 'Remove variable'" />
    </v-tooltip>
  </v-form>
</template>

<script>
  import { mdiShieldLockOutline, mdiClipboardPlus, mdiPlus, mdiMinus, mdiLock, mdiLockOpen } from '@mdi/js'

  export default {
    name: 'ConstantVariable',
    props: {
      name: {
        type: String,
        default: null,
      },
      type: {
        type: String,
        default: 'string',
      },
      value: {
        type: [String, Number, Boolean, Array],
        default: null,
      },
      forced: {
        type: Boolean,
        default: true,
      },
      addifabsent: {
        type: Boolean,
        default: true,
      },
      isNew: {
        type: Boolean,
        default: false,
      },
      editable: {
        type: Boolean,
        default: true,
      },
    },
    data: props => ({
      variableName: props.name,
      variableType: props.type,
      variableValue: props.value,
      variableForced: props.forced,
      variableAddIfAbsent: props.addifabsent,

      types: ['string', 'number', 'password', 'boolean', 'text', 'list', 'Vault'],

      currentRules: [],
      errorMessage: undefined,

      pass_locked: true,

      rules: {
        required: value => !!value || 'Required',
      },

      icons: {
        mdiShieldLockOutline,
        mdiClipboardPlus,
        mdiPlus,
        mdiMinus,
        mdiLock,
        mdiLockOpen,
      },
    }),
    watch: {
      variableType (actual, prev) {
        if (actual === 'number') {
          this.variableValue = 0
        } else if (actual === 'list') {
          this.variableValue = []
        } else {
          if (prev === 'number' || prev === 'list') {
            this.variableValue = null
          }
        }
      },
    },
    methods: {
      reset () {
        this.$refs.variableValidationForm.reset()

        this.$nextTick(() => {
          this.variableName = null
          this.variableType = 'string'
          this.variableValue = ''
          this.variableForced = true
          this.variableAddIfAbsent = true
        })
      },
      addValue () {
        if (this.isNew) {
          this.currentRules = [this.rules.required]
          this.$nextTick(() => {
            if (this.$refs.variableValidationForm.validate()) {
              const all = {
                name: this.variableName,
                type: this.variableType,
                value: this.variableValue,
                forced: this.variableForced,
                addIfAbsent: this.variableAddIfAbsent,
              }

              this.$emit('addVariable', all)
            }
          })
        } else {
          this.$emit('deleteVariable', this.variableName)
        }
      },
      onChange () {
        const all = {
          name: this.variableName,
          type: this.variableType,
          value: this.variableValue,
          forced: this.variableForced,
          addIfAbsent: this.variableAddIfAbsent,
        }

        this.$emit('change', all)
      },
    },
  }
</script>

<style lang="scss" scoped>
.variableButton::before {
  opacity: 0 !important;
}
.variableButton:hover::before {
  opacity: 0.18 !important;
}
</style>
