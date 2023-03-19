<!--
  - Copyright RPSoft 2019,2023. All Rights Reserved.
  - This file is part of RPSoft Tower.
  -
  - Tower is free software: you can redistribute it and/or modify
  - it under the terms of the GNU General Public License as published by
  - the Free Software Foundation; either version 3 of the License, or
  - (at your option) any later version.
  -
  - Tower is distributed in the hope that it will be useful,
  - but WITHOUT ANY WARRANTY; without even the implied warranty of
  - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  - GNU General Public License for more details.
  -
  - You should have received a copy of the GNU General Public License
  - along with Tower. If not, see http:www.gnu.org/licenses/gpl-3.0.html.
  -->

<template>
	<div class="tw-flex tw-w-full tw-items-stretch">
		<div class="tw-flex tw-grow">
			<q-select
				v-model="localTargetType"
				:disable="readOnly"
				:options="Object.values(ConfigurationModelRuleTargetType)"
				borderless
				class="tw-mr-1"
				color="secondary"
				dense
				options-dense
				popup-content-class="shadow-black"
			>
				<template v-slot:selected>
					<q-icon
						:name="
							localTargetType === 'name' ? 'sym_o_badge' : 'sym_o_data_object'
						"
						size="sm"
					/>
				</template>
				<template v-slot:option="{ itemProps, opt }">
					<q-item class="tw-text-secondary" v-bind="itemProps">
						<q-item-section class="tw-flex">
							<q-icon
								:name="opt === 'name' ? 'sym_o_badge' : 'sym_o_data_object'"
								size="sm"
							/>
						</q-item-section>
						<q-item-section>
							<q-item-label class="tw-min-w-[5rem]">{{ opt }}</q-item-label>
						</q-item-section>
					</q-item>
				</template>
			</q-select>
			<q-input
				ref="targetValueInput"
				v-model="localTargetValue"
				:disable="readOnly"
				:label="
					`Target ${localTargetType} ${
						localTargetRegEx ? 'regular expression' : 'text'
					}`
				"
				:rules="[
					val =>
						!!val ||
						`Target ${localTargetType} ${
							localTargetRegEx ? 'regular expression' : 'text'
						} can't be empty`
				]"
				class="tw-grow"
				color="secondary"
				dense
				@blur="targetValueInput.resetValidation()"
			>
				<template #append>
					<q-icon
						v-if="localTargetRegEx"
						class="tw-cursor-pointer"
						name="sym_o_function"
						@click="switchTargetRegEx"
					>
						<q-tooltip>Switch to regular expression</q-tooltip>
					</q-icon>
					<q-icon
						v-else
						class="tw-cursor-pointer"
						name="sym_o_text_fields"
						@click="switchTargetRegEx"
					>
						<q-tooltip>Switch to text</q-tooltip>
					</q-icon>
				</template>
			</q-input>
		</div>
		<div class="tw-flex tw-ml-3 tw-grow">
			<q-select
				v-model="localConditionType"
				:disable="readOnly"
				:options="Object.values(ConfigurationModelRuleConditionType)"
				borderless
				class="tw-mr-1"
				color="secondary"
				dense
				options-dense
				popup-content-class="shadow-black"
			>
				<template v-slot:selected>
					<q-icon
						:name="
							localConditionType === 'type'
								? 'sym_o_data_object'
								: 'sym_o_variables'
						"
						size="sm"
					/>
				</template>
				<template v-slot:option="{ itemProps, opt }">
					<q-item class="tw-text-secondary" v-bind="itemProps">
						<q-item-section class="tw-flex">
							<q-icon
								:name="opt === 'type' ? 'sym_o_data_object' : 'sym_o_variables'"
								size="sm"
							/>
						</q-item-section>
						<q-item-section>
							<q-item-label class="tw-min-w-[5rem]">{{ opt }}</q-item-label>
						</q-item-section>
					</q-item>
				</template>
			</q-select>
			<q-input
				ref="conditionValueInput"
				v-model="localConditionValue"
				:disable="readOnly"
				:label="
					`Condition ${localConditionType} ${
						localConditionRegEx ? 'regular expression' : 'text'
					}`
				"
				:rules="[
					val =>
						!!val ||
						`Condition ${localConditionType} ${
							localConditionRegEx ? 'regular expression' : 'text'
						} can't be empty`
				]"
				class="tw-grow"
				color="secondary"
				dense
				@blur="conditionValueInput.resetValidation()"
			>
				<template #append>
					<q-icon
						v-if="localConditionRegEx"
						class="tw-cursor-pointer"
						name="sym_o_function"
						@click="switchConditionRegEx"
					>
						<q-tooltip>Switch to regular expression</q-tooltip>
					</q-icon>
					<q-icon
						v-else
						class="tw-cursor-pointer"
						name="sym_o_text_fields"
						@click="switchConditionRegEx"
					>
						<q-tooltip>Switch to text</q-tooltip>
					</q-icon>
				</template>
			</q-input>
		</div>
		<q-input
			ref="errorInput"
			v-model="localError"
			:disable="readOnly"
			:rules="[val => !!val || `Error message can't be empty`]"
			class="tw-ml-3 tw-grow"
			color="secondary"
			dense
			label="Error message"
			@blur="errorInput.resetValidation()"
		/>
		<q-btn
			:disable="readOnly"
			class="tw-ml-2 tw-my-2"
			flat
			padding="sm"
			@click="addDeleteButtonClicked"
		>
			<q-icon :name="isNew ? 'sym_o_add' : 'sym_o_delete'" size="sm"></q-icon>
		</q-btn>
	</div>
