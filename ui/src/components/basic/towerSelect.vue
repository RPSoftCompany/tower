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
	options: undefined | Array<[object]> | Array<string>;
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
 * Props
 */
const props = withDefaults(defineProps<towerSelectProps>(), {
	modelValue: null,
	options: () => [],
	optionLabel: '',
	label: '',
	loading: false,
	disable: false,
	clearable: false,
	filter: ''
});

/**
 * Emits
 */
const emit = defineEmits(['update:modelValue', 'update:filter']);

/**
 * Data
 */
const options = ref(props.options);
const select: Ref<QSelect | null> = ref(null);

/**
 * Computed
 */
const modelValue = computed({
	get: () => props.modelValue,
	set: value => emit('update:modelValue', value)
});

const currentFilter = computed({
	get: () => props.filter,
	set: value => emit('update:filter', value)
});

/**
 * Methods
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

const validate = () => {
	return select.value?.validate();
};

defineExpose({
	validate
});
</script>

<style scoped></style>
