<template>
	<q-select
		v-model="localType"
		:borderless="!standard"
		:disable="disabled"
		:options="typeOptions"
		color="secondary"
		dense
		options-dense
		popup-content-class="shadow-black"
	>
		<template v-slot:selected>
			<q-icon :name="getTypeIcon(localType.value)" size="sm" />
			<span v-if="withLabel" class="tw-ml-3">{{ localType.label }}</span>
		</template>
		<template v-slot:option="{ itemProps, opt }">
			<q-item class="tw-text-secondary" v-bind="itemProps">
				<q-item-section class="tw-flex">
					<q-icon :name="getTypeIcon(opt.value)" size="sm" />
				</q-item-section>
				<q-item-section>
					<q-item-label class="tw-min-w-[5rem]">{{ opt.label }}</q-item-label>
				</q-item-section>
			</q-item>
		</template>
	</q-select>
</template>

<script lang="ts" setup>
import { typeOptions } from 'components/constantVariables/constantVariable';
import { computed } from 'vue';

//====================================================
// Props
//====================================================
const props = defineProps(['modelValue', 'withLabel', 'disabled', 'standard']);

//====================================================
// Emits
//====================================================
const emit = defineEmits(['update:modelValue']);

//====================================================
// Computed
//====================================================
const localType = computed({
	get: () => props.modelValue,
	set: value => emit('update:modelValue', value)
});

//====================================================
// Methods
//====================================================
/**
 * getTypeIcon
 * @param type
 */
const getTypeIcon = (type: string) => {
	const found = typeOptions.find(el => {
		return el.value === type;
	});

	if (found) {
		return found.icon;
	}

	return '';
};
</script>

<style scoped></style>
