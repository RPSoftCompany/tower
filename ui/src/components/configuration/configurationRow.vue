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
  <div
    :class="{configRow_crossed: deleted, 'font-weight-light': deleted, 'font-italic': deleted}"
    :style="local_type === 'boolean' ? 'height:71px' : ''"
    class="d-flex flex-row justify-space-around"
  >
    <v-row
      class="ma-0"
      :class="{'configRow_different': different}"
    >
      <v-col
        :cols="showHistory === true ? 4 : 6"
        class="pl-2 py-0 d-flex text-center align-center justify-center"
      >
        <v-icon
          v-if="isConstantVariable"
          class="mb-1"
          style="width: 24px"
          v-text="icons.mdiAlphaCBox"
        />
        <div
          style="flex-wrap: wrap; word-break: break-all; flex: 1;"
        >
          <div
            :class="isConstantVariable ? 'mr-6' : undefined"
            class="align-center text-center text-wrap"
          >
            {{ local_name }}
          </div>
        </div>
      </v-col>
      <v-col
        v-if="showHistory === true"
        :cols="4"
        :class="{ configRow_draft : draft, 'font-weight-light': draft, 'font-italic': draft,
                  configRow_pre : local_type !== 'list'}"
        class="px-2 py-0 text-center configRow_history"
        v-text="
          local_type === 'password' && pass_locked
            ? '••••••••'
            : deleted === true ? local_value : currentVersionValue
        "
      />
      <v-col
        class="py-0"
        :cols="showHistory === true ? 4 : 6"
      >
        <v-text-field
          v-if="local_type === 'string'"
          v-model="local_value"
          :data-cy="`configRow_${local_name}`"
          :rules="local_rules"
          :disabled="deleted"
          :readonly="forcedValue"
          :hint="forceCause"
          class="pr-2 thirdWidth"
          autocomplete="off"
          :error-messages="errorMessage"
          label="value"
          persistent-hint
          @input="change"
        />
        <v-text-field
          v-else-if="local_type === 'Vault'"
          v-model="local_value"
          :data-cy="`configRow_${local_name}`"
          :disabled="deleted"
          :rules="local_rules"
          :readonly="forcedValue"
          :hint="forceCause"
          :error-messages="errorMessage"
          class="pr-2 thirdWidth"
          autocomplete="off"
          label="value"
          persistent-hint
          @input="change"
        />
        <v-textarea
          v-else-if="local_type === 'text'"
          v-model="local_value"
          :data-cy="`configRow_${local_name}`"
          :disabled="deleted"
          :rules="local_rules"
          :readonly="forcedValue"
          :hint="forceCause"
          :error-messages="errorMessage"
          class="pr-2 thirdWidth"
          autocomplete="off"
          rows="1"
          label="value"
          persistent-hint
          @input="change"
        />
        <v-text-field
          v-else-if="local_type === 'password'"
          v-model="local_value"
          :data-cy="`configRow_${local_name}`"
          :disabled="deleted"
          :type="pass_locked ? 'password' : 'text'"
          :append-icon="pass_locked ? icons.mdiLock : icons.mdiLockOpen"
          :rules="local_rules"
          :readonly="forcedValue"
          :hint="forceCause"
          :error-messages="errorMessage"
          class="pr-2 thirdWidth"
          autocomplete="off"
          label="value"
          persistent-hint
          @input="change"
          @click:append="pass_locked = !pass_locked"
        />
        <v-combobox
          v-else-if="local_type === 'list'"
          v-model="local_value"
          :data-cy="`configRow_${local_name}`"
          :disabled="deleted"
          class="pr-2 mt-4 thirdWidth"
          :rules="local_rules"
          :error-messages="errorMessage"
          :readonly="forcedValue"
          :hint="forceCause"
          dense
          label="List"
          multiple
          chips
          deletable-chips
          persistent-hint
          @change="change"
        />
        <div
          v-else-if="local_type === 'boolean'"
          class="pr-2 thirdWidth"
        >
          <v-checkbox
            v-model="local_value"
            :data-cy="`configRow_${local_name}`"
            :rules="local_rules"
            :disabled="deleted"
            :readonly="forcedValue"
            :hint="forceCause"
            :error-messages="errorMessage"
            color="lightblack"
            class="align-center justify-center"
            style="margin-top: 20px; width: 100%"
            ripple
            persistent-hint
            @change="change"
          />
        </div>
        <v-text-field
          v-else-if="local_type === 'number'"
          v-model="local_value"
          :data-cy="`configRow_${local_name}`"
          :disabled="deleted"
          :rules="local_rules"
          :readonly="forcedValue"
          :error-messages="errorMessage"
          :hint="forceCause"
          class="pr-2 thirdWidth"
          autocomplete="off"
          label="value"
          type="number"
          persistent-hint
          @input="change"
        />
      </v-col>
      <v-col
        :cols="12"
        class="pa-0"
        color="red"
      >
        <v-divider />
      </v-col>
    </v-row>
  </div>
