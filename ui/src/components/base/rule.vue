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
    ref="ruleValidationForm"
    class="d-flex"
  >
    <v-text-field
      v-model="name"
      :rules="currentRules"
      :disabled="!isNew || !editable"
      label="Variable Name"
      class="pl-5 pr-2"
      @blur="onBlur"
    />
    <v-text-field
      v-model="regex"
      :disabled="!editable"
      :rules="currentRules"
      placeholder="^[A-Za-z]+$"
      label="Regular expression"
      prefix="/"
      suffix="/"
      class="px-2"
      @change="modifyRule"
      @blur="onBlur"
    />
    <v-text-field
      v-model="errorMessage"
      :disabled="!editable"
      :rules="currentRules"
      :append-outer-icon="isNew ? icons.mdiPlus : icons.mdiMinus"
      label="Error message"
      class="pl-2 pr-5"
      @click:append-outer="addRule"
      @change="modifyRule"
      @blur="onBlur"
    />
  </v-form>
</template>

<script>
  import { mdiPlus, mdiMinus } from '@mdi/js'

  export default {
    name: 'Rule',
    props: {
      rule_name: {
        type: String,
        default: null,
        required: false,
      },
      editable: {
        type: Boolean,
        default: true,
      },
      rule_regex: {
        type: String,
        default: null,
        required: false,
      },
      rule_error: {
        type: String,
        default: null,
        required: false,
      },
      new_rule: {
        type: Boolean,
        default: true,
        required: false,
      },
      rule_id: {
        type: String,
        default: null,
        required: false,
      },
    },
    data: attrs => {
      return {
        icons: {
          mdiPlus,
          mdiMinus,
        },
        name: attrs.rule_name,
        regex: attrs.rule_regex,
        errorMessage: attrs.rule_error,
        isNew: attrs.new_rule,
        id: attrs.rule_id,

        currentRules: [],

        rules: {
          required: value => !!value || 'Required',
        },
      }
    },
    methods: {
      addRule () {
        if (this.isNew) {
          this.currentRules = [this.rules.required]
          this.$nextTick(() => {
            if (this.$refs.ruleValidationForm.validate()) {
              this.$emit('add_rule', {
                name: this.name,
                regex: this.regex,
                errorMessage: this.errorMessage,
                _this: this,
              })
            }
          })
        } else {
          this.$emit('delete_rule', {
            id: this.id,
          })
        }
      },
      modifyRule () {
        if (!this.isNew) {
          this.currentRules = [this.rules.required]
          this.$nextTick(() => {
            if (this.$refs.ruleValidationForm.validate()) {
              this.$emit('modify_rule', {
                id: this.id,
                name: this.name,
                regex: this.regex,
                errorMessage: this.errorMessage,
              })
            }
          })
        }
      },
      onBlur () {
        if (this.isNew) {
          this.currentRules = []
        }
      },
      reset () {
        this.name = null
        this.regex = null
        this.errorMessage = null
        this.isNew = true
        this.id = null

        this.$refs.ruleValidationForm.reset()
      },
    },
  }
</script>
