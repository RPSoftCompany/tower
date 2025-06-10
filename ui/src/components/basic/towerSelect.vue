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
	<q-select
		ref="select"
		v-model="modelValue"
		:clearable="clearable"
		:disable="disable"
		:displayValue="displayValue"
		:label="label"
		:loading="loading"
		:option-label="optionLabel"
		:options="options"
		:rules="rules"
		:stack-label="!!displayAsEmpty"
		clear-icon="sym_o_close"
		color="secondary"
		dense
		input-debounce="0"
		use-input
		@filter="filterFn"
	>
		<template v-if="displayAsEmpty" v-slot:selected>
			<template v-if="!modelValue"
				><span class="tw-text-gray-500">{{ displayAsEmpty }}</span></template
			>
			<template v-else>{{ modelValue }}</template>
		</template>
		<template v-for="(_, slot) of $slots" v-slot:[slot]="scope">
			<template v-if="scope">
				<slot :name="slot" v-bind="scope" />
			</template>
			<template v-else>
				<slot :name="slot" />
			</template>
		</template>
	</q-select>
</template>

<script lang="ts" setup>
import { computed, Ref, ref } from 'vue';
import { QSelect } from 'quasar';

interface towerSelectProps {
	modelValue: object | string | null | undefined;
	options: undefined | Array<object> | Array<string>;
	optionLabel?: string | undefined;
	label: string;
	loading?: boolean;
	disable?: boolean;
	clearable?: boolean;
	filter?: string;
	displayValue?: string;
	displayAsEmpty?: string;
	rules?: Array<any>;
}

/**
 * Props for the towerSelect component.
 *
 * @typedef {Object} towerSelectProps
 *
 * @property {any} [modelValue=null] - The current selected value of the select component.
 * @property {Function} [options=() => []] - A function that returns the list of options available in the select component.
 * @property {string} [optionLabel=''] - A key for determining the display label of options in the select component.
 * @property {string} [label=''] - The label displayed alongside the select component.
 * @property {boolean} [loading=false] - A boolean flag indicating whether the component is in a loading state.
 * @property {boolean} [disable=false] - A boolean flag indicating whether the select component is disabled.
 * @property {boolean} [clearable=false] - A boolean flag indicating whether the selected value can be cleared by the user.
 * @property {string} [filter=''] - A string used to filter the options in the select component.
 */
const props = withDefaults(defineProps<towerSelectProps>(), {
	modelValue: null,
	options: () => [],
	optionLabel: '',
	label: '',
	loading: false,
	disable: false,
	clearable: false,
	filter: '',
});

/**
 * Emits a set of predefined events that can be triggered by the component.
 *
 * Events:
 * - 'update:modelValue': Emitted to indicate changes in the `modelValue` binding.
 * - 'update:filter': Emitted to indicate changes in the `filter` property.
 */
const emit = defineEmits(['update:modelValue', 'update:filter']);

const options = ref(props.options);
const select: Ref<QSelect | null> = ref(null);

/**
 * Reactive reference for the model value, providing two-way binding functionality.
 *
 * This computed property acts as a bridge between the parent component's `modelValue` prop
 * and the child component's local state. It offers a getter that retrieves the value from
 * the `modelValue` prop and a setter that emits an event to update the parent component's
 * `modelValue`, enabling synchronization.
 *
 * Suitable for use in components designed to support v-model binding.
 */
const modelValue = computed({
	get: () => props.modelValue,
	set: (value) => emit('update:modelValue', value),
});

/**
 * A computed property representing the current filter value.
 * This property provides both getter and setter functionality.
 *
 * Getter:
 * Retrieves the current filter value from the `props.filter`.
 *
 * Setter:
 * Emits the `update:filter` event with the provided value to update the filter.
 */
const currentFilter = computed({
	get: () => props.filter,
	set: (value) => emit('update:filter', value),
});

/**
 * Updates the current filter value and manages the filtering of options based on the provided value.
 *
 * @param {string} val - The filter string input by the user.
 * @param {Function} update - A callback function to update the options list or apply changes.
 *
 * @description
 * If the filter string (`val`) is empty, the function resets the options to the original list.
 * If a filter string is provided, it filters the available options based on the specified label or the string value of each option.
 * The filtering process is case-insensitive.
 *
 * The function leverages the `update` callback to ensure reactivity or to apply changes to a reactive data structure.
 *
 * Filtering behavior depends on the existence of `props.options` and an optional `props.optionLabel`:
 * - If `props.optionLabel` is provided, the filtering is applied to the property matching the specified label in each option object.
 * - If `props.optionLabel` is not provided, the filtering is applied to the string representation of each option.
 */
// eslint-disable-next-line @typescript-eslint/ban-types
const filterFn = (val: string, update: Function) => {
	currentFilter.value = val;

	if (!val) {
		update(() => {
			options.value = props.options;
		});
		return;
	}

	update(() => {
		if (!props.options) {
			return [];
		}

		const lowerFilter = val.toLowerCase();
		options.value = (props.options as []).filter((el: any) => {
			if (props.optionLabel) {
				return el[props.optionLabel as string]
					.toLowerCase()
					.includes(lowerFilter);
			} else {
				const lowerEl = (el as string).toLowerCase();
				return lowerEl.includes(lowerFilter);
			}
		});
	});
};

/**
 * A function that triggers the validation process of the selected value.
 *
 * This function accesses the `validate` method of the currently selected value
 * from the `select` object and executes it. If no selected value exists,
 * the operation will safely return `undefined`.
 *
 * @function
 * @returns {*} Returns the result of the `validate` method if it exists, otherwise `undefined`.
 */
const validate = () => {
	return select.value?.validate();
};

defineExpose({
	validate,
});
</script>

<style scoped></style>