</template>

<script lang="ts" setup>
import {
	ConfigurationModelRuleConditionType,
	ConfigurationModelRuleTargetType
} from 'components/configurationModel/configurationModel';
import { computed, Ref, ref } from 'vue';
import { QInput } from 'quasar';

//====================================================
// Props
//====================================================
const props = defineProps<{
	id?: string;
	targetType: ConfigurationModelRuleTargetType;
	targetValue: string;
	targetRegEx: boolean;
	conditionValue: string;
	conditionType: ConfigurationModelRuleConditionType;
	conditionRegEx: boolean;
	error: string;
	isNew: boolean;
	readOnly?: boolean;
}>();

//====================================================
// Emits
//====================================================
const emit = defineEmits([
	'update:targetType',
	'update:targetValue',
	'update:targetRegEx',
	'update:conditionType',
	'update:conditionValue',
	'update:conditionRegEx',
	'update:error',
	'addClicked',
	'deleteClicked'
]);

//====================================================
// Data
//====================================================
const targetValueInput: Ref<QInput | null> = ref(null);
const conditionValueInput: Ref<QInput | null> = ref(null);
const errorInput: Ref<QInput | null> = ref(null);

//====================================================
// Computed
//====================================================
/**
 * localTargetType
 */
const localTargetType = computed({
	get: () => props.targetType,
	set: value => emit('update:targetType', value)
});

/**
 * localTargetValue
 */
const localTargetValue = computed({
	get: () => props.targetValue,
	set: value => emit('update:targetValue', value)
});

/**
 * localTargetRegEx
 */
const localTargetRegEx = computed({
	get: () => props.targetRegEx,
	set: value => emit('update:targetRegEx', value)
});

/**
 * localConditionType
 */
const localConditionType = computed({
	get: () => props.conditionType,
	set: value => emit('update:conditionType', value)
});

/**
 * localConditionValue
 */
const localConditionValue = computed({
	get: () => props.conditionValue,
	set: value => emit('update:conditionValue', value)
});

/**
 * localConditionRegEx
 */
const localConditionRegEx = computed({
	get: () => props.conditionRegEx,
	set: value => emit('update:conditionRegEx', value)
});

/**
 * localError
 */
const localError = computed({
	get: () => props.error,
	set: value => emit('update:error', value)
});

/**
 * isValid
 */
const isValid = computed(() => {
	return !!(props.error && props.targetValue && props.conditionValue);
});

//====================================================
// Methods
//====================================================
/**
 * switchTargetRegEx
 */
const switchTargetRegEx = () => {
	localTargetRegEx.value = !localTargetRegEx.value;
};

/**
 * switchConditionRegEx
 */
const switchConditionRegEx = () => {
	localConditionRegEx.value = !localConditionRegEx.value;
};

/**
 * addDeleteButtonClicked
 */
const addDeleteButtonClicked = () => {
	if (props.isNew) {
		validate();
		if (isValid.value) {
			emit('addClicked');
		}
	} else {
		emit('deleteClicked', props.id);
	}
};

/**
 * validate
 */
const validate = () => {
	if (targetValueInput.value && conditionValueInput.value && errorInput.value) {
		targetValueInput.value.validate();
		conditionValueInput.value.validate();
		errorInput.value.validate();
	}
};

/**
 * resetValidation
 */
const resetValidation = () => {
	if (targetValueInput.value && conditionValueInput.value && errorInput.value) {
		targetValueInput.value?.resetValidation();
		conditionValueInput.value.resetValidation();
		errorInput.value.resetValidation();
	}
};

//====================================================
// Expose
//====================================================
defineExpose({
	resetValidation
});
</script>

<style scoped></style>
