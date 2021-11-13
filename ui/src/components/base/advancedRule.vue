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
  <v-form
    ref="form"
    class="px-4"
    autocomplete="off"
  >
    <v-row
      align="end"
      class="pt-3 pb-0"
    >
      <v-col
        cols="1"
        class="pr-0 pb-0"
      >
        <v-select
          v-model="target.type"
          :items="target.types"
          :data-cy="`${isNew === true ? 'newRuleTargetSelect' : 'targetSelect' + targetValue}`"
          label="Target"
          style="border-radius: 4px 0 0 4px;"
          :background-color="$vuetify.theme.dark === true ? 'var(--v-background-lighten2)'
            : 'var(--v-background-darken1)'"
          dense
          outlined
          @change="modifyRule"
        />
      </v-col>
      <v-col
        cols="3"
        class="pl-0 pb-0"
      >
        <v-text-field
          v-model="target.value"
          :rules="wantValidation ? rules.required : []"
          :label="target.regex ? 'Regular expression' : 'Text'"
          :data-cy="`${isNew === true ? 'newRuleTargetText' : 'targetText' + targetValue}`"
          required
          dense
          outlined
          style="border-radius: 0 4px 4px 0; margin-left: -1px"
          :placeholder="target.regex ? '^[A-Za-z]+$' : 'text'"
          :append-icon="target.regex ? icons.mdiFormatLetterCase : icons.mdiRegex"
          @click:append="target.regex = !target.regex; modifyRule()"
          @blur="modifyRule"
        />
      </v-col>
      <v-col
        cols="1"
        class="pr-0 pb-0"
      >
        <v-select
          v-model="condition.type"
          style="border-radius: 4px 0 0 4px"
          :background-color="$vuetify.theme.dark === true ? 'var(--v-background-lighten2)'
            : 'var(--v-background-darken1)'"
          :data-cy="`${isNew === true ? 'newRuleConditionSelect' : 'ConditionSelect' + targetValue}`"
          :items="condition.types"
          label="Condition"
          dense
          outlined
          @change="modifyRule"
        />
      </v-col>
      <v-col
        cols="3"
        class="pl-0 pb-0"
      >
        <v-text-field
          v-model="condition.value"
          :rules="wantValidation ? rules.required : []"
          :label="condition.regex ? 'Regular expression' : 'Text'"
          :data-cy="`${isNew === true ? 'newRuleConditionText' : 'ConditionText' + targetValue}`"
          dense
          outlined
          style="border-radius: 0 4px 4px 0; margin-left: -1px"
          :placeholder="condition.regex ? '^[A-Za-z]+$' : 'text'"
          :append-icon="condition.regex ? icons.mdiFormatLetterCase : icons.mdiRegex"
          @click:append="condition.regex = !condition.regex; modifyRule()"
          @blur="modifyRule"
        />
      </v-col>
      <v-col
        cols="4"
        class="pb-0"
        :data-cy="`${isNew === true ? 'newRuleErrorParent' : 'ruleErrorParent' + targetValue}`"
      >
        <v-text-field
          v-model="error.message"
          :rules="wantValidation ? rules.required : []"
          :data-cy="`${isNew === true ? 'newRuleError' : 'ruleError' + targetValue}`"
          outlined
          dense
          class="pr-1"
          label="Error message"
          :append-outer-icon="isNew ? icons.mdiPlus : icons.mdiMinus"
          @click:append-outer="addOrRemoveRule"
          @blur="modifyRule"
        />
      </v-col>
    </v-row>
  </v-form>
</template>

<script>
  import { mdiPlus, mdiMinus, mdiRegex, mdiFormatLetterCase } from '@mdi/js'

  export default {
    name: 'AdvancedRule',
    props: {
      targetValue: {
        type: String,
        default: undefined,
        required: false
      },
      targetType: {
        type: String,
        default: 'name',
        required: false
      },
      targetRegEx: {
        type: Boolean,
        default: false,
        required: false
      },
      conditionValue: {
        type: String,
        default: undefined,
        required: false
      },
      conditionType: {
        type: String,
        default: 'value',
        required: false
      },
      conditionRegEx: {
        type: Boolean,
        default: false,
        required: false
      },
      errorMessage: {
        type: String,
        default: null,
        required: false
      },
      newRule: {
        type: Boolean,
        default: true,
        required: false
      },
      ruleId: {
        type: String,
        default: null,
        required: false
      }
    },
    data: () => ({
      icons: {
        mdiPlus,
        mdiMinus,
        mdiRegex,
        mdiFormatLetterCase
      },
      condition: {
        types: ['type', 'value'],
        type: 'value',
        value: null,
        regex: false
      },
      target: {
        types: ['name', 'type'],
        type: 'name',
        value: null,
        regex: false
      },
      error: {
        message: null
      },
      rules: {
        required: [value => !!value || 'Required']
      },
      isNew: false,
      wantValidation: true
    }),
    mounted () {
      this.target.value = this.targetValue === undefined ? null : this.targetValue
      this.target.type = this.targetType === undefined ? 'name' : this.targetType
      this.target.regex = this.targetRegEx === undefined ? false : this.targetRegEx

      this.condition.value = this.conditionValue === undefined ? null : this.conditionValue
      this.condition.type = this.conditionType === undefined ? 'value' : this.conditionType
      this.condition.regex = this.conditionRegEx === undefined ? false : this.conditionRegEx

      this.error.message = this.errorMessage === undefined ? null : this.errorMessage

      this.isNew = this.newRule
      this.wantValidation = !this.newRule
    },
    methods: {
      addRule () {
        this.wantValidation = true
        this.$nextTick(() => {
          if (this.$refs.form.validate()) {
            this.$emit('add_rule', {
              targetValue: this.target.value,
              targetType: this.target.type,
              targetRegEx: this.target.regex,
              conditionValue: this.condition.value,
              conditionType: this.condition.type,
              conditionRegEx: this.condition.regex,
              errorMessage: this.error.message
            })

            this.$refs.form.reset()
            this.target.type = 'name'
            this.condition.type = 'name'
          }
        })
      },
      modifyRule () {
        if (!this.isNew) {
          if (this.$refs.form.validate()) {
            this.$emit('modify_rule', {
              id: this.ruleId,
              targetValue: this.target.value,
              targetType: this.target.type,
              targetRegEx: this.target.regex,
              conditionValue: this.condition.value,
              conditionType: this.condition.type,
              conditionRegEx: this.condition.regex,
              errorMessage: this.error.message
            })
          }
        } else {
          this.resetValidation()
        }
      },
      addOrRemoveRule () {
        if (this.isNew) {
          this.addRule()
        } else {
          this.removeRule()
        }
      },
      removeRule () {
        this.$emit('delete_rule', {
          id: this.ruleId
        })
      },
      resetValidation () {
        if (this.isNew) {
          this.$refs.form.resetValidation()
          this.wantValidation = false
        }
      },
      reset () {
        this.$refs.form.reset()
      }
    }
  }
</script>

<style scoped>
.ruleType {
  background: var(--v-background-lighten2);
}
</style>
