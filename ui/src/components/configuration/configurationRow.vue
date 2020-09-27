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
    name="slowfade"
    mode="out-in"
  >
    <v-form
      v-show="visible"
      ref="newConfigForm"
      :class="getClass"
      autocomplete="off"
    >
      <div
        :class="{configRow_crossed: deleted, 'font-weight-light': deleted, 'font-italic': deleted}"
        :style="local_type === 'boolean' ? 'height:70px' : ''"
        class="d-flex flex-row justify-space-around"
      >
        <div
          :style="
            versions.length > 0 || deleted ? 'min-width:33.33%' : 'min-width:50%'
          "
          class="px-2 text-center configRow_history"
          label="name"
          v-text="local_name"
        />
        <div
          v-if="versions.length > 0 || deleted"
          :style="
            versions.length > 0 || deleted ? 'min-width:33.33%' : 'min-width:50%'
          "
          :class="{ configRow_draft : draft, 'font-weight-light': draft, 'font-italic': draft,
                    configRow_pre : local_type !== 'list'}"
          class="px-2 text-center configRow_history"
          v-text="
            local_type === 'password' && pass_locked
              ? '••••••••'
              : deleted === true ? local_value : versions[current_version]
          "
        />
        <v-text-field
          v-if="local_type === 'string'"
          v-model="local_value"
          :data-cy="`configRow_${local_name}`"
          :style="
            versions.length > 0 || deleted ? 'min-width:33.33%' : 'min-width:50%'
          "
          :rules="local_rules"
          :readonly="forced_value"
          :hint="force_cause"
          class="px-2 configRow_field"
          autocomplete="off"
          label="value"
          persistent-hint
          @input="change"
        />
        <v-text-field
          v-if="local_type === 'Vault'"
          v-model="local_value"
          :data-cy="`configRow_${local_name}`"
          :style="
            versions.length > 0 || deleted ? 'min-width:33.33%' : 'min-width:50%'
          "
          :rules="local_rules"
          :readonly="forced_value"
          :hint="force_cause"
          class="px-2 configRow_field"
          autocomplete="off"
          label="value"
          persistent-hint
          @input="change"
        />
        <v-textarea
          v-if="local_type === 'text'"
          v-model="local_value"
          :data-cy="`configRow_${local_name}`"
          :style="
            versions.length > 0 || deleted ? 'min-width:33.33%' : 'min-width:50%'
          "
          :rules="local_rules"
          :readonly="forced_value"
          :hint="force_cause"
          class="px-2 configRow_field"
          autocomplete="off"
          rows="1"
          label="value"
          persistent-hint
          @input="change"
        />
        <v-text-field
          v-if="local_type === 'password'"
          v-model="local_value"
          :data-cy="`configRow_${local_name}`"
          :style="
            versions.length > 0 || deleted ? 'min-width:33.33%' : 'min-width:50%'
          "
          :type="pass_locked ? 'password' : 'text'"
          :append-icon="pass_locked ? icons.mdiLock : icons.mdiLockOpen"
          :rules="local_rules"
          :readonly="forced_value"
          :hint="force_cause"
          class="px-2 configRow_field"
          autocomplete="off"
          label="value"
          persistent-hint
          @input="change"
          @click:append="pass_locked = !pass_locked"
        />
        <v-combobox
          v-if="local_type === 'list'"
          v-model="local_value"
          :data-cy="`configRow_${local_name}`"
          :style="
            versions.length > 0 || deleted ? 'min-width:33.33%' : 'min-width:50%'
          "
          class="px-2 mt-4 configRow_field"
          :rules="local_rules"
          :readonly="forced_value"
          :hint="force_cause"
          dense
          label="List"
          multiple
          chips
          deletable-chips
          append-icon
          persistent-hint
          @change="change"
        />
        <div
          v-if="local_type === 'boolean'"
          :style="
            versions.length > 0 || deleted
              ? 'min-width:33.33%'
              : 'min-width:50%'
          "
          class="px-2 configRow_field"
        >
          <v-checkbox
            v-model="local_value"
            :data-cy="`configRow_${local_name}`"
            :rules="local_rules"
            :readonly="forced_value"
            :hint="force_cause"
            color="lightblack"
            class="align-center justify-center"
            style="margin-top: 20px; width: 100%"
            ripple
            persistent-hint
            @change="change"
          />
        </div>
        <v-text-field
          v-if="local_type === 'number'"
          v-model="local_value"
          :data-cy="`configRow_${local_name}`"
          :style="
            versions.length > 0 || deleted ? 'min-width:33.33%' : 'min-width:50%'
          "
          :rules="local_rules"
          :readonly="forced_value"
          :hint="force_cause"
          class="px-2 configRow_field"
          autocomplete="off"
          label="value"
          type="number"
          persistent-hint
          @input="change"
        />
      </div>
    </v-form>
  </transition>
</template>

<script>
  import { mdiLock, mdiLockOpen } from '@mdi/js'

  export default {
    name: 'CongiurationRow',
    props: {
      name: {
        type: String,
        required: true,
      },
      versions: {
        type: Array,
        required: false,
        default: function () { return [] },
      },
      value: {
        type: [String, Boolean, Number, Array],
        default: '',
      },
      type: {
        type: String,
        required: true,
      },
      rules: {
        type: Array,
        required: false,
        default: () => {
          return []
        },
      },
      deleted: {
        type: Boolean,
        default: false,
      },
      current_version: {
        type: Number,
        required: true,
      },
      forced_value: {
        type: Boolean,
        default: false,
      },
      force_cause: {
        type: String,
      },
      visible: {
        type: Boolean,
        default: true,
      },
      draft_versions: {
        type: Array,
        required: true,
      },
    },
    data: attrs => ({
      icons: {
        mdiLock,
        mdiLockOpen,
      },
      local_name: attrs.name,
      local_value: attrs.getLocalValue(),
      local_type: attrs.type,
      local_rules: [],

      pass_locked: true,
    }),
    computed: {
      draft () {
        return this.draft_versions.includes(this.current_version)
      },
      getClass () {
        const base = this.different ? 'configRow_different' : 'configRow_noColor'

        return base
      },
      historicLabel () {
        return `Version #${this.current_version}`
      },
      different () {
        if (this.deleted) {
          return this.local_value
        }

        if (this.local_type === 'list') {
          let diff = false
          if (this.local_value === '') {
            return true
          }
          if (this.versions[this.current_version] === undefined || this.versions[this.current_version] === null) {
            return true
          } else if (this.versions[this.current_version].length !== this.local_value.length) {
            return true
          }

          this.local_value.forEach((el, i) => {
            if (this.versions[this.current_version] === undefined ||
              this.versions[this.current_version][i] === undefined) {
              diff = true
              return
            }
            if (el !== this.versions[this.current_version][i]) {
              diff = true
            }
          })

          return diff
        }

        return this.versions[this.current_version] !== this.local_value
      },
    },
    watch: {
      value () {
        this.local_value = this.getLocalValue()
      },
    },
    mounted () {
      this.createLocalRules()
    },
    methods: {
      getLocalValue () {
        if (this.type === 'boolean') {
          if (this.value === 'true' || this.value === true) {
            return true
          } else {
            return false
          }
        } else {
          return this.value
        }
      },
      change () {
        this.$emit('change', {
          name: this.local_name,
          value: this.local_value,
          type: this.local_type,
        })
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
      valid () {
        return this.$refs.newConfigForm.validate()
      },
    },
  }
</script>
