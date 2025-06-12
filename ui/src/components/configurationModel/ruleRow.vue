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
				:label="`Target ${localTargetType} ${
					localTargetRegEx ? 'regular expression' : 'text'
				}`"
				:rules="[
					(val) =>
						!!val ||
						`Target ${localTargetType} ${
							localTargetRegEx ? 'regular expression' : 'text'
						} can't be empty`,
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
				:label="`Condition ${localConditionType} ${
					localConditionRegEx ? 'regular expression' : 'text'
				}`"
				:rules="[
					(val) =>
						!!val ||
						`Condition ${localConditionType} ${
							localConditionRegEx ? 'regular expression' : 'text'
						} can't be empty`,
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
			:rules="[(val) => !!val || `Error message can't be empty`]"
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
/**
 * Component that represents a single rule row in the configuration model.
 * Allows users to define target and condition parameters for validation rules,
 * including support for regular expressions and error messages.
 */
import {
	ConfigurationModelRuleConditionType,
	ConfigurationModelRuleTargetType,
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
	'deleteClicked',
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
 * A computed property that binds to the `targetType` prop and emits updates when changed.
 *
 * The `localTargetType` serves as a two-way data binding interface. It uses the `get` function
 * to retrieve the value of `props.targetType` and the `set` function to emit the updated
 * value of `targetType` using the `update:targetType` event.
 *
 * This computed property is useful for synchronizing the state of a component
 * with its parent using Vue's props and events system.
 *
 * Dependencies:
 * - `props.targetType`: The current value of the target type provided by the parent component.
 * - `emit`: A function to notify the parent component about updates.
 */
const localTargetType = computed({
	get: () => props.targetType,
	set: (value) => emit('update:targetType', value),
});

/**
 * Represents a computed property that acts as a two-way binding for the target value.
 *
 * The `localTargetValue` allows getting the value of `props.targetValue`
 * and setting it by emitting an `update:targetValue` event with the new value.
 *
 * It is used to create a reactive and synchronized property within a component,
 * enabling external updates through props while maintaining local reactivity.
 */
const localTargetValue = computed({
	get: () => props.targetValue,
	set: (value) => emit('update:targetValue', value),
});

/**
 * A computed property that acts as a two-way binding for the `targetRegEx` value.
 *
 * The `get` function retrieves the current `targetRegEx` value from the component's `props`.
 * The `set` function updates the `targetRegEx` value by emitting an `update:targetRegEx` event with the new value.
 *
 * Used to synchronize the target regular expression between the parent component and this component.
 */
const localTargetRegEx = computed({
	get: () => props.targetRegEx,
	set: (value) => emit('update:targetRegEx', value),
});

/**
 * A computed property that serves as a two-way data binding for the `conditionType` property.
 * It retrieves the current `conditionType` value from the parent component via `props` and
 * emits an update event when the value is modified.
 *
 * The `get` method fetches the current value of `conditionType`.
 * The `set` method allows updating the `conditionType` value and emits an
 * 'update:conditionType' event to notify the parent component.
 *
 * This variable is useful for maintaining synchronization between a parent component's state
 * and the local state of a child component.
 *
 * @type {object} - Vue computed property with getter and setter.
 */
const localConditionType = computed({
	get: () => props.conditionType,
	set: (value) => emit('update:conditionType', value),
});

/**
 * A computed property that synchronizes with a parent component's conditionValue.
 * It acts as a two-way data binding mechanism.
 *
 * - The `get` function retrieves the current `conditionValue` from the `props` of the component.
 * - The `set` function emits an `update:conditionValue` event with the provided value to update the parent component.
 *
 * This variable is designed to be reactive and updates whenever the bound `conditionValue` changes.
 */
const localConditionValue = computed({
	get: () => props.conditionValue,
	set: (value) => emit('update:conditionValue', value),
});

/**
 * A computed property that binds to a regular expression, used for local condition assessment.
 * This property provides both getter and setter functionalities.
 * - **Getter**: Retrieves the current value of `conditionRegEx` from the parent component's props.
 * - **Setter**: Emits an update event (`update:conditionRegEx`) with the new value to synchronize changes with the parent component.
 */
const localConditionRegEx = computed({
	get: () => props.conditionRegEx,
	set: (value) => emit('update:conditionRegEx', value),
});

/**
 * A computed property that manages the local error state with a getter and setter.
 *
 * The getter retrieves the `error` property passed through `props`.
 * The setter emits an `update:error` event with the updated error value.
 *
 * This is typically used to synchronize a parent's error state with a child component's local error state in a unidirectional data flow setup.
 *
 * @type {import('vue').ComputedRef<unknown>}
 */
const localError = computed({
	get: () => props.error,
	set: (value) => emit('update:error', value),
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
 * Toggles between regular expression and plain text mode for target value.
 * Updates the localTargetRegEx value to its opposite state.
 */
const switchTargetRegEx = () => {
	localTargetRegEx.value = !localTargetRegEx.value;
};

/**
 * Toggles between regular expression and plain text mode for condition value.
 * Updates the localConditionRegEx value to its opposite state.
 */
const switchConditionRegEx = () => {
	localConditionRegEx.value = !localConditionRegEx.value;
};

/**
 * Handles the click event for the add/delete button.
 * If the row is new, validates inputs and emits 'addClicked' event if valid.
 * If the row exists, emits 'deleteClicked' event with the row ID.
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
 * Validates all input fields in the rule row.
 * Triggers validation on target value, condition value, and error message inputs.
 */
const validate = () => {
	if (targetValueInput.value && conditionValueInput.value && errorInput.value) {
		targetValueInput.value.validate();
		conditionValueInput.value.validate();
		errorInput.value.validate();
	}
};

/**
 * Resets validation state for all input fields.
 * Clears validation messages on target value, condition value, and error message inputs.
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
	resetValidation,
});
</script>

<style scoped></style>
