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
  <transition
    name="fade"
    mode="out-in"
  >
    <v-form
      ref="newConfigForm"
      autocomplete="off"
    >
      <div class="d-flex flex-row justify-space-around">
        <v-text-field
          ref="configName"
          v-model="local_name"
          :data-cy="`${local_name === null ? 'newConfigName' : 'newConfigName_' + local_name}`"
          :rules="[local_rules.required, ...nameRules]"
          :disabled="local_added"
          class="pr-3 pl-4 newConfigRow_halfWidth"
          autocomplete="off"
          label="Variable Name"
          :error-messages="errorMessage"
          @input="removeErrorMessage"
          @keyup.enter="iconClicked"
        />
        <div class="d-flex newConfigRow_halfWidth">
          <v-select
            v-model="local_type"
            :items="local_types"
            label="Type"
            :data-cy="`${local_name === null ? 'newConfigSelect' : 'newConfigSelect_' + local_name}`"
            :rules="typeRules"
            :disabled="disabled"
            autocomplete="off"
            @input="changed"
          />
          <v-icon
            :disabled="addIfAbsent"
            :data-cy="`${local_name === null ? 'newConfigAdd' : 'newConfigAdd_' + local_name}`"
            class="mx-3 mt-6"
            style="height: 24px"
            @click="iconClicked"
            v-text="local_added ? icons.mdiMinus : icons.mdiPlus"
          />
        </div>
      </div>
    </v-form>
  </transition>
</template>

<script>
  import { mdiLock, mdiLockOpen, mdiMinus, mdiPlus } from '@mdi/js'

  export default {
    name: 'NewConfigurationRow',
    props: {
      name: {
        type: String,
        default: null,
      },
      value: {
        type: [String, Boolean, Number, Array],
        default: null,
      },
      type: {
        type: String,
        default: 'string',
      },
      added: {
        type: Boolean,
        default: false,
      },
      rules: {
        type: Array,
        default: () => { return [] },
        required: false,
      },
      allTypeRules: {
        type: Array,
        default: () => { return [] },
        required: false,
      },
      disabled: {
        type: Boolean,
        default: false,
        required: false,
      },
      addIfAbsent: {
        type: Boolean,
        default: false,
      },
    },
    data: attrs => ({
      icons: {
        mdiLock,
        mdiLockOpen,
        mdiMinus,
        mdiPlus,
      },
      local_name: attrs.name,
      local_value: attrs.value,
      local_type: attrs.type,
      local_added: attrs.added,
      local_types: ['string', 'number', 'password', 'boolean', 'text', 'list', 'Vault'],

      typeRules: [],
      nameRules: [],

      errorMessage: undefined,
      pass_locked: true,

      local_rules: {
        required: value => !!value || 'Required',
      },
    }),
    watch: {
      local_type (actual, prev) {
        if (actual === 'boolean') {
          this.local_value = false
          this.changed()
        } else if (actual === 'list') {
          this.local_value = null
          this.changed()
        }

        if (prev === 'list') {
          this.local_value = null
          this.changed()
        }

        this.typeRules = []
        this.allTypeRules.forEach(rule => {
          if (rule.targetRegEx) {
            const regex = new RegExp(rule.targetValue)
            if (regex.test(actual)) {
              if (rule.conditionRegEx) {
                const conregex = new RegExp(rule.conditionValue)
                this.typeRules.push(v => conregex.test(v) || rule.error)
              } else {
                this.typeRules.push(v => v === rule.conditionValue || rule.error)
              }
            }
          } else {
            if (rule.targetValue === actual) {
              if (rule.conditionRegEx) {
                const conregex = new RegExp(rule.conditionValue)
                this.typeRules.push(v => conregex.test(v) || rule.error)
              } else {
                this.typeRules.push(v => v === rule.conditionValue || rule.error)
              }
            }
          }
        })
      },
    },
    mounted () {
      if (this.rules.length > 0) {
        this.rules.forEach(rule => {
          if (rule.conditionType === 'type') {
            if (rule.conditionRegEx) {
              const regex = new RegExp(rule.conditionValue)
              this.typeRules.push(v => regex.test(v) || rule.error)
            } else {
              this.typeRules.push(v => v === rule.conditionValue || rule.error)
            }
          } else if (rule.conditionType === 'name') {
            if (rule.conditionRegEx) {
              const regex = new RegExp(rule.conditionValue)
              this.nameRules.push(v => regex.test(v) || rule.error)
            } else {
              this.nameRules.push(v => v === rule.conditionValue || rule.error)
            }
          }
        })
      }
    },
    methods: {
      focus () {
        this.$refs.configName.focus()
      },
      iconClicked () {
        if (this.added) {
          this.$emit('delete', {
            name: this.local_name,
          })
        } else {
          if (this.$refs.newConfigForm.validate()) {
            this.$emit('add-row', {
              name: this.local_name,
              type: this.local_type,
              _this: this,
            })
          }
        }
      },
      changed () {
        this.$emit('changed', {
          name: this.local_name,
          type: this.local_type,
        })
      },
      reset () {
        this.$refs.newConfigForm.resetValidation()

        this.local_name = null
        this.local_value = null
        this.local_type = 'string'
        this.local_added = false
      },
      removeErrorMessage () {
        this.errorMessage = undefined
      },
      valid () {
        return this.$refs.newConfigForm.validate()
      },
    },
  }
</script>

<style>
.newConfigRow_halfWidth {
  min-width: 50%;
  max-width: 50%;
}
</style>
