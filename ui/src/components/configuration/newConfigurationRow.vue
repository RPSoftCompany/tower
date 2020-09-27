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
  <transition
    name="fade"
    mode="out-in"
  >
    <v-form
      v-show="visible"
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
          class="pr-3 pl-4 newConfigRow_thirdWidth"
          autocomplete="off"
          label="name"
        />
        <v-select
          v-model="local_type"
          :items="local_types"
          label="Type"
          :data-cy="`${local_name === null ? 'newConfigSelect' : 'newConfigSelect_' + local_name}`"
          class="newConfigRow_thirdWidth"
          :rules="typeRules"
          autocomplete="off"
          @input="changed"
        />
        <v-text-field
          v-if="local_type === 'string'"
          v-model="local_value"
          data-cy="newConfigString"
          :readonly="forced"
          class="px-2 newConfigRow_thirdWidth"
          autocomplete="off"
          label="value"
          @input="changed"
        />
        <v-text-field
          v-if="local_type === 'Vault'"
          v-model="local_value"
          data-cy="newConfigVaule"
          :readonly="forced"
          class="px-2 newConfigRow_thirdWidth"
          autocomplete="off"
          label="value"
          @input="changed"
        />
        <v-textarea
          v-if="local_type === 'text'"
          v-model="local_value"
          data-cy="newConfigText"
          :readonly="forced"
          class="px-2 newConfigRow_thirdWidth"
          autocomplete="off"
          rows="1"
          label="value"
          @input="changed"
        />
        <v-text-field
          v-if="local_type === 'password'"
          v-model="local_value"
          data-cy="newConfigPassword"
          :readonly="forced"
          :type="pass_locked ? 'password' : 'text'"
          :append-icon="pass_locked ? icons.mdiLock : icons.mdiLockOpen"
          class="px-2 newConfigRow_thirdWidth"
          autocomplete="off"
          label="value"
          @input="changed"
          @click:append="pass_locked = !pass_locked"
        />
        <div
          v-if="local_type === 'boolean'"
          class="newConfigRow_thirdWidth pl-2"
          style="min-width:32%; max-height: 30px"
        >
          <v-checkbox
            v-model="local_value"
            :readonly="forced"
            data-cy="newConfigBoolean"
            color="lightblack"
            class="align-center justify-center"
            style="margin-top: 10px; width: 100%"
            ripple
            @change="changed"
          />
        </div>
        <v-text-field
          v-if="local_type === 'number'"
          v-model="local_value"
          data-cy="newConfigNumber"
          :readonly="forced"
          class="px-2 newConfigRow_thirdWidth"
          autocomplete="off"
          label="value"
          type="number"
          @input="changed"
        />
        <v-combobox
          v-if="local_type === 'list'"
          v-model="local_value"
          data-cy="newConfigList"
          :readonly="forced"
          style="margin-top: 8px;"
          class="px-2 newConfigRow_thirdWidth"
          dense
          label="List"
          multiple
          chips
          deletable-chips
          append-icon
        />
        <v-icon
          :disabled="addIfAbsent"
          :data-cy="`${local_name === null ? 'newConfigAdd' : 'newConfigAdd_' + local_name}`"
          class="newConfigRow_addRemoveIcon mr-3 mt-3 pb-0"
          @click="iconClicked"
          v-text="local_added ? icons.mdiMinus : icons.mdiPlus"
        />
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
      filter: {
        type: String,
        default: '',
      },
      visible: {
        type: Boolean,
        default: true,
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
      forced: {
        type: Boolean,
        default: false,
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
          this.$emit('remove_row', {
            name: this.local_name,
          })
        } else {
          if (this.$refs.newConfigForm.validate()) {
            this.$emit('add_row', {
              name: this.local_name,
              value: this.local_value,
              type: this.local_type,
              _this: this,
            })
          }
        }
      },
      changed () {
        this.$emit('change_row', {
          name: this.local_name,
          value: this.local_value,
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

<style scoped>
.v-chip__content {

}
</style>