</template>

<script>
  import { mdiLock, mdiLockOpen, mdiAlphaCBox } from '@mdi/js'

  export default {
    name: 'CongiurationRow',
    props: {
      name: {
        type: String,
        required: true
      },
      value: {
        type: [String, Boolean, Number, Array],
        default: ''
      },
      type: {
        type: String,
        required: true
      },
      rules: {
        type: Array,
        required: false,
        default: () => {
          return []
        }
      },
      deleted: {
        type: Boolean,
        default: false
      },
      currentVersionValue: {
        type: [String, Boolean, Number, Array],
        default: null,
        required: false
      },
      currentVersionType: {
        type: String,
        default: undefined,
        required: false
      },
      forcedValue: {
        type: Boolean,
        default: false
      },
      forceCause: {
        type: String,
        default: null
      },
      isNew: {
        type: Boolean,
        default: false
      },
      draft: {
        type: Boolean,
        default: false
      },
      isConstantVariable: {
        type: Boolean,
        default: false
      },
      showHistory: {
        type: Boolean,
        default: true
      }
    },
    data: attrs => ({
      icons: {
        mdiLock,
        mdiLockOpen,
        mdiAlphaCBox
      },
      local_name: attrs.name,
      local_value: attrs.getLocalValue(),
      local_type: attrs.type,
      local_rules: [],

      errorMessage: [],

      pass_locked: true
    }),
    computed: {
      minWidth () {
        if (this.showHistory === true) {
          return 'min-width:33%'
        }

        return 'min-width:50%'
      },
      different () {
        if (this.deleted || this.isNew) {
          return true
        }

        if (this.currentVersionType && this.currentVersionType !== this.type) {
          return true
        }

        if (this.local_type === 'list') {
          let diff = false
          if (this.local_value === '') {
            return true
          }
          if (this.currentVersionValue === undefined || this.currentVersionValue === null) {
            return true
          } else if (this.currentVersionValue.length !== this.local_value.length) {
            return true
          }

          this.local_value.forEach((el, i) => {
            if (this.currentVersionValue === undefined) {
              diff = true
              return
            }
            if (el !== this.currentVersionValue[i]) {
              diff = true
            }
          })

          return diff
        }

        const localValue = this.local_value !== undefined ? this.local_value : ''

        return this.currentVersionValue !== localValue
      }
    },
    watch: {
      value () {
        this.local_value = this.getLocalValue()
      }
    },
    mounted () {
      this.createLocalRules()
      this.validate()
    },
    methods: {
      getLocalValue () {
        if (this.type === 'boolean') {
          return this.value === 'true' || this.value === true
        } else {
          return this.value
        }
      },
      change () {
        if (this.local_type === 'number') {
          this.local_value = Number(this.local_value)
        } else if (this.local_type === 'string') {
          this.local_value = `${this.local_value}`
        }

        this.$emit('input', this.local_value)
      },
      createLocalRules () {
        this.rules.forEach(rule => {
          if (rule.conditionType === 'value' && rule.conditionRegEx) {
            const regex = new RegExp(rule.conditionValue)
            this.local_rules.push(v => regex.test(v) || rule.error)
          } else if (rule.conditionType === 'value' && !rule.conditionRegEx) {
            this.local_rules.push(v => v === rule.conditionValue || rule.error)
          } else if (rule.conditionType === 'type' && rule.conditionRegEx) {
            const regex = new RegExp(rule.conditionValue)
            this.local_rules.push(() => regex.test(this.local_type) || rule.error)
          } else if (rule.conditionType === 'type' && !rule.conditionRegEx) {
            this.local_rules.push(() => this.local_type === rule.conditionValue || rule.error)
          }
        })
      },
      validate () {
        this.errorMessage = []
        this.local_rules.forEach(rule => {
          const output = rule(this.local_value)
          if (output !== true) {
            this.errorMessage = output
          }
        })
      }
    }
  }
</script>

<style lang="scss">
.configRow_draft {
  background: rgba(155, 163, 158, 0.3);
}

.configRow_crossed {
  text-decoration: line-through;
}

.configRow_history {
  display: flex;
  justify-content: center;
  align-items: center;
  word-break: break-all;
}

.configRow_different {
  position: relative;
  z-index: 1;
}

.configRow_different::before {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: var(--v-primary-base);
  opacity: 0.5;
  z-index: -1;
}
</style>
